import { NextResponse } from 'next/server';
import { runMultiDocBillAudit, AuditRequestPayload } from '@/lib/auditEngine';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AuditRequestPayload;
    const result = await runMultiDocBillAudit(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Bill Slasher Error:', error);
    return NextResponse.json({ error: 'Failed to process bill' }, { status: 500 });
  }
}
