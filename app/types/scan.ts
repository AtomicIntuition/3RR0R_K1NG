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
  impact?: string;
}

export interface ExecutiveSummary {
  keyStrength: string;
  biggestRisk: string;
  topPriority: string;
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

// Phase 1 Audit Types
export interface VulnerableLibrary {
  name: string;
  detectedVersion: string;
  vulnerabilities: {
    severity: string;
    description: string;
    cve?: string;
    fixedIn: string;
    recommendation: string;
  }[];
}

export interface ProtocolInfo {
  httpVersion: string;
  http2Supported: boolean;
  http3Supported: boolean;
  alpn?: string;
  recommendations: string[];
}

export interface ImageIssue {
  src: string;
  issues: string[];
  recommendations: string[];
  severity: 'high' | 'medium' | 'low';
  currentSize?: number;
  potentialSavings?: number;
}

export interface CacheIssue {
  url: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

export interface RedirectHop {
  url: string;
  statusCode: number;
  duration: number;
  location?: string;
}

export interface RedirectIssue {
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

// Phase 3 Audit Types
export interface PWACheck {
  manifest: { exists: boolean; valid: boolean; issues: string[] };
  serviceWorker: { registered: boolean; scope?: string };
  icons: { has192: boolean; has512: boolean; hasMaskable: boolean };
  themeColor: boolean;
  viewport: boolean;
  https: boolean;
  startUrl: boolean;
}

export interface PWAIssue {
  severity: 'high' | 'medium' | 'low';
  category: string;
  description: string;
  recommendation: string;
}

export interface StructuredDataItem {
  format: 'json-ld' | 'microdata';
  type: string;
  isValid: boolean;
  issues: string[];
}

export interface StructuredDataError {
  type: string;
  property?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface BrokenLink {
  url: string;
  statusCode: number;
  anchorText: string;
  isExternal: boolean;
  error?: string;
}

export interface InsecureLink {
  url: string;
  anchorText: string;
}

export interface ScoringBreakdown {
  overall: number;
  letterGrade: string;
  categoryScores: {
    security: { score: number; weight: number; components: Record<string, number> };
    performance: { score: number; weight: number; components: Record<string, number> };
    seo: { score: number; weight: number; components: Record<string, number> };
    userExperience: { score: number; weight: number; components: Record<string, number> };
    codeQuality: { score: number; weight: number; components: Record<string, number> };
  };
  breakdown: {
    category: string;
    score: number;
    weight: number;
    contribution: number;
  }[];
}

export interface Scan {
  id: string;
  url: string;
  status: ScanStatus;
  userId?: string;

  // Scores
  scoreOverall?: number;
  letterGrade?: string;
  scoringBreakdown?: ScoringBreakdown;
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

  // Phase 1 audit results
  resultsVulnerabilities?: {
    score: number;
    vulnerableLibraries: VulnerableLibrary[];
  };
  resultsProtocol?: ProtocolInfo;
  resultsImages?: {
    score: number;
    totalImages: number;
    totalSize: number;
    optimizationPotential: number;
    issues: ImageIssue[];
  };
  resultsCaching?: {
    score: number;
    summary: { totalResources: number; cached: number; longCache: number; immutable: number };
    issues: CacheIssue[];
  };
  resultsRedirects?: {
    totalRedirects: number;
    totalTime: number;
    redirectChain: RedirectHop[];
    finalUrl: string;
    issues: RedirectIssue[];
  };

  // Phase 3 audit results
  resultsPwa?: {
    score: number;
    installable: boolean;
    checks: PWACheck;
    issues: PWAIssue[];
    recommendations: string[];
  };
  resultsStructuredData?: {
    score: number;
    found: boolean;
    jsonLdCount: number;
    microdataCount: number;
    types: string[];
    items: StructuredDataItem[];
    errors: StructuredDataError[];
    recommendations: string[];
  };
  resultsLinks?: {
    score: number;
    totalLinks: number;
    internalLinks: number;
    externalLinks: number;
    checkedLinks: number;
    brokenLinks: BrokenLink[];
    insecureLinks: InsecureLink[];
  };

  // Roast content
  roastTitle?: string;
  roastBody?: string;
  roastFixes?: RoastFix[];
  twitterRoast?: string; // Short 280-char roast for Twitter
  roastPersona?: string; // Which persona generated the roast
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
  letter_grade: string | null;
  scoring_breakdown: ScoringBreakdown | null;
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
  // Phase 1 results
  results_vulnerabilities: { score: number; vulnerableLibraries: VulnerableLibrary[] } | null;
  results_protocol: ProtocolInfo | null;
  results_images: { score: number; totalImages: number; totalSize: number; optimizationPotential: number; issues: ImageIssue[] } | null;
  results_caching: { score: number; summary: { totalResources: number; cached: number; longCache: number; immutable: number }; issues: CacheIssue[] } | null;
  results_redirects: { totalRedirects: number; totalTime: number; redirectChain: RedirectHop[]; finalUrl: string; issues: RedirectIssue[] } | null;
  // Phase 3 results
  results_pwa: { score: number; installable: boolean; checks: PWACheck; issues: PWAIssue[]; recommendations: string[] } | null;
  results_structured_data: { score: number; found: boolean; jsonLdCount: number; microdataCount: number; types: string[]; items: StructuredDataItem[]; errors: StructuredDataError[]; recommendations: string[] } | null;
  results_links: { score: number; totalLinks: number; internalLinks: number; externalLinks: number; checkedLinks: number; brokenLinks: BrokenLink[]; insecureLinks: InsecureLink[] } | null;
  roast_title: string | null;
  roast_body: string | null;
  roast_fixes: RoastFix[] | null;
  twitter_roast: string | null;
  roast_persona: string | null;
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
    letterGrade: row.letter_grade ?? undefined,
    scoringBreakdown: row.scoring_breakdown ?? undefined,
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
    // Phase 1 results
    resultsVulnerabilities: row.results_vulnerabilities ?? undefined,
    resultsProtocol: row.results_protocol ?? undefined,
    resultsImages: row.results_images ?? undefined,
    resultsCaching: row.results_caching ?? undefined,
    resultsRedirects: row.results_redirects ?? undefined,
    // Phase 3 results
    resultsPwa: row.results_pwa ?? undefined,
    resultsStructuredData: row.results_structured_data ?? undefined,
    resultsLinks: row.results_links ?? undefined,
    roastTitle: row.roast_title ?? undefined,
    roastBody: row.roast_body ?? undefined,
    roastFixes: row.roast_fixes ?? undefined,
    twitterRoast: row.twitter_roast ?? undefined,
    roastPersona: row.roast_persona ?? undefined,
    llmReport: row.llm_report ?? undefined,
    screenshotUrl: row.screenshot_url ?? undefined,
    errorMessage: row.error_message ?? undefined,
    createdAt: row.created_at,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
  };
}
