import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { image_data, pincode } = await req.json();

    // Simulate Gemini API / Multimodal OCR audit
    const originalAmount = 15000;
    const fairPrice = 11000;

    const simulatedResponse = {
      status: 'success',
      bill_type: 'Hospital Estimate',
      original_amount_inr: originalAmount,
      ai_audited_fair_price_inr: fairPrice,
      counter_offer_price_inr: fairPrice,
      user_savings_inr: originalAmount - fairPrice,
      platform_success_fee_inr: (originalAmount - fairPrice) * 0.20,
      winning_provider_name: 'Nearby Verified Clinic'
    };

    return NextResponse.json(simulatedResponse, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process bill' }, { status: 500 });
  }
}