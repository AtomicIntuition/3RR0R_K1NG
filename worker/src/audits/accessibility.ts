import { Page } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

export interface AccessibilityViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodes: number;
  // New: Include actual selectors for LLM-friendly fixing
  selectors: string[];
  // New: Include failure summaries for context
  failureSummary?: string;
}

export interface AccessibilityAuditResult {
  score: number;
  violations: AccessibilityViolation[];
  passes: number;
}

// Impact weights for scoring
const IMPACT_WEIGHTS = {
  critical: 25,
  serious: 15,
  moderate: 10,
  minor: 5,
};

export async function runAccessibilityAudit(page: Page): Promise<AccessibilityAuditResult> {
  try {
    const axeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    const violations: AccessibilityViolation[] = axeResults.violations.map(v => ({
      id: v.id,
      impact: (v.impact as AccessibilityViolation['impact']) || 'moderate',
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.length,
      // Extract CSS selectors from nodes (limit to first 10 for brevity)
      selectors: v.nodes.slice(0, 10).flatMap(n => n.target as string[]),
      // Get first failure summary as context
      failureSummary: v.nodes[0]?.failureSummary,
    }));

    // Calculate score based on violations and their impact
    let totalPenalty = 0;
    let maxPenalty = 100; // Start with perfect score assumption

    for (const violation of violations) {
      const weight = IMPACT_WEIGHTS[violation.impact] || 5;
      // More nodes affected = higher penalty (up to 3x for many nodes)
      const nodeMultiplier = Math.min(1 + (violation.nodes - 1) * 0.2, 3);
      totalPenalty += weight * nodeMultiplier;
    }

    // Calculate score (minimum 0)
    const score = Math.max(0, Math.round(100 - totalPenalty));

    return {
      score,
      violations,
      passes: axeResults.passes.length,
    };
  } catch (error) {
    console.error('Accessibility audit failed:', error);

    // Return default score if axe fails
    return {
      score: 70,
      violations: [{
        id: 'audit-error',
        impact: 'moderate',
        description: 'Accessibility audit encountered an error',
        help: 'Unable to complete accessibility analysis',
        helpUrl: 'https://www.deque.com/axe/',
        nodes: 0,
      }],
      passes: 0,
    };
  }
}
