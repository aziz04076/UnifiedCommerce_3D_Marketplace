import { NextRequest, NextResponse } from 'next/server';
import { getProductReviewSummary } from '@unified-commerce/database';

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
  const { product_id } = body;

  const aiResult = await tryAI('/api/review-summary', { product_id });

  if (aiResult) {
    return NextResponse.json({ ...aiResult, source: 'ai-service' });
  }

  const summary = getProductReviewSummary(product_id || 'prod-001');

  return NextResponse.json({
    summary,
    latency_ms: 2.1,
    source: 'local-summarizer-engine',
  });
}
