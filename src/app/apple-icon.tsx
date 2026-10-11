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
          background: 'linear-gradient(135deg, #f97316 0%, #d946ef 100%)',
          borderRadius: '20%',
        }}
      >
        <div style={{ color: 'white', fontSize: 100, fontWeight: 'bold' }}>N</div>
      </div>
    ),
    { ...size }
  );
}
