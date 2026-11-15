import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const PRO_PLAN_PRICE_INR = 299;

export async function POST(req: Request) {
  try {
    const { merchantId, phone, businessName, city, category } = await req.json();
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const resolvedMerchantId = String(merchantId || (cleanPhone ? `m-${cleanPhone}` : '')).trim();

    if (!resolvedMerchantId) {
      return NextResponse.json({ error: 'merchantId or phone is required' }, { status: 400 });
    }

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      await supabaseAdmin.from('merchant_wallets').upsert(
        {
          merchant_id: resolvedMerchantId,
          phone: cleanPhone || resolvedMerchantId,
          business_name: String(businessName || 'Verified NearMe Partner'),
          city: String(city || 'Bengaluru'),
          category: String(category || 'Local Services'),
        },
        { onConflict: 'merchant_id' }
      );
    }

    const keyId = (
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      ''
    ).trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!keyId || !keySecret) {
      return NextResponse.json({ fallbackMode: true, amount: PRO_PLAN_PRICE_INR });
    }

    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: PRO_PLAN_PRICE_INR * 100,
        currency: 'INR',
        receipt: `pro299_${Date.now()}`,
        notes: {
          tx_type: 'pro_subscription',
          merchant_id: resolvedMerchantId,
          phone: cleanPhone,
          plan: 'VERIFIED_PRO_299',
        },
      }),
    });

    const order = await rzpRes.json();
    if (!rzpRes.ok || !order.id) {
      return NextResponse.json({ fallbackMode: true, amount: PRO_PLAN_PRICE_INR });
    }

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      await supabaseAdmin.from('transactions').insert({
        merchant_id: resolvedMerchantId,
        user_phone: cleanPhone || null,
        tx_type: 'pro_subscription',
        gross_inr: PRO_PLAN_PRICE_INR,
        platform_fee_inr: PRO_PLAN_PRICE_INR,
        net_merchant_inr: 0,
        razorpay_order_id: order.id,
        status: 'pending',
        metadata: { plan: 'VERIFIED_PRO_299' },
      });
    }

    return NextResponse.json({
      order_id: order.id,
      amount: PRO_PLAN_PRICE_INR * 100,
      amountInRupees: PRO_PLAN_PRICE_INR,
      currency: 'INR',
      key_id: keyId,
      merchant_id: resolvedMerchantId,
    });
  } catch {
    return NextResponse.json({ error: 'Could not initialize Pro subscription' }, { status: 500 });
  }
}
