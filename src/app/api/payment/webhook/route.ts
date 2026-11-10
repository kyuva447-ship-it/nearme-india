import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret || !signature) {
      return NextResponse.json({ error: 'Missing webhook configuration or signature' }, { status: 400 });
    }

    // Verify Razorpay Signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === 'payment.captured') {
        const paymentData = payload.payload.payment.entity;

        // Log to autonomous_treasury_ledger via Service Role (Bypassing RLS)
        await supabaseAdmin.from('autonomous_treasury_ledger').insert({
            engine_source: 'webhook_captured',
            gross_inr: paymentData.amount / 100, // convert paisa to INR
            razorpay_order_id: paymentData.order_id
        });
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
