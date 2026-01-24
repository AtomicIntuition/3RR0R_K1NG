import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Count completed scans
    const { count, error } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    if (error) {
      console.error('Error fetching stats:', error);
      return NextResponse.json({
        totalScans: 0,
        checksPerScan: 50,
      });
    }

    return NextResponse.json({
      totalScans: count || 0,
      checksPerScan: 50, // Fixed: 18 audits with multiple checks each
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      totalScans: 0,
      checksPerScan: 50,
    });
  }
}
