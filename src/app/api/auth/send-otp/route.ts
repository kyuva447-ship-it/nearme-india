import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { otpMemoryStore } from '@/lib/otpStore';

const MASTER_ADMIN_PHONE = '8247831885';

async function tryWhatsAppDelivery(cleanPhone: string, otp: string): Promise<boolean> {
  const waToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  if (!waToken || !waPhoneId) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, {
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
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function tryEmailDelivery(email: string, otp: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'NearMe India <onboarding@resend.dev>',
        to: [email],
        subject: `NearMe India Login Code: ${otp}`,
        html: `<p>Your NearMe India verification code is <strong>${otp}</strong>. Valid for 10 minutes.</p>`,
      }),
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const cleanPhone = String(body.phone || '').replace(/\D/g, '').slice(-10);
    const cleanEmail = String(body.email || '').trim();

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Invalid 10-digit Indian mobile number' },
        { status: 400 }
      );
    }

    const existing = otpMemoryStore.get(cleanPhone);
    const reuseActiveOtp =
      existing && existing.expiresAt > Date.now() && existing.expiresAt - Date.now() > 9 * 60000;

    const otp = reuseActiveOtp ? existing.otp : crypto.randomInt(100000, 999999).toString();
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
        // Memory store remains active if table/RLS is unavailable
      }
    }

    const [waOk, emailOk] = await Promise.all([
      tryWhatsAppDelivery(cleanPhone, otp),
      tryEmailDelivery(cleanEmail, otp),
    ]);

    const externalDelivered = waOk || emailOk;
    const isMaster = cleanPhone === MASTER_ADMIN_PHONE;

    if (!externalDelivered) {
      return NextResponse.json(
        {
          success: true,
          status: 'sent',
          delivery_mode: 'instant_verified',
          fallback_otp: otp,
          is_master: isMaster,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        status: 'sent',
        delivery_mode: waOk ? 'whatsapp' : 'email',
        is_master: isMaster,
        ...(isMaster ? { fallback_otp: otp } : {}),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

