'use client';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/7322/7322116.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function LiveMap({ merchants }: { merchants: { [key: string]: string | number | boolean }[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <MapContainer
      center={[13.6288, 79.4192]}
      zoom={14}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {merchants.map((m) => {
        const isGold = m.is_gold_pin_active;
        const pingActive = m.is_currently_available;

        const dynamicIcon = new L.DivIcon({
            className: 'bg-transparent',
            html: `
                <div class="relative flex items-center justify-center">
                    ${pingActive ? '<div class="absolute -inset-4 bg-emerald-500/30 rounded-full animate-ping"></div>' : ''}
                    <div class="w-12 h-12 bg-white rounded-full shadow-2xl border-4 ${isGold ? 'border-amber-400' : 'border-indigo-500'} flex items-center justify-center relative z-10 overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/initials/svg?seed=${m.business_name}" class="w-full h-full object-cover" />
                    </div>
                    ${m.community_upvotes && (m.community_upvotes as number) > 50 ? '<div class="absolute -top-2 -right-2 text-xl filter drop-shadow-md z-20">👑</div>' : ''}
                </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 24]
        });

        return (
            <Marker
                key={m.id as string}
                position={[m.latitude as number, m.longitude as number]}
                icon={dynamicIcon}
            >
                <Popup className="rounded-xl overflow-hidden shadow-2xl border-0">
                    <div className="p-1">
                        <p className="font-black text-slate-900 text-sm mb-1">{m.business_name}</p>
                        <p className="text-xs font-bold text-slate-500 mb-2">{m.category}</p>
                        {m.current_deal_text && (
                             <p className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded mb-2 border border-red-100">🔥 {m.current_deal_text}</p>
                        )}
                        <p className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified Lead
                        </p>
                    </div>
                </Popup>
            </Marker>
        );
      })}
    </MapContainer>
  );
}
