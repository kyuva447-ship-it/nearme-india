'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, ArrowRight, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

export default function EscrowDashboard() {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'FACTORING'>('ACTIVE');

  // Simulated Escrow Data
  const escrows = [
    { id: 'ESC-992', buyer: 'TechPark Pvt Ltd', value: 1500000, fee: 30000, status: 'FUNDS_LOCKED', delivery: 'Pending IoT Ping' },
    { id: 'ESC-414', buyer: 'Metro Builders', value: 850000, fee: 17000, status: 'RELEASED_TO_MERCHANT', delivery: 'Verified' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Shield className="w-10 h-10 text-emerald-500" />
            B2B Escrow & Factoring Engine
          </h1>
          <p className="text-slate-400 mt-2">Zero-Trust Commercial Contracts. Funds are cryptographically locked until delivery.</p>
        </header>

        <div className="flex gap-4 mb-8 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`font-bold px-4 py-2 rounded-lg transition-colors ${activeTab === 'ACTIVE' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Active Escrows
          </button>
          <button
            onClick={() => setActiveTab('FACTORING')}
            className={`font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'FACTORING' ? 'bg-amber-500/20 text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <TrendingUp className="w-4 h-4" /> Invoice Factoring (Instant Cash)
          </button>
        </div>

        {activeTab === 'ACTIVE' && (
          <div className="grid gap-6">
            {escrows.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-emerald-500/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-slate-800 text-slate-400 text-xs font-black px-2 py-1 rounded">{e.id}</span>
                    <span className={`text-xs font-black px-2 py-1 rounded flex items-center gap-1 ${e.status === 'FUNDS_LOCKED' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {e.status === 'FUNDS_LOCKED' ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {e.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{e.buyer}</h3>
                  <p className="text-sm text-slate-500 mt-1">Delivery Status: <span className="font-semibold text-slate-300">{e.delivery}</span></p>
                </div>

                <div className="text-right w-full md:w-auto bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Contract Value</p>
                  <p className="text-2xl font-black text-emerald-400">₹{e.value.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-500 mt-2 flex items-center justify-end gap-1">
                    Platform Margin: <span className="text-emerald-500 font-bold">₹{e.fee.toLocaleString('en-IN')}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'FACTORING' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-amber-500/30 rounded-3xl p-8"
          >
            <div className="flex items-start gap-4 mb-8">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Unlock Net-60 Liquidity</h2>
                <p className="text-slate-400 mt-1 max-w-xl">Sell your locked escrow invoices to our banking partners for a 3% discount and receive instant working capital today.</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-sm font-bold">Available to Factor (ESC-992)</p>
                <p className="text-3xl font-black text-white mt-1">₹15,00,000</p>
              </div>
              <ArrowRight className="w-6 h-6 text-slate-600" />
              <div className="text-right">
                <p className="text-amber-500 text-sm font-bold">Instant Cash Offer (-3%)</p>
                <p className="text-3xl font-black text-amber-400 mt-1">₹14,55,000</p>
              </div>
            </div>

            <button className="w-full mt-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-xl transition-all shadow-lg shadow-amber-500/20">
              Accept Instant Transfer
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
