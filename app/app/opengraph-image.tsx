import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = '3RROR_K1NG - Website Roast Machine';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: '#00ff9d',
              marginBottom: 20,
              textShadow: '0 0 40px rgba(0, 255, 157, 0.5)',
            }}
          >
            3RROR_K1NG
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#9ca3af',
              marginBottom: 40,
            }}
          >
            Website Roast Machine
          </div>
          <div
            style={{
              display: 'flex',
              gap: 20,
              fontSize: 24,
              color: '#6b7280',
            }}
          >
            <span>Security</span>
            <span style={{ color: '#00ff9d' }}>|</span>
            <span>Performance</span>
            <span style={{ color: '#00ff9d' }}>|</span>
            <span>SEO</span>
            <span style={{ color: '#00ff9d' }}>|</span>
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
