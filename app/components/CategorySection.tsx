'use client';

import { useState, memo } from 'react';
import clsx from 'clsx';
import { getScoreColor, getScoreBgColor, getCategoryDisplayName, type CategoryScores } from '@/lib/scoring';
import {
  Zap, Shield, Search, Accessibility, Code,
  Globe, Image, Database, ArrowRight, AlertTriangle,
  Smartphone, FileText, Link as LinkIcon,
  ChevronDown, Check, X, ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import type {
  SecurityFinding,
  PerformanceMetric,
  SEOFinding,
  AccessibilityViolation,
  CodeQualityIssue,
  ProtocolInfo,
  Scan,
} from '@/types/scan';

const CATEGORY_ICONS: Record<keyof CategoryScores, LucideIcon> = {
  performance: Zap,
  security: Shield,
  seo: Search,
  accessibility: Accessibility,
  codeQuality: Code,
};

// Core Web Vitals metric IDs
const CWV_IDS = new Set(['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'interaction-to-next-paint']);

interface CategorySectionProps {
  category: keyof CategoryScores;
  score: number;
  findings?: SecurityFinding[];
  metrics?: PerformanceMetric[];
  seoFindings?: SEOFinding[];
  violations?: AccessibilityViolation[];
  issues?: CodeQualityIssue[];
  protocol?: ProtocolInfo;
  vulnerabilities?: Scan['resultsVulnerabilities'];
  images?: Scan['resultsImages'];
  caching?: Scan['resultsCaching'];
  redirects?: Scan['resultsRedirects'];
  structuredData?: Scan['resultsStructuredData'];
  links?: Scan['resultsLinks'];
  pwa?: Scan['resultsPwa'];
  className?: string;
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
      ok ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
    )}>
      {ok ? <Check size={12} /> : <X size={12} />}
      {label}
    </span>
  );
}

function SubSection({
  title,
  icon: Icon,
  score,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: LucideIcon;
  score?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-800/50 transition-colors text-sm"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-gray-500" />
          <span className="text-gray-300">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {score !== undefined && (
            <span className={clsx(
              'px-2 py-0.5 rounded text-xs font-medium',
              score >= 90 ? 'text-success bg-success/10' :
              score >= 70 ? 'text-warning bg-warning/10' :
              score >= 50 ? 'text-orange-500 bg-orange-500/10' :
              'text-danger bg-danger/10'
            )}>
              {score}
            </span>
          )}
          <ChevronDown
            size={14}
            className={clsx('text-gray-500 transition-transform', isOpen && 'rotate-180')}
          />
        </div>
      </button>
      {isOpen && (
        <div className="px-3 py-3 border-t border-gray-800 text-sm">
          {children}
        </div>
      )}
    </div>
  );
}

function SeverityChips({ findings, violations, issues }: {
  findings?: SecurityFinding[];
  violations?: AccessibilityViolation[];
  issues?: CodeQualityIssue[];
}) {
  const counts: Record<string, number> = {};

  if (findings) {
    const failed = findings.filter(f => !f.passed);
    failed.forEach(f => {
      const sev = f.severity || 'fail';
      counts[sev] = (counts[sev] || 0) + 1;
    });
  }

  if (violations) {
    violations.forEach(v => {
      counts[v.impact] = (counts[v.impact] || 0) + 1;
    });
  }

  const chips = Object.entries(counts).filter(([, count]) => count > 0);
  if (chips.length === 0) return null;

  const severityColors: Record<string, string> = {
    critical: 'text-danger bg-danger/10',
    high: 'text-red-400 bg-red-400/10',
    serious: 'text-orange-400 bg-orange-400/10',
    medium: 'text-warning bg-warning/10',
    moderate: 'text-warning bg-warning/10',
    low: 'text-gray-400 bg-gray-700',
    minor: 'text-gray-400 bg-gray-700',
    info: 'text-gray-400 bg-gray-700',
    fail: 'text-danger bg-danger/10',
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {chips.map(([sev, count]) => (
        <span key={sev} className={clsx('px-2 py-0.5 rounded text-[10px] font-medium', severityColors[sev] || 'text-gray-400 bg-gray-700')}>
          {count} {sev}
        </span>
      ))}
    </div>
  );
}

