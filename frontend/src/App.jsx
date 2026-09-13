import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';

function CartSync() {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  useEffect(() => {
    refreshCart();
  }, [user]);
  return null;
}

function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <CartSync />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin', 'vendor']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-400">
        ShopSphere — Full-stack E-Commerce Management Platform
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/ShopSphere-ecommerce-platform">
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
          <AppShell />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
