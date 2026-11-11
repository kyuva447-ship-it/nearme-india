import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    const { data } = await supabaseAdmin
        .from('otp_verifications')
        .select('*')
        .eq('phone', phone)
        .eq('otp', otp)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (!data) {
        return NextResponse.json({ error: 'Invalid or Expired OTP' }, { status: 401 });
    }

    // Clear OTP
    await supabaseAdmin.from('otp_verifications').delete().eq('phone', phone);

    // Set Secure HttpOnly Session
    cookies().set('nearme_session', phone, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
    });

    return NextResponse.json({ status: 'verified' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
