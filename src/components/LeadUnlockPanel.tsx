'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Phone,
  Lock,
  Unlock,
  Crown,
  Wallet,
  Loader2,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { triggerNearMeCheckout } from '@/lib/razorpayClient';
import { useToast } from './Toast';

interface LeadItem {
  id: string;
  customer_name: string;
  requirement: string;
  city: string;
  unlocked: boolean;
  display_phone: string;
  fee_charged_inr: number;
  created_at: string;
}

interface WalletState {
  merchant_id: string;
  balance_inr: number;
  free_leads_remaining: number;
  is_verified_pro: boolean;
}

export default function LeadUnlockPanel({ phone }: { phone: string }) {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadInbox = useCallback(async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/monetization/unlock-lead?phone=${encodeURIComponent(phone)}`);
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
        setLeads(data.leads || []);
      }
    } finally {
      setLoading(false);
    }
  }, [phone]);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const handleUnlock = async (leadId: string) => {
    if (!wallet?.merchant_id) return;
    setBusyId(leadId);
    try {
      const res = await fetch('/api/monetization/unlock-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: wallet.merchant_id, leadId }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'unlocked') {
        toast(
          data.used_free_lead
            ? `Lead unlocked using free credit (${data.free_leads_remaining} free left)!`
            : 'Lead unlocked for ₹49 from wallet!',
          'success'
        );
        await loadInbox();
        return;
      }

      if (res.status === 402) {
        triggerNearMeCheckout({
          itemName: 'Pay-to-Unlock Lead (₹49)',
          amountInRupees: 49,
          actionType: 'lead_unlock',
          metadata: { merchant_id: wallet.merchant_id, lead_id: leadId },
          onSuccess: () => {
            toast('Lead unlocked via Razorpay!', 'success');
            loadInbox();
          },
          onFallback: () => {
            toast('Low wallet balance. Top up ₹199 or ₹499 to unlock leads instantly.', 'info');
          },
        });
      } else {
        toast(data.error || 'Could not unlock lead', 'error');
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleRecharge = (amount: 199 | 499) => {
    triggerNearMeCheckout({
      itemName: `Merchant Lead Wallet Top-Up (₹${amount})`,
      amountInRupees: amount,
      actionType: 'wallet_recharge',
      metadata: wallet?.merchant_id ? { merchant_id: wallet.merchant_id } : undefined,
      onSuccess: () => {
        toast(`₹${amount} added to your Lead Wallet!`, 'success');
        loadInbox();
      },
      onFallback: () => toast('Razorpay unavailable — retry shortly', 'error'),
    });
  };

  const handleProUpgrade = () => {
    triggerNearMeCheckout({
      itemName: 'Verified Pro Monthly Subscription (₹299/mo)',
      amountInRupees: 299,
      actionType: 'pro_subscription',
      metadata: wallet?.merchant_id ? { merchant_id: wallet.merchant_id } : undefined,
      onSuccess: () => {
        toast('Verified Pro activated! Ranked #1 in local search.', 'success');
        loadInbox();
      },
      onFallback: () => toast('Pro upgrade checkout could not open', 'error'),
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex items-center justify-center gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading Lead Wallet &amp; Inbox...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet & Verified Pro Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
            <span>Lead Wallet Balance</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white tabular-nums">
            ₹{Number(wallet?.balance_inr || 0).toLocaleString('en-IN')}
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleRecharge(199)}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg"
            >
              + ₹199 Top-Up
            </button>
            <button
              type="button"
              onClick={() => handleRecharge(499)}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg"
            >
              + ₹499 Pack
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
            <span>Free Trial Leads Left</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400 tabular-nums">
            {wallet?.free_leads_remaining ?? 2} / 2
          </p>
          <p className="text-xs text-gray-400">
            First 2 customer numbers unlock free. Subsequent leads cost ₹49/unlock.
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
            <span>Verified Pro Status</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          {wallet?.is_verified_pro ? (
            <div className="flex items-center gap-2 text-emerald-400 font-black text-lg">
              <ShieldCheck className="w-5 h-5" /> VERIFIED PRO ACTIVE
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-300">
                Rank #1 in local searches + Verified Pro Shield for ₹299/month.
              </p>
              <button
                type="button"
                onClick={handleProUpgrade}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl"
              >
                Upgrade to Verified Pro (₹299/mo)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Masked Leads Inbox */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Phone className="w-5 h-5 text-emerald-400" />
          Customer Leads Inbox ({leads.length})
        </h3>
        {leads.length === 0 ? (
          <p className="text-sm text-gray-400">
            No matched customer leads yet. When AI matches nearby buyers to your category, their
            masked phone numbers appear here.
          </p>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-gray-950 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="font-bold text-white text-sm">
                    {lead.customer_name} · <span className="text-cyan-400">{lead.city}</span>
                  </p>
                  <p className="text-xs text-gray-300">{lead.requirement}</p>
                  <p className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    {lead.unlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
                    {lead.display_phone}
                  </p>
                </div>
                {lead.unlocked ? (
                  <a
                    href={`tel:${lead.display_phone}`}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl text-center"
                  >
                    Call Customer Now
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled={busyId === lead.id}
                    onClick={() => handleUnlock(lead.id)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2"
                  >
                    {busyId === lead.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : wallet && wallet.free_leads_remaining > 0 ? (
                      'Unlock Free Lead'
                    ) : (
                      'Unlock Phone (₹49)'
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
