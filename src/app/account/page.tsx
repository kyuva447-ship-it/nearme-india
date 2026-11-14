'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Wallet, Copy, History, QrCode, Settings, Bell, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import QuickAuthModal from '@/components/QuickAuthModal';

interface VaultOrder {
  id: string;
  amountInr: number;
  status: string;
  createdAt: string;
  label?: string;
}

export default function AccountPage() {
  const [phone, setPhone] = useState('');
  const [ready, setReady] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<'passes' | 'history' | 'wallet' | 'settings'>('passes');
  const [orders, setOrders] = useState<VaultOrder[]>([]);
  const [passes, setPasses] = useState<VaultOrder[]>([]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchUserData = useCallback(async (userPhone: string) => {
    const mergedOrders: VaultOrder[] = [];
    const mergedPasses: VaultOrder[] = [];

    try {
      const { data: recentOrders } = await supabase
        .from('autonomous_treasury_ledger')
        .select('*')
        .eq('user_phone', userPhone)
        .order('created_at', { ascending: false });

      if (recentOrders) {
        for (const o of recentOrders) {
          const entry: VaultOrder = {
            id: String(o.id),
            amountInr: Number(o.gross_inr || 0),
            status: String(o.status || 'RECORDED'),
            createdAt: o.created_at || new Date().toISOString(),
          };
          if (entry.amountInr > 50) mergedOrders.push(entry);
          else if (entry.status === 'PAID') mergedPasses.push(entry);
        }
      }
    } catch {
      // Supabase optional
    }

    try {
      const [ordRes, escRes] = await Promise.all([fetch('/api/orders'), fetch('/api/escrow')]);
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        if (Array.isArray(ordData.orders)) {
          for (const o of ordData.orders) {
            if (!o.customerIdentifier || String(o.customerIdentifier).includes(userPhone)) {
              const inr = Math.round(Number(o.amount || 0) / 100);
              mergedOrders.push({
                id: String(o.id),
                amountInr: inr,
                status: String(o.status || 'created'),
                createdAt: o.created_at ? new Date(o.created_at * 1000).toISOString() : new Date().toISOString(),
                label: o.itemName || undefined,
              });
            }
          }
        }
      }
      if (escRes.ok) {
        const escData = await escRes.json();
        if (Array.isArray(escData.escrows)) {
          for (const e of escData.escrows) {
            mergedOrders.push({
              id: String(e.id),
              amountInr: Number(e.total_amount_inr || 0),
              status: String(e.status || 'ESCROW_LOCKED_15_85'),
              createdAt: String(e.created_at || new Date().toISOString()),
              label: `${e.merchant_name} (OTP: ${e.delivery_otp})`,
            });
          }
        }
      }
    } catch {
      // Network optional
    }

    setOrders(mergedOrders);
    setPasses(mergedPasses);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('nearme_user_phone') || '';
    const savedAlerts = localStorage.getItem('nearme_alerts_enabled');
    if (savedAlerts !== null) setAlertsEnabled(savedAlerts === 'true');
    setPhone(saved);
    setReady(true);
    if (saved) {
      fetchUserData(saved);
    }
  }, [fetchUserData]);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(`https://www.nearme-india.org/?ref=${phone}`);
      toast('Copied to clipboard!', 'success');
    } catch {
      toast('Copy failed — select link manually', 'error');
    }
  };

  if (!ready) return null;

  if (!phone) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4 font-sans">
        {showAuth && (
          <QuickAuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={() => {
              const saved = localStorage.getItem('nearme_user_phone') || '';
              setPhone(saved);
              setShowAuth(false);
              if (saved) fetchUserData(saved);
            }}
          />
        )}
        <div className="max-w-sm w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <User className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black">Customer Vault</h1>
          <p className="text-sm text-gray-400">Sign in via On-Site OTP to view your Digital Passes, 15/85 Escrows, and Referral Wallet.</p>
          <button
            type="button"
            onClick={() => setShowAuth(true)}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
          >
            Sign In via On-Site OTP
          </button>
          <Link href="/" className="block text-xs text-gray-400 hover:text-white">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8">Customer Vault</h1>

        {/* 4-TAB NAVIGATION */}
        <div className="flex overflow-x-auto gap-2 border-b border-gray-800 pb-4 mb-8">
            <button type="button" onClick={() => setActiveTab('passes')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap ${activeTab === 'passes' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}>Active Passes</button>
            <button type="button" onClick={() => setActiveTab('history')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap ${activeTab === 'history' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}>Deal History</button>
            <button type="button" onClick={() => setActiveTab('wallet')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap ${activeTab === 'wallet' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}>Referral Wallet</button>
            <button type="button" onClick={() => setActiveTab('settings')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap ${activeTab === 'settings' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}>Settings</button>
        </div>

        {activeTab === 'passes' && (
           <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><QrCode className="w-5 h-5 text-blue-400"/> Your Digital QR Passes</h3>
             {passes.length > 0 ? passes.map((p, i) => (
                <div key={i} className="p-4 bg-gray-800 rounded-xl border border-gray-700 flex items-center gap-4 mb-4">
                  <div className="bg-white p-2 rounded-lg"><QrCode className="w-12 h-12 text-black" /></div>
                  <div>
                    <p className="font-bold">Access Pass #{p.id.slice(0, 8)}</p>
                    <p className="text-xs text-emerald-400">Status: Active</p>
                  </div>
                </div>
             )) : <p className="text-sm text-gray-500">No active passes yet. Book a service or top up on Pricing to generate a QR pass.</p>}
           </div>
        )}

        {activeTab === 'history' && (
           <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><History className="w-5 h-5 text-purple-400"/> Recent Deals &amp; Escrows</h3>
             <div className="space-y-4">
               {orders.length > 0 ? orders.map((o, i) => (
                 <div key={`${o.id}-${i}`} className="flex justify-between items-center border-b border-gray-800 pb-4">
                   <div>
                     <p className="font-bold text-gray-200">{o.label || `Order #${o.id.slice(0, 12).toUpperCase()}`}</p>
                     <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString('en-IN')} · {o.status}</p>
                   </div>
                   <span className="text-emerald-400 font-bold tabular-nums">₹{o.amountInr.toLocaleString('en-IN')}</span>
                 </div>
               )) : <p className="text-sm text-gray-500">No recent deals recorded in this session.</p>}
             </div>
           </div>
        )}

        {activeTab === 'wallet' && (
           <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-3xl p-8">
             <div className="flex items-center gap-4 mb-6">
               <Wallet className="w-8 h-8 text-emerald-400" />
               <h2 className="text-2xl font-bold">₹100 Viral Referral</h2>
             </div>
             <div className="text-4xl font-black text-white mb-2">₹{(orders.length * 100).toLocaleString('en-IN')} <span className="text-sm font-normal text-emerald-400">Earned</span></div>
             <p className="text-gray-400 text-sm mb-6">Earn ₹100 direct to your UPI for every friend who locks a deal.</p>

             <div className="flex bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
               <input type="text" readOnly value={`https://www.nearme-india.org/?ref=${phone}`} className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-300 outline-none" />
               <button type="button" onClick={copyRef} className="bg-gray-800 hover:bg-gray-700 px-4 flex items-center justify-center border-l border-gray-700 transition-colors">
                 <Copy className="w-4 h-4 text-gray-400" />
               </button>
             </div>
           </div>
        )}

        {activeTab === 'settings' && (
           <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6">
             <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-gray-400"/> Settings</h3>

             <div>
               <label className="text-sm text-gray-400">Connected Phone</label>
               <input type="text" disabled value={phone} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-500 mt-1" />
             </div>
             <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
               <div>
                  <p className="font-bold text-white flex items-center gap-2"><Bell className="w-4 h-4"/> On-Site Order &amp; Escrow Alerts</p>
                  <p className="text-xs text-gray-400">Show instant Delivery OTP and settlement status alerts.</p>
               </div>
               <button
                 type="button"
                 aria-label="Toggle order notifications"
                 onClick={() => {
                   const next = !alertsEnabled;
                   setAlertsEnabled(next);
                   localStorage.setItem('nearme_alerts_enabled', String(next));
                   toast(next ? 'Order alerts enabled' : 'Order alerts muted', 'info');
                 }}
                 className={`w-12 h-6 rounded-full border-2 relative transition-colors ${
                   alertsEnabled ? 'bg-emerald-600 border-emerald-500' : 'bg-gray-700 border-gray-600'
                 }`}
               >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${alertsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
               </button>
             </div>
             <button
               type="button"
               onClick={() => {
                 localStorage.removeItem('nearme_user_phone');
                 localStorage.removeItem('nearme_user_name');
                 localStorage.removeItem('nearme_user_email');
                 window.dispatchEvent(new Event('auth_change'));
                 router.push('/');
               }}
               className="text-red-400 font-bold hover:text-red-300 text-sm"
             >
               Sign Out
             </button>
           </div>
        )}

      </div>
    </div>
  );
}
