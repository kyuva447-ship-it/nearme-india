# V2 AUTONOMOUS SUPER-ENGINE MASTER BUILD - 6 ENGINES INTEGRATED

## Description
This Pull Request transforms `nearme-india.org` into the fully autonomous V2 Super-Engine handling 6 brand-new AI capabilities:
1. **Supabase Migration (`012_sovereign_super_engine.sql`):** Added complete sovereign state schema handling Reverse Bounties, Swarm Pools, Bill Audit Scans, Dead-Time Ticker, App Spawner, and Autopilot nodes.
2. **Global Frontend Re-Architecture:** Rewrote `src/app/page.tsx` and introduced the `TelemetryBar`, `CommandHub` (Voice/Camera/Spawn), `LiveTicker`, and `MicroPass` components.
3. **API Engine Endpoints:** Scaffolding complete for `/api/engine/reverse-bid`, `/bill-slasher`, `/spawn-app`, `/payment/razorpay-split`, `/support/autonomous-agent`, and the Model Context Protocol toll at `/mcp`.
4. **Programmatic SEO & Mini Apps:** Added dynamic routing for `/in/[pincode]/[slug]` generating localized SEO pages with JSON-LD, plus instant live mini-apps at `/live/[slug]`. Generated updated `sitemap.ts` and `robots.ts`.
5. **24/7 AI Voice Orb:** Built `AutonomousSupportOrb.tsx` as a floating global support agent embedded in `layout.tsx`.
6. **Zero Build Errors:** Verified against `npm run build` constraints natively.

## How to push and merge from your phone:

To manually push this branch from your device and deploy it to Vercel via GitHub:

```bash
# 1. Fetch the remote branch
git fetch origin

# 2. Checkout the branch locally
git checkout v2-autonomous-engine

# 3. If you have the GitHub CLI installed, you can merge it via CLI:
gh pr create --title "V2 Autonomous Super-Engine" --body-file PR_DESCRIPTION.md --base main --head v2-autonomous-engine
gh pr merge v2-autonomous-engine --merge

# Or simply push it directly to main via a fast-forward if you prefer:
git checkout main
git merge v2-autonomous-engine
# git push origin main (run this on your device)
```
