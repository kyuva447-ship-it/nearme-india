'use client';

import React, { useState } from 'react';
import { Store, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function AddShopPage() {
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560001');
  const [gstin, setGstin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    businessName: string;
    gstin: string;
    trustScore: number;
    mod36ChecksumValid: boolean;
  } | null>(null);
  const { toast } = useToast();

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !gstin.trim()) {
      toast('Enter business name and 15-digit GSTIN', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          gstin: gstin.trim().toUpperCase(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        toast('Shop verified and registered for ₹99/day AI Twin onboarding!', 'success');
      } else {
        toast(data.error || 'Verification failed', 'error');
      }
    } catch {
      toast('Connection failed. Please retry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
          <Store className="w-7 h-7 text-emerald-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black">Onboard Your Shop (₹99/Day AI Twin)</h1>
          <p className="text-slate-400 text-xs mt-1">
            Verify your GSTIN via Mod-36 check right on-site to claim Pan-India 15/85 Escrow orders.
          </p>
        </div>

        {!result ? (
          <form onSubmit={handleOnboard} className="space-y-3">
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Business / Pharmacy / Supplier Name"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City (e.g. Bengaluru)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Pincode"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="15-Character GSTIN (e.g. 29AABCS1429B1ZQ)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono uppercase outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Verify GSTIN &amp; Activate On-Site
            </button>
          </form>
        ) : (
          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-5 space-y-3 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="font-bold text-white">{result.businessName}</p>
            <p className="text-xs font-mono text-emerald-300">
              {result.gstin} · Trust Score {result.trustScore}/100 · Mod-36{' '}
              {result.mod36ChecksumValid ? 'PASSED' : 'FORMAT CHECKED'}
            </p>
            <Link
              href="/dashboard"
              className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
            >
              Open Merchant Autopilot Dashboard
            </Link>
          </div>
        )}

        <div className="text-center pt-2 border-t border-slate-800">
          <Link href="/" className="text-xs text-slate-400 hover:text-white">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
