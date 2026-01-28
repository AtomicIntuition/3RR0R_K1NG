import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Recent scans
    const { data: recentScans, error } = await supabase
      .from('scans')
      .select(`
        id,
        url,
        status,
        score_overall,
        letter_grade,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Scan volume over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentScanData } = await supabase
      .from('scans')
      .select('created_at, status')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group by day
    const scansByDay: Record<string, number> = {};
    recentScanData?.forEach((scan) => {
      const day = new Date(scan.created_at).toISOString().split('T')[0];
      scansByDay[day] = (scansByDay[day] || 0) + 1;
    });

    // Fill in missing days
    const volume = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const day = date.toISOString().split('T')[0];
      volume.push({
        date: day,
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        scans: scansByDay[day] || 0,
      });
    }

    // Score distribution
    const { data: completedScans } = await supabase
      .from('scans')
      .select('score_overall')
      .eq('status', 'completed')
      .not('score_overall', 'is', null);

    const scoreRanges = [
      { name: '90-100 (A)', min: 90, max: 100, value: 0 },
      { name: '80-89 (B)', min: 80, max: 89, value: 0 },
      { name: '70-79 (C)', min: 70, max: 79, value: 0 },
      { name: '60-69 (D)', min: 60, max: 69, value: 0 },
      { name: '0-59 (F)', min: 0, max: 59, value: 0 },
    ];

    completedScans?.forEach((scan) => {
      const score = scan.score_overall;
      for (const range of scoreRanges) {
        if (score >= range.min && score <= range.max) {
          range.value++;
          break;
        }
      }
    });

    // Status breakdown
    const statusBreakdown = [
      { name: 'Completed', value: recentScanData?.filter((s) => s.status === 'completed').length || 0 },
      { name: 'Failed', value: recentScanData?.filter((s) => s.status === 'failed').length || 0 },
      { name: 'Pending', value: recentScanData?.filter((s) => s.status === 'pending').length || 0 },
      { name: 'Processing', value: recentScanData?.filter((s) => s.status === 'processing').length || 0 },
    ];

    // Top scanned domains
    const domainCounts: Record<string, number> = {};
    recentScans?.forEach((scan) => {
      try {
        const domain = new URL(scan.url).hostname;
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      } catch {
        // Invalid URL
      }
    });

    const topDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count }));

    // Average score
    const avgScore = completedScans && completedScans.length > 0
      ? completedScans.reduce((sum, s) => sum + (s.score_overall || 0), 0) / completedScans.length
      : 0;

    return NextResponse.json({
      recentScans: recentScans || [],
      volume,
      scoreDistribution: scoreRanges,
      statusBreakdown,
      topDomains,
      averageScore: avgScore.toFixed(1),
    });
  } catch (error) {
    console.error('Scans API error:', error);
    return NextResponse.json({ error: 'Failed to fetch scans' }, { status: 500 });
  }
}
