import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();

    if (!secret || !signature) {
      return NextResponse.json({ error: 'Missing webhook secret or signature' }, { status: 400 });
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const sigBuf = Buffer.from(signature, 'utf8');

    if (expectedBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expectedBuf, sigBuf)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const paymentId = body?.payload?.payment?.entity?.id;
    if (!paymentId) {
      return NextResponse.json({ status: 'ignored', reason: 'no payment id' });
    }

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
    const amountInr = Math.round(Number(paymentEntity.amount || 0) / 100);
    const merchantId = notes.merchant_id;

    if (event === 'payment.captured' && merchantId) {
      if (notes.type === 'autorecharge' || notes.tx_type === 'wallet_recharge') {
        const { data: wallet } = await supabaseAdmin
          .from('merchant_wallets')
          .select('balance_inr')
          .eq('merchant_id', String(merchantId))
          .single();
        if (wallet) {
          await supabaseAdmin
            .from('merchant_wallets')
            .update({ balance_inr: Number(wallet.balance_inr || 0) + amountInr })
            .eq('merchant_id', String(merchantId));
        }
      } else if (notes.type === 'subscription' || notes.tx_type === 'pro_subscription') {
        await supabaseAdmin
          .from('merchant_wallets')
          .update({
            is_verified_pro: true,
            pro_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('merchant_id', String(merchantId));
      }
    }

    await supabaseAdmin.from('v2_razorpay_events').insert({
      razorpay_payment_id: paymentId,
      event_type: event,
      amount: amountInr,
      notes,
      merchant_id: merchantId || null,
    });

    return NextResponse.json({ status: 'ok' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
