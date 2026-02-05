'use client';

import { useRef, useMemo, useCallback, useState } from 'react';
import Link from 'next/link';
import { ScoreRing } from '@/components/ScoreRing';
import { CategorySection } from '@/components/CategorySection';
import { CategoryProgressBar } from '@/components/CategoryProgressBar';
import { ExecutiveSummary } from '@/components/ExecutiveSummary';
import { LoadingState } from '@/components/LoadingState';
import { FixList } from '@/components/FixList';
import { ShareCard } from '@/components/ShareCard';
import { LLMReport } from '@/components/LLMReport';
import { ReportDownloadButton } from '@/components/ReportDownloadButton';
import { ReportNav } from '@/components/ReportNav';
import { ScrollReveal } from '@/components/ScrollReveal';
import { useScanRealtime } from '@/lib/useScanRealtime';
import { getGrade, getGradeColor, type CategoryScores } from '@/lib/scoring';
import type { Scan } from '@/types/scan';

interface ScanResultsClientProps {
  initialScan: Scan | null;
  scanId: string;
}

// Group tech stack items by category
function groupTechStack(techStack: Scan['resultsTechStack']) {
  if (!techStack || techStack.length === 0) return null;
  const groups: Record<string, typeof techStack> = {};
  for (const tech of techStack) {
    const cat = tech.category || 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(tech);
  }
  return groups;
}

