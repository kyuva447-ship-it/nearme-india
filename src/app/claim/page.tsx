'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Wallet,
  Crown,
  Sparkles,
  Lock,
  PhoneCall,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';
import { triggerNearMeCheckout } from '@/lib/razorpayClient';
import { useToast } from '@/components/Toast';

interface InvitedLead {
  business_name: string;
  phone?: string;
  city: string;
  category: string;
  address?: string;
  rating?: number;
  status: string;
}

function ClaimContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const { toast } = useToast();

  const [loadingLead, setLoadingLead] = useState(Boolean(token));
  const [submitting, setSubmitting] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [category, setCategory] = useState('Local Services');
  const [gstin, setGstin] = useState('');
  const [claimedMerchantId, setClaimedMerchantId] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<InvitedLead | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/claim?token=${encodeURIComponent(token)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.lead) {
          setInviteInfo(data.lead);
          setBusinessName(data.lead.business_name || '');
          setCity(data.lead.city || 'Bengaluru');
          setCategory(data.lead.category || 'Local Services');
          if (data.lead.phone) {
            setPhone(String(data.lead.phone).replace(/\D/g, '').slice(-10));
          }
          if (data.lead.claimed_merchant_id) {
            setClaimedMerchantId(data.lead.claimed_merchant_id);
          }
        }
      })
      .finally(() => setLoadingLead(false));
  }, [token]);

  const handleClaimProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !/^[6-9]\d{9}$/.test(phone)) {
      toast('Enter your Business Name and valid 10-digit Indian mobile number', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          businessName: businessName.trim(),
          phone,
          city: city.trim(),
          category: category.trim(),
          gstin: gstin.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.merchant_id) {
        localStorage.setItem('nearme_user_phone', data.phone);
        setClaimedMerchantId(data.merchant_id);
        toast('Profile claimed! 2 Free Customer Leads unlocked.', 'success');
      } else {
        toast(data.error || 'Could not claim profile', 'error');
      }
    } catch {
      toast('Network error while claiming profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstantTopup = (amount: 199 | 499 | 299, type: 'wallet_recharge' | 'pro_subscription') => {
    triggerNearMeCheckout({
      itemName:
        type === 'pro_subscription'
          ? 'Verified Pro Monthly Plan (₹299/mo)'
          : `Lead Wallet Top-Up (₹${amount})`,
      amountInRupees: amount,
      actionType: type,
      metadata: claimedMerchantId ? { merchant_id: claimedMerchantId } : undefined,
      onSuccess: () => {
        toast('Payment verified! Redirecting to Merchant Dashboard...', 'success');
        router.push('/dashboard');
      },
      onFallback: () => toast('Could not open Razorpay checkout right now', 'error'),
    });
  };

  if (loadingLead) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" /> Loading your invited business profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 30-Second Claim Form */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Store className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              2 FREE LEADS INCLUDED
            </span>
          </div>

        {!claimedMerchantId ? (
          <>
            <div>
              <h1 className="text-2xl font-black">
                {inviteInfo ? `Claim ${inviteInfo.business_name}` : 'Claim Your Business Profile'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Activate in 30 seconds. Get 2 free unlocked customer phone numbers immediately with zero manual approval.
              </p>
            </div>

            <form onSubmit={handleClaimProfile} className="space-y-3">
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business / Shop Name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-Digit Mobile"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Service Category (e.g. Diagnostic Labs)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="Optional 15-Char GSTIN (Instant Trust Boost)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono uppercase text-white outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" /> 1-Click Claim &amp; Unlock 2 Free Leads
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-5">
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-xl font-black text-white">{businessName} is Live!</h2>
              <p className="text-xs text-emerald-200">
                2 Free Leads credited. Pre-load wallet or upgrade to Verified Pro to rank #1 in {city}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInstantTopup(199, 'wallet_recharge')}
                className="p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-2xl text-left space-y-1"
              >
                <Wallet className="w-5 h-5 text-emerald-400" />
                <p className="font-black text-sm text-white">₹199 Starter Wallet</p>
                <p className="text-[11px] text-slate-400">4 Paid Lead Unlocks</p>
              </button>
              <button
                type="button"
                onClick={() => handleInstantTopup(499, 'wallet_recharge')}
                className="p-4 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-2xl text-left space-y-1"
              >
                <Sparkles className="w-5 h-5 text-blue-400" />
                <p className="font-black text-sm text-white">₹499 Growth Wallet</p>
                <p className="text-[11px] text-slate-400">10 Paid Lead Unlocks</p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleInstantTopup(299, 'pro_subscription')}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl flex items-center justify-center gap-2 text-sm"
            >
              <Crown className="w-4 h-4 text-amber-300" /> Upgrade to Verified Pro Badge (₹299/month)
            </button>

            <Link
              href="/dashboard"
              className="block w-full py-3 text-center bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
            >
              Skip for now &amp; Open Merchant Dashboard
            </Link>
          </div>
        )}
        </div>

        {/* Right: First-Time Merchant Trust & How-It-Works Guide */}
        <aside className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                New to NearMe India?
              </p>
              <h2 className="text-xl font-black text-white">
                How NearMe India Brings Verified Customers to Your Shop
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                NearMe India connects local buyers across 19,300+ pincodes with verified Indian businesses—with zero upfront fees to start.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">1. Claim Free &amp; Get 2 Free Customer Leads</p>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    Confirm your shop name and mobile number in 30 seconds. Your wallet starts with 2 free unlocked buyer leads so you can test real inquiries before spending a rupee.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
                <Wallet className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">2. Pay Only When You Want Extra Leads (₹49)</p>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    No compulsory monthly contract. Unlock additional customer contacts for ₹49 each, or optionally upgrade to Verified Pro (₹299/mo) to rank #1 in your city.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">3. 15/85 Razorpay Escrow &amp; MSME 43B(h) Protection</p>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    When buyers lock a wholesale or service order via Razorpay Escrow, you know the buyer is serious—85% settles upon 6-digit Delivery OTP confirmation.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
                <FileCheck2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">4. GSTIN Mod-36 Verification Boosts Trust to 96%</p>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    Adding your optional 15-character GSTIN verifies your shop automatically and signals high trust to nearby buyers and corporate syndicates.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap gap-3 text-slate-300">
                <Link href="/about" className="hover:text-white underline">
                  About Us (Bengaluru)
                </Link>
                <Link href="/pricing" className="hover:text-white underline">
                  Full Pricing
                </Link>
                <Link href="/escrow" className="hover:text-white underline">
                  How Escrow Works
                </Link>
                <Link href="/refund-policy" className="hover:text-white underline">
                  48h Refund Policy
                </Link>
              </div>
              <Link
                href="/contact"
                className="text-emerald-300 hover:text-emerald-200 font-bold flex items-center gap-1"
              >
                24/7 Support <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function ClaimBusinessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        </div>
      }
    >
      <ClaimContent />
    </Suspense>
  );
}
