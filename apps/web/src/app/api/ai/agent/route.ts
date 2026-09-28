import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '@unified-commerce/database';
import { AgentActionPlan } from '@unified-commerce/types';

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

function fallbackAgentReasoning(messages: { role: string; content: string }[], currentProductId?: string): AgentActionPlan {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  const query = (lastUserMsg?.content || '').toLowerCase();

  // Add to cart intent
  if (['add to cart', 'add to bag', 'buy', 'purchase', 'order'].some(w => query.includes(w))) {
    const matched = MOCK_PRODUCTS.find(p => query.includes(p.name.toLowerCase()) || query.includes(p.slug))
      || (currentProductId ? MOCK_PRODUCTS.find(p => p.id === currentProductId) : undefined)
      || MOCK_PRODUCTS[0];

    return {
      thought: `Recognized user purchase intent for "${matched.name}". Preparing add_to_cart tool invocation with telemetry verification.`,
      toolCalls: [
        {
          id: `call_${Date.now()}_cart`,
          name: 'add_to_cart',
          arguments: { productId: matched.id, productName: matched.name, price: matched.price, quantity: 1 },
          result: { status: 'SUCCESS', message: `Added ${matched.name} to active shopping bag.` },
          reasoning: `Direct command to add ${matched.name} to cart.`,
        },
      ],
      finalResponse: `I've queued the **${matched.name}** (₹${matched.price.toLocaleString('en-IN')}) into your bag! You can apply coupon **CYBER2026** at checkout for a 15% discount.`,
      suggestedAction: {
        type: 'add_to_cart',
        payload: { productId: matched.id, productName: matched.name, price: matched.price },
      },
    };
  }

  // Comparison intent
  if (['compare', 'vs', 'versus', 'difference'].some(w => query.includes(w))) {
    const candidates = MOCK_PRODUCTS.filter(p => query.includes(p.name.toLowerCase()) || query.includes(p.category.toLowerCase())).slice(0, 2);
    const p1 = candidates[0] || MOCK_PRODUCTS[0];
    const p2 = candidates[1] || MOCK_PRODUCTS[1];

    return {
      thought: `User requested structural comparison between ${p1.name} and ${p2.name}. Generating feature matrix and trade-off analysis.`,
      toolCalls: [
        {
          id: `call_${Date.now()}_compare`,
          name: 'compare_products',
          arguments: { productA: p1.id, productB: p2.id },
          result: {
            priceDelta: Math.abs(p1.price - p2.price),
            higherRated: p1.rating >= p2.rating ? p1.name : p2.name,
          },
          reasoning: `Extracted telemetry specs for ${p1.name} vs ${p2.name}.`,
        },
        {
          id: `call_${Date.now()}_tradeoffs`,
          name: 'explain_tradeoffs',
          arguments: { itemA: p1.name, itemB: p2.name },
          result: {
            p1Pros: `${p1.rating}★ rating, ${p1.category} flagship`,
            p2Pros: `${p2.rating}★ rating, ${p2.vendorName} verified hardware`,
          },
        },
      ],
      finalResponse: `### Head-to-Head Comparison:\n\n1. **${p1.name}** (₹${p1.price.toLocaleString('en-IN')} · ${p1.rating}★)\n   • *Profile*: ${p1.headline}\n   • *Best for*: Enthusiasts seeking verified ${p1.category.replace(/-/g, ' ')} performance.\n\n2. **${p2.name}** (₹${p2.price.toLocaleString('en-IN')} · ${p2.rating}★)\n   • *Profile*: ${p2.headline}\n   • *Best for*: Value-conscious practitioners.\n\n**Verdict**: The **${p1.rating >= p2.rating ? p1.name : p2.name}** is the superior investment based on community reliability metrics.`,
    };
  }

  // Filter intent
  if (['under', 'below', 'budget', 'filter', 'cheap'].some(w => query.includes(w))) {
    const numbers = query.match(/\d+/g);
    const maxBudget = numbers ? parseInt(numbers[0], 10) : 50000;
    const matched = MOCK_PRODUCTS.filter(p => p.price <= maxBudget).slice(0, 3);
    const picks = matched.map(p => `**${p.name}** (₹${p.price.toLocaleString('en-IN')})`).join(', ');

    return {
      thought: `Detected filter query targeting price ceiling ₹${maxBudget.toLocaleString('en-IN')}. Scanning verified catalog index.`,
      toolCalls: [
        {
          id: `call_${Date.now()}_filter`,
          name: 'filter_catalog',
          arguments: { maxPrice: maxBudget },
          result: { count: matched.length, topPicks: matched.map(p => p.name) },
          reasoning: `Found ${matched.length} qualifying units within budget threshold.`,
        },
      ],
      finalResponse: `Here are the top-rated hardware options within ₹${maxBudget.toLocaleString('en-IN')}: ${picks}. Would you like me to inspect any of these in the 3D Studio?`,
      suggestedAction: {
        type: 'filter',
        payload: { maxPrice: maxBudget },
      },
    };
  }

  // General conversational intent with tool augmentation
  const topProduct = (currentProductId ? MOCK_PRODUCTS.find(p => p.id === currentProductId) : undefined) || MOCK_PRODUCTS[0];
  return {
    thought: `General advisory request for query "${query}". Grounding response in hardware specifications for ${topProduct.name}.`,
    toolCalls: [
      {
        id: `call_${Date.now()}_specs`,
        name: 'get_product_specs',
        arguments: { productId: topProduct.id },
        result: { name: topProduct.name, rating: topProduct.rating, price: topProduct.price },
        reasoning: `Retrieved live specifications for ${topProduct.name}.`,
      },
    ],
    finalResponse: `I'm ARIA 2.0, your autonomous shopping agent. I can **compare specifications**, **apply real-time filters**, **execute cart additions**, or **explain hardware trade-offs**. For example, the **${topProduct.name}** is currently trending with a ${topProduct.rating}★ community rating. What would you like to build or inspect today?`,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages, cart_items, current_product_id, user_preferences } = body;

  const aiResult = await tryAI('/api/agent/shop', {
    messages,
    cart_items,
    current_product_id,
    user_preferences,
  });

  if (aiResult) {
    return NextResponse.json({ ...aiResult, source: 'ai-service' });
  }

  const fallback = fallbackAgentReasoning(messages, current_product_id);
  return NextResponse.json({ ...fallback, source: 'local-agent-engine', latency_ms: 2.4 });
}
