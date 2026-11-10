import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(req: Request) {
  try {
    // Vercel Cron Job: Auto-refreshes deals to keep high conversion
    const { error } = await supabaseAdmin.from('expiring_slots_ticker').update({
        status: 'refreshed'
    }).lt('expires_at', new Date().toISOString());

    if (error) throw error;

    return NextResponse.json({ status: 'autonomous_marketing_complete' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Marketing Engine Failed' }, { status: 500 });
  }
}
