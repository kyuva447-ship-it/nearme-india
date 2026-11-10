-- =========================================================================
-- NEARME INDIA - MASTER SUPABASE SCHEMA (V11)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. OTP Verifications
CREATE TABLE IF NOT EXISTS otp_verifications (
    phone TEXT PRIMARY KEY,
    otp TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

-- 2. Pincode Clusters (Engine 2 Swarms)
CREATE TABLE IF NOT EXISTS pincode_clusters (
    pincode TEXT PRIMARY KEY,
    city TEXT,
    district TEXT,
    state TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    active_nodes INTEGER DEFAULT 0
);

-- 3. Reverse Bounties (Engine 1)
CREATE TABLE IF NOT EXISTS reverse_bounties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_phone TEXT,
    pincode TEXT,
    language TEXT,
    voice_query TEXT,
    category TEXT,
    item_title TEXT,
    target_price_inr NUMERIC,
    lowest_bid_inr NUMERIC,
    winning_merchant_id UUID,
    swarm_pool_id UUID,
    status TEXT DEFAULT 'active',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Swarm Pools (Engine 2)
CREATE TABLE IF NOT EXISTS swarm_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_slug TEXT,
    item_title TEXT,
    category TEXT,
    retail_price_inr NUMERIC,
    swarm_price_inr NUMERIC,
    current_buyers_count INTEGER DEFAULT 0,
    target_buyers_count INTEGER DEFAULT 100,
    total_locked_value_inr NUMERIC DEFAULT 0,
    closes_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bill Audit Scans (Engine 3)
CREATE TABLE IF NOT EXISTS bill_audit_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pincode TEXT,
    bill_type TEXT,
    original_amount_inr NUMERIC,
    ai_audited_fair_price_inr NUMERIC,
    counter_offer_price_inr NUMERIC,
    user_savings_inr NUMERIC,
    platform_success_fee_inr NUMERIC,
    winning_provider_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Expiring Slots Ticker (Engine 4)
CREATE TABLE IF NOT EXISTS expiring_slots_ticker (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID,
    pincode TEXT,
    title TEXT,
    sector TEXT,
    original_price_inr NUMERIC,
    current_live_price_inr NUMERIC,
    floor_price_inr NUMERIC,
    drop_pct_per_min NUMERIC,
    expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Spawned Mini Apps (Engine 5)
CREATE TABLE IF NOT EXISTS spawned_mini_apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    owner_phone TEXT,
    pincode TEXT,
    app_name TEXT,
    category TEXT,
    schema_json JSONB DEFAULT '{}',
    commission_pct NUMERIC DEFAULT 1.5,
    total_volume_inr NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Merchant Autopilot Nodes (Engine 6)
CREATE TABLE IF NOT EXISTS merchant_autopilot_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT,
    phone TEXT UNIQUE NOT NULL,
    pincode TEXT,
    category TEXT,
    floor_margin_pct NUMERIC DEFAULT 15.0,
    auto_bid_active BOOLEAN DEFAULT true,
    plan_tier TEXT DEFAULT 'PRO_1999',
    razorpay_account_id TEXT,
    kyc_verified BOOLEAN DEFAULT false,
    payout_upi_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Autonomous Treasury Ledger (Global Tracker & Webhooks)
CREATE TABLE IF NOT EXISTS autonomous_treasury_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_phone TEXT,
    engine_source TEXT,
    gross_inr NUMERIC,
    net_platform_profit_inr NUMERIC,
    merchant_payout_inr NUMERIC,
    razorpay_order_id TEXT UNIQUE,
    status TEXT DEFAULT 'PENDING',
    recovery_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- RLS POLICIES (Required for V2 security)
-- =========================================================================

ALTER TABLE reverse_bounties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reverse bounties" ON reverse_bounties FOR SELECT USING (true);
CREATE POLICY "Users update own bounties" ON reverse_bounties FOR UPDATE USING (auth.uid()::text = user_phone);

ALTER TABLE swarm_pools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read swarm pools" ON swarm_pools FOR SELECT USING (true);

ALTER TABLE expiring_slots_ticker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read expiring slots" ON expiring_slots_ticker FOR SELECT USING (true);

ALTER TABLE spawned_mini_apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read spawned apps" ON spawned_mini_apps FOR SELECT USING (true);

ALTER TABLE merchant_autopilot_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Merchants read own nodes" ON merchant_autopilot_nodes FOR SELECT USING (auth.uid()::text = phone);
CREATE POLICY "Merchants update own nodes" ON merchant_autopilot_nodes FOR UPDATE USING (auth.uid()::text = phone);

ALTER TABLE autonomous_treasury_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own treasury" ON autonomous_treasury_ledger FOR SELECT USING (auth.uid()::text = user_phone);

ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
