-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Sellers Table
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    business_type TEXT NOT NULL, -- e.g., 'Retail', 'Manufacturer', 'Broker', 'Service'
    category TEXT NOT NULL, -- e.g., 'Tailoring & Garments', 'Plumbing', 'Real Estate'
    tags TEXT[] DEFAULT '{}',
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    wallet_balance NUMERIC(10, 2) DEFAULT 15.00,
    current_deal_text TEXT,
    deal_expiry TIMESTAMPTZ,
    is_currently_available BOOLEAN DEFAULT true,
    community_upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add PostGIS geometry column for spatial indexing (EPSG:4326 is WGS 84 / GPS)
SELECT AddGeometryColumn('public', 'sellers', 'location', 4326, 'POINT', 2);

-- Trigger to automatically update the 'location' geometry column when lat/lng change
CREATE OR REPLACE FUNCTION update_seller_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_seller_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON sellers
FOR EACH ROW
EXECUTE FUNCTION update_seller_location();

-- Spatial indexing for fast radius searches
CREATE INDEX idx_sellers_location ON sellers USING GIST (location);


-- 2. Wallet Recharges Table
CREATE TABLE wallet_recharges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    razorpay_payment_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);


-- 3. Custom Jobs Table (for B2B / High-ticket requirements)
CREATE TABLE custom_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    industry TEXT NOT NULL,
    budget_range TEXT,
    buyer_contact TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- 4. Secure RPC Stored Functions
-- Deduct lead fee securely
CREATE OR REPLACE FUNCTION deduct_lead_fee(p_seller_id UUID, p_amount NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance NUMERIC;
BEGIN
    -- Check current balance
    SELECT wallet_balance INTO v_balance FROM sellers WHERE id = p_seller_id FOR UPDATE;

    IF v_balance >= p_amount THEN
        -- Deduct amount
        UPDATE sellers SET wallet_balance = wallet_balance - p_amount WHERE id = p_seller_id;
        RETURN TRUE;
    ELSE
        -- Insufficient balance
        RETURN FALSE;
    END IF;
END;
$$;

-- Top-up wallet and record recharge
CREATE OR REPLACE FUNCTION top_up_wallet(p_seller_id UUID, p_amount NUMERIC, p_payment_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert recharge record
    INSERT INTO wallet_recharges (seller_id, amount, razorpay_payment_id, status)
    VALUES (p_seller_id, p_amount, p_payment_id, 'completed');

    -- Update seller balance
    UPDATE sellers SET wallet_balance = wallet_balance + p_amount WHERE id = p_seller_id;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;
