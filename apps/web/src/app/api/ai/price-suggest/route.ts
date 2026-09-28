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

function localPriceSuggest(productId: string, basePrice: number) {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  let mult = 1.0;
  const reasoning: string[] = [];

  if (hour >= 19 && hour <= 22) { mult += 0.03; reasoning.push('Peak evening browsing window'); }
  if (day === 0 || day === 6) { mult += 0.02; reasoning.push('Weekend demand uplift'); }

  const suggested = Math.round((basePrice * mult) / 10) * 10;
  return {
    product_id: productId,
    base_price: basePrice,
    suggested_price: suggested,
    floor_price: Math.round((basePrice * 0.85) / 10) * 10,
    ceiling_price: Math.round((basePrice * 1.15) / 10) * 10,
    demand_multiplier: parseFloat(mult.toFixed(4)),
    confidence: 72,
    reasoning,
    source: 'fallback',
  };
}

export async function POST(req: NextRequest) {
  const { product_id, base_price, vendor_id = '' } = await req.json();

  const aiResult = await tryAI('/api/price-suggest', { product_id, base_price, vendor_id });
  if (aiResult) return NextResponse.json({ ...aiResult, source: 'ai-service' });

  return NextResponse.json(localPriceSuggest(product_id, base_price));
}
