'use client';
import React, { useState } from 'react';
import { Mic, Camera, Zap, ShieldCheck, Loader2 } from 'lucide-react';

export default function CommandHub() {
  const [activeTab, setActiveTab] = useState<'voice' | 'camera' | 'spawn'>('voice');
  const [loadingMsg, setLoadingMsg] = useState('');
  const [spawnInput, setSpawnInput] = useState('');

  const handleMicClick = () => {
    setLoadingMsg('Calculating local bids...');
    setTimeout(() => {
      alert('Simulated voice query submitted to Reverse Bid AI.');
      setLoadingMsg('');
    }, 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingMsg('Compressing & Scanning document...');

    // Client-side Image Compression (Canvas API)
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }

      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // Compress to 70% quality JPEG
      URL.revokeObjectURL(objectUrl); // Clean up

      try {
        const res = await fetch('/api/engine/bill-slasher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_data: compressedBase64, pincode: '560001' })
        });
        const data = await res.json();
        alert(`Bill Scanned! Fair Price: ₹${data.ai_audited_fair_price_inr}. Saved: ₹${data.user_savings_inr}`);
      } catch (err) {
        alert('Failed to process document');
      } finally {
        setLoadingMsg('');
      }
    };

    img.src = objectUrl;
  };

  const handleSpawnApp = async () => {
    if (!spawnInput) return;
    setLoadingMsg('Spawning mini-app...');
    try {
      const res = await fetch('/api/engine/spawn-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: spawnInput, phone: '9999900000' })
      });
      const data = await res.json();
      alert(`App Generated! URL: ${data.url}`);
    } catch (err) {
      alert('Failed to spawn app');
    } finally {
      setLoadingMsg('');
      setSpawnInput('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">

      {loadingMsg && (
        <div className="absolute inset-0 z-50 bg-gray-950/80 flex flex-col items-center justify-center backdrop-blur-sm">
           <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
           <p className="text-xl font-bold text-white animate-pulse">{loadingMsg}</p>
        </div>
      )}

      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('voice')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-colors ${activeTab === 'voice' ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:bg-gray-800'}`}
        >
          <Mic className="w-5 h-5" />
          <span className="hidden sm:inline">60s Price War</span>
        </button>
        <button
          onClick={() => setActiveTab('camera')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-colors ${activeTab === 'camera' ? 'bg-emerald-900/30 text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:bg-gray-800'}`}
        >
          <Camera className="w-5 h-5" />
          <span className="hidden sm:inline">Bill Slasher</span>
        </button>
        <button
          onClick={() => setActiveTab('spawn')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-colors ${activeTab === 'spawn' ? 'bg-purple-900/30 text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:bg-gray-800'}`}
        >
          <Zap className="w-5 h-5" />
          <span className="hidden sm:inline">AI App Spawner</span>
        </button>
      </div>

      <div className="p-8">
        {activeTab === 'voice' && (
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl font-black text-white">Speak Your Price</h2>
            <p className="text-gray-400">Merchants within 5km will fight for your order in real-time.</p>
            <button onClick={handleMicClick} className="w-24 h-24 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all">
              <Mic className="w-10 h-10 text-white" />
            </button>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <span className="px-4 py-2 bg-gray-800 rounded-full text-sm text-gray-300 cursor-pointer hover:bg-gray-700">"1.5T Split AC"</span>
              <span className="px-4 py-2 bg-gray-800 rounded-full text-sm text-gray-300 cursor-pointer hover:bg-gray-700">"Full Body MRI"</span>
              <span className="px-4 py-2 bg-gray-800 rounded-full text-sm text-gray-300 cursor-pointer hover:bg-gray-700">"10g 24K Gold"</span>
            </div>
            <button className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 hover:opacity-90">
               <ShieldCheck className="w-5 h-5" />
               Join National Swarm Pool (Extra 15% Off)
            </button>
          </div>
        )}

        {activeTab === 'camera' && (
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl font-black text-white">AI Bill & Loan Slasher</h2>
            <p className="text-gray-400">Scan any estimate or bill. We'll find a 25-40% cheaper local alternative in 60s.</p>

            <label className="w-full max-w-md h-48 border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center bg-gray-800/50 cursor-pointer hover:border-emerald-500 hover:bg-gray-800 transition-all">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <Camera className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-emerald-400 font-bold">Tap to Scan Document</span>
              <span className="text-xs text-gray-500 mt-1">Hospital • Auto Repair • Showroom • Loans</span>
            </label>
          </div>
        )}

        {activeTab === 'spawn' && (
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl font-black text-white">4-Second Business App</h2>
            <p className="text-gray-400">Speak your idea. Get a live UPI-ready app instantly.</p>
            <div className="w-full max-w-md relative flex">
              <input
                type="text"
                value={spawnInput}
                onChange={(e) => setSpawnInput(e.target.value)}
                placeholder="e.g. 'Token queue & UPI app for my clinic'"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-l-xl py-4 pl-4 pr-4 text-white outline-none focus:border-purple-500"
              />
              <button onClick={handleSpawnApp} className="px-6 bg-purple-600 rounded-r-xl hover:bg-purple-500 font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-white" />
                Build
              </button>
            </div>
            <p className="text-xs text-gray-500">Only 1.5% UPI fee + ₹99/mo Autopay</p>
          </div>
        )}
      </div>
    </div>
  );
}
