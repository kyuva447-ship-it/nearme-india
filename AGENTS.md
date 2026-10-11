<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## NearMe India Production Rules

- The production domain is `https://www.nearme-india.org`. This must be used for all SEO metadata, canonical links, and sitemaps.
- Deployments to `main` auto-deploy to Vercel.
- **DO NOT** add custom Next.js routing directives (like `redirects` or `routes` segments matching `:1` or using regex strings like `(.*)`) directly to a `vercel.json` file. Vercel automatically parses `next.config.mjs` natively; adding legacy routing to `vercel.json` frequently crashes the deployment pipeline.
- Maintain Razorpay Compliance Pages (`/about`, `/pricing`, `/terms`, `/privacy`, `/refund-policy`, `/shipping-policy`, `/contact`) with their full legal prose.
- Always run `npm run build` before pushing to `main` to ensure zero hydration or TS errors.
