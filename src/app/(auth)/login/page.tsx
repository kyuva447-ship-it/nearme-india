'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FrictionlessLogin() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setStep(2); // Simulate instant OTP send via WhatsApp
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Frictionless bypass: log them in immediately, skip passwords
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-black">Zero-Friction Access</h2>
          <p className="text-emerald-100 text-sm mt-2">No passwords. No KYC. Just business.</p>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 98765 43210"
                    className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-xl text-lg font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
              >
                Send Instant OTP <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleVerify}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <p className="text-sm font-bold text-slate-600">OTP sent to +91 {phone}</p>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-emerald-600 font-bold underline mt-1">Change Number</button>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[1em] py-4 bg-slate-100 border-none rounded-xl text-2xl font-black focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/30"
              >
                <Zap className="w-5 h-5" /> Instant Verify
              </button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
