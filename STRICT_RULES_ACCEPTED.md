# STRICT RULES ACKNOWLEDGEMENT

I have permanently adopted the following rules for all code going forward on `kyuva447-ship-it/nearme-india`:

1. **NO FAKE PAYMENT:** No `alert()`, `console.log()` placeholders pretending to be Razorpay. If Razorpay cannot be fully instantiated, the button will default strictly to a WhatsApp contact flow or explicit `disabled` state with "Coming Soon".
2. **NO FAKE COUNTS:** Hardcoded text like "500 Cities", "10 Lakh Shops", etc., are banned. Only live DB counts will be rendered. If count is 0, the empty state ("Be the first to list") will be shown.
3. **NO FAKE LOGIN:** Fake OTP bypasses and simulated sessions are banned. If a robust provider isn't wired up, the Login flow will explicitly declare "Login Coming Soon" and fall back to WhatsApp onboarding. Unused auth code (`[...nextauth]`, `SessionProviderContext`) will be cleanly deleted.
4. **NO FAKE BUTTONS:** Every button must perform a real action (e.g., navigate to a route, update `localStorage` cart, trigger real WhatsApp schema, or execute real DB query).
5. **NO DUMMY DATA:** Hardcoded arrays mimicking database entries (e.g., dummy Bangalore shops) are strictly banned. The UI will only map over real Supabase responses.
6. **NO SECRET LEAKS:** Secrets will strictly exist within Vercel Environment Variables. The `.env` pattern is banned from commits.

By pushing this, I confirm that all future PRs will strictly adhere to these rules without exception.
