import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom component to dynamically center the map
function SetViewOnClick({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length === 2) {
      map.setView(coords, map.getZoom(), {
        animate: true,
      });
    }
  }, [coords, map]);
  return null;
}

const LiveMap = ({ sellers, userLocation }) => {
  const [center, setCenter] = useState([12.9116, 77.6412]); // Default to Bengaluru

  useEffect(() => {
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      setCenter([userLocation.latitude, userLocation.longitude]);
    }
  }, [userLocation]);

  const verifiedSellers = sellers.filter(seller => seller.isVerified);

  return (
    <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-slate-200 z-0">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SetViewOnClick coords={center} />

        {verifiedSellers.map((seller) => (
          <Marker key={seller.id} position={[seller.lat, seller.lng]}>
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-sm text-slate-800">{seller.shopName}</h3>
                <p className="text-xs text-slate-500 mb-2">{seller.category}</p>
                {seller.current_deal_text && (
                  <p className="text-xs text-amber-600 font-semibold mb-2 flex items-center justify-center gap-1">
                    🔥 {seller.current_deal_text}
                  </p>
                )}
                <button
                  onClick={() => {
                    // Find the card in DOM and scroll to it
                    const card = document.getElementById(`shop-${seller.id}`);
                    if (card) {
                      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded hover:bg-emerald-700 transition-colors"
                >
                  View Shop
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
