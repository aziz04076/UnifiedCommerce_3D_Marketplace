import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStoreConfig } from '../../../../lib/store-config';

const RefundSchema = z.object({
  paymentId: z.string().min(1),
  amount: z.number().int().positive().optional(), // paise — if omitted, full refund
  reason: z.enum(['duplicate', 'fraud', 'customer_request', 'other']),
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = RefundSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    const { paymentId, amount, reason } = parsed.data;
    const cfg = getStoreConfig();
    const { keyId, keySecret } = cfg.payments.razorpay;

    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const refundBody: Record<string, unknown> = { speed: 'normal', notes: { reason } };
    if (amount) refundBody.amount = amount;

    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refundBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[refund] Razorpay error:', errText);
      return NextResponse.json({ error: 'Refund initiation failed' }, { status: 502 });
    }

    const refund = await response.json() as { id: string; status: string };
    return NextResponse.json({ refundId: refund.id, status: refund.status });
  } catch {
    return NextResponse.json({ error: 'Refund failed' }, { status: 500 });
  }
}
