-- Phase 2: Enterprise Profit & Viral Loop Schema Expansion

-- 1. B2B ESCROW POOLS (High Margin FinTech Engine)
CREATE TABLE IF NOT EXISTS v2_escrow_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES v2_users(id),
    merchant_id UUID REFERENCES v2_merchants(id),
    rfq_id UUID REFERENCES v2_b2b_rfqs(id),
    contract_value NUMERIC NOT NULL,
    platform_fee_held NUMERIC NOT NULL, -- Our profit margin (e.g. 2-5%)
    status TEXT DEFAULT 'FUNDS_LOCKED' CHECK (status IN ('PENDING', 'FUNDS_LOCKED', 'DISPUTED', 'RELEASED_TO_MERCHANT')),
    iot_delivery_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. INVOICE FACTORING (B2B Capital Lending)
CREATE TABLE IF NOT EXISTS v2_invoice_factoring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES v2_merchants(id),
    escrow_id UUID REFERENCES v2_escrow_contracts(id),
    invoice_amount NUMERIC NOT NULL,
    instant_cash_offer NUMERIC NOT NULL, -- Discounted rate for instant liquidity
    financier_id UUID, -- Third party bank or platform funds
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PURCHASED', 'SETTLED')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. AFFILIATE & VIRAL LOOPS (Zero-CAC Engine)
CREATE TABLE IF NOT EXISTS v2_affiliate_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES v2_users(id), -- The promoter
    merchant_id UUID REFERENCES v2_merchants(id), -- The business being promoted
    unique_slug TEXT UNIQUE NOT NULL,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    commission_earned NUMERIC DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. BLIND REVERSE AUCTIONS
CREATE TABLE IF NOT EXISTS v2_blind_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES v2_b2b_rfqs(id),
    merchant_id UUID REFERENCES v2_merchants(id),
    encrypted_bid_amount TEXT NOT NULL, -- Cryptographically hidden until auction ends
    unlock_fee_paid NUMERIC NOT NULL, -- Instant revenue for the platform
    status TEXT DEFAULT 'LOCKED' CHECK (status IN ('LOCKED', 'REVEALED', 'WON')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE v2_escrow_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_invoice_factoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_blind_bids ENABLE ROW LEVEL SECURITY;
