'use client';
import React, { useState } from 'react';
import { Mic, Camera, Zap, ShieldCheck } from 'lucide-react';

export default function CommandHub() {
  const [activeTab, setActiveTab] = useState<'voice' | 'camera' | 'spawn'>('voice');

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
      {/* TABS */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('voice')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-colors ${activeTab === 'voice' ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <Mic className="w-5 h-5" />
          <span className="hidden sm:inline">60s Price War</span>
        </button>
        <button
          onClick={() => setActiveTab('camera')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-colors ${activeTab === 'camera' ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <Camera className="w-5 h-5" />
          <span className="hidden sm:inline">Bill Slasher</span>
        </button>
        <button
          onClick={() => setActiveTab('spawn')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-colors ${activeTab === 'spawn' ? 'bg-purple-500/10 text-purple-400 border-b-2 border-purple-400' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <Zap className="w-5 h-5" />
          <span className="hidden sm:inline">AI App Spawner</span>
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-8">
        {activeTab === 'voice' && (
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl font-black text-white">Speak Your Price</h2>
            <p className="text-slate-400">Merchants within 5km will fight for your order in real-time.</p>
            <button className="w-24 h-24 bg-blue-500 hover:bg-blue-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all">
              <Mic className="w-10 h-10 text-white" />
            </button>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <span className="px-4 py-2 bg-slate-800 rounded-full text-sm text-slate-300 cursor-pointer hover:bg-slate-700">"1.5T Split AC"</span>
              <span className="px-4 py-2 bg-slate-800 rounded-full text-sm text-slate-300 cursor-pointer hover:bg-slate-700">"Full Body MRI"</span>
              <span className="px-4 py-2 bg-slate-800 rounded-full text-sm text-slate-300 cursor-pointer hover:bg-slate-700">"10g 24K Gold"</span>
            </div>
            <button className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:opacity-90">
               <ShieldCheck className="w-5 h-5" />
               Join National Swarm Pool (Extra 15% Off)
            </button>
          </div>
        )}

        {activeTab === 'camera' && (
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl font-black text-white">AI Bill & Loan Slasher</h2>
            <p className="text-slate-400">Scan any estimate or bill. We'll find a 25-40% cheaper local alternative in 60s.</p>
            <div className="w-full max-w-md h-48 border-2 border-dashed border-slate-600 rounded-2xl flex flex-col items-center justify-center bg-slate-800/50 cursor-pointer hover:border-emerald-500 hover:bg-slate-800 transition-all">
              <Camera className="w-12 h-12 text-slate-400 mb-2" />
              <span className="text-emerald-400 font-bold">Tap to Scan Document</span>
              <span className="text-xs text-slate-500 mt-1">Hospital • Auto Repair • Showroom • Loans</span>
            </div>
          </div>
        )}

        {activeTab === 'spawn' && (
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl font-black text-white">4-Second Business App</h2>
            <p className="text-slate-400">Speak your idea. Get a live UPI-ready app instantly.</p>
            <div className="w-full max-w-md relative">
              <input
                type="text"
                placeholder="e.g. 'Token queue & UPI app for my clinic'"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-4 pr-12 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 rounded-lg hover:bg-purple-500">
                <Zap className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-xs text-slate-500">Only 1.5% UPI fee + ₹99/mo Autopay</p>
          </div>
        )}
      </div>
    </div>
  );
}