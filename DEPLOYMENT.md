# Deployment Guide

## Prerequisites

1. Supabase account and project
2. Vercel account (recommended) or alternative Node.js hosting
3. Stripe account
4. Resend account (for emails)

## Hosting Options

### ⚠️ Important: This is a Next.js Application

This application requires **Node.js runtime** and cannot run on traditional shared hosting (like WordPress hosting). You need a platform that supports Node.js applications.

### Recommended: Vercel (Best for Next.js)

**Why Vercel?**
- Built by the creators of Next.js
- Zero configuration needed
- Automatic SSL certificates
- Free tier available (perfect for starting)
- Built-in CI/CD from GitHub
- Edge network for fast global performance
- Supports Next.js features out of the box

**Pricing:**
- **Free tier**: Perfect for development and small projects
  - 100GB bandwidth/month
  - Unlimited requests
  - Automatic deployments
- **Pro ($20/month)**: For production apps
  - 1TB bandwidth/month
  - Team collaboration
  - Advanced analytics

**Setup:**
1. Sign up at [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Vercel auto-detects Next.js and configures everything
4. Add your environment variables
5. Deploy!

### Alternative Hosting Options

If you prefer not to use Vercel, here are Node.js-compatible alternatives:

#### 1. **Netlify** (Similar to Vercel)
- Free tier available
- Good Next.js support
- Easy deployment from Git

#### 2. **Railway** (Simple & Affordable)
- ~$5-10/month for small apps
- Easy deployment
- Good for Node.js apps

#### 3. **Render** (Good Free Tier)
- Free tier with limitations
- Easy setup
- Auto-deploy from Git

#### 4. **DigitalOcean App Platform**
- Starts at $5/month
- Good performance
- Easy scaling

#### 5. **OVHcloud VPS** (If you want to stay with OVHcloud)
- ⚠️ **NOT the shared hosting packages** (Starter/Perso/Pro)
- You need a **VPS** (Virtual Private Server) with Node.js
- Requires server administration knowledge
- More complex setup (you'll need to install Node.js, PM2, Nginx, etc.)
- Starting from ~€3-5/month for basic VPS

**Why NOT OVHcloud Shared Hosting?**
- OVHcloud Starter/Perso/Pro packages are designed for PHP/WordPress
- They don't support Node.js runtime
- Cannot run `npm build` or `npm start`
- Your Next.js app will not work on these packages

### Domain Purchase

You can buy your domain from:
- **OVHcloud** - Good prices, Polish support
- **Namecheap** - Popular, good prices
- **Google Domains** - Simple interface
- **Cloudflare** - At-cost pricing, no markup

**Note:** You don't need to buy hosting from the same place you buy your domain. You can:
1. Buy domain from OVHcloud (or anywhere)
2. Point DNS to Vercel (or your chosen hosting)
3. Configure custom domain in Vercel dashboard

This is the recommended approach - separate domain and hosting.

## Setup Steps

### 1. Supabase Setup

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/`:
   - `001_initial_schema.sql`
   - `002_cleanup_function.sql`
   - `003_schedule_cron.sql`
   - `004_add_profile_insert_policy.sql` (required for signup to work)
3. Enable the following extensions:
   - `uuid-ossp`
   - `pg_cron` (if available)
4. Get your project URL and API keys from Settings > API
5. **Configure Google OAuth (optional)**:
   - Go to Authentication → Providers in Supabase Dashboard
   - Enable "Google" provider
   - Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/):
     - Create OAuth 2.0 Client ID (Web application)
     - Add authorized redirect URIs:
       - `https://your-project-ref.supabase.co/auth/v1/callback` (Supabase callback)
       - `http://localhost:3000/auth/callback` (local development)
       - `https://yourdomain.com/auth/callback` (production)
   - Enter Client ID and Client Secret in Supabase
   - Save the configuration

### 2. Environment Variables

Set these in Vercel (and locally in `.env.local`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Create Stripe products and prices, then set:
STRIPE_PRICE_ID_SOLO=price_xxxxx
STRIPE_PRICE_ID_AGENCY=price_xxxxx

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Internal API Secret (generate a random string)
INTERNAL_API_SECRET=your_random_secret

# App URL
NEXT_PUBLIC_APP_URL=https://deadmanping.com

# Cron Secret (for Vercel Cron Jobs)
CRON_SECRET=your_random_secret
```

### 3. Stripe Setup

1. Create two products in Stripe:
   - Solo: $14/month
   - Agency: $49/month
2. Create subscription prices for each
3. Set up webhook endpoint: `https://deadmanping.com/api/webhooks/stripe`
4. Subscribe to events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 4. Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set all environment variables
3. Deploy
4. Set up custom domain
5. Configure Vercel Cron Job:
   - Path: `/api/cron/check-timeouts`
   - Schedule: `* * * * *` (every minute)
   - Secret: Set `CRON_SECRET` environment variable

### 5. Supabase Edge Function (Optional)

If you want to use Supabase Edge Function instead of Vercel Cron:

1. Deploy the function in `supabase/functions/check-timeouts/`
2. Set up pg_cron to call it every minute (see migration 003)

### 6. Post-Deployment

1. Test the signup flow
2. Test creating a monitor
3. Test the ping endpoint
4. Test alert delivery
5. Test Stripe checkout
6. Verify cron job is running

## Monitoring

- Check Vercel logs for errors
- Monitor Supabase dashboard for database issues
- Check Stripe dashboard for webhook delivery
- Monitor Resend dashboard for email delivery

## Troubleshooting

- **Cron not running**: Check Vercel Cron configuration and `CRON_SECRET`
- **Alerts not sending**: Check Resend API key and webhook URLs
- **Stripe webhooks failing**: Verify webhook secret and endpoint URL
- **Database errors**: Check RLS policies and service role key
- **Google OAuth not working**: 
  - Verify Google provider is enabled in Supabase Dashboard → Authentication → Providers
  - Check that redirect URIs match in both Google Cloud Console and Supabase
  - Ensure Client ID and Client Secret are correctly entered in Supabase
  - Error "provider is not enabled" means Google OAuth is not configured in Supabase

