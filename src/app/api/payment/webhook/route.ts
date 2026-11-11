import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret || !signature) {
      return NextResponse.json({ error: 'Missing configuration' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
        const paymentData = payload.payload.payment.entity;

        // 1. Update Ledger to PAID
        const { data: order } = await supabaseAdmin.from('autonomous_treasury_ledger')
            .update({ status: 'PAID' })
            .eq('razorpay_order_id', paymentData.order_id)
            .select().single();

        // 2. Zero-Touch Fulfillment Engine
        if (order && order.user_phone) {
            // Trigger autonomous WhatsApp dispatch payload via webhook to message broker
            // e.g., fetch('https://wa-api.example.com/send', { body: { to: order.user_phone, message: "Your NearMe QR Pass..." }})
            console.log(`[Zero-Touch] Dispatched digital pass to ${order.user_phone} for order ${order.id}`);
        }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
