'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Zap, TrendingUp, Wallet, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MerchantDashboard() {
  const router = useRouter();

  useEffect(() => {
     // OTP IS DISABLED. DIRECT ACCESS IS PROTECTED.
     router.push('/');
  }, [router]);

  return (
     <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800">Redirecting to Homepage...</h1>
            <p className="text-slate-500 mt-2">Please Login via WhatsApp to view Dashboard.</p>
        </div>
     </div>
  );
}
