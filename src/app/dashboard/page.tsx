'use client';
import React, { useEffect, useState } from 'react';
import { Settings, ShieldCheck, QrCode, Upload, Loader2, IndianRupee } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';

export default function MerchantDashboard() {
  const [phone, setPhone] = useState('');
  const [activeTab, setActiveTab] = useState<'config' | 'verify' | 'kyc'>('config');

  const [pincode, setPincode] = useState('560001');
  const [floorMargin, setFloorMargin] = useState(15);
  const [verifyId, setVerifyId] = useState('');
  const [upiId, setUpiId] = useState('');

  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('nearme_user_phone');
    if (!saved) router.push('/');
    else {
      setPhone(saved);
      checkKycStatus(saved);
    }
  }, [router]);

  const checkKycStatus = async (userPhone: string) => {
    const { data } = await supabase.from('merchant_autopilot_nodes').select('kyc_verified').eq('phone', userPhone).single();
    if (data?.kyc_verified) setKycStatus('VERIFIED');
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    await supabase.from('merchant_autopilot_nodes').upsert({
       phone: phone, pincode: pincode, floor_margin_pct: floorMargin, auto_bid_active: true
    });
    toast("AI Node Configuration Saved!", "success");
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!verifyId) return toast("Enter Order ID", "error");
    setLoading(true);
    const { data } = await supabase.from('autonomous_treasury_ledger').select('*').eq('razorpay_order_id', verifyId).single();
    if (data && data.status === 'PAID') {
        toast("Pass Verified! Customer Authorized.", "success");
    } else {
        toast("Invalid or Expired Pass.", "error");
    }
    setLoading(false);
  };

  const handleKycUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !upiId) return toast("Please enter UPI ID and select a file.", "error");

    setLoading(true);
    toast("Compressing document...");

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000; canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0, 1000, 1000);
      const base64 = canvas.toDataURL('image/jpeg', 0.6);
      URL.revokeObjectURL(objectUrl);

      try {
        toast("AI inspecting document...");
        const res = await fetch('/api/merchant/kyc-verify', {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ image_data: base64, phone, upi_id: upiId })
        });
        const data = await res.json();
        if (res.ok) {
           setKycStatus('VERIFIED');
           toast(data.message, "success");
        } else {
           toast(data.message, "error");
        }
      } catch (err) {
        toast("KYC Verification Failed", "error");
      } finally {
        setLoading(false);
      }
    };
    img.src = objectUrl;
  };

  if (!phone) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-500" /> Merchant Autopilot
        </h1>

        <div className="flex overflow-x-auto gap-2 border-b border-gray-800 pb-4 mb-8">
            <button onClick={() => setActiveTab('config')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap ${activeTab === 'config' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}>AI Rules</button>
            <button onClick={() => setActiveTab('verify')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap ${activeTab === 'verify' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}>Verify Passes</button>
            <button onClick={() => setActiveTab('kyc')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap ${activeTab === 'kyc' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}>KYC & Payouts</button>
        </div>

        {activeTab === 'config' && (
           <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md">
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
                <button disabled={loading} onClick={handleSaveConfig} className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-lg mt-4 disabled:opacity-50">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : 'Save Configuration'}
                </button>
             </div>
           </div>
        )}

        {activeTab === 'verify' && (
           <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><QrCode className="w-5 h-5"/> Customer Check-in</h2>
             <p className="text-sm text-gray-400 mb-4">Enter the Razorpay Order ID shown on the customer's device.</p>
             <input type="text" value={verifyId} onChange={e => setVerifyId(e.target.value)} placeholder="rzp_order_..." className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white mb-4" />
             <button disabled={loading} onClick={handleVerify} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg flex justify-center items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : <><ShieldCheck className="w-5 h-5"/> Verify Pass</>}
             </button>
           </div>
        )}

        {activeTab === 'kyc' && (
           <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-lg">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-purple-400"/> Business KYC</h2>

             {kycStatus === 'VERIFIED' ? (
                <div className="bg-emerald-950 border border-emerald-500/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                   <ShieldCheck className="w-16 h-16 text-emerald-400 mb-4" />
                   <h3 className="text-xl font-bold text-white mb-2">Verified Business</h3>
                   <p className="text-emerald-200 text-sm">Your payouts are actively routed via Razorpay Route.</p>
                </div>
             ) : (
                <div className="space-y-6">
                  <p className="text-gray-400 text-sm">Automated Instant KYC. Upload your GST or Shop License, and enter your UPI ID for zero-touch onboarding.</p>
                  <div>
                    <label className="text-sm text-gray-400 flex items-center gap-2 mb-1"><IndianRupee className="w-4 h-4"/> Settlement UPI ID</label>
                    <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="merchant@sbi" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white" />
                  </div>
                  <label className="w-full h-32 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center bg-gray-800/50 cursor-pointer hover:border-purple-500 hover:bg-gray-800 transition-all relative">
                    <input type="file" accept="image/*" className="hidden" onChange={handleKycUpload} disabled={loading} />
                    {loading ? <Loader2 className="w-8 h-8 text-purple-400 animate-spin" /> : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-purple-400 font-bold">Upload Shop License</span>
                      </>
                    )}
                  </label>
                </div>
             )}
           </div>
        )}
      </div>
    </div>
  );
}
