'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  TrendingDown,
  Users,
  ArrowRight,
  ShieldCheck,
  Bot,
  Banknote,
} from 'lucide-react';
import NearMePlatform from '@/components/NearMePlatform';
import { COPY_BY_LANG, normalizeLang } from '@/lib/i18n';
import { SEEDED_MERCHANTS } from '@/lib/seeded-marketplace';
import type { SupportedLang } from '@/lib/autonomousStore';
import { useToast } from '@/components/Toast';

const REGIONAL_LOOPS = [
  {
    region: 'Bengaluru · 560001',
    title: 'Corporate ICU & Consumables Strip Loop',
    before: '₹15,42,000',
    after: '₹9,86,500',
    saved: '₹5,55,500 saved (-36%)',
    href: '/services/560001/hospital-bill-audit',
    cardTheme:
      'bg-gradient-to-br from-rose-950/45 via-slate-900/90 to-emerald-950/40 border-rose-500/35 hover:border-rose-400/70',
    regionColor: 'text-rose-300',
    afterColor: 'text-emerald-300',
    savedColor: 'text-cyan-300',
  },
  {
    region: 'Delhi NCR · 110001',
    title: 'OPC-53 Direct Rake Cement + Fe-550D Loop',
    before: '₹435 / bag',
    after: '₹358 / bag',
    saved: '₹77 / bag saved (-18%)',
    href: '/services/110001/wholesale-cement-tmt',
    cardTheme:
      'bg-gradient-to-br from-amber-950/45 via-slate-900/90 to-orange-950/40 border-amber-500/35 hover:border-amber-400/70',
    regionColor: 'text-amber-300',
    afterColor: 'text-amber-300',
    savedColor: 'text-emerald-300',
  },
  {
    region: 'Mumbai · 400002',
    title: '22K Hallmarked Bullion Making Strip',
    before: '18.0% making',
    after: '8.2% making',
    saved: '54% making cut locked',
    href: '/services/400002/gold-bullion-making',
    cardTheme:
      'bg-gradient-to-br from-violet-950/45 via-slate-900/90 to-fuchsia-950/40 border-violet-500/35 hover:border-violet-400/70',
    regionColor: 'text-violet-300',
    afterColor: 'text-fuchsia-300',
    savedColor: 'text-amber-300',
  },
];

const NEIGHBORHOOD_SYNDICATES = [
  {
    pincode: '560001 · Bengaluru Central',
    pool: 'Cardiac & Ortho Generic Jan Aushadhi Pool',
    membersJoined: 42,
    targetMembers: 50,
    discountLocked: '38% Below Retail MRP',
    orderPoolInr: '₹6,40,000',
    cardTheme: 'bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-blue-950/40 border-cyan-500/35',
    barTheme: 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500',
    labelColor: 'text-cyan-300',
  },
  {
    pincode: '110001 · NCR Builders Syndicate',
    pool: '1,200 Bag Direct Factory Cement Rake',
    membersJoined: 19,
    targetMembers: 20,
    discountLocked: '18% Mill-Direct Rate',
    orderPoolInr: '₹14,20,000',
    cardTheme: 'bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-rose-950/35 border-amber-500/35',
    barTheme: 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500',
    labelColor: 'text-amber-300',
  },
  {
    pincode: '517325 · Madanapalle Kisan Cluster',
    pool: 'ISI 16mm Drip Laterals & NPK Fertilizer',
    membersJoined: 31,
    targetMembers: 35,
    discountLocked: '32% Mandi Direct Cut',
    orderPoolInr: '₹4,95,000',
    cardTheme: 'bg-gradient-to-br from-emerald-950/45 via-slate-900/90 to-teal-950/40 border-emerald-500/35',
    barTheme: 'bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-500',
    labelColor: 'text-emerald-300',
  },
];

