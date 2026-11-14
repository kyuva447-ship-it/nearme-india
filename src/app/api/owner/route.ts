import { NextResponse } from 'next/server';
import {
  DEFAULT_OWNER_PIN,
  OWNER_CONTACT_EMAIL,
} from '@/lib/seeded-marketplace';
import { runAutonomousGrowthCycle } from '@/lib/autonomous-growth';
import {
  getAutonomousTelemetrySnapshot,
  harvestedSuppliers,
  resolveSupportQuery,
  runMapsAndWebHarvester,
  updateFounderControls,
} from '@/lib/autonomousStore';
import { escrowLedger } from '@/lib/escrowStore';
import { auditLedger, ordersLedger } from '@/lib/ordersStore';

function buildRealOwnerPayload() {
  const snapshot = getAutonomousTelemetrySnapshot();
  const capturedOrders = ordersLedger.filter(
    (o) => o.status === 'captured' || o.status === 'paid'
  );
  const realVolumePaise =
    capturedOrders.reduce((acc, o) => acc + o.amount, 0) +
    escrowLedger
      .filter((e) => e.status === 'RELEASED_TO_MERCHANT')
      .reduce((acc, e) => acc + e.total_amount_inr * 100, 0);

  return {
    ...snapshot,
    totalMerchants: harvestedSuppliers.length,
    activeEscrows: escrowLedger.length,
    totalAuditsRun: auditLedger.length,
    total_volume: realVolumePaise,
    total_payments: capturedOrders.length,
    recent_transactions: ordersLedger.slice(0, 10),
    escrows: escrowLedger.slice(0, 10),
  };
}

export async function GET() {
  return NextResponse.json(buildRealOwnerPayload());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pin, action, city, pincode } = body;
    const expectedPin = process.env.OWNER_PIN || DEFAULT_OWNER_PIN;

    if (pin && String(pin) !== expectedPin) {
      return NextResponse.json({ error: 'Invalid owner PIN' }, { status: 401 });
    }

    if (action === 'update_controls') {
      const updated = updateFounderControls({
        autopilotEnabled: body.autopilotEnabled,
        viralBountyMultiplier: body.viralBountyMultiplier,
        autoRefundOn48hExpiry: body.autoRefundOn48hExpiry,
      });
      return NextResponse.json({
        ...buildRealOwnerPayload(),
        status: 'updated',
        controls: updated,
      });
    }

    if (action === 'run_maps_harvester') {
      const harvested = await runMapsAndWebHarvester(
        city || 'Bengaluru',
        pincode || '560001'
      );
      return NextResponse.json({
        ...buildRealOwnerPayload(),
        status: 'ok',
        harvested,
      });
    }

    if (action === 'run_growth' || action === 'run_viral_wave') {
      const report = await runAutonomousGrowthCycle(city || 'Bengaluru', pincode || '560001');
      return NextResponse.json({
        ...buildRealOwnerPayload(),
        status: 'ok',
        report,
      });
    }

    if (action === 'test_self_support') {
      const ticket = await resolveSupportQuery({
        query:
          body.query ||
          'Verify GSTIN 29AABCS1429B1ZQ and check 48h Escrow & Audit self-support status',
        language: body.language || 'EN',
        customerIdentifier: body.customerIdentifier || 'Founder Console Diagnostic',
        channel: 'FOUNDER_TEST',
      });
      return NextResponse.json({
        ...buildRealOwnerPayload(),
        status: 'ok',
        ticket,
      });
    }

    return NextResponse.json({
      ...buildRealOwnerPayload(),
      status: 'authenticated',
      ownerEmail: OWNER_CONTACT_EMAIL,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
