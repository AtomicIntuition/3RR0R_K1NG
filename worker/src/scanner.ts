import { chromium, Browser, Page, Response } from 'playwright';
import { runSecurityAudit, type SecurityAuditResult } from './audits/security.js';
import { runPerformanceAudit, type PerformanceAuditResult } from './audits/performance.js';
import { runSeoAudit, type SeoAuditResult } from './audits/seo.js';
import { runAccessibilityAudit, type AccessibilityAuditResult } from './audits/accessibility.js';
import { runCodeQualityAudit, type CodeQualityAuditResult } from './audits/codeQuality.js';
import { detectTechStack, type TechStackItem } from './audits/techStack.js';
import { runResourceAnalysis, type ResourceAnalysis } from './audits/resources.js';
import { runVulnerabilityAudit, type VulnerabilityAuditResult } from './audits/vulnerabilities.js';
import { runProtocolAudit, type ProtocolInfo } from './audits/protocol.js';
import { runImageAudit, type ImageAuditResult } from './audits/images.js';
import { runCacheAudit, type CacheAuditResult } from './audits/caching.js';
import { runRedirectAudit, type RedirectAuditResult } from './audits/redirects.js';
// Phase 2 audits
import { auditDependencies, type DependencyAuditResult } from './audits/dependencies.js';
import { scanForSecrets, type SecretsAuditResult } from './audits/secrets.js';
import { scanCodePatterns, type CodePatternsAuditResult } from './audits/codePatterns.js';
// Phase 3 audits
import { runPWAAudit, type PWAAuditResult } from './audits/pwa.js';
import { runStructuredDataAudit, type StructuredDataAuditResult } from './audits/structuredData.js';
import { runLinkAudit, type LinkAuditResult } from './audits/links.js';
import { generateRoast, generateUploadRoast, type RoastResult } from './roastGenerator.js';
import { updateScan } from './lib/supabase.js';
import {
  calculateComprehensiveScore,
  getVulnerabilityScore,
  getProtocolScore,
  getRedirectScore,
  getLetterGrade,
  type ScoringResult,
} from './lib/scoring.js';

export interface ScanResult {
  security: SecurityAuditResult;
  performance: PerformanceAuditResult;
  seo: SeoAuditResult;
  accessibility: AccessibilityAuditResult;
  codeQuality: CodeQualityAuditResult;
  techStack: TechStackItem[];
  resources: ResourceAnalysis;
  // Phase 1 audits
  vulnerabilities?: VulnerabilityAuditResult;
  protocol?: ProtocolInfo;
  images?: ImageAuditResult;
  caching?: CacheAuditResult;
  redirects?: RedirectAuditResult;
  // Phase 3 audits
  pwa?: PWAAuditResult;
  structuredData?: StructuredDataAuditResult;
  links?: LinkAuditResult;
  roast: RoastResult;
  overallScore: number;
  letterGrade: string;
  scoringBreakdown?: ScoringResult;
}

// Phase 2: Upload scan result
export interface UploadScanResult {
  dependencies: DependencyAuditResult;
  secrets: SecretsAuditResult;
  codePatterns: CodePatternsAuditResult;
  roast: RoastResult;
  overallScore: number;
  letterGrade: string;
}

export interface UploadedFile {
  path: string;
  content: string;
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

    // Resource analysis (waterfall, third-party impact)
    const resourceAnalysis = await runResourceAnalysis(page);
    await updateScan(scanId, {
      results_resources: resourceAnalysis,
    });
    console.log(`Resource analysis complete: ${resourceAnalysis.totalResources} resources, ${resourceAnalysis.thirdParty.domains.length} third-party domains`);

    // === Phase 1 New Audits ===

    // Run new audits in parallel
    const [vulnerabilityResult, protocolResult, imageResult, cacheResult, redirectResult] = await Promise.all([
      runVulnerabilityAudit(page),
      runProtocolAudit(page, url),
      runImageAudit(page),
      runCacheAudit(page),
      runRedirectAudit(url),
    ]);

