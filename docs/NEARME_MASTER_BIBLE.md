# NEARME INDIA - MASTER BIBLE (Oct 27, 2025)

## CHAPTER 1: EXECUTIVE SUMMARY
**What is NearMe India?**
NearMe India is a hyper-local, zero-friction discovery and lead generation marketplace designed exclusively for the Indian MSME sector. It connects local consumers with verified neighborhood merchants through a highly visual, map-based interface, instantly routing intent into direct WhatsApp conversations for a flat ₹3 micro-transaction fee.

**Quick Facts:**
- **Tagline:** The Verified Local Marketplace
- **Domain:** `https://nearme-india.org`
- **Live Date / Master SHA:** October 27, 2025 / `3125e7a`
- **Tech Stack:** Next.js 14 (App Router), Tailwind CSS, Supabase (PostgreSQL), Leaflet (OSM), Razorpay.

**Live Links Status:**
| URL | Status | Description |
|---|---|---|
| `/` | PASS | Consumer Map & Search |
| `/merchant` | PASS | Merchant Onboarding |
| `/merchant/dashboard` | PASS | Merchant CRM & Wallet |
| `/search` | PASS | Query Routing |
| `/edge` | PASS | B2B Priority Listing Info |
| `/escrow` | PASS | B2B Trust Verification |
| `/leaderboard` | PASS | Local Legends Ranking |
| `/pricing` | PASS | Merchant Pack Info |
| `/login` | PASS | Auth Entry |
| `/about`, `/contact`, `/privacy`, `/terms`, `/refund-policy`, `/shipping-policy` | PASS | Compliance & SEO |

---

## CHAPTER 2: PURPOSE & PROBLEM SOLVED
**The Problem:** Traditional local search engines (like Justdial or Google Local Ads) operate on opaque bidding models, charging Indian MSMEs ₹50 to ₹500 per lead without guaranteeing direct communication or conversion. Small merchants are priced out of digital discovery.
**Our Solution:** NearMe India introduces a radically transparent, micro-transactional model: **Exactly ₹3 per direct WhatsApp handoff.**
**Who Benefits:**
- **Consumers:** Free, instant, map-based discovery of active local services.
- **Merchants:** Affordable, high-intent leads delivered directly to their phone, eliminating complex CRM software.
- **India's 6.3Cr MSMEs:** Democratizing digital access with a "Zero-Touch Onboarding" flow.

---

## CHAPTER 3: COMPLETE WEBSITE STRUCTURE
**Route Map:**
- `/` -> Entry point. AI intent router splits traffic to B2C (Consumer Map) or B2B (Dashboard).
- `/merchant` -> Zero-friction onboarding gateway.
- `/merchant/dashboard` -> Private ledger showing live deductions, wallet top-ups, and profile edits (Flash Deals, Live Ping).
- `/pricing` -> Public display of wallet top-up packs.
- `/edge`, `/escrow`, `/leaderboard` -> Premium B2B and gamification marketing pages.
- `/privacy`, `/terms`, `/refund-policy`, `/shipping-policy` -> Razorpay regulatory compliance.

**Key Components (`src/components/`):**
- `marketplace/LiveMap.tsx`: Renders the Leaflet OpenStreetMap tiles and merchant markers.
- `marketplace/AIOmnibar.tsx`: Handles natural language search queries and intent detection.
- `Navbar.tsx`, `Footer.tsx`: Global layout wrappers.

**Core Dependencies (`package.json`):**
- `next: 14.2.15`, `react: 18.3.1`, `@supabase/supabase-js: ^2.117.3`, `tailwindcss: 3.4.15`, `framer-motion: 11.18.2`, `leaflet: ^1.9.4`, `razorpay: ^2.9.8`.

---

## CHAPTER 4: FEATURES (Current LIVE)
**A. Customer Side:**
- **OSM Live Map:** Cost-free, highly responsive local mapping.
- **Hyper-Local Search:** Filter by category or intent.
- **Flash Deals Engine:** Pulsing "🔥 LIVE DEAL" banners for urgent 1-hour discounts.
- **Local Legends:** "👑 Neighborhood Legend" badges automatically awarded at 50+ community upvotes.
- **Live Ping:** "🟢 Available Right Now" glowing dots sorting available merchants to the top.
- **WhatsApp Handoff:** 1-click routing to the merchant's WhatsApp, auto-injecting the deal context and mock distance.

