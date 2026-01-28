import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Recent scans
    const { data: recentScans } = await supabase
      .from('scans')
      .select('id, url, status, score_overall, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    // Recent signups
    const { data: recentSignups } = await supabase
      .from('profiles')
      .select('id, email, tier, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    // Combine and sort by timestamp
    const activities: Array<{
      id: string;
      type: 'scan' | 'signup' | 'payment' | 'upgrade';
      title: string;
      description?: string;
      timestamp: string;
    }> = [];

    recentScans?.forEach((scan) => {
      let domain = 'Unknown';
      try {
        domain = new URL(scan.url).hostname;
      } catch {
        // Invalid URL
      }

      activities.push({
        id: `scan-${scan.id}`,
        type: 'scan',
        title: `Scan ${scan.status}`,
        description: `${domain}${scan.score_overall ? ` - Score: ${scan.score_overall}` : ''}`,
        timestamp: scan.created_at,
      });
    });

    recentSignups?.forEach((user) => {
      activities.push({
        id: `signup-${user.id}`,
        type: 'signup',
        title: 'New user signed up',
        description: user.email,
        timestamp: user.created_at,
      });
    });

    // Sort by timestamp descending
    activities.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      activities: activities.slice(0, 30),
    });
  } catch (error) {
    console.error('Activity API error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
