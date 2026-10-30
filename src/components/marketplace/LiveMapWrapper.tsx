'use client';

import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('./LiveMap'), {
  ssr: false,
});

export default function LiveMapWrapper({ merchants }: { merchants: any[] }) {
  return <LiveMap merchants={merchants} />;
}
