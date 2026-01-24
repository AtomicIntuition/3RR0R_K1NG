import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { dbScanToScan, type DbScan } from '@/types/scan';

// Disable caching for this endpoint - it needs to return fresh data on every poll
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid scan ID format' },
        { status: 400 }
      );
    }

    // Create a fresh client for each request to avoid any caching
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: scan, error } = await supabase
      .from('scans')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !scan) {
      console.error('Scan fetch error:', error);
      return NextResponse.json(
        { error: 'Scan not found' },
        { status: 404 }
      );
    }


    // Transform database row to API response
    const transformedScan = dbScanToScan(scan as DbScan);

    // Calculate progress for pending/processing scans
    let progress = undefined;
    if (scan.status === 'pending') {
      progress = {
        phase: 'Waiting in queue...',
        percentage: 5,
      };
    } else if (scan.status === 'processing') {
      // Estimate progress based on which results are available
      let completedPhases = 0;
      if (scan.results_security) completedPhases++;
      if (scan.results_performance) completedPhases++;
      if (scan.results_seo) completedPhases++;
      if (scan.results_accessibility) completedPhases++;
      if (scan.results_code_quality) completedPhases++;
      if (scan.results_tech_stack) completedPhases++;
      if (scan.roast_title) completedPhases++;

      const phases = [
        'Analyzing security headers...',
        'Running performance audit...',
        'Checking SEO configuration...',
        'Testing accessibility...',
        'Detecting tech stack...',
        'Generating roast...',
        'Finalizing report...',
      ];

      progress = {
        phase: phases[Math.min(completedPhases, phases.length - 1)],
        percentage: Math.min(10 + completedPhases * 12, 95),
      };
    }

    return NextResponse.json({
      scan: transformedScan,
      progress,
    });
  } catch (error) {
    console.error('Scan poll error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
