import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { getStoreConfig } from '../../../../lib/store-config';
import { getIdempotencyResult, setIdempotencyResult } from '../../../../lib/idempotency';

const CreateOrderSchema = z.object({
  cartItems: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1).max(100),
    })
  ).min(1).max(50),
  deliveryPincode: z.string().min(5).max(10).optional(),
  idempotencyKey: z.string().uuid('idempotencyKey must be a UUID'),
});

// Server-side price recalculation — NEVER trust frontend price
async function recalculateTotal(
  cartItems: Array<{ productId: string; quantity: number }>,
  deliveryPincode?: string
): Promise<{ subtotal: number; deliveryFee: number; total: number }> {
  const { getAllProducts } = await import('@unified-commerce/database');
  const products = getAllProducts();
  const cfg = getStoreConfig();

  let subtotal = 0;
  for (const item of cartItems) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    if (product.stock <= 0) throw new Error(`Product "${product.name}" is out of stock`);
    subtotal += product.price * item.quantity;
  }

  // Delivery fee calculation
  let deliveryFee = cfg.defaultDeliveryFee;
  if (deliveryPincode) {
    const area = cfg.deliveryAreas.find((a) => a.pincode === deliveryPincode);
    if (area) deliveryFee = area.deliveryFee;
  }
  if (cfg.freeDeliveryAbove > 0 && subtotal >= cfg.freeDeliveryAbove) {
    deliveryFee = 0;
  }

  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    const { cartItems, deliveryPincode, idempotencyKey } = parsed.data;

    // Idempotency check
    const cached = getIdempotencyResult(idempotencyKey);
    if (cached) return NextResponse.json(cached);

    const cfg = getStoreConfig();
    if (!cfg.payments.razorpay.enabled) {
      return NextResponse.json({ error: 'Online payments not enabled' }, { status: 400 });
    }

    const { subtotal, deliveryFee, total } = await recalculateTotal(cartItems, deliveryPincode);
    const amountPaise = Math.round(total * 100); // Razorpay uses paise

    // Create Razorpay order via API
    const razorpayKeyId = cfg.payments.razorpay.keyId;
    const razorpayKeySecret = cfg.payments.razorpay.keySecret;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 503 });
    }

    const basicAuth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
    const receiptId = `rcpt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: cfg.currency,
        receipt: receiptId,
        notes: { idempotencyKey },
      }),
    });

    if (!rzpResponse.ok) {
      const errText = await rzpResponse.text();
      console.error('[payment/create-order] Razorpay error:', errText);
      return NextResponse.json({ error: 'Payment gateway error' }, { status: 502 });
    }

    const rzpOrder = await rzpResponse.json() as { id: string; amount: number; currency: string };

    const result = {
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: razorpayKeyId,
      subtotal,
      deliveryFee,
      total,
    };

    // Cache for idempotency (5 minutes)
    setIdempotencyResult(idempotencyKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
