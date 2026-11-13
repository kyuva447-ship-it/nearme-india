import { NextResponse } from 'next/server';
import {
  getAutonomousTelemetrySnapshot,
  harvestedSuppliers,
  runMapsAndWebHarvester,
  runWebSyndicationEngine,
  syndicationState,
} from '@/lib/autonomousStore';
import { runAutonomousGrowthCycle } from '@/lib/autonomous-growth';

export async function GET() {
  const snapshot = getAutonomousTelemetrySnapshot();
  return NextResponse.json({
    status: 'operational',
    controls: snapshot.controls,
    subAgents: snapshot.subAgents,
    harvestedSuppliers: harvestedSuppliers.slice(0, 12),
    syndication: syndicationState,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action || 'growth_cycle');
    const city = String(body.city || 'Bengaluru');
    const pincode = String(body.pincode || '560001');
    const category = String(body.category || 'Wholesale Medical Diagnostics & Construction Suppliers');

    if (action === 'maps_harvester') {
      const harvested = await runMapsAndWebHarvester(city, pincode, category);
      return NextResponse.json({
        status: 'ok',
        action: 'maps_harvester',
        ...harvested,
      });
    }

    if (action === 'syndication_ping') {
      const updated = runWebSyndicationEngine(city);
      return NextResponse.json({
        status: 'ok',
        action: 'syndication_ping',
        syndication: updated,
      });
    }

    const report = await runAutonomousGrowthCycle(city, pincode);
    return NextResponse.json({
      status: 'ok',
      action: 'viral_wave',
      report,
      syndication: syndicationState,
      harvestedSuppliers: harvestedSuppliers.slice(0, 8),
    });
  } catch {
    return NextResponse.json({ error: 'AI Manager execution failed' }, { status: 400 });
  }
}
