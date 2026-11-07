'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Search, MapPin, Store, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const cityQuery = searchParams.get('city') || 'Tirupati';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    // Real search logic across categories and shop names
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('city', cityQuery)
      .eq('is_active', true)
      .or(`business_name.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(20);

    if (error) console.error(error);
    else setResults(data || []);

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4">
       <div className="max-w-4xl mx-auto pt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 font-bold mb-6 hover:underline">
             <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-2">
            Search in <span className="text-emerald-600">{cityQuery}</span>
          </h1>

          <form onSubmit={handleSearch} className="mb-12">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search for shops or categories in ${cityQuery}...`}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-4 shadow-sm outline-none focus:border-emerald-500 font-medium text-lg"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl transition-colors">
                   Find
                </button>
             </div>
          </form>

          {loading ? (
             <div className="text-center py-12 text-slate-500 font-bold animate-pulse">Searching...</div>
          ) : results.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((shop, i) => (
                   <Link href={`/shop/${shop.id}`} key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 transition-colors flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                         <Store className="w-6 h-6" />
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-900">{shop.business_name}</h3>
                         <p className="text-sm text-slate-500">{shop.category}</p>
                      </div>
                   </Link>
                ))}
             </div>
          ) : query && !loading ? (
             <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 font-medium mb-4">No shops found for "{query}" in {cityQuery}.</p>
                <Link href={`/add-shop?city=${cityQuery}`} className="inline-flex bg-emerald-600 text-white font-bold py-2 px-6 rounded-xl">
                   Add A Shop Free
                </Link>
             </div>
          ) : null}
       </div>
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Loading Search...</div>}>
            <SearchContent />
        </Suspense>
    )
}
