'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ScoreRing } from '@/components/ScoreRing';
import { ResultsCard } from '@/components/ResultsCard';
import { LoadingState } from '@/components/LoadingState';
import { RoastText } from '@/components/RoastText';
import { FixList } from '@/components/FixList';
import { GlitchText } from '@/components/GlitchText';
import { ShareCard } from '@/components/ShareCard';
import { LLMReport } from '@/components/LLMReport';
import type { Scan, ScanPollResponse } from '@/types/scan';

export default function ScanResultsPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params.id as string;

  const [scan, setScan] = useState<Scan | null>(null);
  const [progress, setProgress] = useState({ phase: '', percentage: 5 });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pollScan = useCallback(async () => {
    try {
      const response = await fetch(`/api/scan/${scanId}`);
      const data: ScanPollResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.scan?.errorMessage || 'Failed to fetch scan');
      }

      setScan(data.scan);

      if (data.progress) {
        setProgress(data.progress);
      }

      // Continue polling if not complete
      if (data.scan.status === 'pending' || data.scan.status === 'processing') {
        return true; // Continue polling
      }

      setIsLoading(false);
      return false; // Stop polling
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
      return false;
    }
  }, [scanId]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      const shouldContinue = await pollScan();
      if (shouldContinue) {
        timeoutId = setTimeout(poll, 2000); // Poll every 2 seconds
      }
    };

    poll();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pollScan]);

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
        <LoadingState phase={progress.phase} percentage={progress.percentage} />
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

        {/* Overall Score */}
        <section className="text-center mb-12">
          <ScoreRing
            score={scan.scoreOverall || 0}
            size="xl"
            label="OVERALL SCORE"
          />
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
