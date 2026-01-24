import { chromium, Browser, Page, Response } from 'playwright';
import { runSecurityAudit, type SecurityAuditResult } from './audits/security.js';
import { runPerformanceAudit, type PerformanceAuditResult } from './audits/performance.js';
import { runSeoAudit, type SeoAuditResult } from './audits/seo.js';
import { runAccessibilityAudit, type AccessibilityAuditResult } from './audits/accessibility.js';
import { runCodeQualityAudit, type CodeQualityAuditResult } from './audits/codeQuality.js';
import { detectTechStack, type TechStackItem } from './audits/techStack.js';
import { generateRoast, type RoastResult } from './roastGenerator.js';
import { updateScan } from './lib/supabase.js';

export interface ScanResult {
  security: SecurityAuditResult;
  performance: PerformanceAuditResult;
  seo: SeoAuditResult;
  accessibility: AccessibilityAuditResult;
  codeQuality: CodeQualityAuditResult;
  techStack: TechStackItem[];
  roast: RoastResult;
  overallScore: number;
}

// Score weights
const WEIGHTS = {
  performance: 0.25,
  security: 0.30,
  seo: 0.15,
  accessibility: 0.20,
  codeQuality: 0.10,
};

function calculateOverallScore(scores: Record<string, number>): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const score = scores[key];
    if (score !== undefined) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export async function runScan(scanId: string, url: string): Promise<ScanResult> {
  console.log(`Starting scan for ${url} (${scanId})`);

  // Update status to processing
  await updateScan(scanId, {
    status: 'processing',
    started_at: new Date().toISOString(),
  });

  const browserInstance = await getBrowser();
  const context = await browserInstance.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  // Collect console errors for code quality audit
  const consoleErrors: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push({ type: 'error', text: msg.text() });
    }
  });

  // Collect page errors
  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error);
  });

  let response: Response | null = null;

  try {
    // Navigate to URL - use 'load' instead of 'networkidle' for faster, more reliable loading
    response = await page.goto(url, {
      waitUntil: 'load',
      timeout: 45000,
    });

    if (!response) {
      throw new Error('Failed to load page');
    }

    // Give the page a moment to settle (for JS-heavy sites)
    await page.waitForTimeout(2000);

    // Run audits in parallel where possible
    console.log(`Running audits for ${scanId}...`);

    // Security audit (needs response headers)
    const securityResult = await runSecurityAudit(page, response);
    await updateScan(scanId, {
      score_security: securityResult.score,
      results_security: securityResult,
    });
    console.log(`Security audit complete: ${securityResult.score}`);

    // SEO audit (can run in parallel with accessibility)
    const seoResult = await runSeoAudit(page, url);
    await updateScan(scanId, {
      score_seo: seoResult.score,
      results_seo: seoResult,
    });
    console.log(`SEO audit complete: ${seoResult.score}`);

    // Accessibility audit
    const accessibilityResult = await runAccessibilityAudit(page);
    await updateScan(scanId, {
      score_accessibility: accessibilityResult.score,
      results_accessibility: accessibilityResult,
    });
    console.log(`Accessibility audit complete: ${accessibilityResult.score}`);

    // Code quality audit
    const codeQualityResult = await runCodeQualityAudit(page, consoleErrors, pageErrors);
    await updateScan(scanId, {
      score_code_quality: codeQualityResult.score,
      results_code_quality: codeQualityResult,
    });
    console.log(`Code quality audit complete: ${codeQualityResult.score}`);

    // Tech stack detection
    const techStack = await detectTechStack(page, response);
    await updateScan(scanId, {
      results_tech_stack: techStack,
    });
    console.log(`Tech stack detection complete: ${techStack.length} technologies found`);

    // Performance audit (Lighthouse - runs separately)
    const performanceResult = await runPerformanceAudit(url);
    await updateScan(scanId, {
      score_performance: performanceResult.score,
      results_performance: performanceResult,
    });
    console.log(`Performance audit complete: ${performanceResult.score}`);

    // Calculate overall score
    const overallScore = calculateOverallScore({
      performance: performanceResult.score,
      security: securityResult.score,
      seo: seoResult.score,
      accessibility: accessibilityResult.score,
      codeQuality: codeQualityResult.score,
    });

    // Generate roast
    const roast = await generateRoast({
      url,
      scores: {
        overall: overallScore,
        performance: performanceResult.score,
        security: securityResult.score,
        seo: seoResult.score,
        accessibility: accessibilityResult.score,
        codeQuality: codeQualityResult.score,
      },
      securityFindings: securityResult.findings,
      performanceMetrics: performanceResult.metrics,
      seoFindings: seoResult.findings,
      accessibilityViolations: accessibilityResult.violations,
      codeQualityIssues: codeQualityResult.issues,
      techStack,
    });

    // Update final results
    await updateScan(scanId, {
      status: 'completed',
      score_overall: overallScore,
      roast_title: roast.title,
      roast_body: roast.body,
      roast_fixes: roast.fixes,
      llm_report: roast.llmReport,
      completed_at: new Date().toISOString(),
    });

    console.log(`Scan complete for ${scanId}: Overall score ${overallScore}`);

    return {
      security: securityResult,
      performance: performanceResult,
      seo: seoResult,
      accessibility: accessibilityResult,
      codeQuality: codeQualityResult,
      techStack,
      roast,
      overallScore,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Scan failed for ${scanId}:`, errorMessage);

    await updateScan(scanId, {
      status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    });

    throw error;
  } finally {
    await context.close();
  }
}
