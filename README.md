# DeadManPing

Simple dead-man switch monitoring for cron jobs and scheduled tasks.

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

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Database + Auth)
- Stripe (Billing)
- Resend (Email)

