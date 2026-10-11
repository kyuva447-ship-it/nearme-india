-- Project V2: Dual-Engine B2B & B2C Architecture Migration

-- Ensure PostGIS is enabled for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. USERS (Unified Identity)
CREATE TABLE IF NOT EXISTS v2_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT UNIQUE NOT NULL,
    full_name TEXT,
    persona TEXT DEFAULT 'CONSUMER' CHECK (persona IN ('CONSUMER', 'B2B_BUYER', 'MERCHANT')),
    location GEOGRAPHY(POINT),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. MERCHANTS (Unified Seller Profile)
CREATE TABLE IF NOT EXISTS v2_merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES v2_users(id),
    business_name TEXT NOT NULL,
    category TEXT NOT NULL,
    is_b2b_capable BOOLEAN DEFAULT false,
    wallet_balance NUMERIC DEFAULT 0.00,
    surge_multiplier NUMERIC DEFAULT 1.0,
    is_gold_pin_active BOOLEAN DEFAULT false,
    gold_pin_expiry TIMESTAMPTZ,
    location GEOGRAPHY(POINT),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. B2C LEADS (Consumer Commerce Engine)
CREATE TABLE IF NOT EXISTS v2_b2c_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID REFERENCES v2_users(id),
    merchant_id UUID REFERENCES v2_merchants(id),
    lead_fee_charged NUMERIC DEFAULT 10.00,
    whatsapp_context TEXT,
    status TEXT DEFAULT 'DELIVERED' CHECK (status IN ('DELIVERED', 'MISSED_INSUFFICIENT_FUNDS')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. B2B PROCUREMENT RFQs (High-Margin Engine)
CREATE TABLE IF NOT EXISTS v2_b2b_rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES v2_users(id),
    title TEXT NOT NULL,
    target_budget NUMERIC,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'BIDDING_CLOSED', 'AWARDED')),
    location GEOGRAPHY(POINT),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. B2B BIDS (Monetization Engine)
CREATE TABLE IF NOT EXISTS v2_b2b_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES v2_b2b_rfqs(id),
    merchant_id UUID REFERENCES v2_merchants(id),
    unlock_fee_charged NUMERIC,
    bid_amount NUMERIC,
    status TEXT DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'ACCEPTED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Wallet Auto-Deduction Function (RPC)
CREATE OR REPLACE FUNCTION deduct_v2_wallet(merchant_uuid UUID, amount NUMERIC)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance NUMERIC;
BEGIN
    SELECT wallet_balance INTO current_balance FROM v2_merchants WHERE id = merchant_uuid FOR UPDATE;
    IF current_balance >= amount THEN
        UPDATE v2_merchants SET wallet_balance = wallet_balance - amount WHERE id = merchant_uuid;
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up Row Level Security (RLS) for Admin Dashboard
ALTER TABLE v2_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_b2c_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_b2b_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_b2b_bids ENABLE ROW LEVEL SECURITY;

-- Allow public reads for some demo purposes, but restricted writes
CREATE POLICY "Public profiles are viewable by everyone." ON v2_merchants FOR SELECT USING (true);
CREATE POLICY "Public rfqs are viewable by everyone." ON v2_b2b_rfqs FOR SELECT USING (status = 'OPEN');
