import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Simulates full GDPR Article 20 Right to Data Portability
  const userData = {
    user: {
      id: 'usr-demo-771',
      name: 'Cybernetic Practitioner',
      email: 'practitioner@unified-commerce.internal',
      role: 'CUSTOMER',
      registeredAt: '2026-01-15T10:00:00.000Z',
      is2FAEnabled: true,
    },
    savedAddresses: [
      {
        id: 'addr-001',
        type: 'HOME',
        fullName: 'Alex Vance',
        phone: '+91 98765 43210',
        street: 'Penthouse 42B, Neo-Bandra Heights',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India',
        isDefault: true,
      },
      {
        id: 'addr-002',
        type: 'WORK',
        fullName: 'Alex Vance',
        phone: '+91 98765 43210',
        street: 'Cyber Tower 9, Tech District',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
        country: 'India',
        isDefault: false,
      },
    ],
    orderHistory: [
      {
        orderId: 'ord-seed-8942',
        placedAt: '2026-09-24T14:32:00.000Z',
        items: [
          {
            productName: 'Vortex Phantom LiDAR Drone X4',
            quantity: 1,
            unitPrice: 249900,
          },
        ],
        total: 294882,
        paymentStatus: 'PAID',
        shippingStatus: 'OUT_FOR_DELIVERY',
      },
    ],
    consentLogs: [
      {
        purpose: 'ESSENTIAL_COMMERCE',
        grantedAt: '2026-01-15T10:00:00.000Z',
        status: 'ACTIVE',
      },
      {
        purpose: 'AI_PERSONALIZATION',
        grantedAt: '2026-01-15T10:00:00.000Z',
        status: 'ACTIVE',
      },
    ],
    exportMetadata: {
      exportedAt: new Date().toISOString(),
      compliance: 'GDPR Article 20 / Digital Personal Data Protection Act 2023',
      format: 'JSON / Portable Machine-Readable',
    },
  };

  return NextResponse.json(userData, {
    status: 200,
    headers: {
      'Content-Disposition': 'attachment; filename="unified-commerce-user-data.json"',
    },
  });
}
