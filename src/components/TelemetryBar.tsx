'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, User, ChevronDown, Shield } from 'lucide-react';
import PhoneAuthModal from './QuickAuthModal';
import PWAInstallButton from './PWAInstallButton';
import { useToast } from './Toast';
import { LANGUAGES, normalizeLang } from '@/lib/i18n';
import type { SupportedLang } from '@/lib/autonomousStore';

export default function TelemetryBar() {
  const [showAuth, setShowAuth] = useState(false);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All India');
  const [selectedLang, setSelectedLang] = useState<SupportedLang>('EN');
  const [customPincode, setCustomPincode] = useState('');

  const { toast } = useToast();

  const cities = [
    'All India',
    'Bengaluru',
    'Mumbai',
    'Delhi NCR',
    'Hyderabad',
    'Chennai',
    'Pune',
    'Kolkata',
    'Madanapalle',
  ];

  useEffect(() => {
    setUserPhone(localStorage.getItem('nearme_user_phone'));
    const savedCity = localStorage.getItem('nearme_city');
    if (savedCity) setSelectedCity(savedCity);
    const savedLang = normalizeLang(localStorage.getItem('nearme_lang'));
    setSelectedLang(savedLang);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('nearme_user_phone');
    setUserPhone(null);
    toast('Signed out', 'info');
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem('nearme_city', city);
    setShowCitySelector(false);
    toast(`Location set to ${city}`, 'success');
  };

  const handleLangSelect = (lang: SupportedLang) => {
    setSelectedLang(lang);
    localStorage.setItem('nearme_lang', lang);
    window.dispatchEvent(new CustomEvent('nearme-lang-change', { detail: lang }));
    toast(`Language switched to ${lang}`, 'success');
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPincode.length === 6) {
      handleCitySelect(customPincode);
      setCustomPincode('');
    }
  };

  return (
    <header className="w-full bg-gray-950/95 backdrop-blur-md border-b border-gray-800/80 sticky top-0 z-40">
      {showAuth && (
        <PhoneAuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            setUserPhone(localStorage.getItem('nearme_user_phone'));
          }}
        />
      )}

      {/* Single-Row Top Bar Contract: Brand — Single-Line Nav + City/Lang — Primary Actions */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Clean single-line brand wordmark */}
        <Link
          href="/"
          className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span>
            NearMe <span className="text-emerald-400">India</span>
          </span>
        </Link>

        {/* Zone 2: Clean single-line navigation links + 6-language switcher */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link href="/#auditor" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Bill Stripper
          </Link>
          <Link href="/#syndicates" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Syndicates
          </Link>
          <Link href="/search" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Wholesale Index
          </Link>
          <Link href="/owner" className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            Founder Portal
          </Link>
        </nav>

        {/* Zone 3: City, 6-Language Switcher, PWA Install & Account */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* 6-Language Switcher (EN, HI, KN, TA, TE, MR) */}
          <div
            role="group"
            aria-label="Language Switcher"
            className="hidden sm:flex items-center bg-gray-900 border border-gray-800 rounded-lg p-0.5"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => handleLangSelect(l.code)}
                title={l.native}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedLang === l.code
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {l.code}
              </button>
            ))}
          </div>

          {/* Mobile compact language selector */}
          <select
            aria-label="Select Language"
            value={selectedLang}
            onChange={(e) => handleLangSelect(normalizeLang(e.target.value))}
            className="sm:hidden bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs font-bold text-white"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.code}
              </option>
            ))}
          </select>

          {/* City Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCitySelector(!showCitySelector)}
              className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-200 transition-colors whitespace-nowrap shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {showCitySelector && (
              <div className="absolute top-full right-0 mt-2 w-60 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50">
                <form onSubmit={handlePincodeSubmit} className="p-2.5 border-b border-gray-800 bg-gray-950">
                  <input
                    type="text"
                    value={customPincode}
                    onChange={(e) => setCustomPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit Pincode"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </form>
                <div className="max-h-56 overflow-y-auto p-1.5">
                  {cities.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCitySelect(c)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        selectedCity === c
                          ? 'bg-emerald-900/40 text-emerald-300 font-bold'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <PWAInstallButton />

          {userPhone ? (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/account"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 rounded-lg font-bold text-xs hover:bg-emerald-600 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                Account
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="hidden xl:inline text-xs text-gray-400 hover:text-white whitespace-nowrap shrink-0"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
