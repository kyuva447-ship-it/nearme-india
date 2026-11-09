'use client';
import React, { useState } from 'react';
import { Mic, MessageSquare, X } from 'lucide-react';

export default function AutonomousSupportOrb() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:scale-110 transition-transform z-50 group"
      >
        <MessageSquare className="w-7 h-7 text-white" />
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping group-hover:hidden"></div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col font-sans">
      <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="font-bold text-white text-sm">24/7 AI Support Agent</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="h-64 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="bg-slate-800 rounded-2xl rounded-tl-none p-3 text-sm text-slate-300 w-[85%]">
          Hello! I am the Autonomous Engine. I can issue refunds, help you track a bid, or build a mini-app for you. Talk to me in English, Telugu, Hindi, Tamil, or Kannada.
        </div>
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
        <input
          type="text"
          placeholder="Ask me anything..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 text-sm text-white outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => setIsListening(!isListening)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          <Mic className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}