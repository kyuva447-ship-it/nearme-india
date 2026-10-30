-- Migration to add increment_wallet_balance RPC for Razorpay webhook

CREATE OR REPLACE FUNCTION increment_wallet_balance(p_merchant_id UUID, p_amount NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
    new_balance NUMERIC;
BEGIN
    UPDATE v2_merchants
    SET wallet_balance = COALESCE(wallet_balance, 0) + p_amount
    WHERE id = p_merchant_id
    RETURNING wallet_balance INTO new_balance;

    RETURN new_balance;
END;
$$ LANGUAGE plpgsql;
