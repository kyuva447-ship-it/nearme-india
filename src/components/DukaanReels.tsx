'use client';
import { useState } from 'react';
import { Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DukaanReels({ merchants }: { merchants: any[] }) {
  const [activeReel, setActiveReel] = useState<string | null>(null);

  const merchantsWithReels = merchants.filter(m => m.reel_url || Math.random() > 0.5).map(m => ({
      ...m,
      reel_url: m.reel_url || 'https://www.w3schools.com/html/mov_bbb.mp4' // mock
  }));

  if (merchantsWithReels.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide my-6 px-4">
        {merchantsWithReels.map((merchant, i) => (
          <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => setActiveReel(merchant.reel_url)}>
            <div className="relative w-20 h-20 rounded-full border-2 border-emerald-500 p-1 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden flex items-center justify-center relative">
                 <Play className="absolute text-white/50 w-6 h-6 z-10" />
                 <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${merchant.business_name}`} alt={merchant.business_name} className="w-full h-full object-cover opacity-50" />
              </div>
            </div>
            <span className="text-xs text-white/80 font-medium truncate w-20 text-center">{merchant.business_name}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {activeReel && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
            onClick={() => setActiveReel(null)}
          >
            <div className="relative w-full max-w-sm h-[80vh] bg-slate-900 rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
               <video src={activeReel} autoPlay loop controls className="w-full h-full object-cover" />
               <button onClick={() => setActiveReel(null)} className="absolute top-4 right-4 text-white z-20 bg-black/50 p-2 rounded-full">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
