CREATE TABLE IF NOT EXISTS free_otps (
    phone_number TEXT PRIMARY KEY,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);
