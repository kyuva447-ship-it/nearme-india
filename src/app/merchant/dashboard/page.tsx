'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Zap, TrendingUp, Wallet, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';

export default function MerchantDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    address: '',
    category: '',
    flash_deal: '',
    is_open: true
  });

  useEffect(() => {
    const fetchProfile = async () => {
      // Mock session fallback handling
      const mockPhone = '918247831885';
      try {
        const { data, error } = await supabase
          .from('sellers')
          .select('*')
          .eq('phone_number', mockPhone)
          .single();

        if (data) {
          setProfile(data);
          setFormData({
            business_name: data.business_name || '',
            address: data.address || '',
            category: data.category || '',
            flash_deal: data.current_deal_text || '',
            is_open: data.is_currently_available || true
          });
        }
      } catch (error) {
        console.warn("Using mock data.");
        setProfile({ wallet_balance: 1500 });
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsEditing(false);
    // Mock save
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-slate-900 text-white p-6 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Seller Dashboard</h1>
            <p className="text-slate-400 text-xs mt-1">Manage your local business</p>
          </div>
          <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full font-bold flex items-center gap-2 border border-emerald-500/30">
            <Wallet className="w-4 h-4" /> ₹{profile?.wallet_balance || '0.00'}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 mt-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8"></div>
          <div className="flex justify-between items-start relative z-10 mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" /> Business Profile
            </h2>
            <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-bold text-emerald-600 underline">
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Business Name</label>
              {isEditing ? (
                <input type="text" value={formData.business_name} onChange={(e) => setFormData({...formData, business_name: e.target.value})} className="w-full border-b-2 border-emerald-500 pb-1 font-bold text-slate-900 outline-none" />
              ) : (
                <p className="font-bold text-slate-900">{formData.business_name || 'Set your business name'}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
              {isEditing ? (
                <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border-b-2 border-emerald-500 pb-1 font-bold text-slate-900 outline-none" />
              ) : (
                <p className="font-bold text-slate-900">{formData.category || 'e.g. Grocery, Electronics'}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
              {isEditing ? (
                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full border-b-2 border-emerald-500 pb-1 font-bold text-slate-900 outline-none" />
              ) : (
                <p className="font-bold text-slate-900 text-sm flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" /> {formData.address || 'Set your location'}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <button onClick={handleSave} className="mt-6 w-full bg-slate-900 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
              <Save className="w-4 h-4" /> Save Profile
            </button>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-6 shadow-lg text-white">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold flex items-center gap-2">
               <Zap className="w-5 h-5" /> Live Flash Deal
             </h2>
             <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">Active</span>
          </div>
          <p className="text-sm text-white/90 mb-4">Broadcast an instant offer to users within 2km.</p>
          <input
            type="text"
            value={formData.flash_deal}
            onChange={(e) => setFormData({...formData, flash_deal: e.target.value})}
            placeholder="e.g. 20% off on all items next 2 hours!"
            className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 transition-all font-medium"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-4">
           <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
               <TrendingUp className="w-6 h-6" />
             </div>
             <p className="text-2xl font-black text-slate-900">124</p>
             <p className="text-xs font-bold text-slate-500 uppercase mt-1">Profile Views</p>
           </div>
           <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
               <User className="w-6 h-6" />
             </div>
             <p className="text-2xl font-black text-slate-900">45</p>
             <p className="text-xs font-bold text-slate-500 uppercase mt-1">Leads Today</p>
           </div>
        </motion.div>
      </main>
    </div>
  );
}
