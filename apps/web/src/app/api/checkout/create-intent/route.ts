import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  verifyOrderPrice,
  checkIdempotency,
  saveIdempotency,
  assessCheckoutFraud,
  recordPaymentTransition,
} from '../../../../lib/security';

const CreateIntentSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'Cart cannot be empty'),
  clientSubtotal: z.number(),
  clientTotal: z.number(),
  shippingTier: z.enum(['standard', 'express', 'drone']).default('standard'),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['STRIPE', 'RAZORPAY', 'WALLET', 'CRYPTO']).default('STRIPE'),
  shippingCountry: z.string().default('India'),
  billingCountry: z.string().default('India'),
});

export async function POST(req: NextRequest) {
  try {
    const idempotencyKey = req.headers.get('idempotency-key') || req.headers.get('x-idempotency-key');
    if (idempotencyKey) {
      const cached = checkIdempotency(idempotencyKey);
      if (cached) {
        return NextResponse.json(
          { ...cached.responsePayload, _cachedFromIdempotency: true },
          { status: cached.statusCode }
        );
      }
    }

    const body = await req.json();
    const parseResult = CreateIntentSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'INVALID_PAYLOAD', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const {
      items,
      clientSubtotal,
      clientTotal,
      shippingTier,
      couponCode,
      paymentMethod,
      shippingCountry,
      billingCountry,
    } = parseResult.data;

    // 1. Server-Side Price Verification (NEVER trust client price)
    const verification = verifyOrderPrice(
      items,
      clientSubtotal,
      clientTotal,
      shippingTier,
      couponCode
    );

    if (!verification.isValid) {
      return NextResponse.json(
        {
          error: 'PRICE_TAMPERING_DETECTED',
          message: verification.reason,
          recalculatedTotal: verification.serverTotal,
          clientTotal,
        },
        { status: 400 }
      );
    }

    // 2. Fraud & Velocity Assessment
    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const tempOrderId = `ord-${Date.now()}`;
    const fraudAssessment = assessCheckoutFraud(
      tempOrderId,
      verification.serverTotal,
      clientIp,
      shippingCountry,
      billingCountry
    );

    if (!fraudAssessment.allowCheckout) {
      return NextResponse.json(
        {
          error: 'TRANSACTION_BLOCKED_BY_FRAUD_SHIELD',
          message: 'This transaction was flagged by security velocity and fraud rules.',
          reasons: fraudAssessment.reasons,
        },
        { status: 403 }
      );
    }

    // 2b. Phase 4 Distributed Inventory Reservation (15-min TTL)
    const { reserveStock } = await import('@/lib/inventory-reservation');
    const reservationResult = reserveStock(items, tempOrderId, 15);
    if (!reservationResult.success) {
      return NextResponse.json(
        {
          error: 'INVENTORY_RESERVATION_FAILED',
          message: reservationResult.error,
          failedItems: reservationResult.failedItems,
        },
        { status: 409 }
      );
    }

    // 3. Immutable Payment State Transition (INITIATED)
    const clientSecret = `pi_${Date.now()}_secret_${Math.random().toString(36).substring(2, 10)}`;
    const auditRecord = recordPaymentTransition({
      orderId: tempOrderId,
      previousState: null,
      newState: 'INITIATED',
      amount: verification.serverTotal,
      currency: 'USD',
      provider: paymentMethod,
      transactionRef: clientSecret,
      idempotencyKey: idempotencyKey || `auto_${tempOrderId}`,
      verifiedPriceMatch: true,
      clientIp,
      userAgent: req.headers.get('user-agent') || 'unknown',
    });

    const responsePayload = {
      orderId: tempOrderId,
      clientSecret,
      verifiedTotal: verification.serverTotal,
      verifiedSubtotal: verification.serverSubtotal,
      verifiedTax: verification.serverTax,
      verifiedShippingFee: verification.serverShippingFee,
      currency: 'USD',
      provider: paymentMethod,
      requires3DSecure: fraudAssessment.requiresStepUpAuth || verification.serverTotal > 1500,
      fraudRisk: {
        score: fraudAssessment.riskScore,
        level: fraudAssessment.riskLevel,
      },
      auditRef: auditRecord.id,
      pciComplianceNotice: 'PCI-DSS SAQ-A compliant. Raw payment tokens handled via certified escrow elements.',
    };

    if (idempotencyKey) {
      saveIdempotency(idempotencyKey, 200, responsePayload);
    }

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (err: any) {
    console.error('Create Intent error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}
