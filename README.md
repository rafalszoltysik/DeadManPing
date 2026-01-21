# DeadManPing

Cron monitoring that observes job results without touching execution.

**Keep your cron. Keep your scripts. We only verify the result.**

DeadManPing monitors your cron jobs without touching how they run. One curl line. Zero execution changes.

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

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Database + Auth)
- Stripe (Billing)
- Resend (Email)

