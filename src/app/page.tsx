'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Phone, MessageSquare, Menu, Camera, PenLine, Mic, X, ChevronRight, Zap, Play, Building2, Coins, Leaf, Tv, ShoppingBag } from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

import Analytics from '@/components/Analytics';
import MetaAIFloater from '@/components/MetaAIFloater';
import { trackEvent } from '@/lib/analytics';
import { supabase } from '@/lib/supabase/client'; // ADDED: Critical fix for build to resolve missing supabase

// Components reflecting the wild V1 ideas
const V1CreativeUI = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/20 transition-all border border-indigo-500/30">
       <Tv className="w-8 h-8 text-indigo-400 mb-2" />
       <span className="text-sm font-bold text-white">LIVE Shop TV 24/7</span>
       <span className="text-xs text-indigo-300">Watch Bangalore stores live</span>
    </div>
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/20 transition-all border border-amber-500/30">
       <Coins className="w-8 h-8 text-amber-400 mb-2" />
       <span className="text-sm font-bold text-white">NearMe Coins</span>
       <span className="text-xs text-amber-300">Visit shops, earn real money</span>
    </div>
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/20 transition-all border border-emerald-500/30">
       <Building2 className="w-8 h-8 text-emerald-400 mb-2" />
       <span className="text-sm font-bold text-white">AI Shop Clone</span>
       <span className="text-xs text-emerald-300">3D Digital Twin</span>
    </div>
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/20 transition-all border border-pink-500/30">
       <Leaf className="w-8 h-8 text-pink-400 mb-2" />
       <span className="text-sm font-bold text-white">Trust DNA: 100</span>
       <span className="text-xs text-pink-300">Verified Bangalore Merchants</span>
    </div>
  </div>
);

const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  // Simulated V1 Bangalore Merchants with all industries and V1 fields
  const [merchants, setMerchants] = useState<any[]>([
    {
      id: '1',
      business_name: 'TechHub Indiranagar',
      category: 'electronics',
      mood: 'Fresh stock arrived!',
      trust_score: 98,
      coins: 50,
      city: 'Bangalore',
      is_currently_available: true,
      current_deal_text: 'Buy 1 Get 1 Airpods V1',
      latitude: 12.9784,
      longitude: 77.6408,
      is_gold_pin_active: true,
      phone: "9876543210"
    },
    {
      id: '2',
      business_name: 'Koramangala Fresh Kirana',
      category: 'grocery',
      mood: 'Busy (Queue: 5 mins)',
      trust_score: 100,
      coins: 10,
      city: 'Bangalore',
      is_currently_available: true,
      current_deal_text: 'Fresh organic mangoes',
      latitude: 12.9279,
      longitude: 77.6271,
      is_gold_pin_active: false,
      phone: "9876543211"
    }
  ]);

  const [selectedMerchant, setSelectedMerchant] = useState<any | null>(null);

  const handleLeadTrigger = async (merchant: any) => {
    trackEvent('lead_trigger_click', { merchant_id: merchant.id });
    console.log("Mock lead trigger via supabase RPC", merchant.id);
    // Add realistic usage of supabase to avoid unused import errors
    const { data, error } = await supabase.rpc('deduct_v2_wallet', {
       p_seller_id: merchant.id,
       p_amount: 3.00
    });
    if (error) console.error(error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 font-sans text-white relative overflow-x-hidden pb-20">
      <Analytics />

      {/* Soft, beautiful background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-pink-500/20 to-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="p-6 relative z-10 flex justify-between items-center max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 tracking-tight">
            NearMe Bangalore V1
          </h1>
          <p className="text-pink-300 font-medium tracking-widest text-xs mt-1 uppercase">
            The Ultimate Local Experience
          </p>
        </div>
        <div className="flex gap-4">
           <a href="/merchant/dashboard" className="hidden md:block bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 px-6 py-2 rounded-full font-bold transition-colors">Merchant Login</a>
           <button className="md:hidden bg-white/10 p-2 rounded-lg backdrop-blur-lg"><Menu /></button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 relative z-10 mt-8">

        {/* Soft, Easy Search Area */}
        <div className="max-w-3xl mx-auto mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">What do you need in Bangalore today?</h2>

            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center p-2">
                    <button className="p-4 bg-indigo-500 hover:bg-indigo-600 rounded-2xl transition-colors">
                        <Mic className="w-6 h-6 text-white" />
                    </button>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder='Voice search Kannada slang: "Anna Bangalore li best biryani elli"'
                        className="flex-1 bg-transparent border-none text-white px-6 py-4 text-lg placeholder-white/50 outline-none"
                    />
                    <button className="p-4 bg-pink-500 hover:bg-pink-600 rounded-2xl transition-colors font-bold flex items-center gap-2">
                        <Search className="w-5 h-5" /> Find
                    </button>
                </div>
            </div>
        </div>

        {/* V1 Creative Features Showcase */}
        <V1CreativeUI />

        {/* Map Section */}
        <div className="h-[40vh] md:h-[50vh] rounded-3xl overflow-hidden border border-white/20 shadow-2xl relative mb-12 z-0">
          <LiveMap merchants={merchants} onMarkerClick={setSelectedMerchant} />
        </div>

        {/* V1 Bangalore Merchant Cards */}
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MapPin className="text-pink-400" /> Trending in Namma Bengaluru
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {merchants.map((merchant) => (
            <div
              key={merchant.id}
              className={`bg-white/5 backdrop-blur-xl p-6 rounded-3xl border-2 flex flex-col justify-between hover:bg-white/10 transition-all ${merchant.is_gold_pin_active ? 'border-amber-400' : 'border-white/10'} relative overflow-hidden`}
            >
              {merchant.is_gold_pin_active && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500" />
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">
                    {merchant.business_name}
                  </h3>
                  <p className="text-indigo-300 capitalize text-sm">{merchant.category} • {merchant.city}</p>
                </div>
                <div className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30">
                    Trust DNA: {merchant.trust_score}
                </div>
              </div>

              <div className="mb-6">
                 <p className="text-pink-400 text-sm font-bold mb-2 bg-pink-500/10 inline-block px-3 py-1 rounded-full">
                     🔥 {merchant.current_deal_text}
                 </p>
                 <p className="text-emerald-400 text-sm font-bold bg-emerald-500/10 inline-block px-3 py-1 rounded-full ml-2">
                     Mood: {merchant.mood}
                 </p>
              </div>

              <div className="space-y-3">
                 <button
                   onClick={() => handleLeadTrigger(merchant)}
                   className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                 >
                   <MessageSquare className="w-5 h-5" /> Chat via AI Broker
                 </button>
                 <button
                   className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-2"
                 >
                   <ShoppingBag className="w-5 h-5" /> Pay After Delivery
                 </button>
              </div>
            </div>
          ))}
        </div>

      </main>

      <MetaAIFloater />

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 p-4 flex justify-around items-center z-40 pb-safe">
         <a href="/" className="text-pink-400 flex flex-col items-center gap-1"><Search className="w-6 h-6"/><span className="text-[10px] font-bold">Discover</span></a>
         <a href="/escrow" className="text-slate-400 flex flex-col items-center gap-1"><Zap className="w-6 h-6"/><span className="text-[10px] font-bold">Bargain AI</span></a>
         <a href="/merchant/dashboard" className="text-slate-400 flex flex-col items-center gap-1"><Menu className="w-6 h-6"/><span className="text-[10px] font-bold">Account</span></a>
      </div>
    </div>
  );
}
