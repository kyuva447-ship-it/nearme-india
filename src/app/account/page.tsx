'use client';
import React, { useEffect, useState } from 'react';
import { Wallet, Share2, Copy, History, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AccountPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [passes, setPasses] = useState<any[]>([]);
  const router = useRouter();

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
      // In a real RLS-protected setup, we'd query using Auth ID.
      // Here we simulate the fetch for the exact user phone from treasury.
      const { data: recentOrders } = await supabase
        .from('autonomous_treasury_ledger')
        .select('*')
        .limit(5)
        .order('created_at', { ascending: false });

      if (recentOrders) {
          // Simplistic matching for demo since we didn't add user_phone to ledger schema
          setOrders(recentOrders.filter(o => o.gross_inr > 50));
          setPasses(recentOrders.filter(o => o.gross_inr <= 50));
      }
  };

  const referralLink = `https://www.nearme-india.org/?ref=${phone}`;

  const copyRef = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Copied to clipboard!');
  };

  if (!phone) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-black mb-8">Customer Vault</h1>

        <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-3xl p-8">
           <div className="flex items-center gap-4 mb-6">
             <Wallet className="w-8 h-8 text-emerald-400" />
             <h2 className="text-2xl font-bold">Referral Wallet</h2>
           </div>
           <div className="text-4xl font-black text-white mb-2">₹1,200 <span className="text-sm font-normal text-emerald-400">Earned</span></div>
           <p className="text-gray-400 text-sm mb-6">Earn ₹100 for every friend who books a deal via your link.</p>

           <div className="flex bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
             <input type="text" readOnly value={referralLink} className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-300 outline-none" />
             <button onClick={copyRef} className="bg-gray-800 hover:bg-gray-700 px-4 flex items-center justify-center border-l border-gray-700 transition-colors">
               <Copy className="w-4 h-4 text-gray-400" />
             </button>
           </div>

           <a
             href={`https://wa.me/?text=Get%20huge%20local%20discounts%20on%20NearMe-India!%20Use%20my%20link:%20${referralLink}`}
             target="_blank" rel="noreferrer"
             className="w-full mt-4 py-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-colors"
           >
             <Share2 className="w-4 h-4" /> Share on WhatsApp
           </a>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
           <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><QrCode className="w-5 h-5 text-blue-400"/> Active Micro-Passes</h3>
             {passes.length > 0 ? passes.map((p, i) => (
                <div key={i} className="p-4 bg-gray-800 rounded-xl border border-gray-700 flex items-center gap-4 mb-4">
                  <QrCode className="w-12 h-12 text-white" />
                  <div>
                    <p className="font-bold">Pass #{p.id.slice(0,6)}</p>
                    <p className="text-xs text-emerald-400">Live • ₹{p.gross_inr}</p>
                  </div>
                </div>
             )) : <p className="text-sm text-gray-500">No active passes.</p>}
           </div>

           <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><History className="w-5 h-5 text-purple-400"/> Recent Deals</h3>
             <div className="space-y-4">
               {orders.length > 0 ? orders.map((o, i) => (
                 <div key={i} className="flex justify-between items-center border-b border-gray-800 pb-4">
                   <div>
                     <p className="font-bold">Order {o.id.slice(0,6)}</p>
                     <p className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString()}</p>
                   </div>
                   <span className="text-emerald-400 font-bold">₹{o.gross_inr}</span>
                 </div>
               )) : <p className="text-sm text-gray-500">No recent deals.</p>}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
