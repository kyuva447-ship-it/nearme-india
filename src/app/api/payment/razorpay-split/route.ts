import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const { slot_id, action_type, user_phone, custom_amount } = await req.json();

    if (!user_phone) {
        return NextResponse.json({ error: 'User phone required' }, { status: 400 });
    }

    let finalAmount = custom_amount || 1000;
    let platformFeePct = 4; // Default 4% dynamic cut for Engine logic
    let merchantAccount = 'acc_dummy';
    let source = action_type || 'live_checkout';

    if (slot_id) {
       const { data } = await supabaseAdmin.from('expiring_slots_ticker').select('*').eq('id', slot_id).single();
       if (data) {
           finalAmount = data.current_live_price_inr;
           platformFeePct = 4; // 4% platform cut on Dead-Time items
           merchantAccount = 'acc_dummy'; // Would map to merchant_autopilot_nodes dynamically
       }
    }

    // Subscriptions have a 100% platform take-rate (Direct SaaS revenue)
    if (action_type === 'merchant_sub' || action_type === 'spawn_app') {
       platformFeePct = 100;
    }

    const platformFee = Math.round(finalAmount * (platformFeePct / 100));
    const merchantAmount = finalAmount - platformFee;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Secure Ledger Logging First (Intent creation)
    const { data: ledgerEntry } = await supabaseAdmin.from('autonomous_treasury_ledger').insert({
          engine_source: source,
          gross_inr: finalAmount,
          net_platform_profit_inr: platformFee,
          merchant_payout_inr: merchantAmount,
          status: 'PENDING',
          user_phone: user_phone
    }).select().single();

    if (!keyId || !keySecret) {
      return NextResponse.json({
        order_id: `rzp_order_sim_${ledgerEntry?.id}`,
        status: 'created',
        demo_mode: true
      }, { status: 200 });
    }

    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // Build Payload depending on routing
    const payload: any = {
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        receipt: ledgerEntry?.id
    };

    if (platformFeePct < 100) {
        payload.transfers = [
            {
              account: merchantAccount,
              amount: Math.round(merchantAmount * 100),
              currency: "INR",
              notes: { purpose: "NearMe Automated Split Payout" },
              on_hold: false
            }
        ];
    }

    const order = await instance.orders.create(payload);

    await supabaseAdmin.from('autonomous_treasury_ledger').update({
          razorpay_order_id: order.id
    }).eq('id', ledgerEntry?.id);

    return NextResponse.json({
        order_id: order.id,
        status: 'created',
        demo_mode: false
      }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
