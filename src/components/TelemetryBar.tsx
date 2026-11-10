'use client';
import React, { useState, useEffect } from 'react';
import { Activity, Users, MapPin, Globe, Smartphone, User } from 'lucide-react';
import PhoneAuthModal from './PhoneAuthModal';
import Link from 'next/link';

export default function TelemetryBar() {
  const [pincode, setPincode] = useState('560001 (Bengaluru)');
  const [lang, setLang] = useState('English');
  const [phone, setPhone] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const savedPin = localStorage.getItem('user_pincode');
    const savedLang = localStorage.getItem('user_lang');
    const savedPhone = localStorage.getItem('nearme_user_phone');
    if (savedPin) setPincode(savedPin);
    if (savedLang) setLang(savedLang);
    if (savedPhone) setPhone(savedPhone);

    const handleAuthChange = () => {
       setPhone(localStorage.getItem('nearme_user_phone'));
    };
    window.addEventListener('auth_change', handleAuthChange);
    return () => window.removeEventListener('auth_change', handleAuthChange);
  }, []);

  const handlePinChange = () => {
    const newPin = prompt("Enter your 6-digit Pin Code:", "560001");
    if (newPin && newPin.match(/^[1-9][0-9]{5}$/)) {
      setPincode(newPin);
      localStorage.setItem('user_pincode', newPin);
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <>
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
            <span className="hidden sm:inline">{pincode}</span>
          </div>

          {phone ? (
            <Link href="/account" className="flex items-center gap-2 bg-blue-900/30 rounded-full px-3 py-1 cursor-pointer hover:bg-blue-800/50 transition-colors border border-blue-500/50 text-blue-400 font-bold">
              <User className="w-3 h-3" />
              <span>My Account</span>
            </Link>
          ) : (
            <button onClick={() => setShowAuth(true)} className="flex items-center gap-2 bg-blue-600 rounded-full px-3 py-1 cursor-pointer hover:bg-blue-500 transition-colors text-white font-bold">
              <Smartphone className="w-3 h-3" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
      {showAuth && <PhoneAuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
    </>
  );
}
