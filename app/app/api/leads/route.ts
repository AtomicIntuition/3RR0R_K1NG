import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

// Email regex for basic validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254; // RFC 5321
const VALID_SOURCES = ['scan_gate', 'signup', 'newsletter', 'unknown'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source } = body;

    // Validate email format and length
    if (
      !email ||
      typeof email !== 'string' ||
      email.length > MAX_EMAIL_LENGTH ||
      !EMAIL_REGEX.test(email)
    ) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Sanitize source to allowlist
    const sanitizedSource = VALID_SOURCES.includes(source) ? source : 'unknown';

    const supabase = createServiceClient();

    // Store the lead
    const { error: insertError } = await supabase
      .from('leads')
      .upsert(
        {
          email: email.toLowerCase().trim(),
          source: sanitizedSource,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: 'email',
          ignoreDuplicates: true,
        }
      );

    if (insertError) {
      // Log but don't fail - lead capture is non-critical
      console.error('Failed to store lead:', insertError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead capture error:', error);
    // Return success anyway - don't block user flow for lead capture issues
    return NextResponse.json({ success: true });
  }
}
