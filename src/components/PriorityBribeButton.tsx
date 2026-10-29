'use client';
import { useState } from 'react';
import { Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PriorityBribeButton({ merchantId }: { merchantId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-sm hover:from-amber-400 hover:to-orange-400"
      >
        <Zap className="w-4 h-4" /> Tip ₹50 for Priority Service
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-sm">
              <h2 className="text-xl font-black text-amber-500 mb-2">Urgent 2 AM leak?</h2>
              <p className="text-slate-300 text-sm mb-6">
                Pay a ₹50 tip. NearMe takes 10% (₹5), and the merchant gets ₹45 + an instant priority notification.
              </p>

              <button
                onClick={() => { alert('Razorpay integration here'); setIsOpen(false); }}
                className="w-full bg-amber-500 text-black font-bold py-3 rounded-xl hover:bg-amber-400"
              >
                Pay ₹50 & Get Priority
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-3 text-slate-400 hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
