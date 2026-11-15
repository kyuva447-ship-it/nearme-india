import { NextResponse } from 'next/server';
import { OWNER_CONTACT_EMAIL } from '@/lib/seeded-marketplace';
import {
  getAutonomousTelemetrySnapshot,
  harvestedSuppliers,
  resolveSupportQuery,
  runMapsAndWebHarvester,
  updateFounderControls,
} from '@/lib/autonomousStore';
import { runAutonomousGrowthCycle } from '@/lib/autonomous-growth';
import { escrowLedger } from '@/lib/escrowStore';
import { auditLedger, ordersLedger } from '@/lib/ordersStore';
import { isAuthorizedOwnerRequest, isOwnerPasswordConfigured } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase/server';

async function buildLiveOwnerPayload() {
  const snapshot = getAutonomousTelemetrySnapshot();
  const capturedOrders = ordersLedger.filter(
    (o) => o.status === 'captured' || o.status === 'paid'
  );
  const realVolumePaise =
    capturedOrders.reduce((acc, o) => acc + o.amount, 0) +
    escrowLedger
      .filter((e) => e.status === 'RELEASED_TO_MERCHANT')
      .reduce((acc, e) => acc + e.total_amount_inr * 100, 0);

  let metrics = {
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
  let autopilotLogs: Array<{
    id: string;
    agent_name: string;
    action_type: string;
    target_city?: string;
    summary: string;
    status: string;
    revenue_generated_inr: number;
    created_at: string;
  }> = [];
  let agentsPaused = !snapshot.controls.autopilotEnabled;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  ) {
    try {
      const [{ data: viewMetrics }, { data: logs }, { data: ctrl }] = await Promise.all([
        supabaseAdmin.from('owner_metrics').select('*').single(),
        supabaseAdmin
          .from('autopilot_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(25),
        supabaseAdmin
          .from('system_controls')
          .select('value_json')
          .eq('key', 'autopilot_config')
          .single(),
      ]);

      if (viewMetrics) metrics = { ...metrics, ...viewMetrics };
      if (logs) autopilotLogs = logs;
      if (typeof ctrl?.value_json?.paused === 'boolean') {
        agentsPaused = ctrl.value_json.paused;
      }
    } catch {
      // Fallback safely when DB view is not migrated yet
    }
  }

  return {
    ...snapshot,
    agentsPaused,
    metrics,
    autopilotLogs,
    totalMerchants: harvestedSuppliers.length,
    activeEscrows: escrowLedger.length,
    totalAuditsRun: auditLedger.length,
    total_volume: realVolumePaise,
    total_payments: capturedOrders.length,
    recent_transactions: ordersLedger.slice(0, 10),
    escrows: escrowLedger.map(({ delivery_otp: _hidden, ...safe }) => safe).slice(0, 10),
  };
}

export async function GET(req: Request) {
  if (!isOwnerPasswordConfigured()) {
    return NextResponse.json(
      { error: 'OWNER_PASSWORD is not set in this environment. Set OWNER_PASSWORD in Vercel Environment Variables (or open your deployed site nearme-india.org/owner).' },
      { status: 503 }
    );
  }
  if (!isAuthorizedOwnerRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await buildLiveOwnerPayload());
}

export async function POST(req: Request) {
  try {
    if (!isOwnerPasswordConfigured()) {
      return NextResponse.json(
        {
          error:
            'OWNER_PASSWORD is not configured on this server (e.g. AI Studio Preview has no Vercel env vars). Open https://www.nearme-india.org/owner after adding OWNER_PASSWORD in Vercel.',
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { password, pin, action, city, pincode } = body;

    if (!isAuthorizedOwnerRequest(req, password || pin)) {
      return NextResponse.json({ error: 'Invalid or missing owner password' }, { status: 401 });
    }

    if (action === 'toggle_pause') {
      const paused = Boolean(body.paused);
      updateFounderControls({ autopilotEnabled: !paused });
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
      ) {
        await supabaseAdmin.from('system_controls').upsert({
          key: 'autopilot_config',
          value_json: { paused, auto_acquire: !paused, auto_match: !paused, auto_verify: !paused },
          updated_at: new Date().toISOString(),
        });
        await supabaseAdmin.from('autopilot_logs').insert({
          agent_name: 'Owner Control Center',
          action_type: paused ? 'agents_paused' : 'agents_resumed',
          summary: paused
            ? 'Owner paused all autonomous agents.'
            : 'Owner resumed all autonomous agents.',
          status: 'success',
          revenue_generated_inr: 0,
        });
      }
      return NextResponse.json({
        ...(await buildLiveOwnerPayload()),
        status: 'updated',
      });
    }

    if (action === 'update_controls') {
      const updated = updateFounderControls({
        autopilotEnabled: body.autopilotEnabled,
        viralBountyMultiplier: body.viralBountyMultiplier,
        autoRefundOn48hExpiry: body.autoRefundOn48hExpiry,
      });
      return NextResponse.json({
        ...(await buildLiveOwnerPayload()),
        status: 'updated',
        controls: updated,
      });
    }

    if (action === 'run_maps_harvester') {
      const harvested = await runMapsAndWebHarvester(city || 'Bengaluru', pincode || '560001');
      return NextResponse.json({
        ...(await buildLiveOwnerPayload()),
        status: 'ok',
        harvested,
      });
    }

    if (action === 'run_growth' || action === 'run_viral_wave') {
      const report = await runAutonomousGrowthCycle(city || 'Bengaluru', pincode || '560001');
      return NextResponse.json({
        ...(await buildLiveOwnerPayload()),
        status: 'ok',
        report,
      });
    }

    if (action === 'test_self_support') {
      const ticket = await resolveSupportQuery({
        query:
          body.query ||
          'Verify GSTIN 29AABCS1429B1ZQ and check Escrow & Audit self-support status',
        language: body.language || 'EN',
        customerIdentifier: body.customerIdentifier || 'Founder Console Diagnostic',
        channel: 'FOUNDER_TEST',
      });
      return NextResponse.json({
        ...(await buildLiveOwnerPayload()),
        status: 'ok',
        ticket,
      });
    }

    return NextResponse.json({
      ...(await buildLiveOwnerPayload()),
      status: 'authenticated',
      ownerEmail: OWNER_CONTACT_EMAIL,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
