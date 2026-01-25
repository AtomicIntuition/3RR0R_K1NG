import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Store the lead
    const { error: insertError } = await supabase
      .from('leads')
      .upsert(
        {
          email: email.toLowerCase().trim(),
          source: source || 'unknown',
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
