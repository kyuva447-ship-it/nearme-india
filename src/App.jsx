import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

import { Share2, MapPin, Store, Search, Compass, Phone, MessageCircle, CheckCircle2, Flame, Sparkles, Clock, ThumbsUp } from 'lucide-react';
import MerchantDashboard from "./components/MerchantDashboard";
import LiveMap from './components/LiveMap';
import AIOmnibar from './components/AIOmnibar';
import AIBrokerPipeline from './components/AIBrokerPipeline';

/*
  SUPABASE SCHEMA UPDATES:
  ALTER TABLE sellers ADD COLUMN current_deal_text VARCHAR(255);
  ALTER TABLE sellers ADD COLUMN deal_expiry_time TIMESTAMP WITH TIME ZONE;
  ALTER TABLE sellers ADD COLUMN is_currently_available BOOLEAN DEFAULT false;
  ALTER TABLE sellers ADD COLUMN community_upvotes INTEGER DEFAULT 0;
*/

// Haversine Distance Formula (GPS Latitude/Longitude to Kilometers)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.5; // Fallback default distance
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// Initial Default Sellers Mock Data
const INITIAL_SELLERS = [
  {
    id: 's1',
    shopName: 'Gupta Tea & Fast Food',
    category: 'Tea & Snacks',
    maskedPhone: '98765*****',
    realPhone: '9876543210',
    lat: 12.9121,
    lng: 77.6445,
    community_upvotes: 42,
    is_currently_available: true,
    current_deal_text: '20% OFF today only',
    deal_expiry_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    planType: 'MEDIUM_PAY_PER_LEAD',
    walletBalance: 15.00,
    planExpiryDate: '2026-12-31',
    isBlocked: false,
    isVerified: true,
    totalLeadsReceived: 95,
    city: 'Bengaluru',
    image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80',
  },
  {
    id: 's2',
    shopName: 'Karnataka Express Plumbing',
    category: 'Plumber',
    maskedPhone: '98123*****',
    realPhone: '9812345678',
    lat: 12.9150,
    lng: 77.6410,
    community_upvotes: 55,
    is_currently_available: false,
    current_deal_text: '',
    deal_expiry_time: null,
    planType: 'SMALL_299',
    walletBalance: 0.00,
    planExpiryDate: '2026-10-15', // Active
    isBlocked: false,
    isVerified: true,
    totalLeadsReceived: 142,
    city: 'Bengaluru',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80',
  },
  {
    id: 's3',
    shopName: 'Shree Sai Electrical Services',
    category: 'Electrician',
    maskedPhone: '99001*****',
    realPhone: '9900112233',
    lat: 12.9200,
    lng: 77.6300,
    community_upvotes: 12,
    is_currently_available: true,
    current_deal_text: '',
    deal_expiry_time: null,
    planType: 'MEDIUM_PAY_PER_LEAD',
    walletBalance: 0.00,
    planExpiryDate: '2026-08-01', // Expired
    isBlocked: true,
    isVerified: false,
    totalLeadsReceived: 20,
    city: 'Bengaluru',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80',
  }
];

