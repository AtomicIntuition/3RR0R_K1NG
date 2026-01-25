import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { stripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get cancellation reason
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Get user profile with subscription ID
    const serviceClient = createServiceClient();
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Cancel at period end (user keeps access until end of billing period)
    const subscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      {
        cancel_at_period_end: true,
        metadata: {
          cancellation_reason: reason || 'not_specified',
          canceled_by: user.id,
          canceled_at: new Date().toISOString(),
        },
      }
    );

    // Log cancellation for analytics (optional - store in your own table)
    console.log(`Subscription canceled: ${subscription.id}, reason: ${reason}, user: ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      cancelAt: new Date(subscription.current_period_end * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
