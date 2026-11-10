-- Enforce Row Level Security (RLS) across all newly generated V2 engine tables

ALTER TABLE reverse_bounties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reverse bounties" ON reverse_bounties FOR SELECT USING (true);
CREATE POLICY "Admin bypass reverse bounties" ON reverse_bounties USING (true);

ALTER TABLE swarm_pools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read swarm pools" ON swarm_pools FOR SELECT USING (true);
CREATE POLICY "Admin bypass swarm pools" ON swarm_pools USING (true);

ALTER TABLE expiring_slots_ticker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read expiring slots" ON expiring_slots_ticker FOR SELECT USING (true);
CREATE POLICY "Admin bypass expiring slots" ON expiring_slots_ticker USING (true);

ALTER TABLE spawned_mini_apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read spawned apps" ON spawned_mini_apps FOR SELECT USING (true);
CREATE POLICY "Admin bypass spawned apps" ON spawned_mini_apps USING (true);

ALTER TABLE merchant_autopilot_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Merchants read own nodes" ON merchant_autopilot_nodes FOR SELECT USING (true);
CREATE POLICY "Admin bypass merchant nodes" ON merchant_autopilot_nodes USING (true);

ALTER TABLE autonomous_treasury_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin bypass treasury" ON autonomous_treasury_ledger USING (true);

ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin bypass otp" ON otp_verifications USING (true);
