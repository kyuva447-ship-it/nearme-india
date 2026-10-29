'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, Users, Activity } from 'lucide-react';

export default function OwnerProfitDashboard() {
  const [liveProfit, setLiveProfit] = useState(15423.00);
  const [liveLeads, setLiveLeads] = useState(5141);

  // Simulate live ₹3 deductions coming in
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveProfit(prev => prev + 3);
      setLiveLeads(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-100 font-sans relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-12">
        <h1 className="text-3xl font-black text-slate-400 mb-2">LIVE PLATFORM PROFIT</h1>
        <div className="text-8xl md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-600 tabular-nums tracking-tighter">
          ₹{liveProfit.toLocaleString()}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl flex flex-col items-center justify-center">
            <Activity className="w-8 h-8 text-indigo-400 mb-2 animate-pulse" />
            <p className="text-slate-400 font-bold mb-1">Live B2C Leads</p>
            <p className="text-3xl font-black text-white">{liveLeads.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl flex flex-col items-center justify-center">
            <IndianRupee className="w-8 h-8 text-amber-400 mb-2" />
            <p className="text-slate-400 font-bold mb-1">ARPU (Per Merchant)</p>
            <p className="text-3xl font-black text-white">₹199</p>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl flex flex-col items-center justify-center">
            <Users className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-slate-400 font-bold mb-1">Active Micro-Franchises</p>
            <p className="text-3xl font-black text-white">42</p>
        </div>
      </div>
    </div>
  );
}
