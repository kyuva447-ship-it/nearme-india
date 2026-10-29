'use client';
import { useState } from 'react';

export default function TestPage() {
  const [activeTab, setActiveTab] = useState('b2c');

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">10,000Cr Feature Testing Ground</h1>

      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveTab('b2c')} className={`px-6 py-2 rounded-full font-bold ${activeTab === 'b2c' ? 'bg-emerald-500' : 'bg-slate-800'}`}>B2C (Consumer)</button>
        <button onClick={() => setActiveTab('b2b')} className={`px-6 py-2 rounded-full font-bold ${activeTab === 'b2b' ? 'bg-indigo-500' : 'bg-slate-800'}`}>B2B (Merchant)</button>
        <button onClick={() => setActiveTab('admin')} className={`px-6 py-2 rounded-full font-bold ${activeTab === 'admin' ? 'bg-red-500' : 'bg-slate-800'}`}>God Mode Admin</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Core Tests */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="font-bold text-xl mb-4 text-emerald-400">1. ₹3 Handoff Test</h3>
            <p className="text-sm text-slate-400 mb-4">Click to simulate the exact ₹3 deduction via Supabase RPC.</p>
            <button className="w-full py-3 bg-emerald-500/20 text-emerald-400 font-bold rounded-xl border border-emerald-500/50 hover:bg-emerald-500/40 transition-colors">Simulate WhatsApp Click</button>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="font-bold text-xl mb-4 text-amber-400">2. Free OTP Flow</h3>
            <p className="text-sm text-slate-400 mb-4">Simulate generating a free server-side OTP without MSG91 costs.</p>
            <button className="w-full py-3 bg-amber-500/20 text-amber-400 font-bold rounded-xl border border-amber-500/50 hover:bg-amber-500/40 transition-colors">Generate Free OTP</button>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="font-bold text-xl mb-4 text-purple-400">3. Meta Voice Search (BOLO)</h3>
            <p className="text-sm text-slate-400 mb-4">Test multi-lingual translation and intent routing.</p>
            <button className="w-full py-3 bg-purple-500/20 text-purple-400 font-bold rounded-xl border border-purple-500/50 hover:bg-purple-500/40 transition-colors">Speak / మాట్లాడండి</button>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="font-bold text-xl mb-4 text-pink-400">4. Razorpay Webhook</h3>
            <p className="text-sm text-slate-400 mb-4">Simulate incoming payment.captured to test v2_razorpay_events idempotency.</p>
            <button className="w-full py-3 bg-pink-500/20 text-pink-400 font-bold rounded-xl border border-pink-500/50 hover:bg-pink-500/40 transition-colors">Fire Mock Webhook</button>
        </div>
      </div>
    </div>
  );
}
