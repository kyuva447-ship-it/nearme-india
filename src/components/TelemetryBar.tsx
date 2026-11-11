'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, MapPin, Zap, AlertTriangle, User, Ticket, Store, Building } from 'lucide-react';
import PhoneAuthModal from './QuickAuthModal';
import { useToast } from './Toast';

export default function TelemetryBar() {
  const [latency, setLatency] = useState(12);
  const [activeNodes, setActiveNodes] = useState(24);
  const [showAuth, setShowAuth] = useState(false);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initial fetch
    setUserPhone(localStorage.getItem('nearme_user_phone'));

    const interval = setInterval(() => {
      setLatency(10 + Math.floor(Math.random() * 15));
      setActiveNodes(20 + Math.floor(Math.random() * 10));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
      localStorage.removeItem('nearme_user_phone');
      setUserPhone(null);
      toast('Signed out successfully', 'info');
  };

  return (
    <div className="w-full bg-gray-950 border-b border-gray-900 text-xs font-mono text-gray-500 py-1.5 px-4 flex justify-between items-center z-50 relative overflow-hidden">
      {showAuth && <PhoneAuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); setUserPhone(localStorage.getItem('nearme_user_phone')); }} />}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-blue-500" />
          <span>BLR-CORE-1</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 border-l border-gray-800 pl-4">
          <Zap className="w-3 h-3 text-yellow-500" />
          <span>{latency}ms</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 border-l border-gray-800 pl-4">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span className="text-emerald-500/70">WAF: ACTIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* New Navigation Links Required by Master Production Overhaul */}
        <Link href="/account" className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors">
            <Ticket className="w-3 h-3 text-purple-400" /> My Passes
        </Link>
        <Link href="/merchant-claim/1" className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors">
            <Store className="w-3 h-3 text-orange-400" /> Merchant Claim
        </Link>
        <Link href="/owner" className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors border-r border-gray-800 pr-4">
            <Building className="w-3 h-3 text-blue-400" /> Owner Console
        </Link>

        {userPhone ? (
             <div className="flex items-center gap-3">
                 <span className="text-gray-300 font-bold flex items-center gap-1">
                     <User className="w-3 h-3 text-emerald-400"/> {userPhone.slice(0, 4)}***
                 </span>
                 <button onClick={handleSignOut} className="text-gray-600 hover:text-red-400 transition-colors">Sign Out</button>
             </div>
        ) : (
            <button onClick={() => setShowAuth(true)} className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                <User className="w-3 h-3" /> Sign In / Profile
            </button>
        )}
      </div>
    </div>
  );
}
