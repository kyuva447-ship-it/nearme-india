import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { image_data, phone, upi_id } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ status: 'approved_mock', message: 'KYC Verified (Demo Fallback)' }, { status: 200 });
    }

    // Wire Gemini AI Multimodal to verify GST/Shop License
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let promptParts: any[] = ["Analyze this business license or GST certificate. Is it a valid, readable government business document? Reply with 'VERIFIED' or 'REJECTED' and a brief reason."];

    if (image_data) {
        const base64Data = image_data.replace(/^data:image\/\w+;base64,/, "");
        promptParts.push({ inlineData: { data: base64Data, mimeType: "image/jpeg" }});
    }

    const result = await model.generateContent(promptParts);
    const responseText = result.response.text();

    if (responseText.includes('VERIFIED')) {
        // Auto-approve merchant in DB
        await supabaseAdmin.from('merchant_autopilot_nodes').update({
            kyc_verified: true,
            payout_upi_id: upi_id
        }).eq('phone', phone);

        return NextResponse.json({ status: 'approved', message: 'Automated KYC Successful' }, { status: 200 });
    } else {
        return NextResponse.json({ status: 'rejected', message: 'KYC Failed. Document unreadable or invalid.' }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({ error: 'Failed to process KYC' }, { status: 500 });
  }
}
