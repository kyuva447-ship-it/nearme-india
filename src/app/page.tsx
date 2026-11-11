// V20 Build Stamp: 2026-11-11T05:56:23.030Z
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Store, Sparkles, TrendingUp, Zap, ChevronRight, CheckCircle2, ShieldCheck, HeartPulse, Stethoscope, Car, Wrench, Building } from "lucide-react";
import CommandHub from '@/components/CommandHub';
import MicroPass from '@/components/MicroPass';
import LiveActivityTicker from '@/components/LiveTicker';

export default function Home() {
  const topCategories = [
    { name: "Medical / Scans", desc: "Save up to 45% on MRI & Labs", icon: <Stethoscope className="w-6 h-6 text-rose-400" />, href: "/search?q=Hospitals" },
    { name: "Electronics & Gadgets", desc: "Wholesale AI Group Price", icon: <Zap className="w-6 h-6 text-blue-400" />, href: "/search?q=Electronics" },
    { name: "Auto & EV Care", desc: "2W/4W Service & Fast Charge", icon: <Car className="w-6 h-6 text-amber-400" />, href: "/search?q=Auto%20Repair" },
    { name: "Real Estate & Hostels", desc: "Zero-Brokerage Verified Stays", icon: <Building className="w-6 h-6 text-emerald-400" />, href: "/search?q=Real%20Estate" },
    { name: "Home & AC Repair", desc: "Instant ₹349 Doorstep Service", icon: <Wrench className="w-6 h-6 text-purple-400" />, href: "/search?q=AC%20Repair" },
    { name: "Tailoring & Custom Fit", desc: "Bespoke Stitching & Bulk Orders", icon: <Sparkles className="w-6 h-6 text-pink-400" />, href: "/search?q=Tailoring" },
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

          <div className="w-full max-w-2xl mx-auto mt-8 relative">
              <Link href="/search" className="block relative group cursor-text">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative flex items-center bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
                      <Search className="absolute left-6 w-6 h-6 text-emerald-400" />
                      <div className="w-full bg-transparent py-4 pl-16 pr-6 font-bold text-lg text-gray-400 text-left">Search deals... e.g. "AC Repair"</div>
                      <div className="absolute right-2 bg-emerald-600 text-white font-black px-6 py-2 rounded-xl">Go</div>
                  </div>
              </Link>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Link href="/search?q=MRI" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors">🏥 MRI & Blood Scans (45% Off)</Link>
                  <Link href="/search?q=AC" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors">❄️ AC Service & Repair (₹349)</Link>
                  <Link href="/search?q=Dental" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors">🦷 Dental Cleaning (₹499)</Link>
                  <Link href="/search?q=Tailoring" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors">✂️ Custom Tailoring (₹249)</Link>
                  <Link href="/search?q=Gym" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors">🏋️ Gym & Co-working Pass (₹99)</Link>
              </div>
          </div>
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {topCategories.map((cat, i) => (
              <Link key={i} href={cat.href} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl flex flex-col items-center text-center gap-3 hover:bg-gray-800 hover:border-gray-700 transition-all group">
                <div className="w-14 h-14 bg-gray-950 rounded-full flex items-center justify-center border border-gray-800 group-hover:border-gray-600 transition-colors shadow-inner">
                  {cat.icon}
                </div>
                <div>
                    <span className="font-bold text-gray-200 group-hover:text-white block mb-1">{cat.name}</span>
                    <span className="text-xs text-gray-500 font-medium group-hover:text-emerald-400 transition-colors">{cat.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="w-full bg-gray-950 border-t border-gray-900 py-12 relative z-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-gray-500" />
            <span className="font-bold text-gray-400">NearMe India • Autonomous Pan-India Hyperlocal AI Network (19,000+ Pincodes)</span>
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
