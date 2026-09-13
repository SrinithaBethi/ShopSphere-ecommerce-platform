import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import api from '../api';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get('/orders/mine').then((res) => setOrders(res.data.orders));
  }, []);

  if (!orders) return <div className="min-h-[60vh] flex items-center justify-center text-slate-400">Loading...</div>;

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <Package className="w-14 h-14 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">No orders yet</h2>
        <p className="text-slate-400 mt-1">Your order history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-6">My Orders</h1>
      <div className="space-y-5">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <p className="font-bold text-slate-800">Order #{order.id}</p>
                <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>
                {order.status}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-slate-600">{item.product_name} × {item.quantity}</span>
                  <span className="font-medium text-slate-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 mt-2 pt-3">
              <span className="text-xs text-slate-400">
                Shipping to {order.shipping_address}, {order.shipping_city} {order.shipping_zip}
              </span>
              <span className="font-bold text-slate-900">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
