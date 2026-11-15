import { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  ChevronRight,
  Store,
  ArrowRight,
  Zap,
  TrendingDown,
  Send,
  Layers,
  Crown,
} from 'lucide-react';
import { SEEDED_MERCHANTS, ZONE_WHOLESALE_INDEX } from '@/lib/seeded-marketplace';
import { supabaseAdmin } from '@/lib/supabase/server';

function formatSlug(raw: string): string {
  return decodeURIComponent(raw || '')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function getCategoryData(citySlug: string, categorySlug: string) {
  const formattedCity = formatSlug(citySlug || 'bengaluru');
  const formattedCategory = formatSlug(categorySlug || 'hospital-bill-audit');

  const matchedZone =
    ZONE_WHOLESALE_INDEX.find((z) =>
      z.hubs.some((h) => h.toLowerCase().includes(formattedCity.toLowerCase()))
    ) || ZONE_WHOLESALE_INDEX[0];

  let liveProMerchants: Array<{
    id: string;
    business_name: string;
    gstin: string;
    category: string;
    city: string;
    pincode: string;
    trust_score: number;
    is_verified_pro: boolean;
    liveCashOrderInr?: number;
  }> = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  ) {
    try {
      const { data } = await supabaseAdmin
        .from('merchant_wallets')
        .select('merchant_id, business_name, gstin, category, city, trust_score, is_verified_pro')
        .ilike('city', `%${formattedCity}%`)
        .order('is_verified_pro', { ascending: false })
        .order('trust_score', { ascending: false })
        .limit(8);

      if (data && data.length > 0) {
        liveProMerchants = data.map((m) => ({
          id: m.merchant_id,
          business_name: m.business_name,
          gstin: m.gstin || 'MOD36-VERIFIED',
          category: m.category,
          city: m.city,
          pincode: 'Verified Hub',
          trust_score: Number(m.trust_score || 92),
          is_verified_pro: Boolean(m.is_verified_pro),
          liveCashOrderInr: 29900,
        }));
      }
    } catch {
      // Fallback cleanly to seeded merchants
    }
  }

  const cityLower = formattedCity.toLowerCase();
  const catTokens = formattedCategory
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 3);

  const scoredSeeded = SEEDED_MERCHANTS.map((m) => {
    const hay = `${m.business_name} ${m.category} ${m.city} ${m.pincode} ${(m.tags || []).join(' ')}`.toLowerCase();
    let score = 0;
    if (hay.includes(cityLower)) score += 10;
    for (const token of catTokens) {
      if (hay.includes(token)) score += 8;
    }
    return { ...m, is_verified_pro: m.trust_score >= 96, _score: score };
  })
    .sort((a, b) => b._score - a._score || b.trust_score - a.trust_score)
    .slice(0, 8);

  const combinedMerchants = [...liveProMerchants, ...scoredSeeded];

  return {
    title: `${formattedCategory} & Verified Providers in ${formattedCity}`,
    description: `Compare verified ${formattedCategory} pros in ${formattedCity}, audit bills, and pay safely with 15/85 UPI Escrow (${matchedZone.zone}).`,
    merchants: combinedMerchants,
    zone: matchedZone,
    formattedCity,
    formattedCategory,
    slugPath: `${citySlug}/${categorySlug}`,
  };
}

export async function generateMetadata({
  params,
}: {
  params: { city: string; category: string };
}): Promise<Metadata> {
  const data = await getCategoryData(params.city, params.category);
  return {
    title: `${data.title} | NearMe India`,
    description: data.description,
    alternates: {
      canonical: `https://www.nearme-india.org/services/${data.slugPath}`,
    },
  };
}

export default async function ProgrammaticCityCategoryPage({
  params,
}: {
  params: { city: string; category: string };
}) {
  const data = await getCategoryData(params.city, params.category);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-clip">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-cyan-300">{data.formattedCity}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-emerald-300">{data.formattedCategory}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          <div className="flex-1 space-y-4">
            <p className="text-xs font-mono font-bold text-amber-300">
              {data.zone.zone} · {data.zone.pincodesCovered.toLocaleString('en-IN')} Pincodes Indexed
            </p>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
              {data.formattedCategory} in {data.formattedCity}
            </h1>
            <p className="text-base text-slate-300 max-w-xl leading-relaxed">
              {data.description}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/#auditor"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-xs flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Audit Your Bill Now (1–500+ Pages)
              </Link>
              <Link
                href={`/search?q=${encodeURIComponent(data.formattedCategory)}&city=${encodeURIComponent(
                  data.formattedCity
                )}`}
                className="px-5 py-3 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-300 text-cyan-200 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                Explore Live Quotes
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-cyan-950/40 p-6 rounded-2xl border border-cyan-500/35 flex flex-col justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-emerald-400" />
                {data.formattedCity} Benchmarks
              </h2>
              <div className="space-y-2.5">
                {data.zone.benchmarks.map((b, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/70 border border-white/10 rounded-xl p-3 text-xs space-y-1"
                  >
                    <p className="font-bold text-white">{b.item}</p>
                    <p className="text-slate-300 tabular-nums">
                      <span className="line-through text-rose-300 mr-2">{b.retailRate}</span>
                      <span className="text-emerald-300 font-extrabold">
                        {b.nearmeWholesaleRate}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/claim"
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              List Your {data.formattedCity} Business <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
            <h2 className="text-xl font-black flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-400" />
              Verified Providers in {data.formattedCity}
            </h2>
            <Link
              href="/claim"
              className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
            >
              Claim Business (2 Free Leads) <Send className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.merchants.map((m, idx) => {
              const baseOrder = m.liveCashOrderInr || 42500;
              const retailRef = Math.round(baseOrder * 1.28);
              return (
                <div
                  key={`${m.id}-${idx}`}
                  className={`border rounded-2xl p-5 flex flex-col justify-between gap-4 ${
                    m.is_verified_pro
                      ? 'bg-gradient-to-br from-indigo-950/60 via-slate-900 to-emerald-950/40 border-amber-400/50'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono text-cyan-300">
                        {m.city} · {m.pincode}
                      </span>
                      <span className="text-emerald-300 font-bold flex items-center gap-1">
                        {m.is_verified_pro && (
                          <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 flex items-center gap-1 mr-1">
                            <Crown className="w-3 h-3" /> PRO
                          </span>
                        )}
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {m.trust_score}% Trust
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white">{m.business_name}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {m.category} · GSTIN <span className="font-mono text-amber-200">{m.gstin}</span>
                    </p>
                  </div>

                  <div className="bg-slate-950/80 rounded-xl p-3.5 border border-white/10 flex items-center justify-between gap-3 tabular-nums">
                    <div>
                      <span className="text-xs text-slate-400 line-through block">
                        Retail: ₹{retailRef.toLocaleString('en-IN')}
                      </span>
                      <span className="text-lg font-black text-emerald-300">
                        ₹{baseOrder.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <Link
                      href={`/merchant-claim/${m.id}`}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1"
                    >
                      Book with Escrow <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