    // Save vulnerability audit results
    await updateScan(scanId, {
      results_vulnerabilities: vulnerabilityResult,
    });
    console.log(`Vulnerability audit complete: ${vulnerabilityResult.vulnerableLibraries.length} vulnerable libraries found`);

    // Save protocol audit results
    await updateScan(scanId, {
      results_protocol: protocolResult,
    });
    console.log(`Protocol audit complete: ${protocolResult.httpVersion}, HTTP/2: ${protocolResult.http2Supported}`);

    // Save image audit results
    await updateScan(scanId, {
      results_images: imageResult,
    });
    console.log(`Image audit complete: ${imageResult.totalImages} images, ${imageResult.issues.length} issues`);

    // Save cache audit results
    await updateScan(scanId, {
      results_caching: cacheResult,
    });
    console.log(`Cache audit complete: score ${cacheResult.score}`);

    // Save redirect audit results
    await updateScan(scanId, {
      results_redirects: redirectResult,
    });
    console.log(`Redirect audit complete: ${redirectResult.totalRedirects} redirects, ${redirectResult.totalTime}ms`);

    // === Phase 3 New Audits ===

    // Run Phase 3 audits in parallel
    const [pwaResult, structuredDataResult, linksResult] = await Promise.all([
      runPWAAudit(page, url),
      runStructuredDataAudit(page),
      runLinkAudit(page, url),
    ]);

    // Save PWA audit results
    await updateScan(scanId, {
      results_pwa: pwaResult,
    });
    console.log(`PWA audit complete: score ${pwaResult.score}, installable: ${pwaResult.installable}`);

    // Save structured data audit results
    await updateScan(scanId, {
      results_structured_data: structuredDataResult,
    });
    console.log(`Structured data audit complete: ${structuredDataResult.types.length} types found`);

    // Save links audit results
    await updateScan(scanId, {
      results_links: linksResult,
    });
    console.log(`Links audit complete: ${linksResult.brokenLinks.length} broken, ${linksResult.insecureLinks.length} insecure`);

    // Performance audit (Lighthouse - runs separately)
    const performanceResult = await runPerformanceAudit(url);
    await updateScan(scanId, {
      score_performance: performanceResult.score,
      results_performance: performanceResult,
    });
    console.log(`Performance audit complete: ${performanceResult.score}`);

    // Calculate comprehensive score including all audits
    const scoringResult = calculateComprehensiveScore({
      // Core audits
      performance: performanceResult.score,
      security: securityResult.score,
      seo: seoResult.score,
      accessibility: accessibilityResult.score,
      codeQuality: codeQualityResult.score,
      // Phase 1 audits
      vulnerabilities: getVulnerabilityScore(vulnerabilityResult.vulnerableLibraries),
      protocol: getProtocolScore(protocolResult),
      images: imageResult.score,
      caching: cacheResult.score,
      redirects: getRedirectScore(redirectResult),
      // Phase 3 audits
      pwa: pwaResult.score,
      structuredData: structuredDataResult.score,
      links: linksResult.score,
    });

    const overallScore = scoringResult.overall;
    const letterGrade = scoringResult.letterGrade;
    console.log(`Comprehensive score calculated: ${overallScore}/100 (${letterGrade})`);

    // Generate roast
    const roast = await generateRoast({
      url,
      scores: {
        overall: overallScore,
        letterGrade,
        performance: performanceResult.score,
        security: securityResult.score,
        seo: seoResult.score,
        accessibility: accessibilityResult.score,
        codeQuality: codeQualityResult.score,
      },
      scoringBreakdown: scoringResult.breakdown,
      securityFindings: securityResult.findings,
      performanceMetrics: performanceResult.metrics,
      seoFindings: seoResult.findings,
      accessibilityViolations: accessibilityResult.violations,
      codeQualityIssues: codeQualityResult.issues,
      techStack,
      resourceAnalysis,
      // Phase 1 new audits
      vulnerabilities: vulnerabilityResult,
      protocol: protocolResult,
      images: imageResult,
      caching: cacheResult,
      redirects: redirectResult,
      // Phase 3 new audits
      pwa: pwaResult,
      structuredData: structuredDataResult,
      links: linksResult,
    });

