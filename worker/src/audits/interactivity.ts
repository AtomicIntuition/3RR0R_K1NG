/**
 * Interactivity Audit - Measures Interaction to Next Paint (INP)
 *
 * Lighthouse can't measure INP because it doesn't simulate real user interactions.
 * This audit uses Playwright to click real interactive elements and measures response
 * times via the PerformanceEventTiming API.
 *
 * Google's INP thresholds:
 *   ≤200ms = Good
 *   200-500ms = Needs Improvement
 *   >500ms = Poor
 */

import type { Page } from 'playwright';

export interface InteractionEntry {
  element: string;
  duration: number;
  inputDelay: number;
  processingTime: number;
  presentationDelay: number;
}

export interface InteractivityAuditResult {
  score: number;
  inp: number;
  supported: boolean;
  interactions: InteractionEntry[];
}

const SAFE_DEFAULT: InteractivityAuditResult = {
  score: 70,
  inp: 0,
  supported: false,
  interactions: [],
};

/**
 * Calculate INP score from the p75 duration.
 *   ≤200ms → 75-100
 *   200-500ms → 35-75
 *   >500ms → 0-35
 */
function calculateINPScore(inp: number): number {
  if (inp <= 200) {
    // Linear 100→75 across 0-200ms
    return Math.round(100 - (inp / 200) * 25);
  }
  if (inp <= 500) {
    // Linear 75→35 across 200-500ms
    return Math.round(75 - ((inp - 200) / 300) * 40);
  }
  // Linear 35→0 across 500-1500ms, floor at 0
  return Math.max(0, Math.round(35 - ((inp - 500) / 1000) * 35));
}

/**
 * Get the p75 value from an array of numbers.
 */
function percentile75(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.floor(sorted.length * 0.75);
  return sorted[Math.min(index, sorted.length - 1)];
}

export async function runInteractivityAudit(page: Page): Promise<InteractivityAuditResult> {
  try {
    // Check if PerformanceEventTiming is supported
    const supported = await page.evaluate(() => {
      return (
        typeof PerformanceObserver !== 'undefined' &&
        PerformanceObserver.supportedEntryTypes?.includes('event')
      );
    });

    if (!supported) {
      return { ...SAFE_DEFAULT, supported: false };
    }

    // Inject PerformanceObserver to collect event timing entries
    await page.evaluate(() => {
      (window as any).__inpEntries = [];
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const e = entry as any;
          (window as any).__inpEntries.push({
            duration: e.duration,
            inputDelay: e.processingStart - e.startTime,
            processingTime: e.processingEnd - e.processingStart,
            presentationDelay: e.duration - (e.processingEnd - e.startTime),
            target: e.target?.tagName || 'unknown',
          });
        }
      });
      observer.observe({ type: 'event', buffered: true, durationThreshold: 0 } as any);
      (window as any).__inpObserver = observer;
    });

    // Find interactive elements (NOT links — those would navigate)
    const elementCount = await page.evaluate(() => {
      const selectors = [
        'button',
        'input',
        'select',
        'textarea',
        '[role="button"]',
        '[role="tab"]',
        '[role="checkbox"]',
        '[role="switch"]',
      ];

      const allElements = document.querySelectorAll(selectors.join(','));
      let tagIndex = 0;

      for (const el of allElements) {
        const htmlEl = el as HTMLElement;

        // Skip invisible or off-screen elements
        const rect = htmlEl.getBoundingClientRect();
        if (
          rect.width === 0 ||
          rect.height === 0 ||
          rect.bottom < 0 ||
          rect.top > window.innerHeight ||
          rect.right < 0 ||
          rect.left > window.innerWidth
        ) {
          continue;
        }

        const style = window.getComputedStyle(htmlEl);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          continue;
        }

        htmlEl.setAttribute('data-inp-test-id', String(tagIndex));
        tagIndex++;
      }

      return tagIndex;
    });

    // Click up to 5 interactive elements
    const maxClicks = Math.min(5, elementCount);
    const interactions: InteractionEntry[] = [];

    for (let i = 0; i < maxClicks; i++) {
      try {
        // Clear collected entries before each click
        await page.evaluate(() => {
          (window as any).__inpEntries = [];
        });

        const locator = page.locator(`[data-inp-test-id="${i}"]`);

        // Get element description for logging
        const elementTag = await locator.evaluate((el) => {
          const tag = el.tagName.toLowerCase();
          const role = el.getAttribute('role');
          const type = el.getAttribute('type');
          return role ? `${tag}[role=${role}]` : type ? `${tag}[type=${type}]` : tag;
        }).catch(() => 'unknown');

        await locator.click({ timeout: 1500, force: true });

        // Wait for paint to complete
        await page.waitForTimeout(300);

        // Collect timing entries from this interaction
        const entries = await page.evaluate(() => {
          const raw = (window as any).__inpEntries || [];
          return raw.map((e: any) => ({
            duration: e.duration,
            inputDelay: e.inputDelay,
            processingTime: e.processingTime,
            presentationDelay: e.presentationDelay,
          }));
        });

        if (entries.length > 0) {
          // Use the worst entry from this interaction (longest duration)
          const worst = entries.reduce((a: any, b: any) =>
            a.duration > b.duration ? a : b
          );
          interactions.push({
            element: elementTag,
            duration: Math.round(worst.duration),
            inputDelay: Math.round(Math.max(0, worst.inputDelay)),
            processingTime: Math.round(Math.max(0, worst.processingTime)),
            presentationDelay: Math.round(Math.max(0, worst.presentationDelay)),
          });
        }
      } catch {
        // Element may have navigated, been removed, or timed out — skip
        continue;
      }
    }

    // Clean up data attributes
    await page.evaluate(() => {
      const tagged = document.querySelectorAll('[data-inp-test-id]');
      for (const el of tagged) {
        el.removeAttribute('data-inp-test-id');
      }
      if ((window as any).__inpObserver) {
        (window as any).__inpObserver.disconnect();
      }
      delete (window as any).__inpEntries;
      delete (window as any).__inpObserver;
    }).catch(() => {});

    // No interactions recorded — nothing to measure
    if (interactions.length === 0) {
      return { score: 100, inp: 0, supported: true, interactions: [] };
    }

    // Calculate INP as p75 of all interaction durations
    const durations = interactions.map((i) => i.duration);
    const inp = percentile75(durations);
    const score = calculateINPScore(inp);

    return { score, inp, supported: true, interactions };
  } catch {
    return SAFE_DEFAULT;
  }
}