const ORDER_CARD_THEMES = [
  'bg-gradient-to-br from-emerald-950/40 via-slate-900/95 to-cyan-950/35 border-emerald-500/35',
  'bg-gradient-to-br from-indigo-950/40 via-slate-900/95 to-violet-950/35 border-indigo-500/35',
  'bg-gradient-to-br from-amber-950/35 via-slate-900/95 to-orange-950/35 border-amber-500/35',
];

export default function Home() {
  const [lang, setLang] = useState<SupportedLang>('EN');
  const [joinedSyndicates, setJoinedSyndicates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    setLang(normalizeLang(localStorage.getItem('nearme_lang')));
    const handler = (e: Event) => {
      const custom = e as CustomEvent<SupportedLang>;
      setLang(normalizeLang(custom.detail));
    };
    window.addEventListener('nearme-lang-change', handler);
    return () => window.removeEventListener('nearme-lang-change', handler);
  }, []);

  const handleJoinSyndicate = (pincode: string, poolName: string) => {
    setJoinedSyndicates((prev) => {
      const nextState = !prev[pincode];
      toast(
        nextState
          ? `Joined Syndicate Pool (${pincode}): ${poolName} — Wholesale rate locked!`
          : `Left Syndicate Pool (${pincode})`,
        nextState ? 'success' : 'info'
      );
      return { ...prev, [pincode]: nextState };
    });
  };

  const copy = COPY_BY_LANG[lang];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-x-clip">
      {/* Ambient Multi-Hue Aurora Mesh Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/4 w-[34rem] h-[34rem] rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute top-12 right-1/5 w-[28rem] h-[28rem] rounded-full bg-cyan-500/12 blur-3xl" />
        <div className="absolute top-72 left-1/2 -translate-x-1/2 w-[36rem] h-[20rem] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-24 right-1/4 w-[30rem] h-[26rem] rounded-full bg-violet-500/12 blur-3xl" />
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {/* Clean Design #2 Hero — Vibrant multi-color typography + luminous CTAs */}
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-balance bg-gradient-to-r from-white via-emerald-200 via-cyan-200 to-amber-200 bg-clip-text text-transparent">
            {copy.heroTitle}
          </h1>
          <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {copy.heroSubtitle}
          </p>

          <div className="max-w-2xl mx-auto pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/search"
              className="flex-1 flex items-center gap-3 bg-slate-900/90 border border-cyan-500/40 hover:border-emerald-400 rounded-xl px-4 py-3.5 text-left transition-all shadow-lg shadow-emerald-950/30"
            >
              <Search className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-sm text-slate-300 truncate flex-1">
                {copy.searchPlaceholder}
              </span>
              <span className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 text-xs font-extrabold rounded-lg shrink-0">
                {copy.searchCta}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('nearme-open-support'))}
              className="px-4 py-3.5 bg-gradient-to-r from-violet-600/30 to-indigo-600/30 hover:from-violet-600/45 hover:to-indigo-600/45 border border-violet-400/50 text-violet-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-all shadow-lg shadow-violet-950/30"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              {copy.supportButton}
            </button>
          </div>
        </section>

        {/* Primary Interactive Platform: 4 Color-Coded Pillars + Unlimited-Page Streamer */}
        <section id="auditor" className="w-full">
          <NearMePlatform lang={lang} />
        </section>

        {/* Regional Price-Slash Loops */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              {copy.loopsTitle}
            </h2>
            <Link
              href="/search"
              className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
            >
              View All Loops <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REGIONAL_LOOPS.map((loop) => (
              <Link
                key={loop.region}
                href={loop.href}
                className={`${loop.cardTheme} border rounded-xl p-5 space-y-3 transition-all`}
              >
                <p className={`text-xs font-mono font-bold ${loop.regionColor}`}>{loop.region}</p>
                <h3 className="text-sm font-bold text-white">{loop.title}</h3>
                <div className="flex items-baseline justify-between pt-2 border-t border-white/10 tabular-nums">
                  <div>
                    <span className="text-xs text-slate-400 line-through mr-2">{loop.before}</span>
                    <span className={`text-base font-extrabold ${loop.afterColor}`}>{loop.after}</span>
                  </div>
                  <span className={`text-xs font-bold ${loop.savedColor}`}>{loop.saved}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Active Neighborhood Group-Buy Syndicates */}
        <section id="syndicates" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              {copy.syndicatesTitle}
            </h2>
            <span className="text-xs text-amber-300 font-mono font-bold">19,300+ Pincodes Active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {NEIGHBORHOOD_SYNDICATES.map((syn) => {
              const isJoined = !!joinedSyndicates[syn.pincode];
              const liveMembers = syn.membersJoined + (isJoined ? 1 : 0);
              const pct = Math.min(100, Math.round((liveMembers / syn.targetMembers) * 100));
              return (
                <div
                  key={syn.pincode}
                  className={`${syn.cardTheme} border rounded-xl p-5 space-y-3`}
                >
                  <p className={`text-xs font-mono font-bold ${syn.labelColor}`}>{syn.pincode}</p>
                  <h3 className="text-sm font-bold text-white">{syn.pool}</h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-300 tabular-nums">
                      <span>
                        {liveMembers}/{syn.targetMembers} buyers pooled
                      </span>
                      <span className="text-white font-bold">{syn.orderPoolInr}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950/80 rounded-full overflow-hidden border border-white/10">
                      <div
                        className={`h-full transition-all duration-300 ${syn.barTheme}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <span className="text-emerald-300 font-bold">{syn.discountLocked}</span>
                    <button
                      type="button"
                      onClick={() => handleJoinSyndicate(syn.pincode, syn.pool)}
                      className={`px-3 py-1 rounded-lg font-extrabold transition-all whitespace-nowrap shrink-0 ${
                        isJoined
                          ? 'bg-emerald-500/25 border border-emerald-400/60 text-emerald-200'
                          : 'bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/40 text-cyan-200'
                      }`}
                    >
                      {isJoined ? 'Joined Pool ✓' : 'Join Pool →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pan-India Cash Orders */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Banknote className="w-5 h-5 text-amber-400" />
              {copy.cashOrdersTitle}
            </h2>
            <Link
              href="/add-shop"
              className="text-xs font-semibold text-amber-300 hover:text-amber-200"
            >
              Onboard Your Shop (₹99/day AI Twin) →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SEEDED_MERCHANTS.slice(0, 3).map((m, idx) => (
              <div
                key={m.id}
                className={`${ORDER_CARD_THEMES[idx % ORDER_CARD_THEMES.length]} border rounded-xl p-5 flex flex-col justify-between gap-3`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span className="font-mono text-cyan-300">
                      {m.city} · {m.pincode}
                    </span>
                    <span className="text-emerald-300 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                      {m.trust_score}% Trust
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{m.business_name}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{m.category}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/10 tabular-nums">
                  <span className="text-sm font-bold text-amber-300">
                    ₹{(m.liveCashOrderInr || 42500).toLocaleString('en-IN')} Cash Order
                  </span>
                  <Link
                    href={`/merchant-claim/${m.id}`}
                    className="text-xs font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Claim Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Clean Compliance Footer */}
      <footer className="w-full bg-slate-950/90 border-t border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="font-semibold text-slate-200">
            NearMe India · Built in Bengaluru, Karnataka · https://www.nearme-india.org
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-white">Refund Policy</Link>
            <Link href="/shipping-policy" className="hover:text-white">Shipping Policy</Link>
            <Link href="/contact" className="text-emerald-300 hover:text-emerald-200 font-semibold">
              24/7 Self-Support
            </Link>
            <Link href="/owner" className="text-violet-300 hover:text-violet-200 font-semibold">
              Founder Console
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} NearMe India</p>
        </div>
      </footer>
    </div>
  );
}
