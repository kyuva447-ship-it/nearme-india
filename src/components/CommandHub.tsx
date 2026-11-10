'use client';
import React, { useState, useEffect } from 'react';
import { Mic, Camera, Zap, ShieldCheck, Loader2, Share2 } from 'lucide-react';
import { loadRazorpay } from '@/lib/razorpayClient';
import PhoneAuthModal from './PhoneAuthModal';

export default function CommandHub() {
  const [activeTab, setActiveTab] = useState<'voice' | 'camera' | 'spawn'>('voice');
  const [loadingMsg, setLoadingMsg] = useState('');
  const [spawnInput, setSpawnInput] = useState('');

  const [bids, setBids] = useState<any[]>([]);
  const [showSwarmModal, setShowSwarmModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [billResult, setBillResult] = useState<any>(null);
  const [spawnedApp, setSpawnedApp] = useState<any>(null);

  const [bidLocked, setBidLocked] = useState(false);
  const [swarmJoined, setSwarmJoined] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  useEffect(() => { loadRazorpay(); }, []);

  const requireAuth = (actionFn: () => void, metadata: any) => {
    const userPhone = localStorage.getItem('nearme_user_phone');
    if (!userPhone) {
      setPendingAction({ fn: actionFn, metadata });
      setShowAuth(true);
    } else {
      actionFn();
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    if (pendingAction) {
      pendingAction.fn();
      setPendingAction(null);
    }
  };

  const triggerReverseBid = async (query: string) => {
    setLoadingMsg('Calculating local bids...');
    setBids([]);
    setBidLocked(false);
    try {
      const res = await fetch('/api/engine/reverse-bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice_query: query, pincode: localStorage.getItem('user_pincode') || '560001' })
      });
      const data = await res.json();
      setBids(data.bids || []);
    } catch (err) {} finally {
      setLoadingMsg('');
    }
  };

  const handleSwarmJoin = async () => {
    const userPhone = localStorage.getItem('nearme_user_phone') || phone;
    if (!userPhone || userPhone.length !== 10) return alert("Enter valid 10-digit phone number");
    try {
      await fetch('/api/engine/swarm-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userPhone })
      });
      setSwarmJoined(true);
      setShowSwarmModal(false);
    } catch (err) {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingMsg('Compressing & Scanning document...');
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800; canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0, 800, 800);

      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
      URL.revokeObjectURL(objectUrl);

      try {
        const res = await fetch('/api/engine/bill-slasher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_data: compressedBase64, pincode: localStorage.getItem('user_pincode') || '560001' })
        });
        const data = await res.json();
        setBillResult(data);
      } catch (err) {
        alert('Failed to process document');
      } finally {
        setLoadingMsg('');
      }
    };
    img.src = objectUrl;
  };

  const handleSpawnApp = async () => {
    if (!spawnInput) return;
    setLoadingMsg('Spawning mini-app...');
    try {
      const res = await fetch('/api/engine/spawn-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: spawnInput, phone: localStorage.getItem('nearme_user_phone') || '9999900000' })
      });
      const data = await res.json();
      setSpawnedApp(data);
    } catch (err) {
      alert('Failed to spawn app');
    } finally {
      setLoadingMsg('');
      setSpawnInput('');
    }
  };

  const payForSpawnApp = async () => {
    const userPhone = localStorage.getItem('nearme_user_phone');
    try {
      const res = await fetch('/api/payment/razorpay-split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_inr: 99, platform_fee_pct: 100, merchant_account_id: 'platform', user_phone: userPhone })
      });
      const data = await res.json();
      if(data.demo_mode) { alert(`Published: ${spawnedApp.url}`); }
      else {
        const rzp = new (window as any).Razorpay({
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy',
            amount: 9900,
            currency: "INR",
            name: "Publish App",
            prefill: { contact: userPhone },
            handler: function () { alert(`Published Live at ${spawnedApp.url}`); }
        });
        rzp.open();
      }
    } catch(err) {}
  };

  const handleLockBid = (amount: number) => {
     setBidLocked(true);
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
      {showAuth && <PhoneAuthModal onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}

      {loadingMsg && (
        <div className="absolute inset-0 z-50 bg-gray-950/80 flex flex-col items-center justify-center backdrop-blur-sm">
           <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
           <p className="text-xl font-bold text-white animate-pulse">{loadingMsg}</p>
        </div>
      )}

      {showSwarmModal && (
        <div className="absolute inset-0 z-50 bg-gray-950/90 flex flex-col items-center justify-center backdrop-blur-md p-8">
           <ShieldCheck className="w-16 h-16 text-blue-500 mb-4" />
           <h3 className="text-2xl font-black text-white mb-2">National Swarm Pool</h3>
           <p className="text-gray-400 mb-6 text-center max-w-sm">Join 1,200 other buyers to unlock 15% wholesale discount. Enter phone to lock your slot.</p>
           <div className="flex w-full max-w-sm">
             <input
               type="tel" value={phone} onChange={e => setPhone(e.target.value)}
               placeholder="10-digit mobile" maxLength={10}
               className="flex-1 bg-gray-800 border border-gray-700 rounded-l-xl px-4 py-3 outline-none focus:border-blue-500"
             />
             <button onClick={() => requireAuth(handleSwarmJoin, 'swarm')} className="bg-blue-600 hover:bg-blue-500 font-bold px-6 rounded-r-xl">Join</button>
           </div>
           <button onClick={() => setShowSwarmModal(false)} className="mt-4 text-sm text-gray-500 hover:text-white">Cancel</button>
        </div>
      )}

      <div className="flex border-b border-gray-800">
        <button onClick={() => setActiveTab('voice')} className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-colors ${activeTab === 'voice' ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:bg-gray-800'}`}>
          <Mic className="w-5 h-5" /> <span className="hidden sm:inline">60s Price War</span>
        </button>
        <button onClick={() => setActiveTab('camera')} className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-colors ${activeTab === 'camera' ? 'bg-emerald-900/30 text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:bg-gray-800'}`}>
          <Camera className="w-5 h-5" /> <span className="hidden sm:inline">Bill Slasher</span>
        </button>
        <button onClick={() => setActiveTab('spawn')} className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-colors ${activeTab === 'spawn' ? 'bg-purple-900/30 text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:bg-gray-800'}`}>
          <Zap className="w-5 h-5" /> <span className="hidden sm:inline">AI App Spawner</span>
        </button>
      </div>

      <div className="p-8">
        {activeTab === 'voice' && (
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl font-black text-white">Speak Your Price</h2>
            <p className="text-gray-400">Merchants within 5km will fight for your order in real-time.</p>
            <button onClick={() => requireAuth(() => triggerReverseBid("General Request"), 'bid')} className="w-24 h-24 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all">
              <Mic className="w-10 h-10 text-white" />
            </button>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <span onClick={() => requireAuth(() => triggerReverseBid("1.5T Split AC"), 'bid')} className="px-4 py-2 bg-gray-800 rounded-full text-sm text-gray-300 cursor-pointer hover:bg-gray-700">"1.5T Split AC"</span>
              <span onClick={() => requireAuth(() => triggerReverseBid("Full Body MRI"), 'bid')} className="px-4 py-2 bg-gray-800 rounded-full text-sm text-gray-300 cursor-pointer hover:bg-gray-700">"Full Body MRI"</span>
              <span onClick={() => requireAuth(() => triggerReverseBid("10g 24K Gold"), 'bid')} className="px-4 py-2 bg-gray-800 rounded-full text-sm text-gray-300 cursor-pointer hover:bg-gray-700">"10g 24K Gold"</span>
            </div>

            {!swarmJoined ? (
               <button onClick={() => requireAuth(() => setShowSwarmModal(true), 'modal')} className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 hover:opacity-90">
                 <ShieldCheck className="w-5 h-5" /> Join National Swarm Pool (Extra 15% Off)
               </button>
            ) : (
               <a
                 href={`https://wa.me/?text=I%20just%20joined%20the%20National%20Swarm%20Pool%20for%20a%20huge%20discount!%20Join%20me:%20https://www.nearme-india.org`}
                 target="_blank" rel="noreferrer"
                 className="mt-4 px-6 py-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
               >
                 <Share2 className="w-4 h-4" /> Share Swarm on WhatsApp
               </a>
            )}

            {bids.length > 0 && !bidLocked && (
               <div className="w-full mt-8 bg-gray-800 p-4 rounded-xl text-left border border-blue-500/30">
                 <h4 className="font-bold text-blue-400 mb-4">Live Bids Received:</h4>
                 <div className="space-y-3">
                   {bids.map((b, i) => (
                     <div key={i} className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-700">
                        <div>
                          <span className="font-bold text-white block">{b.merchant}</span>
                          <span className="text-xs text-yellow-500">★ {b.rating} Verified</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-xl font-black text-emerald-400">₹{b.offer}</span>
                           <button onClick={() => requireAuth(() => handleLockBid(b.offer), 'lock')} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-bold">Lock Deal</button>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
            )}

            {bidLocked && (
                <a
                   href={`https://wa.me/?text=I%20just%20forced%20local%20shops%20to%20bid%20for%20my%20order%20and%20got%20a%20deal!%20Check%20it%20out:%20https://www.nearme-india.org`}
                   target="_blank" rel="noreferrer"
                   className="w-full mt-8 py-4 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-[#25D366]/20"
                 >
                   <Share2 className="w-5 h-5" /> Deal Locked! Share & Earn ₹100
                 </a>
            )}
          </div>
        )}

        {activeTab === 'camera' && (
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl font-black text-white">AI Bill & Loan Slasher</h2>

            {!billResult ? (
              <label className="w-full max-w-md h-48 border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center bg-gray-800/50 cursor-pointer hover:border-emerald-500 hover:bg-gray-800 transition-all">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => requireAuth(() => handleFileUpload(e), 'file')} />
                <Camera className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-emerald-400 font-bold">Tap to Scan Document</span>
                <span className="text-xs text-gray-500 mt-1">Hospital • Auto Repair • Showroom • Loans</span>
              </label>
            ) : (
              <div className="w-full bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-6">
                 <h3 className="text-xl font-bold text-emerald-400 mb-2">Analysis Complete</h3>
                 <div className="flex justify-between text-lg border-b border-gray-700 pb-2 mb-2">
                    <span className="text-gray-400">Original Bill:</span> <span className="font-bold">₹{billResult.original_amount_inr}</span>
                 </div>
                 <div className="flex justify-between text-2xl font-black text-white mb-6">
                    <span>Local Counter-Offer:</span> <span className="text-emerald-500">₹{billResult.counter_offer_price_inr}</span>
                 </div>
                 <a
                   href={`https://wa.me/?text=I%20just%20saved%20₹${billResult.user_savings_inr}%20using%20NearMe-India%20AI!%20Check%20it%20out:%20https://www.nearme-india.org`}
                   target="_blank" rel="noreferrer"
                   className="w-full py-4 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-[#25D366]/20"
                 >
                   <Share2 className="w-5 h-5" /> Share on WhatsApp & Earn ₹100 Cashback
                 </a>
              </div>
            )}
          </div>
        )}

        {activeTab === 'spawn' && (
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl font-black text-white">4-Second Business App</h2>
            {!spawnedApp ? (
              <div className="w-full max-w-md relative flex">
                <input
                  type="text" value={spawnInput} onChange={(e) => setSpawnInput(e.target.value)}
                  placeholder="e.g. 'Token queue & UPI app for my clinic'"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-l-xl py-4 pl-4 pr-4 text-white outline-none focus:border-purple-500"
                />
                <button onClick={() => requireAuth(handleSpawnApp, 'spawn')} className="px-6 bg-purple-600 rounded-r-xl hover:bg-purple-500 font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-white" /> Build
                </button>
              </div>
            ) : (
              <div className="w-full max-w-md p-6 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                 <h3 className="text-lg font-bold text-white mb-2">App Generated!</h3>
                 <p className="text-gray-400 mb-6 font-mono text-sm">{spawnedApp.url}</p>
                 <button onClick={() => requireAuth(payForSpawnApp, 'pay')} className="w-full py-3 bg-purple-600 hover:bg-purple-500 font-bold rounded-xl mb-4">
                    Pay ₹99 to Publish App
                 </button>
                 <a
                   href={`https://wa.me/?text=I%20just%20built%20an%20AI%20app%20in%204%20seconds!%20https://www.nearme-india.org`}
                   target="_blank" rel="noreferrer"
                   className="w-full py-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-[#25D366]/20"
                 >
                   <Share2 className="w-4 h-4" /> Share on WhatsApp
                 </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
