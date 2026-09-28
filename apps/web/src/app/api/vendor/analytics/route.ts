import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBackfilledVendorAnalytics } from '../../../../lib/vendor-analytics-migration';
import { getAllVendors } from '@unified-commerce/database';
export const dynamic = 'force-dynamic';
const QuerySchema = z.object({
  vendorId: z.string().min(1, 'vendorId parameter is required'),
  range: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const rawVendorId = searchParams.get('vendorId') || 'vendor-1';
    const rawRange = searchParams.get('range') || '30d';

    const parsed = QuerySchema.safeParse({ vendorId: rawVendorId, range: rawRange });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: parsed.error.flatten() }, { status: 400 });
    }

    const { vendorId, range } = parsed.data;

    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };

    const days = daysMap[range] || 30;

    // Verify vendor exists or return clean zero state
    const allVendors = getAllVendors();
    const vendorRecord = allVendors.find((v) => v.id === vendorId || v.slug === vendorId);

    const analytics = getBackfilledVendorAnalytics(vendorId, days);

    return NextResponse.json({
      success: true,
      vendor: vendorRecord || { id: vendorId, name: analytics.vendorName },
      range,
      analytics,
    });
  } catch (err: any) {
    console.error('[vendor/analytics] Aggregation error:', err);
    return NextResponse.json({ error: 'Internal analytics error' }, { status: 500 });
  }
}
