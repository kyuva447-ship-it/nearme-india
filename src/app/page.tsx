'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIOmnibar from '@/components/marketplace/AIOmnibar';
import { MapPin, ShieldCheck, Factory, Wallet, MessageSquare } from 'lucide-react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase/client';

const LiveMap = dynamic(() => import('@/components/marketplace/LiveMap'), { ssr: false, loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 font-bold">Initializing PostGIS Engine...</div> });

export default function MorphingDashboard() {
  const [intent, setIntent] = useState<'IDLE' | 'B2C' | 'B2B'>('IDLE');
  const [searchQuery, setSearchQuery] = useState('');
  const [merchants, setMerchants] = useState<{ [key: string]: string | number | boolean | null }[]>([]);
  const [rfqs, setRfqs] = useState<{ [key: string]: string | number | boolean | null }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mockMerchants = [
    { id: '1', business_name: 'Raju Plumbers (Fallback)', category: 'Plumbing', surge_multiplier: 1.2 },
    { id: '2', business_name: 'Sri Venkateshwara Electric', category: 'Electrician', surge_multiplier: 1.0 }
  ];

  const mockRfqs = [
    { id: '1', title: 'Need 5,000 Corporate Uniforms (Fallback)', target_budget: 250000, status: 'OPEN' },
    { id: '2', title: 'Bulk copper wiring 500kg', target_budget: 450000, status: 'OPEN' }
  ];

  const handleIntent = async (detectedIntent: 'B2C' | 'B2B', query: string) => {
    setIntent(detectedIntent);
    setSearchQuery(query);
    setIsLoading(true);

    try {
      if (detectedIntent === 'B2C') {
        const { data, error } = await supabase.from('v2_merchants').select('*').limit(10);
        if (error || !data || data.length === 0) setMerchants(mockMerchants);
        else setMerchants(data);
      } else {
        const { data, error } = await supabase.from('v2_b2b_rfqs').select('*').limit(10);
        if (error || !data || data.length === 0) setRfqs(mockRfqs);
        else setRfqs(data);
      }
    } catch {
      console.warn('DB Fetch failed, using fallbacks');
      setMerchants(mockMerchants);
      setRfqs(mockRfqs);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none transition-colors duration-1000">
        {intent === 'B2C' && <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-slate-50" />}
        {intent === 'B2B' && <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800" />}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <h1 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${intent === 'B2B' ? 'text-white' : 'text-slate-900'}`}>
            <MapPin className="w-8 h-8 text-emerald-500" />
            NearMe <span className="text-emerald-500">India</span>
          </h1>
          <div className="flex gap-4">
            <a href="/login" className={`font-bold text-sm px-6 py-2 rounded-full border-2 transition-all ${
              intent === 'B2B' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}>
              Merchant Login
            </a>
          </div>
        </header>

        <AIOmnibar onIntentDetected={handleIntent} />

        <div className="mt-16">
          <AnimatePresence mode="wait">
            {intent === 'IDLE' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center max-w-2xl mx-auto mt-24"
              >
                <h2 className="text-5xl font-black text-slate-900 leading-tight mb-6">
                  The Dual-Engine Local Marketplace
                </h2>
                <p className="text-xl text-slate-500">
                  Search naturally. Our AI routes you to instant consumer maps or high-margin B2B procurement dashboards.
                </p>
              </motion.div>
            )}

            {intent === 'B2C' && (
              <motion.div
                key="b2c"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Consumer Map</h3>
                    <p className="text-sm text-slate-500">Showing local results for: <span className="font-bold text-indigo-600">&quot;{searchQuery}&quot;</span></p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Surge 1.0x
                    </span>
                  </div>
                </div>
                <div className="h-[500px] bg-slate-100 flex items-center justify-center relative">
                  {isLoading ? (
                    <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
                      <div className="text-slate-400 font-bold flex flex-col items-center gap-4">
                        <MapPin className="w-12 h-12 animate-bounce" />
                        Fetching local merchants from Supabase...
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 z-0">
                        <LiveMap merchants={merchants} />
                      </div>

                      {/* Floating overlay UI */}
                      <div className="relative z-10 w-full h-full p-4 pointer-events-none">
                        <div className="absolute bottom-4 left-4 right-4 flex gap-4 overflow-x-auto pointer-events-auto pb-2 scrollbar-hide">
                          {merchants.map((m: { [key: string]: string | number | boolean | null }, i: number) => (
                            <div key={i} className={`flex-shrink-0 w-64 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border-2 ${m.is_gold_pin_active ? 'border-amber-400' : 'border-white'}`}>
                              {m.is_gold_pin_active && <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-1 rounded-full shadow">GOLD</div>}
                              <h4 className="font-bold text-slate-900 truncate">{m.business_name}</h4>
                              <p className="text-xs text-slate-500 mb-3">{m.category}</p>
                              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                                <MessageSquare className="w-3 h-3" /> Connect (-₹5)
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {intent === 'B2B' && (
              <motion.div
                key="b2b"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700 text-slate-200"
              >
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                  <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-3">
                      <Factory className="w-8 h-8 text-amber-500" /> Procurement Dashboard
                    </h3>
                    <p className="text-sm text-slate-400 mt-2">Active RFQs related to: <span className="font-bold text-amber-400">&quot;{searchQuery}&quot;</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Your Escrow Wallet</p>
                    <div className="text-2xl font-black text-emerald-400 flex items-center gap-2 justify-end">
                      <Wallet className="w-6 h-6" /> ₹15,000.00
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1,2].map(i => (
                        <div key={i} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 animate-pulse">
                          <div className="h-4 bg-slate-700 rounded w-1/4 mb-4"></div>
                          <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rfqs.map((rfq: { [key: string]: string | number | boolean | null }, i: number) => (
                        <div key={i} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-amber-500/50 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="bg-amber-500/20 text-amber-400 text-xs font-black px-3 py-1 rounded-full uppercase">{rfq.status}</span>
                              <h4 className="text-xl font-bold text-white mt-3">{rfq.title}</h4>
                              <p className="text-sm text-slate-400 mt-1">Sourced from Supabase V2 Engine</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500 uppercase font-bold">Target Budget</p>
                              <p className="text-xl font-black text-white">₹{rfq.target_budget?.toLocaleString('en-IN') || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                            <p className="text-xs text-slate-400">Verified RFQ</p>
                            <button className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-sm px-6 py-2 rounded-xl flex items-center gap-2 group-hover:scale-105 transition-all">
                              Unlock Lead (-₹250)
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
