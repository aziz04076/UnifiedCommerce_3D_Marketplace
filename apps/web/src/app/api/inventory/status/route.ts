import { NextRequest, NextResponse } from 'next/server';
import { getInventoryHealth } from '@/lib/inventory-reservation';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId') || undefined;
    const health = getInventoryHealth(vendorId);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      health,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'INVENTORY_STATUS_FAILED', message: error?.message },
      { status: 500 }
    );
  }
}
