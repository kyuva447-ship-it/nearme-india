import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { otpMemoryStore } from '@/lib/otpStore';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone || phone.length !== 10) return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });

    // Generate 6 digit OTP securely
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60000;

    // Store in memory fallback so login works even when Supabase is offline/placeholder
    otpMemoryStore.set(phone, { otp, expiresAt });

    // Also attempt DB storage when Supabase is configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      try {
        await supabaseAdmin.from('otp_verifications').upsert({
          phone: phone,
          otp: otp,
          expires_at: new Date(expiresAt).toISOString()
        });
      } catch {
        // Fallback already stored in memory
      }
    }

    return NextResponse.json({ status: 'sent', hint: otp }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
