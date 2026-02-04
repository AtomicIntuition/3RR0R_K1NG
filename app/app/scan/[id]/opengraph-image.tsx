import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const alt = 'Crisp Website Audit';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function getScoreColor(score: number): string {
  if (score >= 90) return '#34C759';
  if (score >= 70) return '#FBBF24';
  if (score >= 50) return '#F97316';
  return '#EF4444';
}

function getGrade(score: number): string {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}

function getShortLabel(category: string): string {
  const labels: Record<string, string> = {
    'security': 'SEC',
    'performance': 'PERF',
    'user experience': 'UX',
    'accessibility': 'A11Y',
    'seo': 'SEO',
    'code quality': 'CODE',
  };
  return labels[category.toLowerCase()] || category.slice(0, 4).toUpperCase();
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch scan data
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let scoreOverall = 0;
  let grade = 'F';
  let domain = 'Unknown';
  let categories: { label: string; score: number }[] = [];

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data } = await supabase
        .from('scans')
        .select('url, score_overall, letter_grade, scoring_breakdown')
        .eq('id', id)
        .single();

      if (data) {
        scoreOverall = data.score_overall || 0;
        grade = data.letter_grade || getGrade(scoreOverall);
        try {
          domain = new URL(data.url).hostname;
        } catch {
          domain = data.url;
        }

        const breakdown = data.scoring_breakdown as any;
        if (breakdown?.breakdown) {
          categories = breakdown.breakdown.map((cat: any) => ({
            label: getShortLabel(cat.category),
            score: cat.score,
          }));
        }
      }
    } catch {
      // Fall through to defaults
    }
  }

  const scoreColor = getScoreColor(scoreOverall);
  const circumference = 2 * Math.PI * 80;
  const strokeDasharray = `${(scoreOverall / 100) * circumference} ${circumference}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090B',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '1080px',
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700' }}>C</span>
            </div>
            <span style={{ fontSize: '28px', fontWeight: '600', color: '#FAFAFA' }}>Crisp</span>
            <span style={{ fontSize: '18px', color: '#71717A', marginLeft: '8px' }}>Website Audit</span>
          </div>
          <div
            style={{
              padding: '8px 20px',
              backgroundColor: '#18181B',
              borderRadius: '10px',
              fontSize: '18px',
              color: '#A1A1AA',
            }}
          >
            {domain}
          </div>
        </div>

        {/* Score section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '60px',
            marginBottom: '40px',
          }}
        >
          {/* Score circle (SVG) */}
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#27272A" strokeWidth="14" />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={scoreColor}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              transform="rotate(-90 100 100)"
            />
            <text x="100" y="92" textAnchor="middle" dominantBaseline="middle" fill="#FAFAFA" fontSize="56" fontWeight="700">
              {scoreOverall}
            </text>
            <text x="100" y="126" textAnchor="middle" dominantBaseline="middle" fill="#71717A" fontSize="18">
              /100
            </text>
          </svg>

          {/* Grade */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '100px', fontWeight: '800', color: scoreColor, lineHeight: 1 }}>
              {grade}
            </span>
          </div>
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: '12px' }}>
            {categories.map((cat) => (
              <div
                key={cat.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px 24px',
                  backgroundColor: '#18181B',
                  borderRadius: '12px',
                  minWidth: '100px',
                }}
              >
                <span style={{ fontSize: '12px', color: '#71717A', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  {cat.label}
                </span>
                <span style={{ fontSize: '24px', fontWeight: '700', color: getScoreColor(cat.score) }}>
                  {cat.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}
