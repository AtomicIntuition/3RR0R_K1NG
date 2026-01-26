'use client';

import { getGrade, getGradeColor } from '@/lib/scoring';

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
          padding: '20px 24px',
          background: 'linear-gradient(90deg, rgba(0,255,65,0.15) 0%, rgba(0,255,65,0.08) 50%, rgba(0,255,65,0.15) 100%)',
          border: '2px solid rgba(0,255,65,0.4)',
          borderRadius: '12px',
          marginBottom: '28px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '4px' }}>
          FREE ROAST + ACTIONABLE FIXES
        </div>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
          Security • Performance • SEO • Accessibility
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ height: '1px', width: '40px', backgroundColor: 'rgba(0,255,65,0.5)' }} />
          <span
            style={{
              color: '#00ff41',
              fontSize: '20px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              textShadow: '0 0 20px rgba(0,255,65,0.5)',
            }}
          >
            3RRORK1NG.COM
          </span>
          <div style={{ height: '1px', width: '40px', backgroundColor: 'rgba(0,255,65,0.5)' }} />
        </div>
      </div>

      {/* Target URL */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
          </svg>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff' }}>{scoreOverall}</div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>/100</div>
          </div>
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
          <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '16px', letterSpacing: '2px' }}>
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
                  fontSize: '9px',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {cat.category}
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
              lineHeight: 1.3,
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
