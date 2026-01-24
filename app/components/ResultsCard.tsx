'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreRing } from './ScoreRing';
import { getScoreColor, getScoreBgColor, getCategoryIcon, getCategoryDisplayName, type CategoryScores } from '@/lib/scoring';
import type {
  SecurityFinding,
  PerformanceMetric,
  SeoFinding,
  AccessibilityViolation,
  CodeQualityIssue,
} from '@/types/scan';

interface ResultsCardProps {
  category: keyof CategoryScores;
  score: number;
  findings?: SecurityFinding[];
  metrics?: PerformanceMetric[];
  seoFindings?: SeoFinding[];
  violations?: AccessibilityViolation[];
  issues?: CodeQualityIssue[];
  className?: string;
}

export function ResultsCard({
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
  const colorClass = getScoreColor(score);
  const bgClass = getScoreBgColor(score);

  const hasDetails = findings || metrics || seoFindings || violations || issues;

  return (
    <div className={clsx('card overflow-hidden', className)}>
      {/* Header */}
      <button
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
        className={clsx(
          'w-full p-4 flex items-center justify-between',
          hasDetails && 'cursor-pointer hover:bg-void-100/50 transition-colors',
          !hasDetails && 'cursor-default'
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="text-left">
            <h3 className="font-bold text-gray-100">{displayName}</h3>
            <p className="text-xs text-gray-500">
              {category === 'security' && findings && (
                <>{findings.filter(f => !f.passed).length} issues found</>
              )}
              {category === 'performance' && metrics && (
                <>{metrics.length} metrics analyzed</>
              )}
              {category === 'seo' && seoFindings && (
                <>{seoFindings.filter(f => !f.passed).length} items to fix</>
              )}
              {category === 'accessibility' && violations && (
                <>{violations.length} violations</>
              )}
              {category === 'codeQuality' && issues && (
                <>{issues.length} issues detected</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ScoreRing score={score} size="sm" />
          {hasDetails && (
            <svg
              className={clsx(
                'w-5 h-5 text-gray-500 transition-transform',
                isExpanded && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-void-100">
              {/* Security findings */}
              {findings && (
                <ul className="space-y-2">
                  {findings.map((finding) => (
                    <li
                      key={finding.id}
                      className={clsx(
                        'p-3 rounded border text-sm',
                        finding.passed
                          ? 'bg-terminal/5 border-terminal/20'
                          : 'bg-danger/5 border-danger/20'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={clsx(
                            'inline-block px-1.5 py-0.5 rounded text-xs font-mono uppercase mr-2',
                            finding.passed ? 'bg-terminal/20 text-terminal' : 'bg-danger/20 text-danger'
                          )}>
                            {finding.passed ? 'PASS' : finding.severity}
                          </span>
                          <span className="font-medium text-gray-200">{finding.title}</span>
                        </div>
                      </div>
                      {!finding.passed && (
                        <p className="mt-2 text-xs text-gray-400">{finding.recommendation}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {/* Performance metrics */}
              {metrics && (
                <ul className="space-y-2">
                  {metrics.map((metric) => (
                    <li key={metric.id} className="p-3 rounded bg-void-100/50 text-sm">
                      <div className="flex items-center justify-between">
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
                        'p-3 rounded border text-sm',
                        finding.passed
                          ? 'bg-terminal/5 border-terminal/20'
                          : 'bg-neon-yellow/5 border-neon-yellow/20'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={finding.passed ? 'text-terminal' : 'text-neon-yellow'}>
                          {finding.passed ? '✓' : '!'}
                        </span>
                        <span className="font-medium text-gray-200">{finding.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">{finding.description}</p>
                      {finding.value && (
                        <code className="mt-2 block text-xs text-gray-500 bg-void-200 p-2 rounded truncate">
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
                    <li key={violation.id} className="p-3 rounded bg-void-100/50 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={clsx(
                            'inline-block px-1.5 py-0.5 rounded text-xs font-mono uppercase mr-2',
                            violation.impact === 'critical' && 'bg-danger/20 text-danger',
                            violation.impact === 'serious' && 'bg-neon-orange/20 text-neon-orange',
                            violation.impact === 'moderate' && 'bg-neon-yellow/20 text-neon-yellow',
                            violation.impact === 'minor' && 'bg-gray-500/20 text-gray-400'
                          )}>
                            {violation.impact}
                          </span>
                          <span className="text-gray-300">{violation.description}</span>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {violation.nodes} element{violation.nodes !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-400">{violation.help}</p>
                    </li>
                  ))}
                </ul>
              )}

              {/* Code quality issues */}
              {issues && (
                <ul className="space-y-2">
                  {issues.map((issue) => (
                    <li key={issue.id} className="p-3 rounded bg-void-100/50 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={clsx(
                            'inline-block px-1.5 py-0.5 rounded text-xs font-mono mr-2',
                            issue.type === 'console_error' && 'bg-danger/20 text-danger',
                            issue.type === 'broken_link' && 'bg-neon-yellow/20 text-neon-yellow',
                            issue.type === 'deprecated_api' && 'bg-neon-orange/20 text-neon-orange',
                            issue.type === 'mixed_content' && 'bg-neon-purple/20 text-neon-purple'
                          )}>
                            {issue.type.replace('_', ' ')}
                          </span>
                        </div>
                        {issue.count > 1 && (
                          <span className="text-xs text-gray-500">x{issue.count}</span>
                        )}
                      </div>
                      <p className="mt-1 text-gray-300 break-all">{issue.message}</p>
                      {issue.source && (
                        <code className="mt-1 block text-xs text-gray-500 truncate">{issue.source}</code>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
