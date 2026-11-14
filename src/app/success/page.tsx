'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle2, QrCode, Share2, ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function SuccessPage() {
  const [details, setDetails] = useState<{ payment_id: string | null; amount: string | null; item: string | null } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment_id = params.get('payment_id');
    const amount = params.get('amount');
    const item = params.get('item');

    setDetails({ payment_id, amount, item });
  }, []);

  const handleShare = async () => {
    const text = `I just verified ₹${details?.amount || 499} on ${details?.item || 'a NearMe India deal'}! Check rates here: https://www.nearme-india.org`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'NearMe India Pass', text, url: 'https://www.nearme-india.org' });
        return;
      }
    } catch {
      // Fall back to clipboard copy below
    }
    try {
      await navigator.clipboard.writeText(text);
      toast('Share message copied to clipboard!', 'success');
    } catch {
      toast('Copy link: https://www.nearme-india.org', 'info');
    }
  };

  const handleDownloadReceipt = () => {
    const receiptText = [
      'NearMe India — Verified Payment Pass',
      `Pass / Payment ID: ${details?.payment_id || 'PASS_VERIFIED'}`,
      `Service / Item: ${details?.item || 'NearMe India Service'}`,
      `Amount: INR ${details?.amount || 'Verified'}`,
      `Verified At: ${new Date().toISOString()}`,
      'Portal: https://www.nearme-india.org',
    ].join('\n');
    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NearMe_Pass_${details?.payment_id || 'Verified'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Verified pass receipt downloaded!', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 font-sans text-white">
      <div className="max-w-sm w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
         <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
         <h1 className="text-2xl font-black text-center mb-2 uppercase tracking-widest text-white">Payment Verified</h1>
         <p className="text-gray-400 text-center text-sm mb-8">Your verified pass and escrow lock are ready.</p>

         <div className="bg-emerald-950/40 border border-emerald-500/50 p-6 rounded-2xl mb-8 flex flex-col items-center">
            <QrCode className="w-24 h-24 text-white mb-4" />
            <p className="text-sm font-bold text-emerald-400">Digital Access Pass</p>
            <p className="text-xs text-gray-400 break-all text-center">{details?.payment_id || 'VERIFIED_PASS'}</p>
         </div>

         <div className="space-y-3">
             <button type="button" onClick={handleDownloadReceipt} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download Pass Receipt
             </button>
             <button type="button" onClick={handleShare} className="w-full py-3.5 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20">
                <Share2 className="w-4 h-4" /> Share Savings Link
             </button>
             <Link href="/account" className="w-full py-3.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                My Passes <ArrowRight className="w-4 h-4" />
             </Link>
         </div>
      </div>
    </div>
  );
}
