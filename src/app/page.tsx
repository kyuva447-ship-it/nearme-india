'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2, Search, MapPin, Mic, ShoppingBag, Zap,
  Store, User, ShoppingCart, ChevronDown, Flame, ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const CITIES = [
  'Tirupati', 'Nellore', 'Chittoor', 'Vijayawada', 'Vizag',
  'Guntur', 'Warangal', 'Kochi', 'Coimbatore', 'Madurai',
  'Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Hyderabad',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

export default function Home() {
  const [selectedCity, setSelectedCity] = useState('Tirupati');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const savedCart = localStorage.getItem('nearme_cart_count');
    if (savedCart) {
        setCartCount(parseInt(savedCart));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-20 md:pb-0">

      {/* TOP BAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-orange-500 flex items-center justify-center text-white font-black text-xl">
              N
            </div>
            <span className="font-black text-xl hidden sm:block">
              <span className="text-emerald-600">NearMe</span>
              <span className="text-orange-500">India</span>
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative group hidden sm:flex items-center cursor-pointer bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-300">
              <MapPin className="w-4 h-4 text-orange-500 mr-1" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 cursor-pointer appearance-none pr-4"
              >
                {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                <option value="All">Serving All India</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            <Link href="/cart" className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ShoppingCart className="w-6 h-6 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-orange-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 md:py-24">
        {/* HERO SECTION */}
        <section className="text-center mb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center gap-2 bg-orange-50 text-orange-600 px-6 py-2 rounded-full font-black text-sm mb-6 border border-orange-200">
             <MapPin className="w-4 h-4" />
             నమస్తే {selectedCity} / Namaste {selectedCity}
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-slate-900 leading-tight">
            Shops Fight For You <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">You Pick Cheapest</span>
          </h1>

          <p className="text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto">
            100% Local. Escrow Protected. Money Safe Till Delivery.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/search" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 px-6 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex flex-col items-center justify-center gap-2 transform hover:-translate-y-1">
               <Search className="w-8 h-8" />
               <span className="text-lg">Find Cheapest Near Me</span>
            </Link>

            <Link href="/bargain" className="bg-orange-500 hover:bg-orange-600 text-white font-black py-5 px-6 rounded-2xl transition-all shadow-xl shadow-orange-500/20 flex flex-col items-center justify-center gap-2 transform hover:-translate-y-1">
               <Zap className="w-8 h-8" />
               <span className="text-lg">Bargain / Auction</span>
            </Link>

            <Link href="/add-shop" className="bg-slate-900 hover:bg-slate-800 text-white font-black py-5 px-6 rounded-2xl transition-all shadow-xl shadow-slate-900/20 flex flex-col items-center justify-center gap-2 transform hover:-translate-y-1">
               <Store className="w-8 h-8" />
               <span className="text-lg">Add My Shop Free</span>
            </Link>
          </div>
        </section>

        {/* TRUST SECTION */}
        <section className="bg-slate-50 rounded-3xl p-8 text-center border border-slate-200">
           <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
           <h3 className="text-2xl font-black mb-2 text-slate-800">100% Escrow Protected</h3>
           <p className="text-slate-600 font-medium max-w-xl mx-auto">
              Your money is safe with NearMe India. We release payment to the shop ONLY after you receive your delivery safely. Zero risk shopping.
           </p>
        </section>

      </main>

      {/* BOTTOM NAV - WHITE (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
         <Link href="/search" className="text-emerald-600 flex flex-col items-center gap-1"><Search className="w-6 h-6"/><span className="text-[10px] font-bold">Discover</span></Link>
         <Link href="/bargain" className="text-slate-400 hover:text-slate-600 flex flex-col items-center gap-1"><Zap className="w-6 h-6"/><span className="text-[10px] font-bold">Bargain AI</span></Link>
         <Link href="/cart" className="text-slate-400 hover:text-slate-600 flex flex-col items-center gap-1 relative">
            <ShoppingCart className="w-6 h-6"/>
            {cartCount > 0 && <span className="absolute -top-1 -right-2 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">{cartCount}</span>}
            <span className="text-[10px] font-bold">Cart</span>
         </Link>
         <Link href="/login" className="text-slate-400 hover:text-slate-600 flex flex-col items-center gap-1"><User className="w-6 h-6"/><span className="text-[10px] font-bold">Account</span></Link>
      </div>

    </div>
  );
}
