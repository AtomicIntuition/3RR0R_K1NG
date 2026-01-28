import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const MAX_MONITORED_SITES_FREE = 0;
const MAX_MONITORED_SITES_PRO = 5;

// GET - List user's monitored sites
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const supabase = createServiceClient();

    const { data: sites, error } = await supabase
      .from('monitored_sites')
      .select(`
        id,
        url,
        name,
        frequency,
        is_active,
        last_score,
        last_grade,
        last_scanned_at,
        alert_on_drop,
        alert_threshold,
        created_at,
        next_scan_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching monitored sites:', error);
      return NextResponse.json({ error: 'Failed to fetch monitored sites' }, { status: 500 });
    }

    return NextResponse.json({ sites });
  } catch (error) {
    console.error('Monitored sites GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add a site to monitor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, url, name, frequency = 'weekly' } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    // Validate URL
    let normalizedUrl: string;
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      normalizedUrl = parsed.origin + parsed.pathname.replace(/\/$/, '');
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Check user's tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const maxSites = profile.tier === 'pro' ? MAX_MONITORED_SITES_PRO : MAX_MONITORED_SITES_FREE;

    if (maxSites === 0) {
      return NextResponse.json(
        { error: 'Upgrade to Pro to monitor sites', upgrade: true },
        { status: 403 }
      );
    }

    // Check current count
    const { count, error: countError } = await supabase
      .from('monitored_sites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (countError) {
      return NextResponse.json({ error: 'Failed to check site count' }, { status: 500 });
    }

    if (count && count >= maxSites) {
      return NextResponse.json(
        { error: `Maximum ${maxSites} monitored sites allowed on your plan`, limit: true },
        { status: 400 }
      );
    }

    // Calculate next scan time based on frequency
    const nextScanAt = new Date();
    if (frequency === 'daily') {
      nextScanAt.setDate(nextScanAt.getDate() + 1);
    } else {
      nextScanAt.setDate(nextScanAt.getDate() + 7);
    }

    // Insert the monitored site
    const { data: site, error: insertError } = await supabase
      .from('monitored_sites')
      .insert({
        user_id: userId,
        url: normalizedUrl,
        name: name || new URL(normalizedUrl).hostname,
        frequency,
        next_scan_at: nextScanAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'This site is already being monitored' },
          { status: 400 }
        );
      }
      console.error('Error adding monitored site:', insertError);
      return NextResponse.json({ error: 'Failed to add monitored site' }, { status: 500 });
    }

    return NextResponse.json({ site, message: 'Site added to monitoring' });
  } catch (error) {
    console.error('Monitored sites POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a monitored site
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('monitored_sites')
      .delete()
      .eq('id', siteId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing monitored site:', error);
      return NextResponse.json({ error: 'Failed to remove monitored site' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Monitored sites DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update monitored site settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, siteId, is_active, alert_on_drop, alert_threshold, frequency } = body;

    if (!userId || !siteId) {
      return NextResponse.json({ error: 'User ID and Site ID required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const updates: Record<string, unknown> = {};
    if (typeof is_active === 'boolean') updates.is_active = is_active;
    if (typeof alert_on_drop === 'boolean') updates.alert_on_drop = alert_on_drop;
    if (typeof alert_threshold === 'number') updates.alert_threshold = alert_threshold;
    if (frequency) updates.frequency = frequency;

    const { data: site, error } = await supabase
      .from('monitored_sites')
      .update(updates)
      .eq('id', siteId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating monitored site:', error);
      return NextResponse.json({ error: 'Failed to update monitored site' }, { status: 500 });
    }

    return NextResponse.json({ site });
  } catch (error) {
    console.error('Monitored sites PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
