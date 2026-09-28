'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bot, X, Send, Sparkles, Loader2, ShoppingCart, ExternalLink,
  RotateCcw, Brain, CheckCircle2, SlidersHorizontal, ArrowRight,
  Camera, Zap, Tag, ChevronDown, ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { MOCK_PRODUCTS } from '@unified-commerce/database';
import { VisualSearchModal } from './VisualSearchModal';
import { AgentToolCall } from '@unified-commerce/types';

interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  toolCalls?: AgentToolCall[];
  suggestedAction?: {
    type: 'navigate' | 'add_to_cart' | 'filter' | 'inspect_3d';
    payload: Record<string, any>;
  };
  latency_ms?: number;
  source?: string;
}

const STARTERS = [
  'Compare Neural Band and Elysium Planar',
  'Find drones under ₹50,000',
  'Add AetherApex Neural Band to my cart',
  'What discounts or coupon codes are active?',
  'Escalate to a human support specialist',
];

function formatMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.*?)\n/g, '<h4 class="font-bold text-cyan-300 mt-2 mb-1">$1</h4>')
    .replace(/\n•/g, '<br/>•')
    .replace(/\n/g, '<br/>');
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [expandedThoughtIds, setExpandedThoughtIds] = useState<Record<string, boolean>>({});
  const [cartSuccessNotice, setCartSuccessNotice] = useState<string | null>(null);
  const [isHumanMode, setIsHumanMode] = useState(false);

  const { addToCart } = useCart();

  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Greetings! I'm **ARIA 2.0** — your autonomous agentic shopping co-pilot. I can **compare hardware telemetry**, **apply catalog filters**, **execute cart additions**, and **evaluate component trade-offs**. How can I engineer your loadout today? (You can also ask to **speak to a human specialist** at any time).",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  function toggleThought(msgId: string) {
    setExpandedThoughtIds(prev => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  }

  function handleExecuteAddToCart(productId: string) {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (product) {
      addToCart(product, 1);
      setCartSuccessNotice(`Added ${product.name} to shopping bag!`);
      setTimeout(() => setCartSuccessNotice(null), 3500);
    }
  }

  function handleEscalateToHuman() {
    setIsHumanMode(true);
    const humanMsg: AgentMessage = {
      id: `esc-${Date.now()}`,
      role: 'assistant',
      content:
        "Connecting you to **Elena Rostova** (Principal Systems Engineer, Unified Support Ops)...<br/><br/>⚡ **Connected.** Elena: *'Hello! I have your order and hardware telemetry live on my diagnostic console. How can I assist you with custom calibration, escrow adjustments, or warranty exchanges today?'*",
      source: 'Human Specialist Queue',
    };
    setMessages(prev => [...prev, humanMsg]);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setInput('');

    const userMsg: AgentMessage = { id: `u-${Date.now()}`, role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const lower = text.toLowerCase();
    const wantsHuman = lower.includes('human') || lower.includes('person') || lower.includes('agent') || lower.includes('escalat') || lower.includes('support rep');

    if (wantsHuman && !isHumanMode) {
      setTimeout(() => {
        handleEscalateToHuman();
        setLoading(false);
      }, 700);
      return;
    }

    if (isHumanMode) {
      setTimeout(() => {
        const humanResponses = [
          "Elena: *'Understood. I am reviewing the device logs and escrow contract on my workstation. I can initiate an immediate RMA replacement or push a custom firmware profile if needed.'*",
          "Elena: *'Telemetry verified. Your order is secured under zero-trust escrow. If you want me to authorize a 10% artisan goodwill credit or schedule drone pickup, let me know.'*",
          "Elena: *'I've attached ticket TICK-2026-9901 to your account. Our lab team will monitor this hardware sensor reading closely.'*",
        ];
        const chosen = humanResponses[Math.floor(Math.random() * humanResponses.length)];
        setMessages(prev => [
          ...prev,
          {
            id: `h-${Date.now()}`,
            role: 'assistant',
            content: chosen,
            source: 'Elena Rostova (Live Specialist)',
          },
        ]);
        setLoading(false);
      }, 900);
      return;
    }

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
        }),
      });
      const data = await res.json();

      const assistantMsg: AgentMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.finalResponse || 'Acknowledged. Telemetry processing complete.',
        thought: data.thought,
        toolCalls: data.toolCalls,
        suggestedAction: data.suggestedAction,
        latency_ms: data.latency_ms,
        source: data.source,
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If the agent determined to add to cart, trigger it automatically!
      if (data.suggestedAction?.type === 'add_to_cart') {
        const pId = data.suggestedAction.payload.productId;
        handleExecuteAddToCart(pId);
      }

      if (!open) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Agent connection intermittent. Operating on local telemetry fallback.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setIsHumanMode(false);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm **ARIA 2.0** — your autonomous agentic assistant. Ask me to compare products, execute cart actions, or find gear within your budget! You can also request human specialist escalation at any time.",
      },
    ]);
  }

  return (
    <>
      {/* Toast Notice */}
      {cartSuccessNotice && (
        <div className="fixed bottom-24 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/90 text-white font-bold text-xs shadow-2xl backdrop-blur-md animate-fadeInUp">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{cartSuccessNotice}</span>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-colors ${
          open
            ? 'bg-slate-900 border border-cyan-500/40'
            : 'bg-gradient-to-br from-cyan-500 via-indigo-600 to-fuchsia-600 shadow-cyan-500/20'
        }`}
        aria-label="Open ARIA Agent"
      >
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <>
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* Agent Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[410px] max-w-[calc(100vw-32px)] h-[620px] max-h-[calc(100vh-120px)] flex flex-col rounded-3xl bg-[#07090E] border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-md ${
                isHumanMode
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/30'
                  : 'bg-gradient-to-br from-cyan-400 to-indigo-600 shadow-cyan-500/30'
              }`}>
                {isHumanMode ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-black text-white tracking-wide">
                    {isHumanMode ? 'Elena Rostova' : 'ARIA 2.0'}
                  </p>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${
                    isHumanMode
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                  }`}>
                    {isHumanMode ? 'HUMAN SPECIALIST' : 'AGENTIC AI'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {isHumanMode ? 'Principal Systems Engineer • Response < 30s' : 'Autonomous Reasoning & Tool Execution'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Human Escalation Toggle Button */}
              {!isHumanMode ? (
                <button
                  onClick={handleEscalateToHuman}
                  className="px-2 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1 transition-colors"
                  title="Escalate to Human Specialist"
                >
                  <span>Talk to Human</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsHumanMode(false)}
                  className="px-2 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1 transition-colors"
                  title="Switch back to ARIA AI"
                >
                  <span>ARIA AI</span>
                </button>
              )}

              {/* Visual Search Launcher */}
              <button
                onClick={() => setIsVisualSearchOpen(true)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-colors"
                title="Open Visual Search"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={reset}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Reset session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] ${m.role === 'user' ? 'order-first' : ''}`}>
                  {/* Chain of Thought Collapsible Drawer (Assistant only) */}
                  {m.thought && (
                    <div className="mb-2 rounded-xl bg-slate-900/60 border border-white/5 overflow-hidden">
                      <button
                        onClick={() => toggleThought(m.id)}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-mono text-cyan-400 hover:bg-white/5 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Brain className="w-3 h-3 text-cyan-300" />
                          <span>Chain-of-Thought Reasoning</span>
                        </span>
                        {expandedThoughtIds[m.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      {expandedThoughtIds[m.id] && (
                        <div className="px-3 py-2 border-t border-white/5 text-[11px] text-slate-300 font-mono leading-relaxed bg-black/40">
                          {m.thought}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tool Calls Execution Badges */}
                  {m.toolCalls && m.toolCalls.length > 0 && (
                    <div className="mb-2 space-y-1.5">
                      {m.toolCalls.map(tc => (
                        <div
                          key={tc.id}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-[10px]"
                        >
                          <span className="flex items-center gap-1.5 text-cyan-300 font-mono font-medium">
                            <Zap className="w-3 h-3 text-cyan-400" />
                            Tool: {tc.name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            Executed ✓
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Main Message Bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-br-sm shadow-md'
                        : 'bg-slate-900/80 text-slate-200 rounded-bl-sm border border-white/10'
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(m.content) }}
                  />

                  {/* Suggested Action Quick Execution */}
                  {m.suggestedAction && m.suggestedAction.type === 'add_to_cart' && (
                    <div className="mt-2">
                      <button
                        onClick={() => handleExecuteAddToCart(m.suggestedAction!.payload.productId)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Confirm & Add {m.suggestedAction.payload.productName} (₹{m.suggestedAction.payload.price?.toLocaleString('en-IN')})
                      </button>
                    </div>
                  )}

                  {/* Latency & Telemetry */}
                  {m.latency_ms !== undefined && (
                    <p className="text-[9px] text-slate-500 font-mono mt-1 px-1 flex items-center justify-between">
                      <span>{m.source === 'ai-service' ? '🤖 LangGraph Agent' : '⚡ Local Agent Node'}</span>
                      <span>{m.latency_ms}ms</span>
                    </p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-slate-900/80 border border-white/10 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span className="text-xs text-slate-300 font-mono">Agent reasoning & tool evaluation...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {STARTERS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] hover:bg-cyan-500/20 transition-all truncate max-w-[280px]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 bg-slate-950/80 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-2 bg-slate-900/80 rounded-2xl border border-white/10 focus-within:border-cyan-500/50 transition-all px-3 py-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask ARIA to compare, filter, or buy..."
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-950 font-bold transition-all shrink-0"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 text-slate-950 animate-spin" /> : <Send className="w-3.5 h-3.5 text-slate-950" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Search Modal */}
      <VisualSearchModal
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
      />
    </>
  );
}
