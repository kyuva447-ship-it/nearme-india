import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();

    if (!webhookSecret || !signature) {
      return NextResponse.json(
        { error: 'Missing webhook configuration or signature' },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const receivedBuf = Buffer.from(signature, 'utf8');
    if (
      expectedBuf.length !== receivedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
      const paymentData = payload?.payload?.payment?.entity;
      const orderId = paymentData?.order_id || payload?.payload?.order?.entity?.id;
      const paymentId = paymentData?.id;
      const notes = paymentData?.notes || {};
      const amountInr = Math.round(Number(paymentData?.amount || 0) / 100);

      if (!orderId) {
        return NextResponse.json({ status: 'ignored', reason: 'missing order_id' }, { status: 200 });
      }

      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
      ) {
        const { data: existingTx } = await supabaseAdmin
          .from('transactions')
          .select('id, status')
          .eq('razorpay_order_id', String(orderId))
          .single();

        if (existingTx?.status === 'captured' || existingTx?.status === 'completed') {
          return NextResponse.json({ status: 'ok', message: 'already processed' }, { status: 200 });
        }

        let didTransition = false;
        if (existingTx) {
          const { data: updated } = await supabaseAdmin
            .from('transactions')
            .update({
              status: 'captured',
              razorpay_payment_id: paymentId || null,
            })
            .eq('razorpay_order_id', String(orderId))
            .eq('status', 'pending')
            .select('id')
            .single();
          didTransition = Boolean(updated);
        } else {
          const txType =
            notes.tx_type === 'pro_subscription' ||
            notes.tx_type === 'lead_unlock' ||
            notes.tx_type === 'escrow_commission' ||
            notes.tx_type === 'escrow_payout'
              ? notes.tx_type
              : 'wallet_recharge';

          const { error: insErr } = await supabaseAdmin.from('transactions').insert({
            razorpay_order_id: String(orderId),
            razorpay_payment_id: paymentId || null,
            merchant_id: notes.merchant_id ? String(notes.merchant_id) : null,
            user_phone: notes.phone || paymentData?.contact || null,
            tx_type: txType,
            gross_inr: amountInr,
            platform_fee_inr:
              txType === 'escrow_commission' ? Math.round(amountInr * 0.05) : amountInr,
            net_merchant_inr:
              txType === 'escrow_commission' ? Math.round(amountInr * 0.95) : 0,
            status: 'captured',
            metadata: notes,
          });
          didTransition = !insErr;
        }

        if (didTransition) {
          if (notes.tx_type === 'wallet_recharge' && notes.merchant_id && amountInr > 0) {
            const { data: wallet } = await supabaseAdmin
              .from('merchant_wallets')
              .select('balance_inr')
              .eq('merchant_id', String(notes.merchant_id))
              .single();

            if (wallet) {
              await supabaseAdmin
                .from('merchant_wallets')
                .update({
                  balance_inr: Number(wallet.balance_inr || 0) + amountInr,
                  updated_at: new Date().toISOString(),
                })
                .eq('merchant_id', String(notes.merchant_id));
            }
          }

          if (notes.tx_type === 'pro_subscription' && notes.merchant_id) {
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            await supabaseAdmin
              .from('merchant_wallets')
              .update({
                is_verified_pro: true,
                pro_expires_at: expiresAt,
                updated_at: new Date().toISOString(),
              })
              .eq('merchant_id', String(notes.merchant_id));
          }

          if (notes.tx_type === 'lead_unlock' && notes.lead_id) {
            await supabaseAdmin
              .from('lead_unlocks')
              .update({
                unlocked: true,
                fee_charged_inr: amountInr || 49,
                unlocked_at: new Date().toISOString(),
              })
              .eq('id', String(notes.lead_id));
          }

          await supabaseAdmin
            .from('autonomous_treasury_ledger')
            .update({ status: 'PAID' })
            .eq('razorpay_order_id', String(orderId));
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
