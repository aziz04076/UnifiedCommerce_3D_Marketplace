'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Store,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flag,
  Tag,
  Image as ImageIcon,
  RotateCcw,
  FileCheck2,
  Lock,
  Search,
  Plus,
  Trash2,
  BarChart3,
  Sliders,
  ChevronRight,
  Eye,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Navbar, Footer, Badge, Button, formatPrice } from '@unified-commerce/ui';
import { getAllCategories, getAllVendors, getAllProducts } from '@unified-commerce/database';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';

type AdminTab =
  | 'overview'
  | 'users'
  | 'vendors'
  | 'moderation'
  | 'banners'
  | 'coupons'
  | 'refunds'
  | 'audit';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'VENDOR' | 'ADMIN';
  isBanned: boolean;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
}

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  targetUrl: string;
  isActive: boolean;
  accentColor: string;
}

interface ModerationItem {
  id: string;
  type: 'REVIEW' | 'QUESTION';
  targetProduct: string;
  author: string;
  content: string;
  flagReason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface DisputeItem {
  id: string;
  orderNumber: string;
  buyerName: string;
  vendorName: string;
  amount: number;
  reason: string;
  status: 'OPEN' | 'REFUNDED' | 'DISPUTE_REJECTED';
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  hash: string;
}

const INITIAL_USERS: UserRecord[] = [
  {
    id: 'usr-1',
    name: 'Alex Vance',
    email: 'alex.vance@blackmesa.org',
    role: 'ADMIN',
    isBanned: false,
    totalOrders: 14,
    totalSpent: 12480,
    joinedAt: '2026-01-15',
  },
  {
    id: 'usr-2',
    name: 'Marcus Kaine',
    email: 'm.kaine@suborbital.tech',
    role: 'VENDOR',
    isBanned: false,
    totalOrders: 2,
    totalSpent: 1850,
    joinedAt: '2026-02-04',
  },
  {
    id: 'usr-3',
    name: 'Kira Thorne',
    email: 'kira.thorne@neuralmesh.io',
    role: 'BUYER',
    isBanned: false,
    totalOrders: 8,
    totalSpent: 6200,
    joinedAt: '2026-03-12',
  },
  {
    id: 'usr-4',
    name: 'Shadow Trader (Flagged)',
    email: 'anon991@botnetwork.xyz',
    role: 'BUYER',
    isBanned: true,
    totalOrders: 0,
    totalSpent: 0,
    joinedAt: '2026-09-21',
  },
];

const INITIAL_BANNERS: BannerItem[] = [
  {
    id: 'ban-1',
    title: 'Spring Quantum Equinox Drop',
    subtitle: 'Exclusive 12-hour suborbital air shipping window with zero telemetry tax.',
    targetUrl: '/products?category=cyberpunk-wearables',
    isActive: true,
    accentColor: '#00F2FE',
  },
  {
    id: 'ban-2',
    title: 'Artisan Hardware Accelerator 2026',
    subtitle: 'Verified makers receive 0% commission for their first $50,000 in GMV.',
    targetUrl: '/vendor',
    isActive: true,
    accentColor: '#7928CA',
  },
];

const INITIAL_MODERATION: ModerationItem[] = [
  {
    id: 'mod-1',
    type: 'REVIEW',
    targetProduct: 'AetherApex Neural Band X1',
    author: 'Unknown_Scraper',
    content: 'Click here for discounted external firmware keys at http://shady-link.xyz',
    flagReason: 'Automated phishing link detected by NLP security filter',
    status: 'PENDING',
  },
  {
    id: 'mod-2',
    type: 'QUESTION',
    targetProduct: 'Vortex LiDAR Autonomous Drone',
    author: 'TelemetryHacker',
    content: 'Can this drone bypass restricted metropolitan radar zones with signal jamming?',
    flagReason: 'Illegal airspace avoidance inquiry',
    status: 'PENDING',
  },
];

const INITIAL_DISPUTES: DisputeItem[] = [
  {
    id: 'disp-1',
    orderNumber: 'UC-2026-8942X',
    buyerName: 'Kira Thorne',
    vendorName: 'Apex Neural Dynamics',
    amount: 1499,
    reason: 'Packaging seal broke in suborbital transit; requesting sensory recalibration RMA',
    status: 'OPEN',
  },
  {
    id: 'disp-2',
    orderNumber: 'UC-2026-3190M',
    buyerName: 'Dave Miller',
    vendorName: 'SonicForge Labs',
    amount: 890,
    reason: 'Planar diaphragm latency test discrepancy of 0.8ms from advertised spec',
    status: 'OPEN',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    timestamp: '2026-09-28 12:45:10 UTC',
    actor: 'admin:root',
    action: 'COMMISSION_UPDATE',
    target: 'Vendor: Apex Neural Dynamics (8% -> 9%)',
    hash: '0x8f19a029c91b...7e41',
  },
  {
    id: 'aud-2',
    timestamp: '2026-09-28 11:30:22 UTC',
    actor: 'system:escrow-shield',
    action: 'AUTO_FREEZE_SUSPECT_ACCOUNT',
    target: 'User: anon991@botnetwork.xyz',
    hash: '0x4c2b9181de29...aa09',
  },
  {
    id: 'aud-3',
    timestamp: '2026-09-28 09:15:00 UTC',
    actor: 'admin:root',
    action: 'BANNER_CMS_DEPLOY',
    target: 'Banner: Spring Quantum Equinox Drop',
    hash: '0x12bb94481023...ff66',
  },
];

export default function AdminDashboardPage() {
  const categories = getAllCategories();
  const rawVendors = getAllVendors();
  const allProducts = getAllProducts();
  const { cartItems, wishlistIds } = useCart();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Vendor Commission Management
  const [vendorList, setVendorList] = useState(
    rawVendors.map((v) => ({
      ...v,
      commissionPercent: Math.round((v.commissionRate || 0.08) * 100),
    }))
  );

  // User Management
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [userSearch, setUserSearch] = useState('');

  // Banners CMS
  const [banners, setBanners] = useState<BannerItem[]>(INITIAL_BANNERS);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerUrl, setNewBannerUrl] = useState('');

