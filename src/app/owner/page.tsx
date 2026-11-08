'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Lock, Store, Users, IndianRupee, ShieldCheck, CheckCircle, XCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

const CITIES = [
  'All India', 'Tirupati', 'Nellore', 'Chittoor', 'Vijayawada', 'Visakhapatnam',
  'Hyderabad', 'Chennai', 'Bangalore', 'Kochi', 'Coimbatore', 'Madurai',
  'Mumbai', 'Pune', 'Delhi', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Indore', 'Patna', 'Bhopal', 'Chandigarh', 'Guwahati', 'Bhubaneswar'
];

export default function OwnerPortal() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('All India');

  // Dashboard Stats
  const [stats, setStats] = useState({ shops: 0, users: 0, revenue: 0, citiesActive: 0 });
  const [pendingShops, setPendingShops] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user.email === process.env.NEXT_PUBLIC_OWNER_EMAIL) {
          setSession(session);
          fetchDashboardData();
      } else if (session) {
          // Boot them if they are not the owner
          supabase.auth.signOut();
      }
    });
  }, []);

  const fetchDashboardData = async () => {
     // Fetch aggregates safely for the owner
     let shopQuery = supabase.from('shops').select('*', { count: 'exact', head: true });
     let pendingQuery = supabase.from('shops').select('*').eq('is_verified', false).limit(10);

     if (selectedCityFilter !== 'All India') {
         shopQuery = shopQuery.eq('city', selectedCityFilter);
         pendingQuery = pendingQuery.eq('city', selectedCityFilter);
     }

     const { count: shopCount } = await shopQuery;
     const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
     const { data } = await pendingQuery;

     // Get unique cities count (simplified for demo)
     const { data: citiesData } = await supabase.from('shops').select('city');
     const uniqueCities = new Set(citiesData?.map(s => s.city));

     setStats({ shops: shopCount || 0, users: userCount || 0, revenue: 0, citiesActive: uniqueCities.size });
     setPendingShops(data || []);
  };

  useEffect(() => {
     if (session) fetchDashboardData();
  }, [selectedCityFilter]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== process.env.NEXT_PUBLIC_OWNER_EMAIL) {
       console.error("Access Denied");
       return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (!error) setOtpSent(true);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    setLoading(false);

    if (data.session && data.session.user.email === process.env.NEXT_PUBLIC_OWNER_EMAIL) {
        setSession(data.session);
        fetchDashboardData();
    } else {
        supabase.auth.signOut();
        console.error("Invalid OTP or Access Denied");
    }
  };

  const approveShop = async (id: string) => {
     await supabase.from('shops').update({ is_verified: true }).eq('id', id);
     fetchDashboardData();
  };

  const rejectShop = async (id: string) => {
     await supabase.from('shops').update({ is_active: false }).eq('id', id);
     fetchDashboardData();
  };

  if (!session) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-white">
          <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
             <div className="w-16 h-16 bg-slate-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8" />
             </div>
             <h1 className="text-2xl font-black text-center mb-8">Admin Control Room</h1>
             {!otpSent ? (
                 <form onSubmit={handleSendOTP} className="space-y-4">
                     <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Owner Email" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 px-4 outline-none focus:border-emerald-500 font-bold" required />
                     <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-colors">{loading ? "Sending..." : "Request Access"}</button>
                 </form>
             ) : (
                 <form onSubmit={handleVerifyOTP} className="space-y-4">
                     <p className="text-sm text-slate-400 text-center mb-4 font-bold">OTP sent to Owner Email</p>
                     <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="• • • • • •" className="w-full text-center text-2xl tracking-[0.5em] bg-slate-900 border border-slate-700 rounded-xl py-4 px-4 outline-none focus:border-emerald-500 font-black" required />
                     <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-colors">{loading ? "Verifying..." : "Verify & Enter"}</button>
                 </form>
             )}
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-slate-900 text-white p-6 sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-black flex items-center gap-2"><ShieldCheck className="text-emerald-500" /> Control Room</h1>

          <div className="flex items-center gap-4">
             <select
               value={selectedCityFilter}
               onChange={(e) => setSelectedCityFilter(e.target.value)}
               className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 outline-none font-bold text-sm"
             >
               {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
             </select>
             <button onClick={() => { supabase.auth.signOut(); setSession(null); }} className="text-slate-400 hover:text-white text-sm font-bold transition-colors">Lock</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 py-8">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><Store className="w-8 h-8" /></div>
               <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">Shops ({selectedCityFilter})</p>
                  <p className="text-4xl font-black text-slate-900">{stats.shops}</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
               <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><IndianRupee className="w-8 h-8" /></div>
               <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">Est. Revenue</p>
                  <p className="text-4xl font-black text-slate-900">₹{stats.revenue}</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
               <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center"><Users className="w-8 h-8" /></div>
               <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">Total Users</p>
                  <p className="text-4xl font-black text-slate-900">{stats.users}</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
               <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center"><MapPin className="w-8 h-8" /></div>
               <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">Cities Active</p>
                  <p className="text-4xl font-black text-slate-900">{stats.citiesActive}</p>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-black text-slate-900 mb-6">Pending Approvals ({pendingShops.length})</h2>

            {pendingShops.length === 0 ? (
               <p className="text-slate-500 font-bold text-center py-8">No pending shops to review in {selectedCityFilter}.</p>
            ) : (
               <div className="space-y-4">
                  {pendingShops.map((shop) => (
                     <div key={shop.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                        <div>
                           <h3 className="font-bold text-lg text-slate-900">{shop.business_name}</h3>
                           <p className="text-sm text-slate-500">{shop.city} • {shop.category} • {shop.phone}</p>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                           <button onClick={() => approveShop(shop.id)} className="flex-1 md:flex-none bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1 transition-colors">
                              <CheckCircle className="w-4 h-4" /> Approve
                           </button>
                           <button onClick={() => rejectShop(shop.id)} className="flex-1 md:flex-none bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1 transition-colors">
                              <XCircle className="w-4 h-4" /> Block
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </main>
    </div>
  );
}
