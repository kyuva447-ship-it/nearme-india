'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Lock, User, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
    if (error) setError(error.message);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
       setError("Login failed - Try again");
    } else {
       router.push('/dashboard');
    }
    setLoading(false);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
    if (error) {
       setError("Failed to send OTP - Try again");
    } else {
       setStep(2);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.verifyOtp({ phone: `+91${phone}`, token: otp, type: 'sms' });
    if (error) {
       setError("Invalid OTP - Try again");
    } else {
       router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-emerald-600 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
             <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black">Welcome to NearMe India</h2>
          <p className="text-emerald-100 text-sm mt-1">Login to manage your local profile</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-lg text-center mb-6 border border-red-100">
               {error}
            </div>
          )}

          {/* Google Auth */}
          <button onClick={handleGoogleLogin} className="w-full bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all mb-6">
            <User className="w-5 h-5 text-slate-500" /> Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-slate-400 text-xs font-bold uppercase">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-lg p-1 mb-8">
            <button onClick={() => { setMethod('email'); setError(''); }} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${method === 'email' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Email</button>
            <button onClick={() => { setMethod('phone'); setError(''); setStep(1); }} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${method === 'phone' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Phone</button>
          </div>

          {/* Forms */}
          {method === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" required />
              </div>
              <div className="flex justify-end">
                 <button type="button" className="text-xs font-bold text-emerald-600 hover:underline">Forgot Password?</button>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                {loading ? "Verifying..." : <><LogIn className="w-5 h-5" /> Login</>}
              </button>
            </form>
          ) : (
            <div>
              {step === 1 ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <span className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-500 font-bold border-r border-slate-300 pr-2">+91</span>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Mobile Number" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-24 pr-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" required minLength={10} maxLength={10} />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all">
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                   <div className="text-center mb-4">
                      <p className="text-sm text-slate-600 font-bold mb-1">Enter OTP sent to +91 {phone}</p>
                      <button type="button" onClick={() => setStep(1)} className="text-xs text-emerald-600 font-bold underline">Change Number</button>
                   </div>
                   <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="• • • • • •" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 text-center text-2xl tracking-[0.5em] font-black outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" required />
                   <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all">
                     {loading ? "Verifying..." : "Confirm & Login"}
                   </button>
                </form>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
             <Link href="/" className="text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors">← Back to Home</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
