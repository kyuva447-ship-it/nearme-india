'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Phone, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async () => {
    setLoading(true);
    const res = await fetch('/api/otp/generate', {
      method: 'POST',
      body: JSON.stringify({ phone }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.success) {
      alert(`[DEMO MODE] Your OTP is: ${data.mock_otp}`);
      setStep(2);
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    const result = await signIn('credentials', {
      phone,
      otp,
      redirect: false,
    });
    if (result?.ok) {
      router.push('/merchant/dashboard');
    } else {
      alert('Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white">Merchant Login</h1>
          <p className="text-slate-400 text-sm mt-2">Zero KYC. Start getting leads instantly.</p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">WhatsApp Number</label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading || phone.length < 10}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Secure OTP'}
              <Zap className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Enter 4-Digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="0000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest focus:border-emerald-500 outline-none"
                maxLength={4}
              />
            </div>
            <button
              onClick={handleVerify}
              disabled={loading || otp.length < 4}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Dashboard'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
