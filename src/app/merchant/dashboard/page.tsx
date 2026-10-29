'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Wallet, Save, User, MapPin, TrendingUp, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function MerchantDashboard() {
  const [walletBalance, setWalletBalance] = useState(15.00);
  const [isAvailable, setIsAvailable] = useState(false);
  const [dealText, setDealText] = useState('');
  const [businessName, setBusinessName] = useState('Sri Balaji Electricals');
  const [category, setCategory] = useState('Electrician');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await supabase.from('v2_merchants')
        .update({
          is_currently_available: isAvailable,
          current_deal_text: dealText,
          deal_expiry_time: dealText ? new Date(Date.now() + 3600000).toISOString() : null,
          business_name: businessName,
          category: category
        })
        .eq('phone_number', '918247831885');
    } catch (e) {
      console.warn("Save failed", e);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const initiateTopUp = async (plan: string, amount: number) => {
    alert(`Initiating Razorpay checkout for ₹${amount} (${plan})`);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-100 font-sans relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-slate-800/50 pb-8 gap-6">
            <div>
                <h1 className="text-4xl font-black flex items-center gap-4 text-white">
                    <User className="w-10 h-10 text-emerald-400 bg-emerald-400/10 p-2 rounded-xl" />
                    Owner Profit Dashboard
                </h1>
                <p className="text-emerald-400 mt-4 font-black text-xs uppercase tracking-widest bg-emerald-400/10 px-4 py-2 rounded-full inline-block border border-emerald-400/20">Verified Session • NearMe India</p>
            </div>
            <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-xl w-full text-right">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Live Wallet Balance</p>
                  <div className="text-4xl font-black text-emerald-400 flex items-center gap-3 justify-end">
                      <Wallet className="w-8 h-8" />
                      ₹{walletBalance.toFixed(2)}
                  </div>
                </div>
            </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Live Ping Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
                     <div className="flex justify-between items-start mb-8">
                         <div>
                            <h2 className="text-2xl font-black mb-2 flex items-center gap-3 text-white">
                               Live Ping
                               {isAvailable && <span className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />}
                            </h2>
                            <p className="text-sm text-slate-400 font-medium">Signal that you are ready to dispatch now. This bumps you to the top of search results instantly.</p>
                         </div>
                     </div>

                     <div className="flex items-center justify-between bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                         <span className="font-black text-slate-200 text-lg">Availability Status</span>
                         <button
                            onClick={() => setIsAvailable(!isAvailable)}
                            className={`w-20 h-10 rounded-full relative transition-colors border ${isAvailable ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-800 border-slate-700'}`}
                         >
                             <motion.div
                                layout
                                className="w-8 h-8 bg-white rounded-full absolute top-[3px] shadow-sm"
                                initial={false}
                                animate={{ left: isAvailable ? '44px' : '4px' }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                             />
                         </button>
                     </div>
                </motion.div>

                {/* Flash Deals Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8">
                         <div>
                            <h2 className="text-2xl font-black mb-2 flex items-center gap-3 text-white">
                               <Zap className="w-6 h-6 text-amber-400" /> Flash Deals Engine
                            </h2>
                            <p className="text-sm text-slate-400 font-medium">Set a temporary deal to attract more local clicks. Expires in 1 hour.</p>
                         </div>
                     </div>

                     <div className="space-y-4">
                         <div>
                             <input
                                type="text"
                                value={dealText}
                                onChange={(e) => setDealText(e.target.value)}
                                placeholder="e.g. 20% OFF today only! Fast service."
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors font-medium text-lg placeholder:text-slate-600"
                             />
                         </div>
                     </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-5 px-10 rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 text-lg w-full md:w-auto justify-center"
                    >
                        {isSaving ? <span className="animate-spin text-2xl">↻</span> : <Save className="w-6 h-6" />}
                        {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                </motion.div>
            </div>

            {/* Analytics Sidebar */}
            <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-white">
                        <TrendingUp className="w-5 h-5 text-indigo-400"/> Live Profit Ledger
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex justify-between items-center bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                                <div>
                                    <p className="text-sm font-black text-slate-200">Consumer WhatsApp Lead</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Via Meta Voice Search • {i * 12}m ago</p>
                                </div>
                                <div className="text-right">
                                    <span className="bg-red-500/10 text-red-400 text-sm font-black px-3 py-1.5 rounded-lg border border-red-500/20">
                                        -₹3.00
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
                    <h3 className="text-xl font-black mb-2 text-white">Zero-Loss Auto-Recharge</h3>
                    <p className="text-sm text-indigo-200/70 font-medium mb-6">Never lose a ₹3 lead due to low balance.</p>

                    <button
                        onClick={() => initiateTopUp('Growth Pack', 499)}
                        className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        Top Up ₹499 via Razorpay
                    </button>
                </motion.div>
            </div>

        </div>
      </div>
    </div>
  );
}
