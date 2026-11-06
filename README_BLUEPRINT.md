# NEARME-INDIA.ORG: 10,000 CR SCALE BLUEPRINT

## 1. WHAT IS NEARME-INDIA.ORG?
**The Vision:** An Intent-Driven "Live Local Connect" engine, completely bypassing traditional static directories (like JustDial or Google Maps).
**The USP:** It flips the model. Instead of users scrolling through hundreds of old listings, it's a real-time pulse of the city.
*   **For Users (Grandma to Gen Z):** Soft, frictionless UI. You just say/type what you need ("Plumber in 10 mins" or "Fresh biryani offer"). You instantly see who is *currently available* on a Live Map and connect directly via WhatsApp. No app to download. No forced logins to browse.
*   **For Merchants (Kirana to Startup):** Zero commission on sales. They just pay a micro-fee (₹3) for a direct WhatsApp lead. They control their "Mood" (Busy/Empty) and "Flash Deals" in real-time.

## 2. FULL BLUEPRINT
### Tech Stack (100% Free for Boss)
*   **Framework:** Next.js 14 (App Router) deployed on Vercel Hobby.
*   **Database & Auth:** Supabase Free Tier (PostgreSQL + PostGIS for hyper-local radius searches, NextAuth for seamless authentication).
*   **Styling:** Tailwind CSS + Framer Motion (Glassmorphism, soft pastel gradients, vibrant but easy to read).
*   **Payments:** Razorpay Integration (using dynamic paise calculation).

### Database Schema (Supabase PostgreSQL)
1.  **`users_v1`**: `id` (UUID), `phone` (Text), `name`, `created_at`.
2.  **`shops_v1`**: `id`, `owner_id` (FK), `business_name`, `category`, `city`, `pincode`, `lat`, `lng` (PostGIS point), `trust_score` (0-100), `mood` (Busy/Available), `current_deal_text`, `is_active` (Bool), `wallet_balance` (Numeric).
3.  **`payments_v1`**: `id`, `shop_id`, `razorpay_order_id`, `amount`, `status`, `created_at`.
4.  **`leads_v1`**: `id`, `shop_id`, `user_phone`, `fee_deducted` (Numeric), `created_at`.

### Core APIs & Crons (Vercel Hobby Compliant)
*   **Cron:** `/api/cron` running uniquely at `0 0 * * *`. It auto-expires 24h flash deals, recalculates Trust DNA scores, and rotates ISR (Incremental Static Regeneration) cache for SEO city/category pages.
*   **APIs:** `/api/orders` (Generates Razorpay Order ID securely), `/api/razorpay/webhook` (Verifies signature and auto-credits wallet balance).

### Feature Phasing
*   **Phase 1 (The Core):** Soft Omni-Search, Live Map rendering (Leaflet), Merchant Dashboard (Profile + Flash Deals + Razorpay Wallet Recharge), ₹3 WhatsApp Lead Handoff.
*   **Phase 2 (Engagement):** Bargain AI (Automated counter-offers), Trust DNA upvoting, Local SEO programmatic page generation (500+ Bangalore landing pages).
*   **Phase 3 (Scale to ₹10,000 Cr):** AI Shop 3D Twins, Franchise Tier subscriptions, Priority Lead Bidding.

## 3. HOW IT WORKS (The Journeys)
*   **The Customer Journey:**
    1. Lands on the beautiful, soft homepage.
    2. Uses Omni-Search: "Who has a cake discount in HSR layout?"
    3. The map zooms to HSR, showing pulsing pins of 3 bakers with active Flash Deals.
    4. Clicks "Chat via AI Broker". Opens WhatsApp instantly to chat with the baker.
*   **The Merchant Journey:**
    1. Logs in seamlessly using their phone number (OTP/NextAuth).
    2. Opens Dashboard. Clicks "Top Up Wallet" and pays ₹500 via Razorpay.
    3. Sets their Mood to "Empty - Need Orders!" and broadcasts a Flash Deal "20% OFF next 2 hrs".
    4. When a customer clicks their profile, ₹3 is securely deducted via a Supabase RPC function (`deduct_v2_wallet`), and the merchant receives a direct WhatsApp lead.

## 4. WHAT WILL WORK ON DAY 1
If approved, the following will be 100% functional on the first deployment:
*   [x] Soft, pastel Bangalore V1 Homepage UI.
*   [x] Omni-Search bar and Interactive Leaflet Live Map.
*   [x] The "Chat via AI Broker" button (which routes to WhatsApp).
*   [x] Secure ₹3 Wallet Deduction via Supabase RPC.
*   [x] Merchant Dashboard to update Name, Category, and Flash Deals.
*   [x] Razorpay Checkout button (Create order + Webhook listener for Real Cash).

## 5. RISKS & WHAT I NEED FROM YOU
*   **Risk:** Vercel Hobby plan limits. **Mitigation:** We are strictly using 1 unified cron job and placing all Cache-Control headers in `next.config.js` to ensure the CDN handles the 10,000 Cr scale traffic without hitting serverless function execution limits.
*   **What I need from you:**
    1. Read this blueprint.
    2. Reply with **"Approved"** or tell me what to change.
    3. Ensure your Vercel Environment Variables (`NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and Supabase keys) are properly set in your dashboard for when I push the code.
