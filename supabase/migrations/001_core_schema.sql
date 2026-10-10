-- Enable PostGIS for location-based search
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Sellers Table
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    industry TEXT,
    whatsapp_number TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    wallet_balance NUMERIC DEFAULT 15.00,
    is_available BOOLEAN DEFAULT true,

    -- Keeping original fields for App.jsx compatibility, fallback aliases mapping could be used if necessary
    name TEXT,
    phone TEXT,
    business_type TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    current_deal_text TEXT,
    deal_expiry_time TIMESTAMPTZ,
    is_currently_available BOOLEAN DEFAULT true,
    community_upvotes INTEGER DEFAULT 0,

    -- Viral Marketing & Zero-Touch Onboarding
    is_claimed BOOLEAN DEFAULT true,
    profile_views INTEGER DEFAULT 0,
    qr_scans INTEGER DEFAULT 0,
    referral_code TEXT,
    referred_by UUID REFERENCES sellers(id),

    created_at TIMESTAMPTZ DEFAULT now()
);

-- Sync fields if they are missing
CREATE OR REPLACE FUNCTION sync_seller_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.name IS NOT NULL AND NEW.business_name IS NULL THEN
        NEW.business_name := NEW.name;
    ELSIF NEW.business_name IS NOT NULL AND NEW.name IS NULL THEN
        NEW.name := NEW.business_name;
    END IF;

    IF NEW.phone IS NOT NULL AND NEW.whatsapp_number IS NULL THEN
        NEW.whatsapp_number := NEW.phone;
    ELSIF NEW.whatsapp_number IS NOT NULL AND NEW.phone IS NULL THEN
        NEW.phone := NEW.whatsapp_number;
    END IF;

    IF NEW.is_currently_available IS NOT NULL AND NEW.is_available IS NULL THEN
        NEW.is_available := NEW.is_currently_available;
    ELSIF NEW.is_available IS NOT NULL AND NEW.is_currently_available IS NULL THEN
        NEW.is_currently_available := NEW.is_available;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_seller_fields
BEFORE INSERT OR UPDATE ON sellers
FOR EACH ROW
EXECUTE FUNCTION sync_seller_fields();


-- Add PostGIS geometry column for spatial indexing (EPSG:4326 is WGS 84 / GPS)
SELECT AddGeometryColumn('public', 'sellers', 'location', 4326, 'POINT', 2);

-- Trigger to automatically update the 'location' geometry column when lat/lng change
CREATE OR REPLACE FUNCTION update_seller_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.longitude IS NOT NULL AND NEW.latitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_seller_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON sellers
FOR EACH ROW
EXECUTE FUNCTION update_seller_location();

-- Spatial indexing for fast radius searches
CREATE INDEX idx_sellers_location ON sellers USING GIST (location);

-- 2. Wallet Transactions Table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    razorpay_payment_id TEXT,
    status TEXT DEFAULT 'success',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. B2B Jobs Table (For the high-ticket AI Broker logic)
CREATE TABLE b2b_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT,
    industry_target TEXT,
    budget_range TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RPC Stored Function to securely deduct lead fee
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
