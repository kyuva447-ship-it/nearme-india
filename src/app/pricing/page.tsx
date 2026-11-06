'use client';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const handlePurchase = (planName: string, amount: number) => {
    // FAKE PAYMENT BANNED - Routing strictly to WhatsApp since Razorpay keys are not provided directly
    const message = encodeURIComponent(`Hi NearMe India, I want to purchase the ${planName} plan for ₹${amount}. Please send payment details.`);
    window.open(`https://wa.me/918247831885?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Boost Your Local Business</h1>
          <p className="text-xl text-slate-500 font-medium">Choose a plan to get verified and reach thousands of daily customers in your city.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col">
            <h3 className="text-2xl font-black mb-2 text-slate-800">Verification</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-slate-900">₹499</span>
              <span className="text-slate-500 font-bold">/one-time</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 font-bold text-slate-600"><Check className="text-emerald-500 w-5 h-5" /> Verified Tick Mark</li>
              <li className="flex items-center gap-3 font-bold text-slate-600"><Check className="text-emerald-500 w-5 h-5" /> Basic Listing</li>
              <li className="flex items-center gap-3 font-bold text-slate-600"><Check className="text-emerald-500 w-5 h-5" /> WhatsApp Orders</li>
            </ul>
            <button onClick={() => handlePurchase('Verification', 499)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all">
              Buy Now via WhatsApp
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-b from-emerald-600 to-teal-700 rounded-3xl p-8 border border-emerald-500 shadow-2xl transform md:-translate-y-4 relative flex flex-col text-white">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
              <Star className="w-3 h-3 fill-white" /> Most Popular
            </div>
            <h3 className="text-2xl font-black mb-2 text-emerald-50">Growth Pack</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-white">₹999</span>
              <span className="text-emerald-200 font-bold">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 font-bold text-emerald-50"><Check className="text-emerald-300 w-5 h-5" /> Verified Tick Mark</li>
              <li className="flex items-center gap-3 font-bold text-emerald-50"><Check className="text-emerald-300 w-5 h-5" /> Priority Search Ranking</li>
              <li className="flex items-center gap-3 font-bold text-emerald-50"><Check className="text-emerald-300 w-5 h-5" /> 1 Flash Deal per day</li>
              <li className="flex items-center gap-3 font-bold text-emerald-50"><Check className="text-emerald-300 w-5 h-5" /> Analytics Dashboard</li>
            </ul>
            <button onClick={() => handlePurchase('Growth Pack', 999)} className="w-full bg-white hover:bg-slate-50 text-emerald-700 font-black py-4 rounded-xl transition-all shadow-lg">
              Upgrade Now via WhatsApp
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col">
            <h3 className="text-2xl font-black mb-2 text-slate-800">Domination</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-slate-900">₹4999</span>
              <span className="text-slate-500 font-bold">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 font-bold text-slate-600"><Check className="text-emerald-500 w-5 h-5" /> Everything in Growth</li>
              <li className="flex items-center gap-3 font-bold text-slate-600"><Check className="text-emerald-500 w-5 h-5" /> #1 Position Guaranteed</li>
              <li className="flex items-center gap-3 font-bold text-slate-600"><Check className="text-emerald-500 w-5 h-5" /> Unlimited Deals</li>
              <li className="flex items-center gap-3 font-bold text-slate-600"><Check className="text-emerald-500 w-5 h-5" /> Dedicated Account Manager</li>
            </ul>
            <button onClick={() => handlePurchase('Domination', 4999)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all">
              Contact Sales via WhatsApp
            </button>
          </div>
        </div>

        <div className="mt-16 text-center">
            <Link href="/" className="text-slate-500 hover:text-emerald-600 font-bold transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
