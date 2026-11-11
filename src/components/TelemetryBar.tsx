'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, MapPin, Zap, User, Ticket, Store, Building, ChevronDown, Globe } from 'lucide-react';
import PhoneAuthModal from './QuickAuthModal';
import { useToast } from './Toast';

export default function TelemetryBar() {
  const [showAuth, setShowAuth] = useState(false);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All India');
  const [selectedLang, setSelectedLang] = useState('EN');
  const [customPincode, setCustomPincode] = useState('');

  const { toast } = useToast();

  const cities = ['All India', 'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Tirupati', 'Madanapalle', 'Visakhapatnam'];
  const languages = ['EN', 'हिं', 'తె', 'క'];

  useEffect(() => {
    setUserPhone(localStorage.getItem('nearme_user_phone'));
    const savedCity = localStorage.getItem('nearme_city');
    if (savedCity) setSelectedCity(savedCity);
    const savedLang = localStorage.getItem('nearme_lang');
    if (savedLang) setSelectedLang(savedLang);
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

  const handleLangSelect = (lang: string) => {
      setSelectedLang(lang);
      localStorage.setItem('nearme_lang', lang);
      setShowLangSelector(false);
      toast(`Language set to ${lang}`, 'success');
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (customPincode.length === 6) {
          handleCitySelect(customPincode);
          setCustomPincode('');
      }
  };

  return (
    <div className="w-full bg-gray-950/80 backdrop-blur-md border-b border-gray-900 sticky top-0 z-50">
      {showAuth && <PhoneAuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); setUserPhone(localStorage.getItem('nearme_user_phone')); }} />}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent pointer-events-none"></div>

      {/* Top utility bar */}
      <div className="flex justify-between items-center px-4 py-1 text-[10px] font-mono text-gray-500 border-b border-gray-900/50">
          <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-emerald-500" /> STATUS: OPERATIONAL</span>
              <span className="hidden sm:flex items-center gap-1 border-l border-gray-800 pl-4"><ShieldCheck className="w-3 h-3 text-blue-500" /> WAF: ACTIVE</span>
          </div>
          <div className="flex items-center gap-3">
              <Link href="/account" className="hidden md:flex items-center gap-1 hover:text-gray-300"><Ticket className="w-3 h-3"/> My Passes</Link>
              <Link href="/merchant-claim/1" className="hidden md:flex items-center gap-1 hover:text-gray-300 border-l border-gray-800 pl-3"><Store className="w-3 h-3"/> Merchant Claim</Link>
          </div>
      </div>

      {/* Main Navbar */}
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-12 py-3">
          <div className="flex items-center gap-6">
              {/* Brand Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-500/20">
                      <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 leading-none">NearMe<span className="text-emerald-500">India</span></span>
                      <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">🇮🇳 Pan-India AI Network</span>
                  </div>
              </Link>

              {/* Desktop City Selector */}
              <div className="hidden md:block relative">
                  <button onClick={() => setShowCitySelector(!showCitySelector)} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 px-3 py-1.5 rounded-lg text-white transition-colors text-sm">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold">{selectedCity}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {showCitySelector && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
                          <div className="p-3 border-b border-gray-800 bg-gray-950">
                              <form onSubmit={handlePincodeSubmit} className="relative">
                                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                  <input type="text" value={customPincode} onChange={e => setCustomPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit Pincode" className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-white outline-none focus:border-emerald-500 text-sm" />
                              </form>
                          </div>
                          <div className="max-h-64 overflow-y-auto p-2">
                              {cities.map(c => <button key={c} onClick={() => handleCitySelect(c)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCity === c ? 'bg-emerald-900/30 text-emerald-400 font-bold' : 'text-gray-300 hover:bg-gray-800'}`}>{c}</button>)}
                          </div>
                      </div>
                  )}
              </div>
          </div>

          <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <div className="relative">
                  <button onClick={() => setShowLangSelector(!showLangSelector)} className="flex items-center gap-1.5 text-sm font-bold text-gray-300 hover:text-white transition-colors">
                      <Globe className="w-4 h-4" /> {selectedLang} <ChevronDown className="w-3 h-3"/>
                  </button>
                  {showLangSelector && (
                      <div className="absolute top-full right-0 mt-2 w-24 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
                          {languages.map(l => <button key={l} onClick={() => handleLangSelect(l)} className={`w-full text-center px-3 py-2 text-sm transition-colors ${selectedLang === l ? 'bg-blue-900/30 text-blue-400 font-bold' : 'text-gray-300 hover:bg-gray-800'}`}>{l}</button>)}
                      </div>
                  )}
              </div>

              {/* Mobile City Selector (Icon only) */}
              <button onClick={() => setShowCitySelector(!showCitySelector)} className="md:hidden p-2 text-gray-400 hover:text-white">
                  <MapPin className="w-5 h-5" />
              </button>

              {userPhone ? (
                   <div className="flex items-center gap-3">
                       <Link href="/account" className="flex items-center gap-2 px-4 py-2 bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-sm hover:bg-emerald-900/50 transition-colors">
                           <User className="w-4 h-4"/> <span className="hidden sm:inline">Profile</span>
                       </Link>
                       <button onClick={handleSignOut} className="text-xs text-gray-500 hover:text-red-400 hidden sm:block">Sign Out</button>
                   </div>
              ) : (
                  <button onClick={() => setShowAuth(true)} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
                      <User className="w-4 h-4" /> Sign In <span className="hidden sm:inline">/ Profile</span>
                  </button>
              )}
          </div>
      </div>

      {/* Mobile City Dropdown rendered full width if toggled on small screens */}
      <div className="md:hidden relative">
          {showCitySelector && (
              <div className="absolute top-0 left-0 w-full bg-gray-900 border-b border-gray-800 shadow-2xl z-50 animate-fade-in">
                  <div className="p-3 border-b border-gray-800 bg-gray-950">
                      <form onSubmit={handlePincodeSubmit} className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input type="text" value={customPincode} onChange={e => setCustomPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit Pincode" className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-white outline-none focus:border-emerald-500" />
                      </form>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2 grid grid-cols-2 gap-2">
                      {cities.map(c => <button key={c} onClick={() => handleCitySelect(c)} className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCity === c ? 'bg-emerald-900/30 text-emerald-400 font-bold' : 'text-gray-300 bg-gray-800 hover:bg-gray-700'}`}>{c}</button>)}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
}
