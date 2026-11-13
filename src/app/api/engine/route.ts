import { NextResponse } from 'next/server';
import { runMultiDocBillAudit, AuditRequestPayload } from '@/lib/auditEngine';
import { AUDIT_PRESETS } from '@/lib/seeded-marketplace';

export async function GET() {
  return NextResponse.json({
    status: 'operational',
    engine: 'NearMe Unlimited-Page (1 to 500+ Pages) Multi-Document Streaming AI Auditor',
    model: 'gemini-2.5-flash',
    unlimitedPageCapacity: true,
    presets: AUDIT_PRESETS.map((p) => ({
      id: p.id,
      label: p.label,
      badge: p.badge,
      pageCount: p.pageCount,
    })),
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AuditRequestPayload;
    const result = await runMultiDocBillAudit(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Multi-Doc Engine Error:', error);
    return NextResponse.json(
      { error: 'Failed to process multi-document audit' },
      { status: 500 }
    );
  }
}
