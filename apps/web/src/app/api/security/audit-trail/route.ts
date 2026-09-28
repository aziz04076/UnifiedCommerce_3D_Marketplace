import { NextRequest, NextResponse } from 'next/server';
import { getPaymentAuditLogs } from '../../../../lib/security';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId') || undefined;

  const logs = getPaymentAuditLogs(orderId);

  return NextResponse.json({
    totalEntries: logs.length,
    pciComplianceStandard: 'PCI-DSS SAQ-A v4.0',
    encryptionStandard: 'AES-256-GCM field-level encryption with unique IV per record',
    auditLogs: logs,
  });
}
