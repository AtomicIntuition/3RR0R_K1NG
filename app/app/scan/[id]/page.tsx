import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { dbScanToScan, type DbScan, type Scan } from '@/types/scan';
import { getGrade } from '@/lib/scoring';
import { ScanResultsClient } from './ScanResultsClient';

async function fetchScan(id: string): Promise<Scan | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return dbScanToScan(data as DbScan);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const scan = await fetchScan(id);

  if (!scan || !scan.scoreOverall) {
    return { title: 'Scan Results | Crisp' };
  }

  const domain = (() => {
    try { return new URL(scan.url).hostname; } catch { return scan.url; }
  })();
  const grade = scan.letterGrade || getGrade(scan.scoreOverall);
  const title = `${domain} - ${scan.scoreOverall}/100 (${grade}) | Crisp Audit`;
  const description = scan.analysisTitle || `Website audit results for ${domain}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialScan = await fetchScan(id);
  return <ScanResultsClient initialScan={initialScan} scanId={id} />;
}
