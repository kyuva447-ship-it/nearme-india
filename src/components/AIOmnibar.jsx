import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

export default function AIOmnibar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsAnalyzing(true);

    // Mock LLM Intent Parsing
    setTimeout(() => {
      setIsAnalyzing(false);
      onSearch(query);
    }, 800);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <div className="absolute left-4 text-emerald-600">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AI: 'I need a 2BHK broker' or 'Find a factory to stitch 5000 shirts'"
          className="w-full pl-12 pr-28 py-3.5 border-2 border-emerald-100 bg-white rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium transition-all"
        />
        <button
          type="submit"
          disabled={isAnalyzing}
          className={`absolute right-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1 ${
            isAnalyzing ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md'
          }`}
        >
          {isAnalyzing ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              AI Thinking...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" /> Omni-Search
            </>
          )}
        </button>
      </form>
    </div>
  );
}
