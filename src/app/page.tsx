// V20 Build Stamp: 2026-11-11T05:56:23.030Z
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Store, Sparkles, TrendingUp, Zap, ChevronRight, CheckCircle2, ShieldCheck, HeartPulse, Stethoscope, Car, Wrench, Building } from "lucide-react";
import CommandHub from '@/components/CommandHub';
import MicroPass from '@/components/MicroPass';
import LiveActivityTicker from '@/components/LiveTicker';

export default function Home() {
  const topCategories = [
    { name: "Medical / Scans", icon: <Stethoscope className="w-6 h-6 text-rose-400" />, href: "/services/all-india/medical" },
    { name: "Electronics", icon: <Zap className="w-6 h-6 text-blue-400" />, href: "/services/all-india/electronics" },
    { name: "Auto Repair", icon: <Wrench className="w-6 h-6 text-amber-400" />, href: "/services/all-india/auto" },
    { name: "Real Estate", icon: <Building className="w-6 h-6 text-emerald-400" />, href: "/services/all-india/real-estate" },
  ];

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] flex flex-col relative overflow-hidden bg-gray-950">
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-1/2 h-[60vh] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none"></div>

      <header className="w-full flex items-center justify-between p-4 sm:p-6 lg:px-12 relative z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">NearMe<span className="text-blue-500">India</span></span>
        </Link>
        <div className="flex items-center gap-4">


        </div>
      </header>

      <main className="flex-1 flex flex-col items-center pt-8 sm:pt-16 pb-20 w-full relative z-10 px-4">

        <div className="max-w-4xl w-full text-center space-y-6 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-sm font-bold mb-4 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" /> Pan-India Live
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] text-white">
             Slash Local Bills <br className="hidden sm:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">In 60 Seconds.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto font-medium">
             Speak your price or scan your bill. India's top merchants fight to give you the lowest local price.
          </p>
        </div>

        <LiveActivityTicker />
        <CommandHub />
        <MicroPass />

        <div className="w-full max-w-6xl mx-auto mt-16 px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-white flex items-center gap-2"><TrendingUp className="w-6 h-6 text-emerald-400" /> Top City Markets</h3>
            <Link href="/search" className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topCategories.map((cat, i) => (
              <Link key={i} href={cat.href} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-gray-800 transition-all group">
                <div className="w-16 h-16 bg-gray-950 rounded-full flex items-center justify-center border border-gray-800 group-hover:border-gray-600 transition-colors shadow-inner">
                  {cat.icon}
                </div>
                <span className="font-bold text-gray-300 group-hover:text-white">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="w-full bg-gray-950 border-t border-gray-900 py-12 relative z-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-gray-500" />
            <span className="font-bold text-gray-400">NearMe India V1</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-gray-500">

             <Link href="/search" className="hover:text-white">City Directory</Link>
             <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
             <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
          <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} NearMe India. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
