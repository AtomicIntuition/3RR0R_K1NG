import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = '3RROR_K1NG - Website Roast Machine';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  // Fetch logo from public URL
  const logoUrl = new URL('/images/logo.png', 'https://3rrork1ng.com').toString();

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
          backgroundImage: 'radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="3RROR_K1NG Logo"
            width={180}
            height={180}
            style={{
              marginBottom: 30,
            }}
          />
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#00ff41',
              marginBottom: 16,
              textShadow: '0 0 40px rgba(0, 255, 65, 0.5)',
            }}
          >
            3RROR_K1NG
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#9ca3af',
              marginBottom: 32,
            }}
          >
            Website Roast Machine
          </div>
          <div
            style={{
              display: 'flex',
              gap: 20,
              fontSize: 22,
              color: '#6b7280',
            }}
          >
            <span>Security</span>
            <span style={{ color: '#00ff41' }}>|</span>
            <span>Performance</span>
            <span style={{ color: '#00ff41' }}>|</span>
            <span>SEO</span>
            <span style={{ color: '#00ff41' }}>|</span>
            <span>Accessibility</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
