-- Mock Businesses in Bengaluru
INSERT INTO sellers (name, business_type, category, tags, phone, whatsapp, latitude, longitude, wallet_balance, is_currently_available, community_upvotes, current_deal_text, deal_expiry)
VALUES
  -- Peenya Garment Factories (B2B Manufacturer)
  ('Peenya Stitch Masters', 'Manufacturer', 'Textiles & Garments', ARRAY['b2b', 'bulk', 'garment', 'factory'], '+919876543210', '+919876543210', 13.0285, 77.5197, 15.00, true, 8, 'Bulk order 10% off', now() + interval '10 days'),
  ('Loom Dynamics Pvt Ltd', 'Manufacturer', 'Textiles & Garments', ARRAY['fabric', 'export', 'weaving'], '+919876543211', '+919876543211', 13.0301, 77.5215, 50.00, true, 4, NULL, NULL),
  ('Apex Apparel Works', 'Manufacturer', 'Textiles & Garments', ARRAY['b2b', 'tshirts', 'branding'], '+919876543212', '+919876543212', 13.0250, 77.5250, 15.00, true, 12, 'Free shipping on >500 units', now() + interval '5 days'),

  -- Indiranagar Real Estate Brokers (Broker)
  ('Indiranagar Prime Spaces', 'Broker', 'Real Estate', ARRAY['residential', 'commercial', '2bhk', 'rent'], '+919876543213', '+919876543213', 12.9784, 77.6408, 100.00, true, 55, 'Zero brokerage today', now() + interval '12 hours'),
  ('East Point Realtors', 'Broker', 'Real Estate', ARRAY['commercial', 'office', 'sale'], '+919876543214', '+919876543214', 12.9750, 77.6450, 15.00, false, 2, NULL, NULL),
  ('Metro Living Estates', 'Broker', 'Real Estate', ARRAY['apartment', 'rent', 'villa'], '+919876543215', '+919876543215', 12.9800, 77.6420, 25.00, true, 15, 'Free background check', now() + interval '2 days'),

  -- Koramangala Electricians (Service / Freelancer)
  ('Koramangala Quick Spark', 'Service', 'Electrician', ARRAY['repair', 'wiring', 'emergency'], '+919876543216', '+919876543216', 12.9279, 77.6271, 15.00, true, 60, '15% off labor', now() + interval '2 hours'),
  ('VoltFix Pro', 'Freelancer', 'Electrician', ARRAY['inverter', 'installation', 'ac'], '+919876543217', '+919876543217', 12.9300, 77.6250, 15.00, true, 25, NULL, NULL),
  ('Raju Electricals', 'Service', 'Electrician', ARRAY['shop', 'spares', 'repair'], '+919876543218', '+919876543218', 12.9250, 77.6300, 15.00, false, 5, NULL, NULL),

  -- HSR Layout Plumbers (Service / Freelancer)
  ('HSR Pipe Masters', 'Service', 'Plumbing', ARRAY['leak', 'bathroom', 'emergency'], '+919876543219', '+919876543219', 12.9121, 77.6446, 15.00, true, 40, 'Free inspection', now() + interval '1 day'),
  ('ClearFlow Solutions', 'Freelancer', 'Plumbing', ARRAY['tank', 'cleaning', 'pipes'], '+919876543220', '+919876543220', 12.9150, 77.6400, 15.00, true, 18, NULL, NULL),
  ('Babu Plumbing Works', 'Service', 'Plumbing', ARRAY['motor', 'repair', 'fittings'], '+919876543221', '+919876543221', 12.9100, 77.6450, 15.00, true, 5, 'Rs 50 off visit', now() + interval '5 hours');
