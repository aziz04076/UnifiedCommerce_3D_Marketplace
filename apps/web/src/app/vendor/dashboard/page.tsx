'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Store, TrendingUp, Package, Star, DollarSign, BarChart2, Users,
  AlertTriangle, CheckCircle, Clock, XCircle, Plus, Upload, Download,
  Edit2, Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronUp,
  Filter, RefreshCw, ArrowUpRight, ArrowDownRight, Zap, Shield,
  FileText, CreditCard, X, Loader2, ArrowLeft, Eye, Truck, ChevronRight,
  Search, Sparkles, Compass
} from 'lucide-react';
import { AIPriceInsight } from '../../../components/AIPriceInsight';
import { VendorAiGenerator } from '../../../components/VendorAiGenerator';
import {
  RequestPayoutModal,
  AirWaybillModal,
  CarrierSimulatorDrawer,
} from '../../../components/VendorPhase4Modals';
import { AirWaybill } from '@unified-commerce/types';


/* ─── Mock vendor context ─── */
const VENDOR = {
  id: 'vendor-001',
  name: 'NeoTech Gadgets',
  avatar: 'NT',
  badge: 'Verified Pro',
  gstin: '22AAAAA0000A1Z5',
  category: 'Electronics',
  joinedAt: '2024-03-12',
  kycStatus: 'approved' as const,
  commissionRate: 8,
  payoutCycle: 'D+1',
};

/* ─── Mock data ─── */
const GMV_DATA = [
  { month: 'Apr', gmv: 180000, revenue: 165600 },
  { month: 'May', gmv: 240000, revenue: 220800 },
  { month: 'Jun', gmv: 310000, revenue: 285200 },
  { month: 'Jul', gmv: 280000, revenue: 257600 },
  { month: 'Aug', gmv: 420000, revenue: 386400 },
  { month: 'Sep', gmv: 510000, revenue: 469200 },
];

const FULFILLMENT_RATE = 94.3;
const DISPUTE_RATE = 1.2;

const PRODUCTS_MOCK = [
  { id: 'p1', name: 'AetherApex Neural Band X1', sku: 'AAT-NB-X1', price: 24999, stock: 42, status: 'active', sales: 218, rating: 4.8 },
  { id: 'p2', name: 'HoloPad Pro 2026', sku: 'HP-PRO-2026', price: 89999, stock: 7, status: 'active', sales: 54, rating: 4.9 },
  { id: 'p3', name: 'SynapseCore AI Earbuds', sku: 'SC-AEB-V3', price: 12999, stock: 0, status: 'out_of_stock', sales: 512, rating: 4.6 },
  { id: 'p4', name: 'OmniCam 360° HDR', sku: 'OC-360-HDR', price: 34999, stock: 18, status: 'inactive', sales: 98, rating: 4.7 },
  { id: 'p5', name: 'FluxPower 200W GaN', sku: 'FP-200W-GAN', price: 4999, stock: 154, status: 'active', sales: 1204, rating: 4.5 },
];

const ORDERS_MOCK = [
  { id: 'ord-2841', product: 'AetherApex Neural Band X1', qty: 1, buyer: 'Arjun M.', amount: 24999, status: 'pending', placed: '2 hours ago' },
  { id: 'ord-2839', product: 'FluxPower 200W GaN', qty: 3, buyer: 'Priya S.', amount: 14997, status: 'processing', placed: '5 hours ago' },
  { id: 'ord-2831', product: 'HoloPad Pro 2026', qty: 1, buyer: 'Diego R.', amount: 89999, status: 'shipped', placed: '1 day ago' },
  { id: 'ord-2818', product: 'SynapseCore AI Earbuds', qty: 2, buyer: 'Mia K.', amount: 25998, status: 'delivered', placed: '2 days ago' },
  { id: 'ord-2801', product: 'FluxPower 200W GaN', qty: 5, buyer: 'Ravi P.', amount: 24995, status: 'returned', placed: '4 days ago' },
];

const PAYOUTS_MOCK = [
  { id: 'pay-881', date: '27 Sep 2026', amount: 43219, rail: 'NEFT', ref: 'HDFC0294841', status: 'settled' },
  { id: 'pay-872', date: '24 Sep 2026', amount: 67340, rail: 'NEFT', ref: 'HDFC0291023', status: 'settled' },
  { id: 'pay-861', date: '21 Sep 2026', amount: 28990, rail: 'USDC', ref: '0x8f2c...4a11', status: 'settled' },
  { id: 'pay-850', date: '18 Sep 2026', amount: 112880, rail: 'NEFT', ref: 'HDFC0285001', status: 'settled' },
  { id: 'pay-839', date: '15 Sep 2026', amount: 34500, rail: 'NEFT', ref: 'HDFC0279342', status: 'processing' },
];

