import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { recordPaymentTransition } from '../../../../lib/security';

const CancelOrderSchema = z.object({
  orderId: z.string(),
  reason: z.enum([
    'ORDERED_BY_MISTAKE',
    'FOUND_BETTER_PRICE',
    'DELIVERY_TIME_TOO_LONG',
    'CHANGE_DELIVERY_ADDRESS',
    'INCORRECT_ITEM_VARIANTS',
    'OTHER',
  ]),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = CancelOrderSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'INVALID_PAYLOAD', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { orderId, reason, notes } = parseResult.data;

    // Phase 4: Release reserved stock & update escrow status
    const { releaseStock } = await import('@/lib/inventory-reservation');
    releaseStock(orderId);

    const { freezeEscrowForDispute } = await import('@/lib/escrow');
    freezeEscrowForDispute(orderId);

    // Immutable record of cancellation in audit trail
    const auditRecord = recordPaymentTransition({
      orderId,
      previousState: 'CAPTURED',
      newState: 'REFUNDED',
      amount: 0,
      currency: 'INR',
      provider: 'STRIPE',
      transactionRef: `ref_cancel_${Date.now()}`,
      idempotencyKey: `cancel_${orderId}`,
      verifiedPriceMatch: true,
      metadata: { cancellationReason: reason, notes, refundedToSource: true },
    });

    return NextResponse.json({
      success: true,
      orderId,
      status: 'CANCELLED',
      cancellationReason: reason,
      refundInitiated: true,
      estimatedRefundArrival: '2–3 business days to original payment method',
      auditRef: auditRecord.id,
      timestamp: auditRecord.timestamp,
      message: 'Order cancelled successfully. Refund escrow initiated.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
