'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { TrendingDown, Package, Coins, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ReverseAuctionPage() {
  const [item, setItem] = useState('');
  const [qty, setQty] = useState('1');
  const [budget, setBudget] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !budget) return;
    setLoading(true);

    // Save directly to the new auctions table structure
    const { error } = await supabase.from('auctions').insert([
        {
            item_needed: item,
            qty: parseInt(qty),
            budget: parseFloat(budget),
            expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hrs from now
            status: 'OPEN'
        }
    ]);

    setLoading(false);
    if (error) {
        console.error(error);
        return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-2xl mx-auto">

         <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-200">
               <TrendingDown className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900">Reverse Auction</h1>
            <p className="text-lg text-slate-500 font-medium">Post your exact requirement. Local verified shops will bid lower and lower to win your order.</p>
         </div>

         {!submitted ? (
             <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <div className="space-y-6 mb-8">
                   <div>
                      <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Item Needed</label>
                      <div className="relative">
                         <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                         <input type="text" required value={item} onChange={e => setItem(e.target.value)} placeholder="e.g. Samsung 2Ton AC" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-emerald-500 text-lg font-bold transition-all" />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Quantity</label>
                          <div className="relative">
                             <input type="number" min="1" required value={qty} onChange={e => setQty(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 outline-none focus:border-emerald-500 text-lg font-black transition-all text-center" />
                          </div>
                       </div>
                       <div>
                          <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Max Budget (₹)</label>
                          <div className="relative">
                             <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                             <input type="number" required value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 35000" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-emerald-500 text-lg font-black transition-all" />
                          </div>
                       </div>
                   </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 text-lg">
                   {loading ? "Posting..." : "Start 2-Hour Auction"} <ArrowRight className="w-5 h-5" />
                </button>
             </form>
         ) : (
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                   <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-slate-900">Live Auction Started!</h3>
                <p className="text-slate-500 font-medium mb-8">Verified electronics shops in your area have been notified. Check your WhatsApp in 10-15 minutes for the lowest incoming bids.</p>
                <Link href="/" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-full transition-colors inline-block">
                   Explore More Deals
                </Link>
             </div>
         )}
      </div>
    </div>
  );
}
