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
  const gradeColorClass = getGradeColor(grade);

  // Convert Tailwind color class to actual color for inline styles
  const getGradeHexColor = (grade: string) => {
    if (grade.startsWith('A')) return '#00ff41';
    if (grade.startsWith('B')) return '#a3e635';
    if (grade.startsWith('C')) return '#facc15';
    if (grade.startsWith('D')) return '#fb923c';
    return '#ef4444';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#00ff41';
    if (score >= 70) return '#facc15';
    if (score >= 50) return '#fb923c';
    return '#ef4444';
  };

  // Match RoastText intensity logic exactly
  const getIntensityInfo = (score: number) => {
    if (score >= 85) {
      return { label: 'ACCEPTABLE', emoji: '🙄', color: '#00ff41' };
    }
    if (score >= 65) {
      return { label: 'NEEDS WORK', emoji: '😬', color: '#facc15' };
    }
    if (score >= 40) {
      return { label: 'BRUTAL', emoji: '🔥', color: '#fb923c' };
    }
    return { label: 'NUCLEAR', emoji: '☢️', color: '#ef4444' };
  };

  const intensity = getIntensityInfo(scoreOverall);

  const gradeColor = getGradeHexColor(grade);

  // Shorter labels for the compact shareable image
  const getShortLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'security': 'SECURITY',
      'performance': 'PERF',
      'user experience': 'UX',
      'accessibility': 'A11Y',
      'seo': 'SEO',
      'code quality': 'CODE',
    };
    return labels[category.toLowerCase()] || category.toUpperCase();
  };

  return (
    <div
      id="shareable-report-fixed"
      style={{
        width: '600px',
        backgroundColor: '#0a0a0f',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '32px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          textAlign: 'center',
          padding: '24px 28px',
          background: 'linear-gradient(90deg, rgba(0,255,65,0.15) 0%, rgba(0,255,65,0.08) 50%, rgba(0,255,65,0.15) 100%)',
          border: '2px solid rgba(0,255,65,0.4)',
          borderRadius: '12px',
          marginBottom: '28px',
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px', letterSpacing: '0.5px' }}>
          FREE ROAST + ACTIONABLE FIXES
        </div>
        <div style={{ fontSize: '15px', color: '#9ca3af', marginBottom: '16px', letterSpacing: '1px' }}>
          Security • Performance • SEO • Accessibility
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div style={{ height: '1px', width: '50px', backgroundColor: 'rgba(0,255,65,0.5)' }} />
          <span
            style={{
              color: '#00ff41',
              fontSize: '24px',
              fontWeight: 'bold',
              letterSpacing: '3px',
              textShadow: '0 0 20px rgba(0,255,65,0.5)',
            }}
          >
            3RRORK1NG.COM
          </span>
          <div style={{ height: '1px', width: '50px', backgroundColor: 'rgba(0,255,65,0.5)' }} />
        </div>
      </div>

      {/* Target URL with attention indicator */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
          {/* Attention arrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#00ff41', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>
              YOUR SITE
            </span>
            <span style={{ color: '#00ff41', fontSize: '16px' }}>→</span>
          </div>
          {/* URL badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'rgba(26,26,46,0.5)',
              border: '1px solid rgba(0,255,65,0.2)',
              borderRadius: '8px',
            }}
          >
            <span style={{ color: '#00ff41', fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px' }}>
              TARGET:
            </span>
            <span style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '14px' }}>
              {url.replace(/^https?:\/\//, '').slice(0, 30)}{url.replace(/^https?:\/\//, '').length > 30 ? '...' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Score Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
          marginBottom: '28px',
        }}
      >
        {/* Score Ring */}
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#1a1a2e"
              strokeWidth="8"
            />
            {/* Score arc */}
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
              style={{ filter: `drop-shadow(0 0 8px ${getScoreColor(scoreOverall)})` }}
            />
            {/* Score text - centered in SVG */}
            <text
              x="60"
              y="56"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: '32px', fontWeight: 'bold', fill: '#ffffff' }}
            >
              {scoreOverall}
            </text>
            <text
              x="60"
              y="76"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: '10px', fill: '#6b7280' }}
            >
              /100
            </text>
          </svg>
        </div>

        {/* Letter Grade */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '72px',
              fontWeight: '900',
              color: gradeColor,
              lineHeight: 1,
              textShadow: `0 0 30px ${gradeColor}, 0 0 60px ${gradeColor}`,
            }}
          >
            {grade}
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '24px', letterSpacing: '2px' }}>
            GRADE
          </div>
        </div>
      </div>

      {/* Category Scores */}
      {scoringBreakdown?.breakdown && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            marginBottom: '28px',
          }}
        >
          {scoringBreakdown.breakdown.map((cat) => (
            <div
              key={cat.category}
              style={{
                backgroundColor: 'rgba(26,26,46,0.8)',
                border: '1px solid #2d2d44',
                borderRadius: '8px',
                padding: '12px 8px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  letterSpacing: '0.5px',
                  marginBottom: '4px',
                  fontWeight: '600',
                }}
              >
                {getShortLabel(cat.category)}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: getScoreColor(cat.score),
                }}
              >
                {cat.score}
              </div>
              <div style={{ fontSize: '9px', color: '#4b5563' }}>{cat.weight}%</div>
            </div>
          ))}
        </div>
      )}

      {/* Roast Section */}
      {roastTitle && roastBody && (
        <div
          style={{
            backgroundColor: 'rgba(26,26,46,0.5)',
            border: `2px solid ${intensity.color}`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: `0 0 20px ${intensity.color}20`,
          }}
        >
          {/* Verdict Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '20px',
                border: `1px solid ${intensity.color}50`,
              }}
            >
              <span style={{ fontSize: '14px' }}>{intensity.emoji}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: intensity.color,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                {intensity.label}
              </span>
            </div>
            {roastId && (
              <span style={{ fontSize: '10px', color: '#4b5563' }}>
                ROAST_ID: {roastId.slice(0, 6).toUpperCase()}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: intensity.color,
              marginBottom: '12px',
              lineHeight: 1.4,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }}
          >
            {roastTitle}
          </h3>

          {/* Body - full text */}
          <p
            style={{
              fontSize: '13px',
              color: '#d1d5db',
              lineHeight: 1.6,
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            {roastBody}
          </p>
        </div>
      )}

      {/* Top 3 Quick Fixes */}
      {fixes && fixes.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(26,26,46,0.5)',
            border: '1px solid rgba(0,255,65,0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px' }}>🔧</span>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#00ff41', letterSpacing: '1px' }}>
              TOP FIXES TO IMPROVE YOUR SCORE
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {fixes.slice(0, 3).map((fix, index) => {
              const priorityColors: Record<string, string> = {
                critical: '#ef4444',
                high: '#fb923c',
                medium: '#facc15',
                low: '#22d3ee',
              };
              const priorityColor = priorityColors[fix.priority] || '#9ca3af';

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${priorityColor}`,
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', minWidth: '18px' }}>
                    {index + 1}.
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#e5e7eb', marginBottom: '2px' }}>
                      {fix.title}
                    </div>
                    <div style={{ fontSize: '10px', color: '#9ca3af', lineHeight: 1.4 }}>
                      {fix.description.length > 80 ? fix.description.slice(0, 80) + '...' : fix.description}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 'bold',
                      color: priorityColor,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {fix.priority}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#6b7280' }}>
              Full report + {fixes.length > 3 ? `${fixes.length - 3} more fixes` : 'all fixes'} at{' '}
              <span style={{ color: '#00ff41', fontWeight: 'bold' }}>3RRORK1NG.COM</span>
            </span>
          </div>
        </div>
      )}

      {/* Search CTA Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,65,0.12) 0%, rgba(34,211,238,0.08) 50%, rgba(0,255,65,0.12) 100%)',
          border: '2px solid rgba(0,255,65,0.35)',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative corner accents */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '20px',
            height: '20px',
            borderTop: '3px solid #00ff41',
            borderLeft: '3px solid #00ff41',
            borderRadius: '2px 0 0 0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '20px',
            height: '20px',
            borderTop: '3px solid #00ff41',
            borderRight: '3px solid #00ff41',
            borderRadius: '0 2px 0 0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '20px',
            height: '20px',
            borderBottom: '3px solid #00ff41',
            borderLeft: '3px solid #00ff41',
            borderRadius: '0 0 0 2px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '20px',
            height: '20px',
            borderBottom: '3px solid #00ff41',
            borderRight: '3px solid #00ff41',
            borderRadius: '0 0 2px 0',
          }}
        />

        <div style={{ textAlign: 'center' }}>
          {/* Icon and title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>🔍</span>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#ffffff',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Already Been Roasted?
            </span>
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '13px',
              color: '#d1d5db',
              marginBottom: '16px',
              lineHeight: 1.5,
            }}
          >
            Search for your website on our homepage to view your{' '}
            <span style={{ color: '#00ff41', fontWeight: 'bold' }}>full detailed report</span>
            {' '}with all fixes and recommendations
          </p>

          {/* Search bar mockup */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              backgroundColor: 'rgba(10,10,15,0.8)',
              border: '1px solid rgba(0,255,65,0.4)',
              borderRadius: '8px',
              boxShadow: '0 0 15px rgba(0,255,65,0.1)',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00ff41"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Search for your site...</span>
            <span
              style={{
                fontSize: '11px',
                color: '#00ff41',
                fontWeight: 'bold',
                padding: '4px 8px',
                backgroundColor: 'rgba(0,255,65,0.15)',
                borderRadius: '4px',
              }}
            >
              FREE
            </span>
          </div>

          {/* URL callout */}
          <div style={{ marginTop: '14px' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>Visit </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#00ff41',
                letterSpacing: '1px',
                textShadow: '0 0 10px rgba(0,255,65,0.3)',
              }}
            >
              3RRORK1NG.COM
            </span>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}> to find your report</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '16px',
          borderTop: '1px solid #2d2d44',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>💀</span>
          <span style={{ fontSize: '12px', color: '#6b7280', letterSpacing: '1px' }}>
            // ROASTED BY <span style={{ color: '#00ff41', fontWeight: 'bold' }}>3RROR_K1NG</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#00ff41',
              boxShadow: '0 0 8px #00ff41',
            }}
          />
          <span style={{ fontSize: '11px', color: '#6b7280' }}>ANALYSIS COMPLETE</span>
        </div>
      </div>
    </div>
  );
}