**B. Merchant Side:**
- **Zero-Touch Onboarding:** Phone-number based entry.
- **Seller Dashboard:** Toggle Live Ping, configure Flash Deals, and view lead analytics.
- **Live Ledger:** Real-time visual tracking of `-₹3.00` deductions per lead.
- **Wallet Top-Up:** Razorpay integration to buy lead credits.

**C. Admin/System Side:**
- **Supabase RPC:** Atomic `deduct_v2_wallet` logic executing securely on the database level.
- **Webhooks:** Razorpay idempotency checking (`v2_razorpay_events`) protecting against double-billing.
- **Migrations:** `001` through `007` fully operational on live db.

---

## CHAPTER 5: HOW TO USE - USER GUIDES
**For Customer:**
1. Open `nearme-india.org`.
2. Type a need (e.g., "plumber near me") into the AI Omnibar.
3. View the map. Look for "🟢 Available" or "🔥 LIVE DEAL".
4. Click the WhatsApp button. The app opens WhatsApp with a pre-filled, context-aware message.

**For Merchant:**
1. Go to `nearme-india.org/merchant`.
2. Enter WhatsApp number (Zero KYC).
3. Access Dashboard. Top up wallet (e.g., ₹199 via Razorpay).
4. Set "Live Ping" to ON to rank higher.
5. Watch the Ledger deduct exactly `-₹3.00` when a customer clicks your WhatsApp link.

**For Admin:**
1. Access Supabase Dashboard to monitor `v2_b2c_leads` and `v2_razorpay_events`.
2. Edits to the frontend are pushed to the GitHub `main` branch, triggering auto-deploys to Vercel.

---

## CHAPTER 6: COMPLETE ARCHITECTURE & TECH STACK
**Frontend Architecture:** Next.js 14 App Router leveraging React Server Components. Framer Motion for micro-interactions. Tailwind CSS v3 for glassmorphism and mesh gradients.
**Backend Architecture:** Supabase Postgres.
- **Tables:** `sellers`, `v2_merchants`, `v2_b2c_leads`, `v2_razorpay_events`, `wallet_transactions`.
- **RPC:** `deduct_v2_wallet(merchant_uuid, amount)`.
**Map Architecture:** Leaflet leveraging OpenStreetMap (OSM) tiles. *Rationale:* Eliminates Google Maps API costs ($7/1000 loads), saving upwards of ₹100Cr at massive scale.
**Hosting Architecture:** Vercel Edge Network hooked directly to `main` branch for CI/CD.

**Money Flow (The ₹3 Lifecycle):**
1. Customer clicks WhatsApp link (`src/app/page.tsx`).
2. Client calls `supabase.rpc('deduct_v2_wallet', { amount: 3.00 })`.
3. Postgres checks `wallet_balance >= 3.00`. If true, deducts balance and returns success.
4. Client logs the lead in `v2_b2c_leads` (`lead_fee_charged: 3.00`).
5. Client opens `wa.me/...`.
6. Merchant Dashboard (`src/app/merchant/dashboard/page.tsx`) queries the updated balance.

---

## CHAPTER 7: CODE-VERIFIED PROOF (Oct 27 LIVE)
- **Pricing ₹3 Proof:** `src/app/page.tsx` perfectly maps `amount: 3.00` and `lead_fee_charged: 3.00`.
- **Ledger -₹3 Proof:** `src/app/merchant/dashboard/page.tsx` visual UI explicitly maps `-₹3.00`.
- **OSM Proof:** `src/components/marketplace/LiveMap.tsx` explicitly fetches `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.
- **Migration Proof:** `supabase/migrations/007_hyper_local_engagement_additions.sql` exists and defines `current_deal_text`, `is_currently_available`, and the updated RPC logic.
- **Vercel Proof:** GitHub SHA `3125e7a` merged and live Oct 27.

---

## CHAPTER 8: 1000CR TO 10000CR BHAG
NearMe India is currently optimized for rapid, hyper-local consumer-to-merchant liquidity. The pathway from 1,000Cr to 10,000Cr involves expanding the B2B engine:
1. **Invoice Factoring & Escrow:** Transitioning from lead generation to securing the actual transaction pipeline.
2. **Programmatic SEO Dominance:** Deploying ISR (Incremental Static Regeneration) across `/services/[city]/[category]` to capture 100% of long-tail local search volume organically.
3. **Data Monopoly:** Utilizing the massive ingestion of `v2_b2c_leads` context messages to train localized AI purchasing models.
