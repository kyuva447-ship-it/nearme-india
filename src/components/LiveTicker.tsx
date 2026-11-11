'use client';
import React, { useState, useEffect } from 'react';
import { Activity, Star, Zap, Eye, ChevronRight } from 'lucide-react';
import { triggerNearMeCheckout } from '@/lib/razorpayClient';
import PhoneAuthModal from './QuickAuthModal';
import UpiFallbackModal from './UpiFallbackModal';
import { useToast } from './Toast';

export default function LiveActivityTicker() {
  const [activities, setActivities] = useState<any[]>([]);
  const [showAuth, setShowAuth] = useState(false);
  const [fallbackAmount, setFallbackAmount] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Generate some initial mock data for social proof
    const generateActivity = () => {
      const types = ['purchase', 'view', 'join', 'save'];
      const users = ['Rahul M.', 'Priya S.', 'Vikram K.', 'Sneha P.', 'Amit R.', 'Kavita D.', 'Suresh N.'];
      const items = ['1.5T Split AC', 'Full Body MRI', '10g 24K Gold', 'Priority Pass', 'B2B Wholesale Deal', 'Auto Repair'];
      const savings = [500, 1200, 450, 2000, 300, 800];

      const type = types[Math.floor(Math.random() * types.length)];
      const user = users[Math.floor(Math.random() * users.length)];

      if (type === 'purchase') {
          return { id: Math.random().toString(), icon: <Zap className="w-4 h-4 text-emerald-400" />, text: <><span className="font-bold text-white">{user}</span> bought <span className="text-gray-300">{items[Math.floor(Math.random()*items.length)]}</span></>, time: 'Just now', action: 'Claim Similar Deal' };
      } else if (type === 'view') {
          return { id: Math.random().toString(), icon: <Eye className="w-4 h-4 text-blue-400" />, text: <><span className="font-bold text-white">42 people</span> looking at <span className="text-gray-300">{items[Math.floor(Math.random()*items.length)]}</span></>, time: 'Live', action: 'View Deal' };
      } else if (type === 'join') {
          return { id: Math.random().toString(), icon: <Star className="w-4 h-4 text-purple-400" />, text: <><span className="font-bold text-white">{user}</span> joined the <span className="text-purple-300">National Swarm Pool</span></>, time: '1m ago', action: 'Join Swarm' };
      } else {
          return { id: Math.random().toString(), icon: <Activity className="w-4 h-4 text-yellow-400" />, text: <><span className="font-bold text-white">{user}</span> saved <span className="text-yellow-400 font-bold">₹{savings[Math.floor(Math.random()*savings.length)]}</span></>, time: '2m ago', action: 'Slash My Bill' };
      }
    };

    setActivities(Array(3).fill(0).map(generateActivity));

    const interval = setInterval(() => {
        setActivities(prev => {
            const newActivities = [generateActivity(), ...prev];
            if (newActivities.length > 3) newActivities.pop();
            return newActivities;
        });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const requireAuth = (actionFn: () => void) => {
    const userPhone = localStorage.getItem('nearme_user_phone');
    if (!userPhone) {
      setPendingAction(() => actionFn);
      setShowAuth(true);
    } else {
      actionFn();
    }
  };

  const handleAction = (activity: any) => {
    if (activity.action === 'Claim Similar Deal') {
        triggerNearMeCheckout({
            itemName: 'Fast-Track AI Deal',
            amountInRupees: 99,
            actionType: 'ticker_deal',
            onSuccess: () => toast('Deal Secured!', 'success'),
            onFallback: () => setFallbackAmount(99),
            onAuthRequired: () => setShowAuth(true)
        });
    } else {
        toast(`Routing to ${activity.action}...`, 'info');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 mb-8 bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden relative group">
      {showAuth && <PhoneAuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); if(pendingAction) { pendingAction(); setPendingAction(null); } }} />}
      {fallbackAmount && <UpiFallbackModal amount={fallbackAmount} onClose={() => setFallbackAmount(null)} onSuccess={() => { toast('Transaction Completed!', 'success'); setFallbackAmount(null); }} />}

      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500 animate-pulse"></div>

      <div className="p-3 flex flex-col sm:flex-row gap-3">
        <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-gray-800">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Live Feed</span>
        </div>

        <div className="flex-1 overflow-hidden relative h-8 sm:h-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 space-y-2 sm:space-y-0 transition-transform duration-500 ease-in-out">
                {activities.map((act) => (
                    <div key={act.id} className="flex items-center justify-between sm:justify-start gap-4 min-w-max animate-fade-in">
                        <div className="flex items-center gap-2">
                            {act.icon}
                            <span className="text-sm">{act.text}</span>
                            <span className="text-xs text-gray-500 ml-1">({act.time})</span>
                        </div>
                        <button onClick={() => requireAuth(() => handleAction(act))} className="sm:hidden text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-white flex items-center gap-1">
                            {act.action} <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        <div className="hidden sm:flex items-center pl-4 border-l border-gray-800">
            <button onClick={() => requireAuth(() => handleAction(activities[0]))} className="text-xs bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-colors">
                {activities[0]?.action} <ChevronRight className="w-3 h-3" />
            </button>
        </div>
      </div>
    </div>
  );
}
