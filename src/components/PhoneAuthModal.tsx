'use client';
import React, { useState } from 'react';
import { Smartphone, CheckCircle2 } from 'lucide-react';

export default function PhoneAuthModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (phone.length === 10) setSent(true);
  };

  const handleVerify = () => {
    if (otp.length === 4) {
      localStorage.setItem('nearme_user_phone', phone);
      window.dispatchEvent(new Event('auth_change'));
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950/90 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
        <Smartphone className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
        <h2 className="text-2xl font-black text-center text-white mb-2">Login</h2>
        <p className="text-gray-400 text-center mb-6 text-sm">Enter mobile to unlock deals.</p>

        {!sent ? (
          <div className="space-y-4">
            <input
              type="tel" maxLength={10} value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="10-digit Indian Mobile"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-center tracking-widest"
            />
            <button onClick={handleSend} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
              Send OTP
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-emerald-400 text-xs text-center font-bold">OTP sent to {phone}</p>
            <input
              type="text" maxLength={4} value={otp} onChange={e => setOtp(e.target.value)}
              placeholder="1234"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-center text-2xl tracking-[1em]"
            />
            <button onClick={handleVerify} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Verify & Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
