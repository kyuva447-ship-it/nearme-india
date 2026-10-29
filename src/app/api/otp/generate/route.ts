import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-key'
);

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });

    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 mins

    // Upsert OTP
    await supabase.from('free_otps').upsert({
      phone_number: phone,
      otp_code: otp,
      expires_at: expiresAt
    });

    // In a real app, send via MSG91. Here we simulate for zero cost.
    console.log(`[DEV ONLY] OTP for ${phone} is ${otp}`);

    return NextResponse.json({ success: true, mock_otp: otp }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
