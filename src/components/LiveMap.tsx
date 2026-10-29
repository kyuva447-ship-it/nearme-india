'use client';
import { useEffect } from 'react';

export default function LiveMap({ merchants, onMarkerClick }: any) {
  useEffect(() => {
     // Mock OSM implementation
  }, [merchants]);

  return (
    <div className="w-full h-full bg-slate-800 flex items-center justify-center rounded-3xl relative overflow-hidden">
       <p className="text-white/50 font-bold z-10">Free OSM Map Area</p>
       <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] opacity-20 bg-cover bg-center" />
    </div>
  );
}
