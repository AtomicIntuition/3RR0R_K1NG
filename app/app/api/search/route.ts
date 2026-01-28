import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 3) {
      return NextResponse.json(
        { error: 'Search query must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Normalize the search query
    const normalizedQuery = query
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');

    const supabase = createServiceClient();

    // Search for completed scans matching the domain
    const { data: scans, error } = await supabase
      .from('scans')
      .select('id, url, score_overall, letter_grade, created_at, roast_title')
      .eq('status', 'completed')
      .ilike('url', `%${normalizedQuery}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      );
    }

    // Transform results
    const results = (scans || []).map((scan) => ({
      id: scan.id,
      url: scan.url,
      domain: new URL(scan.url).hostname,
      score: scan.score_overall,
      grade: scan.letter_grade,
      roastTitle: scan.roast_title,
      scannedAt: scan.created_at,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
