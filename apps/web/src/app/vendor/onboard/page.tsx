'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Building2, FileText, CreditCard, CheckCircle, Upload, AlertCircle,
  Loader2, Shield, ChevronRight, X, Eye, Store, ArrowLeft, Sparkles
} from 'lucide-react';

/* ───────────────── Types ───────────────── */
interface FormData {
  // Step 1 — Business Info
  businessName: string;
  businessType: string;
  gstin: string;
  pan: string;
  website: string;
  phone: string;
  email: string;
  category: string;
  description: string;
  // Step 2 — Documents
  regCertFile: string | null;
  gstCertFile: string | null;
  idProofFile: string | null;
  addressProofFile: string | null;
  // Step 3 — Bank / Payout
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  payoutMode: 'fiat' | 'crypto';
  cryptoAddress: string;
}

const STEPS = [
  { id: 1, label: 'Business Info', icon: Building2 },
  { id: 2, label: 'Documents', icon: FileText },
  { id: 3, label: 'Payout Setup', icon: CreditCard },
  { id: 4, label: 'Review', icon: Eye },
];

const BUSINESS_TYPES = ['Sole Proprietor', 'Partnership', 'LLP', 'Private Limited', 'OPC'];
const CATEGORIES = ['Electronics', 'Fashion & Apparel', 'Home & Living', 'Sports & Fitness', 'Food & Gourmet', 'Beauty & Wellness', 'Automotive', 'Books & Stationery'];

const DOC_FIELDS = [
  { key: 'regCertFile', label: 'Business Registration Certificate', required: true },
  { key: 'gstCertFile', label: 'GST Registration Certificate', required: true },
  { key: 'idProofFile', label: 'Director / Owner ID Proof (Aadhaar / Passport)', required: true },
  { key: 'addressProofFile', label: 'Business Address Proof', required: false },
] as const;

function GstinValidation({ gstin }: { gstin: string }) {
  if (!gstin) return null;
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const valid = regex.test(gstin);
  return valid ? (
    <span className="flex items-center gap-1 text-emerald-400 text-xs mt-1">
      <CheckCircle className="w-3 h-3" /> Valid GSTIN format
    </span>
  ) : (
    <span className="flex items-center gap-1 text-amber-400 text-xs mt-1">
      <AlertCircle className="w-3 h-3" /> GSTIN must match 15-character GST format
    </span>
  );
}

