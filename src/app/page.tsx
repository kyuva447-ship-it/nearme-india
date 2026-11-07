'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2, Search, MapPin, Mic, ShoppingBag, Zap,
  Store, User, ShoppingCart, ChevronDown, Flame, ShieldCheck,
  ArrowRight, CheckCircle, Star, MessageSquare, Phone
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const CITIES = [
  'Tirupati', 'Nellore', 'Chittoor', 'Vijayawada', 'Visakhapatnam',
  'Hyderabad', 'Chennai', 'Bangalore', 'Kochi', 'Coimbatore', 'Madurai',
  'Mumbai', 'Pune', 'Delhi', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Indore', 'Patna', 'Bhopal', 'Chandigarh', 'Guwahati', 'Bhubaneswar'
];

const LANGUAGES = [
  'English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Odia'
];

export default function Home() {
  const [selectedCity, setSelectedCity] = useState('Tirupati');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [cartCount, setCartCount] = useState(0);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('nearme_cart_count');
    if (savedCart) {
        setCartCount(parseInt(savedCart));
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [selectedCity]);

  const fetchShops = async () => {
    setLoading(true);
    let { data, error } = await supabase
      .from('shops_v1')
      .select('*')
      .eq('city', selectedCity)
      .eq('is_active', true)
      .limit(10);

    if (error) console.error(error);
    else setShops(data || []);
    setLoading(false);
  };

  const handleAddToCart = () => {
    const newCount = cartCount + 1;
    setCartCount(newCount);
    localStorage.setItem('nearme_cart_count', newCount.toString());
  };

  const handleWhatsAppOrder = (shop: any) => {
    const message = `Hi ${shop.name},\nI want to place an order via NearMe India.`;
    window.open(`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_PHONE}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  }

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
              const data = await res.json();

              let detectedCity = data.address.city || data.address.town || data.address.village;
              if (detectedCity) {
                  // Standardize formatting or mapping if necessary, for now we match exactly or default
                  const matchingCity = CITIES.find(c => c.toLowerCase() === detectedCity.toLowerCase());
                  if (matchingCity) {
                      setSelectedCity(matchingCity);
                      showToast(`Location Found: ${matchingCity}`);
                  } else {
                      // If it's a new city not in the top array, we can still set it to fetch data
                      setSelectedCity(detectedCity);
                      showToast(`Location Found: ${detectedCity}`);
                  }
              } else {
                  showToast("Location detected, but city name not found. Please select manually.");
              }
          } catch (e) {
              console.error("Reverse geocoding failed", e);
              showToast("Failed to detect city. Please select manually.");
          }
        },
        (error) => {
          console.error("Error getting location", error);
          showToast("Location denied - Please select city manually");
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      showToast("Browser does not support location - Please select city manually");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-20 md:pb-0 relative">

      {/* TOAST */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full font-bold text-sm z-[100] shadow-xl animate-bounce">
            {toastMessage}
        </div>
      )}

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

          <div className="flex items-center gap-2 md:gap-4">

            {/* Language Selector */}
            <div className="relative group hidden lg:flex items-center cursor-pointer bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-300">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 cursor-pointer appearance-none pr-4"
              >
                {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            {/* City Selector */}
            <div className="relative group flex items-center cursor-pointer bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-300">
              <MapPin className="w-4 h-4 text-orange-500 mr-1" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 cursor-pointer appearance-none pr-4 max-w-[100px] sm:max-w-none truncate"
              >
                {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                {!CITIES.includes(selectedCity) && <option value={selectedCity}>{selectedCity}</option>}
                <option value="other">Add Your City</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            <button onClick={requestLocation} className="hidden md:flex bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-full items-center gap-1 transition-colors">
                <MapPin className="w-3 h-3" /> Use My Location
            </button>

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
             నమస్తే / Namaste / Namaskar {selectedCity}
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-slate-900 leading-tight">
            Shops Near You in <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">{selectedCity}</span>
          </h1>

          <p className="text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto">
            100% Local. Escrow Protected. Delivery in {selectedCity}.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={`/search?city=${selectedCity}`} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 px-6 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex flex-col items-center justify-center gap-2 transform hover:-translate-y-1">
               <Search className="w-8 h-8" />
               <span className="text-lg">Find Cheapest Near Me</span>
            </Link>

            <button onClick={() => window.open(`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_PHONE}?text=I%20want%20to%20start%20a%20bargain%20battle`, '_blank')} className="bg-orange-500 hover:bg-orange-600 text-white font-black py-5 px-6 rounded-2xl transition-all shadow-xl shadow-orange-500/20 flex flex-col items-center justify-center gap-2 transform hover:-translate-y-1">
               <Zap className="w-8 h-8" />
               <span className="text-lg">Bargain / Auction</span>
            </button>

            <Link href={`/add-shop?city=${selectedCity}`} className="bg-slate-900 hover:bg-slate-800 text-white font-black py-5 px-6 rounded-2xl transition-all shadow-xl shadow-slate-900/20 flex flex-col items-center justify-center gap-2 transform hover:-translate-y-1">
               <Store className="w-8 h-8" />
               <span className="text-lg">Add My Shop Free</span>
            </Link>
          </div>
        </section>

        {/* TRUST SECTION */}
        <section className="bg-slate-50 rounded-3xl p-8 text-center border border-slate-200 mb-16">
           <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
           <h3 className="text-2xl font-black mb-2 text-slate-800">Made in India | For Every City, Every Colony, Every Shop</h3>
           <p className="text-slate-600 font-medium max-w-xl mx-auto">
              Your money is safe with NearMe India. We release payment to the shop ONLY after you receive your delivery safely. Zero risk shopping.
           </p>
        </section>

        {/* 5. SHOPS SECTION - DYNAMIC BY CITY */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
             <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2">
               Top Shops In <span className="text-emerald-600">{selectedCity}</span>
             </h2>
          </div>

          {loading ? (
             <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Loading shops in {selectedCity}...</div>
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
                        <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">{shop.name}</h3>
                        <p className="text-sm text-slate-500 font-medium capitalize mb-2">{shop.category} • {shop.city}</p>

                        <div className="flex items-center gap-2 mb-4">
                           <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                             <Star className="w-3 h-3 fill-orange-700" /> Trust Score: {shop.trust_score || 85}
                           </span>
                        </div>

                        {shop.current_deal_text && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">
                            <p className="font-bold text-emerald-700 flex items-center gap-1"><Flame className="w-4 h-4"/> Flash Deal!</p>
                            <p className="text-slate-700 font-medium mt-1">{shop.current_deal_text}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 mt-auto">
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={handleAddToCart} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-1">
                            Buy Now
                          </button>
                          <button onClick={handleAddToCart} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-colors border border-slate-200">
                            Add To Cart
                          </button>
                        </div>
                        <button onClick={() => handleWhatsAppOrder(shop)} className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                          <MessageSquare className="w-4 h-4" /> WhatsApp Order
                        </button>
                        <button className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-3 rounded-xl text-sm transition-colors border border-orange-200 flex items-center justify-center gap-2">
                          <ShoppingBag className="w-4 h-4" /> Pay After Delivery
                        </button>
                      </div>
                   </div>
                ))}
             </div>
          ) : (
             <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">No Shops Yet In {selectedCity}</h3>
                <p className="text-slate-500 mb-6">Be First Shop - Add Your Shop Free</p>
                <Link href="/add-shop" className="inline-flex bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-colors">
                  Add Shop Now
                </Link>
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
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_PHONE}`} className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#1DA851] transition-colors">
                 <MessageSquare className="w-4 h-4" /> Support WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="text-center text-slate-400 text-xs font-bold border-t border-slate-200 pt-8">
           © {new Date().getFullYear()} NearMe India. Made in India | For Every City, Every Colony, Every Shop
        </div>
      </footer>

      {/* 6. BOTTOM NAV - WHITE (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
         <Link href="/search" className="text-emerald-600 flex flex-col items-center gap-1"><Search className="w-6 h-6"/><span className="text-[10px] font-bold">Discover</span></Link>
         <button onClick={() => window.open(`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_PHONE}?text=I%20want%20to%20start%20a%20bargain%20battle`, '_blank')} className="text-slate-400 hover:text-slate-600 flex flex-col items-center gap-1"><Zap className="w-6 h-6"/><span className="text-[10px] font-bold">Bargain AI</span></button>
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
