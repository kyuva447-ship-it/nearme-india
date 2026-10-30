import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const sig = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!sig || !secret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    // Fix timing attack vulnerability
    if (!crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(payload);

    if (event.event === 'payment.captured') {
      const { amount, notes } = event.payload.payment.entity;
      const merchantId = notes.merchant_id;

      if (merchantId) {
        // Assume increment_wallet_balance exists via migration
        await supabase.rpc('increment_wallet_balance', {
          p_merchant_id: merchantId,
          p_amount: amount / 100 // Convert paise to INR
        });
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
