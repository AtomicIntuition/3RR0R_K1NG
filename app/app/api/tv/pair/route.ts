import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import crypto from 'crypto';

// Characters excluding ambiguous ones (0/O, 1/I/L)
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateCode(): string {
  const bytes = crypto.randomBytes(6);
  return Array.from(bytes)
    .map((b) => CHARS[b % CHARS.length])
    .join('');
}

export async function POST() {
  try {
    const supabase = createServiceClient();

    // Cleanup expired pending sessions
    await supabase
      .from('tv_sessions')
      .delete()
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString());

    // Generate unique code (retry on collision)
    let code = generateCode();
    let attempts = 0;

    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('tv_sessions')
        .select('id')
        .eq('code', code)
        .eq('status', 'pending')
        .single();

      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    const { data, error } = await supabase
      .from('tv_sessions')
      .insert({
        code,
        expires_at: expiresAt,
        status: 'pending',
      })
      .select('id, code, expires_at')
      .single();

    if (error) {
      console.error('Error creating TV session:', error);
      return NextResponse.json({ error: 'Failed to create pairing code' }, { status: 500 });
    }

    return NextResponse.json({
      code: data.code,
      sessionId: data.id,
      expiresAt: data.expires_at,
    });
  } catch (error) {
    console.error('TV pair error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
