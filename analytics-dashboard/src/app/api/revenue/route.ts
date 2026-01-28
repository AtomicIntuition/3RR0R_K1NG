import { NextResponse } from 'next/server';
import { getRevenueMetrics } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = await getRevenueMetrics();

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Revenue API error:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue' }, { status: 500 });
  }
}
