'use client';

import { getGrade } from '@/lib/scoring';
import type { Scan } from '@/types/scan';

// All inline styles for html2canvas compatibility
// 800px wide, white background, professional report layout

const COLORS = {
  brand: '#10B981',
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  cardBg: '#F9FAFB',
  white: '#FFFFFF',
};

const SCORE_COLORS = {
  excellent: '#10B981',
  good: '#F59E0B',
  warning: '#F97316',
  critical: '#EF4444',
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#DC2626',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#6B7280',
};

const IMPACT_COLORS: Record<string, string> = {
  critical: '#DC2626',
  serious: '#F97316',
  moderate: '#F59E0B',
  minor: '#6B7280',
};

function scoreColor(score: number): string {
  if (score >= 90) return SCORE_COLORS.excellent;
  if (score >= 70) return SCORE_COLORS.good;
  if (score >= 50) return SCORE_COLORS.warning;
  return SCORE_COLORS.critical;
}

function statusLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'Excellent', color: SCORE_COLORS.excellent };
  if (score >= 65) return { label: 'Good', color: SCORE_COLORS.good };
  if (score >= 40) return { label: 'Needs Work', color: SCORE_COLORS.warning };
  return { label: 'Critical', color: SCORE_COLORS.critical };
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + '...';
}

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const CATEGORY_LABELS: Record<string, { name: string; weight: string }> = {
  security: { name: 'Security', weight: '30%' },
  performance: { name: 'Performance', weight: '25%' },
  accessibility: { name: 'Accessibility', weight: '20%' },
  seo: { name: 'SEO', weight: '15%' },
  codeQuality: { name: 'Code Quality', weight: '10%' },
  'code quality': { name: 'Code Quality', weight: '10%' },
  'user experience': { name: 'Accessibility', weight: '20%' },
};

interface AuditReportProps {
  scan: Scan;
}

