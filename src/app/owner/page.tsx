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

interface OwnerSnapshot {
  agentsPaused: boolean;
  metrics: OwnerMetrics;
  autopilotLogs: AutopilotLogItem[];
}

export default function OwnerPortal() {
  const [snapshot, setSnapshot] = useState<OwnerSnapshot | null>(null);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
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
