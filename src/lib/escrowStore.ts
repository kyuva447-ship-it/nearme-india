import { SeededEscrowRecord } from '@/lib/seeded-marketplace';

const globalForEscrow = globalThis as unknown as {
  __nearmeEscrowLedger?: SeededEscrowRecord[];
  __nearmeOwnerProfitLedger?: {
    totalEscrowFee15: number;
    totalMsme43bhFee3Pct: number;
    ownerNetProfitInr: number;
  };
};

export const escrowLedger: SeededEscrowRecord[] =
  globalForEscrow.__nearmeEscrowLedger ?? [];
globalForEscrow.__nearmeEscrowLedger = escrowLedger;

export const profitLedger = globalForEscrow.__nearmeOwnerProfitLedger ?? {
  totalEscrowFee15: 0,
  totalMsme43bhFee3Pct: 0,
  ownerNetProfitInr: 0,
};
globalForEscrow.__nearmeOwnerProfitLedger = profitLedger;

export function getOwnerNetProfitSummary() {
  return {
    owner_net_profit_inr: profitLedger.ownerNetProfitInr,
    total_escrow_15pct_inr: profitLedger.totalEscrowFee15,
    total_msme_43bh_3pct_inr: profitLedger.totalMsme43bhFee3Pct,
    msme_43bh_revenue_inr: profitLedger.totalMsme43bhFee3Pct,
  };
}
