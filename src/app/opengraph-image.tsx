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
          backgroundImage: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 23, 42, 1) 100%)',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '40px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
              borderRadius: '24px',
              border: '4px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative'
            }}>
              <div style={{ color: 'white', fontSize: '72px', fontWeight: '900', fontFamily: 'sans-serif' }}>N</div>
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '16px',
                height: '16px',
                background: 'linear-gradient(135deg, #ff6b00 0%, #10b981 100%)',
                borderRadius: '50%'
              }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ color: 'white', fontSize: '84px', fontWeight: '900', margin: 0, letterSpacing: '-0.05em' }}>NearMe</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'transparent', backgroundImage: 'linear-gradient(90deg, #ff6b00, #10b981)', backgroundClip: 'text', fontSize: '32px', fontWeight: '900', letterSpacing: '0.2em' }}>INDIA</span>
                <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '18px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>VERIFIED</span>
              </div>
            </div>
        </div>
        <p style={{ color: '#cbd5e1', fontSize: '42px', textAlign: 'center', maxWidth: '900px', lineHeight: 1.4, fontWeight: '500' }}>
          Verified Hyper-Local Business Directory & B2B Trade Network
        </p>
      </div>
    ),
    { ...size }
  );
}
