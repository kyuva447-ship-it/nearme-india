import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToString } from 'react-dom/server';
import { Factory, Briefcase, Store, Zap, Wrench, Activity, MapPin } from 'lucide-react';

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

const getIconForBusinessType = (type, isAvailable) => {
  const baseClass = isAvailable ? 'text-emerald-500' : 'text-slate-400';
  const strokeClass = isAvailable ? 'white' : 'white';

  let IconComponent = Store; // Default
  if (type === 'Manufacturer') IconComponent = Factory;
  else if (type === 'Broker') IconComponent = Briefcase;
  else if (type === 'Service' || type === 'Freelancer') IconComponent = Wrench;

  return new L.DivIcon({
    html: renderToString(
      <div className={`relative ${isAvailable ? 'animate-bounce' : ''}`}>
        <MapPin className={`w-10 h-10 ${baseClass} drop-shadow-md`} fill={strokeClass} />
        <div className="absolute top-1.5 left-2.5 text-white">
          <IconComponent className="w-4 h-4" />
        </div>
        {isAvailable && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </div>
    ),
    className: 'custom-map-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const userIcon = new L.DivIcon({
  html: renderToString(
    <div className="relative">
      <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-ping absolute top-0 left-0"></div>
      <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg relative z-10"></div>
    </div>
  ),
  className: 'user-map-icon',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

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

        {userLocation && userLocation.latitude && userLocation.longitude && (
          <>
            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
              <Popup>
                <div className="font-bold text-slate-800">📍 Your Location</div>
                <div className="text-xs text-slate-500">Auto-detected via GPS</div>
              </Popup>
            </Marker>

            {/* Demand Heatmap (Mocked via Circle) */}
            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={2000} // 2km Surge Zone
              pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.05, weight: 1 }}
            />
          </>
        )}

        {verifiedSellers.map((seller) => (
          <Marker
            key={seller.id}
            position={[seller.lat, seller.lng]}
            icon={getIconForBusinessType(seller.business_type, seller.is_currently_available)}
          >
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
