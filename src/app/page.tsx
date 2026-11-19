'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  TrendingDown,
  Users,
  ArrowRight,
  ShieldCheck,
  Bot,
  Banknote,
  HelpCircle,
  ChevronDown,
  Store,
  CheckCircle2,
  Lock,
  FileCheck2,
  PhoneCall,
  QrCode,
} from 'lucide-react';
import NearMePlatform from '@/components/NearMePlatform';
import { COPY_BY_LANG, normalizeLang } from '@/lib/i18n';
import { SEEDED_MERCHANTS } from '@/lib/seeded-marketplace';
import type { SupportedLang } from '@/lib/autonomousStore';
import { useToast } from '@/components/Toast';

const POPULAR_SERVICE_LINKS = [
  { label: 'Plumber', href: '/search?q=Plumber' },
  { label: 'Electrician', href: '/search?q=Electrician' },
  { label: 'Tailor', href: '/search?q=Tailor' },
  { label: 'Diagnostic Lab', href: '/search?q=Diagnostic+Lab' },
  { label: 'AC Repair', href: '/search?q=AC+Repair' },
  { label: 'Hospital Bill Audit', href: '/search?q=Hospital+ICU' },
  { label: 'Madanapalle Pros', href: '/search?q=Madanapalle&city=Madanapalle' },
];

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

