import React from 'react';

const LiveMap = ({ merchants, onMarkerClick }: { merchants: any[], onMarkerClick?: any }) => {
  return (
    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
      <p>Interactive Map View (Fallback)</p>
    </div>
  );
};

export default LiveMap;
