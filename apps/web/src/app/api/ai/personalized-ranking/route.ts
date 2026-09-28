import { NextRequest, NextResponse } from 'next/server';
import { getPersonalizedProductRanking } from '@unified-commerce/database';

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

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { preferred_categories, recent_viewed_ids, cart_intent_ids } = body;

  const aiResult = await tryAI('/api/personalized-ranking', {
    preferred_categories,
    recent_viewed_ids,
    cart_intent_ids,
  });

  if (aiResult) {
    return NextResponse.json({ ...aiResult, source: 'ai-service' });
  }

  const result = getPersonalizedProductRanking({
    preferredCategories: preferred_categories,
    recentViewedIds: recent_viewed_ids,
    cartIntentIds: cart_intent_ids,
  });

  return NextResponse.json({
    ...result,
    latency_ms: 1.4,
    source: 'local-ranking-engine',
  });
}
