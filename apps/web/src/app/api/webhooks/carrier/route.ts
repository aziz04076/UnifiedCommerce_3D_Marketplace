import { NextRequest, NextResponse } from 'next/server';
import { processCarrierWebhook } from '@/lib/carrier-logistics';
import { CarrierWebhookPayloadSchema } from '@unified-commerce/types';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-carrier-signature');

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'INVALID_JSON', message: 'Malformed JSON payload.' },
        { status: 400 }
      );
    }

    const parse = CarrierWebhookPayloadSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: 'SCHEMA_VALIDATION_ERROR', details: parse.error.format() },
        { status: 422 }
      );
    }

    const result = processCarrierWebhook(parse.data);

    if (!result.success) {
      return NextResponse.json(
        { error: 'CARRIER_EVENT_REJECTED', message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      event: result.eventRecord,
      message: `Carrier event ${parse.data.eventType} processed for order ${parse.data.orderId}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'WEBHOOK_PROCESSING_FAILED', message: error?.message },
      { status: 500 }
    );
  }
}
