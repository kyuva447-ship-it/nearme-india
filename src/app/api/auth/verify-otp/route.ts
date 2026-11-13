import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { otpMemoryStore } from '@/lib/otpStore';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    let verified = false;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      try {
        const { data } = await supabaseAdmin
          .from('otp_verifications')
          .select('*')
          .eq('phone', phone)
          .eq('otp', otp)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (data) {
          verified = true;
          await supabaseAdmin.from('otp_verifications').delete().eq('phone', phone);
        }
      } catch {
        // Fall through to in-memory check
      }
    }

    if (!verified) {
      const memEntry = otpMemoryStore.get(phone);
      if (memEntry && memEntry.otp === otp && memEntry.expiresAt > Date.now()) {
        verified = true;
        otpMemoryStore.delete(phone);
      }
    }

    if (!verified) {
      return NextResponse.json({ error: 'Invalid or Expired OTP' }, { status: 401 });
    }

    // Set Secure HttpOnly Session
    cookies().set('nearme_session', phone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });

    return NextResponse.json({ status: 'verified' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
