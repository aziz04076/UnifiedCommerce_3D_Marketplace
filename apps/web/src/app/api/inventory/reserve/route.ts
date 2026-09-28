import { NextRequest, NextResponse } from 'next/server';
import { reserveStock, releaseStock, commitStock } from '@/lib/inventory-reservation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, orderOrSessionId, action = 'reserve', ttlMinutes = 15 } = body;

    if (action === 'release') {
      if (!orderOrSessionId) {
        return NextResponse.json({ error: 'MISSING_SESSION_ID', message: 'orderOrSessionId is required' }, { status: 400 });
      }
      const released = releaseStock(orderOrSessionId);
      return NextResponse.json({ success: true, released, message: 'Stock reservation released.' });
    }

    if (action === 'commit') {
      if (!orderOrSessionId) {
        return NextResponse.json({ error: 'MISSING_SESSION_ID', message: 'orderOrSessionId is required' }, { status: 400 });
      }
      const committed = commitStock(orderOrSessionId);
      return NextResponse.json({ success: true, committed, message: 'Stock reservation permanently committed.' });
    }

    // Default: reserve
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'INVALID_ITEMS', message: 'Array of items with productId and quantity is required.' },
        { status: 400 }
      );
    }

    const sessionId = orderOrSessionId || `sess-${Date.now()}`;
    const result = reserveStock(items, sessionId, ttlMinutes);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'INVENTORY_RESERVATION_FAILED',
          message: result.error,
          failedItems: result.failedItems,
        },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json({
      success: true,
      orderOrSessionId: sessionId,
      reservations: result.reservations,
      expiresAt: result.reservations[0]?.expiresAt,
      message: `Reserved ${result.reservations.length} item lines for ${ttlMinutes} minutes.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'RESERVATION_SERVER_ERROR', message: error?.message },
      { status: 500 }
    );
  }
}
