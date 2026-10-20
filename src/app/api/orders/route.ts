import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { amount, currency, receipt } = await req.json();

    // Critical Bug Prevention: Must multiply INR by 100 to convert to paise
    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    // TEMPORARY: Hardcode amount to exactly ₹1 (100 paise) for live E2E verification test
    const amountInPaise = 100; // Math.round(amount * 100);

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    const options = {
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order, { status: 200 });

  } catch (error: any) {
    console.error('Order generation failed:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
