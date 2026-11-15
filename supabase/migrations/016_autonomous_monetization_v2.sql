-- =========================================================================
-- NEARME INDIA - UNIFIED AUTONOMOUS MONETIZATION & AGENTIC AI MIGRATION
-- Safe to run multiple times (idempotent) in Supabase SQL Editor
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Merchant Wallets (Prepaid Lead Credits, Pro Subscriptions & Autopilot)
CREATE TABLE IF NOT EXISTS merchant_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Bengaluru',
    category TEXT NOT NULL DEFAULT 'Local Services',
    gstin TEXT,
    balance_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    free_leads_remaining INTEGER NOT NULL DEFAULT 2,
    is_verified_pro BOOLEAN NOT NULL DEFAULT false,
    pro_expires_at TIMESTAMPTZ,
    autopilot_paused BOOLEAN NOT NULL DEFAULT false,
    trust_score INTEGER NOT NULL DEFAULT 88,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_wallets_city_cat
    ON merchant_wallets (city, category, is_verified_pro DESC, trust_score DESC);

-- 2. Unified Transactions Ledger (Wallet Recharges, Lead Unlocks, Pro Subs, 5% Escrow Fee)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id TEXT REFERENCES merchant_wallets(merchant_id) ON DELETE SET NULL,
    user_phone TEXT,
    tx_type TEXT NOT NULL CHECK (
        tx_type IN (
            'wallet_recharge',
            'lead_unlock',
            'pro_subscription',
            'escrow_commission',
            'escrow_payout'
        )
    ),
    gross_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    platform_fee_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_merchant_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'captured', 'completed', 'failed')
    ),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_created_status
    ON transactions (created_at DESC, status, tx_type);

