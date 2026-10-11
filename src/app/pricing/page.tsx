'use client';
import { CheckCircle2 } from 'lucide-react';

export default function PricingPage() {
  const handlePayment = (planName: string, amount: number) => {
    alert(`Initiating secure Razorpay checkout for ${planName} (₹${amount}). Redirecting to gateway...`);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-16 text-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Merchant Lead Wallet Top-Ups & SaaS Subscriptions</h1>
          <p className="text-xl text-slate-400">Transparent pricing for local pros and B2B enterprises.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Starter Pack */}
          <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 flex flex-col">
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Starter Merchant Pack</h3>
            <div className="text-4xl font-black text-white mb-6">₹199</div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/> <span className="text-sm text-slate-300">100 Verified WhatsApp Lead Credits</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/> <span className="text-sm text-slate-300">Live Ping Badge Access</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/> <span className="text-sm text-slate-300">Pay-As-You-Go: ₹2 per lead handoff</span></li>
            </ul>
            <button onClick={() => handlePayment('Starter Pack', 199)} className="w-full py-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">
              Top Up via Razorpay
            </button>
          </div>

          {/* Growth Pack */}
          <div className="bg-gradient-to-b from-emerald-600 to-teal-700 rounded-3xl p-8 border border-emerald-500 flex flex-col transform md:-translate-y-4 shadow-2xl shadow-emerald-900/50">
            <div className="bg-emerald-400 text-teal-900 text-xs font-black uppercase tracking-wider py-1 px-3 rounded-full self-start mb-4">Most Popular</div>
            <h3 className="text-xl font-bold text-white mb-2">Growth Merchant Pack</h3>
            <div className="text-4xl font-black text-white mb-6">₹499</div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0"/> <span className="text-sm text-emerald-50">275 Verified WhatsApp Lead Credits</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0"/> <span className="text-sm text-emerald-50">Live Ping Badge Access</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0"/> <span className="text-sm text-emerald-50">Pulsing Flash Deals Banner Access</span></li>
            </ul>
            <button onClick={() => handlePayment('Growth Pack', 499)} className="w-full py-4 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-black transition-colors">
              Top Up via Razorpay
            </button>
          </div>

          {/* B2B Pro */}
          <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 flex flex-col">
            <h3 className="text-xl font-bold text-indigo-400 mb-2">B2B Pro Directory Plan</h3>
            <div className="text-4xl font-black text-white mb-2">₹999<span className="text-lg text-slate-500 font-normal">/month</span></div>
            <ul className="space-y-4 mb-8 flex-1 mt-4">
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0"/> <span className="text-sm text-slate-300">Unlimited B2B Trade Workflow Tracking</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0"/> <span className="text-sm text-slate-300">Priority Directory Ranking</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0"/> <span className="text-sm text-slate-300">Local Legend Verification Shield</span></li>
            </ul>
            <button onClick={() => handlePayment('B2B Pro Plan', 999)} className="w-full py-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">
              Subscribe via Razorpay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
