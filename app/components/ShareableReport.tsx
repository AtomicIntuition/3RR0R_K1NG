'use client';

import { getGrade, getGradeColor } from '@/lib/scoring';

interface RoastFix {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'performance' | 'security' | 'seo' | 'accessibility' | 'code_quality';
  title: string;
  description: string;
  effort: 'quick' | 'medium' | 'significant';
}

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
  roastTitle?: string;
  roastBody?: string;
  roastId?: string;
  fixes?: RoastFix[];
}

// Fixed-width component designed specifically for screenshots
// This renders at exactly the same size on ALL devices
export function ShareableReport({
  url,
  scoreOverall,
  letterGrade,
  scoringBreakdown,
  roastTitle,
  roastBody,
  roastId,
  fixes,
}: ShareableReportProps) {
  const grade = letterGrade || getGrade(scoreOverall);

  // Apple-style colors
  const getGradeHexColor = (grade: string) => {
    if (grade.startsWith('A')) return '#34C759'; // success
    if (grade.startsWith('B')) return '#34C759';
    if (grade.startsWith('C')) return '#FF9500'; // warning
    if (grade.startsWith('D')) return '#FF9500';
    return '#FF3B30'; // danger
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#34C759';
    if (score >= 70) return '#FF9500';
    if (score >= 50) return '#FF9500';
    return '#FF3B30';
  };

  const getStatusLabel = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: '#34C759' };
    if (score >= 65) return { label: 'Good', color: '#FF9500' };
    if (score >= 40) return { label: 'Needs Improvement', color: '#FF9500' };
    return { label: 'Critical Issues', color: '#FF3B30' };
  };

  const status = getStatusLabel(scoreOverall);
  const gradeColor = getGradeHexColor(grade);

  const getShortLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'security': 'Security',
      'performance': 'Performance',
      'user experience': 'UX',
      'accessibility': 'Accessibility',
      'seo': 'SEO',
      'code quality': 'Code',
    };
    return labels[category.toLowerCase()] || category;
  };

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
      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #18181B 0%, #09090B 100%)',
          border: '1px solid #27272A',
          borderRadius: '16px',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>C</span>
          </div>
          <span style={{ fontSize: '24px', fontWeight: '600', color: '#FAFAFA' }}>Crisp</span>
        </div>
        <div style={{ fontSize: '14px', color: '#A1A1AA', letterSpacing: '0.5px' }}>
          Website Audit Report
        </div>
      </div>

      {/* Target URL */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#18181B',
            borderRadius: '10px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span style={{ color: '#FAFAFA', fontWeight: '500', fontSize: '14px' }}>
            {url.replace(/^https?:\/\//, '').slice(0, 35)}{url.replace(/^https?:\/\//, '').length > 35 ? '...' : ''}
          </span>
        </div>
      </div>

      {/* Score Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '48px',
          marginBottom: '28px',
        }}
      >
        {/* Score Ring */}
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#27272A" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={getScoreColor(scoreOverall)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(scoreOverall / 100) * 327} 327`}
              transform="rotate(-90 60 60)"
            />
            <text x="60" y="56" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '32px', fontWeight: '600', fill: '#FAFAFA' }}>
              {scoreOverall}
            </text>
            <text x="60" y="76" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '12px', fill: '#A1A1AA' }}>
              /100
            </text>
          </svg>
        </div>

        {/* Grade & Status */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', fontWeight: '700', color: gradeColor, lineHeight: 1 }}>
            {grade}
          </div>
          <div
            style={{
              marginTop: '8px',
              padding: '6px 16px',
              backgroundColor: `${status.color}15`,
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '500',
              color: status.color,
            }}
          >
            {status.label}
          </div>
        </div>
      </div>

      {/* Category Scores */}
      {scoringBreakdown?.breakdown && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '10px',
            marginBottom: '28px',
          }}
        >
          {scoringBreakdown.breakdown.map((cat) => (
            <div
              key={cat.category}
              style={{
                backgroundColor: '#18181B',
                borderRadius: '12px',
                padding: '14px 10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '11px', color: '#A1A1AA', marginBottom: '6px', fontWeight: '500' }}>
                {getShortLabel(cat.category)}
              </div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: getScoreColor(cat.score) }}>
                {cat.score}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analysis Summary */}
      {roastTitle && roastBody && (
        <div
          style={{
            backgroundColor: '#18181B',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#FAFAFA', marginBottom: '12px', lineHeight: 1.4 }}>
            {roastTitle}
          </h3>
          <p style={{ fontSize: '14px', color: '#A1A1AA', lineHeight: 1.6, margin: 0 }}>
            {roastBody.length > 300 ? roastBody.slice(0, 300) + '...' : roastBody}
          </p>
        </div>
      )}

      {/* Top Fixes */}
      {fixes && fixes.length > 0 && (
        <div
          style={{
            backgroundColor: '#09090B',
            border: '1px solid #27272A',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#FAFAFA' }}>
              Priority Fixes
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {fixes.slice(0, 3).map((fix, index) => {
              const priorityColors: Record<string, string> = {
                critical: '#FF3B30',
                high: '#FF9500',
                medium: '#10B981',
                low: '#A1A1AA',
              };
              const priorityColor = priorityColors[fix.priority] || '#A1A1AA';

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    backgroundColor: '#18181B',
                    borderRadius: '10px',
                    borderLeft: `3px solid ${priorityColor}`,
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#A1A1AA', fontWeight: '500', minWidth: '20px' }}>
                    {index + 1}.
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#FAFAFA', marginBottom: '4px' }}>
                      {fix.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#A1A1AA', lineHeight: 1.4 }}>
                      {fix.description.length > 70 ? fix.description.slice(0, 70) + '...' : fix.description}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: priorityColor,
                      textTransform: 'uppercase',
                      padding: '4px 8px',
                      backgroundColor: `${priorityColor}10`,
                      borderRadius: '6px',
                    }}
                  >
                    {fix.priority}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div
        style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ fontSize: '17px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
          Get Your Free Website Audit
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '16px' }}>
          Security, Performance, SEO & Accessibility Analysis
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '10px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <span style={{ fontSize: '14px', color: '#171717', fontWeight: '600' }}>3rrork1ng.com</span>
        </div>
      </div>

      {/* Footer */}
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
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            backgroundColor: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: '#ffffff', fontSize: '10px', fontWeight: '700' }}>C</span>
          </div>
          <span style={{ fontSize: '12px', color: '#A1A1AA' }}>
            Analyzed by <span style={{ color: '#FAFAFA', fontWeight: '500' }}>Crisp</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#34C759',
            }}
          />
          <span style={{ fontSize: '11px', color: '#A1A1AA' }}>Analysis Complete</span>
        </div>
      </div>
    </div>
  );
}
