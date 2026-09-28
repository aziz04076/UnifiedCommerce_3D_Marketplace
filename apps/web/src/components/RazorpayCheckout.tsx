'use client';
import { useState } from 'react';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface Props {
  orderId: string;           // Razorpay order ID from server
  amount: number;            // in paise
  currency: string;
  keyId: string;             // Razorpay key_id (publishable)
  storeName: string;
  primaryColor?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onFailure: (error: string) => void;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayCheckout({
  orderId, amount, currency, keyId, storeName, primaryColor = '#2563eb',
  customerName, customerEmail, customerPhone,
  onSuccess, onFailure,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handlePayNow() {
    setLoading(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      onFailure('Unable to load payment gateway. Please check your internet connection.');
      setLoading(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: keyId,
      amount,
      currency,
      name: storeName,
      description: 'Order Payment',
      order_id: orderId,
      handler(response) {
        onSuccess(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );
      },
      prefill: { name: customerName, email: customerEmail, contact: customerPhone },
      theme: { color: primaryColor },
      modal: {
        ondismiss() {
          setLoading(false);
        },
      },
    });

    rzp.open();
    setLoading(false);
  }

  return (
    <button
      onClick={handlePayNow}
      disabled={loading}
      className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-center"
    >
      {loading ? 'Loading Payment...' : `Pay ₹${(amount / 100).toFixed(2)} via Razorpay`}
    </button>
  );
}
