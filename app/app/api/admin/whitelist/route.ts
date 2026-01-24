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

// Helper to verify admin access
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

// POST - Add email to whitelist
export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { email, granted_tier, expires_at, note } = body;

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const validTiers = ['free', 'pro'];
  if (granted_tier && !validTiers.includes(granted_tier)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('email_whitelist')
    .insert({
      email: email.toLowerCase().trim(),
      granted_tier: granted_tier || 'pro',
      expires_at: expires_at || null,
      note: note || null,
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
