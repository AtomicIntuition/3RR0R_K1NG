'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScoreRing } from '@/components/ScoreRing';
import { CategorySection } from '@/components/CategorySection';
import { CategoryProgressBar } from '@/components/CategoryProgressBar';
import { ExecutiveSummary } from '@/components/ExecutiveSummary';
import { LoadingState } from '@/components/LoadingState';
import { FixList } from '@/components/FixList';
import { ShareCard } from '@/components/ShareCard';
import { LLMReport } from '@/components/LLMReport';
import { ScreenshotButton } from '@/components/ScreenshotButton';
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

export function ScanResultsClient({ initialScan, scanId }: ScanResultsClientProps) {
  const startedAtRef = useRef(Date.now());
  const { scan: realtimeScan, progress, error, isLoading } = useScanRealtime(scanId);

  // Use realtime scan if available (has latest data), otherwise initial
  const scan = realtimeScan || initialScan;

  const scrollToCategory = (category: keyof CategoryScores) => {
    const el = document.getElementById(`category-${category}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 bg-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
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
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !scan || scan.status === 'pending' || scan.status === 'processing') {
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl p-4 mb-8"
            >
              {scan.errorMessage}
            </motion.div>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-emerald-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all duration-300"
          >
            <span>Scan Another Site</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  // === Results view ===
  const grade = scan.letterGrade || getGrade(scan.scoreOverall || 0);
  const techGroups = groupTechStack(scan.resultsTechStack);

  return (
    <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4 bg-gray-950">
      <div className="max-w-4xl mx-auto">

        {/* A. HEADER BAR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl min-w-0">
            <span className="text-emerald-500 font-semibold text-sm shrink-0">URL:</span>
            <span className="text-gray-300 text-sm truncate max-w-[250px] sm:max-w-[400px]">
              {scan.url.replace(/^https?:\/\//, '')}
            </span>
          </div>
          <div className="flex items-center gap-2 screenshot-ignore">
            <ScreenshotButton
              scanData={{
                url: scan.url,
                scoreOverall: scan.scoreOverall || 0,
                letterGrade: scan.letterGrade,
                scoringBreakdown: scan.scoringBreakdown,
                roastTitle: scan.roastTitle,
                roastBody: scan.roastBody,
                id: scan.id,
                fixes: scan.roastFixes,
              }}
              filename={`crisp-audit-${scan.url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-').slice(0, 30)}`}
            />
          </div>
        </motion.div>

        {/* B. HERO SCORE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* Score Ring + Grade */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="transform scale-75 sm:scale-100 origin-center"
              >
                <ScoreRing
                  score={scan.scoreOverall || 0}
                  size="xl"
                  label="OVERALL"
                />
              </motion.div>
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className={`text-5xl sm:text-7xl font-black tracking-tight ${getGradeColor(grade)}`}>
                  {grade}
                </div>
              </motion.div>
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
        </motion.section>

        {/* C. EXECUTIVE SUMMARY */}
        {scan.roastTitle && scan.roastBody && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-50 mb-3">{scan.roastTitle}</h2>
            <ExecutiveSummary
              body={scan.roastBody}
              score={scan.scoreOverall || 0}
            />
          </motion.section>
        )}

        {/* D. PRIORITY FIXES */}
        {scan.roastFixes && scan.roastFixes.length > 0 && (
          <ScrollReveal delay={0}>
            <section className="mb-8">
              <FixList fixes={scan.roastFixes} />
            </section>
          </ScrollReveal>
        )}

        {/* E. CATEGORY DEEP DIVES */}
        <ScrollReveal delay={0}>
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-50 mb-4 flex items-center gap-3">
              <span>Category Breakdown</span>
              <div className="h-px flex-1 bg-gray-800 ml-4" />
            </h2>

            <div className="grid gap-3">
              {/* Security */}
              {scan.scoreSecurity !== undefined && (
                <CategorySection
                  category="security"
                  score={scan.scoreSecurity}
                  findings={scan.resultsSecurity?.findings}
                  protocol={scan.resultsProtocol}
                  vulnerabilities={scan.resultsVulnerabilities}
                />
              )}

              {/* Performance */}
              {scan.scorePerformance !== undefined && (
                <CategorySection
                  category="performance"
                  score={scan.scorePerformance}
                  metrics={scan.resultsPerformance?.metrics}
                  images={scan.resultsImages}
                  caching={scan.resultsCaching}
                  redirects={scan.resultsRedirects}
                />
              )}

              {/* Accessibility */}
              {scan.scoreAccessibility !== undefined && (
                <CategorySection
                  category="accessibility"
                  score={scan.scoreAccessibility}
                  violations={scan.resultsAccessibility?.violations}
                />
              )}

              {/* SEO */}
              {scan.scoreSeo !== undefined && (
                <CategorySection
                  category="seo"
                  score={scan.scoreSeo}
                  seoFindings={scan.resultsSeo?.findings}
                  structuredData={scan.resultsStructuredData}
                  links={scan.resultsLinks}
                />
              )}

              {/* Code Quality */}
              {scan.scoreCodeQuality !== undefined && (
                <CategorySection
                  category="codeQuality"
                  score={scan.scoreCodeQuality}
                  issues={scan.resultsCodeQuality?.issues}
                  pwa={scan.resultsPwa}
                />
              )}
            </div>
          </section>
        </ScrollReveal>

        {/* F. TECH STACK */}
        {techGroups && (
          <ScrollReveal delay={0.1}>
            <section className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-50 mb-4 flex items-center gap-3">
                <span>Tech Stack</span>
                <div className="h-px flex-1 bg-gray-800 ml-4" />
              </h2>
              <div className="space-y-4">
                {Object.entries(techGroups).map(([category, items]) => (
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

        {/* G. FIX WITH AI */}
        {scan.llmReport && (
          <ScrollReveal delay={0.1}>
            <section className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-50 mb-4 flex items-center gap-3">
                <span>Fix With AI</span>
                <div className="h-px flex-1 bg-gray-800 ml-4" />
              </h2>
              <LLMReport report={scan.llmReport} />
            </section>
          </ScrollReveal>
        )}

        {/* H. SHARE & EXPORT */}
        <ScrollReveal delay={0.1}>
          <section className="mb-8">
            <ShareCard
              scanId={scan.id}
              url={scan.url}
              score={scan.scoreOverall || 0}
              twitterRoast={scan.twitterRoast}
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
