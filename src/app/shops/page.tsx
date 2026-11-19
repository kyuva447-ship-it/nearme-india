import Link from 'next/link';
import type { Metadata } from 'next';
import { Store, MapPin, ShieldCheck, QrCode, ArrowRight, CheckCircle2 } from 'lucide-react';
import { fetchPublicShops } from '@/lib/shopDirectory';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Verified & Discovered Indian Shops Directory | NearMe India',
  description:
    'Browse local Indian businesses, diagnostic labs, hardware suppliers, pharmacies, and service pros across Bengaluru, Madanapalle, Hyderabad, Delhi, Mumbai, Pune, and Chennai. Claim your shop free and get 2 customer leads.',
  alternates: {
    canonical: 'https://www.nearme-india.org/shops',
  },
};

export default async function ShopsDirectoryPage() {
  const shops = await fetchPublicShops(200);
  const cities = Array.from(new Set(shops.map((s) => s.city))).slice(0, 12);

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <main className="max-w-6xl mx-auto space-y-8">
        {/* Hero */}
        <section className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Live Pan-India Business Index · Updated Hourly
            </p>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Verified &amp; Discovered Local Businesses ({shops.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore local shops, diagnostic labs, wholesale dealers, and service pros indexed across India. Own one of these businesses? Claim your page free in 30 seconds to unlock 2 free customer leads and your printable Counter QR Standee.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href="/card"
              className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 transition-colors"
            >
              <QrCode className="w-4 h-4" /> Free Shop QR Standee
            </Link>
            <Link
              href="/claim"
              className="px-4 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Store className="w-4 h-4 text-cyan-400" /> Add / Claim Your Shop
            </Link>
          </div>
        </section>

        {/* Active Cities Summary */}
        {cities.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold">Indexed Cities:</span>
            {cities.map((city) => (
              <Link
                key={city}
                href={`/search?city=${encodeURIComponent(city)}`}
                className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-200 font-semibold transition-colors"
              >
                {city}
              </Link>
            ))}
          </div>
        )}

        {/* Shop Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <article
              key={shop.slug}
              className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-mono text-cyan-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {shop.city}
                  </span>
                  {shop.isClaimed ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                      Unclaimed · 2 Free Leads
                    </span>
                  )}
                </div>

                <h2 className="text-base font-extrabold text-white leading-snug">
                  <Link href={`/shop/${shop.slug}`} className="hover:text-emerald-300 transition-colors">
                    {shop.businessName}
                  </Link>
                </h2>
                <p className="text-xs text-slate-300 font-semibold">{shop.category}</p>
                {shop.address && (
                  <p className="text-[11px] text-slate-400 line-clamp-2">{shop.address}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                <span className="text-emerald-300 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {shop.trustScore}% Trust
                </span>
                <Link
                  href={`/shop/${shop.slug}`}
                  className="text-cyan-300 hover:text-cyan-200 font-extrabold flex items-center gap-1"
                >
                  {shop.isClaimed ? 'View Profile' : 'Claim / Inspect'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
