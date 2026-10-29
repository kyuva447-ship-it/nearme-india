'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Phone, MessageSquare, Menu, Camera, PenLine, Mic, X, ChevronRight, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

import BoloVoiceSearch from '@/components/BoloVoiceSearch';
import PhotoSearch from '@/components/PhotoSearch';
import MetaAIFloater from '@/components/MetaAIFloater';
import BiddingWar from '@/components/BiddingWar';
import PriorityBribeButton from '@/components/PriorityBribeButton';
import DukaanReels from '@/components/DukaanReels';
import Analytics from '@/components/Analytics';

import { voiceHandoff } from '@/lib/voiceHandoff';
import { trackEvent } from '@/lib/analytics';

// Safely load maps only on client
const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [merchants, setMerchants] = useState<any[]>([
    {
      id: '1',
      business_name: 'Fast Fix Plumbers',
      category: 'plumber',
      phone: '919876543210',
      trust_score: 95,
      community_upvotes: 60,
      is_currently_available: true,
      is_gold_pin_active: true,
      current_deal_text: '20% OFF today only',
      latitude: 17.3850,
      longitude: 78.4867
    },
    {
      id: '2',
      business_name: 'Electro Pro Experts',
      category: 'electrician',
      phone: '919876543211',
      trust_score: 85,
      community_upvotes: 20,
      is_currently_available: false,
      is_gold_pin_active: false,
      current_deal_text: '',
      latitude: 17.3900,
      longitude: 78.4900
    }
  ]);
  const [selectedMerchant, setSelectedMerchant] = useState<any | null>(null);

  const handleLeadTrigger = async (merchant: any) => {
    trackEvent('lead_trigger_click', { merchant_id: merchant.id });
    await voiceHandoff("I need your service", merchant.id, merchant.phone, merchant, "2.5");
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white relative overflow-x-hidden pb-20">
      <Analytics />

      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="p-6 relative z-10 flex justify-between items-center max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 tracking-tight">
            NearMe India
          </h1>
          <p className="text-emerald-400 font-medium tracking-widest text-xs mt-1 uppercase">
            Verified Local Marketplace
          </p>
        </div>
        <div className="flex gap-4">
           <a href="/merchant/dashboard" className="hidden md:block bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full font-bold transition-colors">Merchant Login</a>
           <button className="md:hidden bg-white/10 p-2 rounded-lg"><Menu /></button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 relative z-10">

        {/* BIG 3 INTENT BUTTONS */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8 mb-12">
            <BoloVoiceSearch onResult={(t) => setSearchQuery(t)} />
            <PhotoSearch onResult={(r) => setMerchants(r)} />

            <button
              className="w-full bg-gradient-to-br from-emerald-400 to-teal-500 p-6 rounded-3xl shadow-xl shadow-teal-500/20 hover:scale-105 transition-all flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full backdrop-blur flex items-center justify-center">
                <PenLine className="w-8 h-8 text-white" />
              </div>
              <span className="font-black tracking-wider text-white">LIKHO</span>
            </button>
        </div>

        {/* Standard Search Bar fallback */}
        <div className="max-w-2xl mx-auto mb-12">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-6 h-6" />
              <input
                 type="text"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search plumbers, electricians..."
                 className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-lg text-white placeholder-white/30 outline-none focus:border-indigo-500 transition-colors backdrop-blur-sm"
              />
           </div>
        </div>

        {/* Map Section */}
        <div className="h-[40vh] md:h-[50vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative mb-12 z-0">
          <LiveMap merchants={merchants} onMarkerClick={setSelectedMerchant} />
        </div>

        {/* Dynamic Bidding War Banner */}
        <BiddingWar category={searchQuery || 'services'} searchCount={8} />

        {/* Reels Section */}
        <DukaanReels merchants={merchants} />

        {/* Horizontal Scrolling Merchant Cards */}
        <div className="flex overflow-x-auto pb-8 gap-6 snap-x scrollbar-hide">
          {merchants.map((merchant) => (
            <div
              key={merchant.id}
              className={`snap-center shrink-0 w-80 md:w-96 bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border-2 flex flex-col justify-between ${merchant.is_gold_pin_active ? 'border-amber-400' : 'border-slate-700'} relative overflow-hidden`}
            >
              {merchant.is_gold_pin_active && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500" />
              )}

              {merchant.current_deal_text && (
                 <div className="absolute top-4 right-[-30px] bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-black py-1 px-10 rotate-45 animate-pulse shadow-lg">
                    🔥 LIVE DEAL
                 </div>
              )}

              <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        {merchant.business_name}
                        {merchant.community_upvotes > 50 && <span title="Neighborhood Legend">👑</span>}
                      </h3>
                      <p className="text-slate-400 capitalize text-sm">{merchant.category} • 2.5km away</p>
                    </div>
                  </div>

                  {merchant.current_deal_text && (
                      <p className="text-pink-400 text-sm font-bold mb-4 bg-pink-500/10 inline-block px-2 py-1 rounded">
                         "{merchant.current_deal_text}"
                      </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3" /> Trust: {merchant.trust_score}%
                    </span>
                    {merchant.is_currently_available && (
                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 animate-pulse">
                           <div className="w-2 h-2 rounded-full bg-emerald-400" /> Available Now
                        </span>
                    )}
                  </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
                 <button
                   onClick={() => handleLeadTrigger(merchant)}
                   className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                 >
                   <MessageSquare className="w-5 h-5" /> Connect on WhatsApp
                 </button>
                 <PriorityBribeButton merchantId={merchant.id} />
              </div>
            </div>
          ))}
        </div>

      </main>

      <MetaAIFloater />

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 p-4 flex justify-around items-center z-40">
         <a href="/" className="text-emerald-400 flex flex-col items-center gap-1"><Search className="w-6 h-6"/><span className="text-[10px] font-bold">Search</span></a>
         <a href="/escrow" className="text-slate-400 flex flex-col items-center gap-1"><Zap className="w-6 h-6"/><span className="text-[10px] font-bold">Escrow</span></a>
         <a href="/merchant/dashboard" className="text-slate-400 flex flex-col items-center gap-1"><Menu className="w-6 h-6"/><span className="text-[10px] font-bold">Account</span></a>
      </div>
    </div>
  );
}
