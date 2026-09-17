# DeadManPing

Cron job monitoring that checks results after your job finishes. You keep your existing cron and scripts. Integration is typically one HTTP request (often a `curl`) to a ping endpoint when the job completes.

**Status: archived.** The hosted product is shut down. This repository is a public snapshot of the codebase.

I closed the service after it did not get meaningful organic search traction (weak Google Search Console demand for the positioning). The code stays public as a reference.

## What it did

- Monitors that expect periodic pings from your jobs (`/api/ping/[slug]`)
- Optional payload validation on ping data
- Status calculation and email alerts (Resend)
- Dashboard, auth, workspaces, and billing (Stripe)
- Marketing pages, docs, and blog in the same Next.js app

## Stack

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- Supabase (database and server-side access)
- Stripe (billing)
- Resend (email)
- Optional: Upstash Redis (rate limiting), Sentry, PostHog, Vercel Analytics

## Requirements

- Node.js compatible with Next.js 15
- A Supabase project, plus Stripe and Resend credentials, if you want a working local instance
- SQL migrations under `supabase/migrations/` applied in order

## Local setup

```bash
npm install
cp env.example .env.local
# fill required values from env.example
npm run dev
```

Apply the SQL files in `supabase/migrations/` in numeric order against your Supabase project.

Self-hosting needs real infrastructure and secrets. For most people this repo is something to read, not something to run in production.

Environment variables are listed in `env.example`. Do not commit `.env` or `.env.local`.

Useful scripts from `package.json`:

- `npm run dev` - local Next.js server
- `npm run build` - production build (runs `generate-types` first)
- `npm run lint` - ESLint

## Examples

The former `examples` git submodule is not part of this public repository. After the DeadManPing organization was removed, those samples were moved to a private repo.

## License

MIT. See [LICENSE](./LICENSE).
