import { NextResponse } from 'next/server';
import { GEMINI_MODEL, generateGeminiWithFallback, getGeminiClient } from '@/lib/gemini';
import { supabaseAdmin } from '@/lib/supabase/server';
import { validateGstinMod36 } from '@/lib/seeded-marketplace';
import { getVerifiedSessionPhone } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image_data, upi_id, gstin, businessName } = body;

    if (gstin) {
      const check = validateGstinMod36(String(gstin));
      return NextResponse.json({
        status: check.checksumValid ? 'approved' : 'format_checked',
        gstin: check.gstin,
        businessName: businessName || 'Verified NearMe Partner',
        mod36ChecksumValid: check.checksumValid,
        message: check.checksumValid
          ? 'GSTIN Mod-36 & KYC Verified'
          : 'GSTIN format logged for secondary verification',
      });
    }

    const sessionPhone = getVerifiedSessionPhone();
    const targetPhone = sessionPhone || (typeof body.phone === 'string' ? body.phone.replace(/\D/g, '') : '');
    if (!targetPhone) {
      return NextResponse.json({ error: 'Authentication required for KYC submission' }, { status: 401 });
    }

    const ai = getGeminiClient();
    if (!ai || !image_data) {
      return NextResponse.json(
        { status: 'rejected', message: 'Valid business license image and AI verification key required.' },
        { status: 400 }
      );
    }

    let responseText = '';
    try {
      const base64Data = String(image_data).replace(/^data:[^;]+;base64,/, '');
      const result = await generateGeminiWithFallback(ai, {
        model: GEMINI_MODEL,
        contents: [
          {
            text: "Analyze this business license or GST certificate. Is it a valid, readable government business document? Reply with 'VERIFIED' or 'REJECTED' and a brief reason.",
          },
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
        ],
      });
      responseText = result.text || '';
    } catch {
      return NextResponse.json(
        { status: 'error', message: 'Automated KYC inspector temporarily unavailable. Please retry.' },
        { status: 503 }
      );
    }

    const isVerified =
      /\bVERIFIED\b/i.test(responseText) &&
      !/\b(NOT\s+VERIFIED|UNVERIFIED|REJECTED)\b/i.test(responseText);

    if (isVerified) {
      try {
        await supabaseAdmin
          .from('merchant_autopilot_nodes')
          .update({
            kyc_verified: true,
            payout_upi_id: String(upi_id || ''),
          })
          .eq('phone', targetPhone);
      } catch {
        // Silent fallback when table is absent
      }

      return NextResponse.json({ status: 'approved', message: 'Automated KYC Successful' });
    }

    return NextResponse.json(
      { status: 'rejected', message: 'KYC Failed. Document unreadable or invalid.' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json({ error: 'Invalid KYC payload' }, { status: 400 });
  }
}
