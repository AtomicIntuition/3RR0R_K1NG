import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, PRODUCTS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, mode } = body;

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

    // Get origin for redirect URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const session = await createCheckoutSession({
      priceId,
      mode,
      successUrl: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/pricing`,
      metadata: {
        // Add user ID here if authenticated
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
