'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User, LogOut, Award, ShoppingBag, Link as LinkIcon, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
          router.push('/login');
      }
    });
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 bg-slate-50">Loading Dashboard...</div>;
  }

  if (!session) return null;

  const user = session.user;
  const referralCode = `NM-${user.id.substring(0, 6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
       <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
             <Link href="/" className="font-black text-xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-orange-500 flex items-center justify-center text-white text-sm">N</div>
                <span className="hidden sm:block text-slate-900">NearMe</span>
             </Link>
             <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 font-bold text-sm flex items-center gap-1 transition-colors">
                <LogOut className="w-4 h-4" /> Logout
             </button>
          </div>
       </header>

       <main className="max-w-4xl mx-auto p-4 py-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-6">
             <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-12 h-12" />
             </div>
             <div className="text-center md:text-left">
                <h1 className="text-3xl font-black text-slate-900 mb-1">{user.email}</h1>
                <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-1">
                   <Award className="w-4 h-4 text-orange-500" /> Early Adopter Badge
                </p>
             </div>
             <div className="md:ml-auto text-center md:text-right">
                <p className="text-sm font-bold text-slate-500 uppercase">Referral Earnings</p>
                <p className="text-4xl font-black text-emerald-600">₹0</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-slate-400" /> My Orders</h2>
                <div className="text-center py-8 text-slate-500 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                   No orders yet.
                   <br/>
                   <Link href="/" className="inline-flex mt-4 text-emerald-600 font-bold hover:underline">Start Shopping</Link>
                </div>
             </div>

             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-slate-400" /> Refer & Earn</h2>
                <p className="text-slate-600 text-sm mb-4">Share this link. Get ₹20 when your friend makes their first verified purchase.</p>
                <div className="flex gap-2">
                   <input type="text" readOnly value={`https://www.nearme-india.org/r/${referralCode}`} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-mono text-sm text-slate-600 outline-none" />
                   <button
                     onClick={() => {
                       navigator.clipboard.writeText(`https://www.nearme-india.org/r/${referralCode}`);
                       console.log("Referral link copied!");
                     }}
                     className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm whitespace-nowrap"
                   >
                     Copy
                   </button>
                </div>
             </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white flex items-center justify-between">
             <div>
                <h3 className="text-xl font-black mb-2">Own a shop?</h3>
                <p className="text-slate-400 font-medium">List it for free and reach thousands of local customers.</p>
             </div>
             <Link href="/add-shop" className="bg-white text-slate-900 font-black px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap">
                Add Shop
             </Link>
          </div>
       </main>
    </div>
  );
}
