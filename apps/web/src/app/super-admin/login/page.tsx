'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, Smartphone, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'LOGIN' | 'FIRST_LOGIN_SETUP' | '2FA_CHALLENGE'>('LOGIN');

  // Setup state (for one-time password reset + 2FA activation)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [totpCode, setTotpCode] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Step 1: Standard Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      if (data.mustChangePassword) {
        // Fetch 2FA secret for enrollment
        const setupRes = await fetch('/api/auth/setup-admin');
        const setupData = await setupRes.json();
        setTotpSecret(setupData.totpSecret);
        setOtpauthUrl(setupData.otpauthUrl);
        setStep('FIRST_LOGIN_SETUP');
      } else if (data.requires2fa) {
        setStep('2FA_CHALLENGE');
      } else {
        window.location.href = '/super-admin';
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  // Step 2A: First Login Password Change & 2FA Setup
  async function handleFirstLoginSetup(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword,
          totpCode: totpCode.trim(),
          totpSecret,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Setup failed.');
      }

      setSuccessMsg('2FA activated and password updated! Redirecting to Super Admin...');
      setTimeout(() => {
        window.location.href = '/super-admin';
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Setup error.');
    } finally {
      setLoading(false);
    }
  }

  // Step 2B: Returning 2FA Challenge
  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: totpCode.trim(), totpSecret: 'SESSION' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid 2FA code.');
      }

      window.location.href = '/super-admin';
    } catch (err: any) {
      setError(err.message || 'Verification error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Super Admin Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Multi-Store Infrastructure & Freelance Command Center</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: INITIAL LOGIN */}
        {step === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Super Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@client.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-sm text-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Authenticate'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="pt-4 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-500">
                To create your first super admin, run in your terminal:
                <br />
                <code className="text-cyan-400 font-mono">npm run create-super-admin</code>
              </p>
            </div>
          </form>
        )}

        {/* STEP 2A: FIRST LOGIN SETUP (FORCE PASSWORD CHANGE + 2FA) */}
        {step === 'FIRST_LOGIN_SETUP' && (
          <form onSubmit={handleFirstLoginSetup} className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
              ⚠️ <strong>Mandatory First-Login Security Setup:</strong> You must choose a permanent password and enroll your 2FA authenticator.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Permanent Password (min 12 chars)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New strong password..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>Configure 2FA Authenticator</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Add this secret key into Google Authenticator or 1Password:
              </p>
              <div className="p-2 rounded bg-slate-900 border border-slate-700 font-mono text-xs text-center text-cyan-400 select-all">
                {totpSecret}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Enter 6-Digit Code from Authenticator</label>
              <input
                type="text"
                required
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-center text-lg font-mono tracking-widest focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Activate 2FA & Complete Setup'}
            </button>
          </form>
        )}

        {/* STEP 2B: RETURNING 2FA VERIFICATION */}
        {step === '2FA_CHALLENGE' && (
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div className="text-center space-y-2">
              <Smartphone className="w-10 h-10 text-cyan-400 mx-auto" />
              <p className="text-sm font-semibold">Two-Factor Authentication</p>
              <p className="text-xs text-slate-400">Enter the 6-digit code from your authenticator app.</p>
            </div>

            <div>
              <input
                type="text"
                required
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-center text-xl font-mono tracking-widest focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-sm text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify Code'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
