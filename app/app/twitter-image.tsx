import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = '3RROR_K1NG - Get Your Website Brutally Roasted';
export const size = {
  width: 1200,
  height: 600, // Twitter summary_large_image optimal ratio
};
export const contentType = 'image/png';

export default async function Image() {
  const logoUrl = new URL('/images/logo.png', 'https://3rrork1ng.com').toString();

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#050508',
          overflow: 'hidden',
        }}
      >
        {/* Animated gradient background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(0, 255, 65, 0.15) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(0, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(ellipse 100% 80% at 50% 100%, rgba(0, 255, 65, 0.08) 0%, transparent 40%)',
          }}
        />

        {/* Grid lines overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Scanline effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
            pointerEvents: 'none',
          }}
        />

        {/* Main content container */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            padding: '50px 70px',
            position: 'relative',
          }}
        >
          {/* Left side - Logo and branding */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
            }}
          >
            {/* Logo with glow */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 32,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="3RROR_K1NG Logo"
                width={120}
                height={120}
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(0, 255, 65, 0.6)) drop-shadow(0 0 60px rgba(0, 255, 65, 0.3))',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginLeft: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: '#00ff41',
                    letterSpacing: '-2px',
                    textShadow: '0 0 40px rgba(0, 255, 65, 0.8), 0 0 80px rgba(0, 255, 65, 0.4)',
                  }}
                >
                  3RROR_K1NG
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: '#00ff41',
                    opacity: 0.7,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    marginTop: 4,
                  }}
                >
                  Website Roast Machine
                </div>
              </div>
            </div>

            {/* Main headline */}
            <div
              style={{
                fontSize: 46,
                fontWeight: 'bold',
                color: '#ffffff',
                lineHeight: 1.1,
                marginBottom: 20,
                maxWidth: 480,
              }}
            >
              Get Your Website
              <span style={{ color: '#00ff41' }}> Brutally Roasted</span>
            </div>

            {/* Subheadline */}
            <div
              style={{
                fontSize: 20,
                color: '#9ca3af',
                lineHeight: 1.5,
                maxWidth: 460,
                marginBottom: 32,
              }}
            >
              AI-powered audits for security, performance, SEO & accessibility.
              Savage truths with actionable fixes.
            </div>

            {/* CTA Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  backgroundColor: '#00ff41',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#050508',
                }}
              >
                Try Free - 3rrork1ng.com
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 20px',
                  border: '2px solid rgba(0, 255, 65, 0.5)',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#00ff41',
                }}
              >
                3 Free Scans/Day
              </div>
            </div>
          </div>

          {/* Right side - Score visualization */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: 360,
            }}
          >
            {/* Mock score card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(10, 10, 20, 0.8)',
                border: '1px solid rgba(0, 255, 65, 0.3)',
                borderRadius: 16,
                padding: '28px',
                width: '100%',
                boxShadow: '0 0 60px rgba(0, 255, 65, 0.1), inset 0 0 60px rgba(0, 255, 65, 0.03)',
              }}
            >
              {/* Terminal header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#27ca40' }} />
                <span style={{ marginLeft: 10, fontSize: 12, color: '#6b7280' }}>scan_results.exe</span>
              </div>

              {/* Score items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Security', score: 'C+', color: '#ffbd2e' },
                  { label: 'Performance', score: 'B-', color: '#00ff41' },
                  { label: 'SEO', score: 'D', color: '#ff5f56' },
                  { label: 'Accessibility', score: 'B', color: '#00ff41' },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 16, color: '#9ca3af' }}>{item.label}</span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 100,
                          height: 6,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${item.score === 'D' ? 40 : item.score === 'C+' ? 60 : item.score === 'B-' ? 70 : 75}%`,
                            height: '100%',
                            backgroundColor: item.color,
                            borderRadius: 3,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 'bold',
                          color: item.color,
                          width: 32,
                          textAlign: 'right',
                        }}
                      >
                        {item.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall score */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span style={{ fontSize: 18, color: '#ffffff', fontWeight: 'bold' }}>Overall</span>
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 'bold',
                    color: '#ffbd2e',
                    textShadow: '0 0 20px rgba(255, 189, 46, 0.5)',
                  }}
                >
                  C+
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, transparent, #00ff41, #00ffff, #00ff41, transparent)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
