'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function LiveMap({ merchants }: { merchants: { [key: string]: string | number | boolean | null }[] }) {


  return (
    <MapContainer
      center={[12.9716, 77.5946]}
      zoom={13}
      style={{ height: "100%", width: "100%", zIndex: 10 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {merchants.map((m) => {
        // Fallback to Bengaluru center if no location exists.
        // In a real app, parse PostGIS geography to [lat, lng].
        // e.g. from 0101000020E6100000.... to coordinates.
        const lat = m.lat ? Number(m.lat) : 12.9716 + (Math.random() - 0.5) * 0.05;
        const lng = m.lng ? Number(m.lng) : 77.5946 + (Math.random() - 0.5) * 0.05;
        return (
          <Marker key={String(m.id)} position={[lat, lng]} icon={customIcon}>
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold text-slate-900">{m.business_name}</h3>
                <p className="text-xs text-slate-500">{m.category}</p>
                <div className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">
                  Surge {m.surge_multiplier}x
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