/* ─── Helpers ─── */
function fmt(n: number, currency = true) {
  return currency ? `₹${n.toLocaleString('en-IN')}` : n.toLocaleString('en-IN');
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    processing: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
    shipped: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
    delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    returned: 'bg-red-500/15 text-red-300 border-red-500/20',
    settled: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    inactive: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    out_of_stock: 'bg-red-500/15 text-red-300 border-red-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium capitalize ${map[status] || 'bg-slate-700 text-slate-400'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

/* ─── SVG Line Chart (Zero-Data & Division-by-Zero Protected) ─── */
function LineChart({ data, height = 120 }: { data: Array<{ month: string; gmv: number; revenue: number }>; height?: number }) {
  if (!data || data.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-500">
        No sales activity recorded for this period.
      </div>
    );
  }
  const maxGmv = Math.max(1, ...data.map(d => d.gmv || 0));
  const W = 500, H = height;
  const pts = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * (W - 40) + 20 : W / 2,
    y: H - 20 - (((d.gmv || 0) / maxGmv) * (H - 40)),
    rev_y: H - 20 - (((d.revenue || 0) / maxGmv) * (H - 40)),
    ...d,
  }));
  const gmvPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const revPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.rev_y}`).join(' ');
  const areaPath = `${gmvPath} L ${pts[pts.length-1].x} ${H-20} L ${pts[0].x} ${H-20} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#gmvGrad)" />
        <path d={gmvPath} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={revPath} fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(p => (
          <g key={p.month}>
            <circle cx={p.x} cy={p.y} r={3} fill="#8b5cf6" />
            <text x={p.x} y={H - 4} textAnchor="middle" fontSize="10" fill="#64748b">{p.month}</text>
          </g>
        ))}
      </svg>
      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-violet-500 inline-block rounded" /> GMV</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-cyan-500 inline-block rounded border-dashed" /> Net Revenue</span>
      </div>
    </div>
  );
}

/* ─── Gauge ─── */
function Gauge({ value, label, color }: { value: number; label: string; color: string }) {
  const safeVal = Math.min(100, Math.max(0, isNaN(value) ? 0 : value));
  const r = 38, cx = 50, cy = 50, sw = 10;
  const circ = 2 * Math.PI * r;
  const dash = (safeVal / 100) * circ * 0.75;
  const offset = circ * 0.125;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={sw}
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeDashoffset={`${-offset}`}
          strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset={`${-offset}`}
          strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="16" fontWeight="800" fill="white">{safeVal}%</text>
      </svg>
      <p className="text-xs text-slate-400 -mt-1 text-center">{label}</p>
    </div>
  );
}

