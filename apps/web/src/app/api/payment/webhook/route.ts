import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getStoreConfig } from '../../../../lib/store-config';

// In-memory set to prevent webhook replay attacks.
// In production, persist this in Redis or your DB.
const processedEvents = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const cfg = getStoreConfig();
    const webhookSecret = cfg.payments.razorpay.webhookSecret;

    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );

    if (!isValid) {
      console.warn('[webhook] Invalid Razorpay signature — rejecting');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as {
      event: string;
      payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
    };

    const eventId = event.payload?.payment?.entity?.id ?? '';

    // Idempotency — skip already-processed events
    if (eventId && processedEvents.has(eventId)) {
      return NextResponse.json({ status: 'already_processed' });
    }
    if (eventId) processedEvents.add(eventId);

    switch (event.event) {
      case 'payment.captured':
        // TODO: mark order as paid, trigger invoice generation, send confirmation
        console.log('[webhook] payment.captured', eventId);
        break;
      case 'payment.failed':
        console.log('[webhook] payment.failed', eventId);
        break;
      case 'refund.processed':
        console.log('[webhook] refund.processed', eventId);
        break;
      default:
        console.log('[webhook] unhandled event', event.event);
    }

    return NextResponse.json({ status: 'ok' });
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
