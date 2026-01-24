import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Rate limit constants - disabled for development
const RATE_LIMIT_ENABLED = false;
const ANONYMOUS_LIMIT = 5;
const HOUR_IN_MS = 60 * 60 * 1000;

// Initialize Redis connection for BullMQ
function getRedisConnection() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL is not configured');
  }
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
  });
}

// Get or create scan queue
let scanQueue: Queue | null = null;
function getScanQueue() {
  if (!scanQueue) {
    const connection = getRedisConnection();
    scanQueue = new Queue('scans', { connection });
  }
  return scanQueue;
}

// Priority levels (lower = higher priority)
const PRIORITY_PRO = 1;
const PRIORITY_FREE = 5;
const PRIORITY_ANONYMOUS = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, fingerprint, userId } = body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] ?? realIp ?? 'unknown';

    // Create identifier for rate limiting (IP + fingerprint)
    const identifier = `${ip}:${fingerprint || 'none'}`;

    const supabase = createServiceClient();

    // Check user tier for priority queue
    let userTier: 'anonymous' | 'free' | 'pro' = 'anonymous';
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', userId)
        .single();

      if (profile?.tier) {
        userTier = profile.tier as 'anonymous' | 'free' | 'pro';
      }
    }

    // Determine job priority based on user tier
    const jobPriority = userTier === 'pro' ? PRIORITY_PRO :
                        userTier === 'free' ? PRIORITY_FREE :
                        PRIORITY_ANONYMOUS;

    // Check rate limit for anonymous users (skip if disabled)
    if (RATE_LIMIT_ENABLED) {
      const { data: rateLimit } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .single();

      const now = new Date();

      if (rateLimit) {
        const windowStart = new Date(rateLimit.window_start);
        const windowAge = now.getTime() - windowStart.getTime();

        if (windowAge < HOUR_IN_MS) {
          // Within rate limit window
          if (rateLimit.scan_count >= ANONYMOUS_LIMIT) {
            return NextResponse.json(
              {
                error: 'Rate limit exceeded',
                message: `You can only scan ${ANONYMOUS_LIMIT} sites per hour. Create an account for more scans.`,
                retryAfter: Math.ceil((HOUR_IN_MS - windowAge) / 1000),
              },
              { status: 429 }
            );
          }

          // Increment counter
          await supabase
            .from('rate_limits')
            .update({ scan_count: rateLimit.scan_count + 1 })
            .eq('id', rateLimit.id);
        } else {
          // Window expired, reset
          await supabase
            .from('rate_limits')
            .update({
              scan_count: 1,
              window_start: now.toISOString(),
            })
            .eq('id', rateLimit.id);
        }
      } else {
        // Create new rate limit record
        await supabase.from('rate_limits').insert({
          identifier,
          scan_count: 1,
        });
      }
    }

    // Create scan record in database
    const { data: scan, error: insertError } = await supabase
      .from('scans')
      .insert({
        url: parsedUrl.href,
        status: 'pending',
        ip_address: ip,
        fingerprint: fingerprint || null,
        user_id: userId || null,
      })
      .select('id')
      .single();

    if (insertError || !scan) {
      console.error('Failed to create scan:', insertError);
      return NextResponse.json(
        { error: 'Failed to create scan' },
        { status: 500 }
      );
    }

    // Add job to queue
    try {
      const queue = getScanQueue();
      await queue.add(
        'scan',
        {
          scanId: scan.id,
          url: parsedUrl.href,
          userTier,
        },
        {
          jobId: scan.id,
          priority: jobPriority, // Pro users get processed first
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: {
            age: 3600, // Keep completed jobs for 1 hour
            count: 1000,
          },
          removeOnFail: {
            age: 24 * 3600, // Keep failed jobs for 24 hours
          },
        }
      );
    } catch (queueError) {
      console.error('Failed to add job to queue:', queueError);
      // Update scan status to failed
      await supabase
        .from('scans')
        .update({
          status: 'failed',
          error_message: 'Failed to queue scan job',
        })
        .eq('id', scan.id);

      return NextResponse.json(
        { error: 'Failed to queue scan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      scanId: scan.id,
      status: 'pending',
    });
  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
