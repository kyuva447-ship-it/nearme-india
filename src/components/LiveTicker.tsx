'use client';
import React, { useState, useEffect } from 'react';
import { Timer, ArrowDownRight, Loader2, Share2, QrCode } from 'lucide-react';
import { loadRazorpay } from '@/lib/razorpayClient';
import PhoneAuthModal from './PhoneAuthModal';

const mockSlots = [
  { id: 1, title: 'MRI Scan (Empty Slot)', sector: 'Healthcare', original: 8000, current: 4500, time: '12:45' },
  { id: 2, title: 'Luxury Bus Seat (Bengaluru-Chennai)', sector: 'Travel', original: 1500, current: 850, time: '04:12' },
  { id: 3, title: '5-Star Hotel Room (Tonight)', sector: 'Hospitality', original: 12000, current: 5200, time: '08:30' }
];

export default function LiveTicker() {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [purchasedId, setPurchasedId] = useState<number | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  useEffect(() => {
    loadRazorpay();
  }, []);

  const executeLock = async (id: number, amount: number, userPhone: string) => {
    setLoadingId(id);
    try {
      const res = await fetch('/api/payment/razorpay-split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_inr: amount, platform_fee_pct: 10, merchant_account_id: 'acc_dummy', slot_id: id, user_phone: userPhone })
      });
      const data = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "NearMe India",
        description: "AI-Driven Local Commerce",
        order_id: data.order_id.startsWith('rzp_order_sim') ? undefined : data.order_id,
        prefill: { contact: userPhone },
        handler: function (response: any) {
            setPurchasedId(id);
        },
        theme: { color: "#3B82F6" }
      };

      if (data.demo_mode) {
         setPurchasedId(id);
      } else {
         const rzp = new (window as any).Razorpay(options);
         rzp.open();
      }
    } catch (err) {
      alert('Failed to initiate payment.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleLockUPI = (id: number, amount: number) => {
    const userPhone = localStorage.getItem('nearme_user_phone');
    if (!userPhone) {
      setPendingAction({ id, amount });
      setShowAuth(true);
    } else {
      executeLock(id, amount, userPhone);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    const userPhone = localStorage.getItem('nearme_user_phone');
    if (pendingAction && userPhone) {
      executeLock(pendingAction.id, pendingAction.amount, userPhone);
      setPendingAction(null);
    }
  };

  return (
    <div className="w-full mt-16 px-4">
      {showAuth && <PhoneAuthModal onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Timer className="w-6 h-6 text-orange-500" />
          Expiring Dead-Time Exchange
        </h2>
        <span className="text-sm text-gray-400">Prices drop 1% every 2 mins</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockSlots.map(slot => (
          <div key={slot.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-orange-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{slot.sector}</span>
                <h3 className="text-white font-bold mt-1 line-clamp-1">{slot.title}</h3>
              </div>
              <div className="px-2 py-1 bg-red-900/30 text-red-400 text-xs font-bold rounded flex items-center gap-1 animate-pulse">
                <Timer className="w-3 h-3" /> {slot.time}
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-sm text-gray-500 line-through">₹{slot.original}</span>
                  <div className="text-2xl font-black text-emerald-400 flex items-center gap-1">
                    ₹{slot.current}
                    <ArrowDownRight className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
                {!purchasedId || purchasedId !== slot.id ? (
                  <button
                    onClick={() => handleLockUPI(slot.id, slot.current)}
                    disabled={loadingId === slot.id}
                    className="px-4 py-2 bg-gray-800 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 border border-gray-700 hover:border-emerald-500"
                  >
                    {loadingId === slot.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lock via UPI'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-emerald-900/50 text-emerald-400 font-bold rounded-lg border border-emerald-500/50 px-4 py-2">
                    <QrCode className="w-5 h-5" /> Pass Ready
                  </div>
                )}
              </div>

              {purchasedId === slot.id && (
                 <a
                   href={`https://wa.me/?text=I%20just%20saved%20₹${slot.original - slot.current}%20on%20${encodeURIComponent(slot.title)}%20via%20https://www.nearme-india.org`}
                   target="_blank" rel="noreferrer"
                   className="w-full py-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
                 >
                   <Share2 className="w-4 h-4" />
                   Share on WhatsApp & Earn ₹100 Cashback
                 </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
