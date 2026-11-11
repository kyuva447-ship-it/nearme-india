'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Dumbbell, Laptop, Wifi, BatteryCharging, Zap } from 'lucide-react';
import { triggerNearMeCheckout } from '@/lib/razorpayClient';
import PhoneAuthModal from './QuickAuthModal';
import UpiFallbackModal from './UpiFallbackModal';
import SavingsPassModal from './SavingsPassModal';
import { useToast } from './Toast';

export default function MicroPass() {
    const [loadingPass, setLoadingPass] = useState<string | null>(null); // MUST BE NULL AT START
    const [showAuth, setShowAuth] = useState(false);
    const [pendingAction, setPendingAction] = useState<any>(null);
    const [fallbackAmount, setFallbackAmount] = useState<number | null>(null);
    const [activePass, setActivePass] = useState<any>(null);
    const [selectedFacility, setSelectedFacility] = useState<string | null>('gym'); // Default to Gym
    const { toast } = useToast();

    const facilities = [
        { id: 'gym', name: 'Premium Gym Access', price: 99, icon: <Dumbbell className="w-5 h-5" />, color: 'blue' },
        { id: 'coworking', name: 'Co-working Day Pass', price: 149, icon: <Laptop className="w-5 h-5" />, color: 'purple' },
        { id: 'wifi', name: 'High-Speed Wi-Fi Zone', price: 49, icon: <Wifi className="w-5 h-5" />, color: 'emerald' },
        { id: 'ev', name: 'EV Fast Charging', price: 199, icon: <BatteryCharging className="w-5 h-5" />, color: 'yellow' },
    ];

    const executeWithWatchdog = (actionFn: () => void, passId: string) => {
        const userPhone = localStorage.getItem('nearme_user_phone');
        if (!userPhone) {
            setPendingAction(() => actionFn);
            setShowAuth(true);
            return; // Exit immediately, do NOT set loading state
        }

        setLoadingPass(passId);

        // Hard 2.5-second watchdog timer to prevent infinite "Processing..." freezes
        setTimeout(() => {
            setLoadingPass(null);
        }, 2500);

        try {
            actionFn();
        } catch (e) {
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

    const handleBuyPass = (facility: any) => {
        if (!facility) return;

        triggerNearMeCheckout({
            itemName: `${facility.name} Pass`,
            amountInRupees: facility.price,
            actionType: 'micro_pass',
            onSuccess: () => {
                setActivePass(facility);
                toast(`Unlocked ${facility.name}!`, 'success');
                setLoadingPass(null);
            },
            onFallback: () => {
                setLoadingPass(null);
                setFallbackAmount(facility.price);
                setActivePass(facility);
            },
            onAuthRequired: () => {
                setLoadingPass(null);
                setShowAuth(true);
            }
        });
    };

    const handleMerchantBidder = () => {
        triggerNearMeCheckout({
            itemName: `Merchant Auto-Bidder Pro`,
            amountInRupees: 499,
            actionType: 'subscription',
            onSuccess: () => {
                toast(`Auto-Bidder Activated!`, 'success');
                setLoadingPass(null);
            },
            onFallback: () => {
                setLoadingPass(null);
                setFallbackAmount(499);
            },
            onAuthRequired: () => {
                setLoadingPass(null);
                setShowAuth(true);
            }
        });
    };

    const handleFallbackSuccess = () => {
        toast(`Transaction complete!`, 'success');
        setFallbackAmount(null);
    };

    const activeFacilityData = facilities.find(f => f.id === selectedFacility);

    return (
        <section className="py-12 px-4 relative z-10 w-full max-w-4xl mx-auto">
            {showAuth && <PhoneAuthModal onClose={() => { setShowAuth(false); setLoadingPass(null); }} onSuccess={handleAuthSuccess} />}
            {fallbackAmount && <UpiFallbackModal amount={fallbackAmount} onClose={() => { setFallbackAmount(null); setLoadingPass(null); }} onSuccess={handleFallbackSuccess} />}
            {activePass && !fallbackAmount && !showAuth && <SavingsPassModal amount={activePass.price * 10} service={activePass.name} onClose={() => setActivePass(null)} />}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-black text-white">Instant Micro-Passes</h3>
                </div>
                <button onClick={() => executeWithWatchdog(handleMerchantBidder, 'merchant_bidder')} className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold px-4 py-3 rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">
                    {loadingPass === 'merchant_bidder' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4" />} Merchant Auto-Bidder (₹499/mo)
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {facilities.map(facility => (
                    <div
                        key={facility.id}
                        onClick={() => setSelectedFacility(facility.id)}
                        className={`bg-gray-900 border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-3 ${selectedFacility === facility.id ? 'border-purple-500 bg-purple-900/30 shadow-[0_0_20px_rgba(168,85,247,0.2)] scale-105' : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800'}`}
                    >
                        <div className={`p-3 rounded-full bg-${facility.color}-500/10 text-${facility.color}-400`}>
                            {facility.icon}
                        </div>
                        <h4 className="font-bold text-sm text-gray-200">{facility.name}</h4>
                        <span className="text-lg font-black text-white">₹{facility.price}</span>
                    </div>
                ))}
            </div>

            <button
                disabled={!selectedFacility || loadingPass === selectedFacility}
                onClick={() => executeWithWatchdog(() => handleBuyPass(activeFacilityData), activeFacilityData?.id || '')}
                className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-xl ${selectedFacility ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            >
                {loadingPass === selectedFacility ? (
                    <><Loader2 className="w-6 h-6 animate-spin"/> Processing...</>
                ) : selectedFacility ? (
                    <>⚡ Activate {activeFacilityData?.name} — ₹{activeFacilityData?.price} via UPI</>
                ) : (
                    <>Select a Facility Pass Above</>
                )}
            </button>
        </section>
    );
}
