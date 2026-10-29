'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, Users, Wallet, CheckCircle, XCircle } from 'lucide-react';

export default function AdminSuperPanel() {
  const [profit] = useState(4825.00); // Mock daily profit

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-100 font-sans relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-slate-800/50 pb-8 gap-6">
            <div>
                <h1 className="text-4xl font-black flex items-center gap-4 text-white">
                    <ShieldAlert className="w-10 h-10 text-red-500 bg-red-500/10 p-2 rounded-xl" />
                    God-Mode Admin
                </h1>
                <p className="text-red-400 mt-4 font-black text-xs uppercase tracking-widest bg-red-500/10 px-4 py-2 rounded-full inline-block border border-red-500/20">Superuser Access</p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-xl text-right">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Today's ₹3 Profit</p>
                <div className="text-4xl font-black text-emerald-400 flex items-center gap-3 justify-end">
                    <TrendingUp className="w-8 h-8" />
                    ₹{profit.toFixed(2)}
                </div>
            </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20"><Users className="w-8 h-8 text-indigo-400" /></div>
                <div>
                    <p className="text-sm font-bold text-slate-400">Total Merchants</p>
                    <p className="text-2xl font-black text-white">1,248</p>
                </div>
            </div>
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20"><Wallet className="w-8 h-8 text-amber-400" /></div>
                <div>
                    <p className="text-sm font-bold text-slate-400">Total Locked Escrow</p>
                    <p className="text-2xl font-black text-white">₹45,200</p>
                </div>
            </div>
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20"><ShieldAlert className="w-8 h-8 text-red-400" /></div>
                <div>
                    <p className="text-sm font-bold text-slate-400">Pending Approvals</p>
                    <p className="text-2xl font-black text-white">24</p>
                </div>
            </div>
        </div>

        {/* Action Table */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <h3 className="text-xl font-black text-white">Live Merchant Queue</h3>
            </div>
            <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <div>
                            <p className="text-white font-bold">Sri Balaji Traders (Koramangala)</p>
                            <p className="text-slate-400 text-sm mt-1">Requested Verification Badge</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-colors"><CheckCircle className="w-5 h-5"/></button>
                            <button className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors"><XCircle className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
