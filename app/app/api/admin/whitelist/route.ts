import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

// Admin emails from environment variable (comma-separated)
// Set ADMIN_EMAILS=you@example.com,other@example.com in .env.local
function getAdminEmails(): string[] {
  const adminEmails = process.env.ADMIN_EMAILS || '';
  return adminEmails
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
}

// Rate limiting: max admin API requests per minute
const ADMIN_RATE_LIMIT = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Helper to verify admin access and check rate limit
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing authorization header', status: 401 };
  }

  const token = authHeader.substring(7);
  const supabase = createServiceClient();

  // Verify the token and get the user
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { error: 'Invalid token', status: 401 };
  }

  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    return { error: 'No admin emails configured', status: 500 };
  }

  if (!adminEmails.includes((user.email || '').toLowerCase())) {
    return { error: 'Not authorized', status: 403 };
  }

  // Rate limiting by admin user ID
  const rateLimitKey = `admin:${user.id}`;
  const { data: rateLimit } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', rateLimitKey)
    .single();

  const now = new Date();
  if (rateLimit) {
    const windowStart = new Date(rateLimit.window_start);
    const windowAge = now.getTime() - windowStart.getTime();

    if (windowAge < RATE_LIMIT_WINDOW_MS) {
      if (rateLimit.scan_count >= ADMIN_RATE_LIMIT) {
        return { error: 'Too many requests. Please slow down.', status: 429 };
      }
      await supabase
        .from('rate_limits')
        .update({ scan_count: rateLimit.scan_count + 1 })
        .eq('id', rateLimit.id);
    } else {
      await supabase
        .from('rate_limits')
        .update({ scan_count: 1, window_start: now.toISOString() })
        .eq('id', rateLimit.id);
    }
  } else {
    await supabase.from('rate_limits').insert({
      identifier: rateLimitKey,
      scan_count: 1,
    });
  }

  return { user };
}

// GET - List all whitelist entries
export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('email_whitelist')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ whitelist: data });
}

// Email regex for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_NOTE_LENGTH = 500;

// POST - Add email to whitelist
export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { email, granted_tier, expires_at, note } = body;

  // Validate email format and length
  if (
    !email ||
    typeof email !== 'string' ||
    email.length > MAX_EMAIL_LENGTH ||
    !EMAIL_REGEX.test(email)
  ) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  const validTiers = ['free', 'pro'];
  if (granted_tier && !validTiers.includes(granted_tier)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }

  // Sanitize note length
  const sanitizedNote = note && typeof note === 'string'
    ? note.slice(0, MAX_NOTE_LENGTH)
    : null;

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('email_whitelist')
    .insert({
      email: email.toLowerCase().trim(),
      granted_tier: granted_tier || 'pro',
      expires_at: expires_at || null,
      note: sanitizedNote,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Email already whitelisted' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entry: data }, { status: 201 });
}

// DELETE - Remove email from whitelist
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const email = searchParams.get('email');

  if (!id && !email) {
    return NextResponse.json({ error: 'ID or email is required' }, { status: 400 });
  }

  const supabase = createServiceClient();

  let query = supabase.from('email_whitelist').delete();

  if (id) {
    query = query.eq('id', id);
  } else if (email) {
    query = query.eq('email', email.toLowerCase().trim());
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
