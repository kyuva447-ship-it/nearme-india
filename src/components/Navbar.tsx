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
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-emerald-600">Home</Link>
            <Link href="/leaderboard" className="text-sm font-semibold text-slate-600 hover:text-emerald-600">Leaderboard</Link>
            <Link href="/pricing" className="text-sm font-semibold text-slate-600 hover:text-emerald-600">Pricing</Link>
            <Link href="/escrow" className="text-sm font-semibold text-slate-600 hover:text-emerald-600">B2B Workflow</Link>
            <Link href="/edge" className="text-sm font-semibold text-slate-600 hover:text-emerald-600">Edge Security</Link>
            <Link href="/login" className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
              Merchant Portal
            </Link>
          </div>
          {/* Mobile menu button (Simplified for brevity, assuming standard responsive hidden) */}
          <div className="md:hidden flex items-center">
            <Link href="/login" className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-md">Login</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
