'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ScoreRing } from '@/components/ScoreRing';
import { getGrade, getScoreColor, getCategoryDisplayName } from '@/lib/scoring';
import type { Scan, AuditFix } from '@/types/scan';

interface TVFocusViewProps {
  scans: Scan[];
  currentIndex: number;
  onBack: () => void;
}

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

function getPriorityColor(priority: AuditFix['priority']): string {
  switch (priority) {
    case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
    case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  }
}

function FocusSlide({ scan }: { scan: Scan }) {
  const topFixes = (scan.analysisFixes ?? []).slice(0, 3);
  const grade = getGrade(scan.scoreOverall ?? 0);

  return (
    <div className="flex-1 flex flex-col px-12 py-8 h-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 uppercase tracking-wider">ESC to go back</span>
        </div>
        <h1 className="text-3xl font-bold font-display truncate max-w-[60vw]">
          {stripUrl(scan.url)}
        </h1>
        <div className={`text-lg font-bold px-3 py-1 rounded-full ${getScoreColor(scan.scoreOverall ?? 0)} bg-gray-900 border border-gray-800`}>
          {grade}
        </div>
      </div>

      {/* Main content: ScoreRing + categories + fixes */}
      <div className="flex-1 flex gap-10 min-h-0">
        {/* Left: ScoreRing */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <ScoreRing score={scan.scoreOverall ?? 0} size="tv" animate={false} />
        </div>

        {/* Right: Categories + Fixes */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Category cards */}
          <div className="flex gap-4 mb-8">
            {CATEGORIES.map((cat) => {
              const score = getCategoryScore(scan, cat) ?? 0;
              const color = getScoreColor(score);

              return (
                <div
                  key={cat}
                  className="flex-1 bg-gray-900 rounded-2xl p-5 border border-gray-800"
                >
                  <div className="text-sm text-gray-500 uppercase tracking-wider mb-3">
                    {getCategoryDisplayName(cat)}
                  </div>
                  <div className={`text-4xl font-bold font-display ${color}`}>
                    {score}
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top priority fixes */}
          {topFixes.length > 0 && (
            <div className="flex-1 min-h-0">
              <h3 className="text-lg font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                Top Priorities
              </h3>
              <div className="flex flex-col gap-3">
                {topFixes.map((fix, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 bg-gray-900 rounded-xl p-5 border border-gray-800"
                  >
                    <span
                      className={`text-xs font-bold uppercase px-2 py-1 rounded border shrink-0 ${getPriorityColor(fix.priority)}`}
                    >
                      {fix.priority}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-lg font-semibold text-gray-100 truncate">
                        {fix.title}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {fix.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TVFocusView({ scans, currentIndex, onBack }: TVFocusViewProps) {
  const [displayIndex, setDisplayIndex] = useState(currentIndex);
  const [phase, setPhase] = useState<'visible' | 'fading-out' | 'fading-in'>('visible');
  const prevIndex = useRef(currentIndex);

  // Crossfade when currentIndex changes (auto-rotation from parent)
  useEffect(() => {
    if (currentIndex === prevIndex.current) return;
    prevIndex.current = currentIndex;

    setPhase('fading-out');

    const fadeOutTimer = setTimeout(() => {
      setDisplayIndex(currentIndex);
      setPhase('fading-in');

      const fadeInTimer = setTimeout(() => {
        setPhase('visible');
      }, 600);

      return () => clearTimeout(fadeInTimer);
    }, 500);

    return () => clearTimeout(fadeOutTimer);
  }, [currentIndex]);

  // Escape to go back
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onBack]);

  const scan = scans[displayIndex];
  if (!scan) return null;

  const opacity = phase === 'fading-out' ? 'opacity-0 scale-[0.97]'
    : phase === 'fading-in' ? 'opacity-0 scale-[1.03]'
    : 'opacity-100 scale-100';

  return (
    <div className="h-screen bg-gray-950 text-gray-50 overflow-hidden flex flex-col">
      <div
        className={`flex-1 flex flex-col transition-all duration-500 ease-premium ${opacity}`}
        style={{ willChange: 'opacity, transform' }}
      >
        <FocusSlide scan={scan} />
      </div>

      {/* Bottom bar with slide dots */}
      {scans.length > 1 && (
        <div className="flex items-center justify-center px-8 py-3 border-t border-gray-800/50">
          <div className="flex gap-2">
            {scans.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === currentIndex
                    ? 'bg-primary w-6'
                    : 'bg-gray-700 w-2'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
