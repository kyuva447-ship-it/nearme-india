import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const { slot_id, action_type, user_phone, custom_amount, merchant_account_id } = await req.json();

    if (!user_phone) {
        return NextResponse.json({ error: 'User phone required' }, { status: 400 });
    }

    let finalAmount = Number(custom_amount) || 1000;
    let platformFeePct = 4; // Default 4% dynamic cut for Engine logic
    let merchantAccount = merchant_account_id || null;
    let source = action_type || 'live_checkout';

    if (slot_id) {
       const { data } = await supabaseAdmin.from('expiring_slots_ticker').select('*').eq('id', slot_id).single();
       if (data) {
           finalAmount = Number(data.current_live_price_inr);
           platformFeePct = 4;
           // In production, you would fetch merchantAccount from 'merchant_autopilot_nodes' here
       }
    }

    // 100% platform take-rate for direct SaaS revenue
    if (action_type === 'merchant_sub' || action_type === 'spawn_app') {
       platformFeePct = 100;
    }

    const platformFee = Math.round(finalAmount * (platformFeePct / 100));
    const merchantAmount = finalAmount - platformFee;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay API keys missing in environment' }, { status: 500 });
    }

    const { data: ledgerEntry } = await supabaseAdmin.from('autonomous_treasury_ledger').insert({
          engine_source: source,
          gross_inr: finalAmount,
          net_platform_profit_inr: platformFee,
          merchant_payout_inr: merchantAmount,
          status: 'PENDING',
          user_phone: user_phone
    }).select().single();

    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // Ensure amount is strictly an integer in paise
    const payload: any = {
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        receipt: ledgerEntry?.id || 'manual_fallback_receipt'
    };

    // FALLBACK LOGIC: Only apply transfers if a valid Razorpay Linked Account exists.
    // 'acc_dummy' or null will crash the Razorpay API Route.
    const isValidMerchantAccount = merchantAccount && merchantAccount.startsWith('acc_') && merchantAccount !== 'acc_dummy';

    if (platformFeePct < 100 && isValidMerchantAccount) {
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

    if (ledgerEntry) {
        await supabaseAdmin.from('autonomous_treasury_ledger').update({
            razorpay_order_id: order.id
        }).eq('id', ledgerEntry.id);
    }

    return NextResponse.json({
        order_id: order.id,
        status: 'created',
        demo_mode: false
      }, { status: 200 });

  } catch (error) {
    // STOP SWALLOWING ERRORS: Log exact SDK trace so Vercel can display it
    console.error("Razorpay Split Error:", error);
    return NextResponse.json({ error: 'Failed to create payment', details: (error as any)?.message || String(error) }, { status: 500 });
  }
}
