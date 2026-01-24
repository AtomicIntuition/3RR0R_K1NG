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
  roast_title?: string;
  roast_body?: string;
  roast_fixes?: unknown;
  screenshot_url?: string;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
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
