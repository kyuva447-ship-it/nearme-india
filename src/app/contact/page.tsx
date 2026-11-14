'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bot, CheckCircle2, ShieldCheck, Send, Loader2, MapPin, Download } from 'lucide-react';
import { LANGUAGES } from '@/lib/i18n';
import type { SupportTicket, SupportedLang } from '@/lib/autonomousStore';

export default function SelfSupportCenterPage() {
  const [language, setLanguage] = useState<SupportedLang>('EN');
  const [identifier, setIdentifier] = useState('');
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [error, setError] = useState('');

  const submitTicket = async (customQuery?: string) => {
    const q = (customQuery ?? query).trim();
    if (!q || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          language,
          customerIdentifier: identifier.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ticket) {
        setTicket(data.ticket);
        if (!customQuery) setQuery('');
      } else {
        setError(data.error || 'Could not process request.');
      }
    } catch {
      setError('Connection failed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadVoucher = () => {
    if (!ticket) return;
    const ref = ticket.refundVoucherCode || ticket.unlockedAuditRef || ticket.id;
    const text = `NEARME INDIA — AUTONOMOUS SELF-SUPPORT RESOLUTION
Ticket: ${ticket.id}
Reference: ${ref}
Action: ${ticket.actionExecuted}
Summary: ${ticket.resolutionSummary}
Portal: https://www.nearme-india.org (Built in Bengaluru, Karnataka)`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ref}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Bot className="w-4 h-4" /> 24/7 Automated On-Site Resolution
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              NearMe India Autonomous Self-Support Desk
            </h1>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl self-start">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${
                  language === l.code
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.code}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          All audit receipt unlocks, 48-hour escrow refunds, Delivery OTP release checks, and Mod-36 GSTIN verifications are resolved directly inside this website in 6 Indian languages — with zero external phone calls or manual delays.
        </p>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => submitTicket(`Re-unlock my paid audit receipt ${identifier}`)}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-emerald-500/30 rounded-xl text-left text-xs transition-colors"
          >
            <p className="font-bold text-emerald-300">Re-Unlock Audit Receipt</p>
            <p className="text-slate-400 mt-0.5">Restore paid bill audit ledger</p>
          </button>
          <button
            type="button"
            onClick={() => submitTicket(`Check 48-hour Escrow Refund Guarantee ${identifier}`)}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-cyan-500/30 rounded-xl text-left text-xs transition-colors"
          >
            <p className="font-bold text-cyan-300">48h Escrow Refund</p>
            <p className="text-slate-400 mt-0.5">Verify SLA & generate voucher</p>
          </button>
          <button
            type="button"
            onClick={() => submitTicket(`Verify GSTIN & Delivery OTP protocol ${identifier}`)}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-amber-500/30 rounded-xl text-left text-xs transition-colors"
          >
            <p className="font-bold text-amber-300">GSTIN & Delivery OTP</p>
            <p className="text-slate-400 mt-0.5">Check Mod-36 & 85% settlement</p>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitTicket();
          }}
          className="space-y-3 bg-slate-950/70 border border-slate-800 rounded-2xl p-5"
        >
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Your Reference (Optional: Escrow ID ESC-IND-XXXX, Order ID, or 10-digit Mobile)
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. ESC-IND-1024 or order_..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Describe Your Issue or Paste GSTIN / Transaction ID
            </label>
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Example: Check 48h escrow refund for ESC-IND-... or verify GSTIN 29AABCS1429B1ZQ"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>
          {error && <p className="text-xs text-rose-400 font-semibold">{error}</p>}
          <button
            type="submit"
            disabled={!query.trim() || submitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Resolving Autonomously...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Resolve On-Site Now
              </>
            )}
          </button>
        </form>

        {/* Resolution Output */}
        {ticket && (
          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-emerald-300">
                {ticket.id} · {ticket.actionExecuted}
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolved On-Site
              </span>
            </div>
            <p className="text-sm text-slate-100 leading-relaxed">{ticket.resolutionSummary}</p>
            {(ticket.refundVoucherCode || ticket.unlockedAuditRef) && (
              <button
                type="button"
                onClick={downloadVoucher}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Official Proof ({ticket.refundVoucherCode || ticket.unlockedAuditRef})
              </button>
            )}
          </div>
        )}

        {/* Bengaluru Corporate Compliance Info */}
        <div className="pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Built & Operated in Bengaluru, Karnataka, India
            </p>
            <p>
              Official Platform Desk: <span className="text-emerald-400 font-mono">support@nearme-india.org</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/owner" className="text-slate-400 hover:text-white flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Founder Console
            </Link>
            <Link href="/" className="text-cyan-400 hover:text-cyan-300 font-bold">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
