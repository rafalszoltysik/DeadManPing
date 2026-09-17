# DeadManPing

> **Status: archived.** The hosted product is shut down. This repository remains as an open-source snapshot of what was built.

Cron monitoring that observes job results without touching execution.

**Keep your cron. Keep your scripts. We only verify the result.**

DeadManPing monitored cron jobs without changing how they run — typically one `curl` line after the job. Job logic stayed the same.

## Why it is archived

I built and shipped DeadManPing as an independent product (Next.js app, billing, alerts, docs/SEO). I closed the hosted service after it did not get meaningful organic traction (weak Google Search Console / search demand for the positioning). The codebase is public so the work stays visible; it is not an active product.

## What is in this repo

- Core monitoring logic (payload validation, status calculation, alerts)
- Frontend (React, Next.js, TypeScript)
- Infrastructure setup (Supabase migrations, Cloudflare Workers examples)
- Integration patterns for pinging from scripts

MIT licensed — see [LICENSE](./LICENSE). Contribution notes: [CONTRIBUTING.md](./CONTRIBUTING.md).

## Tech stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase (database + auth)
- Stripe (billing)
- Resend (email)
- Upstash Redis (rate limiting, optional)
- Cloudflare Workers (optional proxy for Edge Functions)
- Sentry / PostHog / Vercel Analytics (observability)

## Local setup (self-host / explore)

```bash
npm install
cp env.example .env.local
# fill Supabase, Stripe, Resend, etc.
npm run dev
```

Apply SQL migrations under `supabase/migrations/` in order.

Self-hosting needs real credentials for Supabase, Stripe, Resend, and a host (e.g. Vercel). For most people this repo is a **reference**, not something to run in production without owning that ops cost.

## Examples submodule

`examples/` may point at `https://github.com/DeadManPing/examples`. If that org/repo is gone, ignore the submodule or remove it locally.

## Notes for readers

- Do not expect `deadmanping.com` to be live.
- Do not commit `.env` / secrets — `env.example` is the template only.
- This is an independent project, separate from employment work.
