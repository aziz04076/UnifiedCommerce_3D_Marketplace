'use client';
import { useState } from 'react';

type OrderStatus = 'new' | 'accepted' | 'packed' | 'shipped' | 'delivered';

interface Order {
  id: string;
  customer: string;
  phone: string;
  items: string;
  total: number;
  status: OrderStatus;
  time: string;
}

// Demo orders — replace with real API call
const DEMO_ORDERS: Order[] = [
  { id: 'ORD-001', customer: 'Rahul Sharma', phone: '9876543210', items: 'Blue Kurta × 2', total: 1299, status: 'new',      time: '2 min ago' },
  { id: 'ORD-002', customer: 'Priya Verma',  phone: '9123456780', items: 'Cotton Saree × 1', total: 2499, status: 'accepted', time: '15 min ago' },
  { id: 'ORD-003', customer: 'Amit Singh',   phone: '9988776655', items: 'Kids T-Shirt × 3', total: 899,  status: 'packed',   time: '1 hr ago' },
];

const STATUS_NEXT: Record<OrderStatus, OrderStatus | null> = {
  new:       'accepted',
  accepted:  'packed',
  packed:    'shipped',
  shipped:   'delivered',
  delivered: null,
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  new:       '🔴 Naya / New',
  accepted:  '🟡 Accept kiya',
  packed:    '📦 Pack kiya',
  shipped:   '🚚 Bheja gaya',
  delivered: '✅ Deliver hua',
};

const STATUS_ACTION: Record<OrderStatus, string> = {
  new:       'Accept ✓',
  accepted:  'Pack karo 📦',
  packed:    'Ship karo 🚚',
  shipped:   'Delivered ✅',
  delivered: '',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);

  function advance(orderId: string) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const next = STATUS_NEXT[o.status];
        return next ? { ...o, status: next } : o;
      })
    );
  }

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100">
      <div className="bg-slate-900 border-b border-slate-700 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <a href="/shop-admin" className="text-slate-400 text-sm">← Back</a>
            <h1 className="text-xl font-bold mt-1">📋 Orders</h1>
          </div>
          <span className="bg-rose-500 text-white text-xs px-2 py-1 rounded-full">
            {orders.filter((o) => o.status === 'new').length} new
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4 pb-8">
        {orders.map((order) => (
          <div key={order.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold">{order.customer}</div>
                <div className="text-slate-400 text-sm">{order.id} · {order.time}</div>
              </div>
              <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                {STATUS_LABEL[order.status]}
              </span>
            </div>

            <div className="text-sm text-slate-300 mb-1">🛍️ {order.items}</div>
            <div className="text-sm font-bold text-emerald-400 mb-3">₹{order.total.toFixed(2)}</div>

            <div className="flex gap-2 flex-wrap">
              {/* Advance status */}
              {STATUS_NEXT[order.status] && (
                <button
                  onClick={() => advance(order.id)}
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg cursor-pointer flex-1"
                >
                  {STATUS_ACTION[order.status]}
                </button>
              )}

              {/* WhatsApp to customer */}
              <a
                href={`https://wa.me/91${order.phone}?text=${encodeURIComponent(`Namaste ${order.customer}! Aapka order ${order.id} update: ${STATUS_LABEL[order.status]}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg cursor-pointer"
              >
                💬 WhatsApp
              </a>

              {/* Invoice */}
              <a
                href={`/api/invoices/${order.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-700 text-slate-200 text-sm px-4 py-2 rounded-lg cursor-pointer"
              >
                🧾 Invoice
              </a>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center text-slate-500 py-16">
            <div className="text-5xl mb-4">📭</div>
            <div>Koi order nahi abhi tak</div>
            <div className="text-sm mt-1">No orders yet</div>
          </div>
        )}
      </div>
    </main>
  );
}
