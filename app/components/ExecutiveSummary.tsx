'use client';

import { useMemo } from 'react';
import type { ExecutiveSummary as ExecutiveSummaryType } from '@/types/scan';
import { TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';

interface ExecutiveSummaryProps {
  body: string;
  score: number;
  className?: string;
}

function parseExecutiveSummary(body: string): ExecutiveSummaryType | null {
  try {
    const parsed = JSON.parse(body);
    if (parsed.keyStrength && parsed.biggestRisk && parsed.topPriority) {
      return parsed as ExecutiveSummaryType;
    }
    return null;
  } catch {
    return null;
  }
}

export function ExecutiveSummary({ body, score, className }: ExecutiveSummaryProps) {
  const summary = useMemo(() => parseExecutiveSummary(body), [body]);

  // Fallback: render plain text for existing scans without JSON structure
  if (!summary) {
    return (
      <div
        className={`animate-fade-up bg-gray-900 border border-gray-800 rounded-xl p-5 ${className || ''}`}
      >
        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{body}</p>
      </div>
    );
  }

  const items = [
    {
      key: 'strength',
      label: 'What\'s working',
      content: summary.keyStrength,
      icon: TrendingUp,
      accent: 'text-emerald-400',
      dot: 'bg-emerald-400',
    },
    {
      key: 'risk',
      label: 'Needs attention',
      content: summary.biggestRisk,
      icon: AlertCircle,
      accent: 'text-red-400',
      dot: 'bg-red-400',
    },
    {
      key: 'priority',
      label: 'Fix first',
      content: summary.topPriority,
      icon: ArrowUpRight,
      accent: 'text-amber-400',
      dot: 'bg-amber-400',
    },
  ];

  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl overflow-hidden ${className || ''}`}>
      <div className="divide-y divide-gray-800">
        {items.map((item, i) => (
          <div
            key={item.key}
            className="animate-fade-up px-5 py-4 flex items-start gap-4"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`mt-0.5 w-2 h-2 rounded-full ${item.dot} shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-medium uppercase tracking-wider ${item.accent} mb-1`}>
                {item.label}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
