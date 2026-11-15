'use client';
import React, { useState } from 'react';
import { Sparkles, Loader2, Dumbbell, Laptop, Wifi, BatteryCharging, Zap } from 'lucide-react';
import { triggerNearMeCheckout } from '@/lib/razorpayClient';
import PhoneAuthModal from './QuickAuthModal';
import UpiFallbackModal from './UpiFallbackModal';
import SavingsPassModal from './SavingsPassModal';
import { useToast } from './Toast';

interface FacilityItem {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  badgeClass: string;
}

export default function MicroPass() {
  const [loadingPass, setLoadingPass] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [fallbackAmount, setFallbackAmount] = useState<number | null>(null);
  const [activePass, setActivePass] = useState<FacilityItem | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<string | null>('gym');
  const { toast } = useToast();

  const facilities: FacilityItem[] = [
    {
      id: 'gym',
      name: 'Premium Gym Access',
      price: 99,
      icon: <Dumbbell className="w-5 h-5" />,
      badgeClass: 'bg-blue-500/10 text-blue-400',
    },
    {
      id: 'coworking',
      name: 'Co-working Day Pass',
      price: 149,
      icon: <Laptop className="w-5 h-5" />,
      badgeClass: 'bg-purple-500/10 text-purple-400',
    },
    {
      id: 'wifi',
      name: 'High-Speed Wi-Fi Zone',
      price: 49,
      icon: <Wifi className="w-5 h-5" />,
      badgeClass: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      id: 'ev',
      name: 'EV Fast Charging',
      price: 199,
      icon: <BatteryCharging className="w-5 h-5" />,
      badgeClass: 'bg-yellow-500/10 text-yellow-400',
    },
  ];

  const executeWithWatchdog = (actionFn: () => void, passId: string) => {
    const userPhone = localStorage.getItem('nearme_user_phone');
    if (!userPhone) {
      setPendingAction(() => actionFn);
      setShowAuth(true);
      return;
    }

    setLoadingPass(passId);
    setTimeout(() => {
      setLoadingPass(null);
    }, 8000);

    try {
      actionFn();
    } catch {
      setLoadingPass(null);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleBuyPass = (facility: FacilityItem | undefined) => {
    if (!facility) return;

    triggerNearMeCheckout({
      itemName: `${facility.name} Pass`,
      amountInRupees: facility.price,
      actionType: 'wallet_recharge',
      onSuccess: () => {
        setActivePass(facility);
        toast(`Unlocked ${facility.name}!`, 'success');
        setLoadingPass(null);
      },
      onFallback: () => {
        setLoadingPass(null);
        setFallbackAmount(facility.price);
      },
      onAuthRequired: () => {
        setLoadingPass(null);
        setShowAuth(true);
      },
    });
  };

  const handleMerchantBidder = () => {
    triggerNearMeCheckout({
      itemName: 'Verified Pro Subscription',
      amountInRupees: 299,
      actionType: 'pro_subscription',
      onSuccess: () => {
        toast('Verified Pro Activated!', 'success');
        setLoadingPass(null);
      },
      onFallback: () => {
        setLoadingPass(null);
        setFallbackAmount(299);
      },
      onAuthRequired: () => {
        setLoadingPass(null);
        setShowAuth(true);
      },
    });
  };

  const handleFallbackSuccess = () => {
    toast('UPI payment recorded for verification!', 'success');
    setFallbackAmount(null);
  };

  const activeFacilityData = facilities.find((f) => f.id === selectedFacility);

  return (
    <section className="py-12 px-4 relative z-10 w-full max-w-4xl mx-auto">
      {showAuth && (
        <PhoneAuthModal
          onClose={() => {
            setShowAuth(false);
            setLoadingPass(null);
          }}
          onSuccess={handleAuthSuccess}
        />
      )}
      {fallbackAmount && (
        <UpiFallbackModal
          amount={fallbackAmount}
          onClose={() => {
            setFallbackAmount(null);
            setLoadingPass(null);
          }}
          onSuccess={handleFallbackSuccess}
        />
      )}
      {activePass && !fallbackAmount && !showAuth && (
        <SavingsPassModal
          amount={activePass.price * 10}
          service={activePass.name}
          onClose={() => setActivePass(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-black text-white">Instant Micro-Passes</h3>
        </div>
        <button
          type="button"
          onClick={() => executeWithWatchdog(handleMerchantBidder, 'merchant_bidder')}
          className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold px-4 py-3 rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-orange-500/20"
        >
          {loadingPass === 'merchant_bidder' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          Verified Pro Partner (₹299/mo)
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {facilities.map((facility) => (
          <div
            key={facility.id}
            onClick={() => setSelectedFacility(facility.id)}
            className={`bg-gray-900 border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-3 ${
              selectedFacility === facility.id
                ? 'border-purple-500 bg-purple-900/30 shadow-[0_0_20px_rgba(168,85,247,0.2)] scale-105'
                : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800'
            }`}
          >
            <div className={`p-3 rounded-full ${facility.badgeClass}`}>{facility.icon}</div>
            <h4 className="font-bold text-sm text-gray-200">{facility.name}</h4>
            <span className="text-lg font-black text-white">₹{facility.price}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={!selectedFacility || loadingPass === selectedFacility}
        onClick={() =>
          executeWithWatchdog(() => handleBuyPass(activeFacilityData), activeFacilityData?.id || '')
        }
        className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-xl ${
          selectedFacility
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        }`}
      >
        {loadingPass === selectedFacility ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" /> Processing...
          </>
        ) : selectedFacility ? (
          <>⚡ Activate {activeFacilityData?.name} — ₹{activeFacilityData?.price} via Razorpay</>
        ) : (
          <>Select a Facility Pass Above</>
        )}
      </button>
    </section>
  );
}
