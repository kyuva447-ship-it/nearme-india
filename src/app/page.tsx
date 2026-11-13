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

const REGIONAL_LOOPS = [
  {
    region: 'Bengaluru · 560001',
    title: 'Corporate ICU & Consumables Strip Loop',
    before: '₹15,42,000',
    after: '₹9,86,500',
    saved: '₹5,55,500 saved (-36%)',
    href: '/services/560001/hospital-bill-audit',
  },
  {
    region: 'Delhi NCR · 110001',
    title: 'OPC-53 Direct Rake Cement + Fe-550D Loop',
    before: '₹435 / bag',
    after: '₹358 / bag',
    saved: '₹77 / bag saved (-18%)',
    href: '/services/110001/wholesale-cement-tmt',
  },
  {
    region: 'Mumbai · 400002',
    title: '22K Hallmarked Bullion Making Strip',
    before: '18.0% making',
    after: '8.2% making',
    saved: '54% making cut locked',
    href: '/services/400002/gold-bullion-making',
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
  },
  {
    pincode: '110001 · NCR Builders Syndicate',
    pool: '1,200 Bag Direct Factory Cement Rake',
    membersJoined: 19,
    targetMembers: 20,
    discountLocked: '18% Mill-Direct Rate',
    orderPoolInr: '₹14,20,000',
  },
  {
    pincode: '517325 · Madanapalle Kisan Cluster',
    pool: 'ISI 16mm Drip Laterals & NPK Fertilizer',
    membersJoined: 31,
    targetMembers: 35,
    discountLocked: '32% Mandi Direct Cut',
    orderPoolInr: '₹4,95,000',
  },
];

export default function Home() {
  const [lang, setLang] = useState<SupportedLang>('EN');

  useEffect(() => {
    setLang(normalizeLang(localStorage.getItem('nearme_lang')));
    const handler = (e: Event) => {
      const custom = e as CustomEvent<SupportedLang>;
      setLang(normalizeLang(custom.detail));
    };
    window.addEventListener('nearme-lang-change', handler);
    return () => window.removeEventListener('nearme-lang-change', handler);
  }, []);

  const copy = COPY_BY_LANG[lang];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {/* Clean Design #2 Hero — No duplicate header, no directory tiles, no micro-pass grid */}
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] text-balance">
            {copy.heroTitle}
          </h1>
          <p className="text-sm sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {copy.heroSubtitle}
          </p>

          <div className="max-w-2xl mx-auto pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/search"
              className="flex-1 flex items-center gap-3 bg-gray-900 border border-gray-800 hover:border-emerald-500/60 rounded-xl px-4 py-3.5 text-left transition-colors"
            >
              <Search className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-sm text-gray-400 truncate flex-1">
                {copy.searchPlaceholder}
              </span>
              <span className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shrink-0">
                {copy.searchCta}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('nearme-open-support'))}
              className="px-4 py-3.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-emerald-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
            >
              <Bot className="w-4 h-4" />
              {copy.supportButton}
            </button>
          </div>
        </section>

        {/* Primary Interactive Platform: 4 Main Navigation Tabs + Unlimited-Page Streamer */}
        <section id="auditor" className="w-full">
          <NearMePlatform lang={lang} />
        </section>

        {/* Regional Price-Slash Loops */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              {copy.loopsTitle}
            </h2>
            <Link
              href="/search"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View All Loops <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REGIONAL_LOOPS.map((loop) => (
              <Link
                key={loop.region}
                href={loop.href}
                className="bg-gray-900/70 border border-gray-800 hover:border-emerald-500/40 rounded-xl p-5 space-y-3 transition-colors"
              >
                <p className="text-xs font-mono text-gray-400">{loop.region}</p>
                <h3 className="text-sm font-bold text-white">{loop.title}</h3>
                <div className="flex items-baseline justify-between pt-2 border-t border-gray-800/80 tabular-nums">
                  <div>
                    <span className="text-xs text-gray-500 line-through mr-2">{loop.before}</span>
                    <span className="text-base font-extrabold text-emerald-400">{loop.after}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-300">{loop.saved}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Active Neighborhood Group-Buy Syndicates */}
        <section id="syndicates" className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              {copy.syndicatesTitle}
            </h2>
            <span className="text-xs text-gray-400 font-mono">19,300+ Pincodes Active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {NEIGHBORHOOD_SYNDICATES.map((syn) => {
              const pct = Math.min(100, Math.round((syn.membersJoined / syn.targetMembers) * 100));
              return (
                <div
                  key={syn.pincode}
                  className="bg-gray-900/70 border border-gray-800 rounded-xl p-5 space-y-3"
                >
                  <p className="text-xs font-mono text-emerald-400">{syn.pincode}</p>
                  <h3 className="text-sm font-bold text-white">{syn.pool}</h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-400 tabular-nums">
                      <span>
                        {syn.membersJoined}/{syn.targetMembers} buyers pooled
                      </span>
                      <span className="text-white font-semibold">{syn.orderPoolInr}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-800/80 text-xs">
                    <span className="text-emerald-300 font-semibold">{syn.discountLocked}</span>
                    <Link
                      href="/search"
                      className="font-bold text-white hover:text-emerald-400 transition-colors"
                    >
                      Join Pool →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pan-India Cash Orders */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-400" />
              {copy.cashOrdersTitle}
            </h2>
            <Link
              href="/add-shop"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Onboard Your Shop (₹99/day AI Twin) →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SEEDED_MERCHANTS.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className="bg-gray-900/70 border border-gray-800 rounded-xl p-5 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span className="font-mono">
                      {m.city} · {m.pincode}
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                      {m.trust_score}% Trust
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{m.business_name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{m.category}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-800/80 tabular-nums">
                  <span className="text-sm font-bold text-emerald-400">
                    ₹{(m.liveCashOrderInr || 42500).toLocaleString('en-IN')} Cash Order
                  </span>
                  <Link
                    href={`/merchant-claim/${m.id}`}
                    className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition-colors"
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
      <footer className="w-full bg-gray-950 border-t border-gray-800/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p className="font-semibold text-gray-300">
            NearMe India · https://www.nearme-india.org · Autonomous Pan-India B2B & Bill Audit Network
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-white">Refund Policy</Link>
            <Link href="/shipping-policy" className="hover:text-white">Shipping Policy</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/owner" className="text-emerald-400 hover:text-emerald-300 font-semibold">
              Founder Console
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} NearMe India</p>
        </div>
      </footer>
    </div>
  );
}
