'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Navigation2, Store, BadgeCheck, CheckCircle2, TrendingUp, Sparkles, Filter, Phone, Map as MapIcon, CreditCard, ShieldCheck } from 'lucide-react';
import { useState, useMemo } from 'react';
import LiveMap from '@/components/marketplace/LiveMapWrapper';
import LeadAction from '@/components/marketplace/LeadAction';

const defaultMerchants = [
  {
    id: 'm1',
    name: "Ramesh Hardware & Tools",
    category: "Hardware",
    rating: 4.8,
    reviews: 124,
    distance: "0.4 km",
    verified: true,
    isOpen: true,
    tags: ["Power Tools", "Plumbing", "Electrical"],
    address: "Shop 12, Main Market Road",
    phone: "8247831885",
    current_deal_text: "20% OFF on Drills Today!",
    deal_expiry_time: new Date(Date.now() + 3600000).toISOString(),
    is_currently_available: true,
    community_upvotes: 65,
  },
  {
    id: 'm2',
    name: "Sri Sai Electronics",
    category: "Electronics",
    rating: 4.6,
    reviews: 89,
    distance: "0.8 km",
    verified: true,
    isOpen: true,
    tags: ["Mobile Repair", "Accessories"],
    address: "Opposite Metro Station",
    phone: "9876543210",
    current_deal_text: null,
    deal_expiry_time: null,
    is_currently_available: false,
    community_upvotes: 42,
  },
  {
    id: 'm3',
    name: "Fresh Catch Seafood",
    category: "Groceries",
    rating: 4.9,
    reviews: 312,
    distance: "1.2 km",
    verified: true,
    isOpen: true,
    tags: ["Fresh Fish", "Prawns", "Crab"],
    address: "Fish Market Square",
    phone: "9123456780",
    current_deal_text: "Free delivery within 2km",
    deal_expiry_time: new Date(Date.now() + 7200000).toISOString(),
    is_currently_available: true,
    community_upvotes: 112,
  }
];

const categories = ["All", "Hardware", "Electronics", "Groceries", "Services", "Food"];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState("All");
  const [showMap, setShowMap] = useState(false);

  const filteredMerchants = useMemo(() => {
    let sorted = [...defaultMerchants].sort((a, b) => {
       if (a.is_currently_available && !b.is_currently_available) return -1;
       if (!a.is_currently_available && b.is_currently_available) return 1;
       return 0;
    });

    return sorted.filter(m =>
      (activeCategory === "All" || m.category === activeCategory) &&
      (m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-0">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              NearMe India
            </span>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setShowMap(!showMap)} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all font-semibold flex items-center gap-2">
              <MapIcon className="w-5 h-5" />
              <span className="hidden sm:inline">{showMap ? 'Hide Map' : 'Show Map'}</span>
            </button>
            <a href="/login" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-semibold text-sm flex items-center gap-2">
              Business Login
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4"
          >
            Find exactly what you need, <br className="hidden md:block"/>
            <span className="text-emerald-600">right in your neighborhood.</span>
          </motion.h1>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Connect instantly with verified local merchants on WhatsApp. Support local businesses, get faster service.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-10">
          <div className="relative group shadow-xl shadow-slate-200/50 rounded-2xl bg-white p-2">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-16 pr-4 py-5 bg-transparent border-none rounded-xl text-lg font-medium text-slate-900 placeholder:text-slate-400 focus:ring-0 outline-none"
              placeholder="Search for 'plumber', 'groceries', 'hardware'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-2 right-2 flex items-center">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95">
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showMap && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 400, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100"
            >
              <LiveMap merchants={filteredMerchants} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredMerchants.map((merchant, index) => (
              <motion.div
                key={merchant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200 transition-all relative overflow-hidden group"
              >
                {/* Hyper-Local Flash Deal Banner */}
                {merchant.current_deal_text && merchant.deal_expiry_time && new Date(merchant.deal_expiry_time) > new Date() && (
                  <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold py-1.5 px-3 text-center animate-pulse z-10 shadow-md">
                    🔥 LIVE DEAL: {merchant.current_deal_text}
                  </div>
                )}

                <div className={`flex justify-between items-start mb-4 ${merchant.current_deal_text ? 'mt-4' : ''}`}>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      {merchant.name}
                      {merchant.verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                    </h3>
                    <div className="flex items-center text-slate-500 text-sm mt-1 gap-2 font-medium">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md">{merchant.category}</span>
                      <span>•</span>
                      <span className="flex items-center text-emerald-600 font-bold">
                        <MapPin className="w-4 h-4 mr-1" /> {merchant.distance}
                      </span>
                    </div>
                  </div>

                  {/* Local Legend Badge */}
                  {merchant.community_upvotes > 50 && (
                    <div className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-yellow-200 shadow-sm backdrop-blur-sm">
                      👑 Legend
                    </div>
                  )}
                </div>

                {/* Live Ping Availability Badge */}
                {merchant.is_currently_available && (
                  <div className="mb-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    Available Right Now
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-6">
                  {merchant.tags.map(tag => (
                    <span key={tag} className="text-xs font-semibold bg-slate-50 text-slate-600 px-3 py-1 rounded-lg border border-slate-100">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                   <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="font-black text-slate-900">{merchant.rating}</span>
                        <span className="text-yellow-400 text-lg">★</span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{merchant.reviews} reviews</span>
                      <span className="text-xs text-slate-500 font-medium mt-1">👍 {merchant.community_upvotes} Upvotes</span>
                   </div>

                   <LeadAction merchant={merchant} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
