'use client';

import React from 'react';

export default function LiveMap({ merchants }: { merchants: any[] }) {
  return (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 rounded-3xl">
      <div className="text-center">
        <p className="font-bold text-lg mb-2">Live Map View</p>
        <p className="text-sm">Showing {merchants?.length || 0} active merchants in Bangalore</p>
      </div>
    </div>
  );
}
