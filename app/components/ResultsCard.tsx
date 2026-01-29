'use client';

import { useState, useRef, useEffect, memo } from 'react';
import clsx from 'clsx';
import { ScoreRing } from './ScoreRing';
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
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const icon = getCategoryIcon(category);
  const displayName = getCategoryDisplayName(category);
  const colorClass = getScoreColor(score);

  const hasDetails = findings || metrics || seoFindings || violations || issues;

  // Measure content height for smooth animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [findings, metrics, seoFindings, violations, issues]);

  // Count items for display
  const itemCount = findings?.filter(f => !f.passed).length ||
    metrics?.length ||
    seoFindings?.filter(f => !f.passed).length ||
    violations?.length ||
    issues?.length || 0;

  return (
    <div className={clsx('card overflow-hidden max-w-full', className)}>
      {/* Header */}
      <button
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
        className={clsx(
          'w-full p-3 sm:p-4 flex items-center gap-3',
          hasDetails && 'cursor-pointer hover:bg-void-100/50 active:bg-void-100/70 transition-colors',
          !hasDetails && 'cursor-default'
        )}
      >
        {/* Left side: Icon + Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <span className="text-xl sm:text-2xl shrink-0">{icon}</span>
          <div className="text-left min-w-0 flex-1">
            <h3 className="font-bold text-gray-100 text-sm sm:text-base">{displayName}</h3>
            <p className="text-[11px] sm:text-xs text-gray-500">
              {itemCount > 0 ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'}` : 'No issues'}
              {hasDetails && <span className="text-gray-600 ml-1">• Tap to {isExpanded ? 'hide' : 'view'}</span>}
            </p>
          </div>
        </div>

        {/* Right side: Score + Expand indicator */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Score badge */}
          <div className={clsx(
            'flex items-center justify-center rounded-lg font-bold',
            'w-11 h-11 sm:w-14 sm:h-14 text-base sm:text-xl',
            'bg-void-100 border border-void-200',
            colorClass
          )}>
            {score}
          </div>

          {/* Expand/collapse chevron - more prominent */}
          {hasDetails && (
            <div className={clsx(
              'flex items-center justify-center w-8 h-8 rounded-lg',
              'bg-void-100/50 border border-void-200/50',
              isExpanded ? 'bg-terminal/10 border-terminal/30' : ''
            )}>
              <svg
                className={clsx(
                  'w-5 h-5 transition-transform duration-200',
                  isExpanded ? 'rotate-180 text-terminal' : 'text-gray-400'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>
      </button>

      {/* Expanded details - CSS-based animation for performance */}
      {hasDetails && (
        <div
          className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
          style={{
            maxHeight: isExpanded ? contentHeight + 32 : 0,
            opacity: isExpanded ? 1 : 0,
          }}
        >
          <div ref={contentRef} className="px-3 sm:px-4 pb-4 pt-2 border-t border-void-100 overflow-x-hidden">
            {/* Security findings */}
            {findings && (
              <ul className="space-y-2">
                {findings.map((finding) => (
                  <li
                    key={finding.id}
                    className={clsx(
                      'p-2 sm:p-3 rounded border text-xs sm:text-sm overflow-hidden',
                      finding.passed
                        ? 'bg-terminal/5 border-terminal/20'
                        : 'bg-danger/5 border-danger/20'
                    )}
                  >
                    <div className="flex flex-wrap items-start gap-1 sm:gap-2">
                      <span className={clsx(
                        'inline-block px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-mono uppercase shrink-0',
                        finding.passed ? 'bg-terminal/20 text-terminal' : 'bg-danger/20 text-danger'
                      )}>
                        {finding.passed ? 'PASS' : finding.severity}
                      </span>
                      <span className="font-medium text-gray-200 break-words">{finding.title}</span>
                    </div>
                    {!finding.passed && finding.recommendation && (
                      <p className="mt-2 text-[10px] sm:text-xs text-gray-400 break-words">{finding.recommendation}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Performance metrics */}
            {metrics && (
              <ul className="space-y-2">
                {metrics.map((metric) => (
                  <li key={metric.id} className="p-2 sm:p-3 rounded bg-void-100/50 text-xs sm:text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-300 truncate min-w-0">{metric.name}</span>
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <span className={clsx('font-mono text-xs sm:text-sm', getScoreColor(metric.score))}>
                          {metric.displayValue}
                        </span>
                        <span className={clsx(
                          'text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded',
                          getScoreBgColor(metric.score)
                        )}>
                          {metric.score}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* SEO findings */}
            {seoFindings && (
              <ul className="space-y-2">
                {seoFindings.map((finding) => (
                  <li
                    key={finding.id}
                    className={clsx(
                      'p-2 sm:p-3 rounded border text-xs sm:text-sm overflow-hidden',
                      finding.passed
                        ? 'bg-terminal/5 border-terminal/20'
                        : 'bg-neon-yellow/5 border-neon-yellow/20'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span className={clsx('shrink-0', finding.passed ? 'text-terminal' : 'text-neon-yellow')}>
                        {finding.passed ? '✓' : '!'}
                      </span>
                      <span className="font-medium text-gray-200 break-words">{finding.title}</span>
                    </div>
                    <p className="mt-1 text-[10px] sm:text-xs text-gray-400 break-words">{finding.description}</p>
                    {finding.value && (
                      <code className="mt-2 block text-[10px] sm:text-xs text-gray-500 bg-void-200 p-1.5 sm:p-2 rounded overflow-x-auto whitespace-nowrap">
                        {finding.value}
                      </code>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Accessibility violations */}
            {violations && (
              <ul className="space-y-2">
                {violations.map((violation) => (
                  <li key={violation.id} className="p-2 sm:p-3 rounded bg-void-100/50 text-xs sm:text-sm overflow-hidden">
                    <div className="flex flex-wrap items-start gap-1 sm:gap-2">
                      <span className={clsx(
                        'inline-block px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-mono uppercase shrink-0',
                        violation.impact === 'critical' && 'bg-danger/20 text-danger',
                        violation.impact === 'serious' && 'bg-neon-orange/20 text-neon-orange',
                        violation.impact === 'moderate' && 'bg-neon-yellow/20 text-neon-yellow',
                        violation.impact === 'minor' && 'bg-gray-500/20 text-gray-400'
                      )}>
                        {violation.impact}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-500 shrink-0">
                        {violation.nodes} el.
                      </span>
                    </div>
                    <p className="mt-1 text-gray-300 break-words">{violation.description}</p>
                    <p className="mt-1 text-[10px] sm:text-xs text-gray-400 break-words">{violation.help}</p>
                  </li>
                ))}
              </ul>
            )}

            {/* Code quality issues */}
            {issues && (
              <ul className="space-y-2">
                {issues.map((issue) => (
                  <li key={issue.id} className="p-2 sm:p-3 rounded bg-void-100/50 text-xs sm:text-sm overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span className={clsx(
                        'inline-block px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-mono shrink-0',
                        issue.type === 'console_error' && 'bg-danger/20 text-danger',
                        issue.type === 'broken_link' && 'bg-neon-yellow/20 text-neon-yellow',
                        issue.type === 'deprecated_api' && 'bg-neon-orange/20 text-neon-orange',
                        issue.type === 'mixed_content' && 'bg-neon-purple/20 text-neon-purple'
                      )}>
                        {issue.type.replace('_', ' ')}
                      </span>
                      {issue.count > 1 && (
                        <span className="text-[10px] sm:text-xs text-gray-500 shrink-0">x{issue.count}</span>
                      )}
                    </div>
                    <p className="mt-1 text-gray-300 break-words text-xs sm:text-sm">{issue.message}</p>
                    {issue.source && (
                      <code className="mt-1 block text-[10px] sm:text-xs text-gray-500 overflow-x-auto whitespace-nowrap">{issue.source}</code>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
