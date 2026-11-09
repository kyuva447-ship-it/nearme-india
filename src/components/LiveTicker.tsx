import React from 'react';
import { Timer, ArrowDownRight } from 'lucide-react';

const mockSlots = [
  { id: 1, title: 'MRI Scan (Empty Slot)', sector: 'Healthcare', original: 8000, current: 4500, time: '12:45' },
  { id: 2, title: 'Luxury Bus Seat (Bengaluru-Chennai)', sector: 'Travel', original: 1500, current: 850, time: '04:12' },
  { id: 3, title: '5-Star Hotel Room (Tonight)', sector: 'Hospitality', original: 12000, current: 5200, time: '08:30' }
];

export default function LiveTicker() {
  return (
    <div className="w-full mt-16 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Timer className="w-6 h-6 text-orange-500" />
          Expiring Dead-Time Exchange
        </h2>
        <span className="text-sm text-slate-400">Prices drop 1% every 2 mins</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockSlots.map(slot => (
          <div key={slot.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-orange-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{slot.sector}</span>
                <h3 className="text-white font-bold mt-1 line-clamp-1">{slot.title}</h3>
              </div>
              <div className="px-2 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded flex items-center gap-1 animate-pulse">
                <Timer className="w-3 h-3" /> {slot.time}
              </div>
            </div>

            <div className="flex items-end justify-between mt-6">
              <div>
                <span className="text-sm text-slate-500 line-through">₹{slot.original}</span>
                <div className="text-2xl font-black text-emerald-400 flex items-center gap-1">
                  ₹{slot.current}
                  <ArrowDownRight className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <button className="px-4 py-2 bg-slate-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors">
                Lock via UPI
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}