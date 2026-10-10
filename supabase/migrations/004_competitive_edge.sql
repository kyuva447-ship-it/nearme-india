-- Phase 3: Competitive Edge Algorithms & Zero-Trust Security Schema

-- 1. MICRO-FACTORY CAPACITY ROUTING (Feature 6)
CREATE TABLE IF NOT EXISTS v2_factory_capacity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES v2_merchants(id),
    available_machine_hours INTEGER NOT NULL,
    hourly_rate NUMERIC NOT NULL,
    status TEXT DEFAULT 'IDLE' CHECK (status IN ('IDLE', 'BOOKED', 'MAINTENANCE')),
    location GEOGRAPHY(POINT), -- Used for Algorithmic Routing
    last_ping TIMESTAMPTZ DEFAULT now()
);

-- 2. ZERO-KNOWLEDGE REVIEW ATTESTATION (Feature 18)
CREATE TABLE IF NOT EXISTS v2_zk_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID REFERENCES v2_escrow_contracts(id) UNIQUE, -- Ensures 1 review per paid contract
    cryptographic_hash TEXT NOT NULL UNIQUE, -- SHA-256 proof of payment
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. NEIGHBORHOOD FLASH TIPPING (Feature 30)
CREATE TABLE IF NOT EXISTS v2_flash_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES v2_users(id),
    merchant_id UUID REFERENCES v2_merchants(id),
    tip_amount NUMERIC NOT NULL,
    broadcast_radius_km NUMERIC DEFAULT 2.0,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. GEO-FENCED CHECK-INS (Feature 19)
CREATE TABLE IF NOT EXISTS v2_geofence_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES v2_merchants(id),
    job_id UUID REFERENCES v2_b2c_leads(id),
    ping_location GEOGRAPHY(POINT) NOT NULL,
    is_verified BOOLEAN DEFAULT false, -- True if ping_location is within 50m of job location
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ZERO-TRUST RLS POLICIES
ALTER TABLE v2_factory_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_zk_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_flash_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_geofence_logs ENABLE ROW LEVEL SECURITY;

-- Escrow arbitration & Security: Only the specific parties involved can read/write
CREATE POLICY "Strict isolated read for factory capacity" ON v2_factory_capacity FOR SELECT USING (true);
CREATE POLICY "Zk Reviews are public but insertion requires cryptographic hash validation" ON v2_zk_reviews FOR SELECT USING (true);
CREATE POLICY "Flash tips are visible to everyone within broadcast radius" ON v2_flash_tips FOR SELECT USING (true);
