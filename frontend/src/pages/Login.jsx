import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
      navigate(location.state?.from || '/');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role) {
    const creds = {
      customer: { email: 'customer@shopsphere.com', password: 'customer123' },
      admin: { email: 'admin@shopsphere.com', password: 'admin123' },
      vendor: { email: 'vendor@shopsphere.com', password: 'vendor123' },
    };
    setForm(creds[role]);
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gradient-to-br from-brand-50 via-white to-orange-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-brand-600 p-3 rounded-2xl mb-3">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Log in to continue to ShopSphere</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Log in
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-xs text-center text-slate-400 mb-2">Quick demo login</p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => fillDemo('customer')} className="text-xs py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 font-medium text-slate-600">
              Customer
            </button>
            <button onClick={() => fillDemo('vendor')} className="text-xs py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 font-medium text-slate-600">
              Vendor
            </button>
            <button onClick={() => fillDemo('admin')} className="text-xs py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 font-medium text-slate-600">
              Admin
            </button>
          </div>
        </div>

        <p className="text-sm text-center text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
