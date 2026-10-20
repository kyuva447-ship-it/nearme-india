import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role to bypass RLS for webhook updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key'
);

export async function POST(req: Request) {
  try {
    // 1. Raw Body Extraction
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    // 2. Buffer Crash Prevention
    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== receivedBuffer.length) {
      return NextResponse.json({ error: 'Invalid signature length' }, { status: 400 });
    }

    if (!crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 3. Parse payload after validation
    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Extract Idempotency Key
    const eventId = req.headers.get('x-razorpay-event-id') || payload.payload?.payment?.entity?.id;

    if (!eventId) {
        return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
    }

    // Check Idempotency
    const { data: existingEvent, error: selectError } = await supabaseAdmin
      .from('v2_razorpay_events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (existingEvent) {
      console.log(`Event ${eventId} already processed. Skipping.`);
      return NextResponse.json({ status: 'ok', message: 'Already processed' }, { status: 200 });
    }

    if (event === 'payment.captured') {
       // Example logic to update a merchant. We assume `notes.merchant_id` is passed in the order creation.
       const merchantId = payload.payload.payment.entity.notes?.merchant_id;
       const amountInPaise = payload.payload.payment.entity.amount;
       const amountInINR = amountInPaise / 100;

       if (merchantId) {
           // We use the admin client to bypass RLS and add the balance
           // In reality, this might be a custom RPC or a direct update if RLS is bypassed by service role.
           const { data: merchant, error: fetchError } = await supabaseAdmin
            .from('v2_merchants')
            .select('wallet_balance')
            .eq('id', merchantId)
            .single();

            if (merchant) {
                await supabaseAdmin
                 .from('v2_merchants')
                 .update({ wallet_balance: Number(merchant.wallet_balance) + amountInINR })
                 .eq('id', merchantId);
            }
       }

       // Record event
       await supabaseAdmin.from('v2_razorpay_events').insert([{ id: eventId, event_type: event }]);
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