    // Update final results
    await updateScan(scanId, {
      status: 'completed',
      score_overall: overallScore,
      letter_grade: letterGrade,
      scoring_breakdown: scoringResult,
      roast_title: roast.title,
      roast_body: roast.body,
      roast_fixes: roast.fixes,
      llm_report: roast.llmReport,
      roast_is_fallback: roast.isFallback || false,
      roast_fallback_reason: roast.fallbackReason || null,
      completed_at: new Date().toISOString(),
    });

    console.log(`Scan complete for ${scanId}: Overall score ${overallScore}/100 (${letterGrade})`);

    return {
      security: securityResult,
      performance: performanceResult,
      seo: seoResult,
      accessibility: accessibilityResult,
      codeQuality: codeQualityResult,
      techStack,
      resources: resourceAnalysis,
      vulnerabilities: vulnerabilityResult,
      protocol: protocolResult,
      images: imageResult,
      caching: cacheResult,
      redirects: redirectResult,
      pwa: pwaResult,
      structuredData: structuredDataResult,
      links: linksResult,
      roast,
      overallScore,
      letterGrade,
      scoringBreakdown: scoringResult,
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

/**
 * Run a code upload scan (Phase 2)
 * Analyzes uploaded files for dependencies, secrets, and code patterns
 */
export async function runUploadScan(
  scanId: string,
  files: UploadedFile[]
): Promise<UploadScanResult> {
  console.log(`Starting upload scan for ${scanId} with ${files.length} files`);

  // Update status to processing
  await updateScan(scanId, {
    status: 'processing',
    started_at: new Date().toISOString(),
  });

  try {
    // Run all audits in parallel
    console.log(`Running code audits for ${scanId}...`);

    const [dependenciesResult, secretsResult, codePatternsResult] = await Promise.all([
      auditDependencies(files),
      scanForSecrets(files),
      scanCodePatterns(files),
    ]);

    // Save dependency audit results
    await updateScan(scanId, {
      results_dependencies: dependenciesResult,
    });
    console.log(
      `Dependency audit complete: ${dependenciesResult.details.length} vulnerabilities found`
    );

    // Save secrets audit results
    await updateScan(scanId, {
      results_secrets: secretsResult,
    });
    console.log(`Secrets audit complete: ${secretsResult.findings.length} secrets found`);

    // Save code patterns audit results
    await updateScan(scanId, {
      results_code_patterns: codePatternsResult,
    });
    console.log(`Code patterns audit complete: ${codePatternsResult.issues.length} issues found`);

    // Calculate overall score (weighted average)
    // Dependencies: 40%, Secrets: 40%, Code Patterns: 20%
    const overallScore = Math.round(
      dependenciesResult.score * 0.4 +
        secretsResult.score * 0.4 +
        codePatternsResult.score * 0.2
    );
    const letterGrade = getLetterGrade(overallScore);

    // Generate roast for upload scan
    const roast = await generateUploadRoast({
      filesCount: files.length,
      dependencies: dependenciesResult,
      secrets: secretsResult,
      codePatterns: codePatternsResult,
      overallScore,
    });

    // Update final results
    await updateScan(scanId, {
      status: 'completed',
      score_overall: overallScore,
      letter_grade: letterGrade,
      score_security: secretsResult.score,
      score_code_quality: codePatternsResult.score,
      roast_title: roast.title,
      roast_body: roast.body,
      roast_fixes: roast.fixes,
      llm_report: roast.llmReport,
      roast_is_fallback: roast.isFallback || false,
      roast_fallback_reason: roast.fallbackReason || null,
      completed_at: new Date().toISOString(),
    });

    console.log(`Upload scan complete for ${scanId}: Overall score ${overallScore}/100 (${letterGrade})`);

    return {
      dependencies: dependenciesResult,
      secrets: secretsResult,
      codePatterns: codePatternsResult,
      roast,
      overallScore,
      letterGrade,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Upload scan failed for ${scanId}:`, errorMessage);

    await updateScan(scanId, {
      status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    });

    throw error;
  }
}
