import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createCheckoutSession, PRODUCTS } from '@/lib/stripe';

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
    const { priceId, mode, applyExitDiscount } = body;

    if (!priceId || !mode) {
      return NextResponse.json(
        { error: 'Price ID and mode are required' },
        { status: 400 }
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

    // Get authenticated user ID
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
      return NextResponse.json(
        { error: 'You must be logged in to make a purchase' },
        { status: 401 }
      );
    }

    // Apply exit intent coupon if requested
    const exitIntentCouponId = process.env.STRIPE_EXIT_INTENT_COUPON_ID;
    const couponId = applyExitDiscount && exitIntentCouponId ? exitIntentCouponId : undefined;

    const session = await createCheckoutSession({
      priceId,
      mode,
      successUrl: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/pricing`,
      couponId,
      customerEmail: user.email,
      metadata: {
        userId: user.id, // Critical: needed for webhook to attribute purchase
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
