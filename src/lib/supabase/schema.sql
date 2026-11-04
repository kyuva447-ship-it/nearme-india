-- COMPLETE SCHEMA FOR NEARME INDIA V2
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS merchants (
  id uuid primary key default uuid_generate_v4(),
  business_name text not null,
  category text not null,
  phone text unique not null,
  wallet_balance numeric default 0,
  trust_score int default 50,
  rating numeric,
  community_upvotes int default 0,
  is_currently_available bool default false,
  is_gold_pin_active bool default false,
  is_verified bool default false,
  verification_status text,
  latitude float,
  longitude float,
  pincode text,
  address text,
  owner_name text,
  email text,
  subscription_plan text default 'free',
  referral_code text unique,
  streak_count int default 0,
  last_login timestamp,
  total_leads int default 0,
  total_earnings numeric default 0,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS consumers (
  id uuid primary key default uuid_generate_v4(),
  phone text unique not null,
  name text,
  city text,
  pincode text,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS v2_b2c_leads (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid references merchants(id),
  consumer_phone text,
  consumer_name text,
  query text,
  lead_fee_charged numeric default 3.00,
  whatsapp_context text,
  status text check (status in ('new','accepted','completed','cancelled')) default 'new',
  distance float,
  has_active_deal bool,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS v2_razorpay_events (
  id uuid primary key default uuid_generate_v4(),
  razorpay_payment_id text unique not null,
  event_type text,
  amount numeric,
  notes jsonb,
  merchant_id uuid references merchants(id),
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS free_otps (
  phone_number text primary key,
  otp_code text,
  expires_at timestamp,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS escrow (
  id uuid primary key default uuid_generate_v4(),
  customer_id text,
  customer_phone text,
  merchant_id uuid references merchants(id),
  amount numeric,
  fee numeric,
  status text check (status in ('locked','released','cancelled','disputed')) default 'locked',
  qr_code text unique,
  razorpay_payment_id text,
  created_at timestamp default now(),
  released_at timestamp,
  dispute_reason text
);

CREATE TABLE IF NOT EXISTS referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid,
  referee_id uuid,
  referrer_type text check (referrer_type in ('merchant','consumer')),
  code text not null,
  credit_amount numeric default 50,
  status text check (status in ('pending','redeemed','expired')) default 'pending',
  created_at timestamp default now(),
  redeemed_at timestamp,
  unique(code)
);

CREATE TABLE IF NOT EXISTS staking (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid references merchants(id),
  pincode text,
  amount numeric default 5000,
  start_date timestamp default now(),
  expiry_date timestamp,
  is_active bool default true,
  top_slot_position int
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id text,
  user_type text check (user_type in ('merchant','consumer')),
  subject text,
  message text,
  status text check (status in ('open','in_progress','closed')) default 'open',
  priority text,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS merchant_streaks (
  merchant_id uuid primary key references merchants(id),
  streak_count int default 0,
  last_lead_date date,
  max_streak int default 0
);

CREATE TABLE IF NOT EXISTS reels (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid references merchants(id),
  video_url text not null,
  thumbnail_url text,
  title text,
  views int default 0,
  likes int default 0,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS verification_photos (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid references merchants(id),
  photo_url text not null,
  geotag_lat float,
  geotag_lng float,
  timestamp timestamp default now(),
  status text check (status in ('pending','approved','rejected')) default 'pending',
  reviewed_by text
);

CREATE TABLE IF NOT EXISTS community_escrow (
  id uuid primary key default uuid_generate_v4(),
  society_name text not null,
  address text,
  total_amount numeric,
  collected_amount numeric default 0,
  members int,
  per_member_amount numeric,
  purpose text check (purpose in ('guard','sweeper','other')),
  status text check (status in ('collecting','active','completed')) default 'collecting',
  created_by text,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS ad_pins (
  id uuid primary key default uuid_generate_v4(),
  brand_name text not null,
  brand_logo_url text,
  pincode text,
  radius_km int default 5,
  amount_per_day numeric default 500,
  ad_image_url text,
  ad_link text,
  is_active bool default false,
  start_date timestamp,
  end_date timestamp,
  clicks int default 0,
  impressions int default 0,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS bargain_requests (
  id uuid primary key default uuid_generate_v4(),
  customer_id text,
  customer_phone text not null,
  category text not null,
  budget numeric not null,
  description text,
  latitude float,
  longitude float,
  pincode text,
  status text check (status in ('open','accepted','countered','closed')) default 'open',
  counter_offers jsonb,
  accepted_merchant_id uuid references merchants(id),
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text,
  phone text,
  message text,
  status text check (status in ('new','read','replied')) default 'new',
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS merchant_locations (
  merchant_id uuid primary key references merchants(id),
  latitude float not null,
  longitude float not null,
  accuracy float,
  updated_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id text,
  user_type text check (user_type in ('merchant','consumer')),
  title text,
  message text,
  type text check (type in ('lead','escrow','staking','referral','support')),
  is_read bool default false,
  link text,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  discount_type text check (discount_type in ('percent','fixed')),
  discount_value numeric not null,
  min_amount numeric,
  max_discount numeric,
  usage_limit int,
  used_count int default 0,
  valid_from timestamp,
  valid_to timestamp,
  is_active bool default true
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid primary key default uuid_generate_v4(),
  customer_id text,
  merchant_id uuid references merchants(id),
  service_id uuid,
  date date,
  time_slot text,
  amount numeric,
  status text check (status in ('pending','confirmed','completed','cancelled')) default 'pending',
  escrow_id uuid references escrow(id),
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid references merchants(id),
  customer_id text,
  customer_phone_hash text,
  rating int check (rating between 1 and 5),
  comment text,
  is_verified_transaction bool default false,
  zk_proof_hash text,
  created_at timestamp default now(),
  reply text
);

CREATE TABLE IF NOT EXISTS merchant_services (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid references merchants(id),
  name text not null,
  category text,
  price numeric not null,
  description text,
  image_url text,
  is_active bool default true
);

CREATE TABLE IF NOT EXISTS merchant_hours (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid references merchants(id),
  day_of_week int check (day_of_week between 0 and 6),
  open_time time,
  close_time time,
  is_closed bool default false
);

CREATE TABLE IF NOT EXISTS merchant_analytics (
  merchant_id uuid references merchants(id),
  date date,
  leads_count int default 0,
  revenue numeric default 0,
  views int default 0,
  conversion_rate float default 0,
  primary key (merchant_id, date)
);

-- RPCs
CREATE OR REPLACE FUNCTION deduct_v2_wallet(merchant_uuid uuid, amount numeric)
RETURNS boolean AS $$
DECLARE
  current_balance numeric;
BEGIN
  SELECT wallet_balance INTO current_balance FROM merchants WHERE id = merchant_uuid FOR UPDATE;
  IF current_balance >= amount THEN
    UPDATE merchants SET wallet_balance = wallet_balance - amount WHERE id = merchant_uuid;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION stake_top_slot(merchant_uuid uuid, target_pincode text, stake_amount numeric)
RETURNS boolean AS $$
BEGIN
  INSERT INTO staking (merchant_id, pincode, amount, expiry_date)
  VALUES (merchant_uuid, target_pincode, stake_amount, now() + interval '30 days');
  UPDATE merchants SET is_gold_pin_active = true WHERE id = merchant_uuid;
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION release_escrow(escrow_uuid uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE escrow SET status = 'released', released_at = now() WHERE id = escrow_uuid AND status = 'locked';
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generate_referral_code(merchant_uuid uuid)
RETURNS text AS $$
DECLARE
  new_code text;
BEGIN
  new_code := 'NEARME-' || substr(md5(random()::text), 1, 6);
  UPDATE merchants SET referral_code = new_code WHERE id = merchant_uuid;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_trust_score(merchant_uuid uuid)
RETURNS int AS $$
DECLARE
  upvotes int;
  disputes int;
  total_escrow int;
  resp_time int := 15; -- mock
  is_verif bool;
  final_score numeric := 50;
  dispute_rate numeric := 0;
BEGIN
  SELECT community_upvotes, is_verified INTO upvotes, is_verif FROM merchants WHERE id = merchant_uuid;
  SELECT count(*) INTO total_escrow FROM escrow WHERE merchant_id = merchant_uuid;
  SELECT count(*) INTO disputes FROM escrow WHERE merchant_id = merchant_uuid AND status = 'disputed';

  IF total_escrow > 0 THEN
    dispute_rate := (disputes::numeric / total_escrow::numeric) * 100;
  END IF;

  final_score := final_score + least(upvotes * 0.5, 20);
  final_score := final_score + ((100 - dispute_rate) * 0.2);
  final_score := final_score + greatest(0, 20 - (resp_time / 3));
  IF is_verif THEN
    final_score := final_score + 10;
  END IF;

  RETURN least(100, round(final_score))::int;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_streak(merchant_uuid uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO merchant_streaks (merchant_id, streak_count, last_lead_date)
  VALUES (merchant_uuid, 1, current_date)
  ON CONFLICT (merchant_id) DO UPDATE
  SET streak_count = CASE
    WHEN merchant_streaks.last_lead_date = current_date - interval '1 day' THEN merchant_streaks.streak_count + 1
    WHEN merchant_streaks.last_lead_date < current_date - interval '1 day' THEN 1
    ELSE merchant_streaks.streak_count
  END,
  last_lead_date = current_date,
  max_streak = greatest(merchant_streaks.max_streak, CASE
    WHEN merchant_streaks.last_lead_date = current_date - interval '1 day' THEN merchant_streaks.streak_count + 1
    WHEN merchant_streaks.last_lead_date < current_date - interval '1 day' THEN 1
    ELSE merchant_streaks.streak_count
  END);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Enable RLS and create liberal policies for testing/bootstrapping
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumers ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_b2c_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_razorpay_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE bargain_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated and anon users" ON merchants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON consumers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON v2_b2c_leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON v2_razorpay_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON free_otps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON escrow FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON referrals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON staking FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON support_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON merchant_streaks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON reels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON verification_photos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON community_escrow FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON ad_pins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON bargain_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON contact_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON merchant_locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON merchant_services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON merchant_hours FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anon users" ON merchant_analytics FOR ALL USING (true) WITH CHECK (true);
