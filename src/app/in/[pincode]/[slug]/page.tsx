import React from 'react';
import { Metadata } from 'next';

type Props = {
  params: { pincode: string; slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pincode, slug } = params;
  return {
    title: `Best ${slug.replace(/-/g, ' ')} near ${pincode} | NearMe India`,
    description: `Find the best ${slug.replace(/-/g, ' ')} services and products near you in pincode ${pincode}.`,
  }
}

export default function SeoLocalPage({ params }: Props) {
  const { pincode, slug } = params;
  const categoryName = slug.replace(/-/g, ' ');

  // Create JSON-LD Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Best ${categoryName} in ${pincode}`,
    "address": {
      "@type": "PostalAddress",
      "postalCode": pincode,
      "addressCountry": "IN"
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 p-8">
      {/* Injecting JSON-LD for Programmatic SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-white capitalize mb-4">
          Local {categoryName} near {pincode}
        </h1>
        <p className="text-slate-400 mb-8">
          Showing real-time automated bids and services for {categoryName} in your area.
        </p>

        {/* Placeholder for local results */}
        <div className="grid gap-4">
          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-2">Automated Results Matrix</h3>
            <p className="text-slate-500">Connecting to Engine 1 (Bidding War) & Engine 4 (Dead-Time Ticker)...</p>
          </div>
        </div>
      </div>
    </div>
  );
}