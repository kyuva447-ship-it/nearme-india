import React from 'react';
import { Wifi, Dumbbell, Coffee, BatteryCharging, CheckCircle2 } from 'lucide-react';

export default function MicroPass() {
  return (
    <div className="w-full mt-16 px-4 pb-16">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Wifi className="w-48 h-48" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black text-white mb-2">Ambient Micro-Pass</h2>
          <p className="text-indigo-200 mb-8">Access premium local facilities at ₹0.25/minute via UPI Autopay. No subscriptions required.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <Dumbbell className="w-6 h-6 text-emerald-400 mb-2" />
              <span className="text-sm font-bold text-white">Gyms</span>
            </div>
            <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <Coffee className="w-6 h-6 text-amber-400 mb-2" />
              <span className="text-sm font-bold text-white">Co-working</span>
            </div>
            <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <Wifi className="w-6 h-6 text-blue-400 mb-2" />
              <span className="text-sm font-bold text-white">Premium WiFi</span>
            </div>
            <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <BatteryCharging className="w-6 h-6 text-green-400 mb-2" />
              <span className="text-sm font-bold text-white">EV Charging</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl flex justify-center items-center gap-2 transition-colors">
               <CheckCircle2 className="w-5 h-5" />
               Activate ₹0.25/min Pass
             </button>
             <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors border border-slate-700">
               Merchant Auto-Bidder (₹499/mo)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}