import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { amount_inr, platform_fee_pct, merchant_account_id } = await req.json();

    // Calculate split
    const platformFee = amount_inr * (platform_fee_pct / 100);
    const merchantAmount = amount_inr - platformFee;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      // Zero-key Demo mode
      return NextResponse.json({
        order_id: `rzp_order_sim_${Date.now()}`,
        status: 'created',
        split: {
          platform_fee: platformFee,
          merchant_amount: merchantAmount,
          merchant_account: merchant_account_id
        },
        demo_mode: true
      }, { status: 200 });
    }

    // Wire Razorpay SDK with actual Transfers logic
    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await instance.orders.create({
      amount: amount_inr * 100, // total amount in paisa
      currency: "INR",
      transfers: [
        {
          account: merchant_account_id,
          amount: merchantAmount * 100, // merchant share in paisa
          currency: "INR",
          notes: {
            purpose: "NearMe Automated Split Processing"
          }
        }
      ]
    });

    return NextResponse.json({
        order_id: order.id,
        status: 'created',
        split: {
          platform_fee: platformFee,
          merchant_amount: merchantAmount,
          merchant_account: merchant_account_id
        },
        demo_mode: false
      }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to create split payment' }, { status: 500 });
  }
}
