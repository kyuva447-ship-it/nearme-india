import React, { useState, useEffect } from 'react';

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
    rating: '4.8',
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
    rating: '4.9',
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
    rating: '4.5',
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
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [radiusFilter, setRadiusFilter] = useState(25); // Max radius filter in km
  const [isListening, setIsListening] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  
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
  const handleLeadTrigger = (sellerId, actionType) => {
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
      performDeductionAndRedirect(sellerId, 0, targetSeller.realPhone, actionType);
      return;
    }

    // Balance Verification
    if (targetSeller.walletBalance < LEAD_COST) {
      alert('Seller wallet balance is zero or insufficient. Auto-blocking listing until top-up.');
      setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, isBlocked: true } : s));
      return;
    }

    // Execute atomic state reduction first
    performDeductionAndRedirect(sellerId, LEAD_COST, targetSeller.realPhone, actionType);
  };

  const performDeductionAndRedirect = (sellerId, cost, realPhone, actionType) => {
    setSellers(prevSellers => prevSellers.map(seller => {
      if (seller.id !== sellerId) return seller;
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
        window.location.href = `tel:${realPhone}`;
      } else if (actionType === 'WHATSAPP') {
        window.open(`https://wa.me/91${realPhone}?text=Namaste!%20Found%20your%20shop%20on%20NearMe%20India.`, '_blank');
      }
    }, 150);
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
      key: "rzp_test_YOUR_KEY_HERE", // Replace with live Razorpay Key
      amount: amountInRupees * 100, // Paise conversion
      currency: "INR",
      name: "NearMe India",
      description: `Wallet Recharge for ${currentSeller?.shopName || 'Seller'}`,
      image: "https://nearme-india.org/favicon.ico",
      handler: function (response) {
        handleManualWalletCredit(loggedInSellerId, amountInRupees);
        alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}. ₹${amountInRupees} added to wallet.`);
        setShowRechargeModal(false);
      },
      prefill: {
        name: currentSeller?.shopName || "Shop Owner",
        contact: currentSeller?.realPhone || "9876543210"
      },
      notes: {
        seller_id: loggedInSellerId,
        platform: "nearme-india.org"
      },
      theme: {
        color: "#2563eb"
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

  const categories = ['All', 'Tea & Snacks', 'Plumber', 'Electrician', 'Blood SOS', 'Property', 'Loans', 'Doctor'];

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
  });

  // Admin Financial Metrics
  const activeSellerCount = sellers.filter(s => !s.isBlocked).length;
  const totalWalletHoldings = sellers.reduce((acc, s) => acc + s.walletBalance, 0);
  const totalLeadsDelivered = sellers.reduce((acc, s) => acc + s.totalLeadsReceived, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans">
      
      {/* 1. HEADER */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div onClick={() => setActiveTab('home')} className="cursor-pointer flex items-center gap-2">
            <span className="text-2xl font-black text-blue-600 tracking-tight">NearMe</span>
            <span className="text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">INDIA</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowRechargeModal(true)}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg transition-colors shadow-sm"
            >
              💼 Wallet Recharge
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === 'admin' ? 'home' : 'admin')}
              className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors border ${
                activeTab === 'admin' 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
              }`}
            >
              👑 Owner Panel
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
        
        {/* HOMEPAGE VIEW */}
        {activeTab === 'home' && (
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

              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 'Chai', 'Plumber', 'Electrician', 'Blood'..."
                  className="w-full pl-4 pr-24 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
                <button 
                  onClick={() => handleVoiceSearch('hi-IN')}
                  className={`absolute right-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors flex items-center gap-1 ${
                    isListening ? 'bg-red-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  🎤 {isListening ? 'Listening...' : 'Voice Search'}
                </button>
              </div>

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
                  <div key={seller.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="h-36 bg-slate-200 relative">
                        <img src={seller.image} alt={seller.shopName} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                          📍 {seller.computedDistance} km away
                        </span>
                        {seller.isVerified && (
                          <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            ✓ Blue Tick KYC
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-900 text-base leading-snug">{seller.shopName}</h3>
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-1.5 py-0.5 rounded">
                            ★ {seller.rating}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{seller.category} • {seller.city}</p>
                        
                        <p className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded w-max">
                          📞 {seller.maskedPhone}
                        </p>

                        {seller.isBlocked && (
                          <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-[11px] text-amber-800 font-medium">
                            ⚠️ Shop Listing Paused (Recharge Pending)
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                      <button
                        disabled={seller.isBlocked}
                        onClick={() => handleLeadTrigger(seller.id, 'CALL')}
                        className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors ${
                          seller.isBlocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        📞 Call (₹3)
                      </button>

                      <button
                        disabled={seller.isBlocked}
                        onClick={() => handleLeadTrigger(seller.id, 'WHATSAPP')}
                        className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors ${
                          seller.isBlocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        💬 WhatsApp (₹3)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OWNER / ADMIN DASHBOARD PANEL */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">👑 Platform Owner Dashboard</h1>
                <p className="text-xs text-slate-500">Manage sellers, manual top-ups, revenue, and active listings.</p>
              </div>
              <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">
                Admin Mode Active
              </span>
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

            <div className="grid grid-cols-3 gap-2">
              {[100, 300, 500].map(amt => (
                <button 
                  key={amt} 
                  onClick={() => handleRazorpayPayment(amt)}
                  className="p-3 border rounded-xl font-bold text-sm hover:border-blue-600 hover:bg-blue-50 text-slate-800 transition-colors"
                >
                  + ₹{amt}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handleRazorpayPayment(300)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors"
            >
              Pay ₹300 via Razorpay / UPI
            </button>
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
