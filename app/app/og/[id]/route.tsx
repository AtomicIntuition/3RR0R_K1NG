import { ImageResponse } from 'next/og';
import { createServiceClient } from '@/lib/supabase';
import { getGrade, getScoreColor } from '@/lib/scoring';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const supabase = createServiceClient();

    const { data: scan } = await supabase
      .from('scans')
      .select('url, score_overall, score_security, score_performance, score_seo, score_accessibility, score_code_quality, roast_title')
      .eq('id', id)
      .single();

    if (!scan || scan.score_overall === null) {
      // Return default OG image if scan not found
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0a0a0f',
              backgroundImage: 'linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 60,
                fontWeight: 'bold',
                color: '#00ff41',
                marginBottom: 20,
              }}
            >
              3RROR_K1NG
            </div>
            <div
              style={{
                fontSize: 30,
                color: '#9ca3af',
              }}
            >
              Website Roast Machine
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    const grade = getGrade(scan.score_overall);
    const domain = new URL(scan.url).hostname;

    // Determine color based on score
    const getColor = (score: number) => {
      if (score >= 90) return '#00ff41';
      if (score >= 70) return '#fffc00';
      if (score >= 50) return '#ff6b00';
      return '#ff0040';
    };

    const scoreColor = getColor(scan.score_overall);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0a0a0f',
            backgroundImage: 'linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            padding: 60,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 40,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#00ff41',
              }}
            >
              3RROR_K1NG
            </div>
            <div
              style={{
                fontSize: 20,
                color: '#6b7280',
              }}
            >
              Website Roast Report
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              gap: 60,
            }}
          >
            {/* Score circle */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  border: `8px solid ${scoreColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 40px ${scoreColor}40`,
                }}
              >
                <div
                  style={{
                    fontSize: 80,
                    fontWeight: 'bold',
                    color: scoreColor,
                  }}
                >
                  {grade}
                </div>
              </div>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: scoreColor,
                  marginTop: 20,
                }}
              >
                {scan.score_overall}/100
              </div>
            </div>

            {/* Details */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'center',
              }}
            >
              {/* Domain */}
              <div
                style={{
                  fontSize: 36,
                  color: '#e5e7eb',
                  marginBottom: 20,
                  fontWeight: 'bold',
                }}
              >
                {domain}
              </div>

              {/* Roast title */}
              {scan.roast_title && (
                <div
                  style={{
                    fontSize: 24,
                    color: scoreColor,
                    marginBottom: 30,
                    fontStyle: 'italic',
                  }}
                >
                  "{scan.roast_title}"
                </div>
              )}

              {/* Category scores */}
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { label: 'Security', score: scan.score_security, icon: '🛡️' },
                  { label: 'Performance', score: scan.score_performance, icon: '⚡' },
                  { label: 'SEO', score: scan.score_seo, icon: '🔍' },
                  { label: 'A11y', score: scan.score_accessibility, icon: '♿' },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      backgroundColor: '#16161f',
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <span style={{ color: '#9ca3af', fontSize: 16 }}>{item.label}:</span>
                    <span
                      style={{
                        color: getColor(item.score || 0),
                        fontSize: 18,
                        fontWeight: 'bold',
                      }}
                    >
                      {item.score ?? '--'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 40,
              paddingTop: 20,
              borderTop: '1px solid #22222e',
            }}
          >
            <div style={{ color: '#6b7280', fontSize: 16 }}>
              Get your website roasted at 3rror-k1ng.vercel.app
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#00ff41',
                }}
              />
              <span style={{ color: '#6b7280', fontSize: 14 }}>Scan Complete</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG image generation error:', error);

    // Return error OG image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0f',
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 'bold',
              color: '#00ff41',
            }}
          >
            3RROR_K1NG
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
