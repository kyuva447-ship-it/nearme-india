import { NextResponse } from 'next/server';
import { isAuthorizedCronOrOwner } from '@/lib/session';

export async function POST(req: Request) {
  if (!isAuthorizedCronOrOwner(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ success: true, timestamp: Date.now() });
}

export async function GET(req: Request) {
  if (!isAuthorizedCronOrOwner(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ success: true, timestamp: Date.now() });
}
