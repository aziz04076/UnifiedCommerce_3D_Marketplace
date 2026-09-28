/**
 * Honest trust indicators — only real, verifiable claims.
 * No fake badges, no "100% secure" text, no fake review counts.
 */
export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center gap-3 py-3">
      {/* HTTPS indicator */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <span className="text-emerald-400">🔒</span>
        <span>Secure HTTPS connection</span>
      </div>

      {/* Razorpay */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <span>💳</span>
        <span>Payments by Razorpay</span>
      </div>

      {/* No card storage */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <span>🛡️</span>
        <span>Card details never stored</span>
      </div>
    </div>
  );
}

/** Inline trust note for checkout page */
export function CheckoutTrustNote() {
  return (
    <p className="text-xs text-slate-500 mt-2">
      Your card details are entered directly on Razorpay's secure page — they never reach our servers.
      Payments are processed by{' '}
      <a
        href="https://razorpay.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 cursor-pointer"
      >
        Razorpay
      </a>
      .
    </p>
  );
}
