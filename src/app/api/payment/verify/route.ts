import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      actionType,
      amountInRupees,
      phone,
      metadata,
    } = body;

    const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    if (!secret || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { verified: false, error: 'Missing signature or Razorpay secret' },
        { status: 400 }
      );
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(String(razorpay_signature), 'utf8');

    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return NextResponse.json(
        { verified: false, error: 'Invalid Razorpay signature' },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    const numericAmount = Number(amountInRupees || 0);

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      const { data: existingTx } = await supabaseAdmin
        .from('transactions')
        .select('id, status')
        .eq('razorpay_order_id', String(razorpay_order_id))
        .single();

      // Strictly idempotent: if webhook or prior verify already captured this order, return ok without double-crediting
      if (existingTx?.status === 'captured' || existingTx?.status === 'completed') {
        return NextResponse.json({
          verified: true,
          alreadyProcessed: true,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
        });
      }

      let didTransitionToCaptured = false;
      if (existingTx) {
        const { data: transitioned } = await supabaseAdmin
          .from('transactions')
          .update({ status: 'captured', razorpay_payment_id: String(razorpay_payment_id) })
          .eq('razorpay_order_id', String(razorpay_order_id))
          .eq('status', 'pending')
          .select('id')
          .single();
        didTransitionToCaptured = Boolean(transitioned);
      } else {
        const txType =
          actionType === 'pro_subscription' || actionType === 'subscription'
            ? 'pro_subscription'
            : actionType === 'lead_unlock'
              ? 'lead_unlock'
              : actionType === 'escrow'
                ? 'escrow_commission'
                : 'wallet_recharge';
        const fee =
          txType === 'escrow_commission' ? Math.round(numericAmount * 0.05) : numericAmount;
        const { error: insErr } = await supabaseAdmin.from('transactions').insert({
          merchant_id: metadata?.merchant_id ? String(metadata.merchant_id) : null,
          user_phone: cleanPhone || null,
          tx_type: txType,
          gross_inr: numericAmount,
          platform_fee_inr: fee,
          net_merchant_inr: txType === 'escrow_commission' ? numericAmount - fee : 0,
          razorpay_order_id: String(razorpay_order_id),
          razorpay_payment_id: String(razorpay_payment_id),
          status: 'captured',
          metadata: metadata && typeof metadata === 'object' ? metadata : {},
        });
        didTransitionToCaptured = !insErr;
      }

      if (didTransitionToCaptured) {
        const merchantId = metadata?.merchant_id ? String(metadata.merchant_id) : null;

        if (actionType === 'wallet_recharge' && numericAmount > 0 && (merchantId || cleanPhone)) {
          const query = merchantId
            ? supabaseAdmin.from('merchant_wallets').select('*').eq('merchant_id', merchantId).single()
            : supabaseAdmin.from('merchant_wallets').select('*').eq('phone', cleanPhone).single();

          const { data: wallet } = await query;
          if (wallet) {
            await supabaseAdmin
              .from('merchant_wallets')
              .update({
                balance_inr: Number(wallet.balance_inr || 0) + numericAmount,
                updated_at: new Date().toISOString(),
              })
              .eq('merchant_id', wallet.merchant_id);
          }
        }

        if (
          (actionType === 'pro_subscription' || actionType === 'subscription') &&
          (merchantId || cleanPhone)
        ) {
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          const matchCol = merchantId ? 'merchant_id' : 'phone';
          const matchVal = merchantId || cleanPhone;
          await supabaseAdmin
            .from('merchant_wallets')
            .update({
              is_verified_pro: true,
              pro_expires_at: expiresAt,
              updated_at: new Date().toISOString(),
            })
            .eq(matchCol, matchVal);
        }

        if (actionType === 'lead_unlock' && metadata?.lead_id) {
          await supabaseAdmin
            .from('lead_unlocks')
            .update({
              unlocked: true,
              fee_charged_inr: numericAmount || 49,
              unlocked_at: new Date().toISOString(),
            })
            .eq('id', String(metadata.lead_id));
        }

        await supabaseAdmin.from('autopilot_logs').insert({
          agent_name: 'Razorpay Checkout Verifier',
          action_type: String(actionType || 'payment_verified'),
          summary: `Verified Razorpay payment ${razorpay_payment_id} for ₹${numericAmount}`,
          status: 'success',
          revenue_generated_inr: numericAmount,
          metadata: { razorpay_order_id, razorpay_payment_id },
        });
      }
    }

    return NextResponse.json({
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
    });
  } catch {
    return NextResponse.json(
      { verified: false, error: 'Payment verification error' },
      { status: 500 }
    );
  }
}
