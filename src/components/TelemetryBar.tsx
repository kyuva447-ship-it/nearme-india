'use client';
import React, { useState, useEffect } from 'react';
import { Activity, Users, MapPin, Globe } from 'lucide-react';

export default function TelemetryBar() {
  const [pincode, setPincode] = useState('560001 (Bengaluru)');
  const [lang, setLang] = useState('English');

  useEffect(() => {
    const savedPin = localStorage.getItem('user_pincode');
    const savedLang = localStorage.getItem('user_lang');
    if (savedPin) setPincode(savedPin);
    if (savedLang) setLang(savedLang);
  }, []);

  const handlePinChange = () => {
    const newPin = prompt("Enter your 6-digit Pin Code:", "560001");
    if (newPin && newPin.match(/^[1-9][0-9]{5}$/)) {
      setPincode(newPin);
      localStorage.setItem('user_pincode', newPin);
      window.dispatchEvent(new Event('storage')); // trigger updates across UI
    }
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLang(newLang);
    localStorage.setItem('user_lang', newLang);
  };

  return (
    <div className="bg-gray-900 border-b border-gray-800 text-gray-300 text-xs sm:text-sm py-2 px-4 flex flex-wrap items-center justify-between gap-4 z-50 relative">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Cleared Today: ₹24.8 Cr</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>Active Bids: 1,432</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div onClick={handlePinChange} className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700">
          <MapPin className="w-3 h-3 text-blue-400" />
          <span>{pincode}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700">
          <Globe className="w-3 h-3 text-purple-400" />
          <select value={lang} onChange={handleLangChange} className="bg-transparent outline-none cursor-pointer text-gray-300">
            <option value="English">English</option>
            <option value="తెలుగు">తెలుగు</option>
            <option value="हिन्दी">हिन्दी</option>
            <option value="தமிழ்">தமிழ்</option>
            <option value="ಕನ್ನಡ">ಕನ್ನಡ</option>
          </select>
        </div>
      </div>
    </div>
  );
}
