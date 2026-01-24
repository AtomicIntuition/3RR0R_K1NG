import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Node.js runtime instead of edge for better env var access
export const runtime = 'nodejs';

// Helper to get grade color
function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#00ff41';
  if (grade.startsWith('B')) return '#fffc00';
  if (grade.startsWith('C')) return '#ff6b00';
  return '#ff0040';
}

// Helper to get score color
function getScoreColor(score: number): string {
  if (score >= 90) return '#00ff41';
  if (score >= 70) return '#fffc00';
  if (score >= 50) return '#ff6b00';
  return '#ff0040';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scanId } = await params;

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase env vars');
      return new Response('Server configuration error', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: scan, error } = await supabase
      .from('scans')
      .select('url, score_overall, letter_grade, roast_title, twitter_roast')
      .eq('id', scanId)
      .single();

    if (error || !scan) {
      console.error('Scan fetch error:', error);
      return new Response('Scan not found', { status: 404 });
    }

    const score = scan.score_overall || 0;
    const grade = scan.letter_grade || 'F';
    const url = scan.url?.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'unknown';
    // Use roast_title for a punchier headline, allow more text
    const roast = scan.roast_title || scan.twitter_roast || 'Your website got roasted!';
    const truncatedRoast = roast.length > 280 ? roast.slice(0, 280) + '...' : roast;
    const gradeColor = getGradeColor(grade);
    const scoreColor = getScoreColor(score);

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '675px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0a0a0f',
            padding: '40px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
            }}
          >
            <div style={{ color: '#00ff41', fontSize: '36px', fontWeight: 'bold' }}>
              3RROR_K1NG
            </div>
            <div style={{ color: '#6b7280', fontSize: '24px' }}>
              WEBSITE ROAST
            </div>
          </div>

          {/* Main content */}
          <div style={{ display: 'flex', flexGrow: 1 }}>
            {/* Left side - Score */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '350px',
                marginRight: '40px',
              }}
            >
              {/* Score circle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '180px',
                  height: '180px',
                  borderRadius: '90px',
                  border: `8px solid ${scoreColor}`,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  marginBottom: '20px',
                }}
              >
                <span style={{ fontSize: '72px', fontWeight: 'bold', color: scoreColor }}>
                  {score}
                </span>
              </div>
              {/* Letter grade */}
              <div
                style={{
                  fontSize: '120px',
                  fontWeight: '900',
                  color: gradeColor,
                  lineHeight: '1',
                }}
              >
                {grade}
              </div>
            </div>

            {/* Right side - Details */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flexGrow: 1,
              }}
            >
              {/* URL */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ color: '#00ff41', fontSize: '28px', marginRight: '12px' }}>
                  TARGET:
                </span>
                <span style={{ color: '#e5e7eb', fontSize: '32px', fontWeight: 'bold' }}>
                  {url.length > 35 ? url.slice(0, 35) + '...' : url}
                </span>
              </div>

              {/* Roast box */}
              <div
                style={{
                  display: 'flex',
                  padding: '20px 24px',
                  backgroundColor: 'rgba(0,255,65,0.05)',
                  border: '2px solid rgba(0,255,65,0.2)',
                  borderRadius: '12px',
                  maxHeight: '280px',
                }}
              >
                <span style={{ fontSize: '22px', color: '#e5e7eb', lineHeight: '1.35' }}>
                  "{truncatedRoast}"
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '30px',
              paddingTop: '20px',
              borderTop: '1px solid #1a1a24',
            }}
          >
            <span style={{ color: '#6b7280', fontSize: '20px' }}>
              Get roasted at 3rror.app
            </span>
            <span style={{ color: '#6b7280', fontSize: '18px' }}>
              SCAN_ID: {scanId.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>
      ),
      { width: 1200, height: 675 }
    );
  } catch (error) {
    console.error('OG image generation error:', error);
    return new Response(`Failed to generate image: ${error}`, { status: 500 });
  }
}