const FAQ_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is NearMe India and how does the platform work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NearMe India (https://www.nearme-india.org) connects customers across 19,300+ Indian pincodes with GST/KYC-verified local professionals, wholesale suppliers, an unlimited-page hospital and contractor Bill Stripper, and 15/85 UPI Escrow protection.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many pages can the NearMe India Bill Stripper audit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The client-side File.slice() streaming indexer supports 1 to 500+ page PDFs, Excel/CSV ledgers, and multi-photo bills without payload crashes, spotting overcharges against NPPA and CGHS rates in roughly 60 seconds.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which local services and cities are available on NearMe India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can search and book verified Plumbers, Electricians, Tailors, Diagnostic Labs, AC Repair technicians, Carpenters, and wholesale suppliers across India—including Bengaluru (560001), Madanapalle (517325), Delhi NCR, Mumbai, Hyderabad, and Chennai.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do local businesses list for free and receive customer leads?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Shop owners and service pros can claim their profile free in 30 seconds under "List Your Business (Free)" to receive 2 complimentary customer leads. Additional leads unlock for ₹49 in the Merchant Dashboard, and Verified Pro (₹299/month) ranks listings first.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the 15/85 UPI Escrow and 48-Hour Refund Guarantee work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '15% is held as platform audit escrow and 85% settles to verified merchants on 6-digit Delivery OTP confirmation, backed by an automated 48-hour refund guarantee.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where can I track my escrow order or verify Delivery OTP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Use "Track Escrow" in the top navigation bar to check active escrow milestones, verify merchant GSTIN and MSME 43B(h) payout readiness, enter your 6-digit Delivery OTP, or claim an automated 48-hour refund.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if I do not receive an SMS or WhatsApp OTP when signing in?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Enter your 10-digit Indian mobile number in the Sign In dialog (Name and Email are optional). If external SMS or WhatsApp delivery is unavailable, our Zero-Lockout fallback automatically displays an "Instant One-Tap Verify" code right on screen.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the platform fees and unlock charges?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Searching services and previewing bill scans is free. Full 1–500+ page audit reports and IRDAI/TPA rebuttal drafts unlock for ₹199 (quick unlocks ₹49), and completed escrow contracts carry a transparent 5% platform fee.',
      },
    },
  ],
} as const;

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<SupportedLang>('EN');
  const [heroQuery, setHeroQuery] = useState('');
  const [joinedSyndicates, setJoinedSyndicates] = useState<Record<string, boolean>>({});
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
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

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const savedCity = localStorage.getItem('nearme_city') || 'All India';
    const params = new URLSearchParams();
    if (heroQuery.trim()) params.set('q', heroQuery.trim());
    if (savedCity && savedCity !== 'All India') params.set('city', savedCity);
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : '/search');
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
        {/* Clean Design #2 Hero — Vibrant multi-color typography + live service search */}
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-balance bg-gradient-to-r from-white via-emerald-200 via-cyan-200 to-amber-200 bg-clip-text text-transparent">
            {copy.heroTitle}
          </h1>
          <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {copy.heroSubtitle}
          </p>

          <div className="max-w-2xl mx-auto pt-2 flex flex-col sm:flex-row gap-3">
            <form
              onSubmit={handleHeroSearch}
              className="flex-1 flex items-center gap-3 bg-slate-900/90 border border-cyan-500/40 focus-within:border-emerald-400 rounded-xl px-4 py-2 transition-all shadow-lg shadow-emerald-950/30"
            >
              <Search className="w-5 h-5 text-cyan-400 shrink-0" />
              <input
                type="text"
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
                placeholder={copy.searchPlaceholder}
                aria-label="Search local services or bills"
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none py-1.5"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-extrabold rounded-lg shrink-0 transition-all"
              >
                {copy.searchCta}
              </button>
            </form>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('nearme-open-support'))}
              className="px-4 py-3.5 bg-gradient-to-r from-violet-600/30 to-indigo-600/30 hover:from-violet-600/45 hover:to-indigo-600/45 border border-violet-400/50 text-violet-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-all shadow-lg shadow-violet-950/30"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              {copy.supportButton}
            </button>
          </div>

          {/* Instant 1-Click Local Service Directory Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Popular Services:</span>
            {POPULAR_SERVICE_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/60 text-xs font-bold text-slate-200 hover:text-cyan-200 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Simple 3-Step Guide: Anyone understands the platform in 3 seconds */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-5xl mx-auto">
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-white">{copy.step1Title}</h2>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{copy.step1Desc}</p>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-4 flex items-start gap-3">
            <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 font-black text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-white">{copy.step2Title}</h2>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{copy.step2Desc}</p>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-white">{copy.step3Title}</h2>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{copy.step3Desc}</p>
            </div>
          </div>
        </section>

        {/* New Visitor Guide: Clear explanation for Customers & Business Owners */}
        <section id="how-it-works" className="space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              First Time on NearMe India?
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              How NearMe India Works for Customers &amp; Local Businesses
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Built in Bengaluru for 19,300+ Indian pincodes — verify local shops, cut unfair bill markups, get direct business leads, and protect every rupee in Razorpay Escrow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* For Customers & Buyers */}
            <div className="bg-slate-900/90 border border-cyan-500/35 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">For Customers &amp; Buyers</h3>
                    <p className="text-[11px] text-cyan-300">Save money &amp; hire verified local pros safely</p>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Find Trusted Local Pros:</strong> Search Plumbers, Electricians, Diagnostic Labs, Cement &amp; Wholesale Dealers verified by GSTIN checksums.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Audit Any Bill (1–500+ Pages):</strong> Upload hospital or contractor bills to spot extra charges against NPPA/CGHS &amp; mandi rates in ~60 seconds.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">15/85 Razorpay Escrow Protection:</strong> Pay safely without fear of fraud — funds unlock only after you verify work with your 6-digit Delivery OTP, backed by a 48-hour refund guarantee.
                  </span>
                </li>
              </ul>

              <div className="flex flex-wrap gap-2.5 pt-2">
                <Link
                  href="/search"
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors"
                >
                  Find Local Services <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/escrow"
                  className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> Track Escrow &amp; OTP
                </Link>
              </div>
            </div>

            {/* For Shop Owners & Service Businesses */}
            <div className="bg-slate-900/90 border border-emerald-500/35 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <Store className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">For Shop Owners &amp; Service Pros</h3>
                    <p className="text-[11px] text-emerald-300">Get direct customer phone numbers &amp; guaranteed payouts</p>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Claim Free + 2 Free Customer Leads:</strong> List or claim your shop in 30 seconds with zero upfront payment and receive 2 free verified buyer leads immediately.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Simple Pay-Per-Lead (₹49):</strong> Unlock extra verified customer calls only when you want them, or upgrade to Verified Pro (₹299/month) to rank #1 in your city.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Guaranteed Escrow &amp; GST Trust Badge:</strong> Verify your GSTIN to boost your Trust Score and receive buyer-committed Razorpay escrow orders settled on Delivery OTP.
                  </span>
                </li>
              </ul>

              <div className="flex flex-wrap gap-2.5 pt-2">
                <Link
                  href="/claim"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors"
                >
                  Claim Free Profile (2 Free Leads) <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/card"
                  className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-200 text-xs font-extrabold flex items-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-300" /> Free Shop QR Standee
                </Link>
                <Link
                  href="/shops"
                  className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  Live Shop Directory
                </Link>
              </div>
            </div>
          </div>

          {/* 4-Pillar Trust & Legitimacy Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-300">
                <Lock className="w-4 h-4 shrink-0" /> Razorpay Live Checkout
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All UPI, Card, and Escrow payments are processed through encrypted Razorpay Live checkout—never raw bank transfers to strangers.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-300">
                <FileCheck2 className="w-4 h-4 shrink-0" /> GSTIN Mod-36 Verification
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Businesses can verify their 15-character GSTIN using Mod-36 checksum validation so customers know who they are dealing with.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300">
                <ShieldCheck className="w-4 h-4 shrink-0" /> 6-Digit OTP + 48h Refund
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Escrow funds release only after 6-digit Delivery OTP confirmation, with an automated 48-hour refund policy on unfulfilled orders.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-violet-300">
                <PhoneCall className="w-4 h-4 shrink-0" /> 6-Language Self-Support
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                24/7 support across English, Hindi, Kannada, Tamil, Telugu, and Marathi, plus full public <Link href="/about" className="underline text-violet-200">About</Link> &amp; <Link href="/refund-policy" className="underline text-violet-200">Refund Policy</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* Primary Interactive Platform: 4 Color-Coded Pillars + Unlimited-Page Streamer */}
        <section id="auditor" className="w-full">
          <NearMePlatform lang={lang} />
        </section>

        {/* Regional Price-Slash Loops */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-400" />
                {copy.loopsTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real examples showing how much money users saved after removing hidden bill markups
              </p>
            </div>
            <Link
              href="/search"
              className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
            >
              View All Examples <ArrowRight className="w-3.5 h-3.5" />
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

        {/* Accordion FAQ Section (mirrors Schema.org FAQPage structured data format) */}
        <section id="faq" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Clear answers about the NearMe India platform, verified local services, and 15/85 UPI Escrow protection
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('nearme-open-support'))}
              className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 flex items-center gap-1"
            >
              Ask 24/7 Self-Support <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {FAQ_STRUCTURED_DATA.mainEntity.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              const panelId = `faq-panel-${idx}`;
              const headerId = `faq-header-${idx}`;
              return (
                <div
                  key={faq.name}
                  className={`rounded-xl border transition-colors ${
                    isOpen
                      ? 'bg-slate-900/95 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    id={headerId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
                  >
                    <span className="text-sm sm:text-base font-bold text-white">
                      {faq.name}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={headerId}
                      className="px-5 pb-4 pt-1 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed"
                    >
                      {faq.acceptedAnswer.text}
                    </div>
                  )}
                </div>
              );
            })}
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
            <Link href="/shops" className="text-cyan-300 hover:text-cyan-200 font-semibold">Live Shops Directory</Link>
            <Link href="/card" className="text-amber-300 hover:text-amber-200 font-semibold">Free Shop QR Card</Link>
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
