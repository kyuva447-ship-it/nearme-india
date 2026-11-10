'use client';
import React, { useState, useEffect } from 'react';
import { Wifi, Dumbbell, Coffee, BatteryCharging, CheckCircle2, QrCode } from 'lucide-react';
import { loadRazorpay } from '@/lib/razorpayClient';
import { useRouter } from 'next/navigation';
import PhoneAuthModal from './PhoneAuthModal';
import UpiFallbackModal from './UpiFallbackModal';
import { useToast } from './Toast';

export default function MicroPass() {
  const [activeTile, setActiveTile] = useState<string>('Gyms');
  const [isPassActive, setIsPassActive] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [fallbackAmount, setFallbackAmount] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<'pass' | 'merchant' | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => { loadRazorpay(); }, []);

  const executePass = async (userPhone: string) => {
    try {
      const res = await fetch('/api/payment/razorpay-split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_amount: 50, action_type: 'live_checkout', user_phone: userPhone })
      });
      const data = await res.json();

      if (data.fallbackMode || !data.order_id?.startsWith('order_')) {
         setFallbackAmount(50);
         return;
      }

      const rzp = new (window as any).Razorpay({
        key: data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: 5000,
        currency: "INR",
        name: "Micro-Pass Top-up",
        order_id: data.order_id,
        prefill: { contact: userPhone },
        handler: function () {
            setIsPassActive(true);
            toast('Pass Activated Successfully!', 'success');
        }
      });
      rzp.on('payment.failed', function () { setFallbackAmount(50); });
      rzp.open();

    } catch (err) { setFallbackAmount(50); }
  };

  const executeMerchant = async (userPhone: string) => {
    try {
      const res = await fetch('/api/payment/razorpay-split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_amount: 499, action_type: 'merchant_sub', user_phone: userPhone })
      });
      const data = await res.json();

      if (data.fallbackMode || !data.order_id?.startsWith('order_')) {
         setFallbackAmount(499);
         return;
      }

      const rzp = new (window as any).Razorpay({
        key: data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: 49900,
        currency: "INR",
        name: "Auto-Bidder Pro",
        order_id: data.order_id,
        prefill: { contact: userPhone },
        handler: function () {
            toast("SaaS Auto-Bidder Activated!", 'success');
            router.push('/dashboard');
        }
      });
      rzp.on('payment.failed', function () { setFallbackAmount(499); });
      rzp.open();

    } catch (err) { setFallbackAmount(499); }
  };

  const handleAction = (action: 'pass' | 'merchant') => {
    const userPhone = localStorage.getItem('nearme_user_phone');
    if (!userPhone) {
      setPendingAction(action);
      setShowAuth(true);
    } else {
      action === 'pass' ? executePass(userPhone) : executeMerchant(userPhone);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    const userPhone = localStorage.getItem('nearme_user_phone');
    if (pendingAction && userPhone) {
      pendingAction === 'pass' ? executePass(userPhone) : executeMerchant(userPhone);
      setPendingAction(null);
    }
  };

  const tiles = [
    { name: 'Gyms', icon: <Dumbbell className="w-6 h-6 text-emerald-400 mb-2" /> },
    { name: 'Co-working', icon: <Coffee className="w-6 h-6 text-amber-400 mb-2" /> },
    { name: 'Premium WiFi', icon: <Wifi className="w-6 h-6 text-blue-400 mb-2" /> },
    { name: 'EV Charging', icon: <BatteryCharging className="w-6 h-6 text-green-400 mb-2" /> }
  ];

  return (
    <div className="w-full mt-16 px-4 pb-16">
      {showAuth && <PhoneAuthModal onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}
      {fallbackAmount && <UpiFallbackModal amount={fallbackAmount} onClose={() => setFallbackAmount(null)} onSuccess={() => { if (fallbackAmount===50) setIsPassActive(true); else { toast('Subscribed!','success'); router.push('/dashboard'); } }} />}
      <div className="bg-gradient-to-r from-gray-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Wifi className="w-48 h-48" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black text-white mb-2">Ambient Micro-Pass</h2>
          <p className="text-indigo-200 mb-8">Access premium local facilities at ₹0.25/minute via UPI Autopay. No subscriptions required.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {tiles.map((tile) => (
              <div
                key={tile.name}
                onClick={() => setActiveTile(tile.name)}
                className={`flex flex-col items-center rounded-xl p-4 cursor-pointer transition-all border ${activeTile === tile.name ? 'bg-indigo-900/50 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-105' : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'}`}
              >
                {tile.icon}
                <span className="text-sm font-bold text-white">{tile.name}</span>
              </div>
            ))}
          </div>

          {!isPassActive ? (
            <div className="flex flex-col sm:flex-row gap-4">
               <button onClick={() => handleAction('pass')} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl flex justify-center items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20">
                 <CheckCircle2 className="w-5 h-5" />
                 Activate ₹0.25/min Pass
               </button>
               <button onClick={() => handleAction('merchant')} className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors border border-gray-700 hover:border-gray-500">
                 Merchant Auto-Bidder (₹499/mo)
               </button>
            </div>
          ) : (
            <div className="flex items-center gap-6 p-4 bg-indigo-950/50 border border-indigo-500/50 rounded-xl">
               <div className="p-2 bg-white rounded-lg"><QrCode className="w-16 h-16 text-black" /></div>
               <div>
                  <h3 className="text-emerald-400 font-bold text-lg">Active Session</h3>
                  <p className="text-sm text-indigo-200">Tap phone on {activeTile} terminal to enter.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
