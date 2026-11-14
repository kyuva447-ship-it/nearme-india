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
} from 'lucide-react';
import { SEEDED_MERCHANTS, ZONE_WHOLESALE_INDEX } from '@/lib/seeded-marketplace';

async function getCategoryData(rawSlugs?: string[]) {
  const slugs =
    Array.isArray(rawSlugs) && rawSlugs.length > 0
      ? rawSlugs
      : ['all-india', 'hospital-bill-audit'];
  const city = slugs[0] || 'all-india';
  const category = slugs[1] || 'hospital-bill-audit';
  const formattedCity = city
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const formattedCategory = category
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const matchedZone =
    ZONE_WHOLESALE_INDEX.find((z) =>
      z.hubs.some((h) => h.toLowerCase().includes(formattedCity.toLowerCase()))
    ) || ZONE_WHOLESALE_INDEX[0];

  return {
    title: `${formattedCategory} & Wholesale Index in ${formattedCity}`,
    description: `Audit 1–500+ page hospital bills, strip contractor overcharges, and lock 15/85 UPI Escrow deals in ${formattedCity} (${matchedZone.zone}).`,
    merchants: SEEDED_MERCHANTS,
    zone: matchedZone,
    formattedCity,
    formattedCategory,
    slugPath: slugs.join('/'),
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[] };
}): Promise<Metadata> {
  const data = await getCategoryData(params?.slug);
  return {
    title: `${data.title} | NearMe India`,
    description: data.description,
    alternates: {
      canonical: `https://www.nearme-india.org/services/${data.slugPath}`,
    },
  };
}

export default async function CatchAllSEOPage({
  params,
}: {
  params: { slug?: string[] };
}) {
  const data = await getCategoryData(params?.slug);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-emerald-500/15 blur-3xl rounded-full" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-cyan-500/12 blur-3xl rounded-full" />
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-cyan-300">{data.formattedCity}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-emerald-300">{data.formattedCategory}</span>
        </nav>

        {/* Hero */}
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
                href={`/search?q=${encodeURIComponent(data.formattedCategory)}&city=${encodeURIComponent(data.formattedCity)}`}
                className="px-5 py-3 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-300 text-cyan-200 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                Explore Live Wholesale Quotes
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
                      <span className="text-emerald-300 font-extrabold">{b.nearmeWholesaleRate}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/merchant-claim/new"
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              Broadcast Order to {data.formattedCity} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Verified GSTIN Mod-36 Suppliers */}
        <section className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
            <h2 className="text-xl font-black flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-400" />
              Verified Wholesale & Institutional Nodes
            </h2>
            <Link
              href="/add-shop"
              className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
            >
              Onboard Shop (₹99/Day AI Twin) <Send className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.merchants.map((m, idx) => {
              const baseOrder = m.liveCashOrderInr || 42500;
              const retailRef = Math.round(baseOrder * 1.28);
              const gradients = [
                'from-emerald-950/40 via-slate-900 to-cyan-950/35 border-emerald-500/35',
                'from-amber-950/40 via-slate-900 to-orange-950/35 border-amber-500/35',
                'from-violet-950/40 via-slate-900 to-indigo-950/35 border-violet-500/35',
                'from-cyan-950/40 via-slate-900 to-blue-950/35 border-cyan-500/35',
              ];
              return (
                <div
                  key={m.id}
                  className={`bg-gradient-to-br ${gradients[idx % gradients.length]} border rounded-2xl p-5 flex flex-col justify-between gap-4`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono text-cyan-300">
                        {m.city} · {m.pincode}
                      </span>
                      <span className="text-emerald-300 font-bold flex items-center gap-1">
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
                      Claim 15/85 Escrow <ChevronRight className="w-3.5 h-3.5" />
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
