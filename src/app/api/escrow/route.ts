import { NextResponse } from 'next/server';
import { SeededEscrowRecord } from '@/lib/seeded-marketplace';
import {
  escrowLedger,
  profitLedger,
  getOwnerNetProfitSummary,
} from '@/lib/escrowStore';
import { recordAgentExecution } from '@/lib/autonomousStore';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getVerifiedSessionPhone } from '@/lib/session';

const ESCROW_PLATFORM_FEE_RATE = 0.05; // 5% automated platform fee

export async function GET() {
  const sanitizedEscrows = escrowLedger.map(({ delivery_otp: _hiddenOtp, ...rest }) => rest);
  return NextResponse.json({
    status: 'ok',
    splitPolicy:
      '5% Escrow Platform Commission / 95% Merchant Direct Settlement (+ Optional 3% MSME 43B(h) Day-1 Fee)',
    refundGuaranteeHours: 48,
    ...getOwnerNetProfitSummary(),
    escrows: sanitizedEscrows,
  });
}

export async function POST(req: Request) {
  try {
    const {
      buyerName,
      merchantName,
      totalAmountInr,
      msme43bhDiscounting,
      action,
      escrowId,
      otp,
    } = await req.json();

    if (action === 'release' && escrowId) {
      const target = escrowLedger.find((e) => e.id === escrowId);
      if (!target) {
        return NextResponse.json({ error: 'Escrow ID not found' }, { status: 404 });
      }
      if (!otp || String(otp).trim() !== target.delivery_otp) {
        return NextResponse.json(
          { error: 'Valid 6-digit Delivery OTP is strictly required' },
          { status: 400 }
        );
      }

      target.status = 'RELEASED_TO_MERCHANT';
      recordAgentExecution(
        'agent-dutch-escrow',
        `Released 95% payout (₹${target.merchant_payout_85_inr.toLocaleString('en-IN')}) after 5% escrow commission (₹${target.platform_fee_15_inr.toLocaleString('en-IN')}) for ${target.id}`,
        target.owner_net_profit_inr
      );

      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
      ) {
        try {
          await supabaseAdmin
            .from('transactions')
            .update({ status: 'completed' })
            .eq('razorpay_order_id', target.id);

          await supabaseAdmin.from('autopilot_logs').insert({
            agent_name: 'Escrow 5% Commission Agent',
            action_type: 'escrow_commission',
            summary: `Released escrow ${target.id}; collected 5% fee (₹${target.owner_net_profit_inr})`,
            status: 'success',
            revenue_generated_inr: target.owner_net_profit_inr,
          });
        } catch {
          // Non-blocking DB sync
        }
      }

      const { delivery_otp: _hidden, ...safeEscrow } = target;
      return NextResponse.json({
        status: 'released',
        escrow: safeEscrow,
        ...getOwnerNetProfitSummary(),
      });
    }

    if (action === 'refund' && escrowId) {
      const sessionPhone = getVerifiedSessionPhone();
      const target = escrowLedger.find((e) => e.id === escrowId);
      if (!target) {
        return NextResponse.json({ error: 'Escrow ID not found' }, { status: 404 });
      }
      if (sessionPhone && !target.buyer_name.includes(sessionPhone) && !target.id) {
        return NextResponse.json({ error: 'Unauthorized refund request' }, { status: 403 });
      }

      target.status = 'REFUNDED_48HR_GUARANTEE';
      recordAgentExecution(
        'agent-dutch-escrow',
        `Executed 48h Refund Guarantee on ${target.id}`,
        0
      );

      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
      ) {
        try {
          await supabaseAdmin
            .from('transactions')
            .update({ status: 'failed' })
            .eq('razorpay_order_id', target.id);
        } catch {
          // Non-blocking DB sync
        }
      }

      const { delivery_otp: _hidden, ...safeEscrow } = target;
      return NextResponse.json({ status: 'refunded', escrow: safeEscrow });
    }

    const total = Number(totalAmountInr);
    if (!Number.isFinite(total) || total < 100) {
      return NextResponse.json(
        { error: 'Minimum escrow amount is ₹100' },
        { status: 400 }
      );
    }

    const fee5Pct = Math.round(total * ESCROW_PLATFORM_FEE_RATE);
    const msmeEnabled = Boolean(msme43bhDiscounting);
    const msmeFee3Pct = msmeEnabled ? Math.round(total * 0.03) : 0;
    const merchantPayout = total - fee5Pct - msmeFee3Pct;
    const ownerProfit = fee5Pct + msmeFee3Pct;
    const deliveryOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const record: SeededEscrowRecord = {
      id: `ESC-IND-${Math.floor(1000 + Math.random() * 9000)}`,
      buyer_name: buyerName || 'On-Site Buyer',
      merchant_name: merchantName || 'NearMe Partner Node',
      total_amount_inr: total,
      platform_fee_15_inr: fee5Pct,
      merchant_payout_85_inr: merchantPayout,
      msme_43bh_enabled: msmeEnabled,
      msme_43bh_fee_3pct_inr: msmeFee3Pct,
      owner_net_profit_inr: ownerProfit,
      delivery_otp: deliveryOtp,
      refund_guarantee_hours: 48,
      status: 'ESCROW_LOCKED_15_85',
      created_at: new Date().toISOString(),
    };

    escrowLedger.unshift(record);
    profitLedger.totalEscrowFee15 += fee5Pct;
    profitLedger.totalMsme43bhFee3Pct += msmeFee3Pct;
    profitLedger.ownerNetProfitInr += ownerProfit;

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      try {
        await supabaseAdmin.from('transactions').insert({
          user_phone: buyerName ? String(buyerName) : null,
          tx_type: 'escrow_commission',
          gross_inr: total,
          platform_fee_inr: ownerProfit,
          net_merchant_inr: merchantPayout,
          razorpay_order_id: record.id,
          status: 'pending',
          metadata: {
            merchant_name: record.merchant_name,
            platform_fee_rate: '5%',
            msme_43bh: msmeEnabled,
          },
        });
      } catch {
        // Non-blocking DB sync
      }
    }

    recordAgentExecution(
      'agent-dutch-escrow',
      `Locked 5% Commission Escrow ${record.id} for ₹${total.toLocaleString('en-IN')}`,
      0
    );

    return NextResponse.json(
      {
        status: 'created',
        escrow: record,
        platformFeeRatePct: 5,
        ...getOwnerNetProfitSummary(),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to process escrow request' }, { status: 400 });
  }
}
