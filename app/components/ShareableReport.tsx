'use client';

import { getGrade } from '@/lib/scoring';

interface ShareableReportProps {
  url: string;
  scoreOverall: number;
  letterGrade?: string;
  scoringBreakdown?: {
    breakdown: Array<{
      category: string;
      score: number;
      weight: number;
    }>;
  };
  analysisTitle?: string;
  analysisBody?: string;
  scanId?: string;
  fixes?: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    effort: string;
    impact?: string;
  }[];
}

// Fixed-width component designed specifically for screenshots (html2canvas)
// Must use inline styles only - no CSS grid, no CSS variables
export function ShareableReport({
  url,
  scoreOverall,
  letterGrade,
  scoringBreakdown,
  analysisTitle,
  analysisBody,
}: ShareableReportProps) {
  const grade = letterGrade || getGrade(scoreOverall);

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#34C759';
    if (score >= 70) return '#FBBF24';
    if (score >= 50) return '#F97316';
    return '#EF4444';
  };

  const getStatusLabel = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: '#34C759' };
    if (score >= 65) return { label: 'Good', color: '#FBBF24' };
    if (score >= 40) return { label: 'Needs Work', color: '#F97316' };
    return { label: 'Critical', color: '#EF4444' };
  };

  const getGradeHexColor = (g: string) => {
    if (g.startsWith('A')) return '#34C759';
    if (g.startsWith('B')) return '#34C759';
    if (g.startsWith('C')) return '#FBBF24';
    if (g.startsWith('D')) return '#F97316';
    return '#EF4444';
  };

  const getShortLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'security': 'SEC',
      'performance': 'PERF',
      'user experience': 'UX',
      'accessibility': 'A11Y',
      'seo': 'SEO',
      'code quality': 'CODE',
    };
    return labels[category.toLowerCase()] || category.slice(0, 4).toUpperCase();
  };

  const status = getStatusLabel(scoreOverall);
  const gradeColor = getGradeHexColor(grade);
  const scoreColor = getScoreColor(scoreOverall);
  const domain = url.replace(/^https?:\/\//, '').slice(0, 40);

  // Parse topPriority from body if available
  let topPriority = '';
  try {
    const parsed = JSON.parse(analysisBody || '');
    if (parsed.topPriority) topPriority = parsed.topPriority;
  } catch {
    // Not JSON, skip
  }

  return (
    <div
      id="shareable-report-fixed"
      style={{
        width: '600px',
        backgroundColor: '#09090B',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
        padding: '32px',
        boxSizing: 'border-box',
      }}
    >
      {/* Compact header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '700' }}>C</span>
          </div>
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#FAFAFA' }}>Crisp</span>
          <span style={{ fontSize: '13px', color: '#71717A', marginLeft: '4px' }}>Website Audit</span>
        </div>
        <div style={{
          padding: '6px 14px',
          backgroundColor: '#18181B',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#A1A1AA',
        }}>
          {domain}
        </div>
      </div>

      {/* Score Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
          marginBottom: '24px',
        }}
      >
        {/* Score Ring */}
        <div style={{ position: 'relative', width: '140px', height: '140px' }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="#27272A" strokeWidth="10" />
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke={scoreColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(scoreOverall / 100) * 377} 377`}
              transform="rotate(-90 70 70)"
            />
            <text x="70" y="64" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '40px', fontWeight: '700', fill: '#FAFAFA' }}>
              {scoreOverall}
            </text>
            <text x="70" y="88" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '13px', fill: '#71717A' }}>
              /100
            </text>
          </svg>
        </div>

        {/* Grade + Status */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '72px', fontWeight: '800', color: gradeColor, lineHeight: 1 }}>
            {grade}
          </div>
          <div
            style={{
              marginTop: '8px',
              padding: '6px 16px',
              backgroundColor: `${status.color}18`,
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              color: status.color,
            }}
          >
            {status.label}
          </div>
        </div>
      </div>

      {/* Category Mini-Bars */}
      {scoringBreakdown?.breakdown && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {scoringBreakdown.breakdown.map((cat) => {
            const catColor = getScoreColor(cat.score);
            return (
              <div
                key={cat.category}
                style={{
                  flex: 1,
                  backgroundColor: '#18181B',
                  borderRadius: '10px',
                  padding: '12px 8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '10px', color: '#71717A', marginBottom: '6px', fontWeight: '600', letterSpacing: '0.5px' }}>
                  {getShortLabel(cat.category)}
                </div>
                <div style={{
                  height: '4px',
                  backgroundColor: '#27272A',
                  borderRadius: '2px',
                  marginBottom: '6px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${cat.score}%`,
                    backgroundColor: catColor,
                    borderRadius: '2px',
                  }} />
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: catColor }}>
                  {cat.score}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Top Priority highlight */}
      {topPriority && (
        <div
          style={{
            backgroundColor: '#18181B',
            borderLeft: '3px solid #10B981',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '10px', color: '#10B981', fontWeight: '600', letterSpacing: '1px', marginBottom: '6px' }}>
            TOP PRIORITY
          </div>
          <p style={{ fontSize: '13px', color: '#D4D4D8', lineHeight: 1.5, margin: 0 }}>
            {topPriority.length > 120 ? topPriority.slice(0, 120) + '...' : topPriority}
          </p>
        </div>
      )}

      {/* If no executive summary, show title */}
      {!topPriority && analysisTitle && (
        <div
          style={{
            backgroundColor: '#18181B',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '24px',
          }}
        >
          <p style={{ fontSize: '14px', color: '#D4D4D8', lineHeight: 1.5, margin: 0, fontWeight: '500' }}>
            {analysisTitle}
          </p>
        </div>
      )}

      {/* Footer with CTA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '16px',
          borderTop: '1px solid #27272A',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#34C759',
          }} />
          <span style={{ fontSize: '12px', color: '#71717A' }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            backgroundColor: '#10B98120',
            borderRadius: '8px',
          }}
        >
          <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '600' }}>3rrork1ng.com</span>
        </div>
      </div>
    </div>
  );
}
