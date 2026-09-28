'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  DollarSign,
  Truck,
  Zap,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Compass,
  ArrowRight,
  Radio,
  FileText,
} from 'lucide-react';
import { PayoutRail, AirWaybill, CarrierEventType } from '@unified-commerce/types';

/* ─────────────────────────────────────────────────────────────
   1. Request Instant Payout Modal (Fiat / USDC Rails)
───────────────────────────────────────────────────────────── */

interface RequestPayoutModalProps {
  vendorId: string;
  availableBalance: number;
  onClose: () => void;
  onSuccess: (payout: any) => void;
}

export function RequestPayoutModal({
  vendorId,
  availableBalance,
  onClose,
  onSuccess,
}: RequestPayoutModalProps) {
  const [rail, setRail] = useState<PayoutRail>('USDC_POLYGON');
  const [amount, setAmount] = useState<string>(Math.min(availableBalance, 500).toString());
  const [destination, setDestination] = useState('0x71C840b2A4C2E971B0182E192931d871928492A1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payoutResult, setPayoutResult] = useState<any>(null);

  const numAmount = parseFloat(amount) || 0;
  const isCrypto = rail.startsWith('USDC');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numAmount < 50) {
      setError('Minimum withdrawal threshold is $50.00.');
      return;
    }
    if (numAmount > availableBalance) {
      setError(`Amount exceeds your eligible balance of $${availableBalance.toFixed(2)}.`);
      return;
    }
    if (!destination.trim()) {
      setError('Please provide a destination account or wallet address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/vendor/payouts/disburse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          amount: numAmount,
          rail,
          destinationAccount: destination.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Payout failed to process.');
      }

      setPayoutResult(data.payout);
      onSuccess(data.payout);
    } catch (err: any) {
      setError(err.message || 'Disbursement request encountered an error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-violet-500/20 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {payoutResult ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Disbursement Dispatched!</h3>
            <p className="text-xs text-slate-300">
              <span className="font-semibold text-emerald-400">${payoutResult.amount.toLocaleString()}</span> has been transferred via{' '}
              <span className="font-mono text-cyan-300">{payoutResult.rail}</span>.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-white/5 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Payout Reference</span>
                <span className="font-mono text-slate-200">{payoutResult.payoutId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Transaction Hash / UTR</span>
                <span className="font-mono text-violet-300 truncate max-w-[200px]">{payoutResult.txHashOrUtr}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Settlement Time</span>
                <span className="text-slate-200">Instant (Verified on-chain/ledger)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-600/30"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white">Request Escrow Disbursement</h3>
              </div>
              <p className="text-xs text-slate-400">
                Eligible balance cleared from verified deliveries: <span className="font-bold text-emerald-400">${availableBalance.toFixed(2)}</span>
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Payout Rail Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Disbursement Rail</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'USDC_POLYGON', label: 'USDC (Polygon)', sub: 'Instant · $0.01 gas' },
                  { id: 'USDC_SOLANA', label: 'USDC (Solana)', sub: 'Instant · Sub-second' },
                  { id: 'BANK_NEFT', label: 'Bank NEFT (India)', sub: 'D+1 Batch clearing' },
                  { id: 'BANK_ACH', label: 'Bank ACH (USA)', sub: '1–2 business days' },
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setRail(r.id as PayoutRail);
                      if (r.id.startsWith('USDC')) {
                        setDestination('0x71C840b2A4C2E971B0182E192931d871928492A1');
                      } else {
                        setDestination('HDFC0000240-918237192');
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      rail === r.id
                        ? 'bg-violet-600/20 border-violet-500 text-white'
                        : 'bg-slate-800/40 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs font-bold leading-tight text-white">{r.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{r.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Amount to Withdraw ($)</label>
                <button
                  type="button"
                  onClick={() => setAmount(availableBalance.toString())}
                  className="text-[11px] text-violet-400 hover:text-violet-300 font-medium"
                >
                  Withdraw Max (${availableBalance.toFixed(2)})
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-sm font-semibold text-white focus:outline-none focus:border-violet-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Destination Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isCrypto ? 'Destination Wallet Address (ERC20 / SPL)' : 'Bank Account / Routing Number'}
              </label>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-violet-500"
                placeholder={isCrypto ? '0x...' : 'Account Number / IFSC'}
              />
            </div>

            <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
              <span>Escrow transactions are cryptographically signed and logged to the platform immutable ledger.</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || numAmount <= 0}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing Disbursement...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Confirm Disbursement</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. Air Waybill (AWB) & Printable Shipping Label Modal
───────────────────────────────────────────────────────────── */

interface AirWaybillModalProps {
  awb: AirWaybill;
  onClose: () => void;
}

export function AirWaybillModal({ awb, onClose }: AirWaybillModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(awb.awbNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Air Waybill Manifest</h3>
              <p className="text-xs text-slate-400">Order: {awb.orderId}</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print Label</span>
          </button>
        </div>

        {/* Printable Shipping Label Card */}
        <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-inner border border-slate-300 font-sans space-y-4">
          {/* Top Bar with Carrier & AWB */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-slate-500">Autonomous Air Cargo Manifest</p>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{awb.carrierName}</h2>
              <p className="text-xs font-semibold text-indigo-700">{awb.shippingTier}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded bg-slate-900 text-white font-mono font-bold text-xs">
                PRIORITY-1
              </span>
            </div>
          </div>

          {/* Barcode & AWB Code */}
          <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-mono text-2xl font-black tracking-widest text-slate-900 select-all">
              {awb.barcode}
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="font-mono font-bold text-sm tracking-wider text-slate-800">{awb.awbNumber}</span>
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-slate-700 text-xs print:hidden"
                title="Copy AWB"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Origin & Destination Hubs */}
          <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[9px] uppercase font-bold text-slate-500">Origin Launch Facility</p>
              <p className="font-bold text-xs text-slate-900 mt-0.5">{awb.originHub}</p>
              <p className="text-[10px] text-slate-600 mt-1">Maker: {awb.vendorName}</p>
            </div>
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
              <p className="text-[9px] uppercase font-bold text-indigo-700">Destination Corridor</p>
              <p className="font-bold text-xs text-slate-900 mt-0.5">{awb.destinationHub}</p>
              <p className="text-[10px] text-slate-600 mt-1">Recipient: {awb.recipientName}, {awb.recipientCity}</p>
            </div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-100 rounded-lg">
              <p className="text-[9px] text-slate-500">Gross Weight</p>
              <p className="font-bold text-slate-900">{awb.weightKg} kg</p>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg">
              <p className="text-[9px] text-slate-500">Declared Value</p>
              <p className="font-bold text-slate-900">${awb.declaredValue}</p>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg">
              <p className="text-[9px] text-slate-500">Dispatch SLA</p>
              <p className="font-bold text-amber-700">Within 24h</p>
            </div>
          </div>

          {/* Security stamp */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
            <span>Verified Maker Digital Signature: SHA256-AUTHENTICATED</span>
            <span className="font-mono">{new Date(awb.generatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
          >
            Close Manifest
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. Carrier Webhook Testing Console & Telemetry Drawer
───────────────────────────────────────────────────────────── */

interface CarrierSimulatorDrawerProps {
  orderId: string;
  onClose: () => void;
  onStepSimulated: (event: any) => void;
}

export function CarrierSimulatorDrawer({
  orderId,
  onClose,
  onStepSimulated,
}: CarrierSimulatorDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [latestTelemetry, setLatestTelemetry] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initial fetch of order events
  React.useEffect(() => {
    fetch(`/api/vendor/orders/dispatch?orderId=${orderId}`)
      .then(r => r.json())
      .then(d => {
        if (d.events) {
          setEvents(d.events);
          if (d.events.length > 0) {
            setLatestTelemetry(d.events[d.events.length - 1]);
          }
        }
      })
      .catch(console.error);
  }, [orderId]);

  const handleSimulateNext = async () => {
    try {
      setLoading(true);
      setStatusMessage(null);
      const res = await fetch('/api/vendor/orders/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          action: 'simulate_step',
        }),
      });

      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
        const last = data.events[data.events.length - 1];
        setLatestTelemetry(last);
        setStatusMessage(`Ingested event: ${last.eventType}`);
        onStepSimulated(last);
      }
    } catch (err: any) {
      setStatusMessage(`Simulation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950 border-l border-cyan-500/30 p-6 shadow-2xl flex flex-col justify-between text-white backdrop-blur-xl">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Carrier Logistics Terminal</h3>
              <p className="text-[11px] font-mono text-cyan-400">Order: {orderId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Radar HUD */}
        {latestTelemetry ? (
          <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/20 space-y-3 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span className="font-mono font-bold text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                {latestTelemetry.eventType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-800/60">
                <span className="text-slate-500 text-[10px]">Altitude</span>
                <p className="font-mono font-bold text-white">{latestTelemetry.telemetry?.altitudeKm || 0} km</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60">
                <span className="text-slate-500 text-[10px]">Velocity</span>
                <p className="font-mono font-bold text-white">{latestTelemetry.telemetry?.speedKmh || 0} km/h</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60">
                <span className="text-slate-500 text-[10px]">Power / Fuel</span>
                <p className="font-mono font-bold text-emerald-400">{latestTelemetry.telemetry?.batteryOrFuelPct || 100}%</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60">
                <span className="text-slate-500 text-[10px]">ETA Remaining</span>
                <p className="font-mono font-bold text-amber-400">{latestTelemetry.telemetry?.estimatedMinutesRemaining || 0}m</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 italic border-t border-white/5 pt-2">
              &quot;{latestTelemetry.notes}&quot;
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 text-xs text-slate-400 text-center mb-4">
            No flight vectors registered yet. Click &quot;Simulate Next Carrier Event&quot; to begin.
          </div>
        )}

        {statusMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Flight Waypoint History Stream */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ingested Webhook Events</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {events.map((ev, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-cyan-300 text-[11px]">{ev.eventType}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">{ev.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simulator Action Button */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <button
          onClick={handleSimulateNext}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Transmitting Carrier Webhook...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Simulate Next Carrier Event</span>
            </>
          )}
        </button>
        <p className="text-[10px] text-slate-500 text-center">
          Fires real-time flight vectors to `/api/webhooks/carrier` and updates customer telemetry.
        </p>
      </div>
    </div>
  );
}
