import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '@unified-commerce/database';

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

function clientRecommend(productId: string, topK = 6) {
  const anchor = MOCK_PRODUCTS.find((p) => p.id === productId);
  if (!anchor) return [];

  const anchorTags = new Set(anchor.tags);
  return MOCK_PRODUCTS
    .filter((p) => p.id !== productId)
    .map((p) => {
      const tagOverlap = p.tags.filter((t) => anchorTags.has(t)).length / Math.max(anchorTags.size, 1);
      const catBonus = p.category === anchor.category ? 0.3 : 0;
      const score = tagOverlap + catBonus + (p.rating - 4.0) * 0.1;
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        rating: p.rating,
        vendorName: p.vendorName,
        score: parseFloat(score.toFixed(4)),
        reason: p.category === anchor.category ? 'Frequently bought together' : 'Customers also viewed',
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export async function POST(req: NextRequest) {
  const { product_id, user_history = [], top_k = 6 } = await req.json();

  const aiResult = await tryAI('/api/recommend', { product_id, user_history, top_k });
  if (aiResult) return NextResponse.json({ ...aiResult, source: 'ai-service' });

  const recommendations = clientRecommend(product_id, top_k);
  const anchor = MOCK_PRODUCTS.find((p) => p.id === product_id);
  return NextResponse.json({
    anchor_id: product_id,
    anchor_name: anchor?.name ?? '',
    recommendations,
    strategy: 'client-content-fallback',
    latency_ms: 0,
    source: 'fallback',
  });
}
