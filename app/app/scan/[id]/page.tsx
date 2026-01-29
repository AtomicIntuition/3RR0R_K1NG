'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScoreRing } from '@/components/ScoreRing';
import { ResultsCard } from '@/components/ResultsCard';
import { LoadingState } from '@/components/LoadingState';
import { RoastText } from '@/components/RoastText';
import { FixList } from '@/components/FixList';
import { GlitchText } from '@/components/GlitchText';
import { ShareCard } from '@/components/ShareCard';
import { LLMReport } from '@/components/LLMReport';
import { ExtendedAudits } from '@/components/ExtendedAudits';
import { ScreenshotButton } from '@/components/ScreenshotButton';
import { ScrollReveal, StaggerChildren, StaggerItem } from '@/components/ScrollReveal';
import { useScanRealtime } from '@/lib/useScanRealtime';
import { getGrade, getGradeColor } from '@/lib/scoring';

// Optimized animation variants - reduced motion for performance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export default function ScanResultsPage() {
  const params = useParams();
  const scanId = params.id as string;

  // Use real-time Supabase subscription instead of polling
  const { scan, progress, error, isLoading } = useScanRealtime(scanId);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 relative">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-danger/10 rounded-full blur-[150px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md relative z-10"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-7xl mb-6 block"
          >
            💀
          </motion.span>
          <h1 className="text-2xl sm:text-3xl font-bold text-danger mb-4">
            <GlitchText text="SCAN FAILED" glitchIntensity="high" />
          </h1>
          <p className="text-gray-400 mb-8 leading-relaxed">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-terminal text-void font-bold rounded-xl hover:bg-terminal-bright transition-all duration-300 hover:shadow-lg hover:shadow-terminal/25"
          >
            <span>Try Again</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !scan || scan.status === 'pending' || scan.status === 'processing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 relative">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-terminal/5 rounded-full blur-[150px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 relative z-10"
        >
          <p className="inline-flex items-center gap-3 px-4 py-2 bg-void-50/80 backdrop-blur border border-terminal/20 rounded-xl text-xs sm:text-sm font-mono">
            <span className="text-terminal font-bold">TARGET:</span>
            <span className="text-white truncate max-w-[250px] sm:max-w-[400px]">{scan?.url || 'Loading...'}</span>
          </p>
        </motion.div>
        <LoadingState
          phase={progress.phase}
          percentage={progress.percentage}
          completedAudits={progress.completedAudits}
          currentPhase={progress.currentPhase}
        />
      </div>
    );
  }

  // Failed scan
  if (scan.status === 'failed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 relative">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-orange/10 rounded-full blur-[150px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md relative z-10"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-7xl mb-6 block"
          >
            ⚠️
          </motion.span>
          <h1 className="text-2xl sm:text-3xl font-bold text-neon-orange mb-4">
            <GlitchText text="SCAN INCOMPLETE" glitchIntensity="medium" />
          </h1>
          <p className="text-gray-400 mb-4 leading-relaxed">
            We couldn&apos;t complete the scan for this URL.
          </p>
          {scan.errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-xl p-4 mb-8"
            >
              {scan.errorMessage}
            </motion.div>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-terminal text-void font-bold rounded-xl hover:bg-terminal-bright transition-all duration-300 hover:shadow-lg hover:shadow-terminal/25"
          >
            <span>Scan Another Site</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Results view
  return (
    <div className="min-h-screen py-8 px-4 relative">
      {/* Subtle background gradients - absolute not fixed for better performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-terminal/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon-cyan/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Shareable Results Section - This entire area gets captured */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          id="shareable-results"
          className="relative bg-void/90 backdrop-blur-sm rounded-2xl p-4 sm:p-8 pt-4 mb-8 border border-void-100 shadow-2xl"
        >
          {/* Promo Banner - Visible in screenshots */}
          <div className="text-center mb-6 sm:mb-8 py-3 sm:py-4 px-3 sm:px-6 bg-gradient-to-r from-terminal/20 via-terminal/10 to-terminal/20 border-2 border-terminal/50 rounded-xl relative overflow-hidden">
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

            <div className="text-base sm:text-xl md:text-2xl font-bold tracking-tight mb-1 relative">
              <span className="text-white">FREE ROAST + ACTIONABLE FIXES</span>
            </div>
            <div className="text-xs sm:text-sm md:text-base text-gray-400 mb-2 sm:mb-3 relative">
              Security • Performance • SEO • Accessibility
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 relative">
              <div className="h-px w-8 sm:w-12 bg-terminal/50"></div>
              <span className="text-terminal text-base sm:text-xl md:text-2xl font-bold tracking-wider" style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}>
                3RRORK1NG.COM
              </span>
              <div className="h-px w-8 sm:w-12 bg-terminal/50"></div>
            </div>
          </div>

          {/* Header - Target URL with Screenshot Button */}
          <header className="flex flex-row items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 bg-void-50/50 backdrop-blur border border-terminal/20 rounded-xl">
              <span className="text-terminal font-bold text-xs sm:text-base md:text-lg tracking-widest whitespace-nowrap">TARGET:</span>
              <span className="text-white font-mono text-xs sm:text-base md:text-lg truncate max-w-[200px] sm:max-w-[400px] md:max-w-none">
                {scan.url.replace(/^https?:\/\//, '')}
              </span>
            </div>
            <div className="screenshot-ignore">
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
                filename={`3rror-k1ng-${scan.url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-').slice(0, 30)}`}
              />
            </div>
          </header>

          {/* Overall Score with Letter Grade */}
          <section className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex flex-row items-center justify-center gap-4 sm:gap-8"
            >
              {/* Numeric Score - scales down on mobile */}
              <div className="transform scale-75 sm:scale-100 origin-center">
                <ScoreRing
                  score={scan.scoreOverall || 0}
                  size="xl"
                  label="OVERALL SCORE"
                />
              </div>

              {/* Letter Grade - responsive sizing */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className={`text-6xl sm:text-8xl md:text-9xl font-black tracking-tight ${getGradeColor(scan.letterGrade || getGrade(scan.scoreOverall || 0))}`}
                     style={{ textShadow: '0 0 30px currentColor, 0 0 60px currentColor' }}>
                  {scan.letterGrade || getGrade(scan.scoreOverall || 0)}
                </div>
                <span className="text-sm sm:text-lg text-gray-400 font-medium mt-4 sm:mt-6">GRADE</span>
              </motion.div>
            </motion.div>

            {/* Scoring Breakdown (if available) */}
            {scan.scoringBreakdown?.breakdown && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 sm:mt-8 max-w-2xl mx-auto px-2 sm:px-0"
              >
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                  {scan.scoringBreakdown.breakdown.map((cat, index) => (
                    <motion.div
                      key={cat.category}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="bg-void-50 border border-void-100 rounded-xl p-2 sm:p-3 text-center hover:border-terminal/30 transition-all duration-300 group"
                    >
                      <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">{cat.category}</div>
                      <div className={`text-lg sm:text-xl font-bold transition-all duration-300 group-hover:scale-110 ${cat.score >= 90 ? 'text-terminal' : cat.score >= 70 ? 'text-neon-yellow' : cat.score >= 50 ? 'text-neon-orange' : 'text-danger'}`}>
                        {cat.score}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-600">{cat.weight}%</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </section>

          {/* Roast Section */}
          {scan.roastTitle && scan.roastBody && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mb-4"
            >
              <RoastText
                title={scan.roastTitle}
                body={scan.roastBody}
                score={scan.scoreOverall || 0}
                persona={scan.roastPersona}
              />
            </motion.section>
          )}
        </motion.div>

        {/* Category Scores Grid */}
        <ScrollReveal delay={0}>
          <section className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6 flex items-center gap-3">
              <span className="text-terminal text-2xl">&gt;</span>
              <span>Category Breakdown</span>
              <div className="h-px flex-1 bg-gradient-to-r from-terminal/30 to-transparent ml-4" />
            </h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid gap-4"
            >
              {scan.scoreSecurity !== undefined && (
                <motion.div variants={itemVariants}>
                  <ResultsCard
                    category="security"
                    score={scan.scoreSecurity}
                    findings={scan.resultsSecurity?.findings}
                  />
                </motion.div>
              )}

              {scan.scorePerformance !== undefined && (
                <motion.div variants={itemVariants}>
                  <ResultsCard
                    category="performance"
                    score={scan.scorePerformance}
                    metrics={scan.resultsPerformance?.metrics}
                  />
                </motion.div>
              )}

              {scan.scoreSeo !== undefined && (
                <motion.div variants={itemVariants}>
                  <ResultsCard
                    category="seo"
                    score={scan.scoreSeo}
                    seoFindings={scan.resultsSeo?.findings}
                  />
                </motion.div>
              )}

              {scan.scoreAccessibility !== undefined && (
                <motion.div variants={itemVariants}>
                  <ResultsCard
                    category="accessibility"
                    score={scan.scoreAccessibility}
                    violations={scan.resultsAccessibility?.violations}
                  />
                </motion.div>
              )}

              {scan.scoreCodeQuality !== undefined && (
                <motion.div variants={itemVariants}>
                  <ResultsCard
                    category="codeQuality"
                    score={scan.scoreCodeQuality}
                    issues={scan.resultsCodeQuality?.issues}
                  />
                </motion.div>
              )}
            </motion.div>
          </section>
        </ScrollReveal>

        {/* Extended Audits (Phase 1 & 3) */}
        <ScrollReveal delay={0.1}>
          <ExtendedAudits scan={scan} />
        </ScrollReveal>

        {/* Tech Stack */}
        {scan.resultsTechStack && scan.resultsTechStack.length > 0 && (
          <ScrollReveal delay={0.1}>
            <section className="mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6 flex items-center gap-3">
                <span className="text-terminal text-2xl">&gt;</span>
                <span>Detected Tech Stack</span>
                <div className="h-px flex-1 bg-gradient-to-r from-terminal/30 to-transparent ml-4" />
              </h2>
              <StaggerChildren className="flex flex-wrap gap-2" staggerDelay={0.05}>
                {scan.resultsTechStack.map((tech, i) => (
                  <StaggerItem key={i}>
                    <span
                      className="px-4 py-2 bg-void-50/80 backdrop-blur border border-void-100 rounded-xl text-sm text-gray-300 hover:border-terminal/30 hover:bg-void-50 transition-all duration-300 inline-flex items-center gap-2 group cursor-default"
                      title={`${tech.confidence}% confidence`}
                    >
                      <span className="group-hover:text-terminal transition-colors">{tech.name}</span>
                      <span className="text-xs text-gray-500 capitalize px-2 py-0.5 bg-void/50 rounded-md">
                        {tech.category}
                      </span>
                    </span>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </section>
          </ScrollReveal>
        )}

        {/* Fix List */}
        {scan.roastFixes && scan.roastFixes.length > 0 && (
          <ScrollReveal delay={0.1}>
            <section className="mb-12">
              <FixList fixes={scan.roastFixes} />
            </section>
          </ScrollReveal>
        )}

        {/* LLM Report - Copy for AI */}
        {scan.llmReport && (
          <ScrollReveal delay={0.1}>
            <section className="mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6 flex items-center gap-3">
                <span className="text-terminal text-2xl">&gt;</span>
                <span>Fix With AI</span>
                <div className="h-px flex-1 bg-gradient-to-r from-terminal/30 to-transparent ml-4" />
              </h2>
              <LLMReport report={scan.llmReport} />
            </section>
          </ScrollReveal>
        )}

        {/* Share Section */}
        <ScrollReveal delay={0.1}>
          <section className="mb-12">
            <ShareCard
              scanId={scan.id}
              url={scan.url}
              score={scan.scoreOverall || 0}
              twitterRoast={scan.twitterRoast}
            />
          </section>
        </ScrollReveal>

        {/* Scan another */}
        <ScrollReveal delay={0.1}>
          <section className="text-center py-12 border-t border-void-100">
            <p className="text-gray-500 mb-6 text-lg">Want to roast another site?</p>
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-terminal/20 to-neon-cyan/20 border border-terminal/50 text-terminal font-bold rounded-xl hover:bg-terminal/10 transition-all duration-300 hover:shadow-lg hover:shadow-terminal/10 group"
            >
              <span>Scan Another URL</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
