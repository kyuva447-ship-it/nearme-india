import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { otpMemoryStore } from '@/lib/otpStore';
import { signSessionToken } from '@/lib/session';

const MASTER_ADMIN_PHONE = '8247831885';

function timingSafeMatch(supplied: string, expected: string): boolean {
  if (!supplied || !expected) return false;
  const a = Buffer.from(supplied, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function getOwnerPin(): string {
  return (process.env.OWNER_PASSWORD || process.env.OWNER_PIN || '748599').trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPhone = String(body.phone || '').replace(/\D/g, '').slice(-10);
    const cleanOtp = String(body.otp || '').replace(/\D/g, '');
    const cleanPin = String(body.pin || '').trim();
    const displayName = String(body.name || '').trim();
    const expectedOwnerPin = getOwnerPin();

    const pinMatched =
      timingSafeMatch(cleanPin, expectedOwnerPin) ||
      timingSafeMatch(cleanPin, '748599') ||
      timingSafeMatch(cleanOtp, expectedOwnerPin) ||
      timingSafeMatch(cleanOtp, '748599');

    const isMasterPhone = rawPhone === MASTER_ADMIN_PHONE;

    const sessionPhone = /^[6-9]\d{9}$/.test(rawPhone)
      ? rawPhone
      : pinMatched
        ? MASTER_ADMIN_PHONE
        : '';

    if (!/^[6-9]\d{9}$/.test(sessionPhone)) {
      return NextResponse.json(
        { error: 'Valid 10-digit Indian mobile number or Owner PIN required' },
        { status: 400 }
      );
    }

    let verified = false;

    // Master Admin / Owner Bypass (Phone 8247831885 or Owner PIN 748599)
    if (pinMatched || isMasterPhone) {
      verified = true;
    }

    if (!verified && !/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json({ error: 'Valid 6-digit OTP required' }, { status: 400 });
    }

    const supabaseConfigured =
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL!.includes('placeholder');

    if (!verified && supabaseConfigured) {
      try {
        const { data } = await supabaseAdmin
          .from('otp_verifications')
          .select('*')
          .eq('phone', sessionPhone)
          .eq('otp', cleanOtp)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (data) {
          verified = true;
          await supabaseAdmin.from('otp_verifications').delete().eq('phone', sessionPhone);
        }
      } catch {
        // Fall through to in-memory store
      }
    }

    if (!verified) {
      const memEntry = otpMemoryStore.get(sessionPhone);
      if (memEntry && memEntry.otp === cleanOtp && memEntry.expiresAt > Date.now()) {
        verified = true;
        otpMemoryStore.delete(sessionPhone);
      }
    }

    if (!verified) {
      return NextResponse.json({ error: 'Invalid or Expired OTP' }, { status: 401 });
    }

    // Best-effort Supabase merchant/user record sync without ever throwing 500
    if (supabaseConfigured) {
      try {
        const merchantId = `m-${sessionPhone}`;
        const { data: existingWallet } = await supabaseAdmin
          .from('merchant_wallets')
          .select('merchant_id')
          .eq('merchant_id', merchantId)
          .maybeSingle();

        if (!existingWallet) {
          await supabaseAdmin.from('merchant_wallets').insert({
            merchant_id: merchantId,
            phone: sessionPhone,
            business_name: displayName || `NearMe User ${sessionPhone.slice(-4)}`,
            city: 'Bengaluru',
            category: 'Local Services',
            balance_inr: 0,
            free_leads_remaining: 2,
            trust_score: isMasterPhone || pinMatched ? 99 : 88,
          });
        }
      } catch {
        // Safe non-blocking fallback if schema differs
      }
    }

    const response = NextResponse.json(
      {
        success: true,
        status: 'verified',
        phone: sessionPhone,
        is_owner: isMasterPhone || pinMatched,
      },
      { status: 200 }
    );

    response.cookies.set('nearme_session', signSessionToken(sessionPhone), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}

