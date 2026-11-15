import { NextResponse } from 'next/server';
import { isAuthorizedCronOrOwner } from '@/lib/session';

export async function GET(req: Request) {
  if (!isAuthorizedCronOrOwner(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    message: 'Autopilot runs via /api/autopilot/run',
  });
}
