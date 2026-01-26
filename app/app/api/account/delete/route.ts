import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { stripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function DELETE() {
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

    const serviceClient = createServiceClient();

    // Get user profile
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('id', user.id)
      .single();

    // Step 1: Cancel Stripe subscription immediately (if exists)
    if (profile?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(profile.stripe_subscription_id, {
          prorate: true, // Prorate final invoice
        });
        // Subscription canceled successfully
      } catch (stripeError) {
        console.error('Failed to cancel Stripe subscription:', stripeError);
        // Continue with deletion even if Stripe fails
      }
    }

    // Step 2: Delete user's scans
    const { error: scansError } = await serviceClient
      .from('scans')
      .delete()
      .eq('user_id', user.id);

    if (scansError) {
      console.error('Failed to delete scans:', scansError);
    }

    // Step 3: Delete user's profile (this might cascade automatically)
    const { error: profileError } = await serviceClient
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      console.error('Failed to delete profile:', profileError);
    }

    // Step 4: Update leads table to anonymize (optional - for data retention)
    await serviceClient
      .from('leads')
      .update({ user_id: null })
      .eq('user_id', user.id);

    // Step 5: Delete the auth user using admin API
    const { error: authError } = await serviceClient.auth.admin.deleteUser(user.id);

    if (authError) {
      console.error('Failed to delete auth user:', authError);
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
        { status: 500 }
      );
    }

    // Account deleted successfully

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
