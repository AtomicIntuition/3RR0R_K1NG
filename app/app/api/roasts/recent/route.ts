import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Fetch recent completed scans with roasts
    const { data: scans, error } = await supabase
      .from('scans')
      .select('id, url, score_overall, letter_grade, roast_title, roast_persona, created_at')
      .eq('status', 'completed')
      .not('roast_title', 'is', null)
      .gt('score_overall', 0)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching recent roasts:', error);
      return NextResponse.json({ roasts: [] });
    }

    // Transform to frontend format
    const roasts = (scans || []).map(scan => {
      let domain = 'unknown';
      try {
        domain = new URL(scan.url).hostname.replace('www.', '');
      } catch {
        // Keep unknown
      }

      return {
        id: scan.id,
        url: scan.url,
        domain,
        score: scan.score_overall || 0,
        letterGrade: scan.letter_grade || 'F',
        roastTitle: scan.roast_title || 'No roast available',
        persona: scan.roast_persona || 'hacker',
      };
    });

    return NextResponse.json({ roasts });
  } catch (error) {
    console.error('Recent roasts API error:', error);
    return NextResponse.json({ roasts: [] });
  }
}
