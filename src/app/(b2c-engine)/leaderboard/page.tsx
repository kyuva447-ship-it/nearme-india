'use client';
import { motion } from 'framer-motion';
import { Trophy, Flame, Share2, ArrowUpRight } from 'lucide-react';

export default function ViralLeaderboard() {
  const leaders = [
    { rank: 1, name: 'Suresh Electricians', score: 1450, conversions: 89, trending: true },
    { rank: 2, name: 'Metro Fast Plumbers', score: 1220, conversions: 65, trending: false },
    { rank: 3, name: 'Priya Boutique', score: 980, conversions: 42, trending: true },
    { rank: 4, name: 'A1 Carpenters', score: 850, conversions: 38, trending: false },
    { rank: 5, name: 'QuickFix Appliances', score: 720, conversions: 29, trending: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Trophy className="w-10 h-10 text-indigo-600" />
          </motion.div>
          <h1 className="text-3xl font-black text-slate-900">Neighborhood Legends</h1>
          <p className="text-slate-500 mt-2">The most trusted local pros this week. Earn points when neighbors book you!</p>
        </header>

        {/* Viral Affiliate Invite Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 mb-8 text-white shadow-xl shadow-indigo-500/20"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold mb-1">Earn Free Leads</h3>
              <p className="text-indigo-100 text-sm">Invite a neighbor. Get ₹50 in your wallet.</p>
            </div>
            <button className="bg-white text-indigo-600 font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-50 transition-colors">
              <Share2 className="w-4 h-4" /> Share Link
            </button>
          </div>
        </motion.div>

        {/* The Leaderboard */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          {leaders.map((l, i) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={l.rank}
              className={`flex items-center p-4 md:p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${i === 0 ? 'bg-indigo-50/30' : ''}`}
            >
              <div className={`w-8 h-8 flex items-center justify-center font-black rounded-full mr-4 ${i === 0 ? 'bg-amber-400 text-amber-900' : i === 1 ? 'bg-slate-300 text-slate-700' : i === 2 ? 'bg-amber-700/30 text-amber-900' : 'text-slate-400'}`}>
                {l.rank}
              </div>

              <div className="flex-1">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  {l.name}
                  {l.trending && <Flame className="w-4 h-4 text-orange-500 animate-pulse" />}
                </h4>
                <p className="text-xs text-slate-500">{l.conversions} verified bookings</p>
              </div>

              <div className="text-right">
                <p className="font-black text-indigo-600 flex items-center gap-1 justify-end">
                  {l.score} <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trust Score</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
