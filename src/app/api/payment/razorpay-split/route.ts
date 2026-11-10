import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const { order_id, slot_id, user_phone } = await req.json();

    if (!user_phone) {
        return NextResponse.json({ error: 'User phone required for checkout' }, { status: 400 });
    }

    let finalAmount = 1000;
    let platformFeePct = 10;
    let merchantAccount = 'acc_dummy';

    if (slot_id) {
       const { data } = await supabaseAdmin.from('expiring_slots_ticker').select('*').eq('id', slot_id).single();
       if (data) {
           finalAmount = data.current_live_price_inr;
           platformFeePct = data.drop_pct_per_min || 10;
       }
    }

    const platformFee = Math.round(finalAmount * (platformFeePct / 100));
    const merchantAmount = finalAmount - platformFee;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
    }

    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await instance.orders.create({
      amount: Math.round(finalAmount * 100),
      currency: "INR",
      transfers: [
        {
          account: merchantAccount,
          amount: Math.round(merchantAmount * 100),
          currency: "INR",
          notes: { purpose: "NearMe Automated Split Processing" }
        }
      ]
    });

    await supabaseAdmin.from('autonomous_treasury_ledger').insert({
          engine_source: 'live_checkout',
          gross_inr: finalAmount,
          net_platform_profit_inr: platformFee,
          merchant_payout_inr: merchantAmount,
          razorpay_order_id: order.id
    });

    return NextResponse.json({
        order_id: order.id,
        status: 'created',
        demo_mode: false
      }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to create split payment' }, { status: 500 });
  }
}
