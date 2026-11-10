'use client';
import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function PricingPage() {
  const { toast } = useToast();

  const handleCheckout = (planName: string, amount: number) => {
    toast(`Initiating secure Razorpay checkout for ${planName} (₹${amount}).`, 'info');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 sm:p-16 flex items-center justify-center font-sans">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-2">Merchant Auto-Bidder</h2>
            <p className="text-4xl font-black text-emerald-400 mb-6">₹499<span className="text-sm text-gray-500 font-normal">/mo</span></p>
            <p className="text-gray-400 text-sm mb-8">AI automatically bids on expiring inventory requests in your pincode.</p>
            <button onClick={() => handleCheckout('Auto-Bidder', 499)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors mt-auto">Subscribe Now</button>
         </div>
         <div className="bg-gray-900 border border-purple-500/30 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
            <h2 className="text-2xl font-black text-white mb-2">Enterprise Node</h2>
            <p className="text-4xl font-black text-purple-400 mb-6">₹1999<span className="text-sm text-gray-500 font-normal">/mo</span></p>
            <p className="text-gray-400 text-sm mb-8">Priority bidding, 0% platform fee on deals, and verified local trust badge.</p>
            <button onClick={() => handleCheckout('Enterprise Node', 1999)} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors mt-auto">Go Enterprise</button>
         </div>
      </div>
    </div>
  );
}
