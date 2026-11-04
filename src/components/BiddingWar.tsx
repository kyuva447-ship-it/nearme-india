'use client';
import { useState } from 'react';

export default function BiddingWar({ category, searchCount }: { category: string, searchCount: number }) {
  const [bidAmount, setBidAmount] = useState(5);

  if (searchCount <= 5) return null;

  return (
    <div className="w-full bg-gradient-to-r from-red-600 to-pink-600 p-4 rounded-xl shadow-lg border border-red-400 mb-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-white font-black flex items-center gap-2">
            🔥 High Demand! Bidding War Live
          </h3>
          <p className="text-white/80 text-sm">{searchCount}+ people are looking for {category} right now.</p>
        </div>
        <div className="flex gap-2 items-center bg-white/20 p-2 rounded-lg">
          <span className="text-white font-bold">Bid:</span>
          <input
            type="number"
            min="5"
            max="15"
            value={bidAmount}
            onChange={(e) => setBidAmount(parseInt(e.target.value))}
            className="w-16 bg-slate-900 text-white rounded px-2 py-1 outline-none text-center"
          />
          <button className="bg-white text-red-600 font-bold px-3 py-1 rounded hover:bg-red-50">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
