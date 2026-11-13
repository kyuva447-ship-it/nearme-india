'use client';

import React, { useState, useEffect } from 'react';
import { Bot, X, Send, Mic, CheckCircle2, Download, ShieldAlert, Loader2 } from 'lucide-react';
import { COPY_BY_LANG, normalizeLang } from '@/lib/i18n';
import type { SupportTicket, SupportedLang } from '@/lib/autonomousStore';

interface ChatItem {
  role: 'user' | 'assistant';
  text: string;
  ticket?: SupportTicket;
}

export default function AgenticConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<SupportedLang>('EN');
  const [identifier, setIdentifier] = useState('+918247831885');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<ChatItem[]>([]);

  useEffect(() => {
    const current = normalizeLang(localStorage.getItem('nearme_lang'));
    setLang(current);
    const savedPhone = localStorage.getItem('nearme_user_phone');
    if (savedPhone) setIdentifier(savedPhone);

    const onLangChange = (e: Event) => {
      const custom = e as CustomEvent<SupportedLang>;
      setLang(normalizeLang(custom.detail));
    };
    const onOpenDesk = () => setIsOpen(true);

    window.addEventListener('nearme-lang-change', onLangChange);
    window.addEventListener('nearme-open-support', onOpenDesk);
    return () => {
      window.removeEventListener('nearme-lang-change', onLangChange);
      window.removeEventListener('nearme-open-support', onOpenDesk);
    };
  }, []);

  const copy = COPY_BY_LANG[lang];

  const sendQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          language: lang,
          customerIdentifier: identifier,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ticket) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.ticket.resolutionSummary,
            ticket: data.ticket,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.error || 'Unable to process request right now.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Connection issue. Retrying autonomous desk...' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleVoiceInput = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) return;
    const rec = new SpeechRec();
    rec.lang = lang === 'HI' ? 'hi-IN' : lang === 'KN' ? 'kn-IN' : lang === 'TA' ? 'ta-IN' : lang === 'TE' ? 'te-IN' : lang === 'MR' ? 'mr-IN' : 'en-IN';
    setListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        setInput(transcript);
        sendQuery(transcript);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const downloadRefundVoucher = (ticket: SupportTicket) => {
    const content = `NEARME INDIA — AUTONOMOUS 48-HOUR ESCROW REFUND VOUCHER
Ticket ID: ${ticket.id}
Voucher Code: ${ticket.refundVoucherCode || 'REF48-AUTO'}
Customer / Escrow Ref: ${ticket.customerIdentifier}
Language: ${ticket.language}
Action Executed: ${ticket.actionExecuted}
Human Intervention Needed: ${ticket.humanInterventionNeeded ? 'Escalated' : '0 (Autonomous)'}
Issued At: ${ticket.createdAt}
Summary: ${ticket.resolutionSummary}
Official Portal: https://www.nearme-india.org`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticket.refundVoucherCode || ticket.id}-refund-voucher.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-2 text-white shadow-xl border border-emerald-400/30 transition-colors z-40"
      >
        <Bot className="w-4 h-4" />
        <span className="font-bold text-xs whitespace-nowrap">{copy.supportButton}</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-[350px] sm:w-[390px] max-w-[calc(100vw-2rem)] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
      <div className="bg-gray-950 p-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500/15 border border-emerald-500/30 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">24/7 Autonomous Self-Support</h4>
            <p className="text-[11px] text-emerald-400">
              {lang} · Zero Human Wait · Auto-Executes Refunds & Unlocks
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close Support Desk"
          className="text-gray-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick self-service actions */}
      <div className="px-3 py-2 bg-gray-950/70 border-b border-gray-800 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => sendQuery('Paid ₹199 for audit, please re-unlock receipt')}
          className="text-[11px] font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 px-2.5 py-1 rounded-md transition-colors"
        >
          Re-Unlock Paid Audit
        </button>
        <button
          type="button"
          onClick={() => sendQuery('Trigger 48-hour Escrow Refund Guarantee for ESC-IND-9921')}
          className="text-[11px] font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 px-2.5 py-1 rounded-md transition-colors"
        >
          48h Escrow Refund
        </button>
        <button
          type="button"
          onClick={() => sendQuery('Verify OTP payout & GSTIN 29AABCS1429B1ZQ')}
          className="text-[11px] font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 px-2.5 py-1 rounded-md transition-colors"
        >
          OTP & GST Help
        </button>
      </div>

      {/* Chat Transcript */}
      <div className="p-3.5 bg-gray-950 flex-1 max-h-72 min-h-[210px] overflow-y-auto space-y-3 text-left">
        <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl text-xs text-gray-300 leading-relaxed">
          {copy.supportGreeting}
        </div>

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl text-xs space-y-2 ${
              m.role === 'user'
                ? 'bg-emerald-950/50 border border-emerald-500/30 text-emerald-100 ml-6'
                : 'bg-gray-900 border border-gray-800 text-gray-200 mr-3'
            }`}
          >
            <p className="leading-relaxed">{m.text}</p>
            {m.ticket && (
              <div className="pt-2 border-t border-gray-800 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-gray-400 font-mono">
                  <span>{m.ticket.id}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    {m.ticket.humanInterventionNeeded ? (
                      <>
                        <ShieldAlert className="w-3 h-3 text-amber-400" /> Escalated to Founder
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> 0 Human Needed
                      </>
                    )}
                  </span>
                </div>
                {m.ticket.refundVoucherCode && (
                  <button
                    type="button"
                    onClick={() => downloadRefundVoucher(m.ticket!)}
                    className="w-full py-1.5 px-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Refund Voucher ({m.ticket.refundVoucherCode})
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Executing autonomous resolution...
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendQuery(input);
        }}
        className="p-3 border-t border-gray-800 bg-gray-900 space-y-2"
      >
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Phone, Transaction ID, or Escrow ID"
          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-300 font-mono outline-none focus:border-emerald-500"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe issue (unlock, 48h refund, OTP, GST)..."
            className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            aria-label="Speak query"
            className={`p-2 rounded-lg border transition-colors ${
              listening
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
