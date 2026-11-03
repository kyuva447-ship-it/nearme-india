'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Mic, ShieldCheck, Zap, Heart, MessageSquare, Coffee, Video, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';

const LiveMap = dynamic(() => import('@/components/LiveMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-indigo-50 animate-pulse rounded-3xl" />
});

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key'
  );

  useEffect(() => {
    async function fetchMerchants() {
      setIsLoading(true);
      const { data, error } = await supabase.from('v2_merchants').select('*').limit(50);
      if (!error && data && data.length > 0) {
        setMerchants(data);
      } else {
        // Fallback for V1 Bangalore display if DB is empty or fails
        setMerchants([
          {
            id: '1',
            business_name: 'Lakshmi Kirana Store',
            category: 'Grocery',
            city: 'Bangalore',
            pincode: '560001',
            trust_score: 98,
            mood: 'Busy',
            live_video_url: 'https://nearme-india.org/live',
            coins: 150,
            premium_plan: 'PRO',
            is_verified: true,
            current_deal_text: 'Free delivery in Indiranagar',
            deal_expiry_time: new Date(Date.now() + 3600000).toISOString(),
            is_currently_available: true,
            latitude: 12.9715987,
            longitude: 77.5945627
          },
          {
            id: '2',
            business_name: 'TechHub Solutions',
            category: 'IT Services',
            city: 'Bangalore',
            pincode: '560103',
            trust_score: 100,
            mood: 'Empty',
            coins: 50,
            is_verified: true,
            current_deal_text: 'Free Consultation',
            deal_expiry_time: new Date(Date.now() + 7200000).toISOString(),
            is_currently_available: true,
            latitude: 12.9351929,
            longitude: 77.62448069999999
          }
        ]);
      }
      setIsLoading(false);
    }
    fetchMerchants();
  }, []);

  const handleVoiceSearch = () => {
    alert('Voice search activated! "Anna Bangalore li best biryani elli"');
  };

  const tabs = ['ALL', 'B2C', 'B2B'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 text-slate-800 font-sans">

      {/* Header Section */}
      <header className="pt-12 pb-8 px-6 text-center max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-purple-100 text-purple-700 font-medium text-sm mb-6">
          <MapPin className="w-4 h-4 text-pink-500" />
          <span>V1 Bangalore is LIVE</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-2" />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
          Discover Bengaluru Like Never Before
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-lg md:text-xl text-slate-500 font-light max-w-2xl mx-auto mb-10">
          From Kirana to Corporate, find trusted local businesses instantly. AI-powered, 100% verified, soft & easy for everyone.
        </motion.p>

        {/* AI Omni-Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative max-w-3xl mx-auto shadow-2xl rounded-3xl bg-white p-2 flex items-center border border-purple-100/50 backdrop-blur-xl">
          <div className="flex-1 flex items-center px-4 gap-3">
            <Search className="w-6 h-6 text-purple-400" />
            <input
              type="text"
              placeholder="Search anything... 'Kirana', 'IT Startup', 'Medical'"
              className="w-full text-lg outline-none text-slate-700 bg-transparent py-4 placeholder-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={handleVoiceSearch} className="p-4 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-2xl transition-colors flex items-center gap-2 font-medium">
            <Mic className="w-5 h-5" />
            <span className="hidden sm:inline">Kannada/Hi/En</span>
          </button>
        </motion.div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 pb-20">

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-10">
          <div className="flex gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-200' : 'text-slate-500 hover:bg-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-96 flex flex-col items-center justify-center text-purple-400">
              <Zap className="w-12 h-12 animate-bounce mb-4" />
              <p className="font-medium animate-pulse">Scanning Bangalore Neighborhoods...</p>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Left Sidebar - AI Features */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl border border-white shadow-xl shadow-purple-900/5">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><TrendingUp className="text-purple-500 w-5 h-5"/> Live Shop TV</h3>
                  <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden relative group cursor-pointer">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-8 h-8 text-slate-300 group-hover:text-pink-400 transition-colors" />
                    </div>
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">LIVE</div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 font-medium">Watch Koramangala shops live right now.</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-lg text-white">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Coffee className="w-5 h-5"/> Earn Coins</h3>
                  <p className="text-sm text-indigo-100 mb-4">Visit shops, earn digital coins, get real money rewards.</p>
                  <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors">
                    Claim Today's 50 Coins
                  </button>
                </div>
              </div>

              {/* Center Map & Results */}
              <div className="lg:col-span-6 bg-white rounded-[2.5rem] shadow-2xl shadow-pink-900/5 border border-slate-50 overflow-hidden relative h-[600px] flex flex-col">
                <div className="p-4 bg-white/90 backdrop-blur z-10 flex justify-between items-center border-b border-slate-100">
                  <div className="font-semibold text-slate-700">Explore <span className="text-purple-600">Bengaluru</span></div>
                  <div className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-bold">100+ Shops Auto-Imported Today</div>
                </div>
                <div className="flex-1 relative z-0">
                  <LiveMap merchants={merchants} />
                </div>
              </div>

              {/* Right Sidebar - Merchant Cards */}
              <div className="lg:col-span-3 space-y-6 overflow-y-auto max-h-[600px] scrollbar-hide pr-2">
                {merchants.map((m) => (
                  <div key={m.id} className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 hover:border-purple-200 transition-all hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg leading-tight">{m.business_name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{m.category} • {m.pincode}</p>
                      </div>
                      {m.is_verified && <ShieldCheck className="text-emerald-500 w-5 h-5" />}
                    </div>

                    <div className="flex gap-2 mb-4">
                      <span className="text-[10px] font-black px-2 py-1 rounded-md bg-purple-50 text-purple-600 flex items-center gap-1">
                        DNA {m.trust_score || 0}%
                      </span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md ${m.mood === 'Busy' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        {m.mood || 'Standard'}
                      </span>
                    </div>

                    {m.current_deal_text && (
                      <div className="bg-pink-50 text-pink-600 text-xs font-semibold p-2 rounded-xl mb-4 text-center">
                        🔥 {m.current_deal_text}
                      </div>
                    )}

                    {/* Exactly 3 main action buttons */}
                    <div className="space-y-2">
                      <button className="w-full py-2.5 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-xl text-sm font-bold flex justify-center items-center gap-2 shadow-md shadow-emerald-200 hover:opacity-90">
                        <MessageSquare className="w-4 h-4" /> WhatsApp Connect
                      </button>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors">
                          View Profile
                        </button>
                        <button className="flex-1 py-2 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl text-xs font-bold transition-colors flex justify-center items-center gap-1">
                          <Heart className="w-3 h-3"/> Save
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
