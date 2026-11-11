'use client';
import { Store, ShieldCheck, Home } from 'lucide-react';
import Link from 'next/link';

export default function MerchantDashboard() {
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Merchant Hub</h1>
                <p className="text-gray-400 text-sm mb-8">Access restricted. You must be an approved B2B partner to view live leads.</p>
                <Link href="/" className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                   <Home className="w-4 h-4"/> Return Home
                </Link>
            </div>
        </div>
    );
}
