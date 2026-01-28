import { NextResponse } from 'next/server';
import { supabase, getDateRange } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = getDateRange('today');
    const week = getDateRange('week');
    const month = getDateRange('month');

    // Total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Users today
    const { count: usersToday } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.start);

    // Users this week
    const { count: usersWeek } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', week.start);

    // Total scans
    const { count: totalScans } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true });

    // Scans today
    const { count: scansToday } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.start);

    // Scans this week
    const { count: scansWeek } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', week.start);

    // Completed scans
    const { count: completedScans } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Failed scans
    const { count: failedScans } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed');

    // Pro users
    const { count: proUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('tier', 'pro');

    // Calculate success rate
    const successRate = totalScans && totalScans > 0
      ? ((completedScans || 0) / totalScans) * 100
      : 0;

    // Calculate scans per user
    const scansPerUser = totalUsers && totalUsers > 0
      ? (totalScans || 0) / totalUsers
      : 0;

    return NextResponse.json({
      users: {
        total: totalUsers || 0,
        today: usersToday || 0,
        week: usersWeek || 0,
        pro: proUsers || 0,
      },
      scans: {
        total: totalScans || 0,
        today: scansToday || 0,
        week: scansWeek || 0,
        completed: completedScans || 0,
        failed: failedScans || 0,
        successRate: successRate.toFixed(1),
        perUser: scansPerUser.toFixed(1),
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
