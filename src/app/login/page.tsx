'use client';
import { Bot, User, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Sign In</h1>
                <p className="text-gray-400 text-sm mb-8">Authentication is handled automatically via WhatsApp and QuickAuth during checkout.</p>
                <button onClick={() => router.push('/')} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors mb-4">
                    Return to Home
                </button>
                <a href="https://wa.me/918247831885" target="_blank" rel="noreferrer" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                   <Phone className="w-4 h-4"/> Support
                </a>
            </div>
        </div>
    );
}
