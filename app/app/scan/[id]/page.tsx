'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ScoreRing } from '@/components/ScoreRing';
import { ResultsCard } from '@/components/ResultsCard';
import { LoadingState } from '@/components/LoadingState';
import { RoastText } from '@/components/RoastText';
import { FixList } from '@/components/FixList';
import { GlitchText } from '@/components/GlitchText';
import { ShareCard } from '@/components/ShareCard';
import { LLMReport } from '@/components/LLMReport';
import { ExtendedAudits } from '@/components/ExtendedAudits';
import { useScanRealtime } from '@/lib/useScanRealtime';
import { getGrade, getGradeColor } from '@/lib/scoring';

export default function ScanResultsPage() {
  const params = useParams();
  const scanId = params.id as string;

  // Use real-time Supabase subscription instead of polling
  const { scan, progress, error, isLoading } = useScanRealtime(scanId);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="text-6xl mb-6 block">💀</span>
          <h1 className="text-2xl font-bold text-danger mb-4">
            <GlitchText text="SCAN FAILED" glitchIntensity="high" />
          </h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/" className="btn-primary inline-block">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !scan || scan.status === 'pending' || scan.status === 'processing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 font-mono mb-2">
            Scanning: <span className="text-terminal">{scan?.url || 'Loading...'}</span>
          </p>
        </div>
        <LoadingState
          phase={progress.phase}
          percentage={progress.percentage}
          completedAudits={progress.completedAudits}
        />
      </div>
    );
  }

  // Failed scan
  if (scan.status === 'failed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="text-6xl mb-6 block">⚠️</span>
          <h1 className="text-2xl font-bold text-neon-orange mb-4">
            <GlitchText text="SCAN INCOMPLETE" glitchIntensity="medium" />
          </h1>
          <p className="text-gray-400 mb-4">
            We couldn't complete the scan for this URL.
          </p>
          {scan.errorMessage && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded p-3 mb-6">
              {scan.errorMessage}
            </p>
          )}
          <Link href="/" className="btn-primary inline-block">
            Scan Another Site
          </Link>
        </div>
      </div>
    );
  }

  // Results view
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold text-terminal hover:text-terminal-bright transition-colors">
              3RROR_K1NG
            </span>
          </Link>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
            <span className="text-terminal">TARGET:</span>
            <a
              href={scan.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-terminal transition-colors truncate max-w-xs"
            >
              {scan.url}
            </a>
          </div>
        </header>

        {/* Overall Score with Letter Grade */}
        <section className="text-center mb-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {/* Numeric Score */}
            <ScoreRing
              score={scan.scoreOverall || 0}
              size="xl"
              label="OVERALL SCORE"
            />

            {/* Letter Grade */}
            <div className="flex flex-col items-center">
              <div className={`text-8xl md:text-9xl font-black tracking-tight ${getGradeColor(scan.letterGrade || getGrade(scan.scoreOverall || 0))}`}
                   style={{ textShadow: '0 0 30px currentColor, 0 0 60px currentColor' }}>
                {scan.letterGrade || getGrade(scan.scoreOverall || 0)}
              </div>
              <span className="text-lg text-gray-400 font-medium mt-2">GRADE</span>
            </div>
          </div>

          {/* Scoring Breakdown (if available) */}
          {scan.scoringBreakdown?.breakdown && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {scan.scoringBreakdown.breakdown.map((cat) => (
                  <div key={cat.category} className="bg-void-50 border border-void-100 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{cat.category}</div>
                    <div className={`text-xl font-bold ${cat.score >= 90 ? 'text-terminal' : cat.score >= 70 ? 'text-neon-yellow' : cat.score >= 50 ? 'text-neon-orange' : 'text-danger'}`}>
                      {cat.score}
                    </div>
                    <div className="text-xs text-gray-600">{cat.weight}% weight</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Roast Section */}
        {scan.roastTitle && scan.roastBody && (
          <section className="mb-12">
            <RoastText
              title={scan.roastTitle}
              body={scan.roastBody}
              score={scan.scoreOverall || 0}
            />
          </section>
        )}

        {/* Category Scores Grid */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-100 mb-6">
            <span className="text-terminal">&gt;</span> Category Breakdown
          </h2>

          <div className="grid gap-4">
            {scan.scoreSecurity !== undefined && (
              <ResultsCard
                category="security"
                score={scan.scoreSecurity}
                findings={scan.resultsSecurity?.findings}
              />
            )}

            {scan.scorePerformance !== undefined && (
              <ResultsCard
                category="performance"
                score={scan.scorePerformance}
                metrics={scan.resultsPerformance?.metrics}
              />
            )}

            {scan.scoreSeo !== undefined && (
              <ResultsCard
                category="seo"
                score={scan.scoreSeo}
                seoFindings={scan.resultsSeo?.findings}
              />
            )}

            {scan.scoreAccessibility !== undefined && (
              <ResultsCard
                category="accessibility"
                score={scan.scoreAccessibility}
                violations={scan.resultsAccessibility?.violations}
              />
            )}

            {scan.scoreCodeQuality !== undefined && (
              <ResultsCard
                category="codeQuality"
                score={scan.scoreCodeQuality}
                issues={scan.resultsCodeQuality?.issues}
              />
            )}
          </div>
        </section>

        {/* Extended Audits (Phase 1 & 3) */}
        <ExtendedAudits scan={scan} />

        {/* Tech Stack */}
        {scan.resultsTechStack && scan.resultsTechStack.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-100 mb-6">
              <span className="text-terminal">&gt;</span> Detected Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {scan.resultsTechStack.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-void-50 border border-void-100 rounded-full text-sm text-gray-300"
                  title={`${tech.confidence}% confidence`}
                >
                  {tech.name}
                  <span className="ml-1.5 text-xs text-gray-500 capitalize">
                    ({tech.category})
                  </span>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Fix List */}
        {scan.roastFixes && scan.roastFixes.length > 0 && (
          <section className="mb-12">
            <FixList fixes={scan.roastFixes} />
          </section>
        )}

        {/* LLM Report - Copy for AI */}
        {scan.llmReport && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-100 mb-6">
              <span className="text-terminal">&gt;</span> Fix With AI
            </h2>
            <LLMReport report={scan.llmReport} />
          </section>
        )}

        {/* Share Section */}
        <section className="mb-12">
          <ShareCard
            scanId={scan.id}
            url={scan.url}
            score={scan.scoreOverall || 0}
          />
        </section>

        {/* Scan another */}
        <section className="text-center py-8 border-t border-void-100">
          <p className="text-gray-500 mb-4">Want to roast another site?</p>
          <Link href="/" className="btn-secondary">
            Scan Another URL
          </Link>
        </section>
      </div>
    </div>
  );
}
