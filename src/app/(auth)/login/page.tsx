'use client';
import { motion } from 'framer-motion';
import { ShieldCheck, Info } from 'lucide-react';
import Link from 'next/link';

export default function FrictionlessLogin() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-10 text-white">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-black">Merchant Login</h2>
        </div>

        <div className="p-10">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 text-amber-800">
             <Info className="w-8 h-8 mx-auto mb-3 text-amber-500" />
             <h3 className="font-bold text-lg mb-2">Login Coming Soon</h3>
             <p className="text-sm">We are currently integrating a new secure SMS gateway. Direct merchant login is temporarily disabled.</p>
          </div>

          <Link href="/" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-colors shadow-md shadow-emerald-500/30">
            Return to Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