export function AuditReport({ scan }: AuditReportProps) {
  const score = scan.scoreOverall || 0;
  const grade = scan.letterGrade || getGrade(score);
  const status = statusLabel(score);
  const domain = scan.url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const scanDate = scan.completedAt
    ? new Date(scan.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const scanTime = scan.completedAt
    ? new Date(scan.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '';

  // Parse executive summary
  let execSummary: { keyStrength?: string; biggestRisk?: string; topPriority?: string } = {};
  try {
    const parsed = JSON.parse(scan.analysisBody || '');
    if (parsed.keyStrength) execSummary = parsed;
  } catch {
    // not JSON
  }

  const fixes = (scan.analysisFixes || []).slice(0, 10);
  const securityFindings = scan.resultsSecurity?.findings || [];
  const failedSecurity = securityFindings.filter(f => !f.passed).slice(0, 15);
  const passedSecurity = securityFindings.filter(f => f.passed).slice(0, 15);
  const perfMetrics = scan.resultsPerformance?.metrics || [];
  const seoFindings = (scan.resultsSeo?.findings || []).slice(0, 8);
  const a11yViolations = (scan.resultsAccessibility?.violations || []).slice(0, 10);
  const codeIssues = (scan.resultsCodeQuality?.issues || []).slice(0, 5);
  const techStack = scan.resultsTechStack || [];

  // Group tech stack
  const techGroups: Record<string, typeof techStack> = {};
  for (const tech of techStack) {
    const cat = tech.category || 'other';
    if (!techGroups[cat]) techGroups[cat] = [];
    techGroups[cat].push(tech);
  }

  // Score ring SVG parameters
  const ringSize = 160;
  const ringRadius = 65;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (score / 100) * ringCircumference;

  return (
    <div
      id="audit-report-full"
      style={{
        width: '800px',
        backgroundColor: COLORS.white,
        fontFamily: FONT,
        padding: '48px',
        boxSizing: 'border-box',
        color: COLORS.text,
        lineHeight: '1.5',
      }}
    >
      {/* 1. HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '24px', borderBottom: `2px solid ${COLORS.brand}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: COLORS.brand,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}>C</span>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text }}>Crisp</div>
            <div style={{ fontSize: '12px', color: COLORS.textMuted, letterSpacing: '1px', textTransform: 'uppercase' as const }}>Website Audit Report</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div style={{ fontSize: '13px', color: COLORS.textSecondary }}>{scanDate}</div>
          <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '2px' }}>ID: {scan.id.slice(0, 8)}</div>
        </div>
      </div>

      {/* 2. SITE INFO BAR */}
      <div style={{
        backgroundColor: COLORS.cardBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>URL</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: COLORS.text }}>{domain}</span>
        </div>
        {scanTime && (
          <span style={{ fontSize: '12px', color: COLORS.textMuted }}>{scanTime}</span>
        )}
      </div>

      {/* 3. OVERALL SCORE HERO */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '48px',
        marginBottom: '32px',
        padding: '32px',
        backgroundColor: COLORS.cardBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '12px',
      }}>
        {/* Score Ring */}
        <div style={{ position: 'relative' as const, width: `${ringSize}px`, height: `${ringSize}px` }}>
          <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="none"
              stroke={COLORS.border}
              strokeWidth="12"
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="none"
              stroke={scoreColor(score)}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${ringCircumference}`}
              strokeDashoffset={`${ringOffset}`}
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            />
            <text x={ringSize / 2} y={ringSize / 2 - 6} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '48px', fontWeight: '700', fill: COLORS.text }}>
              {score}
            </text>
            <text x={ringSize / 2} y={ringSize / 2 + 22} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '13px', fill: COLORS.textMuted }}>
              / 100
            </text>
          </svg>
        </div>

        {/* Grade + Status */}
        <div style={{ textAlign: 'center' as const }}>
          <div style={{ fontSize: '64px', fontWeight: '800', color: scoreColor(score), lineHeight: '1' }}>
            {grade}
          </div>
          <div style={{
            marginTop: '12px',
            display: 'inline-block',
            padding: '6px 20px',
            backgroundColor: `${status.color}18`,
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            color: status.color,
          }}>
            {status.label}
          </div>
        </div>
      </div>

      {/* 4. CATEGORY SCORE CARDS */}
      {scan.scoringBreakdown?.breakdown && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          {scan.scoringBreakdown.breakdown.map((cat) => {
            const catColor = scoreColor(cat.score);
            const label = CATEGORY_LABELS[cat.category.toLowerCase()] || { name: cat.category, weight: `${Math.round(cat.weight * 100)}%` };
            return (
              <div key={cat.category} style={{
                flex: 1,
                backgroundColor: COLORS.cardBg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '10px',
                padding: '16px 12px',
                textAlign: 'center' as const,
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '8px' }}>
                  {label.name}
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: catColor, marginBottom: '8px' }}>
                  {cat.score}
                </div>
                {/* Progress bar */}
                <div style={{ height: '4px', backgroundColor: COLORS.border, borderRadius: '2px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ height: '100%', width: `${cat.score}%`, backgroundColor: catColor, borderRadius: '2px' }} />
                </div>
                <div style={{ fontSize: '10px', color: COLORS.textMuted }}>Weight: {label.weight}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. EXECUTIVE SUMMARY */}
      {(execSummary.keyStrength || execSummary.biggestRisk || execSummary.topPriority) && (
        <>
          <SectionTitle title="Executive Summary" />
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            {execSummary.keyStrength && (
              <SummaryCard
                label="Key Strength"
                content={execSummary.keyStrength}
                borderColor={SCORE_COLORS.excellent}
                labelColor={SCORE_COLORS.excellent}
              />
            )}
            {execSummary.biggestRisk && (
              <SummaryCard
                label="Biggest Risk"
                content={execSummary.biggestRisk}
                borderColor={SCORE_COLORS.critical}
                labelColor={SCORE_COLORS.critical}
              />
            )}
            {execSummary.topPriority && (
              <SummaryCard
                label="Top Priority"
                content={execSummary.topPriority}
                borderColor={SCORE_COLORS.good}
                labelColor={SCORE_COLORS.good}
              />
            )}
          </div>
        </>
      )}

      {/* 6. PRIORITY FIXES */}
      {fixes.length > 0 && (
        <>
          <SectionTitle title="Priority Fixes" />
          <div style={{ marginBottom: '32px' }}>
            {fixes.map((fix, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 16px',
                borderBottom: i < fixes.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                backgroundColor: i % 2 === 0 ? COLORS.white : COLORS.cardBg,
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: `${PRIORITY_COLORS[fix.priority] || COLORS.textMuted}18`,
                  color: PRIORITY_COLORS[fix.priority] || COLORS.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  flexShrink: 0,
                  marginTop: '2px',
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: COLORS.text }}>{fix.title}</span>
                    <PriorityBadge priority={fix.priority} />
                    <span style={{ fontSize: '10px', color: COLORS.textMuted, textTransform: 'uppercase' as const }}>{fix.effort} effort</span>
                  </div>
                  <div style={{ fontSize: '12px', color: COLORS.textSecondary, lineHeight: '1.5' }}>
                    {truncate(fix.description, 200)}
                  </div>
                </div>
              </div>
            ))}
            {(scan.analysisFixes || []).length > 10 && (
              <div style={{ padding: '8px 16px', fontSize: '12px', color: COLORS.textMuted, fontStyle: 'italic' as const }}>
                ... and {(scan.analysisFixes || []).length - 10} more fixes
              </div>
            )}
          </div>
        </>
      )}

      {/* 7. SECURITY FINDINGS */}
      {(failedSecurity.length > 0 || passedSecurity.length > 0) && (
        <>
          <SectionTitle title="Security Findings" />
          <div style={{ marginBottom: '32px' }}>
            {/* Failed findings */}
            {failedSecurity.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                {failedSecurity.map((finding, i) => (
                  <div key={finding.id || i} style={{
                    padding: '12px 16px',
                    borderLeft: `3px solid ${PRIORITY_COLORS[finding.severity] || COLORS.textMuted}`,
                    backgroundColor: COLORS.cardBg,
                    marginBottom: '8px',
                    borderRadius: '0 8px 8px 0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#DC2626' }}>&#x2717;</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.text }}>{finding.title}</span>
                      <SeverityBadge severity={finding.severity} />
                    </div>
                    <div style={{ fontSize: '12px', color: COLORS.textSecondary, marginBottom: '4px' }}>
                      {truncate(finding.description, 200)}
                    </div>
                    {finding.recommendation && (
                      <div style={{ fontSize: '11px', color: COLORS.brand, fontWeight: '500' }}>
                        Fix: {truncate(finding.recommendation, 150)}
                      </div>
                    )}
                  </div>
                ))}
                {securityFindings.filter(f => !f.passed).length > 15 && (
                  <div style={{ padding: '4px 16px', fontSize: '12px', color: COLORS.textMuted, fontStyle: 'italic' as const }}>
                    ... and {securityFindings.filter(f => !f.passed).length - 15} more issues
                  </div>
                )}
              </div>
            )}
            {/* Passed findings */}
            {passedSecurity.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
                {passedSecurity.map((finding, i) => (
                  <span key={finding.id || i} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    backgroundColor: '#F0FDF4',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#166534',
                  }}>
                    <span>&#x2713;</span> {finding.title}
                  </span>
                ))}
              </div>
            )}

            {/* Protocol */}
            {scan.resultsProtocol && (
              <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '8px' }}>Protocol</div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: COLORS.textSecondary }}>
                  <span>HTTP: {scan.resultsProtocol.httpVersion}</span>
                  <span>HTTP/2: {scan.resultsProtocol.http2Supported ? '&#x2713; Yes' : '&#x2717; No'}</span>
                  <span>HTTP/3: {scan.resultsProtocol.http3Supported ? '&#x2713; Yes' : '&#x2717; No'}</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* 8. PERFORMANCE METRICS */}
      {perfMetrics.length > 0 && (
        <>
          <SectionTitle title="Performance Metrics" />
          <div style={{ marginBottom: '32px', border: `1px solid ${COLORS.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: COLORS.cardBg }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left' as const, fontWeight: '600', color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Metric</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center' as const, fontWeight: '600', color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Value</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center' as const, fontWeight: '600', color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {perfMetrics.map((metric, i) => (
                  <tr key={metric.id || i} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '10px 16px', color: COLORS.text, fontWeight: '500' }}>{metric.name}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center' as const, color: COLORS.textSecondary }}>{metric.displayValue}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center' as const }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: `${scoreColor(metric.score)}18`,
                        color: scoreColor(metric.score),
                      }}>
                        {metric.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 9. SEO FINDINGS */}
      {seoFindings.length > 0 && (
        <>
          <SectionTitle title="SEO Findings" />
          <div style={{ marginBottom: '32px' }}>
            {seoFindings.map((finding, i) => (
              <div key={finding.id || i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '8px 0',
                borderBottom: i < seoFindings.length - 1 ? `1px solid ${COLORS.border}` : 'none',
              }}>
                <span style={{
                  fontSize: '14px',
                  color: finding.passed ? '#16A34A' : '#DC2626',
                  lineHeight: '1.4',
                  flexShrink: 0,
                }}>
                  {finding.passed ? '\u2713' : '\u2717'}
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: COLORS.text }}>{finding.title}</span>
                  {finding.value && (
                    <span style={{ fontSize: '11px', color: COLORS.textMuted, marginLeft: '8px' }}>({truncate(finding.value, 60)})</span>
                  )}
                </div>
              </div>
            ))}
            {(scan.resultsSeo?.findings || []).length > 8 && (
              <div style={{ padding: '4px 0', fontSize: '12px', color: COLORS.textMuted, fontStyle: 'italic' as const }}>
                ... and {(scan.resultsSeo?.findings || []).length - 8} more findings
              </div>
            )}

            {/* Structured data */}
            {scan.resultsStructuredData?.found && (
              <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase' as const, marginBottom: '6px' }}>Structured Data</div>
                <div style={{ fontSize: '12px', color: COLORS.textSecondary }}>
                  Found: {scan.resultsStructuredData.types.join(', ')} ({scan.resultsStructuredData.jsonLdCount} JSON-LD, {scan.resultsStructuredData.microdataCount} Microdata)
                </div>
              </div>
            )}

            {/* Links */}
            {scan.resultsLinks && (
              <div style={{ marginTop: '8px', padding: '10px 14px', backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase' as const, marginBottom: '6px' }}>Link Audit</div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: COLORS.textSecondary }}>
                  <span>Total: {scan.resultsLinks.totalLinks}</span>
                  <span>Internal: {scan.resultsLinks.internalLinks}</span>
                  <span>External: {scan.resultsLinks.externalLinks}</span>
                  {scan.resultsLinks.brokenLinks.length > 0 && (
                    <span style={{ color: SCORE_COLORS.critical }}>Broken: {scan.resultsLinks.brokenLinks.length}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* 10. ACCESSIBILITY */}
      {a11yViolations.length > 0 && (
        <>
          <SectionTitle title="Accessibility Issues" />
          <div style={{ marginBottom: '32px' }}>
            {a11yViolations.map((violation, i) => (
              <div key={violation.id || i} style={{
                padding: '10px 16px',
                borderLeft: `3px solid ${IMPACT_COLORS[violation.impact] || COLORS.textMuted}`,
                backgroundColor: COLORS.cardBg,
                marginBottom: '8px',
                borderRadius: '0 8px 8px 0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.text }}>{violation.help}</span>
                  <ImpactBadge impact={violation.impact} />
                  <span style={{ fontSize: '11px', color: COLORS.textMuted }}>{violation.nodes} node{violation.nodes !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ fontSize: '12px', color: COLORS.textSecondary }}>
                  {truncate(violation.description, 200)}
                </div>
              </div>
            ))}
            {(scan.resultsAccessibility?.violations || []).length > 10 && (
              <div style={{ padding: '4px 16px', fontSize: '12px', color: COLORS.textMuted, fontStyle: 'italic' as const }}>
                ... and {(scan.resultsAccessibility?.violations || []).length - 10} more violations
              </div>
            )}
          </div>
        </>
      )}

      {/* 11. CODE QUALITY */}
      {codeIssues.length > 0 && (
        <>
          <SectionTitle title="Code Quality" />
          <div style={{ marginBottom: '32px' }}>
            {codeIssues.map((issue, i) => (
              <div key={issue.id || i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                borderBottom: i < codeIssues.length - 1 ? `1px solid ${COLORS.border}` : 'none',
              }}>
                <TypeBadge type={issue.type} />
                <div style={{ flex: 1, fontSize: '13px', color: COLORS.text }}>
                  {truncate(issue.message, 200)}
                </div>
                {issue.count > 1 && (
                  <span style={{ fontSize: '11px', color: COLORS.textMuted, flexShrink: 0 }}>x{issue.count}</span>
                )}
              </div>
            ))}
            {(scan.resultsCodeQuality?.issues || []).length > 5 && (
              <div style={{ padding: '4px 16px', fontSize: '12px', color: COLORS.textMuted, fontStyle: 'italic' as const }}>
                ... and {(scan.resultsCodeQuality?.issues || []).length - 5} more issues
              </div>
            )}
          </div>
        </>
      )}

      {/* 12. TECH STACK */}
      {Object.keys(techGroups).length > 0 && (
        <>
          <SectionTitle title="Tech Stack" />
          <div style={{ marginBottom: '32px' }}>
            {Object.entries(techGroups).map(([category, items]) => (
              <div key={category} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '6px' }}>
                  {category}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
                  {items.map((tech, i) => (
                    <span key={i} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 12px',
                      backgroundColor: COLORS.cardBg,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: COLORS.textSecondary,
                    }}>
                      {tech.name}
                      {tech.version && (
                        <span style={{ fontSize: '10px', color: COLORS.textMuted }}>{tech.version}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 13. FOOTER */}
      <div style={{
        borderTop: `1px solid ${COLORS.border}`,
        paddingTop: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '5px', backgroundColor: COLORS.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '10px', fontWeight: '700' }}>C</span>
          </div>
          <span style={{ fontSize: '12px', color: COLORS.textMuted }}>
            Generated by Crisp &middot; {scanDate}
          </span>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div style={{ fontSize: '11px', color: COLORS.textMuted }}>
            This report is auto-generated. Verify findings independently.
          </div>
          <div style={{ fontSize: '12px', color: COLORS.brand, fontWeight: '600', marginTop: '2px' }}>
            3rrork1ng.com
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components (all inline styles) ---

function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{
      fontSize: '16px',
      fontWeight: '700',
      color: COLORS.text,
      marginBottom: '12px',
      paddingBottom: '8px',
      borderBottom: `1px solid ${COLORS.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <div style={{ width: '3px', height: '16px', backgroundColor: COLORS.brand, borderRadius: '2px' }} />
      {title}
    </div>
  );
}

function SummaryCard({ label, content, borderColor, labelColor }: { label: string; content: string; borderColor: string; labelColor: string }) {
  return (
    <div style={{
      flex: 1,
      borderLeft: `3px solid ${borderColor}`,
      backgroundColor: COLORS.cardBg,
      borderRadius: '0 8px 8px 0',
      padding: '14px 16px',
    }}>
      <div style={{ fontSize: '10px', fontWeight: '700', color: labelColor, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ fontSize: '12px', color: COLORS.textSecondary, lineHeight: '1.5' }}>
        {truncate(content, 200)}
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const color = PRIORITY_COLORS[priority] || COLORS.textMuted;
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: '600',
      textTransform: 'uppercase' as const,
      backgroundColor: `${color}18`,
      color: color,
    }}>
      {priority}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const color = PRIORITY_COLORS[severity] || COLORS.textMuted;
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: '600',
      textTransform: 'uppercase' as const,
      backgroundColor: `${color}18`,
      color: color,
    }}>
      {severity}
    </span>
  );
}

function ImpactBadge({ impact }: { impact: string }) {
  const color = IMPACT_COLORS[impact] || COLORS.textMuted;
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: '600',
      textTransform: 'uppercase' as const,
      backgroundColor: `${color}18`,
      color: color,
    }}>
      {impact}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    console_error: 'Error',
    broken_link: 'Link',
    deprecated_api: 'Deprecated',
    mixed_content: 'Mixed',
  };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: '600',
      textTransform: 'uppercase' as const,
      backgroundColor: `${COLORS.textMuted}18`,
      color: COLORS.textMuted,
      flexShrink: 0,
    }}>
      {labels[type] || type}
    </span>
  );
}
