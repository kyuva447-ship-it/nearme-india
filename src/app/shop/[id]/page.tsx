'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CheckCircle, ShieldCheck, MessageSquare, Share2, MapPin, Star } from 'lucide-react';
import Link from 'next/link';

export default function ShopPage({ params }: { params: { id: string } }) {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      const { data } = await supabase.from('shops').select('*, users(full_name)').eq('id', params.id).single();
      setShop(data);
      setLoading(false);
    };
    fetchShop();
  }, [params.id]);

  if (loading) return <div className="min-h-screen flex justify-center pt-20 font-bold text-slate-400">Loading...</div>;
  if (!shop) return <div className="min-h-screen flex justify-center pt-20 font-bold text-slate-400">Shop Not Found</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">

      {/* Cover Photo */}
      <div className="w-full h-64 bg-emerald-600 relative overflow-hidden">
         {shop.image_urls?.[0] && <img src={shop.image_urls[0]} alt="Shop cover" className="w-full h-full object-cover opacity-80" />}
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
         <div className="absolute bottom-6 left-6 right-6">
            {shop.is_verified && (
               <span className="bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block shadow-lg flex items-center gap-1 w-max">
                 <CheckCircle className="w-4 h-4" /> Verified
               </span>
            )}
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{shop.business_name}</h1>
            <p className="text-emerald-100 font-bold flex items-center gap-1">
               <MapPin className="w-4 h-4" /> {shop.city} {shop.pincode ? `- ${shop.pincode}` : ''}
            </p>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">

         <div className="grid md:grid-cols-3 gap-6">

            <div className="md:col-span-2 space-y-6">
               {/* Deal / Offer */}
               {shop.current_deal_text && (
                 <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
                    <span className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1 block">Active Offer</span>
                    <p className="text-2xl font-bold text-slate-900">{shop.current_deal_text}</p>
                 </div>
               )}

               {/* Trust Details */}
               <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Reputation</h3>
                  <div className="flex gap-8">
                     <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Trust Score</p>
                        <p className="text-3xl font-black text-slate-900">{shop.trust_score || 80}/100</p>
                     </div>
                     <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Owner</p>
                        <p className="text-lg font-bold text-slate-700">{shop.users?.full_name || 'Verified Owner'}</p>
                     </div>
                  </div>
               </div>

               {/* Add To Cart Placeholder */}
               <div className="bg-slate-100 rounded-3xl p-8 text-center border border-dashed border-slate-300">
                  <p className="text-slate-500 font-bold">Products Catalog Loading...</p>
               </div>
            </div>

            <div className="space-y-4">
               {/* Escrow Badge */}
               <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center shadow-sm">
                  <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h4 className="font-black text-emerald-900 mb-1">Escrow Protected</h4>
                  <p className="text-xs text-emerald-700 font-medium">Your money is safe until delivery is confirmed.</p>
               </div>

               {/* Contact Actions */}
               <button onClick={() => window.open(`https://wa.me/91${shop.phone || process.env.NEXT_PUBLIC_ADMIN_PHONE}?text=Hi%20${shop.business_name},%20I%20am%20interested%20in%20an%20order.`, '_blank')} className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/30">
                  <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
               </button>

               <button onClick={() => { navigator.clipboard.writeText(window.location.href); console.log("Shop Link Copied!"); }} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md">
                  <Share2 className="w-5 h-5" /> Share My Shop
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
