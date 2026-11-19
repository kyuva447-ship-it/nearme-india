import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Store,
  MapPin,
  ShieldCheck,
  QrCode,
  Lock,
  FileSearch,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
} from 'lucide-react';
import { fetchPublicShopBySlug, fetchPublicShops } from '@/lib/shopDirectory';

export const revalidate = 300;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const shop = await fetchPublicShopBySlug(params.slug);
  if (!shop) {
    return {
      title: 'Shop Not Found | NearMe India',
    };
  }

  const canonical = `https://www.nearme-india.org/shop/${shop.slug}`;
  const title = `${shop.businessName} in ${shop.city} — ${shop.category} | NearMe India`;
  const description = `${shop.businessName} (${shop.category}) in ${shop.city}. Check Fair-Price Trust Score (${shop.trustScore}%), pay safely via Razorpay 15/85 Escrow, audit bills, or claim this business profile free on NearMe India for 2 complimentary customer leads.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'NearMe India',
      type: 'website',
    },
  };
}

export default async function PublicShopPage({ params }: PageProps) {
  const shop = await fetchPublicShopBySlug(params.slug);
  if (!shop) {
    notFound();
  }

  const related = (await fetchPublicShops(18))
    .filter((s) => s.slug !== shop.slug && s.city.toLowerCase() === shop.city.toLowerCase())
    .slice(0, 3);

  const claimHref = shop.claimToken
    ? `/claim?token=${encodeURIComponent(shop.claimToken)}`
    : `/claim`;

  const cardHref = `/card?name=${encodeURIComponent(shop.businessName)}&city=${encodeURIComponent(
    shop.city
  )}&category=${encodeURIComponent(shop.category)}&shopSlug=${encodeURIComponent(shop.slug)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: shop.businessName,
    url: `https://www.nearme-india.org/shop/${shop.slug}`,
    description: `${shop.businessName} — ${shop.category} serving ${shop.city}, India. Verified on NearMe India with Razorpay 15/85 Escrow protection.`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: shop.address || shop.city,
      addressLocality: shop.city,
      addressCountry: 'IN',
    },
    ...(shop.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: shop.rating,
            bestRating: 5,
            ratingCount: 12,
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/shops" className="hover:text-white">Shops Directory</Link>
          <span>/</span>
          <span className="text-slate-200 font-semibold">{shop.businessName}</span>
        </nav>

        {/* Owner Claim Banner (Pulls Business Owners Directly From Google Search) */}
        {!shop.isClaimed && (
          <section className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-cyan-950/80 border border-emerald-500/50 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                Own {shop.businessName}?
              </p>
              <h2 className="text-base sm:text-lg font-black text-white">
                Claim This Page Free in 30 Seconds &amp; Unlock 2 Free Customer Leads
              </h2>
              <p className="text-xs text-slate-300">
                Add your GSTIN for a 96% Trust Badge, receive direct customer phone calls, and download your free Counter QR Standee.
              </p>
            </div>
            <Link
              href={claimHref}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black whitespace-nowrap shrink-0 flex items-center justify-center gap-2 transition-colors"
            >
              Claim Free Profile <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        )}

        {/* Primary Shop Profile Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                  {shop.category}
                </span>
                {shop.isClaimed ? (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Partner
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                    Public Directory Listing
                  </span>
                )}
                {shop.gstVerified && (
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                    GSTIN Mod-36 Verified
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {shop.businessName}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{shop.address || `${shop.city}, India`}</span>
              </p>
            </div>

            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 text-center min-w-[140px]">
              <p className="text-[11px] text-slate-400 font-semibold">NearMe Trust Score</p>
              <p className="text-3xl font-black text-emerald-400 mt-0.5">{shop.trustScore}%</p>
              <p className="text-[10px] text-slate-400 mt-1">15/85 Escrow Ready</p>
            </div>
          </div>

          {/* Action Grid for Customers & Business Owners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <Link
              href="/#auditor"
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 space-y-1.5 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-300">
                <FileSearch className="w-4 h-4" /> Check a Quote or Bill
              </div>
              <p className="text-xs text-slate-400">
                Upload any hospital, vehicle, construction, or shop bill to verify fair local rates in 60 seconds.
              </p>
            </Link>

            <Link
              href="/escrow"
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 space-y-1.5 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-300">
                <Lock className="w-4 h-4" /> Pay via 15/85 Razorpay Escrow
              </div>
              <p className="text-xs text-slate-400">
                Lock funds safely until 6-digit Delivery OTP confirmation, backed by a 48-hour refund guarantee.
              </p>
            </Link>

            <Link
              href={cardHref}
              className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/35 hover:border-emerald-400 space-y-1.5 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300">
                <QrCode className="w-4 h-4" /> Free Shop QR Standee
              </div>
              <p className="text-xs text-slate-400">
                Download a printable Counter QR Code &amp; WhatsApp Digital Business Card for {shop.businessName}.
              </p>
            </Link>
          </div>

          {/* Transparent Trust Info */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Need verified quotes in <strong className="text-white">{shop.city}</strong>? Compare local {shop.category} pros on NearMe India.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/search?q=${encodeURIComponent(shop.category)}&city=${encodeURIComponent(shop.city)}`}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5 text-cyan-400" /> Compare Pros
              </Link>
              <Link
                href={claimHref}
                className="px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1"
              >
                <Store className="w-3.5 h-3.5" /> {shop.isClaimed ? 'Merchant Portal' : 'Claim Shop'}
              </Link>
            </div>
          </div>
        </section>

        {/* Nearby Shops Internal Links (Helps Googlebot Crawl All City Pages) */}
        {related.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-extrabold text-slate-200">
              More Local Businesses in {shop.city}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/shop/${rel.slug}`}
                  className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 space-y-1 transition-colors"
                >
                  <p className="text-sm font-bold text-white">{rel.businessName}</p>
                  <p className="text-xs text-slate-400">{rel.category}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
