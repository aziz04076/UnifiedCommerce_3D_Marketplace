import { NextRequest, NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  recordPaymentTransition,
} from '../../../../lib/security';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-unified-signature') || req.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED_WEBHOOK', message: 'Missing required webhook signature header.' },
        { status: 401 }
      );
    }

    const rawBody = await req.text();
    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: 'SIGNATURE_VERIFICATION_FAILED', message: 'HMAC-SHA256 signature does not match payload digest.' },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    const { type, data } = event;

    // Handle supported payment gateway events
    if (type === 'payment_intent.succeeded') {
      recordPaymentTransition({
        orderId: data.orderId || 'ord-webhook',
        previousState: 'AUTHORIZED',
        newState: 'CAPTURED',
        amount: data.amount || 0,
        currency: data.currency || 'INR',
        provider: data.provider || 'STRIPE',
        transactionRef: data.transactionId || 'tx_webhook',
        idempotencyKey: `wh_${data.transactionId}`,
        verifiedPriceMatch: true,
        metadata: { eventType: type, deliveryMode: 'webhook-verified' },
      });
    } else if (type === 'payment_intent.payment_failed') {
      recordPaymentTransition({
        orderId: data.orderId || 'ord-webhook',
        previousState: 'INITIATED',
        newState: 'FAILED',
        amount: data.amount || 0,
        currency: data.currency || 'INR',
        provider: data.provider || 'STRIPE',
        transactionRef: data.transactionId || 'tx_webhook',
        idempotencyKey: `wh_${data.transactionId}`,
        verifiedPriceMatch: false,
        metadata: { eventType: type, failureReason: data.failureMessage },
      });
    } else if (type === 'charge.refunded') {
      recordPaymentTransition({
        orderId: data.orderId || 'ord-webhook',
        previousState: 'CAPTURED',
        newState: 'REFUNDED',
        amount: data.amount || 0,
        currency: data.currency || 'INR',
        provider: data.provider || 'STRIPE',
        transactionRef: data.refundId || 'ref_webhook',
        idempotencyKey: `wh_ref_${data.refundId}`,
        verifiedPriceMatch: true,
        metadata: { eventType: type, refundReason: data.reason },
      });
    }

    return NextResponse.json({
      received: true,
      eventType: type,
      verifiedSignature: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'WEBHOOK_ERROR', message: err.message }, { status: 500 });
  }
}
