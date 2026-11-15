import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const LEAD_UNLOCK_FEE_INR = 49;

function maskPhoneNumber(rawPhone: string): string {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (digits.length < 4) return '+91 98XXXXXX00';
  const last10 = digits.slice(-10);
  return `+91 ${last10.slice(0, 2)}XXXXXX${last10.slice(-2)}`;
}

// Fetch merchant's lead inbox (masked unless unlocked or free lead used)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = (searchParams.get('merchantId') || '').trim();
    const phone = (searchParams.get('phone') || '').replace(/\D/g, '');

    if (!merchantId && !phone) {
      return NextResponse.json({ error: 'merchantId or phone required' }, { status: 400 });
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      return NextResponse.json({
        wallet: {
          merchant_id: merchantId || 'demo-merchant',
          balance_inr: 0,
          free_leads_remaining: 2,
          is_verified_pro: false,
        },
        leads: [],
      });
    }

    const walletQuery = merchantId
      ? supabaseAdmin.from('merchant_wallets').select('*').eq('merchant_id', merchantId).single()
      : supabaseAdmin.from('merchant_wallets').select('*').eq('phone', phone).single();

    const { data: wallet } = await walletQuery;
    if (!wallet) {
      return NextResponse.json({ wallet: null, leads: [] });
    }

    const { data: rawLeads } = await supabaseAdmin
      .from('lead_unlocks')
      .select('*')
      .eq('merchant_id', wallet.merchant_id)
      .order('created_at', { ascending: false })
      .limit(20);

    const safeLeads = (rawLeads || []).map((lead) => ({
      id: lead.id,
      customer_name: lead.customer_name,
      requirement: lead.requirement,
      city: lead.city,
      unlocked: Boolean(lead.unlocked),
      display_phone: lead.unlocked ? lead.customer_phone : lead.masked_phone,
      fee_charged_inr: lead.fee_charged_inr,
      created_at: lead.created_at,
    }));

    return NextResponse.json({ wallet, leads: safeLeads });
  } catch {
    return NextResponse.json({ error: 'Failed to load leads' }, { status: 500 });
  }
}

// Unlock a customer phone number: uses 2 free leads first, then deducts ₹49 from wallet (or creates Razorpay order)
export async function POST(req: Request) {
  try {
    const { merchantId, leadId } = await req.json();
    if (!merchantId || !leadId) {
      return NextResponse.json({ error: 'merchantId and leadId are required' }, { status: 400 });
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      return NextResponse.json(
        { error: 'Supabase configuration required for persistent lead unlock' },
        { status: 503 }
      );
    }

    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('unlock_merchant_lead', {
      p_merchant_id: String(merchantId),
      p_lead_id: String(leadId),
    });

    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    if (rpcResult?.ok) {
      await supabaseAdmin.from('autopilot_logs').insert({
        agent_name: 'Pay-to-Unlock Lead Engine',
        action_type: 'lead_unlock',
        summary: rpcResult.used_free_lead
          ? `Merchant ${merchantId} unlocked lead ${leadId} via free credit (${rpcResult.free_leads_remaining} free left)`
          : `Merchant ${merchantId} unlocked lead ${leadId} for ₹${LEAD_UNLOCK_FEE_INR}`,
        status: 'success',
        revenue_generated_inr: Number(rpcResult.fee_charged_inr || 0),
        metadata: { merchant_id: merchantId, lead_id: leadId },
      });

      return NextResponse.json({
        status: 'unlocked',
        ...rpcResult,
      });
    }

    // Wallet has < ₹49 and 0 free leads left -> notify UI to initiate tracked Razorpay checkout
    if (rpcResult?.error === 'insufficient_balance') {
      return NextResponse.json(
        {
          status: 'payment_required',
          required_inr: LEAD_UNLOCK_FEE_INR,
          balance_inr: Number(rpcResult.balance_inr || 0),
        },
        { status: 402 }
      );
    }

    return NextResponse.json({ error: rpcResult?.error || 'Could not unlock lead' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Lead unlock failed' }, { status: 500 });
  }
}
