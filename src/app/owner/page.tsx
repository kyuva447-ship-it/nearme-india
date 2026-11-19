'use client';

import { useState, useCallback } from 'react';
import {
  Store,
  Zap,
  DollarSign,
  Lock,
  PieChart,
  Bot,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Loader2,
  Crown,
  Wallet,
  ShieldCheck,
  MessageCircle,
  Copy,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { useToast } from '@/components/Toast';

interface OwnerMetrics {
  today_revenue_inr: number;
  total_revenue_inr: number;
  wallet_recharges_inr: number;
  lead_unlock_revenue_inr: number;
  pro_subscription_revenue_inr: number;
  escrow_commission_revenue_inr: number;
  escrow_locked_inr: number;
  active_pro_subscriptions: number;
  total_outreach_leads: number;
  claimed_outreach_leads: number;
  lead_conversion_rate_pct: number;
}

interface AutopilotLogItem {
  id: string;
  agent_name: string;
  action_type: string;
  target_city?: string;
  summary: string;
  status: string;
  revenue_generated_inr: number;
  created_at: string;
}

interface OutreachLeadItem {
  id: string;
  business_name: string;
  phone: string | null;
  email: string | null;
  city: string;
  category: string;
  address: string | null;
  claim_token: string;
  status: string;
  created_at: string;
  contacted_at: string | null;
  claimed_at: string | null;
}

interface OwnerSnapshot {
  agentsPaused: boolean;
  metrics: OwnerMetrics;
  autopilotLogs: AutopilotLogItem[];
  outreachLeads?: OutreachLeadItem[];
}

export default function OwnerPortal() {
  const [snapshot, setSnapshot] = useState<OwnerSnapshot | null>(null);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [outreachFilter, setOutreachFilter] = useState<'all' | 'scraped' | 'contacted' | 'claimed'>('all');
  const [phoneDrafts, setPhoneDrafts] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const fetchSnapshot = useCallback(async (pwd: string) => {
    const res = await fetch('/api/owner', {
      headers: { 'x-owner-password': pwd },
    });
    if (res.ok) {
      const data = await res.json();
      setSnapshot(data);
      return true;
    }
    return false;
  }, []);

  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPwd = password.trim();
    if (!cleanPwd) {
      toast('Enter your Owner Password', 'error');
      return;
    }
    setBusy('login');
    setLoginError(null);
    try {
      const res = await fetch('/api/owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: cleanPwd, action: 'auth' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPassword(cleanPwd);
        setSnapshot(data);
        setAuthenticated(true);
        toast('Owner Money Portal Unlocked', 'success');
      } else {
        const msg = data?.error || 'Invalid Owner Password';
        setLoginError(msg);
        toast(msg, 'error');
        if (res.status === 401) setPassword('');
      }
    } catch {
      toast('Connection error', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleTogglePause = async () => {
    const nextPaused = !(snapshot?.agentsPaused ?? false);
    setBusy('pause');
    try {
      const res = await fetch('/api/owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          action: 'toggle_pause',
          paused: nextPaused,
        }),
      });
      if (res.ok) {
        setSnapshot(await res.json());
        toast(nextPaused ? 'AI Agents Paused' : 'AI Agents Resumed (24/7)', 'success');
      }
    } finally {
      setBusy(null);
    }
  };

  const handleRunAutopilotNow = async () => {
    setBusy('autopilot');
    try {
      const res = await fetch('/api/autopilot/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, force: true }),
      });
      const result = await res.json();
      if (res.ok) {
        toast(
          `Autopilot completed (${result.city}): ${result.acquiredCount} acquired, ${result.matchedCount} matched.`,
          'success'
        );
        await fetchSnapshot(password);
      } else {
        toast(result.error || 'Autopilot execution failed', 'error');
      }
    } catch {
      toast('Failed to run autopilot', 'error');
    } finally {
      setBusy(null);
    }
  };

  const buildWhatsAppPitch = (lead: OutreachLeadItem) => {
    const claimUrl = `https://www.nearme-india.org/claim?token=${lead.claim_token}`;
    return [
      `Namaste ${lead.business_name} team!`,
      `Your shop is now listed on NearMe India (https://www.nearme-india.org) for local buyers in ${lead.city} searching for ${lead.category}.`,
      `- Claim free in 30 seconds & get 2 FREE customer phone numbers`,
      `- Download your FREE Counter QR Standee & GSTIN Trust Badge`,
      `- Optional Razorpay 15/85 UPI Escrow for guaranteed payments`,
      `Claim your profile here: ${claimUrl}`,
    ].join('\n');
  };

  const handleMarkOutreachStatus = async (
    lead: OutreachLeadItem,
    nextStatus: 'contacted' | 'scraped',
    silent = false
  ) => {
    const rawDraft = phoneDrafts[lead.id] ?? lead.phone ?? '';
    const cleanPhone = rawDraft.replace(/\D/g, '').slice(-10);
    setBusy(`lead-${lead.id}`);
    try {
      const res = await fetch('/api/owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          action: 'mark_outreach_contacted',
          leadId: lead.id,
          nextStatus,
          phone: /^[6-9]\d{9}$/.test(cleanPhone) ? cleanPhone : undefined,
        }),
      });
      if (res.ok) {
        setSnapshot(await res.json());
        if (!silent) {
          toast(
            nextStatus === 'contacted'
              ? `Marked ${lead.business_name} as contacted`
              : `Moved ${lead.business_name} back to pending`,
            'success'
          );
        }
      }
    } finally {
      setBusy(null);
    }
  };

  const handleCopyPitch = async (lead: OutreachLeadItem) => {
    const pitch = buildWhatsAppPitch(lead);
    try {
      await navigator.clipboard.writeText(pitch);
      toast(`Copied WhatsApp invite & claim link for ${lead.business_name}`, 'success');
    } catch {
      toast('Could not copy automatically — use Send WhatsApp button instead', 'error');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="w-14 h-14 mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
            <Lock className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold">Private Owner Portal</h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter your Owner PIN (or secret OWNER_PASSWORD from Vercel) to monitor revenue &amp; AI agents.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Owner PIN or Password"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-lg text-white focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={busy === 'login'}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
            >
              {busy === 'login' ? 'Verifying...' : 'Unlock Money Console'}
            </button>
            {loginError && (
              <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-500/30 rounded-xl p-3 text-center leading-relaxed">
                {loginError}
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  const m = snapshot?.metrics || {
    today_revenue_inr: 0,
    total_revenue_inr: 0,
    wallet_recharges_inr: 0,
    lead_unlock_revenue_inr: 0,
    pro_subscription_revenue_inr: 0,
    escrow_commission_revenue_inr: 0,
    escrow_locked_inr: 0,
    active_pro_subscriptions: 0,
    total_outreach_leads: 0,
    claimed_outreach_leads: 0,
    lead_conversion_rate_pct: 0,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header & Primary Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-600/20 border border-emerald-500/40 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold">NearMe India Owner Portal</h1>
              <p className="text-xs text-slate-400">
                Real-Time Revenue, Razorpay Commissions &amp; Agentic AI Control
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={handleRunAutopilotNow}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl text-xs font-black flex items-center gap-2"
            >
              {busy === 'autopilot' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Run Autopilot Now
            </button>

            <button
              type="button"
              disabled={busy !== null}
              onClick={handleTogglePause}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 border ${
                snapshot?.agentsPaused
                  ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {snapshot?.agentsPaused ? (
                <>
                  <PlayCircle className="w-4 h-4" /> Resume Agents
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4" /> Pause Agents
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => fetchSnapshot(password)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Live Money KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Today&apos;s Net Revenue
            </div>
            <div className="text-3xl font-black text-emerald-400">
              ₹{Number(m.today_revenue_inr).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400">
              All-time: ₹{Number(m.total_revenue_inr).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <Wallet className="w-4 h-4 text-cyan-400" /> Wallet Recharges &amp; Lead Unlocks
            </div>
            <div className="text-3xl font-black text-white">
              ₹{Number(m.wallet_recharges_inr).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-cyan-300">
              ₹49 Lead Unlocks: ₹{Number(m.lead_unlock_revenue_inr).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> 5% Escrow Commissions
            </div>
            <div className="text-3xl font-black text-white">
              ₹{Number(m.escrow_commission_revenue_inr).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400">
              Currently Locked: ₹{Number(m.escrow_locked_inr).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <Crown className="w-4 h-4 text-indigo-400" /> Verified Pro (₹299/mo)
            </div>
            <div className="text-3xl font-black text-white">
              {m.active_pro_subscriptions} Active
            </div>
            <p className="text-[11px] text-indigo-300">
              Outreach Conversion: {m.lead_conversion_rate_pct}% ({m.claimed_outreach_leads}/
              {m.total_outreach_leads})
            </p>
          </div>
        </div>

        {/* 1-Tap WhatsApp Outreach Queue */}
        <section className="bg-slate-900 border border-emerald-500/30 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950">
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2 text-white">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                1-Tap WhatsApp Shop Outreach Queue ({snapshot?.outreachLeads?.length || 0})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Discovered shops waiting for an invite. Add/check phone number and tap WhatsApp Invite to send their 2-free-leads link directly.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'scraped', label: 'Pending' },
                  { id: 'contacted', label: 'Contacted' },
                  { id: 'claimed', label: 'Claimed' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setOutreachFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    outreachFilter === tab.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-800 max-h-[520px] overflow-y-auto">
            {(() => {
              const allLeads = snapshot?.outreachLeads || [];
              const filtered =
                outreachFilter === 'all'
                  ? allLeads
                  : allLeads.filter((l) => l.status === outreachFilter);

              if (filtered.length === 0) {
                return (
                  <p className="p-8 text-center text-xs text-slate-400">
                    No shops in this filter yet. Click &quot;Run Autopilot Now&quot; to discover new local businesses.
                  </p>
                );
              }

              return filtered.map((lead) => {
                const draft = phoneDrafts[lead.id] ?? (lead.phone || '');
                const cleanDigits = draft.replace(/\D/g, '').slice(-10);
                const validIndianMobile = /^[6-9]\d{9}$/.test(cleanDigits);
                const pitchText = encodeURIComponent(buildWhatsAppPitch(lead));
                const waHref = validIndianMobile
                  ? `https://wa.me/91${cleanDigits}?text=${pitchText}`
                  : `https://wa.me/?text=${pitchText}`;
                const shopSlugName = lead.business_name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')
                  .slice(0, 48);
                const shopSlugCity = lead.city
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')
                  .slice(0, 48);
                const publicShopHref = `/shop/${shopSlugName}-${shopSlugCity}--lead-${lead.id}`;
                const mailtoHref = lead.email
                  ? `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(
                      `${lead.business_name}: Claim Your Free Page & 2 Free Leads in ${lead.city}`
                    )}&body=${pitchText}`
                  : null;

                return (
                  <div
                    key={lead.id}
                    className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={publicShopHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-sm text-white hover:text-emerald-300 flex items-center gap-1 transition-colors"
                        >
                          {lead.business_name}
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            lead.status === 'claimed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : lead.status === 'contacted'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {lead.status === 'scraped' ? 'pending invite' : lead.status}
                        </span>
                      </div>
                      <p className="text-slate-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>
                          {lead.city} · {lead.category}
                        </span>
                      </p>
                      {lead.address && (
                        <p className="text-[11px] text-slate-400 truncate max-w-2xl">
                          {lead.address}
                        </p>
                      )}
                      {lead.email && (
                        <p className="text-[11px] text-cyan-300 font-mono">
                          Email: {lead.email}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <input
                        type="tel"
                        maxLength={14}
                        value={draft}
                        onChange={(e) =>
                          setPhoneDrafts((prev) => ({ ...prev, [lead.id]: e.target.value }))
                        }
                        placeholder="10-digit WhatsApp #"
                        aria-label={`WhatsApp number for ${lead.business_name}`}
                        className="w-40 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-lg px-2.5 py-2 text-xs text-white font-mono outline-none"
                      />

                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (lead.status === 'scraped') {
                            void handleMarkOutreachStatus(lead, 'contacted', true);
                          }
                        }}
                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp Invite
                      </a>

                      {mailtoHref && (
                        <a
                          href={mailtoHref}
                          onClick={() => {
                            if (lead.status === 'scraped') {
                              void handleMarkOutreachStatus(lead, 'contacted', true);
                            }
                          }}
                          className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Email
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyPitch(lead)}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </button>

                      {lead.status !== 'claimed' && (
                        <button
                          type="button"
                          disabled={busy === `lead-${lead.id}`}
                          onClick={() =>
                            handleMarkOutreachStatus(
                              lead,
                              lead.status === 'contacted' ? 'scraped' : 'contacted'
                            )
                          }
                          className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 hover:border-cyan-500 text-slate-300 font-semibold flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          {lead.status === 'contacted' ? 'Reset' : 'Mark Sent'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </section>

        {/* Live AI Agent Execution Logs */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              Live AI Agent Execution Logs ({snapshot?.autopilotLogs?.length || 0})
            </h2>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <PieChart className="w-3.5 h-3.5" />
              {snapshot?.agentsPaused ? 'STATUS: PAUSED' : 'STATUS: 24/7 AUTOPILOT'}
            </span>
          </div>
          <div className="divide-y divide-slate-800 max-h-[460px] overflow-y-auto">
            {(!snapshot?.autopilotLogs || snapshot.autopilotLogs.length === 0) ? (
              <p className="p-8 text-center text-xs text-slate-400">
                No agent logs recorded yet. Click &quot;Run Autopilot Now&quot; to trigger Google Places acquisition, Gemini lead matching, and verification.
              </p>
            ) : (
              snapshot.autopilotLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-white">
                      {log.agent_name}{' '}
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 ml-1">
                        {log.action_type}
                      </span>
                    </p>
                    <p className="text-slate-300">{log.summary}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    {Number(log.revenue_generated_inr) > 0 && (
                      <p className="font-mono font-bold text-emerald-400">
                        +₹{Number(log.revenue_generated_inr).toLocaleString('en-IN')}
                      </p>
                    )}
                    <p className="text-[11px] font-mono text-slate-500">
                      {new Date(log.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
