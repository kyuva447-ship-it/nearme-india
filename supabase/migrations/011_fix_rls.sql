-- SECURE V1 RLS POLICIES FOR BANGALORE

-- Enable RLS on all V1 tables
ALTER TABLE users_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_dna_logs_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE coins_transactions_v1 ENABLE ROW LEVEL SECURITY;

-- 1. Users V1: Users can only read and update their own data
CREATE POLICY "Users can view own profile" ON users_v1 FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users_v1 FOR UPDATE USING (auth.uid() = id);

-- 2. Shops V1: Anyone can read active shops. Owners can manage their shops.
CREATE POLICY "Anyone can view active shops" ON shops_v1 FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can manage own shops" ON shops_v1 FOR ALL USING (auth.uid() = owner_id);

-- 3. Products V1: Anyone can read products. Shop owners can manage products.
CREATE POLICY "Anyone can view products" ON products_v1 FOR SELECT USING (true);
CREATE POLICY "Shop owners can manage products" ON products_v1 FOR ALL USING (
    EXISTS (SELECT 1 FROM shops_v1 WHERE shops_v1.id = products_v1.shop_id AND shops_v1.owner_id = auth.uid())
);

-- 4. Orders V1: Users can see their orders. Shop owners can see orders for their shop.
CREATE POLICY "Users can view own orders" ON orders_v1 FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Shop owners can view shop orders" ON orders_v1 FOR SELECT USING (
    EXISTS (SELECT 1 FROM shops_v1 WHERE shops_v1.id = orders_v1.shop_id AND shops_v1.owner_id = auth.uid())
);
CREATE POLICY "Users can insert orders" ON orders_v1 FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Payments V1: Users and shop owners can view relevant payments.
CREATE POLICY "Users can view own payments" ON payments_v1 FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders_v1 WHERE orders_v1.id = payments_v1.order_id AND orders_v1.user_id = auth.uid())
);

-- Fix insecure Wallet RPC
CREATE OR REPLACE FUNCTION deduct_v2_wallet(p_seller_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance NUMERIC;
    v_fee NUMERIC := 3.00; -- Fixed server-side fee
BEGIN
    SELECT wallet_balance INTO v_balance FROM sellers WHERE id = p_seller_id FOR UPDATE;

    IF v_balance >= v_fee THEN
        UPDATE sellers SET wallet_balance = wallet_balance - v_fee WHERE id = p_seller_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;
