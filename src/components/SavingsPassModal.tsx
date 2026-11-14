'use client';
import React from 'react';
import { Download, Share2, CheckCircle2 } from 'lucide-react';
import { useToast } from './Toast';

export default function SavingsPassModal({ amount, service, onClose }: { amount: number, service: string, onClose: () => void }) {
  const { toast } = useToast();

  const handleShare = async () => {
    const text = `I just slashed ₹${amount} on ${service} via NearMe India! Check fair prices here: https://www.nearme-india.org`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'NearMe India Savings', text, url: 'https://www.nearme-india.org' });
        return;
      } catch {
        // Fallback to clipboard copy
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast('Share message copied to clipboard!', 'success');
    } catch {
      toast('Share link: https://www.nearme-india.org', 'info');
    }
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 0, 900);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#064e3b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 720, 900);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VERIFIED NEARME INDIA PASS', 360, 150);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText(service.slice(0, 32), 360, 260);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('TOTAL AMOUNT / SAVINGS', 360, 420);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 88px sans-serif';
      ctx.fillText(`INR ${amount.toLocaleString('en-IN')}`, 360, 530);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '20px monospace';
      ctx.fillText('WWW.NEARME-INDIA.ORG', 360, 780);

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `NearMe_Verified_Pass_${Date.now()}.png`;
      a.click();
      toast('Verified Pass image downloaded!', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white z-10">✕</button>

        {/* Rendered "Card" optimized for Instagram/WA Stories */}
        <div id="savings-card" className="bg-gradient-to-b from-blue-900 to-gray-900 border border-blue-500/50 rounded-[2rem] p-8 max-w-sm w-full relative shadow-2xl overflow-hidden aspect-[4/5] flex flex-col items-center justify-center text-center">
            <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle2 className="w-48 h-48" /></div>

            <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-6 z-10" />
            <h2 className="text-2xl font-black text-white mb-2 z-10 uppercase tracking-widest">Verified Pass</h2>
            <p className="text-blue-200 font-medium z-10 mb-8">{service}</p>

            <div className="bg-gray-950/50 backdrop-blur-md rounded-2xl p-6 w-full z-10 border border-gray-700/50">
               <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Slashed</p>
               <p className="text-5xl font-black text-emerald-400">₹{amount}</p>
            </div>

            <p className="text-gray-400 text-xs mt-8 z-10 font-mono">NEARME-INDIA.ORG</p>
        </div>

        <div className="flex gap-4 mt-8 max-w-sm w-full">
            <button onClick={handleDownload} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
               <Download className="w-5 h-5" /> Save
            </button>
            <button onClick={handleShare} className="flex-1 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#25D366]/20">
               <Share2 className="w-5 h-5" /> Share +₹10
            </button>
        </div>
    </div>
  );
}