function formatTimestamp(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function ScanResultsClient({ initialScan, scanId }: ScanResultsClientProps) {
  const startedAtRef = useRef(Date.now());
  const { scan: realtimeScan, progress, error } = useScanRealtime(scanId);
  const [linkCopied, setLinkCopied] = useState(false);

  // Use realtime scan if available (has latest data), otherwise initial
  const scan = realtimeScan || initialScan;

  const scrollToCategory = useCallback((category: keyof CategoryScores) => {
    const el = document.getElementById(`category-${category}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Memoize scan-derived data for CategorySection memo() to work
  const securityFindings = useMemo(() => scan?.resultsSecurity?.findings, [scan?.resultsSecurity]);
  const performanceMetrics = useMemo(() => scan?.resultsPerformance?.metrics, [scan?.resultsPerformance]);
  const a11yViolations = useMemo(() => scan?.resultsAccessibility?.violations, [scan?.resultsAccessibility]);
  const seoFindings = useMemo(() => scan?.resultsSeo?.findings, [scan?.resultsSeo]);
  const codeQualityIssues = useMemo(() => scan?.resultsCodeQuality?.issues, [scan?.resultsCodeQuality]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch { /* noop */ }
  }, []);

  const handleShareX = useCallback(() => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      scan ? `Just audited ${scan.url.replace(/^https?:\/\//, '').replace(/\/+$/, '')} and scored ${scan.scoreOverall}/100` : ''
    );
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener');
  }, [scan]);

  const handleShareLinkedIn = useCallback(() => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener');
  }, []);

  // Build category scores for ReportNav
  const categoryScores = useMemo(() => {
    if (!scan) return undefined;
    const scores: Record<string, number | undefined> = {};
    if (scan.scoreSecurity !== undefined) scores.security = scan.scoreSecurity;
    if (scan.scorePerformance !== undefined) scores.performance = scan.scorePerformance;
    if (scan.scoreAccessibility !== undefined) scores.accessibility = scan.scoreAccessibility;
    if (scan.scoreSeo !== undefined) scores.seo = scan.scoreSeo;
    if (scan.scoreCodeQuality !== undefined) scores.codeQuality = scan.scoreCodeQuality;
    return scores;
  }, [scan?.scoreSecurity, scan?.scorePerformance, scan?.scoreAccessibility, scan?.scoreSeo, scan?.scoreCodeQuality]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 bg-gray-950">
        <div className="animate-scale-in text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-danger/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-50 mb-4">Scan Failed</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-emerald-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all duration-300"
          >
            <span>Try Again</span>
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (!scan || scan.status === 'pending' || scan.status === 'processing') {
    return (
      <div className="min-h-screen flex flex-col items-start justify-start px-3 sm:px-4 pt-24 bg-gray-950">
        <LoadingState
          phase={progress.phase}
          percentage={progress.percentage}
          completedAudits={progress.completedAudits}
          currentPhase={progress.currentPhase}
          url={scan?.url}
          startedAt={startedAtRef.current}
        />
      </div>
    );
  }

  // Failed scan
  if (scan.status === 'failed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 bg-gray-950">
        <div className="animate-scale-in text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-50 mb-4">Scan Incomplete</h1>
          <p className="text-gray-400 mb-4 leading-relaxed">
            We couldn&apos;t complete the scan for this URL.
          </p>
          {scan.errorMessage && (
            <div className="animate-fade-up text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl p-4 mb-8">
              {scan.errorMessage}
            </div>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-emerald-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all duration-300"
          >
            <span>Scan Another Site</span>
          </Link>
        </div>
      </div>
    );
  }

  // === Results view ===
  const grade = scan.letterGrade || getGrade(scan.scoreOverall || 0);
  const techGroups = groupTechStack(scan.resultsTechStack);
  const timestamp = formatTimestamp(scan.completedAt);

  // Determine which sections exist for nav
  const hasSummary = !!(scan.analysisTitle && scan.analysisBody);
  const hasFixes = !!(scan.analysisFixes && scan.analysisFixes.length > 0);
  const hasTechStack = !!techGroups;
  const hasLLMReport = !!scan.llmReport;

  return (
    <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4 bg-gray-950">
      {/* Scrollspy Navigation */}
      <ReportNav
        categoryScores={categoryScores}
        hasSummary={hasSummary}
        hasFixes={hasFixes}
        hasTechStack={hasTechStack}
        hasLLMReport={hasLLMReport}
      />

      <div className="max-w-4xl mx-auto">

        {/* A. STICKY HEADER BAR */}
        <div className="animate-fade-up sticky top-[48px] z-30 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800/50 -mx-3 sm:-mx-4 px-3 sm:px-4 py-3 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl min-w-0">
                <span className="text-emerald-500 font-semibold text-sm shrink-0">URL:</span>
                <span className="text-gray-300 text-sm truncate max-w-[200px] sm:max-w-[350px]">
                  {scan.url.replace(/^https?:\/\//, '').replace(/\/+$/, '')}
                </span>
              </div>
              {timestamp && (
                <span className="hidden sm:block text-xs text-gray-500">{timestamp}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 screenshot-ignore">
              {/* Copy link */}
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
                title="Copy link"
              >
                {linkCopied ? (
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )}
              </button>
              {/* Share on X */}
              <button
                onClick={handleShareX}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
                title="Share on X"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              {/* Share on LinkedIn */}
              <button
                onClick={handleShareLinkedIn}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
                title="Share on LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
              {/* Download */}
              <ReportDownloadButton scan={scan} />
            </div>
          </div>
        </div>

        {/* B. HERO SCORE */}
        <section
          id="section-overview"
          className="scroll-mt-28 animate-fade-up bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6 mb-10"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* Score Ring + Grade */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              <div className="animate-scale-up" style={{ animationDelay: '200ms' }}>
                <ScoreRing
                  score={scan.scoreOverall || 0}
                  size="xl"
                  label="OVERALL"
                />
              </div>
              <div
                className="animate-fade-left flex flex-col items-center"
                style={{ animationDelay: '300ms' }}
              >
                <div className={`text-5xl sm:text-7xl font-black tracking-tight ${getGradeColor(grade)}`}>
                  {grade}
                </div>
              </div>
            </div>

            {/* Category Progress Bars */}
            <div className="flex-1 w-full space-y-1">
              {scan.scoreSecurity !== undefined && (
                <CategoryProgressBar category="security" score={scan.scoreSecurity} onClick={() => scrollToCategory('security')} />
              )}
              {scan.scorePerformance !== undefined && (
                <CategoryProgressBar category="performance" score={scan.scorePerformance} onClick={() => scrollToCategory('performance')} />
              )}
              {scan.scoreAccessibility !== undefined && (
                <CategoryProgressBar category="accessibility" score={scan.scoreAccessibility} onClick={() => scrollToCategory('accessibility')} />
              )}
              {scan.scoreSeo !== undefined && (
                <CategoryProgressBar category="seo" score={scan.scoreSeo} onClick={() => scrollToCategory('seo')} />
              )}
              {scan.scoreCodeQuality !== undefined && (
                <CategoryProgressBar category="codeQuality" score={scan.scoreCodeQuality} onClick={() => scrollToCategory('codeQuality')} />
              )}
            </div>
          </div>
        </section>

        {/* C. EXECUTIVE SUMMARY */}
        {hasSummary && (
          <section
            id="section-summary"
            className="scroll-mt-28 animate-fade-up mb-10"
          >
            <h2 className="text-lg font-semibold text-gray-50 mb-3 flex items-center gap-2">
              <div className="w-1 h-5 bg-emerald-500 rounded-full" />
              {scan.analysisTitle}
            </h2>
            <ExecutiveSummary
              body={scan.analysisBody!}
              score={scan.scoreOverall || 0}
            />
          </section>
        )}

        {/* Divider */}
        {hasSummary && hasFixes && <div className="h-px bg-gray-800/50 mb-10" />}

        {/* D. PRIORITY FIXES */}
        {hasFixes && (
          <ScrollReveal delay={0}>
            <section id="section-fixes" className="scroll-mt-28 mb-10">
              <FixList fixes={scan.analysisFixes!} />
            </section>
          </ScrollReveal>
        )}

        {/* Divider */}
        <div className="h-px bg-gray-800/50 mb-10" />

        {/* E. CATEGORY DEEP DIVES */}
        <ScrollReveal delay={0}>
          <section id="section-categories" className="scroll-mt-28 mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-50 mb-4 flex items-center gap-3">
              <div className="w-1 h-5 bg-emerald-500 rounded-full" />
              <span>Category Breakdown</span>
              <div className="h-px flex-1 bg-gray-800 ml-4" />
            </h2>

            <div className="grid gap-3">
              {/* Security */}
              {scan.scoreSecurity !== undefined && (
                <div id="category-security" className="scroll-mt-28">
                  <CategorySection
                    category="security"
                    score={scan.scoreSecurity}
                    findings={securityFindings}
                    protocol={scan.resultsProtocol}
                    vulnerabilities={scan.resultsVulnerabilities}
                  />
                </div>
              )}

              {/* Performance */}
              {scan.scorePerformance !== undefined && (
                <div id="category-performance" className="scroll-mt-28">
                  <CategorySection
                    category="performance"
                    score={scan.scorePerformance}
                    metrics={performanceMetrics}
                    images={scan.resultsImages}
                    caching={scan.resultsCaching}
                    redirects={scan.resultsRedirects}
                  />
                </div>
              )}

              {/* Accessibility */}
              {scan.scoreAccessibility !== undefined && (
                <div id="category-accessibility" className="scroll-mt-28">
                  <CategorySection
                    category="accessibility"
                    score={scan.scoreAccessibility}
                    violations={a11yViolations}
                  />
                </div>
              )}

              {/* SEO */}
              {scan.scoreSeo !== undefined && (
                <div id="category-seo" className="scroll-mt-28">
                  <CategorySection
                    category="seo"
                    score={scan.scoreSeo}
                    seoFindings={seoFindings}
                    structuredData={scan.resultsStructuredData}
                    links={scan.resultsLinks}
                  />
                </div>
              )}

              {/* Code Quality */}
              {scan.scoreCodeQuality !== undefined && (
                <div id="category-codeQuality" className="scroll-mt-28">
                  <CategorySection
                    category="codeQuality"
                    score={scan.scoreCodeQuality}
                    issues={codeQualityIssues}
                    pwa={scan.resultsPwa}
                  />
                </div>
              )}
            </div>
          </section>
        </ScrollReveal>

        {/* Divider */}
        {hasTechStack && <div className="h-px bg-gray-800/50 mb-10" />}

        {/* F. TECH STACK */}
        {hasTechStack && (
          <ScrollReveal delay={0}>
            <section id="section-techstack" className="scroll-mt-28 mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-50 mb-4 flex items-center gap-3">
                <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                <span>Tech Stack</span>
                <div className="h-px flex-1 bg-gray-800 ml-4" />
              </h2>
              <div className="space-y-4">
                {Object.entries(techGroups!).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 capitalize">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {items.map((tech, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 hover:border-emerald-500/30 hover:bg-gray-800 transition-all inline-flex items-center gap-1.5 cursor-default"
                          title={`${tech.confidence}% confidence${tech.version ? `, v${tech.version}` : ''}`}
                        >
                          {tech.name}
                          {tech.version && (
                            <span className="text-xs text-gray-500">{tech.version}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Divider */}
        {hasLLMReport && <div className="h-px bg-gray-800/50 mb-10" />}

        {/* G. FIX WITH AI */}
        {hasLLMReport && (
          <ScrollReveal delay={0}>
            <section id="section-ai" className="scroll-mt-28 mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-50 mb-4 flex items-center gap-3">
                <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                <span>Fix With AI</span>
                <div className="h-px flex-1 bg-gray-800 ml-4" />
              </h2>
              <LLMReport report={scan.llmReport!} />
            </section>
          </ScrollReveal>
        )}

        {/* Divider */}
        <div className="h-px bg-gray-800/50 mb-10" />

        {/* H. SHARE & EXPORT */}
        <ScrollReveal delay={0}>
          <section className="mb-10">
            <ShareCard
              scanId={scan.id}
              url={scan.url}
              score={scan.scoreOverall || 0}
              twitterSummary={scan.twitterSummary}
            />
          </section>
        </ScrollReveal>

        {/* I. Scan Another */}
        <section className="text-center py-8 border-t border-gray-800">
          <Link
            href="/"
            className="text-gray-400 hover:text-emerald-500 transition-colors text-sm inline-flex items-center gap-2"
          >
            <span>Scan another URL</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </section>
      </div>
    </div>
  );
}
