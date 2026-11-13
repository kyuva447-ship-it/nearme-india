import { NextResponse } from 'next/server';
import {
  getAutonomousTelemetrySnapshot,
  runWebSyndicationEngine,
} from '@/lib/autonomousStore';

export async function GET() {
  const snapshot = getAutonomousTelemetrySnapshot();
  return NextResponse.json({
    status: 'operational',
    subAgents: snapshot.subAgents,
    syndication: snapshot.syndication,
    controls: snapshot.controls,
    totalExecutions: snapshot.subAgents.reduce((sum, a) => sum + a.executions, 0),
    totalAttributedRevenueInr: snapshot.subAgents.reduce((sum, a) => sum + a.revenueImpactInr, 0),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === 'ping_syndication') {
      const updated = runWebSyndicationEngine(String(body.city || 'All India'));
      return NextResponse.json({ status: 'pinged', syndication: updated });
    }
    return NextResponse.json(getAutonomousTelemetrySnapshot());
  } catch {
    return NextResponse.json({ error: 'Telemetry sync failed' }, { status: 400 });
  }
}
