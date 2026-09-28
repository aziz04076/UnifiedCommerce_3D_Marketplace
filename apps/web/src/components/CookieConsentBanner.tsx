'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export const CookieConsentBanner: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('unified_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (type: 'all' | 'essential') => {
    localStorage.setItem('unified_cookie_consent', type);
    setShow(false);
  };

  if (!show) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 inset-x-4 sm:left-6 sm:right-auto sm:max-w-md z-50 rounded-2xl bg-slate-950/95 border border-white/10 p-5 shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">Privacy & Telemetry Consent</h2>
        </div>
        <button
          onClick={() => handleAccept('essential')}
          aria-label="Close cookie consent"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
        We utilize encrypted telemetry to personalize hardware recommendations and protect checkout integrity under strict GDPR and CCPA compliance.
      </p>
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => handleAccept('all')}
          className="px-3.5 py-1.5 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold hover:bg-cyan-300 transition-colors"
        >
          Accept All
        </button>
        <button
          onClick={() => handleAccept('essential')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 text-xs font-medium hover:text-white hover:border-white/20 transition-colors"
        >
          Essential Only
        </button>
        <a
          href="/privacy"
          className="text-[11px] text-slate-400 hover:text-cyan-300 ml-auto underline transition-colors"
        >
          Privacy Policy
        </a>
      </div>
    </aside>
  );
};
