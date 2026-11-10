'use client';
import React, { useEffect, useState } from 'react';
import { Settings, ShieldCheck, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function MerchantDashboard() {
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('560001');
  const [floorMargin, setFloorMargin] = useState(15);
  const [verifyId, setVerifyId] = useState('');
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('nearme_user_phone');
    if (!saved) router.push('/');
    else setPhone(saved);
  }, [router]);

  const handleSaveConfig = async () => {
    await supabase.from('merchant_autopilot_nodes').upsert({
       phone: phone,
       pincode: pincode,
       floor_margin_pct: floorMargin,
       auto_bid_active: true
    });
    alert("AI Node Configuration Saved!");
  };

  const handleVerify = async () => {
    if (!verifyId) return alert("Enter Order ID");
    const { data } = await supabase.from('autonomous_treasury_ledger').select('*').eq('razorpay_order_id', verifyId).single();
    if (data) {
        alert("Pass Verified! Customer Authorized.");
    } else {
        alert("Invalid or Expired Pass.");
    }
  };

  if (!phone) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-500" />
          Merchant Autopilot Portal
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
           <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
             <h2 className="text-xl font-bold mb-6">AI Node Configuration</h2>
             <div className="space-y-4">
                <div>
                   <label className="text-sm text-gray-400">Business Pincode</label>
                   <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white mt-1" />
                </div>
                <div>
                   <label className="text-sm text-gray-400">Auto-Bid Floor Margin (%)</label>
                   <input type="number" value={floorMargin} onChange={e => setFloorMargin(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white mt-1" />
                </div>
                <button onClick={handleSaveConfig} className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-lg mt-4">Save Configuration</button>
             </div>
           </div>

           <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><QrCode className="w-5 h-5"/> Verify Customer Pass</h2>
             <p className="text-sm text-gray-400 mb-4">Enter the Order ID or Scan QR to let the customer in.</p>
             <input type="text" value={verifyId} onChange={e => setVerifyId(e.target.value)} placeholder="Enter Order ID (pay_...)" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white mb-4" />
             <button onClick={handleVerify} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg flex justify-center items-center gap-2">
                <ShieldCheck className="w-5 h-5"/> Verify & Authorize
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
