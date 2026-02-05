import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code, userId } = body;

    if (!code || !userId) {
      return NextResponse.json({ error: 'Code and userId are required' }, { status: 400 });
    }

    const normalizedCode = String(code).toUpperCase().trim();

    if (normalizedCode.length !== 6) {
      return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Verify user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 401 });
    }

    // Find pending session with this code
    const { data: session, error: sessionError } = await supabase
      .from('tv_sessions')
      .select('id, expires_at')
      .eq('code', normalizedCode)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 });
    }

    // Activate the session
    const { error: updateError } = await supabase
      .from('tv_sessions')
      .update({
        user_id: userId,
        status: 'active',
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    if (updateError) {
      console.error('Error activating TV session:', updateError);
      return NextResponse.json({ error: 'Failed to activate session' }, { status: 500 });
    }

    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error('TV activate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
