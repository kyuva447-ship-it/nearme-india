'use client';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Box, KeyRound } from 'lucide-react';

export default function CompetitiveEdgeDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Mesh Gradient Background (Feature 41) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <header className="mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
            <ShieldAlert className="w-4 h-4" /> Zero-Trust Architecture
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-black tracking-tight text-white mb-4">
            The Edge <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Advantage</span>
          </motion.h1>
          <p className="text-xl text-slate-400 max-w-2xl">Proprietary algorithms protecting your margins. Blind bids, zero-knowledge reviews, and micro-factory routing.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Feature 7: Blind Reverse Auctions */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="group relative bg-slate-900/50 backdrop-blur-2xl border border-slate-800 p-8 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <KeyRound className="w-32 h-32 text-indigo-500" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white mb-2">Blind Reverse Auctions</h3>
              <p className="text-slate-400 mb-8">Stop bid sniping. Your commercial quotes are SHA-256 hashed. Prices are revealed simultaneously only when the auction closes.</p>

              <div className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-emerald-500 border border-slate-800 break-all">
                <span className="text-slate-600 block mb-1">Encrypted Bid Payload:</span>
                0x8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4
              </div>
            </div>
          </motion.div>

          {/* Feature 6: Micro-Factory Capacity Routing */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="group relative bg-slate-900/50 backdrop-blur-2xl border border-slate-800 p-8 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Box className="w-32 h-32 text-emerald-500" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white mb-2">Capacity Routing Engine</h3>
              <p className="text-slate-400 mb-8">Monetize idle machinery. Our PostGIS algorithm routes commercial overflow work to workshops within 10km.</p>

              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase mb-1">Status</p>
                  <p className="text-emerald-400 font-black flex items-center gap-2"><Zap className="w-4 h-4 fill-emerald-400" /> Accepting Overflow</p>
                </div>
                <button className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-2 px-4 rounded-xl transition-colors border border-slate-700">
                  Pause Routing
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
