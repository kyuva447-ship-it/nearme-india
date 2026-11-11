import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, type, phone } = body;
    const amountInPaise = Math.round(amount * 100);

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        console.warn("Razorpay keys missing, falling back to UPI modal");
        return NextResponse.json({ fallbackMode: true });
    }

    const orderPayload = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Math.floor(Math.random() * 10000)}`,
      payment_capture: 1
    };

    const authHeader = `Basic ${Buffer.from(`${key_id}:${key_secret}`).toString('base64')}`;

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await rzpResponse.json();

    if (!rzpResponse.ok || data.error) {
        console.error("Razorpay Split Error:", data);
        return NextResponse.json({ fallbackMode: true });
    }

    return NextResponse.json({
      order_id: data.id,
      amount: amountInPaise,
      currency: 'INR',
      key_id
    });

  } catch (error) {
    console.error('Razorpay Error:', error);
    return NextResponse.json({ fallbackMode: true });
  }
}
