import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          borderRadius: '40px',
          border: '4px solid rgba(99, 102, 241, 0.2)',
          position: 'relative'
        }}
      >
        <div style={{ color: 'white', fontSize: 105, fontWeight: '900', fontFamily: 'sans-serif' }}>N</div>
        <div style={{
          position: 'absolute',
          top: '32px',
          right: '32px',
          width: '22px',
          height: '22px',
          background: 'linear-gradient(135deg, #ff6b00 0%, #10b981 100%)',
          borderRadius: '50%'
        }} />
      </div>
    ),
    { ...size }
  );
}
