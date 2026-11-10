'use client';
import React, { useEffect, useState } from 'react';
import { Wallet, Share2, Copy, History, QrCode, Settings, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';

export default function AccountPage() {
  const [phone, setPhone] = useState('');
  const [activeTab, setActiveTab] = useState<'passes' | 'history' | 'wallet' | 'settings'>('passes');
  const [orders, setOrders] = useState<any[]>([]);
  const [passes, setPasses] = useState<any[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('nearme_user_phone');
    if (!saved) {
      router.push('/');
    } else {
      setPhone(saved);
      fetchUserData(saved);
    }
  }, [router]);

  const fetchUserData = async (userPhone: string) => {
      const { data: recentOrders } = await supabase
        .from('autonomous_treasury_ledger')
        .select('*')
        .eq('user_phone', userPhone)
        .order('created_at', { ascending: false });

      if (recentOrders) {
          setOrders(recentOrders.filter(o => o.gross_inr > 50));
          setPasses(recentOrders.filter(o => o.gross_inr <= 50 && o.status === 'PAID'));
      }
  };

  const copyRef = () => {
    navigator.clipboard.writeText(`https://www.nearme-india.org/?ref=${phone}`);
    toast('Copied to clipboard!', 'success');
  };

  if (!phone) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8">Customer Vault</h1>

        {/* 4-TAB NAVIGATION */}
        <div className="flex overflow-x-auto gap-2 border-b border-gray-800 pb-4 mb-8">
            <button onClick={() => setActiveTab('passes')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap ${activeTab === 'passes' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}>Active Passes</button>
            <button onClick={() => setActiveTab('history')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap ${activeTab === 'history' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}>Deal History</button>
            <button onClick={() => setActiveTab('wallet')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap ${activeTab === 'wallet' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}>Referral Wallet</button>
            <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap ${activeTab === 'settings' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}>Settings</button>
        </div>

        {activeTab === 'passes' && (
           <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><QrCode className="w-5 h-5 text-blue-400"/> Your Digital QR Passes</h3>
             {passes.length > 0 ? passes.map((p, i) => (
                <div key={i} className="p-4 bg-gray-800 rounded-xl border border-gray-700 flex items-center gap-4 mb-4">
                  <div className="bg-white p-2 rounded-lg"><QrCode className="w-12 h-12 text-black" /></div>
                  <div>
                    <p className="font-bold">Access Pass #{p.id.slice(0,6)}</p>
                    <p className="text-xs text-emerald-400">Status: Active</p>
                  </div>
                </div>
             )) : <p className="text-sm text-gray-500">No active passes. Book a service to get a QR code.</p>}
           </div>
        )}

        {activeTab === 'history' && (
           <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><History className="w-5 h-5 text-purple-400"/> Recent Deals</h3>
             <div className="space-y-4">
               {orders.length > 0 ? orders.map((o, i) => (
                 <div key={i} className="flex justify-between items-center border-b border-gray-800 pb-4">
                   <div>
                     <p className="font-bold text-gray-200">Order #{o.id.slice(0,8).toUpperCase()}</p>
                     <p className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString()} • {o.status}</p>
                   </div>
                   <span className="text-emerald-400 font-bold">₹{o.gross_inr}</span>
                 </div>
               )) : <p className="text-sm text-gray-500">No recent deals.</p>}
             </div>
           </div>
        )}

        {activeTab === 'wallet' && (
           <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-3xl p-8">
             <div className="flex items-center gap-4 mb-6">
               <Wallet className="w-8 h-8 text-emerald-400" />
               <h2 className="text-2xl font-bold">₹100 Viral Referral</h2>
             </div>
             <div className="text-4xl font-black text-white mb-2">₹1,200 <span className="text-sm font-normal text-emerald-400">Earned (Demo)</span></div>
             <p className="text-gray-400 text-sm mb-6">Earn ₹100 direct to your UPI for every friend who books a deal.</p>

             <div className="flex bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
               <input type="text" readOnly value={`https://www.nearme-india.org/?ref=${phone}`} className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-300 outline-none" />
               <button onClick={copyRef} className="bg-gray-800 hover:bg-gray-700 px-4 flex items-center justify-center border-l border-gray-700 transition-colors">
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
                  <p className="font-bold text-white flex items-center gap-2"><Bell className="w-4 h-4"/> WhatsApp Notifications</p>
                  <p className="text-xs text-gray-400">Get order updates instantly.</p>
               </div>
               <div className="w-12 h-6 bg-emerald-600 rounded-full border-2 border-emerald-500 relative">
                  <div className="absolute right-0 w-5 h-5 bg-white rounded-full"></div>
               </div>
             </div>
             <button onClick={() => { localStorage.clear(); router.push('/'); }} className="text-red-400 font-bold hover:text-red-300 text-sm">Sign Out</button>
           </div>
        )}

      </div>
    </div>
  );
}
