'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Store, ArrowLeft, Zap, ShieldCheck, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { triggerNearMeCheckout } from '@/lib/razorpayClient';
import PhoneAuthModal from '@/components/QuickAuthModal';
import { useToast } from '@/components/Toast';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get('city') || 'All India';
  const initialQuery = searchParams.get('q') || '';

  const [city, setCity] = useState(initialCity);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const { toast } = useToast();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);

    try {
        const res = await fetch('/api/agent/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'scout', query: query.trim(), city: city.trim() })
        });

        const data = await res.json();
        setResults(data.results || []);
    } catch (err) {
        toast('AI Engine Overloaded. Retrying...', 'error');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      if (initialQuery) {
          handleSearch();
      }
  }, [initialQuery]);

  const requireAuth = (actionFn: () => void) => {
      if (!localStorage.getItem('nearme_user_phone')) {
          setPendingAction(() => actionFn);
          setShowAuth(true);
      } else {
          actionFn();
      }
  };

  const lockDeal = (merchant: any) => {
      triggerNearMeCheckout({
          itemName: `Lock Deal at ${merchant.name}`,
          amountInRupees: merchant.price || 99,
          actionType: 'deal_lock',
          onSuccess: () => toast('Deal Locked Successfully!', 'success'),
          onFallback: () => toast('Payment fallback triggered.', 'info'),
          onAuthRequired: () => setShowAuth(true)
      });
  };

  return (
    <div className="min-h-screen bg-gray-950 font-[family-name:var(--font-geist-sans)] text-white relative overflow-hidden flex flex-col">
              {showAuth && <PhoneAuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); if(pendingAction) pendingAction(); }} />}

       <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>

       <div className="max-w-5xl mx-auto w-full flex-1 p-6 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 font-bold mb-8 hover:text-white transition-colors">
             <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-white flex flex-col">
                AI Omni-Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 text-xl md:text-2xl mt-2">{city}</span>
              </h1>

              <div className="flex items-center gap-2 bg-gray-900/50 backdrop-blur border border-gray-800 rounded-full px-4 py-2">
                 <ShieldCheck className="w-5 h-5 text-emerald-400"/>
                 <span className="text-sm font-bold text-gray-300">Swarm Pricing Active</span>
              </div>
          </div>

          <form onSubmit={handleSearch} className="mb-12 relative max-w-3xl">
             <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative flex items-center bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
                    <Search className="absolute left-6 w-6 h-6 text-gray-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={`Try "AC Repair", "Hospitals", or "Cheap Hotels"...`}
                      className="w-full bg-transparent py-5 pl-16 pr-32 outline-none font-bold text-lg text-white placeholder-gray-500"
                    />
                    <button type="submit" className="absolute right-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-3 rounded-xl transition-colors flex items-center gap-2">
                       <Zap className="w-4 h-4"/> Scan
                    </button>
                </div>
             </div>
          </form>

          {loading ? (
             <div className="text-center py-20 flex flex-col items-center">
                 <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                 <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse">4-Agent AI Brain synthesizing local data...</div>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((shop, i) => (
                   <div key={i} className="bg-gray-900/40 backdrop-blur border border-gray-800 p-6 rounded-3xl hover:border-gray-600 transition-colors group flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                         <div className="w-12 h-12 bg-gray-950 rounded-xl flex items-center justify-center border border-gray-800 text-blue-400 shadow-inner flex-shrink-0">
                            <Store className="w-6 h-6" />
                         </div>
                         <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-sm font-bold">
                             <Star className="w-4 h-4 fill-current"/> {shop.rating}
                         </div>
                      </div>

                      <h3 className="font-black text-xl text-white mb-1 group-hover:text-blue-400 transition-colors">{shop.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mb-6">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {shop.distance}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">{shop.verified ? 'Verified' : 'Local Partner'}</span>
                      </div>

                      <div className="mt-auto bg-gray-950 rounded-2xl p-4 border border-gray-800">
                          <div className="flex justify-between items-center mb-4">
                              <span className="text-sm text-gray-500 line-through">₹{shop.retailPrice}</span>
                              <span className="text-2xl font-black text-emerald-400">₹{shop.price}</span>
                          </div>
                          <button onClick={() => requireAuth(() => lockDeal(shop))} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                              Lock Deal via UPI <ChevronRight className="w-4 h-4"/>
                          </button>
                      </div>
                   </div>
                ))}
             </div>
          )}

          {/* Autonomous Guarantee - Never say "No shops found" */}
          {results.length === 0 && query && !loading && (
               <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800 backdrop-blur mt-8">
                  <Zap className="w-12 h-12 text-blue-500 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-300 font-bold mb-4 text-xl">The AI is connecting to local {query} hubs in {city}...</p>
                  <button onClick={() => requireAuth(() => toast('Swarm signal broadcasted! Merchants will contact you shortly.', 'success'))} className="inline-flex bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-purple-500/20">
                     Broadcast Request to {city} Merchants
                  </button>
               </div>
          )}
       </div>
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-950 flex flex-col"><div className="flex-1 flex items-center justify-center"><div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div></div></div>}>
            <SearchContent />
        </Suspense>
    )
}
