'use client';
import React from 'react';
import { ShieldCheck, QrCode } from 'lucide-react';

export default function UpiFallbackModal({ amount, onClose, onSuccess }: { amount: number, onClose: () => void, onSuccess: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-gray-950/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
        <ShieldCheck className="w-12 h-12 text-emerald-500 mb-4 mx-auto" />
        <h2 className="text-2xl font-black text-center text-white mb-2">Instant UPI Lock</h2>
        <p className="text-gray-400 text-center mb-6 text-sm">Secure your deal instantly without leaving the app.</p>

        <div className="bg-gray-800 rounded-2xl p-4 mb-6 text-center border border-gray-700">
           <p className="text-gray-400 text-xs uppercase font-bold mb-1">Amount to Lock</p>
           <p className="text-3xl font-black text-emerald-400">₹{amount}</p>
        </div>

        <button onClick={() => { onSuccess(); onClose(); }} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 h-14">
           <QrCode className="w-5 h-5" /> Proceed with Any UPI App
        </button>
      </div>
    </div>
  );
}
