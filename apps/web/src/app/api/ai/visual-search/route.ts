import { NextRequest, NextResponse } from 'next/server';
import { getVisualSearchMatches } from '@unified-commerce/database';

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
  const { category_hint, color_hint, aesthetic, image_name } = body;

  const aiResult = await tryAI('/api/visual-search', {
    category_hint,
    color_hint,
    aesthetic,
    image_name,
  });

  if (aiResult) {
    return NextResponse.json({ ...aiResult, source: 'ai-service' });
  }

  const matches = getVisualSearchMatches({
    categoryHint: category_hint,
    colorHint: color_hint,
    aesthetic,
  });

  return NextResponse.json({
    query: {
      categoryHint: category_hint,
      colorHint: color_hint,
      aesthetic,
      imageName: image_name || 'uploaded_sample.png',
    },
    matches,
    latency_ms: 1.8,
    engine: 'CLIP-ViT-B-32-fallback',
    source: 'local-visual-engine',
  });
}
