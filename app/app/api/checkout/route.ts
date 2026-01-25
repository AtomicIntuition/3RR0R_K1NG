import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, PRODUCTS } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase';

// Allowed origins for redirect URLs
const ALLOWED_ORIGINS = [
  'https://3rrork1ng.com',
  'https://www.3rrork1ng.com',
  'http://localhost:3000',
];

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, mode, applyExitDiscount, userId, userEmail } = body;

    if (!priceId || !mode) {
      return NextResponse.json(
        { error: 'Price ID and mode are required' },
        { status: 400 }
      );
    }

    // Require userId from frontend (session is stored in localStorage)
    if (!userId) {
      return NextResponse.json(
        { error: 'You must be logged in to make a purchase' },
        { status: 401 }
      );
    }

    // Validate price ID
    const validPriceIds = [
      PRODUCTS.scanPack.priceId,
      PRODUCTS.proMonthly.priceId,
      PRODUCTS.proYearly.priceId,
    ];

    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Validate origin for redirect URLs (security fix)
    const requestOrigin = request.headers.get('origin');
    const origin = ALLOWED_ORIGINS.includes(requestOrigin || '')
      ? requestOrigin
      : ALLOWED_ORIGINS[0]; // Default to production domain

    // Verify user exists in database
    const supabase = createServiceClient();
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Invalid user' },
        { status: 401 }
      );
    }

    // Use email from profile (more secure than trusting frontend)
    const email = profile.email || userEmail;

    // Apply exit intent coupon if requested
    const exitIntentCouponId = process.env.STRIPE_EXIT_INTENT_COUPON_ID;
    const couponId = applyExitDiscount && exitIntentCouponId ? exitIntentCouponId : undefined;

    const session = await createCheckoutSession({
      priceId,
      mode,
      successUrl: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/pricing`,
      couponId,
      customerEmail: email,
      metadata: {
        userId, // Critical: needed for webhook to attribute purchase
        scanCount: priceId === PRODUCTS.scanPack.priceId
          ? PRODUCTS.scanPack.scans.toString()
          : '0',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
