import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, stripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription') {
          // Handle subscription creation
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const userId = session.metadata?.userId;
          if (userId) {
            await supabase.from('profiles').update({
              tier: 'pro',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
            }).eq('id', userId);
          }
        } else if (session.mode === 'payment') {
          // Handle one-time payment (scan pack)
          const userId = session.metadata?.userId;
          const scanCount = parseInt(session.metadata?.scanCount || '0', 10);

          if (userId && scanCount > 0) {
            // Add scans to user's account
            const { data: profile } = await supabase
              .from('profiles')
              .select('scans_this_hour')
              .eq('id', userId)
              .single();

            if (profile) {
              // Reset their rate limit and add purchased scans
              await supabase.from('profiles').update({
                scans_this_hour: 0,
                stripe_customer_id: session.customer as string,
              }).eq('id', userId);
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';
          await supabase.from('profiles').update({
            tier: isActive ? 'pro' : 'free',
            stripe_subscription_id: isActive ? subscription.id : null,
          }).eq('id', profile.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID and downgrade to free
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase.from('profiles').update({
            tier: 'free',
            stripe_subscription_id: null,
          }).eq('id', profile.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Log payment failure - could send email notification here
        console.error(`Payment failed for customer ${customerId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
