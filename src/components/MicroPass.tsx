'use client';
import React, { useState } from 'react';
import { Sparkles, Loader2, Dumbbell, Laptop, Wifi, BatteryCharging, Zap } from 'lucide-react';
import { triggerNearMeCheckout } from '@/lib/razorpayClient';
import PhoneAuthModal from './QuickAuthModal';
import UpiFallbackModal from './UpiFallbackModal';
import SavingsPassModal from './SavingsPassModal';
import { useToast } from './Toast';

export default function MicroPass() {
    const [loadingPass, setLoadingPass] = useState<string | null>(null);
    const [showAuth, setShowAuth] = useState(false);
    const [pendingAction, setPendingAction] = useState<any>(null);
    const [fallbackAmount, setFallbackAmount] = useState<number | null>(null);
    const [activePass, setActivePass] = useState<any>(null);
    const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
    const { toast } = useToast();

    const facilities = [
        { id: 'gym', name: 'Premium Gym Access', price: 99, icon: <Dumbbell className="w-5 h-5" />, color: 'blue' },
        { id: 'coworking', name: 'Co-working Day Pass', price: 149, icon: <Laptop className="w-5 h-5" />, color: 'purple' },
        { id: 'wifi', name: 'High-Speed Wi-Fi Zone', price: 49, icon: <Wifi className="w-5 h-5" />, color: 'emerald' },
        { id: 'ev', name: 'EV Fast Charging', price: 199, icon: <BatteryCharging className="w-5 h-5" />, color: 'yellow' },
    ];

    const requireAuth = (actionFn: () => void, pass: any) => {
        const userPhone = localStorage.getItem('nearme_user_phone');
        if (!userPhone) {
            setPendingAction({ fn: actionFn, pass });
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

    const handleBuyPass = (facility: any) => {
        if (!facility) return;
        setLoadingPass(facility.id);

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
        setLoadingPass('merchant_bidder');

        triggerNearMeCheckout({
            itemName: `Merchant Auto-Bidder`,
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
            {showAuth && <PhoneAuthModal onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}
            {fallbackAmount && <UpiFallbackModal amount={fallbackAmount} onClose={() => setFallbackAmount(null)} onSuccess={handleFallbackSuccess} />}
            {activePass && !fallbackAmount && !showAuth && <SavingsPassModal amount={activePass.price * 10} service={activePass.name} onClose={() => setActivePass(null)} />}

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-black text-white">Instant Micro-Passes</h3>
                </div>
                <button onClick={() => requireAuth(handleMerchantBidder, 'merchant_bidder')} className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">
                    <Zap className="w-4 h-4" /> Merchant Auto-Bidder (₹499/mo)
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {facilities.map(facility => (
                    <div
                        key={facility.id}
                        onClick={() => setSelectedFacility(facility.id)}
                        className={`bg-gray-900 border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-3 ${selectedFacility === facility.id ? 'border-purple-500 bg-purple-900/20 shadow-lg shadow-purple-500/10 scale-105' : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800'}`}
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
                onClick={() => requireAuth(() => handleBuyPass(activeFacilityData), activeFacilityData)}
                className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all ${selectedFacility ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-600/20' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            >
                {loadingPass === selectedFacility ? (
                    <><Loader2 className="w-6 h-6 animate-spin"/> Processing...</>
                ) : selectedFacility ? (
                    <>Unlock {activeFacilityData?.name} for ₹{activeFacilityData?.price}</>
                ) : (
                    <>Select a Facility Pass Above</>
                )}
            </button>
        </section>
    );
}