/** Category summary stats bar */
function CategorySummary({ category, score, findings, metrics, seoFindings, violations, issues }: {
  category: keyof CategoryScores;
  score: number;
  findings?: SecurityFinding[];
  metrics?: PerformanceMetric[];
  seoFindings?: SEOFinding[];
  violations?: AccessibilityViolation[];
  issues?: CodeQualityIssue[];
}) {
  switch (category) {
    case 'security': {
      if (!findings) return null;
      const passed = findings.filter(f => f.passed).length;
      const failed = findings.filter(f => !f.passed).length;
      const critical = findings.filter(f => !f.passed && (f.severity === 'critical' || f.severity === 'high')).length;
      const total = passed + failed;
      const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
      return (
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-3 px-1">
          <span><strong className="text-gray-200">{passed}</strong> passed</span>
          <span><strong className="text-gray-200">{failed}</strong> failed</span>
          {critical > 0 && <span className="text-danger"><strong>{critical}</strong> critical</span>}
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden min-w-[60px]">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${passRate}%` }} />
          </div>
        </div>
      );
    }
    case 'performance': {
      if (!metrics) return null;
      const cwvMetrics = metrics.filter(m => CWV_IDS.has(m.id));
      if (cwvMetrics.length === 0) return null;
      const allGood = cwvMetrics.every(m => m.score >= 90);
      return (
        <div className="mb-3 px-1">
          <div className="flex flex-wrap items-center gap-2">
            {cwvMetrics.map(m => (
              <span key={m.id} className={clsx(
                'px-2 py-1 rounded-lg text-xs font-medium',
                m.score >= 90 ? 'text-success bg-success/10' :
                m.score >= 50 ? 'text-warning bg-warning/10' :
                'text-danger bg-danger/10'
              )}>
                {m.name}: <strong>{m.displayValue}</strong>
              </span>
            ))}
            <span className={clsx(
              'ml-auto px-2 py-0.5 rounded text-[10px] font-semibold uppercase',
              allGood ? 'text-success bg-success/10' : 'text-warning bg-warning/10'
            )}>
              CWV {allGood ? 'Passing' : 'Needs Work'}
            </span>
          </div>
        </div>
      );
    }
    case 'accessibility': {
      if (!violations || violations.length === 0) return null;
      const totalNodes = violations.reduce((sum, v) => sum + v.nodes, 0);
      const critical = violations.filter(v => v.impact === 'critical').length;
      const serious = violations.filter(v => v.impact === 'serious').length;
      return (
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-3 px-1">
          <span><strong className="text-gray-200">{violations.length}</strong> violation{violations.length !== 1 ? 's' : ''}</span>
          <span>affecting <strong className="text-gray-200">{totalNodes}</strong> element{totalNodes !== 1 ? 's' : ''}</span>
          {critical > 0 && <span className="text-danger"><strong>{critical}</strong> critical</span>}
          {serious > 0 && <span className="text-orange-400"><strong>{serious}</strong> serious</span>}
        </div>
      );
    }
    case 'seo': {
      if (!seoFindings) return null;
      const passed = seoFindings.filter(f => f.passed).length;
      const total = seoFindings.length;
      const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
      return (
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-3 px-1">
          <span><strong className="text-gray-200">{passed}/{total}</strong> checks passing</span>
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden min-w-[60px]">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${passRate}%` }} />
          </div>
        </div>
      );
    }
    case 'codeQuality': {
      if (!issues || issues.length === 0) return null;
      const typeCounts: Record<string, number> = {};
      for (const issue of issues) {
        typeCounts[issue.type] = (typeCounts[issue.type] || 0) + 1;
      }
      return (
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-3 px-1">
          <span><strong className="text-gray-200">{issues.length}</strong> issue{issues.length !== 1 ? 's' : ''}</span>
          {Object.entries(typeCounts).map(([type, count]) => (
            <span key={type} className="capitalize">{count} {type.replace('_', ' ')}</span>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
}

export const CategorySection = memo(function CategorySection({
  category,
  score,
  findings,
  metrics,
  seoFindings,
  violations,
  issues,
  protocol,
  vulnerabilities,
  images,
  caching,
  redirects,
  structuredData,
  links,
  pwa,
  className,
}: CategorySectionProps) {
  const autoExpand = score < 70;
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());

  const CategoryIcon = CATEGORY_ICONS[category];
  const displayName = getCategoryDisplayName(category);

  const hasCore = findings || metrics || seoFindings || violations || issues;
  const hasExtended = protocol || vulnerabilities || images || caching || redirects || structuredData || links || pwa;
  const hasContent = hasCore || hasExtended;

  const failedCount = (() => {
    if (findings) return findings.filter(f => !f.passed).length;
    if (seoFindings) return seoFindings.filter(f => !f.passed).length;
    if (violations) return violations.length;
    if (issues) return issues.length;
    return 0;
  })();

  const passedCount = (() => {
    if (findings) return findings.filter(f => f.passed).length;
    if (seoFindings) return seoFindings.filter(f => f.passed).length;
    return 0;
  })();

  const toggleFinding = (id: string) => {
    setExpandedFindings(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      className={clsx(
        'bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-200',
        hasContent && 'hover:shadow-card',
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => hasContent && setIsExpanded(!isExpanded)}
        className={clsx(
          'w-full px-4 py-3.5 flex items-center justify-between',
          hasContent && 'hover:bg-gray-800/50 transition-colors cursor-pointer',
          !hasContent && 'cursor-default'
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
            <CategoryIcon size={18} className="text-gray-400" />
          </div>
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <span className="font-medium text-gray-200">{displayName}</span>
            {failedCount > 0 && (
              <span className="text-xs text-gray-500">
                {failedCount} failed{passedCount > 0 ? `, ${passedCount} passed` : ''}
              </span>
            )}
            <SeverityChips findings={findings} violations={violations} issues={issues} />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Score bar */}
          <div className="hidden sm:flex items-center gap-2 w-32">
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-500',
                  score >= 90 ? 'bg-emerald-500' :
                  score >= 70 ? 'bg-yellow-500' :
                  score >= 50 ? 'bg-orange-500' :
                  'bg-red-500'
                )}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className={clsx('text-sm font-semibold tabular-nums w-8 text-right', getScoreColor(score))}>
              {score}
            </span>
          </div>
          {/* Mobile score */}
          <span className={clsx(
            'sm:hidden px-2.5 py-1 rounded-lg text-sm font-semibold ring-1',
            score >= 90 ? 'text-success bg-success/10 ring-success/20' :
            score >= 70 ? 'text-warning bg-warning/10 ring-warning/20' :
            score >= 50 ? 'text-orange-500 bg-orange-500/10 ring-orange-500/20' :
            'text-danger bg-danger/10 ring-danger/20'
          )}>
            {score}
          </span>
          {hasContent && (
            <ChevronDown
              size={16}
              className={clsx('text-gray-400 transition-transform duration-200', isExpanded && 'rotate-180')}
            />
          )}
        </div>
      </button>

      {/* Expanded content */}
      <div
        className={clsx(
          'grid transition-all duration-300 ease-premium',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          {hasContent && (
            <div className="px-4 py-4 border-t border-gray-800 space-y-4">
              {/* Category Summary Stats */}
              <CategorySummary
                category={category}
                score={score}
                findings={findings}
                metrics={metrics}
                seoFindings={seoFindings}
                violations={violations}
                issues={issues}
              />

              {/* Security findings - expandable */}
              {findings && (
                <div className="space-y-2">
                  {findings.filter(f => !f.passed).map((finding) => {
                    const isOpen = expandedFindings.has(finding.id);
                    return (
                      <div
                        key={finding.id}
                        className="rounded-xl border-l-4 border-danger bg-danger/5 hover:bg-danger/10 transition-all overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFinding(finding.id)}
                          className="w-full p-3 flex items-start gap-2 text-left"
                        >
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-danger/10 text-danger shrink-0">
                            {finding.severity?.toUpperCase() || 'FAIL'}
                          </span>
                          <span className="text-gray-300 text-sm flex-1">{finding.title}</span>
                          <ChevronDown size={14} className={clsx('text-gray-500 transition-transform shrink-0 mt-0.5', isOpen && 'rotate-180')} />
                        </button>
                        {isOpen && (
                          <div className="px-3 pb-3 space-y-2">
                            {finding.description && (
                              <p className="text-xs text-gray-400">{finding.description}</p>
                            )}
                            {finding.recommendation && (
                              <p className="text-xs text-emerald-400/80">Fix: {finding.recommendation}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {findings.filter(f => f.passed).length > 0 && (
                    <details className="group">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 py-1">
                        {findings.filter(f => f.passed).length} passed checks
                      </summary>
                      <div className="space-y-1.5 mt-2">
                        {findings.filter(f => f.passed).map((finding) => (
                          <div
                            key={finding.id}
                            className="p-2.5 rounded-lg border-l-4 border-success bg-success/5 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-success/10 text-success">PASS</span>
                              <span className="text-gray-300">{finding.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {/* Performance metrics - horizontal bar chart */}
              {metrics && (
                <div className="space-y-2">
                  {metrics.map((metric) => {
                    const barWidth = Math.min(100, Math.max(0, metric.score));
                    return (
                      <div key={metric.id} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-300 text-sm">{metric.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={clsx('font-mono text-sm', getScoreColor(metric.score))}>
                              {metric.displayValue}
                            </span>
                            <span className={clsx('text-xs px-2 py-0.5 rounded-md', getScoreBgColor(metric.score))}>
                              {metric.score}
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={clsx(
                              'h-full rounded-full transition-all duration-500',
                              metric.score >= 90 ? 'bg-emerald-500' :
                              metric.score >= 70 ? 'bg-yellow-500' :
                              metric.score >= 50 ? 'bg-orange-500' :
                              'bg-red-500'
                            )}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SEO findings - expandable */}
              {seoFindings && (
                <div className="space-y-2">
                  {seoFindings.filter(f => !f.passed).map((finding) => {
                    const isOpen = expandedFindings.has(finding.id);
                    return (
                      <div
                        key={finding.id}
                        className="rounded-xl border-l-4 border-warning bg-warning/5 hover:bg-warning/10 transition-all overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFinding(finding.id)}
                          className="w-full p-3 flex items-start gap-2 text-left"
                        >
                          <span className="text-warning shrink-0">!</span>
                          <span className="text-gray-300 text-sm flex-1">{finding.title}</span>
                          <ChevronDown size={14} className={clsx('text-gray-500 transition-transform shrink-0 mt-0.5', isOpen && 'rotate-180')} />
                        </button>
                        {isOpen && (
                          <div className="px-3 pb-3 space-y-2">
                            <p className="text-xs text-gray-400">{finding.description}</p>
                            {finding.value && (
                              <code className="block text-xs text-gray-500 bg-gray-950 border border-gray-800 p-2 rounded-lg break-all overflow-x-auto">
                                {finding.value}
                              </code>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {seoFindings.filter(f => f.passed).length > 0 && (
                    <details className="group">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 py-1">
                        {seoFindings.filter(f => f.passed).length} passed checks
                      </summary>
                      <div className="space-y-1.5 mt-2">
                        {seoFindings.filter(f => f.passed).map((finding) => (
                          <div key={finding.id} className="p-2.5 rounded-lg border-l-4 border-success bg-success/5 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-success">&#10003;</span>
                              <span className="text-gray-300">{finding.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {/* Accessibility violations - enhanced */}
              {violations && (
                <div className="space-y-2">
                  {violations.map((violation) => {
                    const isOpen = expandedFindings.has(violation.id);
                    return (
                      <div key={violation.id} className={clsx(
                        'rounded-xl border-l-4 transition-all overflow-hidden',
                        violation.impact === 'critical' ? 'border-danger bg-danger/5 hover:bg-danger/10' :
                        violation.impact === 'serious' ? 'border-orange-500 bg-orange-500/5 hover:bg-orange-500/10' :
                        violation.impact === 'moderate' ? 'border-warning bg-warning/5 hover:bg-warning/10' :
                        'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                      )}>
                        <button
                          onClick={() => toggleFinding(violation.id)}
                          className="w-full p-3 text-left"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={clsx(
                              'px-2 py-0.5 rounded-md text-xs font-medium uppercase',
                              violation.impact === 'critical' && 'bg-danger/10 text-danger',
                              violation.impact === 'serious' && 'bg-orange-500/10 text-orange-500',
                              violation.impact === 'moderate' && 'bg-warning/10 text-warning',
                              violation.impact === 'minor' && 'bg-gray-800 text-gray-500'
                            )}>
                              {violation.impact}
                            </span>
                            <span className="text-xs text-gray-400">
                              {violation.nodes} element{violation.nodes !== 1 ? 's' : ''}
                            </span>
                            <ChevronDown size={14} className={clsx('text-gray-500 transition-transform ml-auto shrink-0', isOpen && 'rotate-180')} />
                          </div>
                          <p className="text-gray-300 text-sm">{violation.description}</p>
                        </button>
                        {isOpen && (
                          <div className="px-3 pb-3 space-y-2">
                            <p className="text-xs text-gray-400">{violation.help}</p>

                            {/* Failure summary - fix hint */}
                            {violation.failureSummary && (
                              <div className="text-xs text-emerald-400/80 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2">
                                <strong className="text-emerald-400">Fix:</strong> {violation.failureSummary}
                              </div>
                            )}

                            {/* Selectors */}
                            {violation.selectors && violation.selectors.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] text-gray-500 uppercase font-medium">Affected elements</span>
                                <code className="block text-xs text-gray-500 bg-gray-950 border border-gray-800 p-2 rounded-lg break-all overflow-x-auto">
                                  {violation.selectors.slice(0, 5).join('\n')}
                                  {violation.selectors.length > 5 && `\n... and ${violation.selectors.length - 5} more`}
                                </code>
                              </div>
                            )}

                            {/* Learn more link */}
                            {violation.helpUrl && (
                              <a
                                href={violation.helpUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                              >
                                <ExternalLink size={10} />
                                Learn more
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Code quality issues */}
              {issues && (
                <div className="space-y-2">
                  {issues.map((issue) => (
                    <div key={issue.id} className={clsx(
                      'p-3 rounded-xl border-l-4 transition-all',
                      issue.type === 'console_error' ? 'border-danger bg-danger/5 hover:bg-danger/10' :
                      issue.type === 'broken_link' ? 'border-warning bg-warning/5 hover:bg-warning/10' :
                      issue.type === 'deprecated_api' ? 'border-orange-500 bg-orange-500/5 hover:bg-orange-500/10' :
                      'border-primary bg-primary/5 hover:bg-primary/10'
                    )}>
                      <div className="flex items-start justify-between gap-2">
                        <span className={clsx(
                          'px-2 py-0.5 rounded-md text-xs font-medium shrink-0',
                          issue.type === 'console_error' && 'bg-danger/10 text-danger',
                          issue.type === 'broken_link' && 'bg-warning/10 text-warning',
                          issue.type === 'deprecated_api' && 'bg-orange-500/10 text-orange-500',
                          issue.type === 'mixed_content' && 'bg-primary/10 text-primary'
                        )}>
                          {issue.type.replace('_', ' ')}
                        </span>
                        {issue.count > 1 && (
                          <span className="text-xs text-gray-400">&times;{issue.count}</span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mt-2 break-words">{issue.message}</p>
                      {issue.source && (
                        <code className="mt-1 block text-xs text-gray-500 break-all overflow-x-auto">{issue.source}</code>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ========== Extended subsections ========== */}

              {/* Protocol - Security */}
              {protocol && (
                <SubSection title="Protocol Analysis" icon={Globe} score={protocol.http2Supported ? (protocol.http3Supported ? 100 : 85) : 50}>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge ok={true} label={protocol.httpVersion} />
                      <StatusBadge ok={protocol.http2Supported} label="HTTP/2" />
                      <StatusBadge ok={protocol.http3Supported} label="HTTP/3 (QUIC)" />
                      {protocol.alpn && (
                        <span className="px-2.5 py-1 rounded-lg text-xs bg-gray-800 text-gray-400">
                          ALPN: {protocol.alpn}
                        </span>
                      )}
                    </div>
                    {protocol.recommendations.length > 0 && (
                      <div className="text-gray-400 text-xs">
                        <p className="font-medium text-gray-300 mb-1">Recommendations:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {protocol.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </SubSection>
              )}

              {/* Vulnerabilities - Security */}
              {vulnerabilities && vulnerabilities.vulnerableLibraries.length > 0 && (
                <SubSection title="Vulnerable Libraries" icon={AlertTriangle} score={vulnerabilities.score} defaultOpen>
                  <div className="space-y-3">
                    {vulnerabilities.vulnerableLibraries.map((lib, i) => (
                      <div key={i} className="bg-danger/5 border border-danger/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-danger text-sm">{lib.name}</span>
                          <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-md text-gray-400">v{lib.detectedVersion}</span>
                        </div>
                        <div className="space-y-2">
                          {lib.vulnerabilities.map((vuln, j) => (
                            <div key={j} className="text-xs">
                              <span className={clsx(
                                'px-2 py-0.5 rounded-md mr-2 font-medium',
                                vuln.severity === 'critical' ? 'bg-danger text-white' :
                                vuln.severity === 'high' ? 'bg-danger/20 text-danger' :
                                'bg-warning/20 text-warning'
                              )}>
                                {vuln.severity.toUpperCase()}
                              </span>
                              {vuln.cve && <span className="text-gray-500 mr-2">{vuln.cve}</span>}
                              <span className="text-gray-400">{vuln.description}</span>
                              <p className="mt-1 text-gray-500">Fix: Update to {vuln.fixedIn}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </SubSection>
              )}

              {/* Image Optimization - Performance */}
              {images && images.issues.length > 0 && (
                <SubSection title="Image Optimization" icon={Image} score={images.score}>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-4 text-gray-400 text-xs">
                      <span>Total: <strong className="text-gray-200">{images.totalImages}</strong></span>
                      <span>Size: <strong className="text-gray-200">{(images.totalSize / 1024).toFixed(1)}KB</strong></span>
                      <span>Savings: <strong className="text-success">{(images.optimizationPotential / 1024).toFixed(1)}KB</strong></span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {images.issues.map((issue, i) => (
                        <div key={i} className={clsx(
                          'p-2.5 rounded-lg border-l-2 text-xs',
                          issue.severity === 'high' ? 'border-danger bg-danger/5' :
                          issue.severity === 'medium' ? 'border-warning bg-warning/5' :
                          'border-gray-700 bg-gray-800/50'
                        )}>
                          <p className="text-gray-300 font-mono truncate">{issue.src.split('/').pop()}</p>
                          <p className="text-gray-500">{issue.issues.join(', ')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </SubSection>
              )}

              {/* Cache Headers - Performance */}
              {caching && caching.issues.length > 0 && (
                <SubSection title="Cache Headers" icon={Database} score={caching.score}>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-4 text-gray-400 text-xs">
                      <span>Cached: <strong className="text-gray-200">{caching.summary.cached}/{caching.summary.totalResources}</strong></span>
                      <span>Long Cache: <strong className="text-gray-200">{caching.summary.longCache}</strong></span>
                      <span>Immutable: <strong className="text-gray-200">{caching.summary.immutable}</strong></span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {caching.issues.slice(0, 5).map((issue, i) => (
                        <div key={i} className={clsx(
                          'p-2.5 rounded-lg border-l-2 text-xs',
                          issue.severity === 'high' ? 'border-danger bg-danger/5' :
                          issue.severity === 'medium' ? 'border-warning bg-warning/5' :
                          'border-gray-700 bg-gray-800/50'
                        )}>
                          <p className="text-gray-300">{issue.description}</p>
                          <p className="text-gray-500 mt-1">{issue.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </SubSection>
              )}

              {/* Redirects - Performance */}
              {redirects && redirects.totalRedirects > 0 && (
                <SubSection title="Redirect Chain" icon={ArrowRight} score={Math.max(0, 100 - redirects.totalRedirects * 10)}>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-4 text-gray-400 text-xs">
                      <span>Redirects: <strong className="text-warning">{redirects.totalRedirects}</strong></span>
                      <span>Total Time: <strong className="text-gray-200">{redirects.totalTime}ms</strong></span>
                    </div>
                    <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 font-mono text-xs space-y-2 overflow-x-auto">
                      {redirects.redirectChain.map((hop, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className={clsx(
                            'px-2 py-0.5 rounded-md font-medium',
                            hop.statusCode >= 300 && hop.statusCode < 400 ? 'bg-warning/20 text-warning' :
                            hop.statusCode >= 200 && hop.statusCode < 300 ? 'bg-success/20 text-success' :
                            'bg-danger/20 text-danger'
                          )}>
                            {hop.statusCode}
                          </span>
                          <span className="text-gray-400 truncate flex-1">{hop.url}</span>
                          <span className="text-gray-400">{hop.duration}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </SubSection>
              )}

              {/* Structured Data - SEO */}
              {structuredData && (
                <SubSection title="Structured Data" icon={FileText} score={structuredData.score}>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-4 text-gray-400 text-xs">
                      <span>JSON-LD: <strong className="text-gray-200">{structuredData.jsonLdCount}</strong></span>
                      <span>Microdata: <strong className="text-gray-200">{structuredData.microdataCount}</strong></span>
                    </div>
                    {structuredData.types.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {structuredData.types.map((type, i) => (
                          <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                            {type}
                          </span>
                        ))}
                      </div>
                    )}
                    {structuredData.errors.length > 0 && (
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {structuredData.errors.slice(0, 8).map((error, i) => (
                          <div key={i} className={clsx(
                            'text-xs p-2 rounded-lg',
                            error.severity === 'error' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                          )}>
                            <strong>{error.type}</strong>: {error.message}
                          </div>
                        ))}
                      </div>
                    )}
                    {structuredData.recommendations.length > 0 && (
                      <div className="text-gray-400 text-xs">
                        <ul className="list-disc list-inside space-y-1">
                          {structuredData.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </SubSection>
              )}

              {/* Link Audit - SEO */}
              {links && (
                <SubSection title="Link Audit" icon={LinkIcon} score={links.score}>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                      {[
                        { label: 'Total', value: links.totalLinks },
                        { label: 'Internal', value: links.internalLinks },
                        { label: 'External', value: links.externalLinks },
                        { label: 'Checked', value: links.checkedLinks },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-800 rounded-lg p-2.5">
                          <div className="text-lg font-bold text-gray-200">{value}</div>
                          <div className="text-[10px] text-gray-500">{label}</div>
                        </div>
                      ))}
                    </div>
                    {links.brokenLinks.length > 0 && (
                      <div>
                        <p className="font-medium text-danger text-xs mb-1.5">Broken ({links.brokenLinks.length}):</p>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {links.brokenLinks.map((link, i) => (
                            <div key={i} className="text-xs bg-danger/10 text-danger p-2 rounded-lg truncate">
                              <span className="font-mono font-medium">{link.statusCode || 'ERR'}</span> - {link.url}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {links.insecureLinks.length > 0 && (
                      <div>
                        <p className="font-medium text-warning text-xs mb-1.5">Insecure HTTP ({links.insecureLinks.length}):</p>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {links.insecureLinks.map((link, i) => (
                            <div key={i} className="text-xs bg-warning/10 text-warning p-2 rounded-lg truncate">
                              {link.url}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </SubSection>
              )}

              {/* PWA - Code Quality */}
              {pwa && (
                <SubSection title="PWA Analysis" icon={Smartphone} score={pwa.score}>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge ok={pwa.installable} label="Installable" />
                      <StatusBadge ok={pwa.checks.https} label="HTTPS" />
                      <StatusBadge ok={pwa.checks.manifest.exists && pwa.checks.manifest.valid} label="Manifest" />
                      <StatusBadge ok={pwa.checks.serviceWorker.registered} label="Service Worker" />
                      <StatusBadge ok={pwa.checks.icons.has192} label="192px" />
                      <StatusBadge ok={pwa.checks.icons.has512} label="512px" />
                      <StatusBadge ok={pwa.checks.themeColor} label="Theme" />
                    </div>
                    {pwa.issues.length > 0 && (
                      <div className="space-y-2">
                        {pwa.issues.map((issue, i) => (
                          <div key={i} className={clsx(
                            'p-2.5 rounded-lg border-l-2 text-xs',
                            issue.severity === 'high' ? 'border-danger bg-danger/5' :
                            issue.severity === 'medium' ? 'border-warning bg-warning/5' :
                            'border-gray-700 bg-gray-800/50'
                          )}>
                            <p className="text-gray-300">{issue.description}</p>
                            <p className="text-gray-500 mt-1">{issue.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </SubSection>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
