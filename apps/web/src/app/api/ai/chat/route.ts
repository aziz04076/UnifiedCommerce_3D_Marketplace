import { NextRequest, NextResponse } from 'next/server';

const AI_SERVICE = process.env.AI_SERVICE_URL || 'http://localhost:8000';

async function tryAI(path: string, body: object): Promise<object | null> {
  try {
    const res = await fetch(`${AI_SERVICE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const RAG_KB: Record<string, string> = {
  return: "UnifiedCommerce offers a **7-day hassle-free return** on all products. Go to Orders → select item → 'Request Return'. Refunds processed in 3 business days.",
  refund: "Refunds are credited to your original payment method within 3 business days after the return is received at our warehouse.",
  shipping: "Three tiers: **Standard** 3–5 days (free above ₹10,000) · **Express** 1–2 days (₹250) · **Drone Dispatch** 4 hours (₹500). All include live GPS tracking.",
  delivery: "Delivery options range from 4-hour drone dispatch to 3–5 day standard freight. Track your parcel in real time on the Orders page.",
  payment: "We accept **Stripe** (cards), **Razorpay** (UPI/Net Banking), **Crypto Escrow** (USDC/ETH/SOL), and **UC Wallet credits**.",
  coupon: "Active codes: **CYBER2026** (15% off) · **NEURAL100** (₹100 credit) · **FREESHIP** (free shipping). Apply at checkout.",
  warranty: "All electronics include 1-year manufacturer warranty. Add **UC Protect** (2-year extended) at checkout for 8% of the product price.",
  vendor: "Become a vendor at /vendor. Free to join. 8% commission, D+1 payouts, AI-powered analytics dashboard.",
};

function fallbackChat(messages: { role: string; content: string }[]): string {
  const last = [...messages].reverse().find((m) => m.role === 'user');
  if (!last) return "Hello! I'm your UnifiedCommerce AI assistant. Ask me anything about products, shipping, or returns!";

  const q = last.content.toLowerCase();
  for (const [keyword, answer] of Object.entries(RAG_KB)) {
    if (q.includes(keyword)) return answer;
  }

  return "I'm here to help! You can ask me about products, shipping, returns, payments, or coupons. What would you like to know?";
}

export async function POST(req: NextRequest) {
  const { messages, context_product_id } = await req.json();

  const aiResult = await tryAI('/api/chat', { messages, context_product_id });
  if (aiResult) return NextResponse.json({ ...aiResult, source: 'ai-service' });

  return NextResponse.json({
    reply: fallbackChat(messages),
    suggestions: [],
    latency_ms: 0,
    source: 'fallback',
  });
}
