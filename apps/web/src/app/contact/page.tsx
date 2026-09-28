import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Contact Us' };

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <div className="w-16 h-1 bg-blue-600 rounded mb-8" />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Get in Touch</h2>

            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4 cursor-pointer"
            >
              <span className="text-2xl">💬</span>
              <div>
                <div className="font-medium text-emerald-300">WhatsApp</div>
                <div className="text-sm text-slate-400">+91 99999 99999</div>
              </div>
            </a>

            <a
              href="tel:+919999999999"
              className="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-xl p-4 cursor-pointer"
            >
              <span className="text-2xl">📞</span>
              <div>
                <div className="font-medium">Call Us</div>
                <div className="text-sm text-slate-400">+91 99999 99999</div>
              </div>
            </a>

            <a
              href="mailto:hello@myshop.com"
              className="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-xl p-4 cursor-pointer"
            >
              <span className="text-2xl">📧</span>
              <div>
                <div className="font-medium">Email</div>
                <div className="text-sm text-slate-400">hello@myshop.com</div>
              </div>
            </a>

            <div className="flex items-start gap-3 bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <span className="text-2xl">📍</span>
              <div>
                <div className="font-medium">Visit Us</div>
                <div className="text-sm text-slate-400">123 Market Street, City, State - 000000</div>
                <a
                  href="https://maps.google.com/?q=My+Shop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 mt-1 block cursor-pointer"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Business Hours</h2>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-2 text-sm">
              {[
                ['Mon – Sat', '9:00 AM – 8:00 PM'],
                ['Sunday',    '10:00 AM – 6:00 PM'],
              ].map(([day, hours]) => (
                <div key={day} className="flex justify-between">
                  <span className="text-slate-400">{day}</span>
                  <span>{hours}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <h3 className="font-medium mb-2">Track Your Order</h3>
              <p className="text-sm text-slate-400 mb-3">No account needed — just your order ID and phone number.</p>
              <a href="/track" className="block text-center bg-blue-600 text-white py-2 rounded-lg text-sm cursor-pointer">
                Track Order →
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
