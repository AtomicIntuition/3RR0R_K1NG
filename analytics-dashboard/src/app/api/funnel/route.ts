import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get total scans (including anonymous)
    const { count: totalScans } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true });

    // Anonymous scans (no user_id)
    const { count: anonScans } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .is('user_id', null);

    // Scans by registered users
    const { count: registeredScans } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .not('user_id', 'is', null);

    // Total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Pro users
    const { count: proUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('tier', 'pro');

    // Calculate conversion rates
    const scanToSignup = totalScans && totalScans > 0
      ? ((totalUsers || 0) / totalScans) * 100
      : 0;

    const signupToPro = totalUsers && totalUsers > 0
      ? ((proUsers || 0) / totalUsers) * 100
      : 0;

    const funnel = [
      {
        name: 'Total Scans',
        value: totalScans || 0,
        conversionRate: 100,
      },
      {
        name: 'Registered Users',
        value: totalUsers || 0,
        conversionRate: scanToSignup,
      },
      {
        name: 'Pro Subscribers',
        value: proUsers || 0,
        conversionRate: signupToPro,
      },
    ];

    // Weekly cohort analysis
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id, created_at, tier')
      .gte('created_at', fourWeeksAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group by week
    const cohorts: Record<string, { total: number; pro: number }> = {};
    recentUsers?.forEach((user) => {
      const date = new Date(user.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!cohorts[weekKey]) {
        cohorts[weekKey] = { total: 0, pro: 0 };
      }
      cohorts[weekKey].total++;
      if (user.tier === 'pro') {
        cohorts[weekKey].pro++;
      }
    });

    const cohortData = Object.entries(cohorts).map(([week, data]) => ({
      week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      signups: data.total,
      conversions: data.pro,
      rate: data.total > 0 ? ((data.pro / data.total) * 100).toFixed(1) : '0',
    }));

    return NextResponse.json({
      funnel,
      cohorts: cohortData,
      metrics: {
        anonScans: anonScans || 0,
        registeredScans: registeredScans || 0,
        scanToSignupRate: scanToSignup.toFixed(1),
        signupToProRate: signupToPro.toFixed(1),
      },
    });
  } catch (error) {
    console.error('Funnel API error:', error);
    return NextResponse.json({ error: 'Failed to fetch funnel data' }, { status: 500 });
  }
}
