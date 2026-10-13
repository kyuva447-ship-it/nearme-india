import Link from 'next/link';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-6 py-24">
      <div className="text-center max-w-2xl">
        <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-500 mb-8 drop-shadow-sm">404</div>
        <h1 className="text-4xl font-black text-slate-900 mb-4">Route Not Found</h1>
        <p className="text-lg text-slate-600 mb-10">
          The requested page or B2B workflow milestone could not be located on our edge network.
          It may have been moved or you might have followed an outdated link.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
          >
            <Home className="w-5 h-5" /> Return Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 rounded-xl transition-all"
          >
            <Search className="w-5 h-5" /> Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
