-- Seed Data for NearMe India

-- Clear existing data if necessary (for idempotent local development)
DELETE FROM sellers;
DELETE FROM wallet_transactions;
DELETE FROM b2b_jobs;

-- Insert 8 realistic, omni-category mock businesses across Bengaluru
INSERT INTO sellers (id, business_name, industry, whatsapp_number, latitude, longitude, wallet_balance, is_available, business_type, category, tags, current_deal_text, deal_expiry, community_upvotes) VALUES
-- 1. Peenya Garment Factory (Manufacturer)
('11111111-1111-1111-1111-111111111111', 'Peenya Threads & Textiles', 'Manufacturer', '9876543210', 13.0285, 77.5197, 15.00, true, 'Manufacturer', 'Tailoring & Garments', '{"bulk", "export", "b2b"}', '10% off bulk orders', now() + interval '1 day', 45),

-- 2. Indiranagar Real Estate Broker (Broker)
('22222222-2222-2222-2222-222222222222', 'Indiranagar Prime Properties', 'Broker', '9876543211', 12.9783, 77.6408, 15.00, true, 'Broker', 'Real Estate', '{"commercial", "residential", "rentals"}', NULL, NULL, 60),

-- 3. Koramangala Retail Electronics (Retail)
('33333333-3333-3333-3333-333333333333', 'Tech Hub Koramangala', 'Retail', '9876543212', 12.9352, 77.6245, 15.00, true, 'Retail', 'Electronics', '{"mobiles", "laptops", "repair"}', 'Free tempered glass with screen repair', now() + interval '5 hours', 12),

-- 4. HSR Layout Plumbing Services (Service)
('44444444-4444-4444-4444-444444444444', 'QuickFix Plumbers HSR', 'Service', '9876543213', 12.9141, 77.6411, 15.00, true, 'Service', 'Plumbing', '{"emergency", "water tank", "pipe leak"}', '₹100 off on emergency visits', now() + interval '12 hours', 85),

-- 5. Whitefield IT Hardware Supplier (B2B/Wholesale)
('55555555-5555-5555-5555-555555555555', 'Whitefield Server Solutions', 'Wholesale', '9876543214', 12.9698, 77.7499, 15.00, true, 'Wholesale', 'IT Hardware', '{"servers", "networking", "cables"}', NULL, NULL, 30),

-- 6. Jayanagar Boutique (Retail)
('66666666-6666-6666-6666-666666666666', 'Silk Route Jayanagar', 'Retail', '9876543215', 12.9299, 77.5834, 15.00, true, 'Retail', 'Clothing', '{"sarees", "ethnic wear", "custom"}', 'Buy 2 Get 1 Free on Kurtis', now() + interval '2 days', 110),

-- 7. Malleshwaram Catering (Service)
('77777777-7777-7777-7777-777777777777', 'Malleshwaram Grand Feasts', 'Service', '9876543216', 13.0068, 77.5713, 15.00, false, 'Service', 'Food & Catering', '{"weddings", "corporate", "veg"}', NULL, NULL, 95),

-- 8. Electronic City Scrap Metal (Recycling/Broker)
('88888888-8888-8888-8888-888888888888', 'E-City Metal Recyclers', 'Broker', '9876543217', 12.8452, 77.6602, 15.00, true, 'Broker', 'Scrap & Recycling', '{"copper", "iron", "industrial"}', 'Best rates for bulk copper', now() + interval '10 days', 25);
