'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Store, CheckCircle2, Loader2, IndianRupee } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function MerchantClaimPage({ params }: { params: { id: string } }) {
  const [shopName, setShopName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleClaim = async () => {
    if (!shopName.trim() || !upiId.trim()) {
      return toast('Enter both Shop Name and UPI ID', 'error');
    }
    setLoading(true);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: shopName.trim(),
          issueType: `Merchant Claim #${params.id} (UPI: ${upiId.trim()})`,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        toast('Order Claimed! Verified via NearMe India Route.', 'success');
      } else {
        toast('Could not verify claim details right now', 'error');
      }
    } catch {
      toast('Connection failed. Please retry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
      return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
            <div className="bg-emerald-950/40 border border-emerald-500/50 p-8 rounded-3xl text-center max-w-sm w-full animate-in fade-in zoom-in duration-300">
               <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
               <h2 className="text-2xl font-black text-white mb-2">Order Claimed!</h2>
               <p className="text-emerald-200 text-sm mb-6">You are now registered on the NearMe India Auto-Bidder network.</p>
               <Link href="/dashboard" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center">
                 Go to Merchant Dashboard
               </Link>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 font-sans text-white">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">LIVE ORDER</div>
        <Store className="w-12 h-12 text-blue-500 mb-4" />
        <h1 className="text-2xl font-black mb-2">Claim This Customer</h1>
        <p className="text-sm text-gray-400 mb-6">A customer nearby locked a deal. Enter your details to claim the order and receive the instant UPI payout via Razorpay Route.</p>

        <div className="space-y-4">
           <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Business / Shop Name</label>
              <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} placeholder="e.g. Balaji Enterprises" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white" />
           </div>
           <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><IndianRupee className="w-3 h-3"/> Settlement UPI ID</label>
              <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="merchant@sbi" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-white font-mono" />
           </div>
           <button disabled={loading} onClick={handleClaim} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-colors flex items-center justify-center h-14 disabled:opacity-50 mt-4">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Claim Order & Join Network'}
           </button>
           <p className="text-center text-[10px] text-gray-500 mt-4">By claiming, you agree to NearMe India's 4% automated platform success fee deduction via Razorpay Split.</p>
        </div>
      </div>
    </div>
  );
}
