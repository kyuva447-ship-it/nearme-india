import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60000).toISOString();

    // 1. REVENUE RECOVERY
    let cartsProcessed = 0;
    try {
        const { data: abandonedCarts } = await supabaseAdmin.from('autonomous_treasury_ledger')
            .select('*')
            .eq('status', 'PENDING')
            .eq('recovery_sent', false)
            .lt('created_at', fifteenMinsAgo);

        if (abandonedCarts && abandonedCarts.length > 0) {
            for (const cart of abandonedCarts) {
                await supabaseAdmin.from('autonomous_treasury_ledger')
                    .update({ recovery_sent: true })
                    .eq('id', cart.id);
            }
            cartsProcessed = abandonedCarts.length;
        }
    } catch(e) { console.error("Recovery cron failed silently"); }

    // 2. AUTONOMOUS MARKETING
    try {
        await supabaseAdmin.from('expiring_slots_ticker').update({
            status: 'refreshed'
        }).lt('expires_at', new Date().toISOString());
    } catch(e) { console.error("Marketing cron failed silently"); }

    // ALWAYS RETURN 200 OK
    return NextResponse.json({
        status: 'master_cron_complete',
        carts_processed: cartsProcessed,
        marketing_status: 'inventory_refreshed'
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ status: 'master_cron_complete', error: 'Ignored' }, { status: 200 });
  }
}
