# WHOLE INDIA COMPLETE PLAN: Scaling NearMe to 10,000Cr

## A) NEW DIRECTORY ARCHITECTURE (The 35,000 Page Foundation)
To capture SEO across 700 districts and hundreds of categories without crashing, we must transition from a monolithic `page.tsx` to a structured, intent-based Next.js architecture.

### The New Tree Structure
```text
src/app/
├── (auth)/                  # Isolated authentication flows
│   ├── login/page.tsx       # Secure Free OTP Entry
│   └── verify/page.tsx
├── (consumer)/              # The B2C Engine (Public)
│   ├── page.tsx             # Geo-located entry (Detects IP -> routes to city)
│   └── services/
│       └── [city]/
│           └── [category]/
│               └── page.tsx # 35,000+ Programmatic SEO Pages (ISR)
├── (merchant)/              # The B2B / Supply Engine (Private)
│   ├── onboarding/page.tsx  # Zero-friction profile creation
│   └── dashboard/page.tsx   # Secure CRM, Flash Deals, Live Ledger
└── api/
    ├── merchants/route.ts   # PostGIS Bounding Box queries
    ├── otp/generate/route.ts# Free OTP generation
    └── otp/verify/route.ts  # Secure validation
```
**Why this?** By grouping into Route Groups `(consumer)`, `(merchant)`, we separate layout logic (e.g., consumers don't need the merchant sidebar). The `[city]/[category]` dynamic routes allow us to generate `nearme-india.org/services/delhi/plumber` at build time or on-demand, dominating local Google searches organically.

### Safe Migration Commands (Zero Downtime)
```bash
# 1. Create the new structure alongside the old one
mkdir -p src/app/\(consumer\)/services/\[city\]/\[category\]
mkdir -p src/app/\(auth\) src/app/\(merchant\)

# 2. We will use Next.js rewrites in next.config.mjs to route old traffic to the new (consumer) home seamlessly.
```

---

## B) END-TO-END FLOW FOR WHOLE INDIA
**1. Customer in Delhi opens nearme-india.org:**
- `middleware.ts` intercepts the request, reads the `x-vercel-ip-city` header.
- If the user is in Delhi, the homepage seamlessly prefetches bounding-box coordinates for Delhi.
- If the user searches "Plumber", they are routed to `/services/delhi/plumber`.

**2. Programmatic SEO (ISR) Code Snippet:**
```typescript
// src/app/(consumer)/services/[city]/[category]/page.tsx
export const revalidate = 3600; // Revalidate every hour (ISR)

export default async function CityCategoryPage({ params }: { params: { city: string, category: string } }) {
  // PostGIS query filtering by city string matching or geospatial polygon
  const merchants = await fetchMerchantsByCityAndCategory(params.city, params.category);
  return <SEOOptimizedMap merchants={merchants} city={params.city} />;
}
```

**3. Merchant Onboarding (Delhi):**
- A merchant opens `/merchant`. They enter their phone number.
- They are asked to drop a pin on the Leaflet map (capturing exact Lat/Lng) and select "Delhi".
- They are now instantly discoverable in the PostGIS geospatial queries for Delhi.

**4. The Free OTP ₹0 Flow:**
To eliminate SMS gateway costs (which eat margins) while maintaining security:
- Merchant enters phone `9999999999`.
- Client calls `/api/otp/generate`.
- Server generates a 4-digit code (e.g., `4821`), saves it to `free_otps` table (phone, otp, expires_at), and instead of sending an SMS, it securely passes it back to the UI (or sends a free WhatsApp template if WA business API is used).
- Merchant enters `4821`. Client calls `/api/otp/verify`. Server checks the table, deletes the row, and issues a JWT session.

**5. The ₹3 Deduction Preservation:**
The core `deduct_v2_wallet` RPC remains completely untouched. The Next.js Route restructuring only changes *how* the merchant data is fetched (via PostGIS instead of `.limit(10)`). The client-side WhatsApp button still triggers the exact same RPC.

---

## C) DATABASE CHANGES (PostGIS + Auth)
We need two massive architectural migrations for scale.

**Migration `008_pan_india_postgis.sql`**
```sql
-- Ensure PostGIS is active
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add GEOGRAPHY column for radius/bounding box searches
ALTER TABLE v2_merchants ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT);
CREATE INDEX IF NOT EXISTS v2_merchants_geo_index ON v2_merchants USING GIST (location);

-- Function to auto-update geography based on lat/lng inputs
CREATE OR REPLACE FUNCTION update_merchant_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_merchant_location
BEFORE INSERT OR UPDATE ON v2_merchants
FOR EACH ROW EXECUTE FUNCTION update_merchant_location();
```

**Migration `009_free_otp_auth.sql`**
```sql
CREATE TABLE IF NOT EXISTS free_otps (
    phone_number TEXT PRIMARY KEY,
    otp_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Auto delete expired OTPs policy or cron
```

---

## D) EXECUTION TIMELINE (No Breaking Changes)
- **Step 1 (Day 1 - DB & API):** Execute `008` and `009` migrations in Supabase. Build the `/api/otp` and `/api/merchants` (PostGIS) routes. Verify with Postman.
- **Step 2 (Day 2 - Routing Restructure):** Execute `git mv` to move `login` into `(auth)`. Scaffold `(consumer)/services/[city]/[category]`. Implement `next.config.mjs` rewrites to ensure the root `/` still points to the consumer map without breaking existing Vercel URLs. Run `npm run build`.
- **Step 3 (Day 3 - State Deprecation):** Rip out `localStorage` from `merchant/dashboard/page.tsx`. Wire the dashboard strictly to Supabase using the new Free OTP auth session token. Run `npm run build` to guarantee zero regressions.
