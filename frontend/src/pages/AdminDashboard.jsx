import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DollarSign, ShoppingCart, Users, Package, Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';

const TABS = ['Overview', 'Products', 'Orders', 'Users'];
const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [tab, setTab] = useState('Overview');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-1">
        {isAdmin ? 'Admin Dashboard' : 'Vendor Dashboard'}
      </h1>
      <p className="text-slate-500 text-sm mb-6">Manage your store, products, and orders.</p>

      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.filter((t) => isAdmin || t === 'Products').map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && isAdmin && <OverviewTab />}
      {tab === 'Products' && <ProductsTab />}
      {tab === 'Orders' && isAdmin && <OrdersTab />}
      {tab === 'Users' && isAdmin && <UsersTab />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-xl font-extrabold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div className="text-slate-400">Loading analytics...</div>;

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} color="bg-green-500" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} color="bg-brand-600" />
        <StatCard icon={Users} label="Customers" value={stats.totalCustomers} color="bg-accent-500" />
        <StatCard icon={Package} label="Active Products" value={stats.totalProducts} color="bg-indigo-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-bold text-slate-800 mb-4">Revenue (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-bold text-slate-800 mb-4">Top Products by Units Sold</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.topProducts} layout="vertical" margin={{ left: 30 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="product_name" type="category" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="units_sold" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Low Stock Alerts
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.lowStock.map((p) => (
              <span key={p.id} className="text-xs bg-white border border-amber-300 text-amber-700 px-3 py-1.5 rounded-full font-medium">
                {p.name} — {p.stock} left
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const emptyProduct = { name: '', description: '', price: '', stock: '', sku: '', image_url: '', category_id: '' };

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  function loadProducts() {
    api.get('/products', { params: { limit: 100 } }).then((res) => setProducts(res.data.products));
  }

  useEffect(() => {
    loadProducts();
    api.get('/products/categories/list').then((res) => setCategories(res.data.categories));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyProduct);
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock,
      sku: p.sku || '',
      image_url: p.image_url || '',
      category_id: p.category_id || '',
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock), category_id: form.category_id || null };
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this product from the catalog?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Product removed');
    loadProducts();
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Price</th>
              <th className="text-left px-4 py-3">Stock</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-3 text-slate-500">{p.category_name || '—'}</td>
                <td className="px-4 py-3 text-slate-700">₹{p.price.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">
                  <span className={p.stock <= 5 ? 'text-amber-600 font-semibold' : 'text-slate-700'}>{p.stock}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-brand-600 p-1.5">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-red-500 p-1.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" min="0" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400" />
                <input required type="number" min="0" placeholder="Stock quantity" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400" />
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400">
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <input placeholder="Image URL (optional)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400" />
              <button type="submit" disabled={saving} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60">
                {editing ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);

  function load() {
    api.get('/orders').then((res) => setOrders(res.data.orders));
  }

  useEffect(load, []);

  async function updateStatus(id, status) {
    await api.put(`/orders/${id}/status`, { status });
    toast.success('Order status updated');
    load();
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
          <tr>
            <th className="text-left px-4 py-3">Order</th>
            <th className="text-left px-4 py-3">Customer</th>
            <th className="text-left px-4 py-3">Total</th>
            <th className="text-left px-4 py-3">Date</th>
            <th className="text-left px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="px-4 py-3 font-medium text-slate-800">#{o.id}</td>
              <td className="px-4 py-3 text-slate-600">{o.customer_name}<br /><span className="text-xs text-slate-400">{o.customer_email}</span></td>
              <td className="px-4 py-3 text-slate-700">₹{o.total.toLocaleString('en-IN')}</td>
              <td className="px-4 py-3 text-slate-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-400 capitalize"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);

  function load() {
    api.get('/admin/users').then((res) => setUsers(res.data.users));
  }
  useEffect(load, []);

  async function changeRole(id, role) {
    await api.put(`/admin/users/${id}/role`, { role });
    toast.success('Role updated');
    load();
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
          <tr>
            <th className="text-left px-4 py-3">Name</th>
            <th className="text-left px-4 py-3">Email</th>
            <th className="text-left px-4 py-3">Role</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
              <td className="px-4 py-3 text-slate-500">{u.email}</td>
              <td className="px-4 py-3">
                <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-400 capitalize">
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
