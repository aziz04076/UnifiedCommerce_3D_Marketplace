'use client';
import { useState } from 'react';

const STEPS = [
  { id: 1, title: 'Store Name & Logo', titleHi: 'Dukan ka Naam aur Logo' },
  { id: 2, title: 'Choose Theme',       titleHi: 'Theme Chunein' },
  { id: 3, title: 'Add 5 Products',     titleHi: '5 Products Dalein' },
  { id: 4, title: 'Payment Setup',      titleHi: 'Payment Setup' },
  { id: 5, title: 'Delivery Areas',     titleHi: 'Delivery Areas' },
  { id: 6, title: 'Contact & Policies', titleHi: 'Contact aur Policies' },
  { id: 7, title: 'Preview',            titleHi: 'Preview Dekhein' },
  { id: 8, title: 'Go Live! 🚀',        titleHi: 'Live Ho Jao! 🚀' },
];

export default function SetupWizardPage() {
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState('');
  const [theme, setTheme] = useState('general');

  const current = STEPS.find((s) => s.id === step) ?? STEPS[0];

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100">
      <div className="bg-slate-900 border-b border-slate-700 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <a href="/shop-admin" className="text-slate-400 text-sm">← Dashboard</a>
          <h1 className="text-xl font-bold mt-1">🧙 Setup Wizard</h1>
          <div className="flex gap-1 mt-3">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-1.5 flex-1 rounded-full ${
                  s.id < step ? 'bg-emerald-500' : s.id === step ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Step {step} of {STEPS.length}: <strong className="text-white">{current.titleHi}</strong>
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Apni dukan ka naam kya hai?</h2>
            <p className="text-slate-400 text-sm">What is your store name?</p>
            <input
              type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Sharma Cloth House"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white text-lg"
            />
            <div>
              <label className="block text-sm font-medium mb-2">Logo (optional)</label>
              <label className="flex items-center gap-3 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 cursor-pointer">
                <span className="text-2xl">🖼️</span>
                <span className="text-slate-400">Logo upload karein</span>
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Apni dukan ka look chunein</h2>
            <p className="text-slate-400 text-sm">Choose your store theme</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'fashion',     label: 'Fashion 👗',   desc: 'Clothes, accessories' },
                { value: 'food',        label: 'Food 🍰',       desc: 'Bakery, sweets, food' },
                { value: 'electronics', label: 'Electronics 📱', desc: 'Gadgets, appliances' },
                { value: 'general',     label: 'General 🏪',    desc: 'All types of shops' },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`rounded-xl p-4 border text-left cursor-pointer ${
                    theme === t.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/60'
                  }`}
                >
                  <div className="font-semibold text-sm">{t.label}</div>
                  <div className="text-slate-400 text-xs mt-1">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Payment Setup</h2>
            <p className="text-slate-400 text-sm">Razorpay keys apne Razorpay dashboard se lein.</p>
            <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4">
              <div className="font-semibold text-amber-300 text-sm mb-2">⚠️ Important</div>
              <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                <li>Apna Razorpay account banayein (free)</li>
                <li>Key ID aur Key Secret copy karein</li>
                <li>Ye keys sirf aapki dukan ke liye hain</li>
                <li>Paisa seedha aapke bank mein aayega</li>
              </ul>
            </div>
            <input placeholder="Razorpay Key ID (rzp_live_...)" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm" />
            <input type="password" placeholder="Razorpay Key Secret" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm" />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="cod" defaultChecked className="w-4 h-4" />
              <label htmlFor="cod" className="text-sm">Cash on Delivery (COD) bhi enable karein</label>
            </div>
          </div>
        )}

        {(step === 3 || step === 5 || step === 6) && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{current.title}</h2>
            <p className="text-slate-400 text-sm">{current.titleHi}</p>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🔧</div>
              <p className="text-slate-400">This step connects to your store configuration.</p>
              <p className="text-sm text-slate-500 mt-1">Edit <code>store.config.ts</code> or use the form below.</p>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Preview Dekhein</h2>
            <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4">
              <div className="font-semibold text-emerald-300 mb-2">✅ {storeName || 'Your Store'} ready hai!</div>
              <p className="text-sm text-slate-400">Neeche preview button dabao.</p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 text-white font-semibold py-3 rounded-xl text-center cursor-pointer"
            >
              🔍 Live Preview Dekhein
            </a>
          </div>
        )}

        {step === 8 && (
          <div className="text-center space-y-4 py-8">
            <div className="text-6xl">🚀</div>
            <h2 className="text-2xl font-bold">Mubarak ho!</h2>
            <p className="text-slate-300">Aapki dukan live ho gayi!</p>
            <p className="text-slate-400 text-sm">Congratulations! Your store is live.</p>
            <a href="/shop-admin" className="block bg-emerald-600 text-white font-semibold py-3 rounded-xl cursor-pointer">
              Admin Panel Kholein
            </a>
          </div>
        )}

        {/* Navigation buttons */}
        {step < 8 && (
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 bg-slate-700 text-white py-3 rounded-xl cursor-pointer"
              >
                ← Wapas
              </button>
            )}
            <button
              onClick={() => setStep((s) => Math.min(s + 1, STEPS.length))}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold cursor-pointer"
            >
              {step === 7 ? '🚀 Live Karo!' : 'Aage →'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
