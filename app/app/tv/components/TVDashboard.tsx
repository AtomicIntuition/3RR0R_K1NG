'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ScoreRing } from '@/components/ScoreRing';
import { getGrade, getScoreColor, getCategoryDisplayName } from '@/lib/scoring';
import { useDpadNavigation } from '../hooks/useDpadNavigation';
import type { Scan } from '@/types/scan';

interface TVDashboardProps {
  scans: Scan[];
  onSelectScan: (scan: Scan) => void;
}

const CYCLE_INTERVAL = 15_000; // 15 seconds
const PAUSE_DURATION = 30_000; // 30 seconds after manual nav

const CATEGORIES = ['performance', 'security', 'seo', 'accessibility', 'codeQuality'] as const;

function getCategoryScore(scan: Scan, cat: typeof CATEGORIES[number]): number | undefined {
  switch (cat) {
    case 'performance': return scan.scorePerformance;
    case 'security': return scan.scoreSecurity;
    case 'seo': return scan.scoreSeo;
    case 'accessibility': return scan.scoreAccessibility;
    case 'codeQuality': return scan.scoreCodeQuality;
  }
}

function stripUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

function formatClock(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function TVDashboard({ scans, onSelectScan }: TVDashboardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [clock, setClock] = useState(formatClock);
  const cycleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseUntil = useRef(0);

  const scanCount = scans.length;

  // Clock tick
  useEffect(() => {
    const interval = setInterval(() => setClock(formatClock()), 30_000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle
  const scheduleNext = useCallback(() => {
    if (cycleTimer.current) clearTimeout(cycleTimer.current);
    if (scanCount <= 1) return;

    cycleTimer.current = setTimeout(() => {
      if (Date.now() < pauseUntil.current) {
        scheduleNext();
        return;
      }
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % scanCount);
        setIsTransitioning(false);
        scheduleNext();
      }, 800); // match crossfade-out duration
    }, CYCLE_INTERVAL);
  }, [scanCount]);

  useEffect(() => {
    scheduleNext();
    return () => {
      if (cycleTimer.current) clearTimeout(cycleTimer.current);
    };
  }, [scheduleNext]);

  // D-pad navigation — left/right to cycle, enter to focus
  const handleSelect = useCallback(() => {
    if (scans[currentIndex]) {
      onSelectScan(scans[currentIndex]);
    }
  }, [currentIndex, scans, onSelectScan]);

  const { focusedIndex } = useDpadNavigation({
    items: scanCount,
    onSelect: handleSelect,
    enabled: !isTransitioning,
  });

  // When user navigates manually via arrow keys, update slide + pause auto-cycle
  useEffect(() => {
    if (focusedIndex !== currentIndex && !isTransitioning) {
      setIsTransitioning(true);
      pauseUntil.current = Date.now() + PAUSE_DURATION;
      setTimeout(() => {
        setCurrentIndex(focusedIndex);
        setIsTransitioning(false);
      }, 400);
    }
  }, [focusedIndex, currentIndex, isTransitioning]);

  if (scans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-gray-50">
        <h2 className="text-4xl font-bold font-display mb-4">No Scans Yet</h2>
        <p className="text-2xl text-gray-400">
          Run your first scan at <span className="text-primary">crisp.sh</span>
        </p>
      </div>
    );
  }

  const scan = scans[currentIndex];
  if (!scan) return null;

  const grade = getGrade(scan.scoreOverall ?? 0);
  const gradeColor = getScoreColor(scan.scoreOverall ?? 0);
  const summary = scan.analysisBody
    ? scan.analysisBody.split('\n')[0]?.slice(0, 120)
    : 'Audit complete';

  return (
    <div className="relative h-screen bg-gray-950 text-gray-50 overflow-hidden flex flex-col">
      {/* Main content area */}
      <div
        className={`flex-1 flex flex-col items-center justify-center px-16 transition-opacity duration-700 ${
          isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* URL */}
        <h1 className="text-4xl font-bold font-display mb-2 text-gray-50 truncate max-w-[80vw]">
          {stripUrl(scan.url)}
        </h1>

        {/* Grade badge */}
        <div className={`text-xl font-bold px-4 py-1 rounded-full mb-8 ${gradeColor} bg-gray-900 border border-gray-800`}>
          {grade}
        </div>

        {/* Central ScoreRing */}
        <ScoreRing score={scan.scoreOverall ?? 0} size="tv" animate={false} />

        {/* Executive summary one-liner */}
        <p className="text-xl text-gray-400 mt-8 max-w-2xl text-center leading-relaxed">
          {summary}
        </p>

        {/* Category scores */}
        <div className="flex gap-8 mt-10">
          {CATEGORIES.map((cat) => {
            const score = getCategoryScore(scan, cat) ?? 0;
            const color = getScoreColor(score);
            return (
              <div key={cat} className="flex flex-col items-center gap-2 min-w-[120px]">
                <span className="text-sm text-gray-500 uppercase tracking-wider">
                  {getCategoryDisplayName(cat)}
                </span>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className={`text-lg font-bold ${color}`}>{score}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-8 py-4 border-t border-gray-800/50">
        {/* Crisp logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold font-display text-primary">Crisp</span>
        </div>

        {/* Slide indicator dots */}
        {scanCount > 1 && (
          <div className="flex gap-2">
            {scans.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'bg-primary w-6'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        )}

        {/* Right side info */}
        <div className="flex items-center gap-6 text-gray-500">
          <span className="text-sm">{scanCount} site{scanCount !== 1 ? 's' : ''}</span>
          <span className="text-sm font-mono">{clock}</span>
        </div>
      </div>
    </div>
  );
}
