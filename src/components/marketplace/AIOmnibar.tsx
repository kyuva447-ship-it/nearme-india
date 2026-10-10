'use client';
import { useState } from 'react';
import { Search, Sparkles, Factory, Store, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIOmnibar({ onIntentDetected }: { onIntentDetected: (intent: 'B2C' | 'B2B', query: string) => void }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Simulate Edge Function NLP Intent parsing
    const lowerQ = query.toLowerCase();
    const isB2B = lowerQ.includes('bulk') || lowerQ.includes('factory') || lowerQ.includes('wholesale') || lowerQ.includes('commercial');

    onIntentDetected(isB2B ? 'B2B' : 'B2C', query);
  };

  return (
    <div className="relative z-50 w-full max-w-3xl mx-auto mt-8">
      <motion.form
        initial={false}
        animate={{ scale: isFocused ? 1.02 : 1 }}
        onSubmit={handleSearch}
        className={`relative flex items-center bg-white rounded-full transition-all duration-300 ${
          isFocused ? 'shadow-2xl shadow-indigo-500/20 border-2 border-indigo-500' : 'shadow-lg border-2 border-slate-100'
        }`}
      >
        <div className="pl-6 text-indigo-500">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask AI: 'I need a plumber' or 'Find 1000kg copper wire supplier'"
          className="w-full py-5 px-4 bg-transparent border-none outline-none text-lg font-medium text-slate-800 placeholder:text-slate-400"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="p-2 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        )}
        <button
          type="submit"
          className="m-2 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full transition-colors flex items-center gap-2"
        >
          <Search className="w-5 h-5" /> Omni-Search
        </button>
      </motion.form>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-4 bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/50 flex gap-4"
          >
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100/50 cursor-pointer hover:shadow-md transition-all">
              <Store className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">B2C Consumer Mode</h4>
              <p className="text-xs text-slate-500 mt-1">Find local shops, tradespeople, and instant services via map.</p>
            </div>
            <div className="flex-1 bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100/50 cursor-pointer hover:shadow-md transition-all">
              <Factory className="w-6 h-6 text-amber-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">B2B Procurement Mode</h4>
              <p className="text-xs text-slate-500 mt-1">Post bulk RFQs and access verified commercial suppliers.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
