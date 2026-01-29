'use client';

import { useState, memo } from 'react';
import clsx from 'clsx';
import { getScoreColor, getScoreBgColor, getCategoryIcon, getCategoryDisplayName, type CategoryScores } from '@/lib/scoring';
import type {
  SecurityFinding,
  PerformanceMetric,
  SEOFinding,
  AccessibilityViolation,
  CodeQualityIssue,
} from '@/types/scan';

interface ResultsCardProps {
  category: keyof CategoryScores;
  score: number;
  findings?: SecurityFinding[];
  metrics?: PerformanceMetric[];
  seoFindings?: SEOFinding[];
  violations?: AccessibilityViolation[];
  issues?: CodeQualityIssue[];
  className?: string;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'text-terminal bg-terminal/20'
    : score >= 70 ? 'text-neon-yellow bg-neon-yellow/20'
    : score >= 50 ? 'text-neon-orange bg-neon-orange/20'
    : 'text-danger bg-danger/20';

  return (
    <span className={clsx('px-2.5 py-1 rounded text-sm font-bold', color)}>
      {score}/100
    </span>
  );
}

export const ResultsCard = memo(function ResultsCard({
  category,
  score,
  findings,
  metrics,
  seoFindings,
  violations,
  issues,
  className,
}: ResultsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const icon = getCategoryIcon(category);
  const displayName = getCategoryDisplayName(category);

  const hasDetails = findings || metrics || seoFindings || violations || issues;

  // Count items
  const itemCount = findings?.length ||
    metrics?.length ||
    seoFindings?.length ||
    violations?.length ||
    issues?.length || 0;

  return (
    <div className={clsx('bg-void-50 border border-void-100 rounded-lg overflow-hidden', className)}>
      {/* Header - matches ExtendedAudits Section style */}
      <button
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
        className={clsx(
          'w-full px-4 py-3 flex items-center justify-between',
          hasDetails && 'hover:bg-void-100/50 transition-colors cursor-pointer',
          !hasDetails && 'cursor-default'
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <div className="text-left">
            <span className="font-medium text-gray-200">{displayName}</span>
            {itemCount > 0 && (
              <span className="text-gray-500 text-sm ml-2">({itemCount})</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ScoreBadge score={score} />
          {hasDetails && (
            <span className={clsx('text-gray-500 transition-transform', isExpanded && 'rotate-180')}>
              ▼
            </span>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && hasDetails && (
        <div className="px-4 py-3 border-t border-void-100 text-sm">
          {/* Security findings */}
          {findings && (
            <div className="space-y-2">
              {findings.map((finding) => (
                <div
                  key={finding.id}
                  className={clsx(
                    'p-3 rounded border-l-2',
                    finding.passed
                      ? 'border-terminal bg-terminal/10'
                      : 'border-danger bg-danger/10'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className={clsx(
                      'px-1.5 py-0.5 rounded text-xs font-medium shrink-0',
                      finding.passed ? 'bg-terminal/20 text-terminal' : 'bg-danger/20 text-danger'
                    )}>
                      {finding.passed ? 'PASS' : finding.severity?.toUpperCase() || 'FAIL'}
                    </span>
                    <span className="text-gray-200">{finding.title}</span>
                  </div>
                  {!finding.passed && finding.recommendation && (
                    <p className="mt-2 text-xs text-gray-400">{finding.recommendation}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Performance metrics */}
          {metrics && (
            <div className="space-y-2">
              {metrics.map((metric) => (
                <div key={metric.id} className="p-3 rounded bg-void-100/50 flex items-center justify-between">
                  <span className="text-gray-300">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={clsx('font-mono', getScoreColor(metric.score))}>
                      {metric.displayValue}
                    </span>
                    <span className={clsx(
                      'text-xs px-1.5 py-0.5 rounded',
                      getScoreBgColor(metric.score)
                    )}>
                      {metric.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SEO findings */}
          {seoFindings && (
            <div className="space-y-2">
              {seoFindings.map((finding) => (
                <div
                  key={finding.id}
                  className={clsx(
                    'p-3 rounded border-l-2',
                    finding.passed
                      ? 'border-terminal bg-terminal/10'
                      : 'border-neon-yellow bg-neon-yellow/10'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className={finding.passed ? 'text-terminal' : 'text-neon-yellow'}>
                      {finding.passed ? '✓' : '!'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-200">{finding.title}</span>
                      <p className="text-xs text-gray-400 mt-1">{finding.description}</p>
                      {finding.value && (
                        <code className="mt-2 block text-xs text-gray-500 bg-void-200 p-2 rounded break-all">
                          {finding.value}
                        </code>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Accessibility violations */}
          {violations && (
            <div className="space-y-2">
              {violations.map((violation) => (
                <div key={violation.id} className={clsx(
                  'p-3 rounded border-l-2',
                  violation.impact === 'critical' ? 'border-danger bg-danger/10' :
                  violation.impact === 'serious' ? 'border-neon-orange bg-neon-orange/10' :
                  violation.impact === 'moderate' ? 'border-neon-yellow bg-neon-yellow/10' :
                  'border-gray-500 bg-gray-500/10'
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={clsx(
                          'px-1.5 py-0.5 rounded text-xs font-medium uppercase',
                          violation.impact === 'critical' && 'bg-danger/20 text-danger',
                          violation.impact === 'serious' && 'bg-neon-orange/20 text-neon-orange',
                          violation.impact === 'moderate' && 'bg-neon-yellow/20 text-neon-yellow',
                          violation.impact === 'minor' && 'bg-gray-500/20 text-gray-400'
                        )}>
                          {violation.impact}
                        </span>
                        <span className="text-xs text-gray-500">
                          {violation.nodes} element{violation.nodes !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-gray-300">{violation.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{violation.help}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Code quality issues */}
          {issues && (
            <div className="space-y-2">
              {issues.map((issue) => (
                <div key={issue.id} className={clsx(
                  'p-3 rounded border-l-2',
                  issue.type === 'console_error' ? 'border-danger bg-danger/10' :
                  issue.type === 'broken_link' ? 'border-neon-yellow bg-neon-yellow/10' :
                  issue.type === 'deprecated_api' ? 'border-neon-orange bg-neon-orange/10' :
                  'border-neon-purple bg-neon-purple/10'
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <span className={clsx(
                      'px-1.5 py-0.5 rounded text-xs font-medium shrink-0',
                      issue.type === 'console_error' && 'bg-danger/20 text-danger',
                      issue.type === 'broken_link' && 'bg-neon-yellow/20 text-neon-yellow',
                      issue.type === 'deprecated_api' && 'bg-neon-orange/20 text-neon-orange',
                      issue.type === 'mixed_content' && 'bg-neon-purple/20 text-neon-purple'
                    )}>
                      {issue.type.replace('_', ' ')}
                    </span>
                    {issue.count > 1 && (
                      <span className="text-xs text-gray-500">×{issue.count}</span>
                    )}
                  </div>
                  <p className="text-gray-300 mt-2 break-words">{issue.message}</p>
                  {issue.source && (
                    <code className="mt-1 block text-xs text-gray-500 break-all">{issue.source}</code>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
