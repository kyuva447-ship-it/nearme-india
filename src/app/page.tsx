'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2, Search, MapPin, Mic, ShoppingBag, MessageSquare, Zap,
  Store, User, ShoppingCart, CheckCircle, Flame, Star,
  ChevronDown, Phone, ShieldCheck, Share2, Copy
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';

const CITIES = [
  'Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Hyderabad',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Tirupati', 'Nellore', 'Chittoor', 'Vijayawada', 'Vizag',
  'Guntur', 'Warangal', 'Kochi', 'Coimbatore', 'Madurai',
  'Indore', 'Bhopal', 'Patna', 'Surat'
];

const CATEGORIES = [
  { name: 'Kirana', icon: <ShoppingBag className="w-6 h-6" /> },
  { name: 'Food', icon: <Flame className="w-6 h-6" /> },
  { name: 'Medical', icon: <ShieldCheck className="w-6 h-6" /> },
  { name: 'Mobile', icon: <Phone className="w-6 h-6" /> },
  { name: 'Fashion', icon: <Star className="w-6 h-6" /> },
  { name: 'Services', icon: <Zap className="w-6 h-6" /> },
  { name: 'B2B', icon: <Building2 className="w-6 h-6" /> },
  { name: 'All Categories', icon: <Store className="w-6 h-6" /> },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load cart from local storage
    const savedCart = localStorage.getItem('nearme_cart_count');
    if (savedCart) {
        setCartCount(parseInt(savedCart));
    }
    // Load initial shops
    handleSearchClick();
  }, []);

  const handleSearchClick = async () => {
    setLoading(true);
    let query = supabase.from('shops_v1').select('*').eq('is_active', true).limit(20);

    if (selectedCity && selectedCity !== 'All') {
       query = query.eq('city', selectedCity);
    }
    if (searchQuery) {
       query = query.or(`business_name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,pincode.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) {
       console.error("Search error: ", error);
    }
    setShops(data || []);
    setLoading(false);
  };

  const handleAddToCart = () => {
    const newCount = cartCount + 1;
    setCartCount(newCount);
    localStorage.setItem('nearme_cart_count', newCount.toString());
  };

  const handleWhatsAppOrder = (shop: any) => {
    const message = encodeURIComponent(`Hi ${shop.business_name}, I want to place an order via NearMe India.`);
    window.open(`https://wa.me/91${shop.phone}?text=${message}`, '_blank');
  };

  const openAdminWhatsApp = (plan: string) => {
    const message = encodeURIComponent(`Hi NearMe India, I want to activate the ${plan} plan.`);
    window.open(`https://wa.me/918247831885?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-20 md:pb-0">

      {/* 1. TOP BAR - WHITE */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-orange-500 flex items-center justify-center text-white font-black text-xl">
              N
            </div>
            <span className="font-black text-xl hidden sm:block">
              <span className="text-emerald-600">NearMe</span>
              <span className="text-orange-500">India</span>
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
            <Search className="w-5 h-5 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search Shops, Food, Services In India..."
              className="bg-transparent border-none outline-none w-full text-sm placeholder-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative group hidden sm:flex items-center cursor-pointer bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-300">
              <MapPin className="w-4 h-4 text-orange-500 mr-1" />
              <input
                 type="text"
                 placeholder="Any City / Pincode"
                 value={selectedCity}
                 onChange={(e) => setSelectedCity(e.target.value)}
                 className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-32"
              />
            </div>

            <button onClick={() => console.log("Cart Drawer Opening Soon. Items: " + cartCount)} className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ShoppingCart className="w-6 h-6 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-orange-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            <Link href="/login" className="hidden md:flex items-center gap-1 font-bold text-slate-700 hover:text-emerald-600 transition-colors">
              <User className="w-5 h-5" /> Login
            </Link>

            <button onClick={() => openAdminWhatsApp("Add Shop")} className="hidden md:flex bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full font-bold text-sm transition-colors items-center gap-1 shadow-md shadow-emerald-200">
              <Store className="w-4 h-4" /> Add Shop
            </button>
          </div>
        </div>
      </header>

      {/* 3. MONEY STRIP - GREEN */}
      <div className="bg-emerald-600 text-white overflow-hidden whitespace-nowrap py-2 border-b border-emerald-700 shadow-sm relative z-40">
        <div className="animate-marquee inline-block text-sm font-medium">
          <span className="mx-4">🌟 Premium Rs999 / Rs1999 / Rs4999 <button onClick={() => openAdminWhatsApp("Premium")} className="underline font-bold hover:text-orange-300 ml-1">[View Plans]</button></span>
          <span className="mx-4">✅ Verification Rs499 <button onClick={() => openAdminWhatsApp("Verification")} className="underline font-bold hover:text-orange-300 ml-1">[Buy Now]</button></span>
          <span className="mx-4">📢 Ads Rs99/day <button onClick={() => openAdminWhatsApp("Ads")} className="underline font-bold hover:text-orange-300 ml-1">[Promote Shop]</button></span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 2. HERO SECTION */}
        <section className="text-center py-10 md:py-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-slate-900">
            NearMe India - <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-orange-500">Everything Near You</span>, All India
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium mb-10 max-w-2xl mx-auto">
            Serving All India - Every City, Town, Village & Pincode
          </p>

          <div className="max-w-3xl mx-auto mb-8 relative">
             <div className="flex flex-col md:flex-row items-stretch gap-2 bg-white p-2 rounded-2xl md:rounded-full border-2 border-slate-200 shadow-lg focus-within:border-emerald-500 focus-within:shadow-xl transition-all">
                <select className="bg-slate-50 px-4 py-3 md:py-0 md:rounded-l-full rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none">
                  <option>English Voice</option>
                  <option>Telugu Voice</option>
                  <option>Hindi Voice</option>
                  <option>Tamil Voice</option>
                  <option>Kannada Voice</option>
                </select>
                <div className="flex-1 flex items-center bg-slate-50 rounded-xl md:rounded-none px-4 py-3 md:py-0">
                   <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()} placeholder="Type city, pincode, or shop name..." className="w-full bg-transparent border-none outline-none text-slate-800" />
                   <button className="text-emerald-600 hover:text-emerald-700 p-2"><Mic className="w-6 h-6 animate-pulse" /></button>
                </div>
                <button onClick={handleSearchClick} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 md:py-0 rounded-xl md:rounded-r-full transition-colors flex items-center justify-center gap-2">
                   <Search className="w-5 h-5"/> Find
                </button>
             </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {CITIES.slice(0, 7).map(city => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  handleSearchClick();
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${selectedCity === city ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-600 hover:text-emerald-600'}`}
              >
                {city}
              </button>
            ))}
            <button onClick={() => { setSelectedCity('All'); handleSearchClick(); }} className="px-4 py-1.5 rounded-full text-sm font-bold bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200">
              + Search Anywhere In India
            </button>
          </div>
        </section>

        {/* 4. CATEGORIES */}
        <section className="mb-16">
           <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {CATEGORIES.map((cat, i) => (
                <div key={i} onClick={() => { setSearchQuery(cat.name); handleSearchClick(); }} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group text-center">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                     {cat.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{cat.name}</span>
                </div>
              ))}
           </div>
        </section>

        {/* 5. SHOPS SECTION - DYNAMIC */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
             <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2">
               Search Results {searchQuery ? `for "${searchQuery}"` : (selectedCity && selectedCity !== 'All' ? `in ${selectedCity}` : 'Near You')}
             </h2>
          </div>

          {loading ? (
             <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Loading shops...</div>
          ) : shops.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.map((shop, i) => (
                   <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all group flex flex-col justify-between h-full relative overflow-hidden">
                      {shop.is_verified && (
                        <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> VERIFIED
                        </div>
                      )}

                      <div className="mb-6 mt-2">
                        <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">{shop.business_name}</h3>
                        <p className="text-sm text-slate-500 font-medium capitalize mb-2">{shop.category} • {shop.city}</p>

                        <div className="flex items-center gap-2 mb-4">
                           <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                             <Star className="w-3 h-3 fill-orange-700" /> Trust Score: {shop.trust_score || 85}
                           </span>
                        </div>
                      </div>

                      <div className="space-y-2 mt-auto">
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleWhatsAppOrder(shop)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-1">
                            Buy Now
                          </button>
                          <button onClick={handleAddToCart} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-colors border border-slate-200">
                            Add To Cart
                          </button>
                        </div>
                        <button onClick={() => handleWhatsAppOrder(shop)} className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                          <MessageSquare className="w-4 h-4" /> WhatsApp Order
                        </button>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button onClick={() => { const url = `https://wa.me/?text=Check out ${shop.business_name} in ${shop.city} on NearMe India! https://www.nearme-india.org`; window.open(url, "_blank"); }} className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1">
                            <Share2 className="w-4 h-4" /> Share
                          </button>
                          <button onClick={() => { navigator.clipboard.writeText(`https://www.nearme-india.org`); console.log("Link Copied!"); }} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1">
                            <Copy className="w-4 h-4" /> Copy Link
                          </button>
                        </div>
                      </div>
                   </div>
                ))}
             </div>
          ) : (
             <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">No shop yet in your area</h3>
                <p className="text-slate-500 mb-6">Be first to list - List Free</p>
                <button onClick={() => openAdminWhatsApp("Add Shop")} className="inline-flex bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-colors gap-2">
                  <MessageSquare className="w-5 h-5" /> WhatsApp Us To List
                </button>
             </div>
          )}
        </section>
      </main>

      {/* 7. FOOTER - WHITE */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-black text-slate-900 mb-4">NearMe India</h4>
            <ul className="space-y-2 text-sm text-slate-600 font-medium">
              <li><Link href="/about" className="hover:text-emerald-600">About Us</Link></li>
              <li><Link href="/pricing" className="hover:text-emerald-600">Premium Plans</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-600">Contact & Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-600 font-medium">
              <li><Link href="/terms" className="hover:text-emerald-600">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-emerald-600">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-emerald-600">Refund Policy</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-emerald-600">Shipping Policy</Link></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-2">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-black text-slate-900 mb-2 flex items-center gap-2"><Phone className="w-5 h-5 text-emerald-600" /> Support</h4>
              <p className="text-sm text-slate-600 mb-4">Need help? We're available 9 AM - 6 PM IST.</p>
              <a href="https://wa.me/918247831885" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#1DA851] transition-colors">
                 <MessageSquare className="w-4 h-4" /> Support WhatsApp
              </a>
            </div>
          </div>

          <div className="col-span-2 md:col-span-4 mt-8">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center">
              <h4 className="font-black text-emerald-900 mb-2">Love NearMe India? Tell Your Friends!</h4>
              <p className="text-sm text-emerald-700 mb-4">Share our platform and help local shops grow.</p>
              <button onClick={() => window.open(`https://wa.me/?text=I found this amazing app for local shops in India! Check out NearMe India: https://www.nearme-india.org`, "_blank")} className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#1DA851] transition-colors shadow-lg shadow-[#25D366]/30">
                 <Share2 className="w-4 h-4" /> Share via WhatsApp
              </button>
            </div>
          </div>
        </div>
        <div className="text-center text-slate-400 text-xs font-bold border-t border-slate-200 pt-8">
           © {new Date().getFullYear()} NearMe India. Built for 10000 Cr Scale.
        </div>
      </footer>

      {/* 6. BOTTOM NAV - WHITE (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
         <button onClick={() => window.scrollTo(0,0)} className="text-emerald-600 flex flex-col items-center gap-1"><Search className="w-6 h-6"/><span className="text-[10px] font-bold">Discover</span></button>
         <Link href="/escrow" className="text-slate-400 hover:text-slate-600 flex flex-col items-center gap-1"><Zap className="w-6 h-6"/><span className="text-[10px] font-bold">Bargain AI</span></Link>
         <button onClick={() => console.log("Cart Drawer Opening Soon. Items: " + cartCount)} className="text-slate-400 hover:text-slate-600 flex flex-col items-center gap-1 relative">
            <ShoppingCart className="w-6 h-6"/>
            {cartCount > 0 && <span className="absolute -top-1 -right-2 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">{cartCount}</span>}
            <span className="text-[10px] font-bold">Cart</span>
         </button>
         <Link href="/login" className="text-slate-400 hover:text-slate-600 flex flex-col items-center gap-1"><User className="w-6 h-6"/><span className="text-[10px] font-bold">Account</span></Link>
      </div>

    </div>
  );
}
