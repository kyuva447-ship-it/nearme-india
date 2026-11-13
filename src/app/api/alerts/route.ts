import { NextResponse } from 'next/server';
import { ownerAlerts, pushOwnerAlert } from '@/lib/autonomousStore';
import { OWNER_CONTACT_EMAIL, OWNER_CONTACT_PHONE } from '@/lib/seeded-marketplace';

export async function GET() {
  return NextResponse.json({
    status: 'operational',
    ownerPhone: OWNER_CONTACT_PHONE,
    ownerEmail: OWNER_CONTACT_EMAIL,
    alerts: ownerAlerts,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body.message || '').trim();
    if (!message) {
      return NextResponse.json({ error: 'Alert message is required' }, { status: 400 });
    }
    const alert = pushOwnerAlert(
      body.severity === 'CRITICAL_FRAUD'
        ? 'CRITICAL_FRAUD'
        : body.severity === 'ACTION_TAKEN'
        ? 'ACTION_TAKEN'
        : 'INFO',
      message
    );
    return NextResponse.json({ status: 'dispatched', alert });
  } catch {
    return NextResponse.json({ error: 'Failed to dispatch alert' }, { status: 400 });
  }
}
