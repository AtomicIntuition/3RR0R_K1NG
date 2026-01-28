import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Initialize Redis connection for BullMQ
function getRedisConnection() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL not configured');
  }
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
  });
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for this endpoint

// Verify this is a legitimate cron request
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // If no secret is set, allow in development
  if (!cronSecret) {
    return process.env.NODE_ENV === 'development';
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const now = new Date().toISOString();

    // Find all active monitored sites that are due for scanning
    const { data: sites, error: fetchError } = await supabase
      .from('monitored_sites')
      .select(`
        id,
        user_id,
        url,
        frequency,
        last_score,
        alert_on_drop,
        alert_threshold
      `)
      .eq('is_active', true)
      .lte('next_scan_at', now)
      .limit(50); // Process up to 50 sites per cron run

    if (fetchError) {
      console.error('Error fetching monitored sites:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 });
    }

    if (!sites || sites.length === 0) {
      return NextResponse.json({ message: 'No sites due for scanning', count: 0 });
    }

    // Get user profiles for priority
    const userIds = [...new Set(sites.map(s => s.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, tier, email')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Initialize queue
    const connection = getRedisConnection();
    const queue = new Queue('scans', { connection });

    const results = [];

    for (const site of sites) {
      const profile = profileMap.get(site.user_id);
      if (!profile) continue;

      // Create a scan record
      const { data: scan, error: scanError } = await supabase
        .from('scans')
        .insert({
          url: site.url,
          status: 'pending',
          user_id: site.user_id,
          is_monitored_scan: true,
          monitored_site_id: site.id,
        })
        .select()
        .single();

      if (scanError || !scan) {
        console.error(`Failed to create scan for ${site.url}:`, scanError);
        continue;
      }

      // Add to queue with priority (Pro users get priority 1)
      const priority = profile.tier === 'pro' ? 1 : 5;

      await queue.add(
        'scan',
        {
          scanId: scan.id,
          url: site.url,
          userId: site.user_id,
          isMonitoredScan: true,
          monitoredSiteId: site.id,
          previousScore: site.last_score,
          alertOnDrop: site.alert_on_drop,
          alertThreshold: site.alert_threshold,
          userEmail: profile.email,
        },
        { priority }
      );

      // Calculate next scan time
      const nextScanAt = new Date();
      if (site.frequency === 'daily') {
        nextScanAt.setDate(nextScanAt.getDate() + 1);
      } else {
        nextScanAt.setDate(nextScanAt.getDate() + 7);
      }

      // Update the monitored site with next scan time
      await supabase
        .from('monitored_sites')
        .update({
          next_scan_at: nextScanAt.toISOString(),
        })
        .eq('id', site.id);

      results.push({
        siteId: site.id,
        url: site.url,
        scanId: scan.id,
        nextScanAt: nextScanAt.toISOString(),
      });
    }

    await queue.close();
    await connection.quit();

    return NextResponse.json({
      message: `Queued ${results.length} monitoring scans`,
      count: results.length,
      scans: results,
    });
  } catch (error) {
    console.error('Monitor cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
