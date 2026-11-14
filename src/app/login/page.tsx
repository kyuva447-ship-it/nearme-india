'use client';
import { User, Bot } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import QuickAuthModal from '@/components/QuickAuthModal';

export default function LoginPage() {
    const router = useRouter();
    const [openAuth, setOpenAuth] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
            {openAuth && (
                <QuickAuthModal
                    onClose={() => setOpenAuth(false)}
                    onSuccess={() => {
                        setOpenAuth(false);
                        router.push('/account');
                    }}
                />
            )}
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-5">
                <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto">
                    <User className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white">Sign In</h1>
                    <p className="text-slate-400 text-xs mt-1">
                        Authenticate on-site via QuickAuth OTP to manage audits, 15/85 escrows, and digital passes.
                    </p>
                </div>
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => setOpenAuth(true)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
                    >
                        Sign In via On-Site OTP
                    </button>
                    <Link
                        href="/contact"
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <Bot className="w-4 h-4" /> 24/7 On-Site Self-Support
                    </Link>
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-semibold"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
