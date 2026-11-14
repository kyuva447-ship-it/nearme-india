import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Store, Zap } from 'lucide-react';
import LiveMiniAppPayButton from '@/components/LiveMiniAppPayButton';

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.slug} | Live Mini-App`,
    description: `Instant NearMe India partner checkout and booking pass for ${params.slug}.`,
  }
}

export default function SpawnedAppPage({ params }: Props) {
  const { slug } = params;
  const displayName = slug.replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 sm:p-8">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center relative">
           <div className="absolute top-4 right-4 bg-white/20 px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
             <Zap className="w-3 h-3" /> Live
           </div>
           <Store className="w-16 h-16 text-white mx-auto mb-4" />
           <h1 className="text-2xl font-black text-white capitalize break-words">
             {displayName}
           </h1>
           <p className="text-purple-200 mt-2 text-sm">Powered by NearMe India Super-Engine</p>
        </div>

        <div className="p-8">
           <h2 className="font-bold text-lg mb-4">Bookings & Payments</h2>

           <LiveMiniAppPayButton title={displayName} />

           <p className="text-center text-xs text-slate-500 mb-4">
             Protected by NearMe India 15/85 Escrow &amp; Razorpay Split Settlement.
           </p>
           <Link href="/" className="block text-center text-xs font-bold text-indigo-600 hover:underline">
             Return to NearMe India Home
           </Link>
        </div>
      </div>
    </div>
  );
}