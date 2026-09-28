/**
 * WhatsApp integration helpers.
 * Default mode: wa.me deep-link (free, zero setup).
 * WhatsApp Business API is behind a feature flag and not active by default.
 */

export interface OrderDetails {
  orderId: string;
  customerName: string;
  total: number;
  currencySymbol: string;
  items: Array<{ name: string; quantity: number }>;
  storeName: string;
}

/**
 * Build a wa.me deep-link to open WhatsApp with a pre-filled message.
 * @param phone  Digits only, with country code, e.g. '919876543210'
 * @param message Pre-composed message text
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}

/** Compose a new-order alert message for the shopkeeper. */
export function buildOrderAlertMessage(order: OrderDetails): string {
  const itemLines = order.items
    .map((i) => `  • ${i.name} × ${i.quantity}`)
    .join('\n');

  return [
    `🛒 *New Order — ${order.storeName}*`,
    `Order ID: ${order.orderId}`,
    `Customer: ${order.customerName}`,
    `Total: ${order.currencySymbol}${order.total.toFixed(2)}`,
    '',
    'Items:',
    itemLines,
    '',
    'Open admin panel to accept: /shop-admin/orders',
  ].join('\n');
}

/** Compose an order-status update message for the customer. */
export function buildStatusUpdateMessage(
  storeName: string,
  orderId: string,
  status: 'accepted' | 'packed' | 'shipped' | 'delivered',
  estimatedDelivery?: string
): string {
  const statusMessages: Record<typeof status, string> = {
    accepted:  '✅ Your order has been accepted! We are preparing it.',
    packed:    '📦 Your order is packed and ready for pickup by delivery.',
    shipped:   '🚚 Your order is on the way!',
    delivered: '🎉 Your order has been delivered! Thank you for shopping with us.',
  };

  const lines = [
    `*${storeName}* — Order Update`,
    `Order ID: ${orderId}`,
    statusMessages[status],
  ];

  if (status === 'shipped' && estimatedDelivery) {
    lines.push(`Expected delivery: ${estimatedDelivery}`);
  }

  lines.push('', 'Track your order: /track');
  return lines.join('\n');
}
