export interface OrderRecord {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  customerIdentifier?: string;
  itemName?: string;
  created_at: number;
}

export interface AuditLedgerRecord {
  id: string;
  billType: string;
  city: string;
  totalPages: number;
  originalAmountInr: number;
  fairAmountInr: number;
  savingsInr: number;
  auditFeeInr: number;
  unlockCode: string;
  customerIdentifier?: string;
  createdAt: string;
}

const globalForOrders = globalThis as unknown as {
  __nearmeOrdersLedger?: OrderRecord[];
  __nearmeAuditLedger?: AuditLedgerRecord[];
};

export const ordersLedger: OrderRecord[] =
  globalForOrders.__nearmeOrdersLedger ?? [];
globalForOrders.__nearmeOrdersLedger = ordersLedger;

export const auditLedger: AuditLedgerRecord[] =
  globalForOrders.__nearmeAuditLedger ?? [];
globalForOrders.__nearmeAuditLedger = auditLedger;

export function recordOrderEntry(entry: OrderRecord): OrderRecord {
  const existingIdx = ordersLedger.findIndex((o) => o.id === entry.id);
  if (existingIdx >= 0) {
    ordersLedger[existingIdx] = entry;
  } else {
    ordersLedger.unshift(entry);
    if (ordersLedger.length > 100) ordersLedger.pop();
  }
  return entry;
}

export function recordAuditEntry(
  params: Omit<AuditLedgerRecord, 'id' | 'unlockCode' | 'createdAt'>
): AuditLedgerRecord {
  const rec: AuditLedgerRecord = {
    id: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
    unlockCode: `UNLOCK-${params.totalPages}P-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    ...params,
  };
  auditLedger.unshift(rec);
  if (auditLedger.length > 100) auditLedger.pop();
  return rec;
}
