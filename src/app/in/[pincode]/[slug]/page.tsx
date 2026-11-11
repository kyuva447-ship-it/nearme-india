import React from 'react';
import { Metadata } from 'next';
import sanitizeHtml from 'sanitize-html';
import { Store, Zap } from 'lucide-react';
import Link from 'next/link';

type Props = {
  params: { pincode: string; slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pincode, slug } = params;
  return {
    title: `Best ${slug.replace(/-/g, ' ')} near ${pincode} | NearMe India`,
    description: `Find the best ${slug.replace(/-/g, ' ')} services and products near you in pincode ${pincode}. Claim 5 free customer leads today.`,
  }
}

export default function SeoLocalPage({ params }: Props) {
  const { pincode, slug } = params;
  const categoryName = slug.replace(/-/g, ' ');

  // Create JSON-LD Data for SEO securely avoiding XSS via stringify escaping
  const rawJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Best ${categoryName} in ${pincode}`,
    "address": {
      "@type": "PostalAddress",
      "postalCode": pincode,
      "addressCountry": "IN"
    }
  };

  const safeJsonLdString = JSON.stringify(rawJsonLd).replace(/</g, '\\u003c');

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-200 p-4 sm:p-8">
      {/* Secure Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString }}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* B2B Claim Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-500/30 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
           <div className="flex items-center gap-4">
              <Store className="w-10 h-10 text-blue-400 shrink-0" />
              <div>
                 <h2 className="text-xl font-bold text-white">Are you a local business in {sanitizeHtml(pincode)}?</h2>
                 <p className="text-sm text-blue-200">Claim 5 Free Live Customer Leads Today.</p>
              </div>
           </div>
           <Link href="/dashboard" className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl whitespace-nowrap text-center">
              Claim Business
           </Link>
        </div>

        <h1 className="text-4xl font-black text-white capitalize mb-4">
          Local {sanitizeHtml(categoryName)} near {sanitizeHtml(pincode)}
        </h1>
        <p className="text-gray-400 mb-8">
          Showing real-time automated bids and services for {sanitizeHtml(categoryName)} in your area. Our AI engine continuously monitors local merchant inventory to guarantee the lowest price.
        </p>

        <div className="grid gap-4">
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 flex items-center gap-4">
            <Zap className="w-8 h-8 text-emerald-500 shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Automated Results Matrix Active</h3>
              <p className="text-gray-500 text-sm">Connecting to Bidding War & Dead-Time Ticker...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
