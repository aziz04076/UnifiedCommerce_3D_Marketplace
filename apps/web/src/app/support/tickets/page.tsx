'use client';

import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Paperclip,
  ChevronRight,
  ShieldAlert,
  MessageSquare,
  Bot,
  User,
} from 'lucide-react';
import { Navbar, Footer, Badge, Button } from '@unified-commerce/ui';
import { getAllCategories } from '@unified-commerce/database';
import { useCart } from '../../../context/CartContext';
import Link from 'next/link';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL_P0';
  status: 'OPEN' | 'IN_PROGRESS' | 'ESCALATED_TO_ENGINEERING' | 'RESOLVED';
  orderReference?: string;
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  messages: {
    sender: 'user' | 'support' | 'ai';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tick-1',
    ticketNumber: 'TICK-2026-8812',
    category: 'Hardware Telemetry',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    orderReference: 'UC-2026-8942X',
    subject: 'LiDAR Gyro Calibration drifting 1.4° in heavy wind gusts',
    description: 'During autonomous drone flight in coastal airspace, the telemetry gyro shows minor yaw drift on firmware 4.2.1.',
    createdAt: '2026-09-27T14:30:00Z',
    updatedAt: '2026-09-27T16:45:00Z',
    messages: [
      {
        sender: 'user',
        senderName: 'Alex Vance',
        text: 'During autonomous drone flight in coastal airspace, the telemetry gyro shows minor yaw drift on firmware 4.2.1. Requesting recalibration profile.',
        timestamp: 'Sep 27, 2:30 PM',
      },
      {
        sender: 'support',
        senderName: 'Elena Rostova (Lead Flight Engineer)',
        text: 'Telemetry packet received. We observed the coastal wind gust compensation damping profile. We have pushed an over-the-air (OTA) hotfix calibration patch v4.2.2-patch1 to your drone UUID.',
        timestamp: 'Sep 27, 4:45 PM',
      },
    ],
  },
  {
    id: 'tick-2',
    ticketNumber: 'TICK-2026-7519',
    category: 'Payment & Escrow',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    orderReference: 'UC-2026-4401A',
    subject: '3D Secure SCA verification token confirmation',
    description: 'Requested confirmation that smart contract escrow release matches bank-side clearing ledger.',
    createdAt: '2026-09-25T11:00:00Z',
    updatedAt: '2026-09-25T11:40:00Z',
    messages: [
      {
        sender: 'user',
        senderName: 'Alex Vance',
        text: 'Requested confirmation that smart contract escrow release matches bank-side clearing ledger.',
        timestamp: 'Sep 25, 11:00 AM',
      },
      {
        sender: 'support',
        senderName: 'Unified Escrow Clearing Hub',
        text: 'Confirmed. Transaction hash TX-8810294-AES verified against Visa Signature rail. Escrow settled with zero discrepancy.',
        timestamp: 'Sep 25, 11:40 AM',
      },
    ],
  },
];

