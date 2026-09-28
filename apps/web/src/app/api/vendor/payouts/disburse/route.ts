import { NextRequest, NextResponse } from 'next/server';
import { disburseVendorPayout, getVendorEscrowSummary } from '@/lib/escrow';
import { VendorPayoutRequestSchema } from '@unified-commerce/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId') || 'vendor-001';
    const summary = getVendorEscrowSummary(vendorId);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'ESCROW_SUMMARY_FAILED', message: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = VendorPayoutRequestSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { error: 'INVALID_PAYOUT_REQUEST', details: parse.error.format() },
        { status: 400 }
      );
    }

    const result = disburseVendorPayout(parse.data);

    if (!result.success) {
      return NextResponse.json(
        { error: 'PAYOUT_REJECTED', message: result.error },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      payout: result.payout,
      message: `Disbursement of $${result.payout?.amount} successfully routed via ${result.payout?.rail}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'PAYOUT_PROCESSING_FAILED', message: error?.message },
      { status: 500 }
    );
  }
}
