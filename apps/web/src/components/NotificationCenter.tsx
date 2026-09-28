'use client';

import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Package,
  TrendingDown,
  ShieldCheck,
  Tag,
  ChevronRight
} from 'lucide-react';
import { cn } from '@unified-commerce/ui';

export interface AppNotification {
  id: string;
  category: 'ORDERS' | 'PRICE_DROPS' | 'SECURITY' | 'PROMOTIONS';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    category: 'ORDERS',
    title: 'Suborbital Transit Launch Initiated',
    message: 'AWB-SUB-9824-JP has entered orbital velocity vector at Mach 6.4. Telemetry tracking active.',
    time: '12m ago',
    read: false,
    actionUrl: '/orders/ord-seed-001',
  },
  {
    id: 'notif-2',
    category: 'PRICE_DROPS',
    title: 'Watchlist Price Drop: -18% on Neural Band X1',
    message: 'AetherApex released a flash laboratory rebate on your saved Aether Apex Neural Band.',
    time: '1h ago',
    read: false,
    actionUrl: '/products/aether-apex-neural-band-x1',
  },
  {
    id: 'notif-3',
    category: 'SECURITY',
    title: 'Ed25519 Cryptographic Escrow Signed',
    message: 'Your recent order payout escrow ledger was committed to Polygon blockchain node.',
    time: '3h ago',
    read: false,
    actionUrl: '/orders',
  },
  {
    id: 'notif-4',
    category: 'PROMOTIONS',
    title: 'VIP Gold Tier Unlocked',
    message: 'You qualify for automatic 5% discounts across the entire neural catalog with code CYBER2026.',
    time: '1d ago',
    read: true,
    actionUrl: '/checkout',
  },
];

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'ALL' | 'ORDERS' | 'PRICE_DROPS' | 'SECURITY' | 'PROMOTIONS'>('ALL');

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    onUnreadCountChange?.(0);
  };

  const handleMarkOneRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    onUnreadCountChange?.(updated.filter((n) => !n.read).length);
  };

  const handleDelete = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    onUnreadCountChange?.(updated.filter((n) => !n.read).length);
  };

  const filtered = filter === 'ALL'
    ? notifications
    : notifications.filter((n) => n.category === filter);

  const getCategoryIcon = (category: AppNotification['category']) => {
    switch (category) {
      case 'ORDERS':
        return <Package className="w-4 h-4 text-cyan-400" />;
      case 'PRICE_DROPS':
        return <TrendingDown className="w-4 h-4 text-rose-400" />;
      case 'SECURITY':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      case 'PROMOTIONS':
        return <Tag className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden mt-12 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Notification Center</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">Real-time alerts & telemetry logs</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                title="Mark all as read"
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/70 border-b border-white/5 overflow-x-auto text-[11px] font-mono">
          {(['ALL', 'ORDERS', 'PRICE_DROPS', 'SECURITY', 'PROMOTIONS'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap',
                filter === cat
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-mono">
              No notifications in this category.
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkOneRead(n.id)}
                className={cn(
                  'p-3.5 rounded-2xl border transition-colors relative cursor-pointer group',
                  n.read
                    ? 'bg-slate-950/50 border-white/5 text-slate-400'
                    : 'bg-slate-950 border-cyan-500/30 text-white shadow-sm'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-white/10 shrink-0">
                    {getCategoryIcon(n.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate">{n.title}</span>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                    {n.actionUrl && (
                      <a
                        href={n.actionUrl}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 mt-2 transition-colors"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(n.id);
                    }}
                    title="Delete notification"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