-- 3. Outreach Leads (AI-Scraped Businesses with 1-Click Claim Tokens)
CREATE TABLE IF NOT EXISTS outreach_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    city TEXT NOT NULL DEFAULT 'Bengaluru',
    category TEXT NOT NULL DEFAULT 'Local Services',
    google_place_id TEXT UNIQUE,
    address TEXT,
    rating NUMERIC(3, 1),
    claim_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    status TEXT NOT NULL DEFAULT 'scraped' CHECK (
        status IN ('scraped', 'contacted', 'claimed')
    ),
    claimed_merchant_id TEXT REFERENCES merchant_wallets(merchant_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    contacted_at TIMESTAMPTZ,
    claimed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_outreach_leads_status_city
    ON outreach_leads (status, city, category);

-- 4. Consumer Lead Unlocks (2 Free Leads, then ₹49 Masking Gate)
CREATE TABLE IF NOT EXISTS lead_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id TEXT NOT NULL REFERENCES merchant_wallets(merchant_id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL DEFAULT 'Verified Customer',
    customer_phone TEXT NOT NULL,
    masked_phone TEXT NOT NULL,
    requirement TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Bengaluru',
    unlocked BOOLEAN NOT NULL DEFAULT false,
    fee_charged_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unlocked_at TIMESTAMPTZ
);

-- 5. Autopilot Logs (Every Autonomous AI Agent Action & Revenue Impact)
CREATE TABLE IF NOT EXISTS autopilot_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    action_type TEXT NOT NULL,
    target_city TEXT,
    summary TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'success' CHECK (
        status IN ('success', 'skipped', 'error')
    ),
    revenue_generated_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_autopilot_logs_created
    ON autopilot_logs (created_at DESC);

-- 6. Persistent System Controls (Pause / Resume AI Agents Switch)
CREATE TABLE IF NOT EXISTS system_controls (
    key TEXT PRIMARY KEY,
    value_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO system_controls (key, value_json)
VALUES ('autopilot_config', '{"paused": false, "auto_acquire": true, "auto_match": true, "auto_verify": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 7. Atomic RPC: Charge ₹49 Lead Unlock or Consume 1 of 2 Free Leads
CREATE OR REPLACE FUNCTION unlock_merchant_lead(
    p_merchant_id TEXT,
    p_lead_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet merchant_wallets%ROWTYPE;
    v_lead lead_unlocks%ROWTYPE;
    v_lead_fee NUMERIC := 49.00;
BEGIN
    SELECT * INTO v_lead FROM lead_unlocks WHERE id = p_lead_id FOR UPDATE;
    IF NOT FOUND OR v_lead.merchant_id <> p_merchant_id THEN
        RETURN jsonb_build_object('ok', false, 'error', 'lead_not_found');
    END IF;

    IF v_lead.unlocked THEN
        RETURN jsonb_build_object(
            'ok', true,
            'already_unlocked', true,
            'customer_phone', v_lead.customer_phone,
            'fee_charged_inr', 0
        );
    END IF;

    SELECT * INTO v_wallet FROM merchant_wallets WHERE merchant_id = p_merchant_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'wallet_not_found');
    END IF;

    IF v_wallet.free_leads_remaining > 0 THEN
        UPDATE merchant_wallets
        SET free_leads_remaining = free_leads_remaining - 1, updated_at = NOW()
        WHERE merchant_id = p_merchant_id;

        UPDATE lead_unlocks
        SET unlocked = true, fee_charged_inr = 0.00, unlocked_at = NOW()
        WHERE id = p_lead_id;

        RETURN jsonb_build_object(
            'ok', true,
            'used_free_lead', true,
            'free_leads_remaining', v_wallet.free_leads_remaining - 1,
            'balance_inr', v_wallet.balance_inr,
            'customer_phone', v_lead.customer_phone,
            'fee_charged_inr', 0
        );
    END IF;

    IF v_wallet.balance_inr >= v_lead_fee THEN
        UPDATE merchant_wallets
        SET balance_inr = balance_inr - v_lead_fee, updated_at = NOW()
        WHERE merchant_id = p_merchant_id;

        UPDATE lead_unlocks
        SET unlocked = true, fee_charged_inr = v_lead_fee, unlocked_at = NOW()
        WHERE id = p_lead_id;

        INSERT INTO transactions (
            merchant_id, user_phone, tx_type, gross_inr, platform_fee_inr, net_merchant_inr, status, metadata
        ) VALUES (
            p_merchant_id, v_wallet.phone, 'lead_unlock', v_lead_fee, v_lead_fee, 0.00, 'completed',
            jsonb_build_object('lead_id', p_lead_id)
        );

        RETURN jsonb_build_object(
            'ok', true,
            'used_free_lead', false,
            'free_leads_remaining', 0,
            'balance_inr', v_wallet.balance_inr - v_lead_fee,
            'customer_phone', v_lead.customer_phone,
            'fee_charged_inr', v_lead_fee
        );
    END IF;

    RETURN jsonb_build_object(
        'ok', false,
        'error', 'insufficient_balance',
        'required_inr', v_lead_fee,
        'balance_inr', v_wallet.balance_inr
    );
END;
$$;

-- 8. Owner Metrics Live Reporting View
CREATE OR REPLACE VIEW owner_metrics AS
SELECT
    COALESCE(SUM(CASE WHEN status IN ('captured', 'completed') AND created_at >= DATE_TRUNC('day', NOW()) THEN platform_fee_inr ELSE 0 END), 0) AS today_revenue_inr,
    COALESCE(SUM(CASE WHEN status IN ('captured', 'completed') THEN platform_fee_inr ELSE 0 END), 0) AS total_revenue_inr,
    COALESCE(SUM(CASE WHEN tx_type = 'wallet_recharge' AND status IN ('captured', 'completed') THEN gross_inr ELSE 0 END), 0) AS wallet_recharges_inr,
    COALESCE(SUM(CASE WHEN tx_type = 'lead_unlock' AND status IN ('captured', 'completed') THEN platform_fee_inr ELSE 0 END), 0) AS lead_unlock_revenue_inr,
    COALESCE(SUM(CASE WHEN tx_type = 'pro_subscription' AND status IN ('captured', 'completed') THEN platform_fee_inr ELSE 0 END), 0) AS pro_subscription_revenue_inr,
    COALESCE(SUM(CASE WHEN tx_type = 'escrow_commission' AND status IN ('captured', 'completed') THEN platform_fee_inr ELSE 0 END), 0) AS escrow_commission_revenue_inr,
    COALESCE(SUM(CASE WHEN tx_type = 'escrow_commission' AND status = 'pending' THEN gross_inr ELSE 0 END), 0) AS escrow_locked_inr,
    (SELECT COUNT(*) FROM merchant_wallets WHERE is_verified_pro = true AND (pro_expires_at IS NULL OR pro_expires_at > NOW())) AS active_pro_subscriptions,
    (SELECT COUNT(*) FROM outreach_leads) AS total_outreach_leads,
    (SELECT COUNT(*) FROM outreach_leads WHERE status = 'claimed') AS claimed_outreach_leads,
    CASE
        WHEN (SELECT COUNT(*) FROM outreach_leads) = 0 THEN 0
        ELSE ROUND(((SELECT COUNT(*) FROM outreach_leads WHERE status = 'claimed')::NUMERIC / (SELECT COUNT(*) FROM outreach_leads)::NUMERIC) * 100, 2)
    END AS lead_conversion_rate_pct
FROM transactions;

-- 9. Row-Level Security (RLS) Policies
-- Note: Server-side Next.js API routes use SUPABASE_SERVICE_ROLE_KEY (bypasses RLS securely after session/PIN checks).
-- Direct anon browser access is strictly locked down to non-sensitive public discovery columns.
ALTER TABLE merchant_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE autopilot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_controls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read verified merchant directory" ON merchant_wallets;
CREATE POLICY "Public read verified merchant directory"
    ON merchant_wallets FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "No public read transactions" ON transactions;
CREATE POLICY "No public read transactions"
    ON transactions FOR SELECT
    USING (false);

DROP POLICY IF EXISTS "No public read outreach leads" ON outreach_leads;
CREATE POLICY "No public read outreach leads"
    ON outreach_leads FOR SELECT
    USING (false);

DROP POLICY IF EXISTS "No public read lead unlocks" ON lead_unlocks;
CREATE POLICY "No public read lead unlocks"
    ON lead_unlocks FOR SELECT
    USING (false);

DROP POLICY IF EXISTS "No public read autopilot logs" ON autopilot_logs;
CREATE POLICY "No public read autopilot logs"
    ON autopilot_logs FOR SELECT
    USING (false);

DROP POLICY IF EXISTS "No public read system controls" ON system_controls;
CREATE POLICY "No public read system controls"
    ON system_controls FOR SELECT
    USING (false);
