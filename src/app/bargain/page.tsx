'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Zap, Tag, Coins, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

export default function BargainPage() {
  const [productName, setProductName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !targetPrice) return;
    setLoading(true);

    const { error } = await supabase.from('bargain_battles').insert([
        {
            item_needed: productName,
            target_price: parseFloat(targetPrice),
            status: 'SEARCHING_SHOPS'
        }
    ]);

    setLoading(false);
    if (error) {
        console.error(error);
        return;
    }

    setSubmitted(true);
    trackEvent('bargain_battle_started', { product: productName, price: targetPrice });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-2xl mx-auto">

         <div className="text-center mb-12">
            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-orange-200">
               <Zap className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900">Bargain Battle AI</h1>
            <p className="text-lg text-slate-500 font-medium">Tell us what you want and your price. Our AI will negotiate with local shops to get you a match instantly.</p>
         </div>

         {!submitted ? (
             <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <div className="space-y-6 mb-8">
                   <div>
                      <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">What do you want to buy?</label>
                      <div className="relative">
                         <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                         <input type="text" required value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g. 5kg Sona Masoori Rice" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-emerald-500 text-lg font-bold transition-all" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Your Target Price (₹)</label>
                      <div className="relative">
                         <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                         <input type="number" required value={targetPrice} onChange={e => setTargetPrice(e.target.value)} placeholder="e.g. 250" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-emerald-500 text-lg font-black transition-all" />
                      </div>
                   </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg text-lg">
                   {loading ? "Waking up AI..." : "Start Bargain Battle"} <ArrowRight className="w-5 h-5" />
                </button>
             </form>
         ) : (
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                   <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-slate-900">Battle Started!</h3>
                <p className="text-slate-500 font-medium mb-8">Our AI is pinging 45 verified shops in your city right now. We will notify you via WhatsApp when a shop accepts ₹{targetPrice} for {productName}.</p>
                <Link href="/" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-full transition-colors inline-block">
                   Explore More Deals
                </Link>
             </div>
         )}
      </div>
    </div>
  );
}
