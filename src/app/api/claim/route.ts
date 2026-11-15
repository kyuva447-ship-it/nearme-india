import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { validateGstinMod36 } from '@/lib/seeded-marketplace';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = (searchParams.get('token') || '').trim();
    if (!token) {
      return NextResponse.json({ error: 'Missing claim token' }, { status: 400 });
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      return NextResponse.json({
        lead: {
          business_name: 'Verified Local Partner',
          city: 'Bengaluru',
          category: 'Local Services',
          status: 'scraped',
          claim_token: token,
        },
      });
    }

    const { data: lead, error } = await supabaseAdmin
      .from('outreach_leads')
      .select('id, business_name, phone, city, category, address, rating, status, claim_token, claimed_merchant_id')
      .eq('claim_token', token)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: 'Claim link invalid or expired' }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch {
    return NextResponse.json({ error: 'Failed to inspect claim token' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { token, businessName, phone, city, category, gstin } = await req.json();
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json({ error: 'Valid 10-digit Indian mobile number required' }, { status: 400 });
    }

    const cleanGstin = gstin ? String(gstin).trim().toUpperCase() : null;
    const mod36Valid = cleanGstin ? validateGstinMod36(cleanGstin).checksumValid : false;
    const merchantId = `m-${cleanPhone}`;

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      const { data: existingWallet } = await supabaseAdmin
        .from('merchant_wallets')
        .select('*')
        .eq('merchant_id', merchantId)
        .single();

      if (!existingWallet) {
        await supabaseAdmin.from('merchant_wallets').insert({
          merchant_id: merchantId,
          phone: cleanPhone,
          business_name: String(businessName || 'Verified NearMe Business'),
          city: String(city || 'Bengaluru'),
          category: String(category || 'Local Services'),
          gstin: cleanGstin,
          balance_inr: 0,
          free_leads_remaining: 2,
          trust_score: mod36Valid ? 96 : 88,
        });
      }

      if (token) {
        await supabaseAdmin
          .from('outreach_leads')
          .update({
            status: 'claimed',
            claimed_merchant_id: merchantId,
            claimed_at: new Date().toISOString(),
          })
          .eq('claim_token', String(token));
      }

      await supabaseAdmin.from('autopilot_logs').insert({
        agent_name: '1-Click Claim Engine',
        action_type: 'profile_claimed',
        target_city: String(city || 'Bengaluru'),
        summary: `${businessName || merchantId} claimed profile via token and received 2 FREE lead credits.`,
        status: 'success',
        revenue_generated_inr: 0,
      });
    }

    const res = NextResponse.json({
      status: 'claimed',
      merchant_id: merchantId,
      phone: cleanPhone,
      free_leads_remaining: 2,
    });
    const { signSessionToken } = await import('@/lib/session');
    res.cookies.set('nearme_session', signSessionToken(cleanPhone), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Failed to claim business profile' }, { status: 500 });
  }
}
