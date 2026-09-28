import { NextRequest, NextResponse } from 'next/server';
import {
  generateAirWaybill,
  getAirWaybill,
  getOrderCarrierEvents,
  simulateNextCarrierEvent,
} from '@/lib/carrier-logistics';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'MISSING_ORDER_ID', message: 'orderId parameter is required' },
        { status: 400 }
      );
    }

    const awb = getAirWaybill(orderId);
    const events = getOrderCarrierEvents(orderId);

    return NextResponse.json({
      success: true,
      awb,
      events,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'AWB_FETCH_FAILED', message: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      vendorId = 'vendor-001',
      recipient = { name: 'Customer', city: 'Mumbai' },
      shippingTier = 'Hyper-Suborbital Air Transit',
      declaredValue = 499,
      action = 'dispatch',
    } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'MISSING_ORDER_ID', message: 'orderId is required' },
        { status: 400 }
      );
    }

    // Interactive step forward simulator
    if (action === 'simulate_step') {
      const sim = simulateNextCarrierEvent(orderId);
      return NextResponse.json({
        success: true,
        simulation: sim,
        events: getOrderCarrierEvents(orderId),
      });
    }

    const awb = generateAirWaybill(orderId, vendorId, recipient, shippingTier, declaredValue);
    const events = getOrderCarrierEvents(orderId);

    return NextResponse.json({
      success: true,
      awb,
      events,
      message: `Air Waybill ${awb.awbNumber} successfully generated for order ${orderId}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'DISPATCH_FAILED', message: error?.message },
      { status: 500 }
    );
  }
}
