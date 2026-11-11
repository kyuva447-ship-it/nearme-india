import Link from 'next/link';
import { Home, Search, Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 font-[family-name:var(--font-geist-sans)] text-white text-center">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
            <Zap className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-4xl font-black mb-4">Deal Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md">
            We couldn't find the specific deal or page you're looking for, but there are thousands of active deals waiting for you on the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Home className="w-5 h-5" /> Go to Homepage
            </Link>
        </div>
    </div>
  );
}
