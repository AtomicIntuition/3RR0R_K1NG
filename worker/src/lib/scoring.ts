/**
 * Comprehensive Scoring System
 *
 * Calculates overall score from all audit categories with proper weighting.
 * Groups related audits into logical categories for balanced scoring.
 */

export interface AuditScores {
  // Core audits (always present)
  performance: number;
  security: number;
  seo: number;
  accessibility: number;
  codeQuality: number;

  // Phase 1 audits (optional - may not have score)
  vulnerabilities?: number;
  protocol?: number;
  images?: number;
  caching?: number;
  redirects?: number;
  interactivity?: number;

  // Phase 3 audits (optional)
  pwa?: number;
  structuredData?: number;
  links?: number;
}

export interface ScoringResult {
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

/**
 * Category weights - total must equal 1.0 (100%)
 *
 * Security (30%): Most critical - vulnerabilities can destroy a business
 * Performance (25%): Direct impact on user experience and conversion
 * User Experience (20%): Accessibility + PWA for inclusive, modern apps
 * SEO (15%): Discoverability matters but less than core functionality
 * Code Quality (10%): Important for maintainability, less for end users
 */
const CATEGORY_WEIGHTS = {
  security: 0.30,
  performance: 0.25,
  userExperience: 0.20,
  seo: 0.15,
  codeQuality: 0.10,
} as const;

/**
 * Sub-category weights within each category
 * These determine how individual audits contribute to their parent category
 */
const SUB_WEIGHTS = {
  // Security category breakdown
  security: {
    base: 0.60,           // Headers, CSP, HTTPS, etc.
    vulnerabilities: 0.40, // Known vulnerable libraries
  },

  // Performance category breakdown
  performance: {
    base: 0.40,            // Core Web Vitals (LCP, CLS, TBT, etc.)
    interactivity: 0.10,   // INP (Interaction to Next Paint)
    protocol: 0.15,        // HTTP/2, HTTP/3
    images: 0.20,          // Image optimization
    caching: 0.15,         // Cache headers
  },

  // SEO category breakdown
  seo: {
    base: 0.50,           // Meta tags, titles, etc.
    structuredData: 0.25, // JSON-LD, schema.org
    links: 0.25,          // Broken links, redirects
  },

  // User Experience category breakdown
  userExperience: {
    accessibility: 0.70,  // A11y is critical
    pwa: 0.30,            // Progressive enhancement
  },

  // Code Quality category breakdown
  codeQuality: {
    base: 0.70,       // Console errors, JS errors
    redirects: 0.30,  // Redirect chains (affects UX/performance)
  },
} as const;

/**
 * Letter grade thresholds
 * Using standard academic grading with +/- modifiers
 */
const GRADE_THRESHOLDS = [
  { min: 97, grade: 'A+' },
  { min: 93, grade: 'A' },
  { min: 90, grade: 'A-' },
  { min: 87, grade: 'B+' },
  { min: 83, grade: 'B' },
  { min: 80, grade: 'B-' },
  { min: 77, grade: 'C+' },
  { min: 73, grade: 'C' },
  { min: 70, grade: 'C-' },
  { min: 67, grade: 'D+' },
  { min: 63, grade: 'D' },
  { min: 60, grade: 'D-' },
  { min: 0, grade: 'F' },
] as const;

/**
 * Convert numeric score to letter grade
 */
export function getLetterGrade(score: number): string {
  const rounded = Math.round(score);
  for (const threshold of GRADE_THRESHOLDS) {
    if (rounded >= threshold.min) {
      return threshold.grade;
    }
  }
  return 'F';
}

/**
 * Calculate weighted average, handling missing values gracefully
 * Missing audits don't penalize the score - their weight is redistributed
 */
function weightedAverage(
  values: Record<string, number | undefined>,
  weights: Record<string, number>
): { score: number; components: Record<string, number> } {
  let totalWeight = 0;
  let weightedSum = 0;
  const components: Record<string, number> = {};

  for (const [key, weight] of Object.entries(weights)) {
    const value = values[key];
    if (value !== undefined && !isNaN(value)) {
      weightedSum += value * weight;
      totalWeight += weight;
      components[key] = value;
    }
  }

  // If no valid values, return 0
  if (totalWeight === 0) {
    return { score: 0, components };
  }

  // Normalize by actual weight used (redistributes missing audit weight)
  return {
    score: Math.round(weightedSum / totalWeight),
    components,
  };
}

/**
 * Calculate comprehensive score from all audits
 */
export function calculateComprehensiveScore(scores: AuditScores): ScoringResult {
  // Calculate Security category score
  const securityCalc = weightedAverage(
    {
      base: scores.security,
      vulnerabilities: scores.vulnerabilities,
    },
    SUB_WEIGHTS.security
  );

  // Calculate Performance category score
  const performanceCalc = weightedAverage(
    {
      base: scores.performance,
      interactivity: scores.interactivity,
      protocol: scores.protocol,
      images: scores.images,
      caching: scores.caching,
    },
    SUB_WEIGHTS.performance
  );

  // Calculate SEO category score
  const seoCalc = weightedAverage(
    {
      base: scores.seo,
      structuredData: scores.structuredData,
      links: scores.links,
    },
    SUB_WEIGHTS.seo
  );

  // Calculate User Experience category score
  const uxCalc = weightedAverage(
    {
      accessibility: scores.accessibility,
      pwa: scores.pwa,
    },
    SUB_WEIGHTS.userExperience
  );

  // Calculate Code Quality category score
  const codeQualityCalc = weightedAverage(
    {
      base: scores.codeQuality,
      redirects: scores.redirects,
    },
    SUB_WEIGHTS.codeQuality
  );

  // Build category scores object
  const categoryScores = {
    security: {
      score: securityCalc.score,
      weight: CATEGORY_WEIGHTS.security,
      components: securityCalc.components,
    },
    performance: {
      score: performanceCalc.score,
      weight: CATEGORY_WEIGHTS.performance,
      components: performanceCalc.components,
    },
    seo: {
      score: seoCalc.score,
      weight: CATEGORY_WEIGHTS.seo,
      components: seoCalc.components,
    },
    userExperience: {
      score: uxCalc.score,
      weight: CATEGORY_WEIGHTS.userExperience,
      components: uxCalc.components,
    },
    codeQuality: {
      score: codeQualityCalc.score,
      weight: CATEGORY_WEIGHTS.codeQuality,
      components: codeQualityCalc.components,
    },
  };

  // Calculate overall score from category scores
  const overall = Math.round(
    categoryScores.security.score * CATEGORY_WEIGHTS.security +
    categoryScores.performance.score * CATEGORY_WEIGHTS.performance +
    categoryScores.seo.score * CATEGORY_WEIGHTS.seo +
    categoryScores.userExperience.score * CATEGORY_WEIGHTS.userExperience +
    categoryScores.codeQuality.score * CATEGORY_WEIGHTS.codeQuality
  );

  // Build breakdown for transparency
  const breakdown = [
    {
      category: 'Security',
      score: categoryScores.security.score,
      weight: CATEGORY_WEIGHTS.security * 100,
      contribution: Math.round(categoryScores.security.score * CATEGORY_WEIGHTS.security),
    },
    {
      category: 'Performance',
      score: categoryScores.performance.score,
      weight: CATEGORY_WEIGHTS.performance * 100,
      contribution: Math.round(categoryScores.performance.score * CATEGORY_WEIGHTS.performance),
    },
    {
      category: 'User Experience',
      score: categoryScores.userExperience.score,
      weight: CATEGORY_WEIGHTS.userExperience * 100,
      contribution: Math.round(categoryScores.userExperience.score * CATEGORY_WEIGHTS.userExperience),
    },
    {
      category: 'SEO',
      score: categoryScores.seo.score,
      weight: CATEGORY_WEIGHTS.seo * 100,
      contribution: Math.round(categoryScores.seo.score * CATEGORY_WEIGHTS.seo),
    },
    {
      category: 'Code Quality',
      score: categoryScores.codeQuality.score,
      weight: CATEGORY_WEIGHTS.codeQuality * 100,
      contribution: Math.round(categoryScores.codeQuality.score * CATEGORY_WEIGHTS.codeQuality),
    },
  ];

  return {
    overall,
    letterGrade: getLetterGrade(overall),
    categoryScores,
    breakdown,
  };
}

/**
 * Get score for vulnerability audit
 * Converts vulnerability findings to a 0-100 score
 */
export function getVulnerabilityScore(
  vulnerableLibraries: Array<{ vulnerabilities: Array<{ severity: string }> }>
): number {
  if (!vulnerableLibraries || vulnerableLibraries.length === 0) {
    return 100; // No vulnerabilities = perfect score
  }

  let penalty = 0;

  for (const lib of vulnerableLibraries) {
    for (const vuln of lib.vulnerabilities) {
      switch (vuln.severity.toLowerCase()) {
        case 'critical':
          penalty += 25;
          break;
        case 'high':
          penalty += 15;
          break;
        case 'medium':
        case 'moderate':
          penalty += 8;
          break;
        case 'low':
          penalty += 3;
          break;
        default:
          penalty += 5;
      }
    }
  }

  return Math.max(0, 100 - penalty);
}

/**
 * Get score for protocol audit
 * HTTP/2 is baseline, HTTP/3 is bonus
 */
export function getProtocolScore(protocol: {
  http2Supported: boolean;
  http3Supported: boolean;
}): number {
  if (protocol.http3Supported) {
    return 100;
  }
  if (protocol.http2Supported) {
    return 85; // HTTP/2 is good but not perfect
  }
  return 50; // HTTP/1.1 only
}

/**
 * Get score for redirect audit
 * Penalizes redirect chains
 */
export function getRedirectScore(redirects: {
  totalRedirects: number;
  totalTime: number;
  issues: Array<{ severity: string }>;
}): number {
  let score = 100;

  // Penalize for number of redirects
  score -= redirects.totalRedirects * 10;

  // Penalize for slow redirects (over 500ms total)
  if (redirects.totalTime > 500) {
    score -= Math.min(20, Math.floor((redirects.totalTime - 500) / 100) * 5);
  }

  // Penalize for issues
  for (const issue of redirects.issues) {
    switch (issue.severity) {
      case 'high':
        score -= 15;
        break;
      case 'medium':
        score -= 8;
        break;
      case 'low':
        score -= 3;
        break;
    }
  }

  return Math.max(0, Math.min(100, score));
}
