'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  MapPin,
  Store,
  ArrowLeft,
  Zap,
  ShieldCheck,
  Star,
  ChevronRight,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { triggerNearMeCheckout } from '@/lib/razorpayClient';
import PhoneAuthModal from '@/components/QuickAuthModal';
import { useToast } from '@/components/Toast';
import { SEEDED_MERCHANTS, ZONE_WHOLESALE_INDEX } from '@/lib/seeded-marketplace';

interface SearchResultShop {
  name: string;
  rating: number;
  distance: string;
  verified: boolean;
  retailPrice: number;
  price: number;
  category?: string;
  pincode?: string;
  gstin?: string;
}

const DEFAULT_WHOLESALE_RESULTS: SearchResultShop[] = SEEDED_MERCHANTS.map((m) => {
  const baseOrder = m.liveCashOrderInr || 42500;
  return {
    name: m.business_name,
    rating: Number((4.6 + (m.trust_score % 4) * 0.1).toFixed(1)),
    distance: `${m.city} · ${m.pincode}`,
    verified: true,
    retailPrice: Math.round(baseOrder * 1.28),
    price: baseOrder,
    category: m.category,
    pincode: m.pincode,
    gstin: m.gstin,
  };
});

const SECTOR_CHIPS = [
  'All Sectors',
  'Hospital ICU Audit',
  'OPC-53 Cement & Steel',
  'Jan Aushadhi Rx',
  '22K Bullion Making',
  'Agri Drip & Mandi',
];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get('city') || 'All India';
  const initialQuery = searchParams.get('q') || '';

  const [city, setCity] = useState(initialCity);
  const [query, setQuery] = useState(initialQuery);
  const [activeChip, setActiveChip] = useState('All Sectors');
  const [results, setResults] = useState<SearchResultShop[]>(DEFAULT_WHOLESALE_RESULTS);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const { toast } = useToast();

  const runSearch = useCallback(
    async (searchText: string) => {
      const trimmed = searchText.trim();
      if (!trimmed || trimmed === 'All Sectors') {
        setResults(DEFAULT_WHOLESALE_RESULTS);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/agent/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'scout', query: trimmed, city: city.trim() }),
        });

        const data = await res.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          setResults(data.results);
        } else {
          const filtered = DEFAULT_WHOLESALE_RESULTS.filter(
            (item) =>
              item.name.toLowerCase().includes(trimmed.toLowerCase()) ||
              (item.category || '').toLowerCase().includes(trimmed.toLowerCase()) ||
              item.distance.toLowerCase().includes(trimmed.toLowerCase())
          );
          setResults(filtered.length > 0 ? filtered : DEFAULT_WHOLESALE_RESULTS);
        }
      } catch {
        toast('Switched to verified Pan-India Wholesale Index', 'info');
        setResults(DEFAULT_WHOLESALE_RESULTS);
      } finally {
        setLoading(false);
      }
    },
    [city, toast]
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSearch(query);
  };

  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery);
    }
  }, [initialQuery, runSearch]);

  const requireAuth = (actionFn: () => void) => {
    if (!localStorage.getItem('nearme_user_phone')) {
      setPendingAction(() => actionFn);
      setShowAuth(true);
    } else {
      actionFn();
    }
  };

  const lockDeal = (merchant: SearchResultShop) => {
    triggerNearMeCheckout({
      itemName: `Lock Wholesale Deal at ${merchant.name}`,
      amountInRupees: merchant.price || 199,
      actionType: 'deal_lock',
      onSuccess: () => toast('15/85 Wholesale Escrow Deal Locked!', 'success'),
      onFallback: () => toast('UPI Escrow Fallback Ready for Checkout', 'info'),
      onAuthRequired: () => setShowAuth(true),
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col">
      {showAuth && (
        <PhoneAuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            if (pendingAction) pendingAction();
          }}
        />
      )}

      {/* Multi-color ambient aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-cyan-500/15 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-500/15 blur-3xl rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto w-full flex-1 px-4 sm:px-6 py-8 relative z-10 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-300 text-sm font-bold hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <Link
            href="/#auditor"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/50 text-emerald-200 text-xs font-extrabold hover:border-cyan-300 transition-all"
          >
            <Layers className="w-4 h-4 text-emerald-300" />
            Audit 1–500+ Page Bill Instead
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
              Pan-India Wholesale & Audit Index
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              19,300+ pincodes indexed · Mod-36 GSTIN verified suppliers · 15/85 UPI Escrow protected
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 border border-emerald-500/35 rounded-xl px-4 py-2.5 shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-200">City Scope: {city}</span>
          </div>
        </div>

        {/* Search Input + City Scope */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-3 relative flex items-center bg-slate-900 border border-cyan-500/40 rounded-xl overflow-hidden shadow-lg shadow-cyan-950/20">
            <Search className="ml-4 w-5 h-5 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search "560001 ICU Bill", "OPC-53 Cement", "Jan Aushadhi", or "22K Gold"...'
              className="w-full bg-transparent py-3.5 px-3 outline-none font-semibold text-sm text-white placeholder-slate-400"
            />
            <button
              type="submit"
              className="mr-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0"
            >
              <Zap className="w-3.5 h-3.5" /> Scan
            </button>
          </div>

          <select
            aria-label="Filter by City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold text-white outline-none focus:border-cyan-400"
          >
            <option value="All India">All India (19,300+ Pincodes)</option>
            <option value="Bengaluru">Bengaluru (560001)</option>
            <option value="Delhi NCR">Delhi NCR (110001)</option>
            <option value="Mumbai">Mumbai (400002)</option>
            <option value="Hyderabad">Hyderabad (500001)</option>
            <option value="Madanapalle">Madanapalle (517325)</option>
          </select>
        </form>

        {/* 1-Tap Sector Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {SECTOR_CHIPS.map((chip, idx) => {
            const chipColors = [
              'from-emerald-500 to-cyan-500',
              'from-rose-500 to-orange-500',
              'from-amber-500 to-yellow-500',
              'from-cyan-500 to-blue-500',
              'from-violet-500 to-fuchsia-500',
              'from-lime-500 to-emerald-500',
            ];
            const isSelected = activeChip === chip;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setActiveChip(chip);
                  const nextQ = chip === 'All Sectors' ? '' : chip;
                  setQuery(nextQ);
                  runSearch(nextQ || 'All Sectors');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${chipColors[idx % chipColors.length]} text-slate-950 border-white/30`
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-600'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>

        {/* Regional Zone Rate Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ZONE_WHOLESALE_INDEX.slice(0, 3).map((z, idx) => {
            const top = z.benchmarks[0];
            const themes = [
              'from-emerald-950/50 to-cyan-950/40 border-emerald-500/35',
              'from-amber-950/50 to-orange-950/40 border-amber-500/35',
              'from-violet-950/50 to-indigo-950/40 border-violet-500/35',
            ];
            return (
              <div
                key={z.zone}
                className={`bg-gradient-to-br ${themes[idx % themes.length]} border rounded-xl p-4 space-y-1`}
              >
                <p className="text-[11px] font-mono text-cyan-300 font-bold">
                  {z.zone} · {z.pincodesCovered.toLocaleString('en-IN')} pincodes
                </p>
                <p className="text-sm font-bold text-white">{top.item}</p>
                <p className="text-xs text-slate-300 tabular-nums">
                  <span className="line-through text-rose-300 mr-2">{top.retailRate}</span>
                  <span className="text-emerald-300 font-extrabold">{top.nearmeWholesaleRate}</span>
                  <span className="ml-2 text-amber-300 font-bold">(-{top.savingsPct}%)</span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Verified Supplier & Deal Results */}
        {loading ? (
          <div className="text-center py-16 flex flex-col items-center">
            <div className="w-14 h-14 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
            <div className="text-lg font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              Scanning verified wholesale & hospital schedules...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {results.map((shop, i) => {
              const cardGradients = [
                'from-emerald-950/40 via-slate-900/95 to-cyan-950/35 border-emerald-500/35',
                'from-blue-950/40 via-slate-900/95 to-indigo-950/35 border-blue-500/35',
                'from-amber-950/40 via-slate-900/95 to-orange-950/35 border-amber-500/35',
                'from-violet-950/40 via-slate-900/95 to-fuchsia-950/35 border-violet-500/35',
              ];
              return (
                <div
                  key={`${shop.name}-${i}`}
                  className={`bg-gradient-to-br ${cardGradients[i % cardGradients.length]} border p-5 rounded-2xl transition-all flex flex-col justify-between gap-4`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-11 h-11 bg-slate-950 rounded-xl flex items-center justify-center border border-cyan-500/30 text-cyan-300 shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-400/30 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums">
                        <Star className="w-3.5 h-3.5 fill-current" /> {shop.rating}
                      </div>
                    </div>

                    <h3 className="font-black text-lg text-white mb-1">{shop.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                      <span className="flex items-center gap-1 text-cyan-300 font-mono">
                        <MapPin className="w-3.5 h-3.5" /> {shop.distance}
                      </span>
                      <span>·</span>
                      <span className="text-emerald-300 font-bold">
                        {shop.verified ? 'Mod-36 GST Verified' : 'Local Partner'}
                      </span>
                      {shop.gstin && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-amber-200">{shop.gstin}</span>
                        </>
                      )}
                    </div>
                    {shop.category && (
                      <p className="text-xs text-slate-400 mt-1.5">{shop.category}</p>
                    )}
                  </div>

                  <div className="bg-slate-950/85 rounded-xl p-4 border border-white/10 space-y-3">
                    <div className="flex justify-between items-baseline tabular-nums">
                      <span className="text-xs text-slate-400 line-through">
                        Retail: ₹{shop.retailPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xl font-black text-emerald-300">
                        ₹{shop.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => requireAuth(() => lockDeal(shop))}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      Lock Wholesale Rate via 15/85 Escrow <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
