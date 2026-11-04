'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic, Camera } from 'lucide-react';

export default function MetaAIFloater() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');

  return (
    <>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="fixed bottom-6 right-6 z-50 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-full shadow-2xl cursor-pointer hover:bg-white/20 flex items-center gap-3 group"
        onClick={() => setIsOpen(true)}
      >
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-spin-slow">
          <span className="text-white font-black text-xl">M</span>
        </div>
        <div className="hidden md:block pr-4">
          <p className="text-white font-bold text-sm">Mee kosam em cheyyali?</p>
          <p className="text-slate-300 text-xs">Meta AI Assistant</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col h-[500px]"
          >
            <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-black text-sm">M</span>
                 </div>
                 <span className="font-bold text-white">Meta AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
               <div className="bg-white/5 p-3 rounded-xl rounded-tl-none w-[80%]">
                 <p className="text-sm text-white">Namaste! How can I help you find local services today?</p>
               </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur">
              <div className="flex items-center gap-2 bg-white/5 rounded-full p-2 border border-white/10">
                <button className="p-2 text-white/50 hover:text-blue-400"><Mic className="w-5 h-5"/></button>
                <button className="p-2 text-white/50 hover:text-purple-400"><Camera className="w-5 h-5"/></button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent text-white text-sm outline-none px-2"
                />
                <button className="p-2 bg-blue-500 rounded-full text-white"><Send className="w-4 h-4"/></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
