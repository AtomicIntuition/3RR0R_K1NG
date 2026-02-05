import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { dbScanToScan, DbScan } from '@/types/scan';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Look up the session
    const { data: session, error: sessionError } = await supabase
      .from('tv_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if expired
    if (session.status === 'pending' && new Date(session.expires_at) < new Date()) {
      await supabase
        .from('tv_sessions')
        .update({ status: 'expired' })
        .eq('id', sessionId);

      return NextResponse.json({ status: 'expired' });
    }

    if (session.status === 'expired') {
      return NextResponse.json({ status: 'expired' });
    }

    if (session.status === 'pending') {
      return NextResponse.json({ status: 'pending' });
    }

    // Session is active — update last_seen_at and fetch user's scans
    await supabase
      .from('tv_sessions')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', sessionId);

    // Fetch user's completed scans (top 20, most recent first)
    const { data: scans, error: scansError } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', session.user_id!)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(20);

    if (scansError) {
      console.error('Error fetching scans for TV:', scansError);
      return NextResponse.json({ error: 'Failed to fetch scans' }, { status: 500 });
    }

    const transformedScans = (scans as unknown as DbScan[]).map(dbScanToScan);

    return NextResponse.json({
      status: 'active',
      scans: transformedScans,
    });
  } catch (error) {
    console.error('TV session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
