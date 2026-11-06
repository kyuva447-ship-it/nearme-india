'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ShieldCheck } from 'lucide-react';

export default function PriorityBribeButton({ rfqId }: { rfqId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePurchase = () => {
    // Explicitly routing to WhatsApp to avoid fake payment mocks.
    const message = encodeURIComponent(`Hi NearMe India, I want to instantly unlock RFQ Lead: ${rfqId}. Please provide payment instructions.`);
    window.open(`https://wa.me/918247831885?text=${message}`, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
      >
        <Zap className="w-5 h-5" />
        Bribe AI Algorithm (₹250)
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-md w-full relative"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Instant Lead Unlock</h3>
                <p className="text-slate-400">Pay ₹250 to instantly receive customer contact details for this RFQ.</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handlePurchase}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-colors"
                >
                  Pay via WhatsApp
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
