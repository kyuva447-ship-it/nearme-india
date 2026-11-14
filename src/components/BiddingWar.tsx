'use client';
import { useState } from 'react';
import { useToast } from './Toast';

export default function BiddingWar({ category, searchCount }: { category: string, searchCount: number }) {
  const [bidAmount, setBidAmount] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  if (searchCount <= 5) return null;

  const handleBidSubmit = () => {
    const safeBid = Math.min(15, Math.max(5, Number(bidAmount) || 5));
    setBidAmount(safeBid);
    setSubmitted(true);
    toast(`Bid of ₹${safeBid} locked for ${category}!`, 'success');
  };

  return (
    <div className="w-full bg-gradient-to-r from-red-600 to-pink-600 p-4 rounded-xl shadow-lg border border-red-400 mb-6 animate-pulse">
      <div className="flex justify-between items-center gap-3 flex-wrap">
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
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              setBidAmount(Number.isNaN(parsed) ? 5 : parsed);
            }}
            className="w-16 bg-slate-900 text-white rounded px-2 py-1 outline-none text-center"
          />
          <button
            type="button"
            onClick={handleBidSubmit}
            className="bg-white text-red-600 font-bold px-3 py-1 rounded hover:bg-red-50"
          >
            {submitted ? 'Locked ✓' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
