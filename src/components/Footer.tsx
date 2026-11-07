'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 md:pb-8 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4">

        {/* ESCROW EXPLANATION */}
        <div className="bg-slate-800 rounded-3xl p-8 mb-12 border border-slate-700">
           <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
              <Shield className="w-8 h-8 text-emerald-400" />
              <h3 className="text-2xl font-black text-white">How Escrow Works</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
              <div>
                 <div className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center font-black mx-auto md:mx-0 mb-3">1</div>
                 <h4 className="font-bold text-white mb-1">You Pay</h4>
                 <p className="text-sm text-slate-400">Money stays safe with NearMe India.</p>
              </div>
              <div>
                 <div className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center font-black mx-auto md:mx-0 mb-3">2</div>
                 <h4 className="font-bold text-white mb-1">Shop Ships</h4>
                 <p className="text-sm text-slate-400">Seller prepares and ships your order.</p>
              </div>
              <div>
                 <div className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center font-black mx-auto md:mx-0 mb-3">3</div>
                 <h4 className="font-bold text-white mb-1">You Receive</h4>
                 <p className="text-sm text-slate-400">You check the item and confirm delivery.</p>
              </div>
              <div>
                 <div className="w-10 h-10 bg-slate-700 text-emerald-400 rounded-full flex items-center justify-center font-black mx-auto md:mx-0 mb-3">4</div>
                 <h4 className="font-bold text-emerald-400 mb-1">Money Released</h4>
                 <p className="text-sm text-slate-400">We send money to shop. Or refund you if failed.</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-black text-white mb-4">NearMe India</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact Support</Link></li>
              <li><Link href="/pricing" className="hover:text-emerald-400 transition-colors">Premium Plans</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-emerald-400 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-2">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h4 className="font-black text-white mb-2">24/7 WhatsApp Support</h4>
              <p className="text-sm text-slate-400 mb-4">Questions? Escrow disputes? We are here.</p>
              <button onClick={() => window.open(`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_PHONE}?text=I%20need%20help`, "_blank")} className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1DA851] transition-colors">
                 <MessageSquare className="w-5 h-5" /> Chat with Support
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-slate-500 text-sm font-bold border-t border-slate-800 pt-8">
           © {new Date().getFullYear()} NearMe India. Built for 10000 Cr Scale.
        </div>
      </div>
    </footer>
  );
}
