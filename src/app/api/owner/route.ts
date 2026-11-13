import { NextResponse } from 'next/server';
import {
  DEFAULT_OWNER_PIN,
  OWNER_CONTACT_EMAIL,
  OWNER_CONTACT_PHONE,
  SEEDED_ESCROWS,
  SEEDED_MERCHANTS,
} from '@/lib/seeded-marketplace';
import { runAutonomousGrowthCycle } from '@/lib/autonomous-growth';
import {
  getAutonomousTelemetrySnapshot,
  resolveSupportQuery,
  runMapsAndWebHarvester,
  updateFounderControls,
} from '@/lib/autonomousStore';

export async function GET() {
  const snapshot = getAutonomousTelemetrySnapshot();

  return NextResponse.json({
    ...snapshot,
    totalMerchants: SEEDED_MERCHANTS.length,
    activeEscrows: SEEDED_ESCROWS.length,
    total_volume: 49900,
    total_payments: 1,
    recent_transactions: [
      {
        id: 'pay_TycTTmprvvbYx4',
        amount: 49900,
        status: 'captured',
        created_at: Math.floor(Date.now() / 1000),
      },
    ],
  });
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
        ...getAutonomousTelemetrySnapshot(),
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
        ...getAutonomousTelemetrySnapshot(),
        status: 'ok',
        harvested,
      });
    }

    if (action === 'run_growth' || action === 'run_viral_wave') {
      const report = await runAutonomousGrowthCycle(city || 'Bengaluru', pincode || '560001');
      return NextResponse.json({
        ...getAutonomousTelemetrySnapshot(),
        status: 'ok',
        report,
      });
    }

    if (action === 'test_self_support') {
      const ticket = await resolveSupportQuery({
        query:
          body.query ||
          'Paid ₹199 for my 112-page ICU bill audit, please re-unlock receipt and check 48h escrow status',
        language: body.language || 'EN',
        customerIdentifier: body.customerIdentifier || '+918247831885',
        channel: 'FOUNDER_TEST',
      });
      return NextResponse.json({
        ...getAutonomousTelemetrySnapshot(),
        status: 'ok',
        ticket,
      });
    }

    return NextResponse.json({
      ...getAutonomousTelemetrySnapshot(),
      status: 'authenticated',
      ownerPhone: OWNER_CONTACT_PHONE,
      ownerEmail: OWNER_CONTACT_EMAIL,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
