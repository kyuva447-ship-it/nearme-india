'use client';
import React, { useState } from 'react';
import { MicOff, Send } from 'lucide-react';
import { useToast } from './Toast';

export default function VoiceFallbackModal({ onClose, onQuery }: { onClose: () => void, onQuery: (q: string) => void }) {
  const [input, setInput] = useState('');
  const { toast } = useToast();

  const presets = [
    "AC Service in Bengaluru for ₹399",
    "Full Body Checkup for ₹799",
    "Dental Cleaning for ₹499",
    "Tailoring & Alteration for ₹250"
  ];

  const handleSubmit = () => {
    if (!input.trim()) return toast('Enter a deal request', 'error');
    onQuery(input);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
        <MicOff className="w-10 h-10 text-gray-500 mb-4 mx-auto" />
        <h2 className="text-xl font-black text-center text-white mb-2">Microphone Unavailable</h2>
        <p className="text-gray-400 text-center mb-6 text-sm">Your browser blocked voice access. Type your request or pick a quick deal below.</p>

        <div className="flex bg-gray-800 border border-gray-700 rounded-xl overflow-hidden mb-6">
           <input
             type="text" autoFocus value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSubmit()}
             placeholder="e.g. Broken AC repair for 500"
             className="flex-1 bg-transparent px-4 py-3 text-white outline-none focus:border-blue-500"
           />
           <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-500 px-4 flex items-center justify-center"><Send className="w-4 h-4 text-white"/></button>
        </div>

        <p className="text-xs font-bold text-gray-500 uppercase mb-3">Popular Local Deals</p>
        <div className="flex flex-col gap-2">
            {presets.map((p, i) => (
               <button key={i} onClick={() => { onQuery(p); onClose(); }} className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors">
                  {p}
               </button>
            ))}
        </div>
      </div>
    </div>
  );
}
