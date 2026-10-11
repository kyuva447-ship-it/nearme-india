import { MapPin, ShieldCheck, Radar } from 'lucide-react';

export default function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Emblem */}
      <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[10px] shadow-lg shadow-indigo-900/20 border border-indigo-500/20 overflow-hidden">
        {/* Radar Wave (Glowing) */}
        <Radar className="absolute w-8 h-8 text-emerald-400 opacity-20 animate-[spin_4s_linear_infinite]" />

        {/* Geometric 'N' with Gradient Spark */}
        <div className="relative z-10 font-black text-2xl text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-300">
          N
        </div>
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-emerald-400 animate-pulse" />
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <span className="font-black tracking-tighter text-slate-900 text-xl leading-none">
          NearMe
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[10px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-emerald-500">
            INDIA
          </span>
          <span className="bg-emerald-100 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest border border-emerald-200">
            Verified
          </span>
        </div>
      </div>
    </div>
  );
}
