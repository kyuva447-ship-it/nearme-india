import { NextResponse } from 'next/server';
import { SeededEscrowRecord } from '@/lib/seeded-marketplace';
import {
  escrowLedger,
  profitLedger,
  getOwnerNetProfitSummary,
} from '@/lib/escrowStore';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    splitPolicy: '15% Platform Success Escrow / 85% Merchant Direct Settlement + Optional 3% MSME 43B(h) Day-1 Fee',
    refundGuaranteeHours: 48,
    ...getOwnerNetProfitSummary(),
    escrows: escrowLedger,
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
      if (otp && String(otp) !== target.delivery_otp) {
        return NextResponse.json({ error: 'Invalid Delivery OTP' }, { status: 400 });
      }
      target.status = 'RELEASED_TO_MERCHANT';
      return NextResponse.json({ status: 'released', escrow: target, ...getOwnerNetProfitSummary() });
    }

    if (action === 'refund' && escrowId) {
      const target = escrowLedger.find((e) => e.id === escrowId);
      if (!target) {
        return NextResponse.json({ error: 'Escrow ID not found' }, { status: 404 });
      }
      target.status = 'REFUNDED_48HR_GUARANTEE';
      return NextResponse.json({ status: 'refunded', escrow: target });
    }

    const total = Math.max(100, Number(totalAmountInr) || 10000);
    const fee15 = Math.round(total * 0.15);
    const msmeEnabled = Boolean(msme43bhDiscounting);
    const msmeFee3Pct = msmeEnabled ? Math.round(total * 0.03) : 0;
    const payout85 = total - fee15 - msmeFee3Pct;
    const ownerProfit = fee15 + msmeFee3Pct;

    const record: SeededEscrowRecord = {
      id: `ESC-IND-${Math.floor(1000 + Math.random() * 9000)}`,
      buyer_name: buyerName || 'Verified Buyer',
      merchant_name: merchantName || 'NearMe Partner Node',
      total_amount_inr: total,
      platform_fee_15_inr: fee15,
      merchant_payout_85_inr: payout85,
      msme_43bh_enabled: msmeEnabled,
      msme_43bh_fee_3pct_inr: msmeFee3Pct,
      owner_net_profit_inr: ownerProfit,
      delivery_otp: Math.floor(100000 + Math.random() * 900000).toString(),
      refund_guarantee_hours: 48,
      status: 'ESCROW_LOCKED_15_85',
      created_at: new Date().toISOString(),
    };

    escrowLedger.unshift(record);
    profitLedger.totalEscrowFee15 += fee15;
    profitLedger.totalMsme43bhFee3Pct += msmeFee3Pct;
    profitLedger.ownerNetProfitInr += ownerProfit;

    return NextResponse.json(
      {
        status: 'created',
        escrow: record,
        ...getOwnerNetProfitSummary(),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to process escrow request' }, { status: 400 });
  }
}
