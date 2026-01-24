// Scoring weights for overall score calculation
export const SCORE_WEIGHTS = {
  performance: 0.25,
  security: 0.30,
  seo: 0.15,
  accessibility: 0.20,
  codeQuality: 0.10,
} as const;

export interface CategoryScores {
  performance: number;
  security: number;
  seo: number;
  accessibility: number;
  codeQuality: number;
}

/**
 * Calculate overall score from category scores
 */
export function calculateOverallScore(scores: Partial<CategoryScores>): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(SCORE_WEIGHTS)) {
    const score = scores[key as keyof CategoryScores];
    if (score !== undefined && score !== null) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

/**
 * Get grade letter from score
 */
export function getGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Get color class based on score
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-terminal';
  if (score >= 70) return 'text-neon-yellow';
  if (score >= 50) return 'text-neon-orange';
  return 'text-danger';
}

/**
 * Get background color class based on score
 */
export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-terminal/20 border-terminal/50';
  if (score >= 70) return 'bg-neon-yellow/20 border-neon-yellow/50';
  if (score >= 50) return 'bg-neon-orange/20 border-neon-orange/50';
  return 'bg-danger/20 border-danger/50';
}

/**
 * Get roast severity based on score
 */
export function getRoastSeverity(score: number): 'mild' | 'medium' | 'brutal' | 'nuclear' {
  if (score >= 85) return 'mild';
  if (score >= 65) return 'medium';
  if (score >= 40) return 'brutal';
  return 'nuclear';
}

/**
 * Format score for display
 */
export function formatScore(score: number | undefined | null): string {
  if (score === undefined || score === null) return '--';
  return Math.round(score).toString();
}

/**
 * Get icon for category
 */
export function getCategoryIcon(category: keyof CategoryScores): string {
  const icons: Record<keyof CategoryScores, string> = {
    performance: '⚡',
    security: '🛡️',
    seo: '🔍',
    accessibility: '♿',
    codeQuality: '🧹',
  };
  return icons[category];
}

/**
 * Get display name for category
 */
export function getCategoryDisplayName(category: keyof CategoryScores): string {
  const names: Record<keyof CategoryScores, string> = {
    performance: 'Performance',
    security: 'Security',
    seo: 'SEO',
    accessibility: 'Accessibility',
    codeQuality: 'Code Quality',
  };
  return names[category];
}
