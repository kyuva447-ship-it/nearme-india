import Link from 'next/link';
import BrandLogo from './BrandLogo';

export default function Navbar() {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/">
            <BrandLogo />
          </Link>
          <div className="hidden md:flex items-center space-x-5">
            <Link href="/search" className="text-sm font-semibold text-slate-700 hover:text-emerald-600">
              Find Services
            </Link>
            <Link href="/claim" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              List Your Business (Free)
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-slate-700 hover:text-emerald-600">
              Merchant Dashboard
            </Link>
            <Link href="/escrow" className="text-sm font-semibold text-slate-700 hover:text-emerald-600">
              Track Escrow
            </Link>
            <Link
              href="/login"
              className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Merchant Portal
            </Link>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <Link href="/search" className="text-xs font-bold text-slate-700 px-2 py-1.5">
              Find Services
            </Link>
            <Link href="/login" className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-md">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

