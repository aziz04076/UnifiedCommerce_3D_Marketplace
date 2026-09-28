import { NextRequest, NextResponse } from 'next/server';
import { calculateOrderSplits } from '@/lib/escrow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, totalShippingFee = 0, currency = 'USD' } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'INVALID_ITEMS', message: 'An array of items with productId and quantity is required.' },
        { status: 400 }
      );
    }

    const splits = calculateOrderSplits(items, totalShippingFee, currency);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      splits,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'SPLIT_CALCULATION_FAILED', message: error?.message || 'Failed to calculate splits' },
      { status: 500 }
    );
  }
}
