import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NearMe India — Verified Hyper-Local Business Directory & B2B Trade Network';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
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
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(217, 70, 239, 0.2) 100%)',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
            <div style={{ width: '80px', height: '80px', background: '#f97316', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '50px', fontWeight: 'bold' }}>N</div>
            <h1 style={{ color: 'white', fontSize: '64px', fontWeight: 'bold', margin: 0 }}>NearMe <span style={{ color: '#10b981' }}>India</span></h1>
        </div>
        <p style={{ color: '#cbd5e1', fontSize: '42px', textAlign: 'center', maxWidth: '900px', lineHeight: 1.4 }}>
          Verified Hyper-Local Business Directory & B2B Trade Network
        </p>
      </div>
    ),
    { ...size }
  );
}
