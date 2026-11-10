import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(req: Request) {
  try {
    // 1. REVENUE RECOVERY ENGINE
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60000).toISOString();

    const { data: abandonedCarts, error: cartError } = await supabaseAdmin.from('autonomous_treasury_ledger')
        .select('*')
        .eq('status', 'PENDING')
        .eq('recovery_sent', false)
        .lt('created_at', fifteenMinsAgo);

    if (cartError) throw cartError;

    if (abandonedCarts && abandonedCarts.length > 0) {
        for (const cart of abandonedCarts) {
            console.log(`[Revenue Recovery] Sending nudge to ${cart.user_phone} for cart ${cart.id}`);
            await supabaseAdmin.from('autonomous_treasury_ledger')
                .update({ recovery_sent: true })
                .eq('id', cart.id);
        }
    }

    // 2. AUTONOMOUS MARKETING ENGINE
    const { error: mktError } = await supabaseAdmin.from('expiring_slots_ticker').update({
        status: 'refreshed'
    }).lt('expires_at', new Date().toISOString());

    if (mktError) throw mktError;

    return NextResponse.json({
        status: 'master_cron_complete',
        carts_processed: abandonedCarts?.length || 0,
        marketing_status: 'inventory_refreshed'
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Master Cron Engine Failed' }, { status: 500 });
  }
}
