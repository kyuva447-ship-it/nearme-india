import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const cronSecret = (process.env.CRON_SECRET || '').trim();
    if (!cronSecret) {
      return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
    }

    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { count } = await supabaseAdmin
      .from('merchant_wallets')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      status: 'ok',
      activeMerchantWallets: count || 0,
      message: 'Legacy cron health check verified; autopilot pipeline runs at /api/autopilot/run',
    });
  } catch {
    return NextResponse.json({ error: 'Cron processing failed' }, { status: 500 });
  }
}
