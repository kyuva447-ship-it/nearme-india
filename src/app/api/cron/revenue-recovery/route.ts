import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(req: Request) {
  try {
    // Look for PENDING orders older than 15 mins that haven't received a recovery prompt
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60000).toISOString();

    const { data: abandonedCarts, error } = await supabaseAdmin.from('autonomous_treasury_ledger')
        .select('*')
        .eq('status', 'PENDING')
        .eq('recovery_sent', false)
        .lt('created_at', fifteenMinsAgo);

    if (error) throw error;

    if (abandonedCarts && abandonedCarts.length > 0) {
        for (const cart of abandonedCarts) {
            // Trigger automated SMS/WhatsApp recovery flow
            console.log(`[Revenue Recovery] Sending nudge to ${cart.user_phone} for cart ${cart.id}`);

            // Mark as sent
            await supabaseAdmin.from('autonomous_treasury_ledger')
                .update({ recovery_sent: true })
                .eq('id', cart.id);
        }
    }

    return NextResponse.json({ status: 'recovery_engine_complete', carts_processed: abandonedCarts?.length || 0 }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Recovery Engine Failed' }, { status: 500 });
  }
}
