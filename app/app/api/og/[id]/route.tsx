import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Create Supabase client for edge runtime
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper to get grade color
function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#00ff41'; // terminal green
  if (grade.startsWith('B')) return '#fffc00'; // neon yellow
  if (grade.startsWith('C')) return '#ff6b00'; // neon orange
  return '#ff0040'; // danger red
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
    // Await params in Next.js 14+
    const { id: scanId } = await params;

    // Fetch scan data
    const supabase = getSupabaseClient();
    const { data: scan, error } = await supabase
      .from('scans')
      .select('url, score_overall, letter_grade, roast_title, twitter_roast, roast_persona')
      .eq('id', scanId)
      .single();

    if (error || !scan) {
      return new Response('Scan not found', { status: 404 });
    }

    const score = scan.score_overall || 0;
    const grade = scan.letter_grade || 'F';
    const url = scan.url?.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'unknown';
    const roast = scan.twitter_roast || scan.roast_title || 'No roast generated';
    const gradeColor = getGradeColor(grade);
    const scoreColor = getScoreColor(score);

    // Generate the image
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0a0a0f',
            fontFamily: 'monospace',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Grid background pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />

          {/* Scanlines effect */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px)',
            }}
          />

          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '30px 40px',
              borderBottom: '1px solid #1a1a24',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#00ff41',
                fontSize: '32px',
                fontWeight: 'bold',
              }}
            >
              <span>3RROR_K1NG</span>
            </div>
            <div
              style={{
                color: '#6b7280',
                fontSize: '20px',
              }}
            >
              WEBSITE ROAST
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              padding: '40px',
              gap: '40px',
            }}
          >
            {/* Left side - Score and Grade */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                minWidth: '280px',
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
                  borderRadius: '100%',
                  border: `8px solid ${scoreColor}`,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
              >
                <span
                  style={{
                    fontSize: '64px',
                    fontWeight: 'bold',
                    color: scoreColor,
                  }}
                >
                  {score}
                </span>
              </div>

              {/* Letter grade */}
              <div
                style={{
                  fontSize: '100px',
                  fontWeight: '900',
                  color: gradeColor,
                  textShadow: `0 0 30px ${gradeColor}, 0 0 60px ${gradeColor}`,
                  lineHeight: 1,
                }}
              >
                {grade}
              </div>
            </div>

            {/* Right side - URL and Roast */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'center',
                gap: '24px',
              }}
            >
              {/* URL */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span style={{ color: '#00ff41', fontSize: '24px' }}>TARGET:</span>
                <span
                  style={{
                    color: '#e5e7eb',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '500px',
                  }}
                >
                  {url}
                </span>
              </div>

              {/* Roast text */}
              <div
                style={{
                  padding: '24px',
                  backgroundColor: 'rgba(0, 255, 65, 0.05)',
                  border: `2px solid ${scoreColor}33`,
                  borderRadius: '12px',
                  maxHeight: '180px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontSize: '26px',
                    color: '#e5e7eb',
                    lineHeight: 1.4,
                  }}
                >
                  "{roast.length > 200 ? roast.slice(0, 200) + '...' : roast}"
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 40px',
              borderTop: '1px solid #1a1a24',
              color: '#6b7280',
              fontSize: '18px',
            }}
          >
            <span>Get roasted at 3rror.app</span>
            <span>SCAN_ID: {scanId.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 675,
      }
    );
  } catch (error) {
    console.error('OG image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
