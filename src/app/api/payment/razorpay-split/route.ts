import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount_inr, platform_fee_pct, merchant_account_id } = await req.json();

    // Calculate split
    const platformFee = amount_inr * (platform_fee_pct / 100);
    const merchantAmount = amount_inr - platformFee;

    // Simulate Razorpay Route Transers
    const simulatedResponse = {
      order_id: `rzp_order_sim_${Date.now()}`,
      status: 'created',
      split: {
        platform_fee: platformFee,
        merchant_amount: merchantAmount,
        merchant_account: merchant_account_id
      },
      demo_mode: true
    };

    return NextResponse.json(simulatedResponse, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create split payment' }, { status: 500 });
  }
}