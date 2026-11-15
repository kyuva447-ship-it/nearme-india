import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, type, phone, metadata } = body;
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 1 || numericAmount > 500000) {
      return NextResponse.json(
        { error: 'Valid positive amount (INR 1 - 500,000) is required' },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(numericAmount * 100);
    const keyId = (
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      ''
    ).trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!keyId || !keySecret) {
      return NextResponse.json({ fallbackMode: true });
    }

    const orderPayload = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      payment_capture: 1,
      notes: {
        tx_type: String(type || 'wallet_recharge'),
        phone: String(phone || ''),
        ...(metadata && typeof metadata === 'object' ? metadata : {}),
      },
    };

    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await rzpResponse.json();

    if (!rzpResponse.ok || data.error) {
      return NextResponse.json({ fallbackMode: true });
    }

    // Record pending transaction in Supabase ledger when configured
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      const txType =
        type === 'pro_subscription' || type === 'subscription'
          ? 'pro_subscription'
          : type === 'lead_unlock'
            ? 'lead_unlock'
            : type === 'escrow'
              ? 'escrow_commission'
              : 'wallet_recharge';

      const platformFee =
        txType === 'escrow_commission' ? Math.round(numericAmount * 0.05) : numericAmount;
      const netMerchant = txType === 'escrow_commission' ? numericAmount - platformFee : 0;

      try {
        await supabaseAdmin.from('transactions').insert({
          merchant_id: metadata?.merchant_id ? String(metadata.merchant_id) : null,
          user_phone: phone ? String(phone) : null,
          tx_type: txType,
          gross_inr: numericAmount,
          platform_fee_inr: platformFee,
          net_merchant_inr: netMerchant,
          razorpay_order_id: data.id,
          status: 'pending',
          metadata: orderPayload.notes,
        });
      } catch {
        // Non-blocking audit log
      }
    }

    return NextResponse.json({
      order_id: data.id,
      amount: amountInPaise,
      currency: 'INR',
      key_id: keyId,
    });
  } catch {
    return NextResponse.json({ fallbackMode: true });
  }
}
