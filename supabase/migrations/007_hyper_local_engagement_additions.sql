-- Migration 007: Hyper-Local Engagement Features Additions

-- Ensure columns exist in v2_merchants
ALTER TABLE v2_merchants
ADD COLUMN IF NOT EXISTS current_deal_text TEXT,
ADD COLUMN IF NOT EXISTS deal_expiry_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_currently_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS community_upvotes INTEGER DEFAULT 0;

-- Ensure columns exist in sellers table as fallback
ALTER TABLE sellers
ADD COLUMN IF NOT EXISTS current_deal_text TEXT,
ADD COLUMN IF NOT EXISTS deal_expiry_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_currently_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS community_upvotes INTEGER DEFAULT 0;
