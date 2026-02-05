'use client';

import { useCallback } from 'react';
import { ScoreRing } from '@/components/ScoreRing';
import { getGrade, getScoreColor, getCategoryDisplayName } from '@/lib/scoring';
import { useDpadNavigation } from '../hooks/useDpadNavigation';
import type { Scan, AuditFix } from '@/types/scan';

interface TVFocusViewProps {
  scan: Scan;
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

export function TVFocusView({ scan, onBack }: TVFocusViewProps) {
  const handleSelect = useCallback(() => {
    // Could expand category detail in future; no-op for now
  }, []);

  const { focusedIndex } = useDpadNavigation({
    items: CATEGORIES.length,
    columns: 5,
    onSelect: handleSelect,
    onBack,
    enabled: true,
  });

  const topFixes = (scan.analysisFixes ?? []).slice(0, 3);
  const grade = getGrade(scan.scoreOverall ?? 0);

  return (
    <div className="h-screen bg-gray-950 text-gray-50 overflow-hidden flex flex-col px-12 py-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 uppercase tracking-wider">Press ESC to go back</span>
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
            {CATEGORIES.map((cat, i) => {
              const score = getCategoryScore(scan, cat) ?? 0;
              const color = getScoreColor(score);
              const isFocused = focusedIndex === i;

              return (
                <div
                  key={cat}
                  className={`flex-1 bg-gray-900 rounded-2xl p-5 border transition-all duration-200 ${
                    isFocused
                      ? 'ring-4 ring-emerald-500 shadow-glow-primary-lg scale-[1.02] border-emerald-500/50'
                      : 'border-gray-800'
                  }`}
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
