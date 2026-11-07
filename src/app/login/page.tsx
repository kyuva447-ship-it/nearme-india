'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ShieldCheck, Mail, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (!error) setOtpSent(true);
    else console.error("Error sending OTP", error);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    setLoading(false);

    if (data.session) {
        router.push('/dashboard');
    } else {
        console.error("Invalid OTP", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
         <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8" />
         </div>
         <h1 className="text-2xl font-black text-center mb-2">Secure Login</h1>
         <p className="text-center text-slate-500 text-sm font-medium mb-8">Access your NearMe India Dashboard</p>

         {!otpSent ? (
             <form onSubmit={handleSendOTP} className="space-y-4">
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-emerald-500 font-bold"
                      required
                    />
                 </div>
                 <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl transition-colors flex justify-center items-center gap-2">
                    {loading ? "Sending OTP..." : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
                 </button>
             </form>
         ) : (
             <form onSubmit={handleVerifyOTP} className="space-y-4">
                 <p className="text-sm text-emerald-600 text-center mb-4 font-bold bg-emerald-50 py-2 rounded-lg">OTP sent to {email}</p>
                 <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="• • • • • •"
                      className="w-full text-center text-2xl tracking-[0.5em] bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-emerald-500 font-black"
                      required
                    />
                 </div>
                 <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl transition-colors">
                    {loading ? "Verifying..." : "Verify & Enter"}
                 </button>
                 <button type="button" onClick={() => setOtpSent(false)} className="w-full text-slate-500 font-bold text-sm hover:text-emerald-600 mt-2">
                    Use a different email
                 </button>
             </form>
         )}

         <div className="mt-8 text-center text-xs text-slate-400 font-medium">
             By logging in, you agree to our <Link href="/terms" className="underline hover:text-slate-600">Terms of Service</Link>
         </div>
      </div>
    </div>
  );
}
