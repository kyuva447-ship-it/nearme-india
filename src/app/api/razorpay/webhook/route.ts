import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    const paymentId = body.payload?.payment?.entity?.id;

    if(!paymentId) {
        return NextResponse.json({ status: 'ignored', reason: 'no payment id' });
    }

    // Check idempotency
    const { data: existingEvent } = await supabaseAdmin
      .from('v2_razorpay_events')
      .select('id')
      .eq('razorpay_payment_id', paymentId)
      .single();

    if (existingEvent) {
      return NextResponse.json({ status: 'ok', message: 'already processed' });
    }

    const event = body.event;
    const paymentEntity = body.payload.payment.entity;
    const notes = paymentEntity.notes || {};
    const amount = paymentEntity.amount; // in paise
    const merchantId = notes.merchant_id;

    if (event === 'payment.captured') {
      if (notes.type === 'autorecharge' && merchantId) {
        // Safe atomic update via RPC or direct update
        await supabaseAdmin.rpc('increment_wallet_balance', {
            merchant_uuid: merchantId,
            amount_to_add: amount / 100
        });
      } else if (notes.type === 'escrow') {
         await supabaseAdmin.from('escrow').update({ status: 'locked' }).eq('id', notes.escrow_id);
      } else if (notes.type === 'staking' && merchantId) {
         await supabaseAdmin.rpc('stake_top_slot', {
            merchant_uuid: merchantId,
            target_pincode: notes.pincode,
            stake_amount: amount / 100
         });
      } else if (notes.type === 'subscription' && merchantId) {
         await supabaseAdmin.from('merchants').update({ subscription_plan: notes.plan }).eq('id', merchantId);
      } else if (notes.type === 'bribe') {
         await supabaseAdmin.from('bargain_requests').insert({
             customer_phone: notes.customer_phone,
             category: 'priority',
             budget: amount/100,
             status: 'open'
         });
      } else if (notes.type === 'ad') {
          await supabaseAdmin.from('ad_pins').update({ is_active: true }).eq('id', notes.ad_id);
      }
    }

    // Log event
    await supabaseAdmin.from('v2_razorpay_events').insert({
      razorpay_payment_id: paymentId,
      event_type: event,
      amount: amount / 100,
      notes: notes,
      merchant_id: merchantId || null
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
