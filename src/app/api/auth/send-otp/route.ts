import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { otpMemoryStore } from '@/lib/otpStore';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json({ error: 'Invalid 10-digit Indian mobile number' }, { status: 400 });
    }

    const existing = otpMemoryStore.get(cleanPhone);
    if (existing && existing.expiresAt - Date.now() > 9 * 60000) {
      return NextResponse.json(
        { error: 'Please wait 60 seconds before requesting a new OTP' },
        { status: 429 }
      );
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60000;

    otpMemoryStore.set(cleanPhone, { otp, expiresAt });

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      try {
        await supabaseAdmin.from('otp_verifications').upsert({
          phone: cleanPhone,
          otp,
          expires_at: new Date(expiresAt).toISOString(),
        });
      } catch {
        // Memory store acts as backup if table is unavailable
      }
    }

    // Optional Meta WhatsApp Cloud API OTP dispatch if configured
    const waToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
    const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    if (waToken && waPhoneId) {
      fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: `91${cleanPhone}`,
          type: 'text',
          text: { body: `Your NearMe India login OTP is ${otp}. Valid for 10 minutes.` },
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ status: 'sent' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
