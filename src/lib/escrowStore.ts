import { SEEDED_ESCROWS, SeededEscrowRecord } from '@/lib/seeded-marketplace';

const globalForEscrow = globalThis as unknown as {
  __nearmeEscrowLedger?: SeededEscrowRecord[];
  __nearmeOwnerProfitLedger?: {
    totalEscrowFee15: number;
    totalMsme43bhFee3Pct: number;
    ownerNetProfitInr: number;
  };
};

export const escrowLedger: SeededEscrowRecord[] =
  globalForEscrow.__nearmeEscrowLedger ?? [...SEEDED_ESCROWS];
globalForEscrow.__nearmeEscrowLedger = escrowLedger;

const initialProfit = escrowLedger.reduce(
  (acc, item) => ({
    totalEscrowFee15: acc.totalEscrowFee15 + item.platform_fee_15_inr,
    totalMsme43bhFee3Pct: acc.totalMsme43bhFee3Pct + item.msme_43bh_fee_3pct_inr,
    ownerNetProfitInr: acc.ownerNetProfitInr + item.owner_net_profit_inr,
  }),
  { totalEscrowFee15: 0, totalMsme43bhFee3Pct: 0, ownerNetProfitInr: 0 }
);

export const profitLedger = globalForEscrow.__nearmeOwnerProfitLedger ?? initialProfit;
globalForEscrow.__nearmeOwnerProfitLedger = profitLedger;

export function getOwnerNetProfitSummary() {
  return {
    owner_net_profit_inr: profitLedger.ownerNetProfitInr,
    total_escrow_15pct_inr: profitLedger.totalEscrowFee15,
    total_msme_43bh_3pct_inr: profitLedger.totalMsme43bhFee3Pct,
    msme_43bh_revenue_inr: profitLedger.totalMsme43bhFee3Pct,
  };
}
