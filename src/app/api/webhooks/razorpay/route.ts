import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key'
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const eventId = req.headers.get('x-razorpay-event-id') || payload.payload?.payment?.entity?.id;

    if (!eventId) {
        return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
    }

    const { data: existingEvent } = await supabaseAdmin.from('v2_razorpay_events').select('id').eq('id', eventId).single();
    if (existingEvent) {
      return NextResponse.json({ status: 'ok', message: 'Already processed' }, { status: 200 });
    }

    if (event === 'payment.captured') {
       const merchantId = payload.payload.payment.entity.notes?.merchant_id;
       const amountInINR = payload.payload.payment.entity.amount / 100;

       if (merchantId) {
           const { data: merchant } = await supabaseAdmin.from('v2_merchants').select('wallet_balance').eq('id', merchantId).single();
            if (merchant) {
                await supabaseAdmin.from('v2_merchants').update({ wallet_balance: Number(merchant.wallet_balance) + amountInINR }).eq('id', merchantId);
            }
       }
       await supabaseAdmin.from('v2_razorpay_events').insert([{ id: eventId, event_type: event, payload }]);
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