export default function NearMeApp() {

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // Check existing session on load
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user.email === import.meta.env.VITE_OWNER_EMAIL) {
        setIsAdminAuthenticated(true);
      }
    };
    checkSession();
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoginError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      if (error) throw error;

      if (data.user && data.user.email === import.meta.env.VITE_OWNER_EMAIL) {
        setIsAdminAuthenticated(true);
        setActiveTab('admin');
      } else {
        await supabase.auth.signOut();
        setAdminLoginError('Unauthorized: Not an owner account.');
      }
    } catch (error) {
      setAdminLoginError(error.message || 'Login failed.');
    }
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminAuthenticated(false);
    setActiveTab('home');
  };

  const [activeTab, setActiveTab] = useState('home');
  const [isInstagramLead, setIsInstagramLead] = useState(false);
  const [publicProfileId, setPublicProfileId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('source') === 'instagram' || params.get('ref') === 'instagram') {
      setIsInstagramLead(true);
      setActiveTab('onboarding');
    }

    // Check if URL is a direct shop link (e.g. ?shop=s1)
    const shopParam = params.get('shop');
    if (shopParam) {
      setPublicProfileId(shopParam);
    }
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [radiusFilter, setRadiusFilter] = useState(25); // Max radius filter in km
  const [isListening, setIsListening] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({ shopName: '', category: 'Tailoring & Garments', city: 'Bengaluru', phone: '', lat: null, lng: null, current_deal_text: '', is_currently_available: false });
  
  // Active Logged-in Seller context
  const [loggedInSellerId, setLoggedInSellerId] = useState('s1');
  const [manualAmount, setManualAmount] = useState('');
  
  // User Geolocation State
  const [userCoords, setUserCoords] = useState({ lat: 12.9116, lng: 77.6412 }); // Default HSR Layout, Bengaluru
  const [locationStatus, setLocationStatus] = useState('Default GPS');

  // SSR-SAFE LOCALSTORAGE HYDRATION ENGINE (Prevents Vercel Crash)
  const [sellers, setSellers] = useState(INITIAL_SELLERS);
  const [isClient, setIsClient] = useState(false);

  // 1. Hydrate state safely on client mount
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nearme_sellers_v2');
      if (saved) {
        try {
          setSellers(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved sellers state', e);
        }
      }
    }
  }, []);

  // 2. Persist sellers state changes only on client
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem('nearme_sellers_v2', JSON.stringify(sellers));
    }
  }, [sellers, isClient]);

  // Request Browser Live Geolocation
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus('GPS Auto-Detected');
        },
        (err) => {
          console.warn('Geolocation access denied, using default city center.');
          setLocationStatus('Default Location (Bengaluru)');
        }
      );
    }
  }, []);

  // Script Loader for Razorpay Checkout JS
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Voice Search via Browser Web Speech API
  const handleVoiceSearch = (lang = 'hi-IN') => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice Search is not supported on this browser. Try Chrome or Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      setSearchQuery(e.results[0][0].transcript);
    };
    recognition.start();
  };

  // Safe ₹3 Lead Deduction Engine with Timeout Deferral
  const handleLeadTrigger = (sellerId, actionType, userDistance = null) => {
    const LEAD_COST = 3.00;
    const todayStr = new Date().toISOString().split('T')[0];

    const targetSeller = sellers.find(s => s.id === sellerId);
    if (!targetSeller) return;

    // Expiry Check
    if (targetSeller.planExpiryDate && targetSeller.planExpiryDate < todayStr) {
      alert(`This seller's subscription expired on ${targetSeller.planExpiryDate}. Listing is temporarily inactive.`);
      return;
    }

    // SMALL Plan Check
    if (targetSeller.planType === 'SMALL_299') {
      performDeductionAndRedirect(targetSeller, 0, actionType, userDistance);
      return;
    }

    // Balance Verification
    if (targetSeller.walletBalance < LEAD_COST) {
      alert('Seller wallet balance is zero or insufficient. Auto-blocking listing until top-up.');
      setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, isBlocked: true } : s));
      return;
    }

    // Execute atomic state reduction first
    performDeductionAndRedirect(targetSeller, LEAD_COST, actionType, userDistance);
  };

  const performDeductionAndRedirect = (targetSeller, cost, actionType, userDistance) => {
    setSellers(prevSellers => prevSellers.map(seller => {
      if (seller.id !== targetSeller.id) return seller;
      const newBalance = seller.walletBalance - cost;
      return {
        ...seller,
        walletBalance: newBalance < 0 ? 0 : newBalance,
        totalLeadsReceived: seller.totalLeadsReceived + 1,
        isBlocked: newBalance <= 0 && seller.planType !== 'SMALL_299'
      };
    }));

    // Safe 150ms delay to commit React/localStorage updates before browser protocol takes focus
    setTimeout(() => {
      if (actionType === 'CALL') {
        window.location.href = `tel:${targetSeller.realPhone}`;
      } else if (actionType === 'WHATSAPP') {
        let message = `Hi ${targetSeller.shopName}, I found you on NearMe India.`;
        if (targetSeller.current_deal_text && targetSeller.deal_expiry_time && new Date(targetSeller.deal_expiry_time) > new Date()) {
          message += ` Are you still offering the "${targetSeller.current_deal_text}"?`;
        }
        if (userDistance !== null) {
          message += ` I am located ${userDistance}km away.`;
        }

        window.open(`https://wa.me/91${targetSeller.realPhone}?text=${encodeURIComponent(message)}`, '_blank');
      }
    }, 150);
  };

  const handleShare = async (seller) => {
    const shareData = {
      title: seller.shopName,
      text: `Check out ${seller.shopName} on NearMe India! Located in ${seller.city}. They are a top-rated ${seller.category} provider.`,
      url: `https://nearme-india.org/?shop=${seller.id}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      alert("Link copied to clipboard! You can now paste it in WhatsApp or Facebook.");
    }
  };

  // Live Razorpay Payment Gateway Trigger
  const handleRazorpayPayment = async (amountInRupees) => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert('Failed to connect to Razorpay Gateway. Please check internet connection.');
      return;
    }

    const currentSeller = sellers.find(s => s.id === loggedInSellerId);


    const options = {
      key: import.meta.env.VITE_RAZORPAY_TEST_KEY_ID || "rzp_test_mockkey", // Replace with live Razorpay Key
      amount: amountInRupees * 100, // Amount in paise
      currency: "INR",
      name: "NearMe India",
      description: "Wallet Recharge",
      handler: async function (response) {
        alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);

        try {
          // In a real application we would use Supabase RPC `top_up_wallet` here.
          // For now, update local state since Supabase backend isn't connected to a real instance.
          setSellers(prev => prev.map(s => s.id === loggedInSellerId ? {...s, walletBalance: (s.walletBalance || 0) + amountInRupees} : s));
          setShowRechargeModal(false);
        } catch (err) {
          console.error("Error updating wallet balance:", err);
          alert("Payment received but failed to update wallet balance. Please contact support.");
        }
      },
      prefill: {
        name: currentSeller?.shopName || "Merchant",
        contact: currentSeller?.realPhone || ""
      },
      theme: {
        color: "#10b981"
      }
    };
const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  // Balance Credit Processor
  const handleManualWalletCredit = (sellerId, amount) => {
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt === 0) return;

    setSellers(prev => prev.map(s => {
      if (s.id !== sellerId) return s;
      const updatedBalance = s.walletBalance + numAmt;
      return {
        ...s,
        walletBalance: updatedBalance < 0 ? 0 : updatedBalance,
        isBlocked: updatedBalance <= 0 && s.planType !== 'SMALL_299'
      };
    }));
    setManualAmount('');
  };

  // Upvote Processor
  const handleUpvote = (sellerId) => {
    setSellers(prev => prev.map(s => {
      if (s.id !== sellerId) return s;
      return { ...s, community_upvotes: (s.community_upvotes || 0) + 1 };
    }));
  };

  const categories = ['All', 'Retail', 'Manufacturer', 'Broker', 'Service', 'Freelancer', 'Tea & Snacks', 'Plumber', 'Electrician'];

  // Distance & Filtered Sellers Computation
  const processedSellers = sellers.map(s => {
    const dist = calculateHaversineDistance(userCoords.lat, userCoords.lng, s.lat, s.lng);
    return { ...s, computedDistance: dist };
  });

  const filteredSellers = processedSellers.filter(seller => {
    const matchesCategory = selectedCategory === 'All' || seller.category === selectedCategory;
    const matchesSearch = seller.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          seller.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRadius = seller.computedDistance <= radiusFilter;
    return matchesCategory && matchesSearch && matchesRadius;
  }).sort((a, b) => {
    if (a.is_currently_available === b.is_currently_available) return 0;
    if (a.is_currently_available) return -1;
    return 1;
  });

  // Admin Financial Metrics
  const activeSellerCount = sellers.filter(s => !s.isBlocked).length;
  const totalWalletHoldings = sellers.reduce((acc, s) => acc + s.walletBalance, 0);
  const totalLeadsDelivered = sellers.reduce((acc, s) => acc + s.totalLeadsReceived, 0);

  // Compute Public Profile if ?shop= is active
  const activePublicProfile = publicProfileId ? sellers.find(s => s.id === publicProfileId) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans">
      
      {/* 1. HEADER */}
      <header className="backdrop-blur-md bg-white/90 border-b border-gray-100 sticky top-0 z-40 transition-all duration-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div onClick={() => { setPublicProfileId(null); setActiveTab('home'); }} className="cursor-pointer flex items-center gap-2 group">
            <MapPin className="w-8 h-8 text-emerald-600 drop-shadow-sm group-hover:scale-105 transition-transform" />
            <span className="text-2xl font-black tracking-tight text-slate-900">NearMe <span className="text-emerald-600 font-bold">India</span></span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowDashboard(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
            >
              Merchant Panel
            </button>
            <button
              onClick={() => setActiveTab('onboarding')}
              className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
            >
              <Store className="w-4 h-4" />
              List Your Shop
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === 'admin' ? 'home' : 'admin')}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 border ${
                activeTab === 'admin' 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Owner Panel
            </button>
          </div>
        </div>
      </header>

      {/* 2. EMERGENCY SOS BANNER */}
      <div className="bg-red-600 text-white py-2 px-4 shadow-inner">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center text-xs font-bold gap-2">
          <span>🚨 Emergency Services (24x7 Direct SOS)</span>
          <div className="flex gap-2">
            <a href="tel:108" className="bg-white text-red-600 px-2 py-1 rounded hover:bg-slate-100">🚑 Ambulance (108)</a>
            <button onClick={() => { setSelectedCategory('Blood SOS'); setActiveTab('home'); }} className="bg-red-800 text-white px-2 py-1 rounded hover:bg-red-900">🩸 Blood Bank</button>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC CONTENT AREA */}
      <main className="max-w-6xl mx-auto w-full px-4 py-6 flex-grow">
        
        {/* PUBLIC PROFILE VIEW (QR SCANS) */}
        {activePublicProfile && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 overflow-hidden relative">
              {/* Cover Banner */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

              <div className="relative pt-12 text-center">
                <img src={activePublicProfile.image} alt="Shop" className="w-32 h-32 mx-auto rounded-full border-4 border-white shadow-lg object-cover mb-4 bg-white" />
                <h1 className="text-3xl font-black text-slate-900 mb-1">{activePublicProfile.shopName}</h1>
                <p className="text-slate-500 font-semibold">{activePublicProfile.category} • {activePublicProfile.city}</p>

                <div className="flex justify-center gap-2 mt-4">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3 text-indigo-500" /> {activePublicProfile.community_upvotes} Local Recommendations
                  </span>
                  {activePublicProfile.is_currently_available && (
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Available Right Now
                    </span>
                  )}
                </div>
              </div>

              {/* Flash Deal Alert */}
              {activePublicProfile.current_deal_text && activePublicProfile.deal_expiry_time && new Date(activePublicProfile.deal_expiry_time) > new Date() && (
                <div className="mt-8 bg-gradient-to-r from-orange-500 to-red-500 p-1 rounded-xl shadow-md">
                  <div className="bg-white/95 backdrop-blur rounded-lg p-4 text-center">
                    <div className="flex justify-center mb-1">
                      <Flame className="text-orange-500 w-6 h-6 animate-pulse" />
                    </div>
                    <p className="font-black text-slate-800 text-lg uppercase tracking-tight">{activePublicProfile.current_deal_text}</p>
                    <p className="text-xs text-slate-500 mt-1 font-semibold flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" /> Valid until {new Date(activePublicProfile.deal_expiry_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  onClick={() => handleLeadTrigger(activePublicProfile.id, 'WHATSAPP')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-200"
                >
                  <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
                </button>
                <button
                  onClick={() => handleShare(activePublicProfile)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <Share2 className="w-5 h-5" /> Share Shop
                </button>
              </div>
            </div>

            {/* Cross-Sell Strip */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => { setPublicProfileId(null); setActiveTab('home'); }}>
              <p className="text-sm font-bold text-indigo-900 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Explore 100+ other Local Deals & Services in your area on NearMe India!
              </p>
              <button className="mt-3 bg-white text-indigo-600 text-xs font-bold px-4 py-2 rounded-lg shadow-sm">View Neighborhood Map</button>
            </div>
          </div>
        )}

        {/* HOMEPAGE VIEW */}
        {/* Live Map Integration */}
        {!activePublicProfile && activeTab === 'home' && (
          <div className="mb-6 z-0">
            <LiveMap sellers={filteredSellers} userLocation={{latitude: 12.9116, longitude: 77.6412}} />
          </div>
        )}

        {!activePublicProfile && activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Search, GPS Status & Distance Radius Filter */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500 px-1">
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  📍 {locationStatus} ({userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)})
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Radius:</span>
                  {[2, 5, 10, 25].map(km => (
                    <button
                      key={km}
                      onClick={() => setRadiusFilter(km)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        radiusFilter === km ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {km}km
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Omnibar Integration */}
              <AIOmnibar onSearch={(q) => setSearchQuery(q)} />

              {/* AI Broker Pipeline (Post a Requirement) */}
              <AIBrokerPipeline userCoords={userCoords} />

              {/* Category Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${
                      selectedCategory === cat 
                        ? 'bg-blue-600 text-white font-bold' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Seller Listings */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                Shops within {radiusFilter}km ({filteredSellers.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSellers.map(seller => (
                  <div key={seller.id} id={`shop-${seller.id}`} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="h-36 bg-slate-200 relative">
                        <img src={seller.image} alt={seller.shopName} className="w-full h-full object-cover" />

                        {/* Flash Deal Banner */}
                        {seller.current_deal_text && seller.deal_expiry_time && new Date(seller.deal_expiry_time) > new Date() && (
                          <div className="absolute top-0 left-0 w-full bg-red-600/90 text-white text-xs font-bold py-1 px-2 text-center animate-pulse backdrop-blur-sm z-20">
                            🔥 LIVE DEAL: {seller.current_deal_text}
                            <span className="block text-[10px] font-normal">
                              Valid until {new Date(seller.deal_expiry_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        )}

                        {/* Glowing Availability Dot */}
                        {seller.is_currently_available && (
                          <span className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md shadow border border-green-300 flex items-center gap-1 z-10">
                            <span className="w-2 h-2 bg-green-200 rounded-full animate-pulse"></span>
                            🟢 Available Right Now
                          </span>
                        )}
                        <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                          📍 {seller.computedDistance} km away
                        </span>
                        {seller.isVerified && (
                          <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            ✓ Blue Tick KYC
                          </span>
                        )}
                        {seller.community_upvotes > 50 && (
                          <span className="absolute bottom-2 left-2 bg-yellow-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-md shadow border border-yellow-300">
                            👑 Neighborhood Legend
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-2 flex-grow">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-900 text-base leading-snug">{seller.shopName}</h3>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleShare(seller)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold p-1.5 rounded transition-colors flex items-center shadow-sm shrink-0" title="Share Shop">
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleUpvote(seller.id)} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-1.5 rounded transition-colors flex items-center gap-1 shadow-sm shrink-0">
                              👍 ({seller.community_upvotes || 0})
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{seller.business_type || 'Service'}</span> • {seller.category} • {seller.city}
                        </p>
                        
                        <p className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded w-max mt-2">
                          📞 {seller.maskedPhone}
                        </p>

                        {seller.isBlocked && (
                          <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-[11px] text-amber-800 font-medium mt-2">
                            ⚠️ Listing Paused (Recharge Pending)
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex flex-col gap-2">
                       {/* Universal Profile Action Buttons based on Business Type */}
                       {seller.business_type === 'Manufacturer' && (
                         <button
                           disabled={seller.isBlocked}
                           onClick={() => handleLeadTrigger(seller.id, 'WHATSAPP', seller.computedDistance)}
                           className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                             seller.isBlocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                           }`}
                         >
                           <MessageCircle className="w-4 h-4" /> Request Bulk Quote
                         </button>
                       )}

                       {seller.business_type === 'Broker' && (
                         <button
                           disabled={seller.isBlocked}
                           onClick={() => handleLeadTrigger(seller.id, 'CALL')}
                           className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                             seller.isBlocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                           }`}
                         >
                           <Phone className="w-4 h-4" /> Book Consultation
                         </button>
                       )}

                       {(!seller.business_type || !['Manufacturer', 'Broker'].includes(seller.business_type)) && (
                         <div className="grid grid-cols-2 gap-2">
                            <button
                              disabled={seller.isBlocked}
                              onClick={() => handleLeadTrigger(seller.id, 'CALL')}
                              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors ${
                                seller.isBlocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              <Phone className="w-4 h-4" /> Call Now
                            </button>

                            <button
                              disabled={seller.isBlocked}
                              onClick={() => handleLeadTrigger(seller.id, 'WHATSAPP', seller.computedDistance)}
                              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors ${
                                seller.isBlocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                            >
                              <MessageCircle className="w-4 h-4" /> WhatsApp
                            </button>
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>



        )}

        {activeTab === 'admin' && !isAdminAuthenticated && (
          <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-slate-900">Admin Login</h1>
              <p className="text-xs text-slate-500 mt-1">Authorized personnel only.</p>
            </div>

            {adminLoginError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                {adminLoginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Owner Email</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-md"
              >
                Secure Login
              </button>
            </form>
          </div>
        )}

        {/* SECURE OWNER / ADMIN DASHBOARD PANEL */}
        {activeTab === 'admin' && isAdminAuthenticated && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">👑 Platform Owner Dashboard</h1>
                <p className="text-xs text-slate-500">Manage sellers, manual top-ups, revenue, and active listings.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">
                  Admin Mode Active
                </span>
                <button
                  onClick={handleAdminLogout}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Logout
                </button>
              </div>
            </div>


            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 block">TOTAL WALLET HOLDINGS</span>
                <span className="text-2xl font-black text-blue-600">₹{totalWalletHoldings.toFixed(2)}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 block">TOTAL LEADS DELIVERED</span>
                <span className="text-2xl font-black text-purple-600">{totalLeadsDelivered}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 block">ACTIVE LISTINGS</span>
                <span className="text-2xl font-black text-emerald-600">{activeSellerCount} / {sellers.length}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 block">SUBSCRIPTION EXPIRIES</span>
                <span className="text-2xl font-black text-amber-600">
                  {sellers.filter(s => s.planExpiryDate < new Date().toISOString().split('T')[0]).length}
                </span>
              </div>
            </div>

            {/* Manual Cash Adjustment */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-base">💵 Manual Cash Top-Up / Balance Adjuster</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <select 
                  value={loggedInSellerId} 
                  onChange={(e) => setLoggedInSellerId(e.target.value)}
                  className="p-2.5 border rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {sellers.map(s => (
                    <option key={s.id} value={s.id}>{s.shopName} (Bal: ₹{s.walletBalance})</option>
                  ))}
                </select>

                <input 
                  type="number"
                  placeholder="Amount (e.g. 100 or -50)"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  className="p-2.5 border rounded-xl text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />

                <button 
                  onClick={() => handleManualWalletCredit(loggedInSellerId, manualAmount)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Update Balance
                </button>
              </div>
            </div>
            {/* Flash Deal Engine */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-base">🔥 Hyper-Local Flash Deal</h3>
              <p className="text-xs text-slate-500">Set a temporary deal to attract nearby customers.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="e.g. 20% OFF today only"
                  value={sellers.find(s => s.id === loggedInSellerId)?.current_deal_text || ''}
                  onChange={(e) => setSellers(prev => prev.map(s => s.id === loggedInSellerId ? { ...s, current_deal_text: e.target.value } : s))}
                  className="p-2.5 border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  onClick={() => setSellers(prev => prev.map(s => s.id === loggedInSellerId ? { ...s, deal_expiry_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() } : s))}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
                >
                  Set for 2 Hours
                </button>
                <button
                  onClick={() => setSellers(prev => prev.map(s => s.id === loggedInSellerId ? { ...s, current_deal_text: '', deal_expiry_time: null } : s))}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
                >
                  Clear Deal
                </button>
              </div>
            </div>


            {/* Live Ping Availability Toggle */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-base">🟢 "Live Ping" Availability</h3>
              <p className="text-xs text-slate-500">Toggle this to show customers you are ready to dispatch immediately.</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSellers(prev => prev.map(s => s.id === loggedInSellerId ? { ...s, is_currently_available: !s.is_currently_available } : s))}
                  className={`font-bold px-4 py-2.5 rounded-xl text-sm transition-colors border ${
                    sellers.find(s => s.id === loggedInSellerId)?.is_currently_available ? 'bg-green-600 text-white border-green-700' : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  {sellers.find(s => s.id === loggedInSellerId)?.is_currently_available ? '🟢 Currently Available' : '🔴 Not Available'}
                </button>
              </div>
            </div>

            {/* Seller Control Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-900 font-bold border-b">
                  <tr>
                    <th className="p-3">Shop Details</th>
                    <th className="p-3">Plan & Expiry</th>
                    <th className="p-3">Wallet</th>
                    <th className="p-3">Leads</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sellers.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold">{s.shopName} <br/><span className="text-[10px] text-slate-400">{s.realPhone} • {s.city}</span></td>
                      <td className="p-3">
                        <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded">{s.planType}</span>
                        <br/><span className="text-[10px] text-slate-500">Exp: {s.planExpiryDate}</span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">₹{s.walletBalance.toFixed(2)}</td>
                      <td className="p-3 font-bold text-purple-600">{s.totalLeadsReceived}</td>
                      <td className="p-3 flex gap-1">
                        <button 
                          onClick={() => setSellers(prev => prev.map(item => item.id === s.id ? { ...item, isVerified: !item.isVerified } : item))}
                          className={`px-2 py-1 rounded font-bold text-[10px] ${s.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'}`}
                        >
                          {s.isVerified ? 'KYC ✓' : 'Verify'}
                        </button>
                        <button 
                          onClick={() => setSellers(prev => prev.map(item => item.id === s.id ? { ...item, isBlocked: !item.isBlocked } : item))}
                          className={`px-2 py-1 rounded font-bold text-[10px] ${s.isBlocked ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}
                        >
                          {s.isBlocked ? 'Blocked' : 'Active'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* LEGAL & COMPLIANCE PAGES */}
        {['privacy', 'terms', 'refund', 'about', 'contact', 'disclaimer'].includes(activeTab) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 space-y-6">
            
            {activeTab === 'privacy' && (
              <article className="space-y-4 text-slate-700 text-sm leading-relaxed">
                <h1 className="text-3xl font-black text-slate-900 border-b pb-3">Privacy Policy</h1>
                <p className="text-xs text-slate-400">Last Updated: September 12, 2026</p>
                
                <h3 className="font-bold text-slate-900 text-base">1. Information Collection</h3>
                <p>NearMe India ("nearme-india.org") collects operational data including merchant business names, mobile numbers, shop photos, and location coordinates via GPS or manual pin selection. For consumers, we access device location strictly to calculate proximity distances to nearby service providers.</p>
                
                <h3 className="font-bold text-slate-900 text-base">2. Usage of Collected Data</h3>
                <p>Personal and business details are utilized exclusively to route buyer calls and WhatsApp messages to relevant merchants. We do not rent, trade, or monetize user contact records to third-party marketing networks.</p>

                <h3 className="font-bold text-slate-900 text-base">3. Payment Security & Third Parties</h3>
                <p>All financial payment processing for wallet top-ups and subscriptions is executed through PCI-DSS compliant payment gateways (Razorpay). NearMe India does not store credit card numbers, CVVs, or UPI PINs on its infrastructure.</p>
              </article>
            )}

            {activeTab === 'terms' && (
              <article className="space-y-4 text-slate-700 text-sm leading-relaxed">
                <h1 className="text-3xl font-black text-slate-900 border-b pb-3">Terms & Conditions</h1>
                <p className="text-xs text-slate-400">Last Updated: September 12, 2026</p>

                <h3 className="font-bold text-slate-900 text-base">1. Service Listing Rules</h3>
                <p>Merchants are solely responsible for ensuring the accuracy of services listed. NearMe India acts strictly as an automated marketplace bridge and assumes no liability for service outcomes, pricing disputes, or work quality provided by listed shops.</p>

                <h3 className="font-bold text-slate-900 text-base">2. Wallet Deductions & Automated Block Logic</h3>
                <p>Pay-per-lead listings incur a non-negotiable charge of ₹3.00 per customer action (Call button click or WhatsApp link trigger). If a seller's wallet balance reaches ₹0.00, shop visibility is automatically paused across search listings until a balance recharge is completed.</p>
              </article>
            )}

            {activeTab === 'refund' && (
              <article className="space-y-4 text-slate-700 text-sm leading-relaxed">
                <h1 className="text-3xl font-black text-slate-900 border-b pb-3">Refund & Cancellation Policy</h1>
                <p className="text-xs text-slate-400">Last Updated: September 12, 2026</p>

                <h3 className="font-bold text-slate-900 text-base">1. Wallet Top-Up Non-Refundability</h3>
                <p>Prepaid wallet recharges (₹100 to ₹5000) are immediately converted into lead allocation credits and are non-refundable once credited to a merchant account.</p>

                <h3 className="font-bold text-slate-900 text-base">2. Subscription Refunds</h3>
                <p>Subscription fees (₹299/month) are eligible for a full refund within 7 calendar days of purchase ONLY if zero (0) buyer lead interactions were routed to the subscriber's account during that window. Refund inquiries must be sent to contact@nearme-india.org.</p>
              </article>
            )}

            {activeTab === 'about' && (
              <article className="space-y-4 text-slate-700 text-sm leading-relaxed">
                <h1 className="text-3xl font-black text-slate-900 border-b pb-3">About NearMe India</h1>
                <p>NearMe India (nearme-india.org) is a hyper-local business discovery directory established in 2026 in Bengaluru, Karnataka. Our technology bridges micro-merchants, local tradespeople, and everyday consumers using zero-commission pay-per-lead models.</p>
              </article>
            )}

            {activeTab === 'contact' && (
              <article className="space-y-6 text-slate-700 text-sm">
                <h1 className="text-3xl font-black text-slate-900 border-b pb-3">Contact Us</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p><strong>Support Email:</strong> <a href="mailto:contact@nearme-india.org" className="text-blue-600 underline">contact@nearme-india.org</a></p>
                    <p><strong>Registered Address:</strong><br />NearMe India, #123, 2nd Floor, HSR Layout Sector 1, Bengaluru, Karnataka - 560102</p>
                    <p><strong>Working Hours:</strong> Monday – Saturday (10:00 AM – 7:00 PM IST)</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); alert('Message sent to contact@nearme-india.org'); }} className="bg-slate-50 p-4 rounded-xl border space-y-3">
                    <input required type="text" placeholder="Your Name" className="w-full p-2 border rounded-lg text-xs" />
                    <input required type="email" placeholder="Your Email" className="w-full p-2 border rounded-lg text-xs" />
                    <textarea required placeholder="Your Inquiry..." rows={3} className="w-full p-2 border rounded-lg text-xs"></textarea>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-xs">Send Message</button>
                  </form>
                </div>
              </article>
            )}

            {activeTab === 'disclaimer' && (
              <article className="space-y-4 text-slate-700 text-sm leading-relaxed">
                <h1 className="text-3xl font-black text-slate-900 border-b pb-3">Emergency SOS Disclaimer</h1>
                <p className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 font-medium">
                  NearMe India is an information directory service and does not operate medical dispatch facilities. For life-threatening health emergencies, dial 108 immediately.
                </p>
              </article>
            )}

            <button 
              onClick={() => setActiveTab('home')}
              className="mt-6 bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-800 transition-colors"
            >
              ← Back to Main Search
            </button>
          </div>
        )}

      </main>


      {/* 60-Second Merchant Onboarding Wizard Modal */}
      {activeTab === 'onboarding' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <button onClick={() => {setActiveTab('home'); setOnboardingStep(1);}} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>

            {isInstagramLead && (
              <div className="mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white p-3 rounded-xl font-bold text-sm text-center shadow-md animate-pulse">
                📸 Instagram Special: ₹15 Free Leads Included!
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-black text-slate-900 text-xl tracking-tight">List Your Shop in 60s</h3>
              <p className="text-sm text-slate-500">Get discovered by local customers instantly.</p>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-2 mb-6">
              {[1, 2, 3].map(step => (
                <div key={step} className={`h-1.5 flex-1 rounded-full ${onboardingStep >= step ? 'bg-emerald-600' : 'bg-slate-100'}`}></div>
              ))}
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (onboardingStep < 3) {
                setOnboardingStep(prev => prev + 1);
              } else {
                // Submit Wizard
                const newSeller = {
                  id: `s${Date.now()}`,
                  shopName: onboardingData.shopName,
                  category: onboardingData.category,
                  maskedPhone: onboardingData.phone.replace(/\d{5}$/, '*****'),
                  realPhone: onboardingData.phone,
                  lat: onboardingData.lat || 12.9116,
                  lng: onboardingData.lng || 77.6412,
                  community_upvotes: 0,
                  is_currently_available: onboardingData.is_currently_available,
                  current_deal_text: onboardingData.current_deal_text,
                  deal_expiry_time: onboardingData.current_deal_text ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() : null,
                  planType: 'WELCOME_BONUS',
                  walletBalance: 15.00,
                  planExpiryDate: '2027-01-01',
                  isBlocked: false,
                  isVerified: true,
                  totalLeadsReceived: 0,
                  city: onboardingData.city,
                  image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
                };
                setSellers([newSeller, ...sellers]);
                setActiveTab('home');
                setOnboardingStep(1);
                alert('Shop registered successfully! You received a ₹15.00 welcome bonus.');
              }
            }}>

              {onboardingStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Business Name</label>
                    <input required type="text" value={onboardingData.shopName} onChange={e => setOnboardingData({...onboardingData, shopName: e.target.value})} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:outline-none" placeholder="e.g. Peenya Garments" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Industry / Category (Open Text)</label>
                    <input required type="text" value={onboardingData.category} onChange={e => setOnboardingData({...onboardingData, category: e.target.value})} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:outline-none" placeholder="e.g. Factory, Broker, Plumber" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input required type="text" value={onboardingData.city} onChange={e => setOnboardingData({...onboardingData, city: e.target.value})} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:outline-none" placeholder="e.g. Bengaluru" />
                  </div>
                </div>
              )}

              {onboardingStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                    <div className="flex relative">
                      <span className="absolute left-3 top-3.5 text-slate-500 font-semibold">+91</span>
                      <input required type="tel" pattern="[0-9]{10}" maxLength="10" value={onboardingData.phone} onChange={e => setOnboardingData({...onboardingData, phone: e.target.value})} className="w-full p-3 pl-12 border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:outline-none" placeholder="10-digit number" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">We will send customer leads to this number.</p>
                  </div>
                </div>
              )}

              {onboardingStep === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <button type="button" onClick={() => {
                        alert('GPS location captured (mocked)');
                        setOnboardingData({...onboardingData, lat: 12.91, lng: 77.64});
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-3 rounded-xl transition-colors"
                    >
                      <Compass className="w-4 h-4" /> Auto-Detect My Location
                    </button>
                    {onboardingData.lat && <p className="text-xs text-emerald-600 mt-1 font-semibold text-center">✓ Location Captured</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Launch Flash Deal (Optional)</label>
                    <input type="text" value={onboardingData.current_deal_text} onChange={e => setOnboardingData({...onboardingData, current_deal_text: e.target.value})} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:outline-none" placeholder="e.g. 20% OFF today only" />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <input type="checkbox" checked={onboardingData.is_currently_available} onChange={e => setOnboardingData({...onboardingData, is_currently_available: e.target.checked})} className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-slate-700">Set as "Available Right Now"</span>
                  </label>
                </div>
              )}

              <div className="mt-8 flex gap-3">
                {onboardingStep > 1 && (
                  <button type="button" onClick={() => setOnboardingStep(prev => prev - 1)} className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                    Back
                  </button>
                )}
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-md">
                  {onboardingStep === 3 ? 'Launch My Shop' : 'Next Step'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {showDashboard && (
        <MerchantDashboard
          sellers={sellers}
          setSellers={setSellers}
          loggedInSellerId={loggedInSellerId}
          onClose={() => setShowDashboard(false)}
        />
      )}

      {/* DYNAMIC SELLER RECHARGE MODAL */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">💼 Seller Wallet Top-Up</h3>
              <button onClick={() => setShowRechargeModal(false)} className="text-slate-400 font-bold text-xl">✕</button>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Select Seller Account:</label>
              <select 
                value={loggedInSellerId}
                onChange={(e) => setLoggedInSellerId(e.target.value)}
                className="w-full p-2 border rounded-xl text-xs bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {sellers.map(s => (
                  <option key={s.id} value={s.id}>{s.shopName} (Current: ₹{s.walletBalance.toFixed(2)})</option>
                ))}
              </select>
            </div>

            <p className="text-xs text-slate-600">Choose a top-up pack to fund ₹3 lead deductions via Razorpay / UPI:</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[100, 300, 500, 1000].map(amt => (
                <button 
                  key={amt} 
                  onClick={() => handleRazorpayPayment(amt)}
                  className="p-3 border-2 border-slate-100 rounded-xl font-bold text-sm hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 transition-all duration-200 active:scale-95"
                >
                  + ₹{amt}
                </button>
              ))}
            </div>

            <div className="pt-2">
                <button
                onClick={() => {
                  const amt = prompt("Enter custom amount (₹):");
                  if (amt && !isNaN(amt) && Number(amt) > 0) {
                    handleRazorpayPayment(Number(amt));
                  }
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                Recharge Custom Amount
                </button>
            </div>
          </div>

        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 border-t border-slate-800 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="space-y-1">
            <p className="text-slate-200 font-medium text-sm">© 2026 NearMe India — Bengaluru, Karnataka</p>
            <p className="text-xs text-slate-400">Official Support: <a href="mailto:contact@nearme-india.org" className="text-blue-400 underline">contact@nearme-india.org</a></p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-xs font-medium">
            <button onClick={() => setActiveTab('privacy')} className="hover:text-white">Privacy Policy</button>
            <button onClick={() => setActiveTab('terms')} className="hover:text-white">Terms</button>
            <button onClick={() => setActiveTab('refund')} className="hover:text-white">Refund Policy</button>
            <button onClick={() => setActiveTab('about')} className="hover:text-white">About Us</button>
            <button onClick={() => setActiveTab('contact')} className="hover:text-white">Contact</button>
            <button onClick={() => setActiveTab('disclaimer')} className="hover:text-white">Disclaimer & SOS</button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold bg-slate-800 px-3 py-1.5 rounded-full text-slate-300">
            <span>Made in India 🇮🇳</span>
            <span>•</span>
            <span>Razorpay Verified</span>
            <span>•</span>
            <span className="text-emerald-400">SSL Encrypted 🔒</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
