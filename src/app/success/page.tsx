'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle2, QrCode, Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment_id = params.get('payment_id');
    const amount = params.get('amount');
    const item = params.get('item');

    setDetails({ payment_id, amount, item });
  }, []);

  const handleShare = async () => {
    const text = `I just slashed ₹${details?.amount || 1000} on ${details?.item || 'a deal'} via NearMe India! Claim your AI deals here: https://www.nearme-india.org`;
    try {
      if (navigator.share) await navigator.share({ title: 'NearMe Savings', text, url: 'https://www.nearme-india.org' });
      else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    } catch (e) {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 font-sans text-white">
      <div className="max-w-sm w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
         <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
         <h1 className="text-2xl font-black text-center mb-2 uppercase tracking-widest text-white">Payment Verified</h1>
         <p className="text-gray-400 text-center text-sm mb-8">Your automated AI deal has been locked.</p>

         <div className="bg-emerald-950/40 border border-emerald-500/50 p-6 rounded-2xl mb-8 flex flex-col items-center">
            <QrCode className="w-24 h-24 text-white mb-4" />
            <p className="text-sm font-bold text-emerald-400">Digital Access Pass</p>
            <p className="text-xs text-gray-400">{details?.payment_id || 'Generating...'}</p>
         </div>

         <div className="space-y-3">
             <button onClick={handleShare} className="w-full py-4 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20">
                <Share2 className="w-5 h-5" /> Share to Status for ₹10
             </button>
             <Link href="/account" className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                My Passes <ArrowRight className="w-4 h-4" />
             </Link>
         </div>
      </div>
    </div>
  );
}
