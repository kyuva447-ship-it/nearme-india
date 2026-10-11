import { MapPin, ShieldCheck } from 'lucide-react';

export default function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center">
        <MapPin className="w-8 h-8 text-orange-500 fill-orange-500/20" />
        <ShieldCheck className="absolute -bottom-1 -right-1 w-4 h-4 text-emerald-500 fill-white" />
      </div>
      <span className="font-black tracking-tight text-slate-900 text-xl">
        NearMe <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-fuchsia-600">India</span>
      </span>
    </div>
  );
}
