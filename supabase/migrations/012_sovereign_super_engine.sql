-- 2. V2 SOVEREIGN SUPER ENGINE SCHEMA

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PINCODE CLUSTERS
CREATE TABLE IF NOT EXISTS pincode_clusters (
    pincode TEXT PRIMARY KEY,
    city TEXT,
    district TEXT,
    state TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    active_nodes INTEGER DEFAULT 0
);

-- 2. REVERSE BOUNTIES (Engine 1 - 60s Price Wars)
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

-- 3. SWARM POOLS (Engine 2 - Group-Buy Power Pools)
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

-- 4. BILL AUDIT SCANS (Engine 3 - Camera Bill Slasher)
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

-- 5. EXPIRING SLOTS TICKER (Engine 4 - Dead-Time Exchange)
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

-- 6. SPAWNED MINI APPS (Engine 5 - 4-Sec App Spawner)
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

-- 7. MERCHANT AUTOPILOT NODES
CREATE TABLE IF NOT EXISTS merchant_autopilot_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT,
    phone TEXT,
    pincode TEXT,
    category TEXT,
    floor_margin_pct NUMERIC DEFAULT 15.0,
    auto_bid_active BOOLEAN DEFAULT true,
    plan_tier TEXT DEFAULT 'PRO_1999',
    razorpay_account_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AUTONOMOUS TREASURY LEDGER
CREATE TABLE IF NOT EXISTS autonomous_treasury_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engine_source TEXT,
    gross_inr NUMERIC,
    net_platform_profit_inr NUMERIC,
    merchant_payout_inr NUMERIC,
    razorpay_order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seeding some initial data

INSERT INTO pincode_clusters (pincode, city, district, state, lat, lng, active_nodes) VALUES
('517501', 'Tirupati', 'Chittoor', 'Andhra Pradesh', 13.6288, 79.4192, 120),
('517325', 'Madanapalle', 'Annamayya', 'Andhra Pradesh', 13.5517, 78.5020, 45),
('560001', 'Bengaluru', 'Bengaluru Urban', 'Karnataka', 12.9716, 77.5946, 500),
('500001', 'Hyderabad', 'Hyderabad', 'Telangana', 17.3850, 78.4867, 400),
('600001', 'Chennai', 'Chennai', 'Tamil Nadu', 13.0827, 80.2707, 350),
('400001', 'Mumbai', 'Mumbai City', 'Maharashtra', 18.9220, 72.8347, 600),
('110001', 'Delhi', 'New Delhi', 'Delhi', 28.6139, 77.2090, 550)
ON CONFLICT (pincode) DO NOTHING;

INSERT INTO merchant_autopilot_nodes (business_name, phone, pincode, category, auto_bid_active) VALUES
('Sri Venkateswara Electronics', '+919999900001', '517501', 'Electronics', true),
('Madanapalle Wholesalers', '+919999900002', '517325', 'Grocery', true),
('Bengaluru Tech Hub', '+919999900003', '560001', 'IT', true),
('Hyderabad Health Connect', '+919999900004', '500001', 'Healthcare', true),
('Chennai Auto Parts', '+919999900005', '600001', 'Automotive', true),
('Mumbai Financial Services', '+919999900006', '400001', 'Finance', true),
('Delhi Wholesale Traders', '+919999900007', '110001', 'Wholesale', true);
