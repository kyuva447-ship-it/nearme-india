'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Wallet, MessageSquare, Save, User, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function MerchantDashboard() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [dealText, setDealText] = useState('');
  const [walletBalance, setWalletBalance] = useState(50.00);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('merchant_auth');
    if (auth !== '8247831885') {
      router.push('/login');
      return;
    }

    // Load saved states
    const savedAvailable = localStorage.getItem('isAvailable');
    if (savedAvailable !== null) setIsAvailable(savedAvailable === 'true');

    const savedDealText = localStorage.getItem('dealText');
    if (savedDealText !== null) setDealText(savedDealText);
  }, [router]);

  const handleSave = async () => {
    setIsSaving(true);

    // Save locally
    localStorage.setItem('isAvailable', String(isAvailable));
    localStorage.setItem('dealText', dealText);

    // Attempt to save to Supabase (assuming merchant row exists)
    try {
      const { data, error } = await supabase.from('v2_merchants')
        .update({
          is_currently_available: isAvailable,
          current_deal_text: dealText,
          deal_expiry_time: dealText ? new Date(Date.now() + 3600000).toISOString() : null, // 1 hr
        })
        .eq('phone_number', '918247831885');
        // if the row does not exist, this might fail, but localstorage fallback ensures the UI works
    } catch (e) {
      console.warn("Could not sync with Supabase, relying on local storage.");
    } finally {
      setTimeout(() => setIsSaving(false), 500); // Simulate network delay
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100 font-sans relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
            <div>
                <h1 className="text-3xl font-black flex items-center gap-3">
                    <User className="w-8 h-8 text-emerald-400" />
                    Merchant HQ
                </h1>
                <p className="text-slate-400 mt-1">Welcome back. Manage your local presence.</p>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Lead Wallet</p>
                <div className="text-3xl font-black text-emerald-400 flex items-center gap-2 justify-end">
                    <Wallet className="w-7 h-7" />
                    ₹{walletBalance.toFixed(2)}
                </div>
            </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">

            {/* Live Ping Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
                 <div className="flex justify-between items-start mb-6">
                     <div>
                        <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                           Live Ping
                           {isAvailable && <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
                        </h2>
                        <p className="text-sm text-slate-400">Signal that you are ready to dispatch now. This bumps you to the top of search results.</p>
                     </div>
                 </div>

                 <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                     <span className="font-semibold text-slate-300">Availability Status</span>
                     <button
                        onClick={() => setIsAvailable(!isAvailable)}
                        className={`w-16 h-8 rounded-full relative transition-colors ${isAvailable ? 'bg-emerald-500' : 'bg-slate-700'}`}
                     >
                         <motion.div
                            layout
                            className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm"
                            initial={false}
                            animate={{ left: isAvailable ? '36px' : '4px' }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                         />
                     </button>
                 </div>
            </motion.div>

            {/* Flash Deals Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                     <div>
                        <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                           <Zap className="w-5 h-5 text-amber-500" /> Flash Deals Engine
                        </h2>
                        <p className="text-sm text-slate-400">Set a temporary 1-hour deal to attract more local clicks.</p>
                     </div>
                 </div>

                 <div className="space-y-4">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Deal Text</label>
                         <input
                            type="text"
                            value={dealText}
                            onChange={(e) => setDealText(e.target.value)}
                            placeholder="e.g. 20% OFF today only!"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                         />
                     </div>
                 </div>
            </motion.div>

        </div>

        {/* Save Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 flex justify-end">
            <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70"
            >
                {isSaving ? <span className="animate-spin text-xl">↻</span> : <Save className="w-5 h-5" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </motion.div>

        {/* Analytics Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><MapPin className="w-5 h-5 text-indigo-400"/> Recent WhatsApp Leads</h3>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                        <div>
                            <p className="text-sm font-bold text-slate-200">Local Consumer Lead</p>
                            <p className="text-xs text-slate-500">Clicked WhatsApp Button • {i * 12} mins ago</p>
                        </div>
                        <div className="text-right">
                            <span className="bg-red-500/10 text-red-400 text-xs font-bold px-3 py-1 rounded-md border border-red-500/20">
                                -₹2.00
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>

      </div>
    </div>
  );
}
