-- Migration 006: Webhook Idempotency

CREATE TABLE IF NOT EXISTS v2_razorpay_events (
    id TEXT PRIMARY KEY, -- x-razorpay-event-id
    event_type TEXT NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT now()
);

-- Note: In a production environment, ensure RLS allows only the service role to write here.
ALTER TABLE v2_razorpay_events ENABLE ROW LEVEL SECURITY;
