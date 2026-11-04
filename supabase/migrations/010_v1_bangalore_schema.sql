-- 1. V1 FULL ADVANCED SCHEMA - BANGALORE FOCUSED

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS V1
CREATE TABLE IF NOT EXISTS users_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    phone TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'owner', 'customer')) DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SHOPS V1
CREATE TABLE IF NOT EXISTS shops_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users_v1(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    trust_score INTEGER CHECK (trust_score >= 0 AND trust_score <= 100) DEFAULT 0,
    trust_dna JSONB DEFAULT '{}',
    mood TEXT DEFAULT 'Fresh stock',
    live_video_url TEXT,
    coins INTEGER DEFAULT 0,
    premium_plan TEXT CHECK (premium_plan IN ('basic', 'pro', 'enterprise', 'enterprise_plus')) DEFAULT 'basic',
    business_hours JSONB DEFAULT '{}',
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    image_urls TEXT[],
    video_urls TEXT[],
    delivery_available BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMPTZ,
    city TEXT DEFAULT 'Bangalore',
    pincode TEXT CHECK (pincode ~ '^560[0-1][0-9]{2}$'), -- Basic check for Bangalore pincodes
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS V1
CREATE TABLE IF NOT EXISTS products_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops_v1(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC CHECK (price > 1) NOT NULL, -- Amount not 1 rupee
    discount NUMERIC DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    image_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS V1
CREATE TABLE IF NOT EXISTS orders_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users_v1(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops_v1(id) ON DELETE CASCADE,
    amount NUMERIC CHECK (amount > 1) NOT NULL, -- Amount not 1 rupee
    commission NUMERIC DEFAULT 10.0, -- 10% auto
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS V1
CREATE TABLE IF NOT EXISTS payments_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders_v1(id) ON DELETE CASCADE,
    razorpay_id TEXT UNIQUE,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    razorpay_key TEXT NOT NULL, -- To enforce LIVE keys
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EARNINGS V1
CREATE TABLE IF NOT EXISTS earnings_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops_v1(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('verification', 'premium', 'coins', 'ad', 'loan', 'commission')) NOT NULL,
    amount NUMERIC NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS V1
CREATE TABLE IF NOT EXISTS reviews_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops_v1(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users_v1(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    voice_review_url TEXT, -- Kannada/Hindi/English
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEARCH LOGS V1
CREATE TABLE IF NOT EXISTS search_logs_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL,
    ai_response TEXT,
    language TEXT DEFAULT 'English',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEO PAGES V1
CREATE TABLE IF NOT EXISTS seo_pages_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city TEXT DEFAULT 'Bangalore',
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPORTING TABLES V1
CREATE TABLE IF NOT EXISTS notifications_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users_v1(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlists_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users_v1(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products_v1(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users_v1(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products_v1(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_amount NUMERIC NOT NULL,
    valid_until TIMESTAMPTZ,
    shop_id UUID REFERENCES shops_v1(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cities_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    state TEXT DEFAULT 'Karnataka',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trust_dna_logs_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops_v1(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    score_change INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_streams_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops_v1(id) ON DELETE CASCADE,
    stream_url TEXT NOT NULL,
    viewer_count INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS coins_transactions_v1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users_v1(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops_v1(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT CHECK (type IN ('earned', 'spent')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
