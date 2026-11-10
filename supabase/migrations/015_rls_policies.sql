-- Enforce Row Level Security (RLS) safely

ALTER TABLE reverse_bounties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reverse bounties" ON reverse_bounties FOR SELECT USING (true);
CREATE POLICY "Users update own bounties" ON reverse_bounties FOR UPDATE USING (auth.uid()::text = user_phone);

ALTER TABLE swarm_pools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read swarm pools" ON swarm_pools FOR SELECT USING (true);

ALTER TABLE expiring_slots_ticker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read expiring slots" ON expiring_slots_ticker FOR SELECT USING (true);

ALTER TABLE spawned_mini_apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read spawned apps" ON spawned_mini_apps FOR SELECT USING (true);

ALTER TABLE merchant_autopilot_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Merchants read own nodes" ON merchant_autopilot_nodes FOR SELECT USING (auth.uid()::text = phone);
CREATE POLICY "Merchants update own nodes" ON merchant_autopilot_nodes FOR UPDATE USING (auth.uid()::text = phone);

ALTER TABLE autonomous_treasury_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own treasury" ON autonomous_treasury_ledger FOR SELECT USING (auth.uid()::text = user_phone);

ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
-- No public policies. SupabaseAdmin handles this server-side.
