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
 * Get grade letter from score (with +/- modifiers)
 */
export function getGrade(score: number): string {
  const rounded = Math.round(score);
  if (rounded >= 97) return 'A+';
  if (rounded >= 93) return 'A';
  if (rounded >= 90) return 'A-';
  if (rounded >= 87) return 'B+';
  if (rounded >= 83) return 'B';
  if (rounded >= 80) return 'B-';
  if (rounded >= 77) return 'C+';
  if (rounded >= 73) return 'C';
  if (rounded >= 70) return 'C-';
  if (rounded >= 67) return 'D+';
  if (rounded >= 63) return 'D';
  if (rounded >= 60) return 'D-';
  return 'F';
}

/**
 * Get grade color class
 */
export function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-success';
  if (grade.startsWith('B')) return 'text-warning';
  if (grade.startsWith('C')) return 'text-warning-dark';
  return 'text-danger';
}

/**
 * Get grade background color class
 */
export function getGradeBgColor(grade: string): string {
  if (grade.startsWith('A')) return 'bg-success/10 border-success/30';
  if (grade.startsWith('B')) return 'bg-warning/10 border-warning/30';
  if (grade.startsWith('C')) return 'bg-warning/10 border-warning-dark/30';
  return 'bg-danger/10 border-danger/30';
}

/**
 * Get color class based on score
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-success';
  if (score >= 70) return 'text-warning';
  if (score >= 50) return 'text-warning-dark';
  return 'text-danger';
}

/**
 * Get background color class based on score
 */
export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-success/10 text-success';
  if (score >= 70) return 'bg-warning/10 text-warning';
  if (score >= 50) return 'bg-warning/10 text-warning-dark';
  return 'bg-danger/10 text-danger';
}

/**
 * Get severity level based on score
 */
export function getSeverity(score: number): 'excellent' | 'good' | 'needs-attention' | 'critical' {
  if (score >= 85) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 40) return 'needs-attention';
  return 'critical';
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
 * @deprecated Use CategoryIcon component from @/components/icons/CategoryIcon instead
 */
export function getCategoryIcon(category: keyof CategoryScores): string {
  const icons: Record<keyof CategoryScores, string> = {
    performance: 'performance',
    security: 'security',
    seo: 'seo',
    accessibility: 'accessibility',
    codeQuality: 'code',
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
