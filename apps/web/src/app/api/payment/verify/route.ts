import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { getStoreConfig } from '../../../../lib/store-config';

const VerifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = VerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
    const cfg = getStoreConfig();
    const secret = cfg.payments.razorpay.keySecret;

    if (!secret) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 503 });
    }

    // HMAC-SHA256 verification
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpay_signature, 'hex')
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Payment verified — mark order as paid in your DB here
    // For now we return success; real implementation writes to DB
    return NextResponse.json({ verified: true, paymentId: razorpay_payment_id });
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
