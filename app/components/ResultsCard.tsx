'use client';

import { useState, memo } from 'react';
import clsx from 'clsx';
import { getScoreColor, getScoreBgColor, getCategoryDisplayName, type CategoryScores } from '@/lib/scoring';
import { Zap, Shield, Search, Accessibility, Code, type LucideIcon } from 'lucide-react';
import type {
  SecurityFinding,
  PerformanceMetric,
  SEOFinding,
  AccessibilityViolation,
  CodeQualityIssue,
} from '@/types/scan';

const CATEGORY_ICONS: Record<keyof CategoryScores, LucideIcon> = {
  performance: Zap,
  security: Shield,
  seo: Search,
  accessibility: Accessibility,
  codeQuality: Code,
};

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
  const color = score >= 90 ? 'text-success bg-success/10 ring-success/20'
    : score >= 70 ? 'text-warning bg-warning/10 ring-warning/20'
    : score >= 50 ? 'text-warning-dark bg-warning/10 ring-warning-dark/20'
    : 'text-danger bg-danger/10 ring-danger/20';

  return (
    <span className={clsx('px-2.5 py-1 rounded-lg text-sm font-semibold ring-1', color)}>
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

  const CategoryIcon = CATEGORY_ICONS[category];
  const displayName = getCategoryDisplayName(category);

  const hasDetails = findings || metrics || seoFindings || violations || issues;

  const itemCount = findings?.length ||
    metrics?.length ||
    seoFindings?.length ||
    violations?.length ||
    issues?.length || 0;

  return (
    <div className={clsx(
      'bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200',
      hasDetails && 'hover:shadow-card',
      className
    )}>
      {/* Header */}
      <button
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
        className={clsx(
          'w-full px-4 py-3 flex items-center justify-between',
          hasDetails && 'hover:bg-gray-50/50 transition-colors cursor-pointer',
          !hasDetails && 'cursor-default'
        )}
      >
        <div className="flex items-center gap-3">
          {/* Neumorphic icon container */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-inner-subtle">
            <CategoryIcon size={18} className="text-gray-600" />
          </div>
          <div className="text-left">
            <span className="font-medium text-gray-800">{displayName}</span>
            {itemCount > 0 && (
              <span className="text-gray-400 text-sm ml-2">({itemCount})</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ScoreBadge score={score} />
          {hasDetails && (
            <span className={clsx(
              'text-gray-400 transition-transform duration-200 text-xs',
              isExpanded && 'rotate-180'
            )}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          )}
        </div>
      </button>

      {/* Expanded content with smooth animation */}
      <div
        className={clsx(
          'grid transition-all duration-300 ease-premium',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          {hasDetails && (
            <div className="px-4 py-3 border-t border-gray-100 text-sm">
              {/* Security findings */}
              {findings && (
                <div className="space-y-2">
                  {findings.map((finding) => (
                    <div
                      key={finding.id}
                      className={clsx(
                        'p-3 rounded-xl border-l-4 transition-all duration-200 hover:-translate-y-0.5',
                        finding.passed
                          ? 'border-success bg-success/5 hover:bg-success/10'
                          : 'border-danger bg-danger/5 hover:bg-danger/10'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className={clsx(
                          'px-2 py-0.5 rounded-md text-xs font-medium shrink-0',
                          finding.passed ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                        )}>
                          {finding.passed ? 'PASS' : finding.severity?.toUpperCase() || 'FAIL'}
                        </span>
                        <span className="text-gray-700">{finding.title}</span>
                      </div>
                      {!finding.passed && finding.recommendation && (
                        <p className="mt-2 text-xs text-gray-500">{finding.recommendation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Performance metrics */}
              {metrics && (
                <div className="space-y-2">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="p-3 rounded-xl bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors">
                      <span className="text-gray-600">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={clsx('font-mono', getScoreColor(metric.score))}>
                          {metric.displayValue}
                        </span>
                        <span className={clsx(
                          'text-xs px-2 py-0.5 rounded-md',
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
                        'p-3 rounded-xl border-l-4 transition-all duration-200 hover:-translate-y-0.5',
                        finding.passed
                          ? 'border-success bg-success/5 hover:bg-success/10'
                          : 'border-warning bg-warning/5 hover:bg-warning/10'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className={finding.passed ? 'text-success' : 'text-warning'}>
                          {finding.passed ? '✓' : '!'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-700">{finding.title}</span>
                          <p className="text-xs text-gray-500 mt-1">{finding.description}</p>
                          {finding.value && (
                            <code className="mt-2 block text-xs text-gray-500 bg-gray-100 p-2 rounded-lg break-all">
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
                      'p-3 rounded-xl border-l-4 transition-all duration-200 hover:-translate-y-0.5',
                      violation.impact === 'critical' ? 'border-danger bg-danger/5 hover:bg-danger/10' :
                      violation.impact === 'serious' ? 'border-warning-dark bg-warning/5 hover:bg-warning/10' :
                      violation.impact === 'moderate' ? 'border-warning bg-warning/5 hover:bg-warning/10' :
                      'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    )}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={clsx(
                              'px-2 py-0.5 rounded-md text-xs font-medium uppercase',
                              violation.impact === 'critical' && 'bg-danger/10 text-danger',
                              violation.impact === 'serious' && 'bg-warning/10 text-warning-dark',
                              violation.impact === 'moderate' && 'bg-warning/10 text-warning',
                              violation.impact === 'minor' && 'bg-gray-100 text-gray-500'
                            )}>
                              {violation.impact}
                            </span>
                            <span className="text-xs text-gray-400">
                              {violation.nodes} element{violation.nodes !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-gray-700">{violation.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{violation.help}</p>
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
                      'p-3 rounded-xl border-l-4 transition-all duration-200 hover:-translate-y-0.5',
                      issue.type === 'console_error' ? 'border-danger bg-danger/5 hover:bg-danger/10' :
                      issue.type === 'broken_link' ? 'border-warning bg-warning/5 hover:bg-warning/10' :
                      issue.type === 'deprecated_api' ? 'border-warning-dark bg-warning/5 hover:bg-warning/10' :
                      'border-primary bg-primary/5 hover:bg-primary/10'
                    )}>
                      <div className="flex items-start justify-between gap-2">
                        <span className={clsx(
                          'px-2 py-0.5 rounded-md text-xs font-medium shrink-0',
                          issue.type === 'console_error' && 'bg-danger/10 text-danger',
                          issue.type === 'broken_link' && 'bg-warning/10 text-warning',
                          issue.type === 'deprecated_api' && 'bg-warning/10 text-warning-dark',
                          issue.type === 'mixed_content' && 'bg-primary/10 text-primary'
                        )}>
                          {issue.type.replace('_', ' ')}
                        </span>
                        {issue.count > 1 && (
                          <span className="text-xs text-gray-400">×{issue.count}</span>
                        )}
                      </div>
                      <p className="text-gray-700 mt-2 break-words">{issue.message}</p>
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
      </div>
    </div>
  );
});
