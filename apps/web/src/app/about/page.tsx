import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About Us' };

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2">About Us</h1>
        <div className="w-16 h-1 bg-blue-600 rounded mb-8" />

        <div className="space-y-6 text-slate-300">
          <p>
            Welcome to our store! We are a local business committed to providing quality products
            and excellent service to our community.
          </p>
          <p>
            Every order is carefully prepared and dispatched. We believe in honest pricing,
            genuine products, and real customer support — not automated chat bots.
          </p>
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">Our Details</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-slate-400">Store Name:</span> My Shop</div>
              <div><span className="text-slate-400">Address:</span> 123 Market Street, City</div>
              <div><span className="text-slate-400">Phone:</span> +91 99999 99999</div>
              <div><span className="text-slate-400">Email:</span> hello@myshop.com</div>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            We are a registered business. All payments are processed securely by Razorpay.
            Money goes directly to the store — we do not store your card details.
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          <a href="/contact" className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer text-sm">Contact Us</a>
          <a href="/track" className="bg-slate-700 text-white px-6 py-2 rounded-lg cursor-pointer text-sm">Track Order</a>
        </div>
      </div>
    </main>
  );
}
