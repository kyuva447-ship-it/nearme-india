CREATE TABLE IF NOT EXISTS otp_verifications (
    phone TEXT PRIMARY KEY,
    otp TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);
