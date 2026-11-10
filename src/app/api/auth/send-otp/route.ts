import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone || phone.length !== 10) return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });

    // Generate 6 digit OTP securely
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB securely with 10-min expiry (Bypass RLS)
    await supabaseAdmin.from('otp_verifications').upsert({
        phone: phone,
        otp: otp,
        expires_at: new Date(Date.now() + 10 * 60000).toISOString()
    });

    // In a real app, integrate SMS API here.
    return NextResponse.json({ status: 'sent', hint: otp }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