/* ─── Bar Chart (Zero-Data & Division-by-Zero Protected) ─── */
function BarChart({ data }: { data: Array<{ month: string; gmv: number }> }) {
  if (!data || data.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-500">
        No transaction volume recorded.
      </div>
    );
  }
  const max = Math.max(1, ...data.map(d => d.gmv || 0));
  return (
    <div className="flex items-end gap-2 h-20 w-full mt-2">
      {data.map(d => {
        const pct = Math.max(2, ((d.gmv || 0) / max) * 100);
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-md bg-violet-500/70 hover:bg-violet-400 transition-all" style={{ height: `${pct}%` }} />
            <span className="text-[9px] text-slate-500">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Add Product Modal ─── */
function AddProductModal({ onClose }: { onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  function handleSave() {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); }, 1500);
    setTimeout(() => { onClose(); }, 2500);
  }
  const inp = 'w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-all';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-white flex items-center gap-2"><Plus className="w-4 h-4 text-violet-400" />Add New Product</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
        {saved ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-white font-semibold">Product Added!</p>
            <p className="text-slate-400 text-xs mt-1">Listing is live on the marketplace.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <input className={inp} placeholder="Product Name *" />
              <div className="grid grid-cols-2 gap-3">
                <input className={inp} placeholder="SKU *" />
                <input className={inp} placeholder="Price (₹) *" type="number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className={inp} placeholder="Stock Qty *" type="number" />
                <select className={inp}><option>Electronics</option><option>Fashion</option><option>Home</option></select>
              </div>
              <textarea className={`${inp} resize-none h-20`} placeholder="Product description..." />
              <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-violet-500/30 transition-all">
                <Upload className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Drop product images here</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-sm text-slate-300 hover:text-white transition-all">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Publish'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── CSV Import Modal ─── */
function BulkImportModal({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'parsing' | 'done'>('idle');
  function handleDrop() {
    setPhase('parsing');
    setTimeout(() => setPhase('done'), 2500);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-white flex items-center gap-2"><Upload className="w-4 h-4 text-violet-400" />Bulk Product Import</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        {phase === 'idle' && (
          <>
            <div onClick={handleDrop}
              className="border-2 border-dashed border-violet-500/30 rounded-2xl p-10 text-center cursor-pointer hover:border-violet-500/60 hover:bg-violet-500/5 transition-all">
              <Upload className="w-8 h-8 text-violet-400 mx-auto mb-3" />
              <p className="text-sm text-white font-medium mb-1">Drop your CSV or Excel file here</p>
              <p className="text-xs text-slate-400">Supports .csv, .xlsx · Up to 10,000 SKUs per upload</p>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-slate-800/40 border border-white/5">
              <p className="text-xs text-slate-400 font-medium mb-2">Required columns:</p>
              <div className="flex flex-wrap gap-1.5">
                {['name', 'sku', 'price', 'stock', 'category', 'description', 'images'].map(c => (
                  <code key={c} className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-violet-300">{c}</code>
                ))}
              </div>
            </div>
            <button onClick={onClose} className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-sm text-slate-300 hover:text-white transition-all">Cancel</button>
          </>
        )}
        {phase === 'parsing' && (
          <div className="py-10 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto" />
            <p className="text-white font-medium">Processing your catalog...</p>
            {['Parsing 247 rows...', 'Validating SKU uniqueness...', 'AI image tagging...', 'Enriching descriptions...'].map(t => (
              <p key={t} className="text-xs text-slate-400">{t}</p>
            ))}
          </div>
        )}
        {phase === 'done' && (
          <div className="py-6 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <p className="text-xl font-bold text-white">Import Complete!</p>
            <div className="grid grid-cols-3 gap-3">
              {[['247', 'Rows Processed'], ['244', 'Products Added'], ['3', 'Skipped (duplicate)']].map(([v, l]) => (
                <div key={l} className="rounded-xl bg-slate-800/60 p-3">
                  <p className="text-lg font-black text-white">{v}</p>
                  <p className="text-[10px] text-slate-400">{l}</p>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */
type Tab = 'overview' | 'products' | 'orders' | 'payouts' | 'analytics';

const VENDOR_OPTIONS = [
  { id: 'vendor-1', name: 'AetherTech Labs', category: 'Wearables' },
  { id: 'vendor-2', name: 'NeoTokyo Streetwear', category: 'Fashion' },
  { id: 'vendor-3', name: 'BioSyn Living', category: 'Health & Wellness' },
  { id: 'vendor-4', name: 'CyberAudio Dynamics', category: 'Audio' },
  { id: 'vendor-5', name: 'Quantum Workspace', category: 'Office' },
  { id: 'vendor-001', name: 'NeoTech Gadgets', category: 'Electronics' },
  { id: 'vendor-empty', name: 'New Seller Studio', category: 'Crafts' },
];

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedVendorId, setSelectedVendorId] = useState('vendor-1');
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAiCopywriter, setShowAiCopywriter] = useState(false);
  const [products, setProducts] = useState(PRODUCTS_MOCK);
  const [orders, setOrders] = useState(ORDERS_MOCK);
  const [productSearch, setProductSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

  // Phase 4: State for Escrow, AWB, Inventory & Carrier Simulator
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [activeAwb, setActiveAwb] = useState<AirWaybill | null>(null);
  const [activeSimulatorOrderId, setActiveSimulatorOrderId] = useState<string | null>(null);
  const [escrowSummary, setEscrowSummary] = useState<any>(null);
  const [inventoryHealth, setInventoryHealth] = useState<any>(null);

  const fetchEscrow = () => {
    fetch('/api/vendor/payouts/disburse?vendorId=' + selectedVendorId)
      .then(r => r.json())
      .then(d => {
        if (d.summary) setEscrowSummary(d.summary);
      })
      .catch(console.error);
  };

  const fetchInventory = () => {
    fetch('/api/inventory/status?vendorId=' + selectedVendorId)
      .then(r => r.json())
      .then(d => {
        if (d.health) setInventoryHealth(d.health);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchEscrow();
    fetchInventory();
  }, [selectedVendorId]);

  useEffect(() => {
    setLoadingAnalytics(true);
    fetch(`/api/vendor/analytics?vendorId=${selectedVendorId}&range=${selectedRange}`)
      .then(r => r.json())
      .then(d => {
        if (d.analytics) {
          setAnalyticsData(d.analytics);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingAnalytics(false));
  }, [selectedVendorId, selectedRange]);

  async function handleViewAwb(orderId: string) {
    try {
      const res = await fetch(`/api/vendor/orders/dispatch?orderId=${orderId}`);
      const data = await res.json();
      if (data.awb) {
        setActiveAwb(data.awb);
      } else {
        const genRes = await fetch('/api/vendor/orders/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, vendorId: selectedVendorId }),
        });
        const genData = await genRes.json();
        if (genData.awb) setActiveAwb(genData.awb);
      }
    } catch (err) {
      console.error('AWB fetch error', err);
    }
  }

  const currentVendor = VENDOR_OPTIONS.find(v => v.id === selectedVendorId) || {
    id: selectedVendorId,
    name: analyticsData?.vendorName || VENDOR.name,
    category: VENDOR.category,
  };

  const dynamicGmvData = useMemo(() => {
    if (analyticsData?.timeSeriesGmv && analyticsData.timeSeriesGmv.length > 0) {
      return analyticsData.timeSeriesGmv.map((d: any) => ({
        month: d.period,
        gmv: d.gmv,
        revenue: d.revenue,
      }));
    }
    return GMV_DATA;
  }, [analyticsData]);

  const totalGMV = analyticsData?.totalGmv ?? GMV_DATA.reduce((s, d) => s + d.gmv, 0);
  const totalRevenue = Math.round(totalGMV * 0.92);
  const commission = totalGMV - totalRevenue;
  const currentGMV = dynamicGmvData.length > 0 ? dynamicGmvData[dynamicGmvData.length - 1].gmv : 0;
  const prevGMV = dynamicGmvData.length > 1 ? dynamicGmvData[dynamicGmvData.length - 2].gmv : 0;
  const gmvGrowth = prevGMV > 0 ? (((currentGMV - prevGMV) / prevGMV) * 100).toFixed(1) : '0.0';
  const aov = analyticsData?.averageOrderValue ?? 0;
  const lowStockCount = analyticsData?.lowStockCount ?? 0;
  const totalOrdersCount = analyticsData?.totalOrders ?? orders.length;
  const fulfillmentRate = analyticsData?.fulfillmentRate ?? FULFILLMENT_RATE;
  const disputeRate = analyticsData?.disputeRate ?? DISPUTE_RATE;
  const topProductsList = analyticsData?.topProducts && analyticsData.topProducts.length > 0 ? analyticsData.topProducts : PRODUCTS_MOCK;

  function toggleProductStatus(id: string) {
    setProducts(ps => ps.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p));
  }

  function advanceOrder(id: string) {
    const flow: Record<string, string> = { pending: 'processing', processing: 'shipped', shipped: 'delivered' };
    setOrders(os => os.map(o => o.id === id && flow[o.status] ? { ...o, status: flow[o.status] } : o));
  }

  const filteredProducts = useMemo(() => products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  ), [products, productSearch]);

  const filteredOrders = useMemo(() => orders.filter(o =>
    orderFilter === 'all' || o.status === orderFilter
  ), [orders, orderFilter]);

  const tabCls = (t: Tab) => `px-4 py-2 rounded-xl text-xs font-medium transition-all ${
    activeTab === t ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
  }`;

  const cardCls = 'rounded-2xl bg-slate-900/50 border border-white/5 p-5';

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 via-transparent to-transparent" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#030712]/90 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/vendor" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xs font-black">
              {currentVendor.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white leading-none">{currentVendor.name}</p>
                {loadingAnalytics && <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />}
              </div>
              <p className="text-[10px] text-slate-400">{currentVendor.category} · Verified Merchant</p>
            </div>
          </div>

          {/* Vendor Switcher & Date Range */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-white/10 rounded-xl px-2.5 py-1">
              <Store className="w-3.5 h-3.5 text-violet-400" />
              <select
                aria-label="Switch Vendor Scope"
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                {VENDOR_OPTIONS.map((v) => (
                  <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                    {v.name} ({v.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-slate-800/60 p-0.5 rounded-xl border border-white/5">
              {(['7d', '30d', '90d', '1y'] as const).map((rng) => (
                <button
                  key={rng}
                  onClick={() => setSelectedRange(rng)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all ${
                    selectedRange === rng ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rng}
                </button>
              ))}
            </div>

            <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              KYC Active
            </span>
            <Link href="/products" className="px-3 py-1 rounded-xl bg-slate-800 border border-white/10 text-xs text-slate-300 hover:text-white transition-all">
              Storefront
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 py-6">

        {/* Tab nav */}
        <div className="flex items-center gap-1 mb-6 flex-wrap bg-slate-900/40 border border-white/5 rounded-2xl p-1.5">
          {([
            ['overview', BarChart2, 'Overview'],
            ['products', Package, 'Products'],
            ['orders', Truck, 'Orders'],
            ['payouts', DollarSign, 'Payouts'],
            ['analytics', TrendingUp, 'Analytics'],
          ] as [Tab, React.ElementType, string][]).map(([t, Icon, label]) => (
            <button key={t} onClick={() => setActiveTab(t)} className={tabCls(t)}>
              <span className="flex items-center gap-1.5">
                <Icon className="w-3 h-3" />
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* ══════════════ OVERVIEW TAB ══════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {totalGMV === 0 ? (
              <div className="rounded-2xl bg-slate-900/60 border border-violet-500/30 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                    🌱
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Welcome, {currentVendor.name}!</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No transactions recorded yet for this period ({selectedRange}). Share your storefront link or add more catalog items to trigger your real-time analytics.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
                  >
                    + Add Product
                  </button>
                  <button
                    onClick={() => setSelectedVendorId('vendor-1')}
                    className="px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-slate-300"
                  >
                    Load Demo Data
                  </button>
                </div>
              </div>
            ) : null}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: `Total GMV (${selectedRange})`, value: fmt(totalGMV), sub: `+${gmvGrowth}% vs prev`, icon: TrendingUp, up: parseFloat(gmvGrowth) >= 0, color: 'violet' },
                { label: 'Net Revenue', value: fmt(totalRevenue), sub: `After ${VENDOR.commissionRate}% platform fee`, icon: DollarSign, up: true, color: 'emerald' },
                { label: 'Total Orders', value: totalOrdersCount.toString(), sub: `AOV: ₹${aov.toLocaleString('en-IN')}`, icon: Package, up: true, color: 'blue' },
                { label: 'Low Stock Alert', value: `${lowStockCount} items`, sub: lowStockCount > 0 ? 'Restock recommended' : 'Healthy inventory', icon: AlertTriangle, up: lowStockCount === 0, color: lowStockCount > 0 ? 'rose' : 'amber' },
              ].map(({ label, value, sub, icon: Icon, up, color }) => (
                <div key={label} className={`${cardCls} hover:border-${color}-500/20 transition-all group`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 text-${color}-400`} />
                    </div>
                    {up ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />}
                  </div>
                  <p className="text-xl font-black text-white leading-none">{value}</p>
                  <p className="text-xs text-slate-400 mt-1">{label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* GMV Chart + Gauges */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className={`${cardCls} md:col-span-2`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-sm">GMV & Revenue Trend ({selectedRange})</h3>
                    <p className="text-[11px] text-slate-500">IST Timezone aggregated time-series</p>
                  </div>
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />+{gmvGrowth}% MoM
                  </span>
                </div>
                <LineChart data={dynamicGmvData} height={130} />
              </div>
              <div className={cardCls}>
                <h3 className="font-semibold text-sm mb-4">Performance</h3>
                <div className="flex justify-around">
                  <Gauge value={fulfillmentRate} label="Fulfillment Rate" color="#8b5cf6" />
                  <Gauge value={Math.max(0, 100 - disputeRate)} label="No-Dispute Rate" color="#06b6d4" />
                </div>
              </div>
            </div>

            {/* Commission breakdown */}
            <div className={cardCls}>
              <h3 className="font-semibold text-sm mb-4">Commission Breakdown (6M)</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Gross Sales', value: fmt(totalGMV), color: 'violet' },
                  { label: `Platform Fee (${VENDOR.commissionRate}%)`, value: fmt(commission), color: 'red' },
                  { label: 'Your Earnings', value: fmt(totalRevenue), color: 'emerald' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`rounded-xl bg-slate-800/40 border border-${color}-500/15 p-4`}>
                    <p className={`text-lg font-black text-${color}-400`}>{value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-violet-950/30 border border-violet-500/20 text-xs text-slate-400">
                <span className="text-violet-300 font-medium">Next milestone:</span> Hit ₹30L GMV to unlock 6% commission rate (current: 8%).
                You&apos;re at <span className="text-white font-semibold">₹{(totalGMV / 10).toLocaleString('en-IN')}</span> / ₹30,00,000
              </div>
            </div>

            {/* Recent orders snippet */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Recent Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {orders.slice(0, 3).map(o => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-white">{o.product}</p>
                      <p className="text-[10px] text-slate-400">{o.id} · {o.placed}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-white">{fmt(o.amount)}</span>
                      <StatusChip status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ PRODUCTS TAB ══════════════ */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    className="pl-9 pr-4 py-2 rounded-xl bg-slate-800/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 w-48"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAiCopywriter(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-xs text-violet-300 hover:bg-violet-500/20 transition-all font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" /> AI Copywriter & SEO
                </button>
                <button
                  onClick={() => setShowBulkImport(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-slate-300 hover:text-white hover:border-violet-500/30 transition-all"
                >
                  <Upload className="w-3 h-3" /> Bulk Import
                </button>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all"
                >
                  <Plus className="w-3 h-3" /> Add Product
                </button>
              </div>
            </div>

            {/* Inventory Health Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">Total Catalog Stock</p>
                  <p className="text-base font-bold text-white">
                    {products.reduce((s, p) => s + p.stock, 0)} units
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-cyan-500/20 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">Checkout Cart Locks (15m TTL)</p>
                  <p className="text-base font-bold text-cyan-300">
                    {inventoryHealth?.totalReservedUnits ?? 4} units reserved
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">Low-Stock Reorder Alerts</p>
                  <p className="text-base font-bold text-amber-400">
                    {products.filter(p => p.stock > 0 && p.stock <= 10).length} items
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className={cardCls}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Product', 'SKU', 'Price', 'Total Stock', 'Reserved (15m)', 'Available (ATP)', 'Sales', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left py-3 px-3 text-slate-400 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => {
                      const reserved = p.id === 'p1' ? 2 : p.id === 'p2' ? 1 : 0;
                      const available = Math.max(0, p.stock - reserved);
                      return (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                          <td className="py-3 px-3">
                            <p className="font-medium text-white max-w-[160px] truncate">{p.name}</p>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400">{p.sku}</td>
                          <td className="py-3 px-3 text-white font-semibold">{fmt(p.price)}</td>
                          <td className="py-3 px-3 text-slate-300">{p.stock}</td>
                          <td className="py-3 px-3 font-mono text-cyan-400">
                            {reserved > 0 ? `+${reserved} locked` : '—'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`font-semibold ${available === 0 ? 'text-red-400' : available < 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {available}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-300">{p.sales.toLocaleString()}</td>
                          <td className="py-3 px-3"><StatusChip status={p.status} /></td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleProductStatus(p.id)}
                                className="text-slate-400 hover:text-violet-400 transition-colors"
                                title={p.status === 'active' ? 'Deactivate' : 'Activate'}
                              >
                                {p.status === 'active' ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                              </button>
                              <button className="text-slate-400 hover:text-cyan-400 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button className="text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ ORDERS TAB ══════════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'returned'].map(f => (
                <button key={f} onClick={() => setOrderFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
                    orderFilter === f ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}>
                  {f}
                </button>
              ))}
            </div>

            <div className={cardCls}>
              <div className="space-y-3">
                {filteredOrders.map(o => (
                  <div key={o.id} className="rounded-xl bg-slate-800/40 border border-white/5 p-4 hover:border-violet-500/15 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-violet-300">{o.id}</span>
                          <StatusChip status={o.status} />
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> SLA: 18h 30m
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white">{o.product}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Qty: {o.qty} · Buyer: {o.buyer} · {o.placed}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold mr-2">{fmt(o.amount)}</p>

                        {/* View / Generate AWB button */}
                        <button
                          onClick={() => handleViewAwb(o.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs hover:bg-cyan-500/10 transition-all flex items-center gap-1.5"
                          title="View / Print Air Waybill Manifest"
                        >
                          <FileText className="w-3 h-3" />
                          <span>AWB</span>
                        </button>

                        {/* Carrier telemetry simulator */}
                        <button
                          onClick={() => setActiveSimulatorOrderId(o.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-purple-500/30 text-purple-300 text-xs hover:bg-purple-500/10 transition-all flex items-center gap-1.5"
                          title="Open Carrier Radar Simulator"
                        >
                          <Compass className="w-3 h-3" />
                          <span>Telemetry</span>
                        </button>

                        {(['pending', 'processing', 'shipped'] as string[]).includes(o.status) && (
                          <button
                            onClick={() => {
                              advanceOrder(o.id);
                              if (o.status === 'processing') {
                                handleViewAwb(o.id);
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs hover:bg-violet-600/40 transition-all font-semibold"
                          >
                            <Truck className="w-3 h-3" />
                            {o.status === 'pending' ? 'Accept' : o.status === 'processing' ? 'Dispatch & AWB' : 'Mark Delivered'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ PAYOUTS TAB ══════════════ */}
        {activeTab === 'payouts' && (
          <div className="space-y-5">
            {/* Wallet summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`${cardCls} flex flex-col justify-between group hover:border-emerald-500/20 transition-all`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <button
                    onClick={() => setShowPayoutModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Withdraw</span>
                  </button>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{fmt(escrowSummary?.availableBalance ?? 67234)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Available for Immediate Payout</p>
                  <p className="text-[10px] text-emerald-400 mt-1">✓ Cleared post-delivery buffer</p>
                </div>
              </div>

              <div className={`${cardCls} flex flex-col justify-between group hover:border-amber-500/20 transition-all`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    Escrow Protected
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{fmt(escrowSummary?.lockedInEscrow ?? 34500)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Locked in Active Escrow</p>
                  <p className="text-[10px] text-slate-500 mt-1">Pending delivery + 48h return clearance</p>
                </div>
              </div>

              <div className={`${cardCls} flex flex-col justify-between group hover:border-violet-500/20 transition-all`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-violet-400" />
                  </div>
                  <span className="text-[10px] font-mono text-violet-300">Dual Rail (Fiat / USDC)</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{fmt(escrowSummary?.totalDisbursed ?? 286929)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Total Settled Earnings</p>
                  <p className="text-[10px] text-slate-500 mt-1">Across 100% verified disbursements</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Transaction Ledger & Disbursement Audit</h3>
                <p className="text-[11px] text-slate-500">Immutable record of NEFT, ACH, and USDC Polygon settlements.</p>
              </div>
              <button
                onClick={() => setShowPayoutModal(true)}
                className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-violet-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Payout Request</span>
              </button>
            </div>

            <div className={cardCls}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Payout ID', 'Date', 'Amount', 'Rail', 'Transaction Reference / UTR', 'Status'].map(h => (
                        <th key={h} className="text-left py-3 px-3 text-slate-400 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(escrowSummary?.payoutHistory && escrowSummary.payoutHistory.length > 0
                      ? escrowSummary.payoutHistory
                      : PAYOUTS_MOCK
                    ).map((p: any) => (
                      <tr key={p.payoutId || p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="py-3 px-3 font-mono text-violet-300">{p.payoutId || p.id}</td>
                        <td className="py-3 px-3 text-slate-300">{p.date || (p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Today')}</td>
                        <td className="py-3 px-3 text-white font-bold">{fmt(p.amount)}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            (p.rail || '').includes('USDC') ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'bg-slate-700 text-slate-300'
                          }`}>{p.rail}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400 truncate max-w-[160px]" title={p.txHashOrUtr || p.ref}>
                          {p.txHashOrUtr || p.ref}
                        </td>
                        <td className="py-3 px-3"><StatusChip status={p.status.toLowerCase()} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ ANALYTICS TAB ══════════════ */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              {/* GMV bar chart */}
              <div className={cardCls}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">Monthly GMV (₹)</h3>
                    <p className="text-[10px] text-slate-500">Filtered range: {selectedRange}</p>
                  </div>
                  <span className="text-xs font-bold text-violet-400">Total: {fmt(totalGMV)}</span>
                </div>
                <BarChart data={dynamicGmvData} />
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {dynamicGmvData.slice(-3).map((d: any) => (
                    <div key={d.month} className="rounded-xl bg-slate-800/40 p-3">
                      <p className="text-xs text-slate-400">{d.month} GMV</p>
                      <p className="text-sm font-bold text-white">₹{((d.gmv || 0) / 1000).toFixed(0)}K</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance gauges */}
              <div className={cardCls}>
                <h3 className="font-semibold text-sm mb-4">Seller Health Score</h3>
                <div className="flex justify-around mb-4">
                  <Gauge value={fulfillmentRate} label="Fulfillment" color="#8b5cf6" />
                  <Gauge value={Math.max(0, 100 - disputeRate)} label="Dispute-Free" color="#10b981" />
                  <Gauge value={92} label="Response Rate" color="#f59e0b" />
                </div>
                <div className="space-y-2 pt-3 border-t border-white/5">
                  {[
                    { metric: 'Avg Dispatch Time', value: '1.1 days', good: true },
                    { metric: 'Dispute Rate', value: `${disputeRate}%`, good: disputeRate < 2 },
                    { metric: 'AOV (Avg Order Value)', value: `₹${aov.toLocaleString('en-IN')}`, good: true },
                    { metric: 'KYC & GSTIN Verification', value: 'Approved ✓', good: true },
                  ].map(({ metric, value, good }) => (
                    <div key={metric} className="flex justify-between text-xs py-1">
                      <span className="text-slate-400">{metric}</span>
                      <span className={good ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top products */}
            <div className={cardCls}>
              <h3 className="font-semibold text-sm mb-4">Top Products by Revenue</h3>
              <div className="space-y-3">
                {topProductsList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No products found for this vendor.</p>
                ) : (
                  [...topProductsList].sort((a, b) => (b.revenue ?? (b.price * (b.sales || 1))) - (a.revenue ?? (a.price * (a.sales || 1)))).slice(0, 5).map((p: any, i: number) => {
                    const rev = p.revenue ?? (p.price * (p.sales || 1));
                    const max = Math.max(1, ...topProductsList.map((x: any) => x.revenue ?? (x.price * (x.sales || 1))));
                    const pct = Math.min(100, Math.round((rev / max) * 100));
                    return (
                      <div key={p.id || i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 flex items-center gap-2">
                            <span className="text-slate-500 w-4">#{i + 1}</span>
                            {p.name}
                          </span>
                          <span className="text-white font-semibold">{fmt(rev)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-800">
                          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Payout trend */}
            <div className={cardCls}>
              <h3 className="font-semibold text-sm mb-4">Commission & Payout Trend</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Month', 'Gross GMV', 'Commission (8%)', 'Net Revenue', 'Growth'].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-slate-400 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dynamicGmvData.map((d: any, i: number) => {
                      const prevRev = i > 0 ? dynamicGmvData[i-1].revenue : null;
                      const growth = prevRev && prevRev > 0 ? (((d.revenue - prevRev) / prevRev) * 100).toFixed(1) : null;
                      return (
                        <tr key={d.month} className="border-b border-white/5 hover:bg-white/2">
                          <td className="py-2 px-3 text-white font-medium">{d.month}</td>
                          <td className="py-2 px-3 text-slate-300">{fmt(d.gmv)}</td>
                          <td className="py-2 px-3 text-red-400">{fmt(d.gmv - d.revenue)}</td>
                          <td className="py-2 px-3 text-emerald-400 font-semibold">{fmt(d.revenue)}</td>
                          <td className="py-2 px-3">
                            {growth ? (
                              <span className={`flex items-center gap-0.5 ${parseFloat(growth) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {parseFloat(growth) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {growth}%
                              </span>
                            ) : <span className="text-slate-500">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Price Intelligence */}
            <AIPriceInsight productId="prod-001" basePrice={24999} />
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddProduct && <AddProductModal onClose={() => setShowAddProduct(false)} />}
      {showBulkImport && <BulkImportModal onClose={() => setShowBulkImport(false)} />}
      {showPayoutModal && (
        <RequestPayoutModal
          vendorId="vendor-001"
          availableBalance={escrowSummary?.availableBalance ?? 67234}
          onClose={() => setShowPayoutModal(false)}
          onSuccess={() => {
            fetchEscrow();
          }}
        />
      )}
      {activeAwb && (
        <AirWaybillModal
          awb={activeAwb}
          onClose={() => setActiveAwb(null)}
        />
      )}
      {activeSimulatorOrderId && (
        <CarrierSimulatorDrawer
          orderId={activeSimulatorOrderId}
          onClose={() => setActiveSimulatorOrderId(null)}
          onStepSimulated={(ev) => {
            if (ev.eventType === 'DELIVERED') {
              fetchEscrow();
            }
          }}
        />
      )}
      {showAiCopywriter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAiCopywriter(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <VendorAiGenerator
              onApply={(meta) => {
                setShowAiCopywriter(false);
                setShowAddProduct(true);
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}

