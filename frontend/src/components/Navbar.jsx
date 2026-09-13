import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, User, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-brand-700">
          <Store className="w-6 h-6" />
          ShopSphere
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-brand-600 transition-colors">Shop</Link>
          {user && (
            <Link to="/orders" className="hover:text-brand-600 transition-colors flex items-center gap-1">
              <Package className="w-4 h-4" /> My Orders
            </Link>
          )}
          {(user?.role === 'admin' || user?.role === 'vendor') && (
            <Link to="/admin" className="hover:text-brand-600 transition-colors flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
              <ShoppingCart className="w-5 h-5 text-slate-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                <User className="w-4 h-4" /> {user.name.split(' ')[0]}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-md hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-brand-600 px-3 py-2">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
