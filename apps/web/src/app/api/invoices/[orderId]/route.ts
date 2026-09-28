import { NextRequest, NextResponse } from 'next/server';
import { getStoreConfig } from '../../../../lib/store-config';

// Simple text-based invoice (PDF generation requires puppeteer/pdfkit in production)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const cfg = getStoreConfig();

  const invoiceNumber = `${cfg.invoicePrefix}-${orderId.slice(0, 8).toUpperCase()}`;
  const date = new Date().toLocaleDateString('en-IN');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; color: #111; }
    .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
    .store-name { font-size: 24px; font-weight: bold; color: ${cfg.primaryColor}; }
    .invoice-no { font-size: 14px; color: #555; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    th { background: #f3f4f6; text-align: left; padding: 8px 12px; font-size: 13px; }
    td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .total-row td { font-weight: bold; background: #f9fafb; }
    .footer { margin-top: 32px; font-size: 12px; color: #888; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="store-name">${cfg.storeName}</div>
      <div style="font-size:13px;color:#555;margin-top:4px;">${cfg.address}</div>
      ${cfg.gstin ? `<div style="font-size:12px;color:#888;">GSTIN: ${cfg.gstin}</div>` : ''}
    </div>
    <div style="text-align:right">
      <div class="invoice-no">INVOICE</div>
      <div style="font-size:18px;font-weight:bold;">${invoiceNumber}</div>
      <div style="font-size:13px;color:#555;">Date: ${date}</div>
    </div>
  </div>

  <div style="background:#f9fafb;padding:12px 16px;border-radius:6px;margin-bottom:24px;font-size:13px;">
    <strong>Order ID:</strong> ${orderId}<br>
    <strong>Payment:</strong> Paid via Razorpay
  </div>

  <table>
    <thead>
      <tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr>
    </thead>
    <tbody>
      <tr><td>Order Items</td><td>—</td><td>—</td><td>—</td></tr>
    </tbody>
    <tfoot>
      <tr class="total-row"><td colspan="3">Total</td><td>${cfg.currencySymbol} —</td></tr>
    </tfoot>
  </table>

  <div class="footer">
    <p>Thank you for shopping at ${cfg.storeName}!</p>
    <p>Contact: ${cfg.phone} · ${cfg.email}</p>
    <p>This is a computer-generated invoice.</p>
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
