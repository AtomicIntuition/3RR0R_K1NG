import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, getApiKeyFromRequest } from '@/lib/api-key';

// GET - Verify API key and return user info
export async function GET(request: NextRequest) {
  try {
    const apiKey = getApiKeyFromRequest(request);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required', message: 'Provide API key via Authorization: Bearer <key> header' },
        { status: 401 }
      );
    }

    const user = await validateApiKey(apiKey);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        tier: user.tier,
        scanCredits: user.scanCredits,
      },
    });
  } catch (error) {
    console.error('Auth verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
