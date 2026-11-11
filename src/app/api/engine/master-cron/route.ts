import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log("Master Cron Triggered via API");
    return NextResponse.json({ success: true, timestamp: Date.now() });
  } catch (error) {
    console.error('Master Cron Error:', error);
    return NextResponse.json({ success: false, error: 'Soft failure' });
  }
}

export async function GET(req: Request) {
  try {
    console.log("Master Cron GET Triggered");
    return NextResponse.json({ success: true, timestamp: Date.now() });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Soft failure' });
  }
}
