import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, Banknote, Smartphone, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiErrorMessage } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({
    shipping_name: user?.name || '',
    shipping_address: '',
    shipping_city: '',
    shipping_zip: '',
    payment_method: 'card',
  });
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    refreshCart();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/orders/checkout', form);
      setPlaced(res.data.order_id);
      refreshCart();
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (placed) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-extrabold text-slate-800">Order Confirmed!</h2>
        <p className="text-slate-500 mt-2">Your order #{placed} has been placed successfully.</p>
        <div className="flex gap-3 mt-6">
          <button onClick={() => navigate('/orders')} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-lg">
            View My Orders
          </button>
          <button onClick={() => navigate('/')} className="border border-slate-300 text-slate-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-50">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-6">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-5 bg-white border border-slate-200 rounded-xl p-6">
          <div>
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <input
              required
              value={form.shipping_name}
              onChange={(e) => setForm({ ...form, shipping_name: e.target.value })}
              className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-brand-400 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Address</label>
            <input
              required
              value={form.shipping_address}
              onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
              className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-brand-400 text-sm"
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">City</label>
              <input
                required
                value={form.shipping_city}
                onChange={(e) => setForm({ ...form, shipping_city: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-brand-400 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">ZIP / Postal Code</label>
              <input
                required
                value={form.shipping_zip}
                onChange={(e) => setForm({ ...form, shipping_zip: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-brand-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Payment Method</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'upi', label: 'UPI', icon: Smartphone },
                { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setForm({ ...form, payment_method: id })}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 text-xs font-medium transition-colors ${
                    form.payment_method === id ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Place Order (₹{cart.total.toLocaleString('en-IN')})
          </button>
        </form>

        <div className="bg-white border border-slate-200 rounded-xl p-5 h-fit">
          <h2 className="font-bold text-slate-800 mb-4">Order Summary</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.cart_item_id} className="flex justify-between text-sm">
                <span className="text-slate-600 line-clamp-1 pr-2">{item.name} × {item.quantity}</span>
                <span className="font-medium text-slate-800 flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-slate-900 text-lg border-t border-slate-100 pt-4 mt-4">
            <span>Total</span>
            <span>₹{cart.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
