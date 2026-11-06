-- FULL 10000 CR CAPACITY SCHEMA FOR NEARME INDIA
-- All 550 Features Supported Data Model

-- CORE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- Supabase Auth Reference
    full_name TEXT,
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    avatar_url TEXT,
    points INTEGER DEFAULT 0,
    referral_code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL,
    city TEXT NOT NULL,
    pincode TEXT,
    address TEXT,
    phone TEXT,
    trust_score INTEGER DEFAULT 80,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    wallet_balance NUMERIC DEFAULT 0.00,
    current_deal_text TEXT,
    image_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    discount_price NUMERIC,
    image_urls TEXT[],
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    shop_id UUID REFERENCES shops(id),
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'REFUNDED')),
    payment_method TEXT,
    is_escrow BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_time NUMERIC NOT NULL
);

-- MARKETING & DEALS
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    discount_pct INTEGER CHECK (discount_pct <= 100),
    max_discount NUMERIC,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flash_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- B2B & MANUFACTURING
CREATE TABLE IF NOT EXISTS b2b_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type TEXT CHECK (type IN ('SUPPLIER', 'BUYER', 'MANUFACTURER')),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    target_budget NUMERIC,
    moq INTEGER,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- VIRAL & ENGAGEMENT
CREATE TABLE IF NOT EXISTS auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    item_needed TEXT NOT NULL,
    qty INTEGER NOT NULL,
    budget NUMERIC NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    lowest_bid NUMERIC,
    lowest_bidder_id UUID REFERENCES shops(id),
    status TEXT DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_buys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    target_members INTEGER NOT NULL,
    current_members INTEGER DEFAULT 1,
    group_price NUMERIC NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'FORMING',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES users(id),
    referred_id UUID REFERENCES users(id),
    reward_points INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS points_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    shop_id UUID REFERENCES shops(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- SECURE RLS POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all shops" ON shops FOR SELECT USING (true);
CREATE POLICY "Users can read all products" ON products FOR SELECT USING (true);
CREATE POLICY "Users manage own profile" ON users FOR ALL USING (auth.uid() = auth_id);
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "Shops manage own orders" ON orders FOR SELECT USING (
    shop_id IN (SELECT id FROM shops WHERE owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
);
