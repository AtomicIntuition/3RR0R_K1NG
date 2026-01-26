import { Page } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

// Detailed node info for actionable fixes
export interface ViolationNode {
  html: string;           // Actual HTML snippet - searchable in code
  textContent: string;    // Text inside the element - grep-able
  selector: string;       // CSS selector
  failureSummary: string; // What's wrong
  // Color contrast specific data
  colorData?: {
    fgColor: string;       // Current foreground color
    bgColor: string;       // Current background color
    contrastRatio: number; // Current ratio
    expectedRatio: string; // Required ratio
    fontSize: string;
    fontWeight: string;
    suggestedFgColor?: string; // Suggested fix color
  };
}

export interface AccessibilityViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodeCount: number;
  // Detailed actionable info for each affected element
  affectedElements: ViolationNode[];
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

/**
 * Calculate a suggested foreground color that meets contrast requirements
 */
function suggestContrastColor(bgColor: string, targetRatio: number): string {
  // Parse the background color
  const bg = parseColor(bgColor);
  if (!bg) return '#ffffff';

  // Calculate background luminance
  const bgLum = luminance(bg.r, bg.g, bg.b);

  // Try white first (common for dark backgrounds)
  const whiteLum = 1;
  const whiteRatio = (Math.max(whiteLum, bgLum) + 0.05) / (Math.min(whiteLum, bgLum) + 0.05);
  if (whiteRatio >= targetRatio) return '#ffffff';

  // Try progressively lighter grays
  const grays = ['#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280'];
  for (const gray of grays) {
    const g = parseColor(gray);
    if (!g) continue;
    const gLum = luminance(g.r, g.g, g.b);
    const ratio = (Math.max(gLum, bgLum) + 0.05) / (Math.min(gLum, bgLum) + 0.05);
    if (ratio >= targetRatio) return gray;
  }

  return '#ffffff';
}

function parseColor(color: string): { r: number; g: number; b: number } | null {
  const hex = color.replace('#', '');
  if (hex.length !== 6) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Extract text content from HTML string
 */
function extractTextContent(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .trim()
    .slice(0, 100);             // Limit length
}

// Helper to add timeout to promises
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ]);
}

export async function runAccessibilityAudit(page: Page): Promise<AccessibilityAuditResult> {
  try {
    // Add 45 second timeout to prevent hanging on heavy pages
    const axePromise = new AxeBuilder({ page } as any)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    const axeResults = await withTimeout(axePromise, 45000, null);

    // If timed out, return fallback
    if (!axeResults) {
      console.warn('Accessibility audit timed out after 45s');
      return {
        score: 70,
        violations: [{
          id: 'audit-timeout',
          impact: 'moderate',
          description: 'Accessibility audit timed out - page has many elements',
          help: 'Large pages may take longer to fully analyze',
          helpUrl: 'https://www.deque.com/axe/',
          nodeCount: 0,
          affectedElements: [],
        }],
        passes: 0,
      };
    }

    const violations: AccessibilityViolation[] = axeResults.violations.map(v => {
      // Extract detailed info from each affected node
      const affectedElements: ViolationNode[] = v.nodes.slice(0, 10).map(node => {
        const element: ViolationNode = {
          html: node.html.slice(0, 500), // Truncate long HTML
          textContent: extractTextContent(node.html),
          selector: (node.target as string[]).join(' > '),
          failureSummary: node.failureSummary || '',
        };

        // Extract color contrast data if available
        if (v.id === 'color-contrast') {
          const checkData = node.any?.[0]?.data as any;
          if (checkData) {
            const targetRatio = checkData.expectedContrastRatio === '4.5:1' ? 4.5 : 3;
            element.colorData = {
              fgColor: checkData.fgColor || '',
              bgColor: checkData.bgColor || '',
              contrastRatio: checkData.contrastRatio || 0,
              expectedRatio: checkData.expectedContrastRatio || '4.5:1',
              fontSize: checkData.fontSize || '',
              fontWeight: checkData.fontWeight || '',
              suggestedFgColor: suggestContrastColor(checkData.bgColor, targetRatio),
            };
          }
        }

        return element;
      });

      return {
        id: v.id,
        impact: (v.impact as AccessibilityViolation['impact']) || 'moderate',
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodeCount: v.nodes.length,
        affectedElements,
      };
    });

    // Calculate score based on violations and their impact
    let totalPenalty = 0;

    for (const violation of violations) {
      const weight = IMPACT_WEIGHTS[violation.impact] || 5;
      const nodeMultiplier = Math.min(1 + (violation.nodeCount - 1) * 0.2, 3);
      totalPenalty += weight * nodeMultiplier;
    }

    const score = Math.max(0, Math.round(100 - totalPenalty));

    return {
      score,
      violations,
      passes: axeResults.passes.length,
    };
  } catch (error) {
    console.error('Accessibility audit failed:', error);

    return {
      score: 70,
      violations: [{
        id: 'audit-error',
        impact: 'moderate',
        description: 'Accessibility audit encountered an error',
        help: 'Unable to complete accessibility analysis',
        helpUrl: 'https://www.deque.com/axe/',
        nodeCount: 0,
        affectedElements: [],
      }],
      passes: 0,
    };
  }
}
