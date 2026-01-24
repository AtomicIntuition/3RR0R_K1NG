export type ScanStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type UserTier = 'anonymous' | 'free' | 'pro';

export interface SecurityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  recommendation: string;
  passed: boolean;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  score: number; // 0-100
  displayValue: string;
}

export interface SEOFinding {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  value?: string;
}

export interface AccessibilityViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodes: number;
  selectors?: string[]; // CSS selectors of affected elements
  failureSummary?: string; // Details about how to fix
}

export interface CodeQualityIssue {
  id: string;
  type: 'console_error' | 'broken_link' | 'deprecated_api' | 'mixed_content';
  message: string;
  source?: string;
  count: number;
}

export interface TechStackItem {
  name: string;
  category: 'framework' | 'library' | 'cms' | 'analytics' | 'cdn' | 'hosting' | 'other';
  version?: string;
  confidence: number;
  icon?: string;
}

export interface RoastFix {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'performance' | 'security' | 'seo' | 'accessibility' | 'code_quality';
  title: string;
  description: string;
  effort: 'quick' | 'medium' | 'significant';
}

export interface ScanResults {
  performance: {
    score: number;
    metrics: PerformanceMetric[];
  };
  security: {
    score: number;
    findings: SecurityFinding[];
  };
  seo: {
    score: number;
    findings: SEOFinding[];
  };
  accessibility: {
    score: number;
    violations: AccessibilityViolation[];
    passes: number;
  };
  codeQuality: {
    score: number;
    issues: CodeQualityIssue[];
  };
  techStack: TechStackItem[];
}

export interface Scan {
  id: string;
  url: string;
  status: ScanStatus;
  userId?: string;

  // Scores
  scoreOverall?: number;
  scorePerformance?: number;
  scoreSecurity?: number;
  scoreSeo?: number;
  scoreAccessibility?: number;
  scoreCodeQuality?: number;

  // Detailed results
  resultsPerformance?: ScanResults['performance'];
  resultsSecurity?: ScanResults['security'];
  resultsSeo?: ScanResults['seo'];
  resultsAccessibility?: ScanResults['accessibility'];
  resultsCodeQuality?: ScanResults['codeQuality'];
  resultsTechStack?: ScanResults['techStack'];

  // Roast content
  roastTitle?: string;
  roastBody?: string;
  roastFixes?: RoastFix[];
  llmReport?: string; // LLM-ready detailed report for AI assistants

  // Metadata
  screenshotUrl?: string;
  errorMessage?: string;

  // Timestamps
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CreateScanRequest {
  url: string;
  fingerprint?: string;
}

export interface CreateScanResponse {
  scanId: string;
  status: ScanStatus;
}

export interface ScanPollResponse {
  scan: Scan;
  progress?: {
    phase: string;
    percentage: number;
  };
}

// Database row types (snake_case)
export interface DbScan {
  id: string;
  user_id: string | null;
  url: string;
  status: ScanStatus;
  score_overall: number | null;
  score_performance: number | null;
  score_security: number | null;
  score_seo: number | null;
  score_accessibility: number | null;
  score_code_quality: number | null;
  results_performance: ScanResults['performance'] | null;
  results_security: ScanResults['security'] | null;
  results_seo: ScanResults['seo'] | null;
  results_accessibility: ScanResults['accessibility'] | null;
  results_code_quality: ScanResults['codeQuality'] | null;
  results_tech_stack: ScanResults['techStack'] | null;
  roast_title: string | null;
  roast_body: string | null;
  roast_fixes: RoastFix[] | null;
  llm_report: string | null;
  screenshot_url: string | null;
  error_message: string | null;
  ip_address: string | null;
  fingerprint: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

// Utility function to transform DB row to Scan type
export function dbScanToScan(row: DbScan): Scan {
  return {
    id: row.id,
    url: row.url,
    status: row.status,
    userId: row.user_id ?? undefined,
    scoreOverall: row.score_overall ?? undefined,
    scorePerformance: row.score_performance ?? undefined,
    scoreSecurity: row.score_security ?? undefined,
    scoreSeo: row.score_seo ?? undefined,
    scoreAccessibility: row.score_accessibility ?? undefined,
    scoreCodeQuality: row.score_code_quality ?? undefined,
    resultsPerformance: row.results_performance ?? undefined,
    resultsSecurity: row.results_security ?? undefined,
    resultsSeo: row.results_seo ?? undefined,
    resultsAccessibility: row.results_accessibility ?? undefined,
    resultsCodeQuality: row.results_code_quality ?? undefined,
    resultsTechStack: row.results_tech_stack ?? undefined,
    roastTitle: row.roast_title ?? undefined,
    roastBody: row.roast_body ?? undefined,
    roastFixes: row.roast_fixes ?? undefined,
    llmReport: row.llm_report ?? undefined,
    screenshotUrl: row.screenshot_url ?? undefined,
    errorMessage: row.error_message ?? undefined,
    createdAt: row.created_at,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
  };
}
