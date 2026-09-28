import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildWhatsAppLink, buildOrderAlertMessage, buildStatusUpdateMessage, OrderDetails } from '../../../../lib/whatsapp';
import { getStoreConfig } from '../../../../lib/store-config';

const WhatsAppNotifySchema = z.object({
  type: z.enum(['shopkeeper_order_alert', 'customer_status_update']),
  order: z.object({
    orderId: z.string(),
    customerName: z.string(),
    total: z.number().positive(),
    currencySymbol: z.string().default('₹'),
    items: z.array(z.object({ name: string(), quantity: z.number().int().positive() })),
    storeName: z.string(),
  }).optional(),
  customerPhone: z.string().optional(),
  status: z.enum(['accepted', 'packed', 'shipped', 'delivered']).optional(),
  estimatedDelivery: z.string().optional(),
});

function string() {
  return z.string();
}

export async function POST(req: NextRequest) {
  try {
    const cfg = getStoreConfig();
    if (!cfg.features.whatsappNotifications) {
      return NextResponse.json({ message: 'WhatsApp notifications disabled in store config' }, { status: 200 });
    }

    const body: unknown = await req.json().catch(() => ({}));
    const parsed = WhatsAppNotifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const { type, order, customerPhone, status, estimatedDelivery } = parsed.data;

    if (type === 'shopkeeper_order_alert') {
      if (!order) {
        return NextResponse.json({ error: 'Order details required for shopkeeper alert' }, { status: 400 });
      }
      const message = buildOrderAlertMessage(order as OrderDetails);
      const deepLink = buildWhatsAppLink(cfg.whatsapp, message);

      return NextResponse.json({
        success: true,
        mode: 'wa_me_link',
        recipient: cfg.whatsapp,
        deepLink,
        messagePreview: message,
      });
    }

    if (type === 'customer_status_update') {
      if (!customerPhone || !status || !order?.orderId) {
        return NextResponse.json({ error: 'customerPhone, orderId, and status required' }, { status: 400 });
      }
      const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
      const message = buildStatusUpdateMessage(cfg.storeName, order.orderId, status, estimatedDelivery);
      const deepLink = buildWhatsAppLink(cleanPhone, message);

      return NextResponse.json({
        success: true,
        mode: 'wa_me_link',
        recipient: cleanPhone,
        deepLink,
        messagePreview: message,
      });
    }

    return NextResponse.json({ error: 'Unsupported notification type' }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal notification error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
