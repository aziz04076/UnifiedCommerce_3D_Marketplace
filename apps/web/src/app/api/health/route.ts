import { NextResponse } from 'next/server';
import { getAllProducts } from '@unified-commerce/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = performance.now();

  try {
    // Measure database query ping
    const testProducts = getAllProducts();
    const duration = performance.now() - start;

    return NextResponse.json(
      {
        status: 'healthy',
        uptime: process.uptime(),
        database: {
          status: 'connected',
          recordCount: testProducts.length,
          latencyMs: parseFloat(duration.toFixed(2)),
        },
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: err.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
