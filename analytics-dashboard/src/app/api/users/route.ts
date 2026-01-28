import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get all users with their scan counts
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        tier,
        scan_credits,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Get scan counts per user
    const userIds = users?.map((u) => u.id) || [];
    const { data: scanCounts } = await supabase
      .from('scans')
      .select('user_id')
      .in('user_id', userIds);

    const scanCountMap: Record<string, number> = {};
    scanCounts?.forEach((scan) => {
      if (scan.user_id) {
        scanCountMap[scan.user_id] = (scanCountMap[scan.user_id] || 0) + 1;
      }
    });

    const enrichedUsers = users?.map((user) => ({
      ...user,
      scanCount: scanCountMap[user.id] || 0,
    }));

    // User growth over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group by day
    const usersByDay: Record<string, number> = {};
    recentUsers?.forEach((user) => {
      const day = new Date(user.created_at).toISOString().split('T')[0];
      usersByDay[day] = (usersByDay[day] || 0) + 1;
    });

    // Fill in missing days
    const growth = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const day = date.toISOString().split('T')[0];
      growth.push({
        date: day,
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: usersByDay[day] || 0,
      });
    }

    // Tier breakdown
    const tierBreakdown = [
      { name: 'Free', value: users?.filter((u) => u.tier === 'free').length || 0 },
      { name: 'Pro', value: users?.filter((u) => u.tier === 'pro').length || 0 },
    ];

    return NextResponse.json({
      users: enrichedUsers || [],
      growth,
      tierBreakdown,
    });
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
