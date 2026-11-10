ALTER TABLE autonomous_treasury_ledger ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';
ALTER TABLE autonomous_treasury_ledger ADD COLUMN IF NOT EXISTS user_phone TEXT;
ALTER TABLE autonomous_treasury_ledger ADD COLUMN IF NOT EXISTS recovery_sent BOOLEAN DEFAULT false;

ALTER TABLE merchant_autopilot_nodes ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT false;
ALTER TABLE merchant_autopilot_nodes ADD COLUMN IF NOT EXISTS payout_upi_id TEXT;
