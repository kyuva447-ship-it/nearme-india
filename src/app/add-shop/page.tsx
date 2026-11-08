'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Store, MapPin, Tag, MessageSquare, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AddShopPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    business_name: '',
    city: '',
    category: 'Kirana',
    offer: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // In a real app, ensure user is authenticated before inserting.
    // Here we insert directly for demo purposes (assuming RLS allows it or using anon key)
    const { data, error } = await supabase.from('shops').insert([
        {
            business_name: formData.business_name,
            city: formData.city,
            category: formData.category,
            current_deal_text: formData.offer,
            is_active: true
        }
    ]).select().single();

    setLoading(false);

    if (error) {
        console.error(error);
        console.error("Failed to add shop. Please try again.");
    } else {
        router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Add Your Shop Free</h1>
          <p className="text-slate-500 font-medium">Get listed on NearMe India and reach thousands of local customers instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Business Name</label>
            <div className="relative">
               <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
               <input type="text" required value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-emerald-500 font-medium" placeholder="e.g. Balaji Kirana Store" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                <div className="relative">
                   <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                   <input type="text" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-emerald-500 font-medium" placeholder="e.g. Tirupati" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                <div className="relative">
                   <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                   <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-emerald-500 font-medium appearance-none">
                      <option>Kirana</option>
                      <option>Food</option>
                      <option>Medical</option>
                      <option>Mobile</option>
                      <option>Fashion</option>
                      <option>Services</option>
                      <option>B2B</option>
                   </select>
                </div>
              </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Initial Flash Deal (Optional)</label>
            <div className="relative">
               <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
               <input type="text" value={formData.offer} onChange={e => setFormData({...formData, offer: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-emerald-500 font-medium" placeholder="e.g. 10% Off for next 2 hours" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 mt-4">
             {loading ? "Saving..." : <><Store className="w-5 h-5" /> Go Live Instantly</>}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
           <p className="text-sm font-bold text-slate-500">Need help onboarding?</p>
           <button onClick={() => window.open(`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_PHONE}?text=I%20need%20help%20adding%20my%20shop`, '_blank')} className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#1DA851] transition-colors shadow-md">
              <MessageSquare className="w-4 h-4" /> Chat with AI Onboarding Agent
           </button>
           <div className="block mt-4">
             <Link href="/" className="text-emerald-600 font-bold hover:underline text-sm">Cancel and return Home</Link>
           </div>
        </div>

      </div>
    </div>
  );
}
