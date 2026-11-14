'use client';

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { triggerNearMeCheckout } from '@/lib/razorpayClient';
import QuickAuthModal from './QuickAuthModal';
import UpiFallbackModal from './UpiFallbackModal';
import SavingsPassModal from './SavingsPassModal';
import { useToast } from './Toast';

export default function LiveMiniAppPayButton({ title }: { title: string }) {
  const [showAuth, setShowAuth] = useState(false);
  const [fallbackAmount, setFallbackAmount] = useState<number | null>(null);
  const [paidPass, setPaidPass] = useState<boolean>(false);
  const { toast } = useToast();

  const startPay = () => {
    triggerNearMeCheckout({
      itemName: `${title} Booking`,
      amountInRupees: 199,
      actionType: 'mini_app_booking',
      onSuccess: () => {
        toast(`Payment verified for ${title}!`, 'success');
        setPaidPass(true);
      },
      onFallback: () => setFallbackAmount(199),
      onAuthRequired: () => setShowAuth(true),
    });
  };

  return (
    <>
      {showAuth && (
        <QuickAuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            startPay();
          }}
        />
      )}
      {fallbackAmount !== null && (
        <UpiFallbackModal
          amount={fallbackAmount}
          onClose={() => setFallbackAmount(null)}
          onSuccess={() => {
            setFallbackAmount(null);
            setPaidPass(true);
            toast(`UPI lock confirmed for ${title}!`, 'success');
          }}
        />
      )}
      {paidPass && (
        <SavingsPassModal
          amount={199}
          service={`${title} Booking`}
          onClose={() => setPaidPass(false)}
        />
      )}
      <button
        type="button"
        onClick={startPay}
        className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl mb-4 transition-colors flex items-center justify-center gap-2"
      >
        <ShieldCheck className="w-5 h-5 text-emerald-400" />
        Pay ₹199 via UPI / Razorpay Split
      </button>
    </>
  );
}
