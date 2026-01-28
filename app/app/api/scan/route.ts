import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { RATE_LIMITS } from '@/lib/constants';
import { validateApiKey, getApiKeyFromRequest } from '@/lib/api-key';

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
    // Check for API key authentication first
    const apiKey = getApiKeyFromRequest(request);
    let apiKeyUser = null;
    if (apiKey) {
      apiKeyUser = await validateApiKey(apiKey);
      if (!apiKeyUser) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    const { url, fingerprint, userId: bodyUserId, persona = 'hacker', skipRoast = false } = body;

    // Use API key user ID if authenticated via API key, otherwise use body userId
    const userId = apiKeyUser?.id || bodyUserId;

    // Validate persona
    const validPersonas = ['hacker', 'gordon', 'parent', 'interviewer', 'drill', 'meme', 'therapist'];
    const selectedPersona = validPersonas.includes(persona) ? persona : 'hacker';

    // Validate skipRoast
    const shouldSkipRoast = Boolean(skipRoast);

    // Validate URL
    if (!url || typeof url !== 'string' || url.length > 2048) {
      return NextResponse.json(
        { error: 'URL is required and must be under 2048 characters' },
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

    // Sanitize fingerprint (optional, used for rate limiting)
    const sanitizedFingerprint = fingerprint && typeof fingerprint === 'string'
      ? fingerprint.slice(0, 64).replace(/[^a-zA-Z0-9-_]/g, '')
      : null;

    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] ?? realIp ?? 'unknown';

    // Create identifier for anonymous rate limiting (IP + fingerprint)
    const identifier = `${ip}:${sanitizedFingerprint || 'none'}`;

    const supabase = createServiceClient();

    // Check user tier and enforce rate limits
    let userTier: 'anonymous' | 'free' | 'pro' = 'anonymous';
    let canScan = true;
    let rateLimitMessage = '';

    // If authenticated via API key, use the tier from API key validation
    if (apiKeyUser) {
      userTier = apiKeyUser.tier;
    }

    if (userId) {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier, scans_today, last_scan_date, scans_this_month, billing_cycle_start, scan_credits')
        .eq('id', userId)
        .single();

      if (profile?.tier) {
        userTier = profile.tier as 'anonymous' | 'free' | 'pro';
      }

      const today = new Date().toISOString().split('T')[0];
      const scansToday = profile?.last_scan_date === today ? (profile?.scans_today || 0) : 0;

      if (userTier === 'free') {
        // Check if they have purchased scan credits
        const scanCredits = profile?.scan_credits || 0;

        if (scanCredits > 0) {
          // Use a scan credit
          await supabase
            .from('profiles')
            .update({ scan_credits: scanCredits - 1 })
            .eq('id', userId);
        } else if (scansToday >= RATE_LIMITS.FREE_DAILY_LIMIT) {
          // Free user hit daily limit and no credits
          canScan = false;
          rateLimitMessage = `You've used all ${RATE_LIMITS.FREE_DAILY_LIMIT} free scans for today. Upgrade to Pro or purchase a scan pack for more.`;
        } else {
          // Increment daily scan count
          await supabase
            .from('profiles')
            .update({
              scans_today: scansToday + 1,
              last_scan_date: today,
            })
            .eq('id', userId);
        }
      } else if (userTier === 'pro') {
        // Pro users get 200 scans/month
        const now = new Date();
        const billingStart = profile?.billing_cycle_start ? new Date(profile.billing_cycle_start) : null;

        // Check if we're in a new billing cycle (30 days)
        let scansThisMonth = profile?.scans_this_month || 0;
        if (billingStart) {
          const daysSinceBillingStart = Math.floor((now.getTime() - billingStart.getTime()) / RATE_LIMITS.DAY_IN_MS);
          if (daysSinceBillingStart >= 30) {
            // New billing cycle, reset counter
            scansThisMonth = 0;
            await supabase
              .from('profiles')
              .update({
                scans_this_month: 1,
                billing_cycle_start: now.toISOString().split('T')[0],
              })
              .eq('id', userId);
          } else if (scansThisMonth >= RATE_LIMITS.PRO_MONTHLY_LIMIT) {
            canScan = false;
            rateLimitMessage = `You've used all ${RATE_LIMITS.PRO_MONTHLY_LIMIT} Pro scans this month. Your limit resets on your next billing date.`;
          } else {
            // Increment monthly scan count
            await supabase
              .from('profiles')
              .update({ scans_this_month: scansThisMonth + 1 })
              .eq('id', userId);
          }
        } else {
          // First scan as Pro, set billing cycle start
          await supabase
            .from('profiles')
            .update({
              scans_this_month: 1,
              billing_cycle_start: now.toISOString().split('T')[0],
            })
            .eq('id', userId);
        }
      }
    } else {
      // Anonymous user - rate limit by IP + fingerprint
      const { data: rateLimit } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .single();

      const now = new Date();
      const hourInMs = 60 * 60 * 1000;
      const anonymousLimit = 2; // Anonymous gets 2 scans per hour

      if (rateLimit) {
        const windowStart = new Date(rateLimit.window_start);
        const windowAge = now.getTime() - windowStart.getTime();

        if (windowAge < hourInMs) {
          // Within rate limit window
          if (rateLimit.scan_count >= anonymousLimit) {
            canScan = false;
            rateLimitMessage = `You've used your ${anonymousLimit} free scans. Create a free account to get ${RATE_LIMITS.FREE_DAILY_LIMIT} scans per day!`;
          } else {
            // Increment counter
            await supabase
              .from('rate_limits')
              .update({ scan_count: rateLimit.scan_count + 1 })
              .eq('id', rateLimit.id);
          }
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

    // Return rate limit error if user can't scan
    if (!canScan) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: rateLimitMessage,
          requiresUpgrade: true,
          userTier,
        },
        { status: 429 }
      );
    }

    // Determine job priority based on user tier
    const jobPriority = userTier === 'pro' ? PRIORITY_PRO :
                        userTier === 'free' ? PRIORITY_FREE :
                        PRIORITY_ANONYMOUS;

    // Create scan record in database
    const { data: scan, error: insertError } = await supabase
      .from('scans')
      .insert({
        url: parsedUrl.href,
        status: 'pending',
        ip_address: ip,
        fingerprint: sanitizedFingerprint,
        user_id: userId || null,
        roast_persona: selectedPersona,
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
          persona: selectedPersona,
          skipRoast: shouldSkipRoast,
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
