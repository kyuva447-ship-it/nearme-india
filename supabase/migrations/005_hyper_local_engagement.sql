-- Migration 005: Hyper-Local Engagement Features

-- 1. Hyper-Local Flash Deals Engine & 2. Live Ping
ALTER TABLE v2_merchants
ADD COLUMN IF NOT EXISTS current_deal_text TEXT,
ADD COLUMN IF NOT EXISTS deal_expiry_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_currently_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS community_upvotes INTEGER DEFAULT 0;
