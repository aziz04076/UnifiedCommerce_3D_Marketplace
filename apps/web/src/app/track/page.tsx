'use client';
import { useState } from 'react';

type TrackStatus = 'placed' | 'accepted' | 'packed' | 'shipped' | 'delivered';

interface TrackResult {
  orderId: string;
  customer: string;
  status: TrackStatus;
  timeline: Array<{ status: TrackStatus; label: string; time: string; done: boolean }>;
  estimatedDelivery: string;
  items: string;
  total: string;
}

const STATUS_STEPS: Array<{ status: TrackStatus; label: string; icon: string }> = [
  { status: 'placed',    label: 'Order Placed',    icon: '🛒' },
  { status: 'accepted',  label: 'Order Accepted',  icon: '✅' },
  { status: 'packed',    label: 'Packed',          icon: '📦' },
  { status: 'shipped',   label: 'Out for Delivery', icon: '🚚' },
  { status: 'delivered', label: 'Delivered',        icon: '🎉' },
];

// Demo result — replace with real API call
const DEMO_RESULT: TrackResult = {
  orderId: 'ORD-001',
  customer: 'Rahul Sharma',
  status: 'shipped',
  items: 'Blue Kurta × 2',
  total: '₹1,299',
  estimatedDelivery: 'Today by 6:00 PM',
  timeline: [
    { status: 'placed',   label: 'Order Placed',   time: '10:00 AM',  done: true },
    { status: 'accepted', label: 'Accepted',        time: '10:15 AM',  done: true },
    { status: 'packed',   label: 'Packed',          time: '11:30 AM',  done: true },
    { status: 'shipped',  label: 'Out for Delivery', time: '2:00 PM',  done: true },
    { status: 'delivered', label: 'Delivered',      time: 'Expected 6 PM', done: false },
  ],
};

export default function TrackPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState('');

  function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) { setError('Order ID aur phone number dono zaroori hain'); return; }
    setError('');
    // Demo: show result for ORD-001
    if (orderId.trim().toUpperCase() === 'ORD-001' && phone.trim() === '9876543210') {
      setResult(DEMO_RESULT);
    } else {
      setError('Order nahi mila. Please check your Order ID and phone number.');
      setResult(null);
    }
  }

  const currentStepIndex = result
    ? STATUS_STEPS.findIndex((s) => s.status === result.status)
    : -1;

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100">
      <div className="max-w-lg mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">📦 Track Order</h1>
        <p className="text-slate-400 mb-8">No login needed. Enter your order ID and phone number.</p>

        <form onSubmit={handleTrack} className="space-y-4 mb-8">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Order ID (e.g. ORD-001)"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number (e.g. 9876543210)"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white"
          />
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg cursor-pointer">
            Track My Order
          </button>
        </form>

        {result && (
          <div className="space-y-6">
            {/* Order summary */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold">{result.orderId}</div>
                  <div className="text-slate-400 text-sm">{result.customer}</div>
                </div>
                <span className="text-emerald-400 font-bold">{result.total}</span>
              </div>
              <div className="text-sm text-slate-300">🛍️ {result.items}</div>
              <div className="text-sm text-blue-300 mt-1">⏱️ {result.estimatedDelivery}</div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              {result.timeline.map((step, i) => (
                <div key={step.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      step.done ? 'bg-emerald-500' : i === currentStepIndex + 1 ? 'bg-blue-500' : 'bg-slate-700'
                    }`}>
                      {step.done ? '✓' : STATUS_STEPS[i]?.icon ?? '○'}
                    </div>
                    {i < result.timeline.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${step.done ? 'bg-emerald-500/40' : 'bg-slate-700'}`} />
                    )}
                  </div>
                  <div className="pt-1">
                    <div className={`font-medium text-sm ${step.done ? 'text-white' : 'text-slate-500'}`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-slate-500">{step.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Help */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-sm">
              <p className="text-slate-400 mb-2">Need help with this order?</p>
              <a
                href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi! Order ${result.orderId} ke baare mein poochhna tha.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg cursor-pointer text-xs"
              >
                💬 WhatsApp us
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
