'use client';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/Toast';
import UpiFallbackModal from '@/components/UpiFallbackModal';
import SavingsPassModal from '@/components/SavingsPassModal';

export default function PricingPage() {
  const { toast } = useToast();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [fallbackPlan, setFallbackPlan] = useState<{ name: string; amount: number } | null>(null);
  const [confirmedPlan, setConfirmedPlan] = useState<{ name: string; amount: number } | null>(null);

  const handlePayment = async (planName: string, amount: number) => {
    setBusyPlan(planName);
    toast(`Initiating secure Razorpay checkout for ${planName} (₹${amount})...`, 'info');
    try {
      const savedPhone =
        typeof window !== 'undefined' ? localStorage.getItem('nearme_user_phone') || '' : '';
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          receipt: `plan_${Date.now()}`,
          itemName: planName,
          customerIdentifier: savedPhone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data?.error || 'Could not initiate checkout order', 'error');
        return;
      }

      if (data.fallbackMode || !data.id || !data.key_id) {
        setFallbackPlan({ name: planName, amount });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Rzp = typeof window !== 'undefined' ? (window as any).Razorpay : null;
      if (!Rzp) {
        setFallbackPlan({ name: planName, amount });
        return;
      }

      const rzp = new Rzp({
        key: data.key_id,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'NearMe India',
        description: planName,
        order_id: data.id,
        handler: (response: { razorpay_payment_id?: string }) => {
          toast(`${planName} activated!`, 'success');
          window.location.href = `/success?payment_id=${encodeURIComponent(
            response.razorpay_payment_id || data.id
          )}&amount=${amount}&item=${encodeURIComponent(planName)}`;
        },
        prefill: savedPhone ? { contact: savedPhone } : undefined,
        theme: { color: '#059669' },
        modal: {
          ondismiss: () => setFallbackPlan({ name: planName, amount }),
        },
      });
      rzp.on('payment.failed', () => setFallbackPlan({ name: planName, amount }));
      rzp.open();
    } catch {
      toast('Checkout gateway unavailable right now', 'error');
    } finally {
      setBusyPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-16 text-slate-100">
      {fallbackPlan && (
        <UpiFallbackModal
          amount={fallbackPlan.amount}
          onClose={() => setFallbackPlan(null)}
          onSuccess={() => {
            setConfirmedPlan(fallbackPlan);
            setFallbackPlan(null);
            toast(`${fallbackPlan.name} lock recorded!`, 'success');
          }}
        />
      )}
      {confirmedPlan && (
        <SavingsPassModal
          amount={confirmedPlan.amount}
          service={confirmedPlan.name}
          onClose={() => setConfirmedPlan(null)}
        />
      )}
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
            <button
              type="button"
              disabled={busyPlan === 'Starter Pack'}
              onClick={() => handlePayment('Starter Pack', 199)}
              className="w-full py-4 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-60 text-white font-bold transition-colors"
            >
              {busyPlan === 'Starter Pack' ? 'Opening Razorpay...' : 'Top Up via Razorpay'}
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
            <button
              type="button"
              disabled={busyPlan === 'Growth Pack'}
              onClick={() => handlePayment('Growth Pack', 499)}
              className="w-full py-4 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 font-black transition-colors"
            >
              {busyPlan === 'Growth Pack' ? 'Opening Razorpay...' : 'Top Up via Razorpay'}
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
            <button
              type="button"
              disabled={busyPlan === 'B2B Pro Plan'}
              onClick={() => handlePayment('B2B Pro Plan', 999)}
              className="w-full py-4 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-60 text-white font-bold transition-colors"
            >
              {busyPlan === 'B2B Pro Plan' ? 'Opening Razorpay...' : 'Subscribe via Razorpay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