export default function SupportTicketsPage() {
  const categories = getAllCategories();
  const { cartItems, wishlistIds, orders } = useCart();

  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(INITIAL_TICKETS[0].id);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New ticket form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Hardware Telemetry');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL_P0'>('MEDIUM');
  const [orderRef, setOrderRef] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  // Reply input
  const [replyText, setReplyText] = useState('');

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newTicket: SupportTicket = {
      id: `tick-${Date.now()}`,
      ticketNumber: `TICK-2026-${randomNum}`,
      category,
      priority,
      status: 'OPEN',
      orderReference: orderRef || undefined,
      subject,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          sender: 'user',
          senderName: 'Alex Vance',
          text: description,
          timestamp: 'Just now',
        },
        {
          sender: 'ai',
          senderName: 'ARIA Telemetry Co-Pilot',
          text: 'Ticket registered into the Tier-3 Escalation Queue. Automated telemetry diagnostics are running on your hardware logs. An assigned systems engineer will update this thread shortly.',
          timestamp: 'Just now',
        },
      ],
    };

    setTickets([newTicket, ...tickets]);
    setSelectedTicketId(newTicket.id);
    setIsCreatingNew(false);
    setSubject('');
    setDescription('');
    setAttachmentName(null);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const updatedTickets = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          updatedAt: new Date().toISOString(),
          messages: [
            ...t.messages,
            {
              sender: 'user' as const,
              senderName: 'Alex Vance',
              text: replyText,
              timestamp: 'Just now',
            },
          ],
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    setReplyText('');
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
              <Badge variant="cyan" size="sm" withDot>PRIORITY CONCIERGE</Badge>
              <span className="text-xs font-mono text-slate-400">
                Tier-3 Engineering & Dispute Escalation
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Support & Diagnostics Ticketing
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/faq"
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Browse FAQ Docs
            </Link>
            <Button
              onClick={() => setIsCreatingNew((prev) => !prev)}
              variant={isCreatingNew ? 'secondary' : 'primary'}
              size="md"
              className="flex items-center gap-1.5"
            >
              {isCreatingNew ? 'View Existing Tickets' : <><Plus className="w-4 h-4" /> Open New Ticket</>}
            </Button>
          </div>
        </div>

        {isCreatingNew ? (
          /* CREATE TICKET FORM */
          <div className="max-w-2xl mx-auto py-10">
            <div className="p-8 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Open Diagnostic Support Ticket</h2>
                <p className="text-xs text-slate-400 mt-1">
                  All tickets are cryptographically logged and routed directly to verified engineers and escrow arbiters.
                </p>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of hardware or transaction issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Hardware Telemetry">Hardware Telemetry & Sensor Drift</option>
                      <option value="Payment & Escrow">Payment & Escrow Release</option>
                      <option value="Drone Delivery Delay">Suborbital Drone Delivery</option>
                      <option value="Firmware Compatibility">Firmware & WebXR Calibration</option>
                      <option value="General RMA">30-Day Zero-Friction RMA Return</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Urgency Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="LOW">Low (Inquiry within 24h)</option>
                      <option value="MEDIUM">Medium (Response within 4h)</option>
                      <option value="HIGH">High (Engineering within 1h)</option>
                      <option value="CRITICAL_P0">Critical P0 (Active flight hazard / Security)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Related Order Reference (Optional)
                  </label>
                  <select
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="">No specific order attached</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.orderNumber}>
                        {o.orderNumber} ({o.items[0]?.productName || 'Order'}) - ${o.total}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Detailed Telemetry & Symptom Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide diagnostic codes, steps to reproduce, or transaction hashes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Telemetry / Crash Log Attachment
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAttachmentName('telemetry_dump_09282026.log')}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/50 text-xs text-slate-300 flex items-center gap-2 transition-colors"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{attachmentName || 'Attach System Telemetry Log'}</span>
                    </button>
                    {attachmentName && (
                      <span className="text-xs font-mono text-emerald-400">Attached (14.2 KB)</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    variant="ghost"
                    size="md"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md">
                    <span>Submit to Engineering Queue</span>
                    <Send className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* TICKETS TWO-COLUMN DASHBOARD */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8">
            {/* Left Column: Tickets Master List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 pb-1">
                <span>Active Cases ({tickets.length})</span>
                <span>Response Status</span>
              </div>

              {tickets.map((t) => {
                const isSelected = t.id === selectedTicketId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-colors select-none ${
                      isSelected
                        ? 'border-cyan-500/50 bg-slate-900/90 shadow-neon-cyan'
                        : 'border-white/10 bg-slate-950/60 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {t.ticketNumber}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          t.status === 'RESOLVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}
                      >
                        {t.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                      {t.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-white/5">
                      <span>{t.category}</span>
                      <span className="font-mono text-slate-500">
                        {new Date(t.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Ticket Conversation & Resolution Thread (7 cols) */}
            <div className="lg:col-span-7">
              {selectedTicket ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col min-h-[500px]">
                  {/* Ticket Header */}
                  <div className="pb-4 border-b border-white/10 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold font-mono text-cyan-400">
                          {selectedTicket.ticketNumber}
                        </span>
                        <Badge
                          variant={selectedTicket.priority === 'CRITICAL_P0' ? 'rose' : 'cyan'}
                          size="sm"
                        >
                          {selectedTicket.priority}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        Opened {new Date(selectedTicket.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {selectedTicket.subject}
                    </h3>

                    {selectedTicket.orderReference && (
                      <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Order Reference: {selectedTicket.orderReference}</span>
                      </div>
                    )}
                  </div>

                  {/* Messages Stream */}
                  <div className="flex-1 py-6 space-y-4 overflow-y-auto max-h-[380px] pr-2">
                    {selectedTicket.messages.map((m, idx) => {
                      const isUser = m.sender === 'user';
                      const isAi = m.sender === 'ai';

                      return (
                        <div
                          key={idx}
                          className={`flex gap-3 text-xs ${
                            isUser ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {!isUser && (
                            <div className="w-7 h-7 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
                              {isAi ? <Bot className="w-4 h-4" /> : <LifeBuoy className="w-4 h-4" />}
                            </div>
                          )}

                          <div
                            className={`max-w-md p-4 rounded-2xl ${
                              isUser
                                ? 'bg-cyan-600/20 border border-cyan-500/30 text-slate-200'
                                : isAi
                                ? 'bg-indigo-950/40 border border-indigo-500/30 text-slate-200'
                                : 'bg-slate-900/90 border border-white/10 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4 mb-1 text-[10px]">
                              <span className="font-bold text-white">{m.senderName}</span>
                              <span className="text-slate-500">{m.timestamp}</span>
                            </div>
                            <p className="leading-relaxed">{m.text}</p>
                          </div>

                          {isUser && (
                            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0 text-cyan-300">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Bar */}
                  <form onSubmit={handleSendReply} className="pt-4 border-t border-white/10 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add diagnostic notes or reply to engineering..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <Button type="submit" variant="primary" size="md" disabled={!replyText.trim()}>
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-white/10 text-slate-400">
                  Select a ticket on the left to inspect telemetry logs and thread history.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
