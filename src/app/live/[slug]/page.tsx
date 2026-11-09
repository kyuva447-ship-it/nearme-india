import React from 'react';
import { Metadata } from 'next';
import { Store, Zap } from 'lucide-react';

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.slug} | Live Mini-App`,
    description: `A 4-Second AI spawned mini-app for ${params.slug}.`,
  }
}

export default function SpawnedAppPage({ params }: Props) {
  const { slug } = params;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 sm:p-8">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center relative">
           <div className="absolute top-4 right-4 bg-white/20 px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
             <Zap className="w-3 h-3" /> Live
           </div>
           <Store className="w-16 h-16 text-white mx-auto mb-4" />
           <h1 className="text-2xl font-black text-white capitalize break-words">
             {slug.replace(/-/g, ' ')}
           </h1>
           <p className="text-purple-200 mt-2 text-sm">Powered by NearMe Super-Engine</p>
        </div>

        <div className="p-8">
           <h2 className="font-bold text-lg mb-4">Bookings & Payments</h2>

           <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl mb-4 transition-colors">
             Pay via UPI (Split)
           </button>

           <p className="text-center text-xs text-slate-400">
             1.5% processing fee applies. Instant settlement to merchant.
           </p>
        </div>
      </div>
    </div>
  );
}