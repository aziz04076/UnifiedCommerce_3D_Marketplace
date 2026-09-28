import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '@unified-commerce/database';

const AI_SERVICE = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/** Attempt to call the Python AI service; return null on any failure */
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

/** TF-IDF-style client fallback: keyword + tag matching with relevance score */
function clientSearch(query: string, topK = 8) {
  const q = query.toLowerCase().split(/\s+/);
  const scored = MOCK_PRODUCTS.map((p) => {
    const corpus = `${p.name} ${p.headline} ${p.description} ${p.tags.join(' ')} ${p.vendorName} ${p.category}`.toLowerCase();
    const hits = q.filter((w) => corpus.includes(w)).length;
    const score = hits / Math.max(q.length, 1);
    return { p, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ p, score }) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: p.price,
      rating: p.rating,
      vendorName: p.vendorName,
      relevance_score: parseFloat(score.toFixed(4)),
      match_reason: `${Math.round(score * 100)}% keyword match`,
    }));
}

export async function POST(req: NextRequest) {
  const { query, top_k = 8, filters = {} } = await req.json();

  // Try real AI service first
  const aiResult = await tryAI('/api/search', { query, top_k, filters });
  if (aiResult) {
    return NextResponse.json({ ...aiResult, source: 'ai-service' });
  }

  // Fallback: client-side search
  const results = clientSearch(query || '', top_k);
  return NextResponse.json({
    results,
    query,
    total: results.length,
    latency_ms: 0,
    engine: 'client-fallback',
    source: 'fallback',
  });
}
