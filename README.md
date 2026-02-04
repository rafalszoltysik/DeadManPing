# DeadManPing

Cron monitoring that observes job results without touching execution.

**Keep your cron. Keep your scripts. We only verify the result.**

DeadManPing monitors your cron jobs without touching how they run. One curl line. Your job logic stays the same.

## Open Source

DeadManPing is open source! This repository contains the core monitoring logic, frontend components, and infrastructure setup.

**Prefer using the hosted service?** [Get started at deadmanping.com](https://deadmanping.com) - no setup required, free tier available.

**Want to self-host?** This repository is licensed under [MIT License](LICENSE). See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing.

### What's included

- Core monitoring logic (payload validation, status calculation, alerts)
- Frontend components (React, Next.js, TypeScript)
- Infrastructure setup (Supabase migrations, Cloudflare Workers)
- Code examples (Bash, Python, Node.js)

### Self-hosting

Self-hosting requires setting up:
- Supabase (database + auth)
- Stripe (billing)
- Resend (email)
- Vercel/Cloudflare (hosting)
- Upstash Redis (rate limiting, optional)

For most users, the hosted service is more cost-effective and easier to maintain. Self-hosting is recommended for advanced users who need full control over their infrastructure.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

3. Set up your Supabase database:
   - Run the migrations in `supabase/migrations/` in order
   - Make sure to run `004_add_profile_insert_policy.sql` to allow profile creation

4. Configure Google OAuth (optional):
   - Go to your Supabase Dashboard → Authentication → Providers
   - Enable the "Google" provider
   - Add your Google OAuth credentials:
     - Client ID (from Google Cloud Console)
     - Client Secret (from Google Cloud Console)
   - Add authorized redirect URLs:
     - `http://localhost:3000/auth/callback` (for development)
     - `https://yourdomain.com/auth/callback` (for production)
   - In Google Cloud Console, make sure to add the same redirect URLs to your OAuth 2.0 Client

5. Run the development server:
```bash
npm run dev
```

## Deployment

### Vercel Setup

Aby skonfigurować środowiska Production i Development na Vercel z automatycznymi wdrożeniami z Git, zobacz:

**[VERCEL_ENVIRONMENTS_SETUP.md](./VERCEL_ENVIRONMENTS_SETUP.md)** - Kompletny przewodnik konfiguracji środowisk

**Szybki start:**
1. Połącz projekt z Git w Vercel Dashboard
2. Ustaw Production Branch na `main`
3. Dodaj zmienne środowiskowe dla Production i Preview
4. Push do `main` → automatyczne wdrożenie do Production
5. Push do `dev` → automatyczne wdrożenie jako Preview

## Examples

See the [`examples/`](./examples/) directory for working code examples, bash scripts, cron patterns, and edge cases. Each example includes:
- Complete, runnable code
- Problem description
- Solution explanation
- Link to related SEO documentation page

Examples are also available in our public GitHub repository: [examples](https://github.com/DeadManPing/examples)

## Custom Domain for Supabase Edge Functions (Free)

Chcesz używać własnej domeny (np. `api.yourdomain.com`) zamiast domyślnego URL Supabase? Bez płacenia za Supabase Pro ($25/miesiąc)?

Zobacz: **[cloudflare-workers/README.md](./cloudflare-workers/README.md)**

**Szybki start:**
1. `cd cloudflare-workers && npm install`
2. `npx wrangler login`
3. Ustaw sekrety: `npx wrangler secret put SUPABASE_URL` i `SUPABASE_ANON_KEY`
4. Edytuj `wrangler.toml` z Twoją domeną
5. Skonfiguruj DNS w Cloudflare (rekord AAAA z proxy ON)
6. `npm run deploy`

**Koszt:** $0/miesiąc (do 100k requestów/dzień) vs $35/miesiąc za Supabase Pro + custom domain

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Database + Auth)
- Stripe (Billing)
- Resend (Email)
- Cloudflare Workers (Proxy dla Supabase Edge Functions)

