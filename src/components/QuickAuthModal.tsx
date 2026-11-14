'use client';
import React, { useState } from 'react';
import { Smartphone, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from './Toast';

export default function QuickAuthModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!name || phone.length !== 10 || !email) return toast("Enter valid Name, 10-digit Mobile, and Email", "error");
    setLoading(true);
    try {
        const res = await fetch('/api/auth/send-otp', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });
        const data = await res.json();
        if (data.status === 'sent') {
            setHint(data.hint);
            setSent(true);
            toast("OTP Sent to Mobile", "success");
        } else {
            toast("Failed to send OTP", "error");
        }
    } catch (e) { toast("Server Error", "error"); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return toast("Enter 6-digit OTP", "error");
    setLoading(true);
    try {
        const res = await fetch('/api/auth/verify-otp', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp })
        });
        if (res.ok) {
            localStorage.setItem('nearme_user_phone', phone);
            localStorage.setItem('nearme_user_name', name);
            localStorage.setItem('nearme_user_email', email);
            window.dispatchEvent(new Event('auth_change'));
            toast("Logged in securely!", "success");
            onSuccess();
        } else { toast("Invalid OTP", "error"); }
    } catch(e) { toast("Verification Failed", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
        <Smartphone className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
        <h2 className="text-2xl font-black text-center text-white mb-2">Secure Login</h2>
        <p className="text-gray-400 text-center mb-6 text-sm">Please sign in to proceed with your booking.</p>

        {!sent ? (
          <div className="space-y-4">
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
            <input
              type="tel" maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit Indian Mobile"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
            <button disabled={loading} onClick={handleSend} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex justify-center items-center h-12 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Secure OTP'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-emerald-400 text-xs text-center font-bold">OTP sent to {phone}</p>
            <input
              type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)}
              placeholder="• • • • • •"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-center text-2xl tracking-[1em]"
            />
            <p className="text-gray-600 text-xs text-center cursor-pointer hover:text-gray-400" onClick={() => setOtp(hint)}>Auto-Fill Hint: {hint}</p>
            <button disabled={loading} onClick={handleVerify} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 h-12 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Verify & Login</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
