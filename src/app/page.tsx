'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ShieldCheck, Factory, Wallet, MessageSquare, Mic, Camera, PenLine } from 'lucide-react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase/client';

const LiveMap = dynamic(() => import('@/components/marketplace/LiveMap'), { ssr: false });

const defaultMerchants = [
    {
      id: 'mock-1',
      business_name: 'Sri Balaji Electricals',
      category: 'Electrician',
      rating: 4.8,
      latitude: 13.6288,
      longitude: 79.4192,
      distance: 1.2,
      current_deal_text: '20% OFF today only',
      deal_expiry_time: new Date(Date.now() + 3600000).toISOString(),
      is_currently_available: true,
      community_upvotes: 55,
      is_gold_pin_active: true
    },
    {
      id: 'mock-2',
      business_name: 'Tirupati Plumbing Experts',
      category: 'Plumber',
      rating: 4.5,
      latitude: 13.6300,
      longitude: 79.4200,
      distance: 2.5,
      current_deal_text: null,
      is_currently_available: false,
      community_upvotes: 12
    }
];

export default function MorphingDashboard() {
  const [intent, setIntent] = useState<'IDLE' | 'B2C' | 'B2B'>('IDLE');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [merchants, setMerchants] = useState<any[]>(defaultMerchants);

  const handleLeadTrigger = async (merchantId: string, merchantData: any) => {
    try {
      const { data: deductSuccess, error: deductError } = await supabase.rpc('deduct_v2_wallet', {
        merchant_uuid: merchantId,
        amount: 3.00
      });

      if (deductError || !deductSuccess) {
        alert('Merchant out of wallet balance. Cannot connect right now.');
        return;
      }

      const hasActiveDeal = merchantData.current_deal_text && merchantData.deal_expiry_time && new Date(merchantData.deal_expiry_time) > new Date();
      const distancePlaceholder = (Math.random() * 5 + 0.5).toFixed(1);

      let message = `Hi ${merchantData.business_name}, I found you on NearMe India. `;
      if (hasActiveDeal) {
        message += `Are you still offering the "${merchantData.current_deal_text}" deal? `;
      } else {
         message += `I'm looking for ${merchantData.category} services. `;
      }
      message += `I am located approximately ${distancePlaceholder}km away.`;

      await supabase.from('v2_b2c_leads').insert([
        {
          merchant_id: merchantId,
          lead_fee_charged: 3.00,
          whatsapp_context: message
        }
      ]);

      const merchantPhone = merchantData.phone_number || '919999999999';
      const whatsappUrl = `https://wa.me/${merchantPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

    } catch (e) {
      console.error('Lead trigger failed:', e);
      alert('Could not process lead. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden font-sans relative">
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-transparent blur-[100px] pointer-events-none" />

      {/* Floating Meta AI */}
      <div className="fixed bottom-6 right-6 z-50">
         <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-full shadow-2xl cursor-pointer hover:bg-white/20 transition-all flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-spin-slow">
                 <span className="text-white font-black text-xl">M</span>
             </div>
             <div className="hidden md:block">
                 <p className="text-white font-bold text-sm">Mee kosam em cheyyali?</p>
                 <p className="text-slate-300 text-xs">Meta AI Assistant</p>
             </div>
         </motion.div>
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-12 pb-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
           <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 mb-6 tracking-tight">
               NearMe India
           </h1>
           <p className="text-xl text-slate-400 mb-10">The Verified Local Marketplace. Zero Fake Reviews.</p>

           {/* The 3 BIG Buttons */}
           <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
               <button onClick={() => setIntent('B2C')} className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-3xl shadow-xl shadow-orange-500/20 hover:scale-105 transition-transform flex flex-col items-center gap-3">
                   <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><Mic className="w-8 h-8 text-white"/></div>
                   <span className="text-white font-black text-lg tracking-wider">BOLO</span>
               </button>
               <button onClick={() => setIntent('B2C')} className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-3xl shadow-xl shadow-purple-500/20 hover:scale-105 transition-transform flex flex-col items-center gap-3">
                   <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><Camera className="w-8 h-8 text-white"/></div>
                   <span className="text-white font-black text-lg tracking-wider">PHOTO LO</span>
               </button>
               <button onClick={() => setIntent('B2C')} className="bg-gradient-to-br from-emerald-400 to-teal-500 p-6 rounded-3xl shadow-xl shadow-emerald-500/20 hover:scale-105 transition-transform flex flex-col items-center gap-3">
                   <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><PenLine className="w-8 h-8 text-white"/></div>
                   <span className="text-white font-black text-lg tracking-wider">LIKHO</span>
               </button>
           </div>
        </div>

        <AnimatePresence mode="wait">
          {intent === 'B2C' && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                <div>
                  <h3 className="text-2xl font-black text-white">Live Consumer Map</h3>
                  <p className="text-sm text-emerald-400 font-bold flex items-center gap-2 mt-1">
                      <ShieldCheck className="w-4 h-4"/> 100% Verified Merchants
                  </p>
                </div>
              </div>
              <div className="h-[600px] relative">
                  <div className="absolute inset-0 z-0">
                    <LiveMap merchants={merchants} />
                  </div>

                  {/* Floating Overlay UI for Merchants */}
                  <div className="relative z-10 w-full h-full p-6 pointer-events-none flex flex-col justify-end">
                    <div className="flex gap-6 overflow-x-auto pointer-events-auto pb-4 scrollbar-hide">
                      {merchants.map((m: any, i: number) => {
                        const hasActiveDeal = m.current_deal_text && m.deal_expiry_time && new Date(m.deal_expiry_time) > new Date();
                        const isLegend = (m.community_upvotes || 0) > 50;

                        return (
                          <div key={i} className={`flex-shrink-0 w-80 bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border flex flex-col justify-between ${m.is_gold_pin_active ? 'border-amber-500/50 shadow-amber-500/10' : 'border-slate-700'}`}>
                            <div>
                              <div className="flex justify-between items-start mb-4 relative">
                                {m.is_currently_available && (
                                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-2 border border-emerald-500/30">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> LIVE
                                  </span>
                                )}
                                {m.is_gold_pin_active && <div className="bg-gradient-to-r from-amber-300 to-yellow-500 text-amber-950 text-xs font-black px-3 py-1.5 rounded-full shadow-lg">TOP SLOT</div>}
                              </div>

                              {hasActiveDeal && (
                                <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-black px-4 py-2 rounded-lg mb-4 flex items-center gap-2 animate-pulse shadow-lg shadow-red-500/20">
                                  <span>🔥 STREAK DEAL:</span> {m.current_deal_text}
                                </div>
                              )}

                              <h4 className="font-black text-white text-xl mb-1">{m.business_name}</h4>
                              <p className="text-sm text-slate-400 font-medium mb-4">{m.category} • {m.distance}km away</p>

                              <div className="flex justify-between items-center mb-4">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    {isLegend && <span title="Neighborhood Legend" className="text-xl">👑</span>}
                                    <span className="text-sm font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-lg flex items-center gap-1 border border-emerald-400/20">
                                      Trust 90+
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button
                                onClick={() => handleLeadTrigger(m.id, m)}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-sm font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20"
                            >
                                <MessageSquare className="w-5 h-5" /> Connect on WhatsApp
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
