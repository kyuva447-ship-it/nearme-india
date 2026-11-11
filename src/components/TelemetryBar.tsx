'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, MapPin, Zap, AlertTriangle, User, Ticket, Store, Building, ChevronDown, Search } from 'lucide-react';
import PhoneAuthModal from './QuickAuthModal';
import { useToast } from './Toast';

export default function TelemetryBar() {
  const [latency, setLatency] = useState(12);
  const [activeNodes, setActiveNodes] = useState(24);
  const [showAuth, setShowAuth] = useState(false);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedCity, setSelectedCity] = useState('🇮🇳 All India');
  const [customPincode, setCustomPincode] = useState('');

  const { toast } = useToast();

  const cities = ['🇮🇳 All India', 'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Tirupati', 'Madanapalle', 'Visakhapatnam'];

  useEffect(() => {
    // Initial fetch
    setUserPhone(localStorage.getItem('nearme_user_phone'));
    const savedCity = localStorage.getItem('nearme_city');
    if (savedCity) setSelectedCity(savedCity);

    const interval = setInterval(() => {
      setLatency(10 + Math.floor(Math.random() * 15));
      setActiveNodes(20 + Math.floor(Math.random() * 10));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
      localStorage.removeItem('nearme_user_phone');
      setUserPhone(null);
      toast('Signed out successfully', 'info');
  };

  const handleCitySelect = (city: string) => {
      setSelectedCity(city);
      localStorage.setItem('nearme_city', city);
      setShowCitySelector(false);
      toast(`Location set to ${city}`, 'success');
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (customPincode.length >= 6) {
          handleCitySelect(`Pincode: ${customPincode}`);
          setCustomPincode('');
      }
  };

  return (
    <div className="w-full bg-gray-950 border-b border-gray-900 text-xs font-mono text-gray-500 py-1.5 px-4 flex justify-between items-center z-50 relative overflow-visible">
      {showAuth && <PhoneAuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); setUserPhone(localStorage.getItem('nearme_user_phone')); }} />}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none"></div>

      <div className="flex items-center gap-4">

        {/* City Selector */}
        <div className="relative">
            <button
                onClick={() => setShowCitySelector(!showCitySelector)}
                className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 px-2 py-1 rounded text-white transition-colors"
            >
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span className="font-bold">{selectedCity}</span>
                <ChevronDown className="w-3 h-3" />
            </button>

            {showCitySelector && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                    <div className="p-3 border-b border-gray-800 bg-gray-950">
                        <form onSubmit={handlePincodeSubmit} className="flex items-center relative">
                            <MapPin className="w-4 h-4 absolute left-3 text-gray-500" />
                            <input
                                type="text"
                                value={customPincode}
                                onChange={(e) => setCustomPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter Pincode..."
                                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-white outline-none focus:border-blue-500 text-sm"
                            />
                        </form>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                        {cities.map(city => (
                            <button
                                key={city}
                                onClick={() => handleCitySelect(city)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCity === city ? 'bg-blue-900/30 text-blue-400 font-bold' : 'text-gray-300 hover:bg-gray-800'}`}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 border-l border-gray-800 pl-4">
          <Zap className="w-3 h-3 text-yellow-500" />
          <span>{latency}ms</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 border-l border-gray-800 pl-4">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span className="text-emerald-500/70">WAF: ACTIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* New Navigation Links Required by Master Production Overhaul */}
        <Link href="/account" className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors border-r border-gray-800 pr-4">
            <Ticket className="w-3 h-3 text-purple-400" /> My Passes
        </Link>
        <Link href="/merchant-claim/1" className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors border-r border-gray-800 pr-4">
            <Store className="w-3 h-3 text-orange-400" /> Merchant Claim
        </Link>

        {userPhone ? (
             <div className="flex items-center gap-3">
                 <span className="text-gray-300 font-bold flex items-center gap-1">
                     <User className="w-3 h-3 text-emerald-400"/> {userPhone.slice(0, 4)}***
                 </span>
                 <button onClick={handleSignOut} className="text-gray-600 hover:text-red-400 transition-colors">Sign Out</button>
             </div>
        ) : (
            <button onClick={() => setShowAuth(true)} className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                <User className="w-3 h-3" /> Sign In / Profile
            </button>
        )}
      </div>
    </div>
  );
}
