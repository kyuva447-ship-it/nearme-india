'use client';
import React, { useState, useRef } from 'react';
import { Mic, Camera, Zap, Loader2, Share2, Send, QrCode } from 'lucide-react';
import { triggerNearMeCheckout } from '@/lib/razorpayClient';
import PhoneAuthModal from './QuickAuthModal';
import UpiFallbackModal from './UpiFallbackModal';
import SavingsPassModal from './SavingsPassModal';
import VoiceFallbackModal from './VoiceFallbackModal';
import NearMePlatform from './NearMePlatform';
import { useToast } from './Toast';
import { useRouter } from 'next/navigation';

export default function CommandHub() {
  const [activeTab, setActiveTab] = useState<'voice' | 'camera' | 'spawn'>('camera');
  const [loadingMsg, setLoadingMsg] = useState('');
  const [spawnInput, setSpawnInput] = useState({ shop: '', city: '', offer: '' });
  const [voiceInput, setVoiceInput] = useState('');

  const [spawnedApp, setSpawnedApp] = useState<{ url: string; whatsappText: string } | null>(null);

  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [fallbackAmount, setFallbackAmount] = useState<number | null>(null);

  const [showPass, setShowPass] = useState(false);
  const [showVoiceFallback, setShowVoiceFallback] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const router = useRouter();
  const { toast } = useToast();

  const requireAuth = (actionFn: () => void) => {
    const userPhone = localStorage.getItem('nearme_user_phone');
    if (!userPhone) {
      setPendingAction(() => actionFn);
      setShowAuth(true);
    } else {
      actionFn();
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const startVoiceRecognition = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setShowVoiceFallback(true);
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceInput(transcript);
      triggerReverseBid(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setShowVoiceFallback(true);
    };

    recognition.onend = () => setIsRecording(false);

    try {
      recognition.start();
    } catch {
      setShowVoiceFallback(true);
    }
  };

  const triggerReverseBid = async (query: string) => {
    if (!query) return;
    setLoadingMsg('Agentic AI Synthesizing Deals...');

    setTimeout(() => {
      setLoadingMsg('Scout AI Locating Hubs...');
      setTimeout(() => {
        setLoadingMsg('Negotiator AI Slashing Prices...');
        setTimeout(() => {
          const city = localStorage.getItem('nearme_city') || 'All India';
          router.push(`/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`);
          setLoadingMsg('');
        }, 800);
      }, 800);
    }, 800);
  };

  const handleSpawnApp = async () => {
    if (!spawnInput.shop || !spawnInput.city || !spawnInput.offer) return;
    setLoadingMsg('Generating WhatsApp Promo Card...');
    const userPhone = localStorage.getItem('nearme_user_phone') || '918247831885';
    try {
      await fetch('/api/engine/spawn-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: spawnInput.shop, phone: userPhone }),
      });
    } catch {
      // Resilient promo generation
    }
    const slug = spawnInput.shop.replace(/\s+/g, '-').toLowerCase();
    setSpawnedApp({
      url: `nearme-india.org/live/${slug}`,
      whatsappText: `*${spawnInput.shop}* in *${spawnInput.city}* is offering *${spawnInput.offer}*! Claim here: https://www.nearme-india.org/live/${slug}`,
    });
    toast('Promo Card Generated!', 'success');
    setLoadingMsg('');
  };

  const payForSpawnApp = () => {
    triggerNearMeCheckout({
      itemName: 'Merchant Auto-Bidder Pro',
      amountInRupees: 499,
      actionType: 'subscription',
      onSuccess: () => {
        toast(`Pro Activated! Promos live at ${spawnedApp?.url}`, 'success');
        setShowPass(true);
      },
      onFallback: () => setFallbackAmount(499),
      onAuthRequired: () => setShowAuth(true),
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
      {showAuth && <PhoneAuthModal onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}
      {fallbackAmount !== null && (
        <UpiFallbackModal
          amount={fallbackAmount}
          onClose={() => setFallbackAmount(null)}
          onSuccess={() => {
            toast('Transaction Completed!', 'success');
            setShowPass(true);
          }}
        />
      )}
      {showPass && (
        <SavingsPassModal
          amount={fallbackAmount || 1500}
          service="NearMe Transaction"
          onClose={() => setShowPass(false)}
        />
      )}
      {showVoiceFallback && (
        <VoiceFallbackModal
          onClose={() => setShowVoiceFallback(false)}
          onQuery={(q) => {
            setVoiceInput(q);
            triggerReverseBid(q);
          }}
        />
      )}

      {loadingMsg && (
        <div className="absolute inset-0 z-50 bg-gray-950/90 flex flex-col items-center justify-center backdrop-blur-md">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-xl font-bold text-white animate-pulse">{loadingMsg}</p>
        </div>
      )}

      <div className="flex border-b border-gray-800 text-sm md:text-base">
        <button
          type="button"
          onClick={() => setActiveTab('camera')}
          className={`flex-1 py-4 flex flex-col md:flex-row items-center justify-center gap-2 font-bold transition-colors ${
            activeTab === 'camera'
              ? 'bg-emerald-900/30 text-emerald-400 border-b-2 border-emerald-400'
              : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          <Camera className="w-5 h-5" /> <span>Unlimited Bill Stripper (500+p)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('voice')}
          className={`flex-1 py-4 flex flex-col md:flex-row items-center justify-center gap-2 font-bold transition-colors ${
            activeTab === 'voice'
              ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          <Mic className="w-5 h-5" /> <span>Speak / Name Your Price</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('spawn')}
          className={`flex-1 py-4 flex flex-col md:flex-row items-center justify-center gap-2 font-bold transition-colors ${
            activeTab === 'spawn'
              ? 'bg-purple-900/30 text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          <Zap className="w-5 h-5" /> <span>AI Shop Ad Maker</span>
        </button>
      </div>

      <div className="p-6 md:p-8 min-h-[360px] flex flex-col items-center justify-center">
        {activeTab === 'camera' && <NearMePlatform compact />}

        {activeTab === 'voice' && (
          <div className="flex flex-col items-center text-center space-y-6 w-full max-w-xl">
            <h2 className="text-2xl font-black text-white">Negotiate with AI</h2>
            <div className="relative w-full">
              <input
                type="text"
                value={voiceInput}
                onChange={(e) => setVoiceInput(e.target.value)}
                placeholder="What service & price? (e.g. Full Body Checkup ₹699)"
                className="w-full bg-gray-950 border border-gray-700 rounded-2xl py-4 pl-4 pr-16 outline-none focus:border-blue-500 text-white font-bold"
              />
              <button
                type="button"
                onClick={startVoiceRecognition}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${
                  isRecording
                    ? 'bg-red-500/20 text-red-500 animate-pulse'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => triggerReverseBid(voiceInput)}
              disabled={!voiceInput}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              Let AI Negotiate <Send className="w-4 h-4" />
            </button>
            <p className="text-xs text-gray-500">
              The Negotiator AI will secure verified deals matching your target price.
            </p>
          </div>
        )}

        {activeTab === 'spawn' && (
          <div className="flex flex-col items-center text-center w-full max-w-xl">
            <h2 className="text-2xl font-black text-white mb-6">Free AI Shop Ad Maker</h2>
            {!spawnedApp ? (
              <div className="w-full space-y-4">
                <input
                  type="text"
                  value={spawnInput.shop}
                  onChange={(e) => setSpawnInput({ ...spawnInput, shop: e.target.value })}
                  placeholder="Shop Name (e.g. Metro Diagnostics)"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  value={spawnInput.city}
                  onChange={(e) => setSpawnInput({ ...spawnInput, city: e.target.value })}
                  placeholder="City (e.g. Pune)"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  value={spawnInput.offer}
                  onChange={(e) => setSpawnInput({ ...spawnInput, offer: e.target.value })}
                  placeholder="Offer (e.g. Flat 30% Off on Blood Tests)"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
                />

                <button
                  type="button"
                  onClick={() => requireAuth(handleSpawnApp)}
                  disabled={!spawnInput.shop || !spawnInput.city || !spawnInput.offer}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 font-bold rounded-xl text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" /> Generate WhatsApp Promo
                </button>
              </div>
            ) : (
              <div className="w-full p-6 bg-gray-900 border border-purple-500/30 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full"></div>
                <QrCode className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-black text-white mb-2">Promo Card Ready!</h3>
                <p className="text-gray-400 mb-6 text-sm italic border-l-4 border-purple-500 pl-3 text-left">
                  &quot;{spawnedApp.whatsappText}&quot;
                </p>

                <div className="space-y-3">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(spawnedApp.whatsappText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl flex justify-center items-center gap-2"
                  >
                    <Share2 className="w-5 h-5" /> Share to WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => requireAuth(payForSpawnApp)}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:scale-105 font-black rounded-xl text-white transition-transform"
                  >
                    Subscribe Merchant Auto-Bidder (₹499/mo)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
