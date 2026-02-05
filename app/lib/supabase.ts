import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role (bypasses RLS)
export function createServiceClient() {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Type-safe database operations
export type Database = {
  public: {
    Tables: {
      scans: {
        Row: {
          id: string;
          user_id: string | null;
          url: string;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          score_overall: number | null;
          score_performance: number | null;
          score_security: number | null;
          score_seo: number | null;
          score_accessibility: number | null;
          score_code_quality: number | null;
          results_performance: unknown | null;
          results_security: unknown | null;
          results_seo: unknown | null;
          results_accessibility: unknown | null;
          results_code_quality: unknown | null;
          results_tech_stack: unknown | null;
          // Phase 1 audit results
          results_vulnerabilities: unknown | null;
          results_protocol: unknown | null;
          results_images: unknown | null;
          results_caching: unknown | null;
          results_redirects: unknown | null;
          // Phase 2 audit results
          scan_type: 'url' | 'upload';
          uploaded_files: unknown | null;
          results_dependencies: unknown | null;
          results_secrets: unknown | null;
          results_code_patterns: unknown | null;
          // Phase 3 audit results
          results_pwa: unknown | null;
          results_structured_data: unknown | null;
          results_links: unknown | null;
          // Scoring
          letter_grade: string | null;
          scoring_breakdown: unknown | null;
          roast_title: string | null;
          roast_body: string | null;
          roast_fixes: unknown | null;
          llm_report: string | null;
          roast_is_fallback: boolean | null;
          roast_fallback_reason: string | null;
          screenshot_url: string | null;
          error_message: string | null;
          ip_address: string | null;
          fingerprint: string | null;
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          url: string;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          scan_type?: 'url' | 'upload';
          uploaded_files?: unknown | null;
          ip_address?: string | null;
          fingerprint?: string | null;
        };
        Update: {
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          score_overall?: number | null;
          score_performance?: number | null;
          score_security?: number | null;
          score_seo?: number | null;
          score_accessibility?: number | null;
          score_code_quality?: number | null;
          results_performance?: unknown | null;
          results_security?: unknown | null;
          results_seo?: unknown | null;
          results_accessibility?: unknown | null;
          results_code_quality?: unknown | null;
          results_tech_stack?: unknown | null;
          // Phase 1 audit results
          results_vulnerabilities?: unknown | null;
          results_protocol?: unknown | null;
          results_images?: unknown | null;
          results_caching?: unknown | null;
          results_redirects?: unknown | null;
          // Phase 2 audit results
          scan_type?: 'url' | 'upload';
          uploaded_files?: unknown | null;
          results_dependencies?: unknown | null;
          results_secrets?: unknown | null;
          results_code_patterns?: unknown | null;
          // Phase 3 audit results
          results_pwa?: unknown | null;
          results_structured_data?: unknown | null;
          results_links?: unknown | null;
          // Scoring
          letter_grade?: string | null;
          scoring_breakdown?: unknown | null;
          roast_title?: string | null;
          roast_body?: string | null;
          roast_fixes?: unknown | null;
          llm_report?: string | null;
          roast_is_fallback?: boolean | null;
          roast_fallback_reason?: string | null;
          screenshot_url?: string | null;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          tier: 'anonymous' | 'free' | 'pro';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          scans_this_hour: number;
          last_scan_reset: string;
          created_at: string;
          updated_at: string;
        };
      };
      rate_limits: {
        Row: {
          id: string;
          identifier: string;
          scan_count: number;
          window_start: string;
          created_at: string;
        };
        Insert: {
          identifier: string;
          scan_count?: number;
        };
        Update: {
          scan_count?: number;
          window_start?: string;
        };
      };
      email_whitelist: {
        Row: {
          id: string;
          email: string;
          granted_tier: 'anonymous' | 'free' | 'pro';
          expires_at: string | null;
          note: string | null;
          created_at: string;
          used_at: string | null;
        };
        Insert: {
          email: string;
          granted_tier?: 'anonymous' | 'free' | 'pro';
          expires_at?: string | null;
          note?: string | null;
        };
        Update: {
          granted_tier?: 'anonymous' | 'free' | 'pro';
          expires_at?: string | null;
          note?: string | null;
          used_at?: string | null;
        };
      };
      tv_sessions: {
        Row: {
          id: string;
          code: string;
          user_id: string | null;
          status: 'pending' | 'active' | 'expired';
          expires_at: string;
          last_seen_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          user_id?: string | null;
          status?: 'pending' | 'active' | 'expired';
          expires_at: string;
        };
        Update: {
          user_id?: string | null;
          status?: 'pending' | 'active' | 'expired';
          last_seen_at?: string | null;
        };
      };
    };
  };
};
