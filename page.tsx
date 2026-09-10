'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- TYPESCRIPT INTERFACES ---
interface Business {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  rating_avg: number;
  offer?: string;
}

interface Transaction {
  id: string;
  date: string;
  desc: string;
  amount: number;
  type: 'credit' | 'debit';
}

// --- SUPABASE CLIENT INITIALIZATION ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- TYPO AUTO-CORRECTION DICTIONARY ---
const TYPO_MAP: Record<string, string> = {
  clinc: 'Clinics & Hospitals',
  saloon: 'Salons & Beauty',
  te: 'Tea & Snacks',
  docter: 'Clinics & Hospitals',
  restarent: 'Restaurants',
  kirana: 'Retail & Kirana',
  plumber: 'Plumbers',
  gym: 'Gyms & Fitness',
};

export default function NearMeIndiaApp() {
  // State Management
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [correctedQuery, setCorrectedQuery] = useState<string>('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'Bengaluru',
    category: 'Retail & Kirana',
    address: 'Main Market',
    pincode: '560001',
  });

  // Modals & View State
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [claimBusiness, setClaimBusiness] = useState<string | null>(null);
  const [offerBusiness, setOfferBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'dashboard'>('explore');

  // Seller Dashboard Simulated Wallet State
  const [walletBalance] = useState<number>(250.00);
  const [transactions] = useState<Transaction[]>([
    { id: 'tx_101', date: '2026-09-10', desc: 'Lead Charge - High Value Enquiry', amount: -15.00, type: 'debit' },
    { id: 'tx_100', date: '2026-09-08', desc: 'Wallet Top-up (Razorpay)', amount: 265.00, type: 'credit' },
  ]);

  // Load Businesses from Supabase
  const loadBusinesses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('businesses').select('*');
    if (!error && data && data.length > 0) {
      setBusinesses(data as Business[]);
    } else {
      // Local fallback data if database table is empty or loading for the first time
      setBusinesses([
        {
          id: '1',
          name: 'Sri Laxmi Kirana & General Store',
          category: 'Retail & Kirana',
          address: 'MG Road, Indiranagar',
          city: 'Bengaluru',
          pincode: '560038',
          phone: '+91 98765 43210',
          rating_avg: 4.8,
          offer: '10% OFF on Monthly Grocery Items',
        },
        {
          id: '2',
          name: 'Aroma Tea & Snacks Cafe',
          category: 'Tea & Snacks',
          address: '10th Main, Jayanagar',
          city: 'Bengaluru',
          pincode: '560011',
          phone: '+91 98123 45678',
          rating_avg: 4.6,
          offer: '15% OFF on Combo Snacks',
        },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  // Search Bar Auto-Correction
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    const cleaned = value.trim().toLowerCase();
    if (TYPO_MAP[cleaned]) {
      setCorrectedQuery(TYPO_MAP[cleaned]);
    } else {
      setCorrectedQuery('');
    }
  };

  // Submit Business to Supabase
  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitLoading(true);

    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const { error } = await supabase.from('businesses').insert([
      {
        name: formData.name,
        slug: slug,
        phone: formData.phone,
        whatsapp: formData.phone,
        city: formData.city,
        address: formData.address,
        pincode: formData.pincode,
        rating_avg: 5.0,
      },
    ]);

    setSubmitLoading(false);

    if (error) {
      alert('Error registering business: ' + error.message);
    } else {
      alert('Business registered successfully!');
      setIsRegisterOpen(false);
      setFormData({ name: '', phone: '', city: 'Bengaluru', category: 'Retail & Kirana', address: 'Main Market', pincode: '560001' });
      loadBusinesses();
    }
  };

  // Filter listings based on input or correction
  const filteredBusinesses = businesses.filter((biz) => {
    const query = (correctedQuery || searchQuery).toLowerCase().trim();
    if (!query) return true;
    return (
      biz.name.toLowerCase().includes(query) ||
      biz.category.toLowerCase().includes(query) ||
      biz.city.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
            <span className="bg-orange-500 text-white font-black px-3 py-1.5 rounded-xl text-lg tracking-wider">
              NearMe
            </span>
            <span className="font-extrabold text-slate-900 text-sm hidden sm:inline">India</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab(activeTab === 'explore' ? 'dashboard' : 'explore')}
              className="text-xs font-bold px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 transition"
            >
              {activeTab === 'explore' ? 'Seller Dashboard' : 'Explore Platform'}
            </button>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-md transition"
            >
              + Register Business
            </button>
          </div>
        </div>
      </header>

      {/* MAIN ROUTER */}
      {activeTab === 'explore' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-grow w-full">
          {/* HERO & SEARCH SECTION */}
          <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-4">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Find Verified Local Services Near You</h1>
            <p className="text-xs sm:text-sm font-medium text-orange-100">
              Direct contacts, zero middlemen fees, and instant local promotional discounts.
            </p>

            <div className="relative max-w-2xl">
              <input
                type="text"
                placeholder="Search 'clinc', 'saloon', 'kirana', or 'tea'..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-white text-slate-900 placeholder-slate-400 font-semibold text-sm px-5 py-4 rounded-2xl shadow-lg focus:outline-none"
              />
              {correctedQuery && (
                <div className="mt-2 bg-amber-100 text-amber-900 text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-between">
                  <span>
                    Showing results for auto-corrected category: <strong>{correctedQuery}</strong>
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* LISTINGS SECTION */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-900">Verified Local Businesses</h2>
              <span className="text-xs font-bold text-slate-500">{filteredBusinesses.length} Places Found</span>
            </div>

            {loading ? (
              <p className="text-xs text-slate-400 animate-pulse">Loading verified listings from database...</p>
            ) : filteredBusinesses.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-500 font-medium text-xs border border-slate-200">
                No businesses matched your search. Try another query or register a new business!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBusinesses.map((biz) => (
                  <div key={biz.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{biz.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{biz.category || 'Local Service'} • {biz.address}, {biz.city}</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 font-black text-xs px-2.5 py-1 rounded-lg border border-emerald-200">
                        ★ {biz.rating_avg || 5.0}
                      </span>
                    </div>

                    {biz.offer && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">Exclusive Offer</span>
                          <p className="text-xs font-bold text-slate-800">{biz.offer}</p>
                        </div>
                        <button
                          onClick={() => setOfferBusiness(biz)}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg transition"
                        >
                          Claim Code
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => setClaimBusiness(biz.name)}
                        className="text-slate-400 hover:text-slate-600 font-bold underline"
                      >
                        Claim this listing
                      </button>
                      <a
                        href={`tel:${biz.phone}`}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2 rounded-xl transition"
                      >
                        Call Shop
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      ) : (
        /* SELLER DASHBOARD VIEW */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-grow w-full">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Business Owner Dashboard</h1>
              <p className="text-xs text-slate-500 font-medium">Manage leads, subscriptions, and wallet transparency.</p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1.5 rounded-full">
              ● Premium Active (₹299/mo)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Wallet Balance</span>
              <div className="text-3xl font-black text-slate-900">₹{walletBalance.toFixed(2)}</div>
              <p className="text-[11px] text-slate-500">Auto-deducts only for qualifying leads ≥ ₹101.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lead Charging Rule</span>
              <div className="text-xl font-bold text-emerald-600">₹10 – ₹100 = FREE</div>
              <p className="text-[11px] text-slate-500">Small shop inquiries incur zero lead fees.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Action</span>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2.5 rounded-xl shadow-sm text-xs transition">
                Top Up Balance via Razorpay
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm">Transparent Wallet Ledger</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-slate-400 text-[10px] mr-2">{tx.id}</span>
                    <span className="font-bold text-slate-800">{tx.desc}</span>
                    <span className="block text-[10px] text-slate-400">{tx.date}</span>
                  </div>
                  <span className={`font-black text-sm ${tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'credit' ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* PROFESSIONAL FOOTER WITH CONTACT INFORMATION */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="bg-orange-500 text-white font-black px-2.5 py-1 rounded-lg text-sm">NearMe</span>
              <span className="text-white font-extrabold text-sm">India</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              India's direct hyper-local discovery platform connecting verified neighborhood shopkeepers directly with customers.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">Contact & Support</h4>
            <p>Email: <a href="mailto:support@nearmeindia.com" className="text-orange-400 hover:underline">support@nearmeindia.com</a></p>
            <p>Support Helpline: <a href="tel:+919876543210" className="text-orange-400 hover:underline">+91 98765 43210</a></p>
            <p>Head Office: Bengaluru, Karnataka, India</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">Legal & Compliance</h4>
            <p className="hover:underline cursor-pointer">Privacy Policy</p>
            <p className="hover:underline cursor-pointer">Terms of Service</p>
            <p className="hover:underline cursor-pointer">Merchant Onboarding Rules</p>
            <p className="text-slate-500 text-[11px] pt-2">© 2026 NearMe India. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* REGISTER BUSINESS MODAL */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-slate-900">Register New Business</h3>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 font-extrabold">✕</button>
            </div>
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Business Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-orange-500"
              />
              <input
                type="tel"
                placeholder="Mobile / WhatsApp Number"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-orange-500"
              />
              <input
                type="text"
                placeholder="City (e.g. Bengaluru, Hyderabad)"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {submitLoading ? 'Saving to Database...' : 'Submit Registration'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CLAIM LISTING MODAL */}
      {claimBusiness && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-xs font-semibold">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-slate-900">Claim "{claimBusiness}"</h3>
              <button onClick={() => setClaimBusiness(null)} className="text-slate-400 font-extrabold">✕</button>
            </div>
            <p className="text-slate-500">Enter your phone number to receive an ownership verification OTP code.</p>
            <input type="tel" placeholder="10-digit Phone Number" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none" />
            <button
              onClick={() => {
                alert('Verification OTP sent successfully!');
                setClaimBusiness(null);
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-xl"
            >
              Send OTP Code
            </button>
          </div>
        </div>
      )}

      {/* OFFER REDEMPTION MODAL */}
      {offerBusiness && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-xs font-semibold text-center">
            <h3 className="text-base font-black text-slate-900">{offerBusiness.offer}</h3>
            <p className="text-slate-500">Show this coupon code at the shop counter during billing:</p>
            <div className="bg-orange-50 border-2 border-dashed border-orange-400 text-orange-600 font-black text-2xl py-3 rounded-2xl tracking-widest">
              NEAR15OFF
            </div>
            <button onClick={() => setOfferBusiness(null)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 rounded-xl">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
