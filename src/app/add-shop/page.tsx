'use client';
import { Store, Phone } from 'lucide-react';
import Link from 'next/link';

export default function AddShopPage() {
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center">
                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Store className="w-8 h-8 text-orange-500" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Claim Your Business</h1>
                <p className="text-gray-400 text-sm mb-8">Verified merchants get direct WhatsApp leads. Connect with our B2B team to claim your spot.</p>
                <a href="https://wa.me/918147363914?text=I want to list my business on NearMe India" target="_blank" rel="noreferrer" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mb-4">
                   <Phone className="w-4 h-4"/> WhatsApp B2B Team
                </a>
                <Link href="/" className="text-sm text-gray-500 hover:text-white">Cancel</Link>
            </div>
        </div>
    );
}
