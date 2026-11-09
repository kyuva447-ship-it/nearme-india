import React from 'react';
import { Activity, Users, MapPin, Globe } from 'lucide-react';

export default function TelemetryBar() {
  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs sm:text-sm py-2 px-4 flex flex-wrap items-center justify-between gap-4 z-50 relative">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Cleared Today: ₹24.8 Cr</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>Active Bids: 1,432</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1 cursor-pointer hover:bg-slate-700 transition-colors">
          <MapPin className="w-3 h-3 text-blue-400" />
          <span>560001 (Bengaluru)</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1 cursor-pointer hover:bg-slate-700 transition-colors">
          <Globe className="w-3 h-3 text-purple-400" />
          <select className="bg-transparent outline-none cursor-pointer text-slate-300">
            <option>English</option>
            <option>తెలుగు</option>
            <option>हिन्दी</option>
            <option>தமிழ்</option>
            <option>ಕನ್ನಡ</option>
          </select>
        </div>
      </div>
    </div>
  );
}