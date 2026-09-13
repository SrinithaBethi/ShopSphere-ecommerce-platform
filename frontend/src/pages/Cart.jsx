import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ImageOff, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiErrorMessage } from '../api';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, refreshCart } = useCart();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    refreshCart().finally(() => setLoading(false));
  }, []);

  async function updateQty(itemId, quantity) {
    if (quantity < 1) return;
    try {
      await api.put(`/cart/items/${itemId}`, { quantity });
      refreshCart();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function removeItem(itemId) {
    await api.delete(`/cart/items/${itemId}`);
    toast.success('Item removed');
    refreshCart();
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-400">Loading cart...</div>;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="w-14 h-14 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Your cart is empty</h2>
        <p className="text-slate-400 mt-1 mb-5">Looks like you haven't added anything yet.</p>
        <Link to="/" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-6">Your Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.cart_item_id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-center">
              <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageOff className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product_id}`} className="font-semibold text-slate-800 hover:text-brand-600 line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-sm text-slate-500 mt-0.5">₹{item.price.toLocaleString('en-IN')} each</p>
                <div className="flex items-center border border-slate-300 rounded-lg w-fit mt-2">
                  <button onClick={() => updateQty(item.cart_item_id, item.quantity - 1)} className="px-2.5 py-1 text-slate-600 hover:bg-slate-50">−</button>
                  <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQty(item.cart_item_id, item.quantity + 1)} disabled={item.quantity >= item.stock} className="px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40">+</button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                <button onClick={() => removeItem(item.cart_item_id)} className="text-slate-400 hover:text-red-500 mt-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 h-fit sticky top-24">
          <h2 className="font-bold text-slate-800 mb-4">Order Summary</h2>
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Subtotal</span>
            <span>₹{cart.total.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600 mb-4">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 text-lg border-t border-slate-100 pt-4 mb-5">
            <span>Total</span>
            <span>₹{cart.total.toLocaleString('en-IN')}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
