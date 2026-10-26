import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Feature 2: Automated Webhooks for Razorpay integration
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'fallback_secret_for_build';

    // Verify webhook signature
    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    if (signature !== expectedSignature && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Feature 9 & 8: Auto-update wallets or trigger escrow release based on payload
    if (event === 'payment.captured') {
      // Logic to credit wallet or unlock WhatsApp lead
      console.log('Payment Captured:', payload.payload.payment.entity);
    } else if (event === 'escrow.milestone.verified') {
      // Trigger API to release funds to merchant
      console.log('Escrow milestone verified');
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
