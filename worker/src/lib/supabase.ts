import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}

// Type definitions for database operations
export interface ScanUpdate {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  score_overall?: number;
  score_performance?: number;
  score_security?: number;
  score_seo?: number;
  score_accessibility?: number;
  score_code_quality?: number;
  results_performance?: unknown;
  results_security?: unknown;
  results_seo?: unknown;
  results_accessibility?: unknown;
  results_code_quality?: unknown;
  results_tech_stack?: unknown;
  results_resources?: unknown;
  // Phase 1 new audit results
  results_vulnerabilities?: unknown;
  results_protocol?: unknown;
  results_images?: unknown;
  results_caching?: unknown;
  results_redirects?: unknown;
  // Phase 2 new audit results (file upload)
  scan_type?: 'url' | 'upload';
  uploaded_files?: unknown;
  results_dependencies?: unknown;
  results_secrets?: unknown;
  results_code_patterns?: unknown;
  // Phase 3 new audit results
  results_pwa?: unknown;
  results_structured_data?: unknown;
  results_links?: unknown;
  // Scoring
  letter_grade?: string;
  scoring_breakdown?: unknown;
  roast_title?: string;
  roast_body?: string;
  roast_fixes?: unknown;
  twitter_roast?: string;
  roast_persona?: string;
  llm_report?: string;
  roast_is_fallback?: boolean;
  roast_fallback_reason?: string | null;
  skip_roast?: boolean;
  screenshot_url?: string;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  // Progress tracking
  current_phase?: string;
  completed_phases?: string[];
}

export async function updateScan(scanId: string, update: ScanUpdate): Promise<void> {
  const supabase = getSupabaseClient();

  // Use .select() to verify the update happened and get the result
  const { data, error } = await supabase
    .from('scans')
    .update(update)
    .eq('id', scanId)
    .select('id, status')
    .single();

  if (error) {
    console.error(`Failed to update scan ${scanId}:`, error);
    throw error;
  }

  if (!data) {
    throw new Error(`Scan ${scanId} not found for update`);
  }
}

export async function getScan(scanId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export interface MonitoredSiteUpdate {
  last_scan_id?: string;
  last_score?: number;
  last_grade?: string;
  last_scanned_at?: string;
}

export async function updateMonitoredSite(
  siteId: string,
  update: MonitoredSiteUpdate
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('monitored_sites')
    .update(update)
    .eq('id', siteId);

  if (error) {
    console.error(`Failed to update monitored site ${siteId}:`, error);
    throw error;
  }
}

export interface AlertRecord {
  monitored_site_id: string;
  user_id: string;
  scan_id: string;
  old_score: number;
  new_score: number;
  score_change: number;
  alert_type: 'score_drop' | 'score_improve' | 'site_down';
}

export async function recordAlert(alert: AlertRecord): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('monitor_alerts').insert(alert);

  if (error) {
    console.error('Failed to record alert:', error);
    throw error;
  }
}

export async function getMonitoredSite(siteId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('monitored_sites')
    .select('*, profiles!inner(id)')
    .eq('id', siteId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
