import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    const errorMessage = encodeURIComponent(errorDescription || error);
    return NextResponse.redirect(new URL(`/login?error=${errorMessage}`, request.url));
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
      },
    });

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      const errorMessage = encodeURIComponent(exchangeError.message);
      return NextResponse.redirect(new URL(`/login?error=${errorMessage}`, request.url));
    }
  }

  // Redirect to home with a flag indicating successful auth
  // The auth context will pick up the session change
  return NextResponse.redirect(new URL('/?auth=success', request.url));
}
