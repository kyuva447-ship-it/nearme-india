import { NextResponse } from 'next/server';
import {
  resolveSupportQuery,
  supportTickets,
  SupportedLang,
} from '@/lib/autonomousStore';

export async function GET() {
  const autoResolvedCount = supportTickets.filter((t) => !t.humanInterventionNeeded).length;
  return NextResponse.json({
    status: 'operational',
    zeroHumanResolutionRatePct:
      supportTickets.length > 0
        ? Math.round((autoResolvedCount / supportTickets.length) * 100)
        : 100,
    totalTickets: supportTickets.length,
    tickets: supportTickets,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = String(body.query || body.message || '').trim();
    if (!query) {
      return NextResponse.json({ error: 'Support query is required' }, { status: 400 });
    }

    const ticket = await resolveSupportQuery({
      query,
      language: (body.language as SupportedLang) || 'EN',
      customerIdentifier: body.customerIdentifier || body.phone || body.escrowId || 'Guest User',
      channel: body.channel === 'FOUNDER_TEST' ? 'FOUNDER_TEST' : 'WEB_CONCIERGE',
    });

    return NextResponse.json({
      status: 'resolved',
      ticket,
      humanInterventionNeeded: ticket.humanInterventionNeeded,
    });
  } catch {
    return NextResponse.json({ error: 'Autonomous support engine error' }, { status: 400 });
  }
}
