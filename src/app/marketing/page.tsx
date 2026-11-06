'use client';
import React, { useState } from 'react';
import { Copy, CheckCircle, Share2, Megaphone, Zap } from 'lucide-react';
import Link from 'next/link';

export default function MarketingPanel() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const marketingTexts = {
    whatsapp: `🚀 *NearMe India is LIVE!* 🇮🇳\n\nFind the best verified local shops, foods, and services in your city instantly. No app download needed!\n\n👉 *Search now:* https://www.nearme-india.org\n\n🛍️ Want to grow your business? List your shop for FREE today!`,
    instagram: `Your city's best shops are now just a click away! 🏙️✨\n\nIntroducing NearMe India - the fastest way to find verified local businesses, claim flash deals, and order directly via WhatsApp. Zero commissions. 100% Local.\n\nTap the link in bio to explore or list your shop for FREE! 🚀\n\n#NearMeIndia #VocalForLocal #SmallBusinessIndia #LocalShops #IndiaShopping #Tirupati #Bangalore #Delhi #Mumbai`,
    offer: `🔥 *Special Offer for Business Owners!* 🔥\n\nWant to reach thousands of local customers every day?\n\nUpgrade to the *NearMe India Growth Pack* for just ₹999/month and get:\n✅ Verified Tick Mark\n✅ Priority Search Ranking\n✅ Daily Flash Deals\n\n👉 *Claim your offer here:* https://www.nearme-india.org/pricing`
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black mb-2">Marketing Panel</h1>
          <p className="text-slate-500">Ready-to-use copy for your social media and broadcasts.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold flex items-center gap-2 text-lg"><Share2 className="w-5 h-5 text-[#25D366]" /> WhatsApp Broadcast</h2>
              <button
                onClick={() => handleCopy(marketingTexts.whatsapp, 'whatsapp')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
              >
                {copiedSection === 'whatsapp' ? <><CheckCircle className="w-4 h-4 text-emerald-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Text</>}
              </button>
            </div>
            <pre className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 whitespace-pre-wrap font-sans border border-slate-100">
              {marketingTexts.whatsapp}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold flex items-center gap-2 text-lg"><Share2 className="w-5 h-5 text-pink-600" /> Instagram Caption</h2>
              <button
                onClick={() => handleCopy(marketingTexts.instagram, 'instagram')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
              >
                {copiedSection === 'instagram' ? <><CheckCircle className="w-4 h-4 text-emerald-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Text</>}
              </button>
            </div>
            <pre className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 whitespace-pre-wrap font-sans border border-slate-100">
              {marketingTexts.instagram}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold flex items-center gap-2 text-lg"><Zap className="w-5 h-5 text-orange-500" /> Growth Pack Offer</h2>
              <button
                onClick={() => handleCopy(marketingTexts.offer, 'offer')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
              >
                {copiedSection === 'offer' ? <><CheckCircle className="w-4 h-4 text-emerald-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Text</>}
              </button>
            </div>
            <pre className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 whitespace-pre-wrap font-sans border border-slate-100">
              {marketingTexts.offer}
            </pre>
          </div>
        </div>

        <div className="mt-12 text-center">
            <Link href="/" className="text-emerald-600 font-bold hover:underline">Return to Homepage</Link>
        </div>
      </div>
    </div>
  );
}
