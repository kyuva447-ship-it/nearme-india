'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  User,
  ChevronDown,
  Shield,
  Search,
  Store,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
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
    'Madanapalle',
    'Hyderabad',
    'Delhi NCR',
    'Mumbai',
    'Chennai',
    'Pune',
    'Kolkata',
  ];

  useEffect(() => {
    const syncAuth = () => {
      setUserPhone(localStorage.getItem('nearme_user_phone'));
      const savedCity = localStorage.getItem('nearme_city');
      if (savedCity) setSelectedCity(savedCity);
      const savedLang = normalizeLang(localStorage.getItem('nearme_lang'));
      setSelectedLang(savedLang);
    };
    syncAuth();
    window.addEventListener('auth_change', syncAuth);
    window.addEventListener('storage', syncAuth);
    return () => {
      window.removeEventListener('auth_change', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('nearme_user_phone');
    localStorage.removeItem('nearme_user_name');
    localStorage.removeItem('nearme_user_email');
    window.dispatchEvent(new Event('auth_change'));
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
    <>
      {showAuth && (
        <PhoneAuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            setUserPhone(localStorage.getItem('nearme_user_phone'));
          }}
        />
      )}
      <header className="w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 via-amber-400 to-violet-500" />

      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 h-16">
        <Link
          href="/"
          className="text-lg sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span>
            NearMe{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
              India
            </span>
          </span>
        </Link>

        {/* Desktop Primary Discovery & Merchant Action Buttons */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-2 text-xs font-bold">
          <Link
            href="/search"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-200 hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            Find Services
          </Link>
          <Link
            href="/claim"
            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            List Your Business (Free)
          </Link>
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
            Merchant Dashboard
          </Link>
          <Link
            href="/escrow"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Track Escrow
          </Link>
          <Link
            href="/owner"
            title="Owner Console"
            className="px-2.5 py-1.5 rounded-lg text-violet-300 hover:text-violet-200 hover:bg-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
          >
            <Shield className="w-3.5 h-3.5" />
            Owner
          </Link>
        </nav>

        {/* City, 6-Language Switcher, PWA Install & Account */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            role="group"
            aria-label="Language Switcher"
            className="hidden xl:flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => handleLangSelect(l.code)}
                title={l.native}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all whitespace-nowrap shrink-0 ${
                  selectedLang === l.code
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.code}
              </button>
            ))}
          </div>

          <select
            aria-label="Select Language"
            value={selectedLang}
            onChange={(e) => handleLangSelect(normalizeLang(e.target.value))}
            className="xl:hidden bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs font-bold text-white"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.code}
              </option>
            ))}
          </select>

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
                className="hidden 2xl:inline text-xs text-gray-400 hover:text-white whitespace-nowrap shrink-0"
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

      {/* Mobile & Tablet Quick-Action Strip */}
      <nav
        aria-label="Quick Mobile Navigation"
        className="lg:hidden border-t border-slate-800/80 bg-slate-950/95 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs font-bold"
      >
        <Link
          href="/search"
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-200 whitespace-nowrap shrink-0 flex items-center gap-1"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          Find Services
        </Link>
        <Link
          href="/claim"
          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/50 text-emerald-200 whitespace-nowrap shrink-0 flex items-center gap-1"
        >
          <Store className="w-3.5 h-3.5 text-emerald-400" />
          List Your Business (Free)
        </Link>
        <Link
          href="/dashboard"
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 whitespace-nowrap shrink-0 flex items-center gap-1"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
          Merchant Dashboard
        </Link>
        <Link
          href="/escrow"
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 whitespace-nowrap shrink-0 flex items-center gap-1"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Track Escrow
        </Link>
      </nav>
      </header>
    </>
  );
}

