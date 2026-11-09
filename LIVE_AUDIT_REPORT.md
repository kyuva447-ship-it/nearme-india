# LIVE WEBSITE AUDIT REPORT

## 1. HOME PAGE
- **Does `https://nearme-india.org` load?** Yes (It redirects to `https://www.nearme-india.org` and loads HTTP 200).
- **Is it old or new?** It is loading the old "Shops Near You / BoloVoiceSearch" interface. The `v2-autonomous-engine` features (like `CommandHub`) are completely missing from the live site because the `v2-autonomous-engine` branch has not been merged to `main` and deployed yet.

## 2. 6 ENGINES STATUS (Live vs Branch)
| Engine | LIVE Status | Branch Status |
|--------|-------------|---------------|
| 007 - AI Search / CommandHub | MISSING | EXISTS in branch (`src/components/CommandHub.tsx`) |
| 008 - Local SEO / `/in/[pincode]/[slug]` | MISSING | EXISTS in branch (`src/app/in/[pincode]/[slug]/page.tsx`) |
| 009 - Trust & Reviews | MISSING | Simulated in branch |
| 010 - B2B / Company Builder | MISSING | MISSING / Simulated via `/api/engine/spawn-app` |
| 011 - MicroPass / Subscription | MISSING | EXISTS in branch (`src/components/MicroPass.tsx`) |
| 012 - Sovereign Super Engine (Orb) | MISSING | EXISTS in branch (`src/components/AutonomousSupportOrb.tsx`) |

## 3. PAGES HTTP AUDIT (Live Site)
- `/live/[slug]`: **HTTP 200** (Likely catching a fallback Next.js dynamic route or index, but missing actual v2 template logic).
- `/in/517501/tirupati`: **HTTP 200** (Same as above, falling back to old index logic or an old route).
- `/b2b`: **HTTP 404**
- `/company-builder`: **HTTP 404**
- `/escrow`: **HTTP 200** (Exists from V1 setup)
- `/micropass`: **HTTP 404**
- `/sitemap.xml`: **HTTP 200** (Using old V1 sitemap)
- `/robots.txt`: **HTTP 200** (Using old V1 robots)

## 4. PAYMENT
- Razorpay Split and Escrow API endpoints (`/api/payment/razorpay-split`) only exist inside the `v2-autonomous-engine` branch. They are currently completely missing from the live `main` production environment.

## 5. DATABASE
- The database schema (`012_sovereign_super_engine.sql`) is written and sitting in the `v2-autonomous-engine` branch. It has **not** been applied to the live Vercel/Supabase environment.
- **Missing Vercel Env Vars required for V2 to run:** `GEMINI_API_KEY` (Used in `bill-slasher`).

## 6. VERCEL STATUS
- Vercel is tied directly to the `main` branch of `kyuva447-ship-it/nearme-india`.
- Because PR #23 was the last thing merged to `main`, Vercel deployed that. It is completely blind to `v2-autonomous-engine` because this branch exists in the repository but has **not** been merged into `main`.

## 7. MOBILE RESPONSIVENESS
- The live site (V1) works on mobile. The `v2-autonomous-engine` components (`CommandHub`, `TelemetryBar`) were built using responsive Tailwind classes (`sm:flex`, `grid-cols-1 md:grid-cols-3`) and will render safely once deployed.

## 8. BUILD CHECK (V2 Branch)
- `npm run build` was executed inside the sandbox on the `v2-autonomous-engine` branch. It successfully completed with **0 warnings and 0 errors** across all 33 routes.

## 9. GAP REPORT TABLE

| Feature | In Branch (`v2`)? | Live (`main`)? | Fix Needed? |
|---------|-------------------|----------------|-------------|
| CommandHub UI | ✅ Yes | ❌ No | Merge PR to deploy |
| Autonomous Support Orb | ✅ Yes | ❌ No | Merge PR to deploy |
| `012_sovereign_...sql` | ✅ Yes | ❌ No | Execute SQL in Supabase manually |
| Razorpay Split API | ✅ Yes | ❌ No | Merge PR to deploy |
| `GEMINI_API_KEY` Env Var | ❌ N/A (Code references it) | ❌ Missing | Add to Vercel Settings |

---

## 10. EXACT 3-STEP PLAN TO GO LIVE (Without Losing V1 Data)

You must manually merge the branches and inject the keys to bring V2 live. DO NOT wipe your database.

**STEP 1: Merge the V2 Code into Main**
Go to your GitHub repository `kyuva447-ship-it/nearme-india`.
Click "Pull Requests" -> "New Pull Request".
Set `base: main` and `compare: v2-autonomous-engine`.
Click "Create Pull Request" and then click the green "Merge" button. This will instantly trigger Vercel to build the new code.

**STEP 2: Add the Missing API Key to Vercel**
Log into Vercel -> Select `nearme-india` project -> Settings -> Environment Variables.
Add `GEMINI_API_KEY` and insert your Google Gemini key. (Your Supabase and Razorpay keys from V1 are already there and will keep working).

**STEP 3: Safely Apply the New Supabase Tables (Non-Destructive)**
Go to your Supabase Dashboard -> SQL Editor.
Open the `supabase/migrations/012_sovereign_super_engine.sql` file from GitHub.
Copy the contents and run it in the SQL Editor. Because the script uses `CREATE TABLE IF NOT EXISTS`, it will safely add the 6 new Engine tables alongside your existing V1 tables without deleting any V1 data.
