import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(signature, 'utf8');

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload?.payload?.payment?.entity;
    const eventId = req.headers.get('x-razorpay-event-id') || paymentEntity?.id;

    if (!eventId) {
      return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
    }

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      const { data: existingEvent } = await supabaseAdmin
        .from('v2_razorpay_events')
        .select('id')
        .eq('id', eventId)
        .single();
      if (existingEvent) {
        return NextResponse.json({ status: 'ok', message: 'Already processed' }, { status: 200 });
      }

      if (event === 'payment.captured' || event === 'order.paid') {
        const merchantId = paymentEntity?.notes?.merchant_id;
        const amountInINR = Math.round(Number(paymentEntity?.amount || 0) / 100);
        const orderId = paymentEntity?.order_id || payload?.payload?.order?.entity?.id;

        if (merchantId && amountInINR > 0) {
          const { data: wallet } = await supabaseAdmin
            .from('merchant_wallets')
            .select('balance_inr')
            .eq('merchant_id', String(merchantId))
            .single();
          if (wallet) {
            await supabaseAdmin
              .from('merchant_wallets')
              .update({
                balance_inr: Number(wallet.balance_inr || 0) + amountInINR,
                updated_at: new Date().toISOString(),
              })
              .eq('merchant_id', String(merchantId));
          }
        }

        if (orderId) {
          await supabaseAdmin
            .from('transactions')
            .update({ status: 'captured', razorpay_payment_id: paymentEntity?.id || null })
            .eq('razorpay_order_id', String(orderId))
            .eq('status', 'pending');
        }

        await supabaseAdmin
          .from('v2_razorpay_events')
          .insert([{ id: eventId, event_type: event, payload }]);
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
