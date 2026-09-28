'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  RotateCcw,
  ShieldCheck,
  MapPin,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Zap,
  AlertCircle,
  FileText,
  Radio,
  XCircle,
  Loader2,
  Ban,
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { Navbar, Footer, Badge, Button, formatPrice } from '@unified-commerce/ui';
import { getAllCategories, getProductById } from '@unified-commerce/database';

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const { getOrderById, updateOrderStatus, requestOrderReturn } = useCart();
  const categories = getAllCategories();

  const [order, setOrder] = useState(() => {
    const found = getOrderById(params.id);
    if (found) return found;

    // Fallback seed order so this page always looks magnificent
    const p1 = getProductById('prod-001') || {
      id: 'prod-001',
      name: 'Aether Apex Neural Band X1',
      price: 489,
      images: ['https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80'],
      vendorId: 'vendor-1',
      vendorName: 'Aether Labs',
    };
    const p2 = getProductById('prod-011') || {
      id: 'prod-011',
      name: 'SonicForge Elysium Planar Magnetic Headphones',
      price: 1199,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
      vendorId: 'vendor-2',
      vendorName: 'SonicForge Acoustics',
    };

    return {
      id: params.id,
      orderNumber: `UC-2026-${params.id.slice(-4).toUpperCase()}X`,
      userId: 'user-001',
      items: [
        {
          id: 'item-1',
          productId: p1.id,
          productName: p1.name,
          productImage: p1.images[0],
          vendorId: p1.vendorId,
          quantity: 1,
          unitPrice: p1.price,
        },
        {
          id: 'item-2',
          productId: p2.id,
          productName: p2.name,
          productImage: p2.images[0],
          vendorId: p2.vendorId,
          quantity: 1,
          unitPrice: p2.price,
        },
      ],
      subtotal: p1.price + p2.price,
      platformFee: Math.round((p1.price + p2.price) * 0.08),
      shippingFee: 0,
      tax: Math.round((p1.price + p2.price) * 0.065),
      total: Math.round((p1.price + p2.price) * 1.065),
      currency: 'USD',
      status: 'CONFIRMED' as const,
      paymentStatus: 'PAID' as const,
      paymentMethod: 'STRIPE' as const,
      shippingAddress: {
        fullName: 'Alex Vance',
        street: 'Penthouse 42B, Neo-Bandra Heights',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India',
        phone: '+91 98765 43210',
      },
      tracking: {
        carrier: 'Hyper-Suborbital Express Telemetry',
        trackingCode: `TRK-${params.id.slice(-6).toUpperCase()}-GLOBAL`,
        estimatedDelivery: 'Tomorrow by 2:00 PM',
        currentLocation: {
          lat: 19.0760,
          lng: 72.8777,
          name: 'Bandra-Kurla Transit Micro-Hub Node #2',
        },
      },
      createdAt: '2026-09-27T14:32:00Z',
    };
  });

  // Modal states
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Damaged in Suborbital Transit');
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  // Cancellation states
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<
    | 'ORDERED_BY_MISTAKE'
    | 'FOUND_BETTER_PRICE'
    | 'DELIVERY_TIME_TOO_LONG'
    | 'CHANGE_DELIVERY_ADDRESS'
    | 'INCORRECT_ITEM_VARIANTS'
    | 'OTHER'
  >('ORDERED_BY_MISTAKE');
  const [cancelNotes, setCancelNotes] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationResult, setCancellationResult] = useState<any>(null);

  // Status simulation stages
  const statusStages = [
    { key: 'CONFIRMED', label: 'Order Confirmed', time: '14:32 UTC', desc: 'Cryptographic validation verified' },
    { key: 'PROCESSING', label: 'Escrow Locked & Packed', time: '14:48 UTC', desc: 'Direct-from-maker lab QA inspection' },
    { key: 'SHIPPED', label: 'Suborbital Transit', time: '16:05 UTC', desc: 'En route via carrier flight corridor' },
    { key: 'OUT_FOR_DELIVERY', label: 'Local Drone Teleport', time: '18:20 UTC', desc: 'Dispatched from Bay Area micro-hub' },
    { key: 'DELIVERED', label: 'Delivered & Escrow Released', time: 'Estimated 19:15 UTC', desc: 'Signed and funds settled to makers' },
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 0;
      case 'PROCESSING': return 1;
      case 'SHIPPED': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  const isCancellable = ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status);
  const currentStageIndex = getStageIndex(order.status);

  // Phase 4: Carrier Logistics Telemetry & AWB State
  const [carrierTelemetry, setCarrierTelemetry] = useState<any>(null);
  const [awbData, setAwbData] = useState<any>(null);

  React.useEffect(() => {
    fetch(`/api/vendor/orders/dispatch?orderId=${order.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.awb) setAwbData(d.awb);
        if (d.events && d.events.length > 0) {
          setCarrierTelemetry(d.events[d.events.length - 1]);
        }
      })
      .catch(console.error);
  }, [order.id]);

  // Fast-forward status simulation & sync carrier telemetry
  const handleSimulateNextStage = async () => {
    if (order.status === 'CANCELLED') return;
    const nextIndex = (currentStageIndex + 1) % statusStages.length;
    const nextStatus = statusStages[nextIndex].key as any;
    updateOrderStatus(order.id, nextStatus);
    setOrder((prev: any) => ({ ...prev, status: nextStatus }));

    try {
      const res = await fetch('/api/vendor/orders/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, action: 'simulate_step' }),
      });
      const data = await res.json();
      if (data.events && data.events.length > 0) {
        setCarrierTelemetry(data.events[data.events.length - 1]);
      }
    } catch (e) {
      console.error('Carrier telemetry step error:', e);
    }
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestOrderReturn(order.id, returnReason);
    setReturnSubmitted(true);
    setTimeout(() => {
      setIsReturnModalOpen(false);
      setReturnSubmitted(false);
    }, 2000);
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCancelling(true);

    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          reason: cancelReason,
          notes: cancelNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to cancel order.');
      }

      setCancellationResult(data);
      updateOrderStatus(order.id, 'CANCELLED' as any);
      setOrder((prev: any) => ({
        ...prev,
        status: 'CANCELLED',
        cancellationDetails: data,
      }));

      setTimeout(() => {
        setIsCancelModalOpen(false);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Cancellation failed.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-cyan-500/30 selection:text-white print:bg-white print:text-slate-900">
      <div className="print:hidden">
        <Navbar categories={categories} />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 print:pt-6 print:pb-6">
        {/* Top Header */}
        <div className="pb-8 border-b border-white/10 print:border-slate-300 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={order.status === 'CANCELLED' ? 'rose' : 'cyan'} size="sm" withDot>
                {order.status === 'CANCELLED' ? 'ORDER CANCELLED' : 'LIVE TELEMETRY ACTIVE'}
              </Badge>
              <span className="text-xs font-mono text-slate-400 print:text-slate-600">
                Carrier: {order.tracking.carrier}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white print:text-slate-900 tracking-tight mt-2 flex items-center gap-3">
              <span>Order {order.orderNumber}</span>
              <span
                className={`text-sm font-mono font-medium px-3 py-1 rounded-full ${
                  order.status === 'CANCELLED'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                }`}
              >
                {order.status.replace(/_/g, ' ')}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2.5 print:hidden">
            {order.status !== 'CANCELLED' && (
              <button
                onClick={handleSimulateNextStage}
                className="px-3.5 py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold hover:bg-purple-500/30 flex items-center gap-2 transition-all shadow-neon-purple"
              >
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>Simulate Next Stage</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>GST Tax Invoice (PDF)</span>
            </button>

            {isCancellable && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 flex items-center gap-1.5 transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel Order</span>
              </button>
            )}

            {order.status === 'DELIVERED' && (
              <button
                onClick={() => setIsReturnModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return / Refund</span>
              </button>
            )}
          </div>
        </div>

        {/* Cancellation Alert Banner */}
        {order.status === 'CANCELLED' && (
          <div className="my-6 p-6 rounded-3xl bg-rose-950/20 border border-rose-500/40 text-rose-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-200">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>This order has been cancelled and smart escrow refund has been initiated.</span>
            </div>
            <p className="text-xs text-rose-300/80 leading-relaxed">
              Escrow funds ({formatPrice(order.total)}) have been queued for refund settlement to your original payment rail ({order.paymentMethod}). Estimated refund arrival: 2–3 business days.
            </p>
          </div>
        )}

        {/* Real-Time Animated Timeline */}
        {order.status !== 'CANCELLED' && (
          <div className="my-10 p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-2xl print:border-slate-300 print:bg-slate-50">
            <div className="flex items-center justify-between pb-6 border-b border-white/5 print:border-slate-300">
              <div>
                <h2 className="text-base font-bold text-white print:text-slate-900">
                  Real-Time Dispatch Timeline
                </h2>
                <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
                  Tracking code: <strong className="text-cyan-300 font-mono">{order.tracking.trackingCode}</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Estimated Delivery</span>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  {order.tracking.estimatedDelivery}
                </div>
              </div>
            </div>

            {/* Stepper Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-8 relative">
              {statusStages.map((st, idx) => {
                const isDone = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={st.key} className="flex flex-col items-start gap-2 relative">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isCurrent
                            ? 'bg-cyan-400 text-slate-950 shadow-neon-cyan ring-4 ring-cyan-400/20'
                            : isDone
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                            : 'bg-slate-900 border border-white/10 text-slate-600'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{st.time}</span>
                    </div>

                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-cyan-300' : isDone ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                        {st.label}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                        {st.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* GPS Telemetry Waypoint Radar Card & Suborbital Flight HUD */}
        {order.status !== 'CANCELLED' && (
          <div className="my-8 p-6 rounded-3xl bg-slate-950/70 border border-cyan-500/20 shadow-2xl backdrop-blur-md print:hidden space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-neon-cyan shrink-0">
                  <MapPin className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      {carrierTelemetry?.location || order.tracking.currentLocation.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Carrier: <span className="text-cyan-300 font-semibold">{awbData?.carrierName || order.tracking.carrier}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>AWB: {awbData?.awbNumber || 'AWB-SUB-779124-JP'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-950/30 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Escrow: {formatPrice(order.total)} Locked</span>
                </div>
              </div>
            </div>

            {/* Suborbital Flight Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-500 text-[10px] uppercase font-sans">Flight Altitude</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {carrierTelemetry?.telemetry?.altitudeKm ?? 28.4} km
                </p>
                <span className="text-[10px] text-cyan-400 font-sans">
                  {carrierTelemetry?.telemetry?.altitudeKm > 10 ? 'Suborbital Vector' : 'Stratospheric Descent'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-500 text-[10px] uppercase font-sans">Airspeed</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {(carrierTelemetry?.telemetry?.speedKmh ?? 4200).toLocaleString()} km/h
                </p>
                <span className="text-[10px] text-purple-400 font-sans">
                  Mach {((carrierTelemetry?.telemetry?.speedKmh ?? 4200) / 1234.8).toFixed(1)} Supercruise
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-500 text-[10px] uppercase font-sans">Payload Power</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">
                  {carrierTelemetry?.telemetry?.batteryOrFuelPct ?? 82}%
                </p>
                <span className="text-[10px] text-slate-400 font-sans">Cryo-Cell Nominal</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-500 text-[10px] uppercase font-sans">Arrival Window</span>
                <p className="text-sm font-bold text-amber-400 mt-0.5">
                  ~{carrierTelemetry?.telemetry?.estimatedMinutesRemaining ?? 95} mins
                </p>
                <span className="text-[10px] text-slate-400 font-sans">Vertiport Landing Pad</span>
              </div>
            </div>

            {/* Carrier Status Note */}
            <p className="text-xs text-slate-400 italic pt-1">
              &quot;{carrierTelemetry?.notes || 'Suborbital flight vector nominal. Payload cryogenically stabilized for descent corridor.'}&quot;
            </p>
          </div>
        )}

        {/* Order Items & GST Invoice Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
          {/* Items Manifest (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-sm font-bold text-white print:text-slate-900 pb-2 border-b border-white/10 print:border-slate-300">
              Dispatched Hardware Manifest
            </h3>

            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between gap-4 print:bg-white print:border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white print:text-slate-900">
                        {item.productName}
                      </h4>
                      <div className="text-xs text-slate-400 font-mono">
                        Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-base text-white print:text-slate-900">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Destination Address Card */}
            <div className="p-5 rounded-2xl bg-slate-950/50 border border-white/5 space-y-1 text-xs text-slate-400 print:text-slate-700">
              <span className="font-bold text-white uppercase font-mono block text-[10px] text-cyan-400">
                Delivery Destination (Immutable Snapshot)
              </span>
              <p className="font-semibold text-white print:text-slate-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p className="font-mono text-slate-500">Contact: {order.shippingAddress.phone}</p>
              )}
            </div>
          </div>

          {/* GST-Compliant Tax Invoice Summary (4 cols) */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-950/80 border border-white/10 print:bg-white print:border-slate-300 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10 print:border-slate-300">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white print:text-slate-900">
                GST Tax Invoice Breakdown
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-400 print:text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal (Excl. Tax)</span>
                <span className="font-mono text-white print:text-slate-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Logistics Tier Fee</span>
                <span className="font-mono text-emerald-400">
                  {order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>State & GST Tax (6.5%)</span>
                <span className="font-mono text-white print:text-slate-900">{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Escrow Fee</span>
                <span className="font-mono text-cyan-400">0.00 (Sponsored)</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white print:text-slate-900 pt-3 border-t border-white/10 print:border-slate-300">
                <span>Total Amount {order.status === 'CANCELLED' ? '(Refunded)' : 'Paid'}</span>
                <span className="font-mono text-cyan-300 print:text-slate-900 text-lg">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 print:bg-slate-100 text-[10px] font-mono text-slate-500 space-y-1">
              <div>Invoice Date: {new Date(order.createdAt).toLocaleDateString()}</div>
              <div>GSTIN Protocol ID: 27AABCU9603R1ZM</div>
              <div>HSN / SAC Code: 8517 / 8518 (Cyberware)</div>
              <div>Payment Gateway: {order.paymentMethod} ({order.status === 'CANCELLED' ? 'REFUND_QUEUED' : 'CAPTURED'})</div>
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>

      {/* Order Cancellation Modal */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isCancelling) setIsCancelModalOpen(false);
              }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-rose-500/30 p-6 z-10 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-bold text-white">Cancel Order {order.orderNumber}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Orders can be cancelled prior to suborbital departure. Once cancelled, your payment ({formatPrice(order.total)}) is immediately refunded to your original payment method.
              </p>

              {cancellationResult ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Order cancelled successfully! Refund escrow triggered.</span>
                </div>
              ) : (
                <form onSubmit={handleConfirmCancel} className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Reason for Cancellation *</label>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-400"
                    >
                      <option value="ORDERED_BY_MISTAKE">Accidental order / placed by mistake</option>
                      <option value="FOUND_BETTER_PRICE">Found better price elsewhere</option>
                      <option value="DELIVERY_TIME_TOO_LONG">Delivery time is too long</option>
                      <option value="CHANGE_DELIVERY_ADDRESS">Need to change shipping coordinates</option>
                      <option value="INCORRECT_ITEM_VARIANTS">Selected wrong item variant/color</option>
                      <option value="OTHER">Other reason</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Additional Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={cancelNotes}
                      onChange={(e) => setCancelNotes(e.target.value)}
                      placeholder="Explain your cancellation reason..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => setIsCancelModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      Keep Order
                    </button>
                    <button
                      type="submit"
                      disabled={isCancelling}
                      className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                      <span>Confirm Cancellation</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Return / Replacement Modal */}
      <AnimatePresence>
        {isReturnModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReturnModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 p-6 z-10 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-bold text-white">Request Return or Replacement</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                30-day holographic return protocol. Return shipping label and smart contract escrow refund automatically triggered upon carrier scan.
              </p>

              {returnSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Return Request Approved! QR Return Label generated.</span>
                </div>
              ) : (
                <form onSubmit={handleReturnSubmit} className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Reason for Return</label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option>Damaged in Suborbital Transit</option>
                      <option>Hardware Spec / Tolerance Mismatch</option>
                      <option>Defective Sensor Calibration</option>
                      <option>Changed Mind (Unopened Factory Seal)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsReturnModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <Button type="submit" variant="primary" size="sm">
                      Submit Return Request
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
