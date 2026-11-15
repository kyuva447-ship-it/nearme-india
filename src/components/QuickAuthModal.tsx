'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Smartphone, CheckCircle2, Loader2, ShieldCheck, KeyRound, Sparkles, X } from 'lucide-react';
import { useToast } from './Toast';

export default function QuickAuthModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [fallbackOtp, setFallbackOtp] = useState<string | null>(null);
  const [deliveryMode, setDeliveryMode] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [showPinMode, setShowPinMode] = useState(false);
  const [ownerPin, setOwnerPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const completeLogin = (verifiedPhone: string) => {
    localStorage.setItem('nearme_user_phone', verifiedPhone);
    localStorage.setItem('nearme_user_name', name.trim() || `User ${verifiedPhone.slice(-4)}`);
    if (email.trim()) {
      localStorage.setItem('nearme_user_email', email.trim());
    }
    window.dispatchEvent(new Event('auth_change'));
    toast('Logged in securely!', 'success');
    onSuccess();
  };

  const handleSend = async () => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return toast('Enter a valid 10-digit Indian mobile number', 'error');
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return toast('Enter a valid Email address or leave Email blank', 'error');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          email: email.trim(),
          name: name.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && (data.status === 'sent' || data.success)) {
        setSent(true);
        setDeliveryMode(data.delivery_mode || null);
        if (data.fallback_otp) {
          setFallbackOtp(String(data.fallback_otp));
          setOtp(String(data.fallback_otp));
          toast(`Instant One-Tap Verify ready (Code: ${data.fallback_otp})`, 'success');
        } else {
          setFallbackOtp(null);
          toast('OTP sent to your mobile/email', 'success');
        }
      } else {
        toast(data.error || 'Failed to send OTP', 'error');
      }
    } catch {
      toast('Server Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (overrideCode?: string) => {
    const codeToUse = (overrideCode || otp).replace(/\D/g, '');
    if (!/^\d{6}$/.test(codeToUse)) return toast('Enter valid 6-digit OTP', 'error');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          otp: codeToUse,
          name: name.trim(),
          email: email.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        completeLogin(data.phone || phone);
      } else {
        toast(data.error || 'Invalid OTP', 'error');
      }
    } catch {
      toast('Verification Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerPin.trim()) return toast('Enter Owner PIN', 'error');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone || '8247831885',
          pin: ownerPin.trim(),
          name: name.trim() || 'NearMe Admin',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.phone) {
        completeLogin(data.phone);
      } else {
        toast(data.error || 'Invalid Owner PIN', 'error');
      }
    } catch {
      toast('PIN Verification Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Secure Login"
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl shadow-black/80 my-auto max-h-[90dvh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Login Modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <Smartphone className="w-11 h-11 text-cyan-400 mb-3 mx-auto" />
        <h2 className="text-2xl font-black text-center text-white mb-1">Secure Login</h2>
        <p className="text-slate-300 text-center mb-5 text-xs">
          Zero-lockout login with 10-digit Indian mobile or instant fallback verification.
        </p>

        {showPinMode ? (
          <form onSubmit={handlePinLogin} className="space-y-4">
            <div className="bg-violet-950/40 border border-violet-500/30 rounded-xl p-3 text-xs text-violet-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
              Master Admin / Owner Instant Access
            </div>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Mobile (optional — defaults to Owner)"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
            />
            <input
              type="password"
              inputMode="numeric"
              value={ownerPin}
              onChange={(e) => setOwnerPin(e.target.value)}
              placeholder="Enter 6-Digit Owner PIN"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 text-center text-xl tracking-[0.4em]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors flex justify-center items-center h-12 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify PIN & Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setShowPinMode(false)}
              className="w-full text-xs text-gray-400 hover:text-white font-semibold"
            >
              Back to Mobile OTP Login
            </button>
          </form>
        ) : !sent ? (
          <div className="space-y-3.5">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name (optional)"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit Indian Mobile *"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address (optional)"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />
            <button
              type="button"
              disabled={loading}
              onClick={handleSend}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex justify-center items-center h-12 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Secure OTP'}
            </button>
            <button
              type="button"
              onClick={() => setShowPinMode(true)}
              className="w-full text-xs text-slate-400 hover:text-violet-300 font-semibold flex items-center justify-center gap-1.5 pt-1"
            >
              <KeyRound className="w-3.5 h-3.5" /> Owner / Admin PIN Login
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-emerald-400 text-xs text-center font-bold">
              Verifying +91 {phone}
            </p>

            {fallbackOtp && (
              <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-3.5 text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-300">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Instant One-Tap Verify (Code: {fallbackOtp})
                </div>
                <p className="text-[11px] text-emerald-200/80">
                  {deliveryMode === 'instant_verified'
                    ? 'SMS/WhatsApp gateway fallback active — no wait required.'
                    : 'Master instant verification code ready.'}
                </p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleVerify(fallbackOtp)}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-colors"
                >
                  Tap to Verify &amp; Enter ({fallbackOtp})
                </button>
              </div>
            )}

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="• • • • • •"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-center text-2xl tracking-[0.5em]"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => handleVerify()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 h-12 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Verify &amp; Login
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setFallbackOtp(null);
              }}
              className="w-full text-xs text-gray-400 hover:text-white"
            >
              Change Mobile Number
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

