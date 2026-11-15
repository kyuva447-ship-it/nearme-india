import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { otpMemoryStore } from '@/lib/otpStore';
import { signSessionToken } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const cleanOtp = String(otp || '').replace(/\D/g, '');

    if (!/^[6-9]\d{9}$/.test(cleanPhone) || !/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json({ error: 'Valid 10-digit phone and 6-digit OTP required' }, { status: 400 });
    }

    let verified = false;

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      try {
        const { data } = await supabaseAdmin
          .from('otp_verifications')
          .select('*')
          .eq('phone', cleanPhone)
          .eq('otp', cleanOtp)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (data) {
          verified = true;
          await supabaseAdmin.from('otp_verifications').delete().eq('phone', cleanPhone);
        }
      } catch {
        // Fall through to in-memory check
      }
    }

    if (!verified) {
      const memEntry = otpMemoryStore.get(cleanPhone);
      if (memEntry && memEntry.otp === cleanOtp && memEntry.expiresAt > Date.now()) {
        verified = true;
        otpMemoryStore.delete(cleanPhone);
      }
    }

    if (!verified) {
      return NextResponse.json({ error: 'Invalid or Expired OTP' }, { status: 401 });
    }

    cookies().set('nearme_session', signSessionToken(cleanPhone), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.json({ status: 'verified', phone: cleanPhone }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