  // Moderation Queue
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>(INITIAL_MODERATION);

  // Coupons Manager
  const [coupons, setCoupons] = useState([
    { code: 'CYBER2026', discountPercent: 15, maxUses: 1000, currentUses: 341, active: true },
    { code: 'NEURAL100', discountFixed: 100, maxUses: 500, currentUses: 88, active: true },
    { code: 'FREESHIP', freeShipping: true, maxUses: 2000, currentUses: 912, active: true },
    { code: 'VIP-GOLD', discountPercent: 20, maxUses: 100, currentUses: 45, active: true },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('10');

  // Disputes & Refunds
  const [disputes, setDisputes] = useState<DisputeItem[]>(INITIAL_DISPUTES);

  // Immutable Audit Log
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Handlers
  const addAuditEntry = (action: string, target: string) => {
    const randomHash =
      '0x' +
      Math.random().toString(16).substring(2, 10) +
      '...' +
      Math.random().toString(16).substring(2, 6);
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: 'admin:alex.vance',
      action,
      target,
      hash: randomHash,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const handleToggleBan = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextState = !u.isBanned;
          addAuditEntry(nextState ? 'BAN_USER' : 'UNBAN_USER', `User: ${u.email}`);
          return { ...u, isBanned: nextState };
        }
        return u;
      })
    );
  };

  const handleRoleChange = (userId: string, newRole: UserRecord['role']) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          addAuditEntry('ROLE_CHANGE', `User: ${u.email} to ${newRole}`);
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  const handleCommissionChange = (vendorId: string, newPercent: number) => {
    setVendorList((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          addAuditEntry('COMMISSION_UPDATE', `Vendor ${v.name}: ${newPercent}%`);
          return { ...v, commissionPercent: newPercent };
        }
        return v;
      })
    );
  };

  const handleModerationAction = (modId: string, action: 'APPROVED' | 'REJECTED') => {
    setModerationQueue((prev) =>
      prev.map((m) => {
        if (m.id === modId) {
          addAuditEntry(`CONTENT_${action}`, `${m.type}: ${m.targetProduct} by ${m.author}`);
          return { ...m, status: action };
        }
        return m;
      })
    );
  };

  const handleDisputeAction = (dispId: string, action: 'REFUNDED' | 'DISPUTE_REJECTED') => {
    setDisputes((prev) =>
      prev.map((d) => {
        if (d.id === dispId) {
          addAuditEntry(`DISPUTE_${action}`, `Order: ${d.orderNumber} ($${d.amount})`);
          return { ...d, status: action };
        }
        return d;
      })
    );
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const code = newCouponCode.toUpperCase().trim();
    const discount = parseInt(newCouponDiscount, 10) || 10;
    setCoupons((prev) => [
      ...prev,
      {
        code,
        discountPercent: discount,
        maxUses: 500,
        currentUses: 0,
        active: true,
      },
    ]);
    addAuditEntry('CREATE_COUPON', `Coupon ${code} (${discount}%)`);
    setNewCouponCode('');
  };

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerTitle.trim()) return;
    const newBanner: BannerItem = {
      id: `ban-${Date.now()}`,
      title: newBannerTitle,
      subtitle: newBannerSubtitle || 'Engineered platform campaign',
      targetUrl: newBannerUrl || '/products',
      isActive: true,
      accentColor: '#00F2FE',
    };
    setBanners((prev) => [newBanner, ...prev]);
    addAuditEntry('CREATE_BANNER', `Banner: ${newBannerTitle}`);
    setNewBannerTitle('');
    setNewBannerSubtitle('');
    setNewBannerUrl('');
  };

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-cyan-500/30 selection:text-white">
      <Navbar
        categories={categories}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlistIds.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Header */}
        <div className="pb-8 border-b border-white/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="rose" size="sm" withDot>COMMAND ARCHITECTURE</Badge>
              <span className="text-xs font-mono text-cyan-400">
                UnifiedCommerce Enterprise Core v2.4.0
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Platform Administration Center
            </h1>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Root Zero-Trust Session Active</span>
          </div>
        </div>

        {/* Global KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Platform GMV</span>
              <DollarSign className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white">$4,821,950</div>
            <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+24.6% vs last quarter</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Orders</span>
              <BarChart3 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white">14,291</div>
            <div className="text-[11px] text-purple-300 font-mono mt-1">99.8% Suborbital On-Time</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Active Verified Vendors</span>
              <Store className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white">{vendorList.length} Makers</div>
            <div className="text-[11px] text-amber-300 font-mono mt-1">Avg Rating: 4.88 / 5.0</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Escrow Reserve Balance</span>
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white">$840,120</div>
            <div className="text-[11px] text-emerald-400 font-mono mt-1">100% Fully Collateralized</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-white/10 mb-8 scrollbar-none">
          {[
            { id: 'overview' as const, label: 'Analytics Funnel', icon: TrendingUp },
            { id: 'users' as const, label: 'User Directory', icon: Users },
            { id: 'vendors' as const, label: 'Vendor Commissions', icon: Store },
            { id: 'moderation' as const, label: 'Content Moderation', icon: Flag },
            { id: 'banners' as const, label: 'Banner CMS', icon: ImageIcon },
            { id: 'coupons' as const, label: 'Coupon Engine', icon: Tag },
            { id: 'refunds' as const, label: 'Disputes & Refunds', icon: RotateCcw },
            { id: 'audit' as const, label: 'Immutable Audit Log', icon: FileCheck2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-colors ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-neon-cyan'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & FUNNEL */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Conversion Funnel Visualization */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Sales & Traffic Conversion Funnel</h3>
                <p className="text-xs text-slate-400">Real-time user traversal across the 3D marketplace stack.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  { step: '1. Platform Visits', count: '142,800', rate: '100%', drop: '0%' },
                  { step: '2. 3D WebXR Views', count: '68,400', rate: '47.9%', drop: '-52.1%' },
                  { step: '3. Added to Bag', count: '29,100', rate: '20.4%', drop: '-57.5%' },
                  { step: '4. Checkout Initiated', count: '16,720', rate: '11.7%', drop: '-42.5%' },
                  { step: '5. Settled in Escrow', count: '14,291', rate: '10.0%', drop: '-14.5%' },
                ].map((st, i) => (
                  <div
                    key={st.step}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2 relative"
                  >
                    <span className="text-[11px] font-semibold text-slate-400 block">{st.step}</span>
                    <div className="text-xl font-bold font-mono text-white">{st.count}</div>
                    <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-white/5">
                      <span className="text-cyan-400">{st.rate}</span>
                      <span className="text-slate-500">{st.drop}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Catalog Stats */}
            <div className="p-6 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white">Active Product Matrix: {allProducts.length} Items</h4>
                <p className="text-xs text-slate-400">
                  {categories.length} Top-level categories • Zero dead links • WebGL 3D dynamic mesh configurations
                </p>
              </div>
              <Link
                href="/products"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-cyan-300 border border-cyan-500/20 transition-colors"
              >
                Inspect Public Catalog
              </Link>
            </div>
          </div>
        )}

        {/* TAB 2: USER DIRECTORY & ACCESS CONTROL */}
        {activeTab === 'users' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">User Accounts & Zero-Trust Access</h3>
                <p className="text-xs text-slate-400">Manage buyer privileges, vendor verification flags, and ban status.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user email or name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-mono">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Orders / Spent</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users
                    .filter(
                      (u) =>
                        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearch.toLowerCase())
                    )
                    .map((user) => (
                      <tr key={user.id} className="hover:bg-slate-900/30">
                        <td className="py-3.5">
                          <div className="font-semibold text-white">{user.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                        </td>
                        <td className="py-3.5">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                            className="px-2 py-1 rounded bg-slate-900 border border-white/10 text-xs text-cyan-300 font-mono focus:outline-none"
                          >
                            <option value="BUYER">BUYER</option>
                            <option value="VENDOR">VENDOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              user.isBanned
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {user.isBanned ? 'BANNED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono text-slate-300">
                          {user.totalOrders} orders • {formatPrice(user.totalSpent)}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleBan(user.id)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                              user.isBanned
                                ? 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30'
                                : 'bg-rose-600/20 text-rose-300 hover:bg-rose-600/40 border border-rose-500/30'
                            }`}
                          >
                            {user.isBanned ? 'Unban Account' : 'Ban Account'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: VENDOR COMMISSIONS */}
        {activeTab === 'vendors' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Vendor Marketplace Commission Governance</h3>
              <p className="text-xs text-slate-400">
                Adjust platform commission rate sliders per verified maker (standard base: 8%).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendorList.map((vendor) => (
                <div
                  key={vendor.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">{vendor.name}</h4>
                      <p className="text-xs text-slate-400">{vendor.tagline}</p>
                    </div>
                    <Badge variant="cyan" size="sm">{vendor.badge || 'Verified Maker'}</Badge>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Platform Take Rate:</span>
                      <span className="font-mono font-bold text-cyan-400 text-sm">
                        {vendor.commissionPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={25}
                      value={vendor.commissionPercent}
                      onChange={(e) => handleCommissionChange(vendor.id, parseInt(e.target.value, 10))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>3% (Min Artisan)</span>
                      <span>25% (Enterprise)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CONTENT MODERATION QUEUE */}
        {activeTab === 'moderation' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">User Content & Community Moderation Queue</h3>
              <p className="text-xs text-slate-400">
                Review automated NLP flags for spam, illegal telemetry bypasses, and harmful links.
              </p>
            </div>

            <div className="space-y-4">
              {moderationQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="rose" size="sm">{item.type} FLAGGED</Badge>
                      <span className="text-xs font-semibold text-white">{item.targetProduct}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">Author: {item.author}</span>
                  </div>

                  <p className="text-xs text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5 font-mono">
                    "{item.content}"
                  </p>

                  <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-white/5 text-xs">
                    <span className="text-amber-400 flex items-center gap-1.5 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{item.flagReason}</span>
                    </span>

                    {item.status === 'PENDING' ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleModerationAction(item.id, 'APPROVED')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30 font-semibold"
                        >
                          Approve (False Positive)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleModerationAction(item.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600/40 border border-rose-500/30 font-semibold"
                        >
                          Reject & Delete
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono text-slate-400 font-bold uppercase text-[11px]">
                        Processed: {item.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BANNER CMS */}
        {activeTab === 'banners' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-8">
            <div>
              <h3 className="text-lg font-bold text-white">Homepage & Promotional Banner CMS</h3>
              <p className="text-xs text-slate-400">Deploy marketing campaigns, flash announcements, and telemetry alerts.</p>
            </div>

            {/* Create Banner Form */}
            <form onSubmit={handleCreateBanner} className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-300">Add Campaign Banner</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Headline / Title"
                  value={newBannerTitle}
                  onChange={(e) => setNewBannerTitle(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  placeholder="Subtitle / Announcement Copy"
                  value={newBannerSubtitle}
                  onChange={(e) => setNewBannerSubtitle(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  placeholder="Target Route (e.g. /products)"
                  value={newBannerUrl}
                  onChange={(e) => setNewBannerUrl(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Publish Banner to CMS</span>
                </Button>
              </div>
            </form>

            {/* Banners List */}
            <div className="space-y-3">
              {banners.map((ban) => (
                <div
                  key={ban.id}
                  className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{ban.title}</span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                        {ban.targetUrl}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{ban.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setBanners((prev) =>
                        prev.map((b) => (b.id === ban.id ? { ...b, isActive: !b.isActive } : b))
                      )
                    }
                    className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                      ban.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ban.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: COUPON ENGINE */}
        {activeTab === 'coupons' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Promotional Protocols & Coupon Generator</h3>
              <p className="text-xs text-slate-400">Configure discount percentages, usage caps, and redemption velocity.</p>
            </div>

            {/* Create Coupon Form */}
            <form onSubmit={handleCreateCoupon} className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 space-y-1 w-full">
                <label className="text-[10px] font-mono uppercase text-slate-400">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH25"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 uppercase font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="w-full sm:w-36 space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Discount %</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
              <Button type="submit" variant="primary" size="md">
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Create Protocol</span>
              </Button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map((c) => (
                <div
                  key={c.code}
                  className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="font-mono font-bold text-sm text-cyan-300">{c.code}</div>
                    <div className="text-xs text-slate-400">
                      {c.discountPercent ? `${c.discountPercent}% Off` : c.freeShipping ? 'Free Shipping' : `$${c.discountFixed} Off`}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Uses: {c.currentUses} / {c.maxUses}
                    </div>
                  </div>
                  <Badge variant="cyan" size="sm">ACTIVE</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: DISPUTES & REFUNDS */}
        {activeTab === 'refunds' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Refund & Smart Contract Dispute Arbitration</h3>
              <p className="text-xs text-slate-400">Resolve RMA claims with instant zero-friction smart contract payouts.</p>
            </div>

            <div className="space-y-4">
              {disputes.map((disp) => (
                <div
                  key={disp.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400">{disp.orderNumber}</span>
                      <span className="text-xs text-slate-400">({disp.buyerName} vs {disp.vendorName})</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-white">{formatPrice(disp.amount)}</span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-white/5">
                    Claim: {disp.reason}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        disp.status === 'REFUNDED'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : disp.status === 'DISPUTE_REJECTED'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {disp.status}
                    </span>

                    {disp.status === 'OPEN' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDisputeAction(disp.id, 'REFUNDED')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30 text-xs font-semibold"
                        >
                          Authorize Escrow Refund
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDisputeAction(disp.id, 'DISPUTE_REJECTED')}
                          className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600/40 border border-rose-500/30 text-xs font-semibold"
                        >
                          Reject Claim
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: IMMUTABLE AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Immutable Administrative Audit Log</h3>
                <p className="text-xs text-slate-400">Cryptographically verifiable sequence of all admin state mutations.</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SHA-256 Ledger Synchronized</span>
              </div>
            </div>

            <div className="space-y-2">
              {auditLogs.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 font-bold">{entry.action}</span>
                    <span className="text-slate-300">{entry.target}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                    <span>{entry.timestamp}</span>
                    <span className="text-slate-600">{entry.hash}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