function FileDropZone({ label, required, onUpload, uploaded }: {
  label: string; required: boolean;
  onUpload: (name: string) => void;
  uploaded: string | null;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file.name);
  }

  return (
    <div
      className={`rounded-xl border-2 border-dashed p-5 transition-all cursor-pointer group ${
        dragging ? 'border-violet-500 bg-violet-500/10' :
        uploaded ? 'border-emerald-500/50 bg-emerald-500/5' :
        'border-white/10 hover:border-violet-500/40 hover:bg-violet-500/5'
      }`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => ref.current?.click()}
    >
      <input ref={ref} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
        onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f.name); }} />
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          uploaded ? 'bg-emerald-500/20' : 'bg-violet-500/10 group-hover:bg-violet-500/20'}`}>
          {uploaded ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Upload className="w-4 h-4 text-violet-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-300 truncate">
            {label} {required && <span className="text-red-400">*</span>}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {uploaded ? uploaded : 'PDF, JPG, PNG · Max 10 MB · Click or drag to upload'}
          </p>
        </div>
        {uploaded && (
          <button onClick={e => { e.stopPropagation(); onUpload(''); }} className="text-slate-500 hover:text-red-400 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function VendorOnboardPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | null>(null);

  const [form, setForm] = useState<FormData>({
    businessName: '', businessType: '', gstin: '', pan: '', website: '', phone: '', email: '',
    category: '', description: '',
    regCertFile: null, gstCertFile: null, idProofFile: null, addressProofFile: null,
    accountHolder: '', accountNumber: '', ifsc: '', bankName: '',
    payoutMode: 'fiat', cryptoAddress: '',
  });

  function set(k: keyof FormData, v: string | null) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function canProceed() {
    if (step === 1) return !!(form.businessName && form.businessType && form.gstin && form.email && form.phone && form.category);
    if (step === 2) return !!(form.regCertFile && form.gstCertFile && form.idProofFile);
    if (step === 3) return form.payoutMode === 'fiat'
      ? !!(form.accountHolder && form.accountNumber && form.ifsc)
      : !!form.cryptoAddress;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitted(true);
    // Simulate admin review pipeline
    await new Promise(r => setTimeout(r, 2500));
    setApprovalStatus('approved');
    setSubmitting(false);
  }

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 focus:bg-slate-800/80 transition-all';
  const labelCls = 'block text-xs font-medium text-slate-400 mb-1.5';

  /* ── Success / Approval screen ── */
  if (submitted) {
    return (
      <main className="min-h-screen bg-[#030712] flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          {submitting ? (
            <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-12">
              <Loader2 className="w-12 h-12 text-violet-400 animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-3">Processing Your Application</h2>
              <div className="space-y-3 text-left mt-8">
                {['Validating GSTIN with NIC database...', 'Running AML/KYC document checks...', 'Cross-referencing PAN with Income Tax portal...', 'Setting up vendor wallet...'].map((t, i) => (
                  <div key={t} className="flex items-center gap-3 text-sm text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400 shrink-0" style={{ animationDelay: `${i * 0.2}s` }} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          ) : approvalStatus === 'approved' ? (
            <div className="rounded-3xl bg-slate-900/60 border border-emerald-500/20 p-12">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">KYC Approved! 🎉</h2>
              <p className="text-slate-400 text-sm mb-2">
                <span className="text-emerald-400 font-semibold">{form.businessName || 'Your store'}</span> is now live on UnifiedCommerce.
              </p>
              <p className="text-slate-500 text-xs mb-8">Confirmation sent to {form.email || 'your email'}</p>
              <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 mb-8 text-left space-y-2">
                {['Vendor dashboard access granted', 'Payout wallet initialised (0.00)', 'Commission rate: 8% standard tier', 'First 30 days: 0% platform fee promo'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <Link
                href="/vendor/dashboard"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-lg shadow-violet-500/30 group"
              >
                <Store className="w-4 h-4" />
                Open My Dashboard
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/15 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 pt-28">

        {/* Back link */}
        <Link href="/vendor" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs mb-8 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Vendor Portal
        </Link>

        {/* Header */}
        <div className="mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-mono mb-4">
            <Sparkles className="w-3 h-3" />
            VENDOR KYC ONBOARDING
          </span>
          <h1 className="text-3xl font-black text-white">Join as a Vendor</h1>
          <p className="text-slate-400 text-sm mt-2">Complete the 4-step verification to start selling.</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map(({ id, label, icon: Icon }, i) => (
            <div key={id} className="flex items-center flex-1">
              <div className="flex items-center gap-2 shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > id ? 'bg-emerald-500 text-white' :
                  step === id ? 'bg-violet-600 text-white ring-4 ring-violet-500/20' :
                  'bg-slate-800 text-slate-500'
                }`}>
                  {step > id ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className={`hidden sm:block text-xs font-medium transition-colors ${
                  step === id ? 'text-violet-300' : step > id ? 'text-emerald-400' : 'text-slate-500'
                }`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 transition-all ${step > id ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="rounded-3xl bg-slate-900/60 border border-white/8 p-8 backdrop-blur-sm">

          {/* ── Step 1: Business Info ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-400" />
                Business Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Business Name <span className="text-red-400">*</span></label>
                  <input className={inputCls} placeholder="e.g. NeoTech Gadgets Pvt Ltd"
                    value={form.businessName} onChange={e => set('businessName', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Business Type <span className="text-red-400">*</span></label>
                  <select className={inputCls} value={form.businessType}
                    onChange={e => set('businessType', e.target.value)}>
                    <option value="">Select type...</option>
                    {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>GSTIN <span className="text-red-400">*</span></label>
                  <input className={inputCls} placeholder="22AAAAA0000A1Z5" maxLength={15}
                    value={form.gstin} onChange={e => set('gstin', e.target.value.toUpperCase())} />
                  <GstinValidation gstin={form.gstin} />
                </div>
                <div>
                  <label className={labelCls}>PAN</label>
                  <input className={inputCls} placeholder="AAAAA0000A" maxLength={10}
                    value={form.pan} onChange={e => set('pan', e.target.value.toUpperCase())} />
                </div>
                <div>
                  <label className={labelCls}>Contact Email <span className="text-red-400">*</span></label>
                  <input className={inputCls} type="email" placeholder="accounts@yourbrand.com"
                    value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Phone <span className="text-red-400">*</span></label>
                  <input className={inputCls} placeholder="+91 98765 43210"
                    value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Product Category <span className="text-red-400">*</span></label>
                  <select className={inputCls} value={form.category}
                    onChange={e => set('category', e.target.value)}>
                    <option value="">Select primary category...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Website (optional)</label>
                  <input className={inputCls} placeholder="https://yourbrand.com"
                    value={form.website} onChange={e => set('website', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Brand Description</label>
                <textarea className={`${inputCls} resize-none h-20`} placeholder="Tell us what you sell and what makes your brand unique..."
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
            </div>
          )}

          {/* ── Step 2: Documents ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-400" />
                  Document Upload
                </h2>
                <span className="text-xs text-slate-500 bg-slate-800/60 px-3 py-1 rounded-full">
                  AI-verified in &lt; 2 min
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                All documents are encrypted with AES-256 and processed by our AI KYC engine. They are never shared with third parties without consent.
              </p>
              <div className="space-y-3">
                {DOC_FIELDS.map(({ key, label, required }) => (
                  <FileDropZone
                    key={key}
                    label={label}
                    required={required}
                    uploaded={form[key]}
                    onUpload={name => set(key, name || null)}
                  />
                ))}
              </div>
              <div className="rounded-xl bg-violet-950/30 border border-violet-500/20 p-4 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="text-violet-300 font-semibold">AI Document Extraction</span> — Our engine automatically reads business name, GSTIN, registration date, and director details from uploaded PDFs. Manual review is only triggered for edge cases.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 3: Bank / Payout ── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-violet-400" />
                Payout Setup
              </h2>

              {/* Payout mode toggle */}
              <div className="flex gap-3">
                {(['fiat', 'crypto'] as const).map(mode => (
                  <button key={mode} onClick={() => set('payoutMode', mode)}
                    className={`flex-1 py-3 rounded-xl text-xs font-semibold border transition-all ${
                      form.payoutMode === mode
                        ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                        : 'bg-slate-800/40 border-white/10 text-slate-400 hover:border-violet-500/20'
                    }`}>
                    {mode === 'fiat' ? '🏦 Bank Transfer (NEFT/SWIFT)' : '₿ Crypto (USDC / ETH)'}
                  </button>
                ))}
              </div>

              {form.payoutMode === 'fiat' ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Account Holder Name <span className="text-red-400">*</span></label>
                      <input className={inputCls} placeholder="As per bank records"
                        value={form.accountHolder} onChange={e => set('accountHolder', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Bank Name</label>
                      <input className={inputCls} placeholder="HDFC / ICICI / SBI..."
                        value={form.bankName} onChange={e => set('bankName', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Account Number <span className="text-red-400">*</span></label>
                      <input className={inputCls} type="password" placeholder="••••••••••••"
                        value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>IFSC Code <span className="text-red-400">*</span></label>
                      <input className={inputCls} placeholder="HDFC0001234" maxLength={11}
                        value={form.ifsc} onChange={e => set('ifsc', e.target.value.toUpperCase())} />
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-800/40 border border-white/5 p-4">
                    <p className="text-xs text-slate-400">Payout schedule: <span className="text-white font-medium">D+1</span> (settled next business day after customer delivery confirmation)</p>
                    <p className="text-xs text-slate-500 mt-1">Minimum payout threshold: ₹500 · No transfer fee for amounts above ₹10,000</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Wallet Address (ERC-20 / Solana) <span className="text-red-400">*</span></label>
                    <input className={inputCls} placeholder="0x1234...abcd or SOL address"
                      value={form.cryptoAddress} onChange={e => set('cryptoAddress', e.target.value)} />
                  </div>
                  <div className="rounded-xl bg-slate-800/40 border border-white/5 p-4 space-y-1.5">
                    <p className="text-xs text-slate-400">Supported tokens: <span className="text-white font-medium">USDC, ETH, SOL, MATIC</span></p>
                    <p className="text-xs text-slate-500">Payouts converted at mid-market rate at time of settlement.</p>
                    <p className="text-xs text-slate-500">Gas fees are absorbed by UnifiedCommerce for amounts above \$100.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Review ── */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Eye className="w-4 h-4 text-violet-400" />
                Review & Submit
              </h2>

              {/* Summary blocks */}
              {[
                {
                  title: 'Business Details',
                  rows: [
                    ['Business Name', form.businessName],
                    ['Type', form.businessType],
                    ['GSTIN', form.gstin],
                    ['Category', form.category],
                    ['Email', form.email],
                    ['Phone', form.phone],
                  ],
                },
                {
                  title: 'Documents',
                  rows: DOC_FIELDS.map(d => [d.label, form[d.key] || '—']),
                },
                {
                  title: 'Payout',
                  rows: form.payoutMode === 'fiat'
                    ? [['Mode', 'Bank Transfer'], ['Account Holder', form.accountHolder], ['IFSC', form.ifsc], ['Bank', form.bankName || '—']]
                    : [['Mode', 'Crypto'], ['Wallet', form.cryptoAddress]],
                },
              ].map(({ title, rows }) => (
                <div key={title} className="rounded-2xl bg-slate-800/40 border border-white/5 p-5">
                  <h3 className="text-xs font-semibold text-violet-300 mb-3">{title}</h3>
                  <div className="space-y-2">
                    {rows.map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-slate-400">{k}</span>
                        <span className="text-white font-medium max-w-[200px] truncate text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="rounded-xl bg-amber-950/20 border border-amber-500/20 p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  By submitting, you confirm all information is accurate and agree to the{' '}
                  <span className="text-violet-300 underline cursor-pointer">Vendor Agreement</span> and{' '}
                  <span className="text-violet-300 underline cursor-pointer">UnifiedCommerce Marketplace Policies</span>.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            <button
              disabled={step === 1}
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-sm text-slate-300 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {step < 4 ? (
              <button
                disabled={!canProceed()}
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                <Shield className="w-4 h-4" />
                Submit Application
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
