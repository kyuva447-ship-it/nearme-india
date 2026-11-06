'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Store, ShoppingBag, Coins, LogOut, User, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        const { data } = await supabase.from('users').select('*').eq('auth_id', session.user.id).single();
        setUser({ ...session.user, ...data });
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-0">
      <header className="bg-slate-900 text-white p-6 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-black"><span className="text-emerald-500">NearMe</span>India</Link>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm font-bold transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8"></div>
           <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-md relative z-10 overflow-hidden">
              {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                  <User className="w-10 h-10 text-slate-400" />
              )}
           </div>
           <div className="text-center md:text-left relative z-10 flex-1">
              <h2 className="text-2xl font-black text-slate-900 mb-1">{user.user_metadata?.full_name || 'NearMe User'}</h2>
              <p className="text-slate-500 font-medium">{user.email ? user.email.replace(/(.{2})(.*)(?=@)/, "$1***") : (user.phone ? user.phone.replace(/.(?=.{4})/g, '*') : 'No contact info')}</p>

              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                 <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm border border-amber-200">
                    <Coins className="w-4 h-4" /> {user.points || 0} Points
                 </div>
                 <button onClick={() => { navigator.clipboard.writeText(`https://www.nearme-india.org/r/${user.id.substring(0,8)}`); alert("Referral Link Copied!"); }} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm border border-slate-200 transition-colors">
                    Copy Referral Link
                 </button>
              </div>
           </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
           {/* My Shops */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2"><Store className="w-5 h-5 text-emerald-600" /> My Shops</h3>
              <div className="bg-slate-50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
                 <p className="text-slate-500 font-medium mb-4 text-sm">You haven't listed any shops yet.</p>
                 <Link href="/add-shop" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-full text-sm transition-colors shadow-md shadow-emerald-200 inline-block">
                    Add Shop Now
                 </Link>
              </div>
           </div>

           {/* My Orders */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-blue-600" /> My Orders</h3>
              <div className="bg-slate-50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
                 <p className="text-slate-500 font-medium text-sm">No recent orders.</p>
                 <Link href="/" className="text-emerald-600 font-bold text-sm mt-2 block hover:underline">Explore Local Shops</Link>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
