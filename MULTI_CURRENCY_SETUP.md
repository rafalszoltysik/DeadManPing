# 🌍 Multi-Currency Setup Guide

DeadManPing supports automatic currency detection based on user location with manual override option.

## How It Works

1. **Auto-Detection**: Currency is automatically detected from user's country (via Vercel geo headers)
2. **Manual Override**: Users can change currency preference on billing page and landing page
3. **LocalStorage**: Currency preference is stored in browser (no database column needed)
4. **Stripe Integration**: Prices are fetched dynamically from Stripe API based on Product metadata

---

## Stripe Dashboard Configuration

### Step 1: Create Products with Metadata

Create three products in your Stripe Dashboard with the following metadata:

#### Product 1: Starter Plan
- **Name**: `Starter Plan`
- **Description**: `25 monitors, 5 minute minimum interval`
- **Metadata** (REQUIRED):
  - Key: `plan_key`
  - Value: `starter`

#### Product 2: Pro Plan
- **Name**: `Pro Plan`
- **Description**: `100 monitors, 1 minute minimum interval, Up to 3 team members`
- **Metadata** (REQUIRED):
  - Key: `plan_key`
  - Value: `pro`

#### Product 3: Team Plan
- **Name**: `Team Plan`
- **Description**: `500 monitors, 30 second minimum interval, Up to 10 team members`
- **Metadata** (REQUIRED):
  - Key: `plan_key`
  - Value: `team`

### Step 2: Add Prices for Each Currency

For each product, create monthly recurring prices in USD, EUR, and PLN:

#### Starter Plan Prices
1. **USD**: $9.00/month
2. **EUR**: €8.28/month (or your preferred EUR price)
3. **PLN**: 36.00 zł/month (or your preferred PLN price)

#### Pro Plan Prices
1. **USD**: $29.00/month
2. **EUR**: €26.70/month (or your preferred EUR price)
3. **PLN**: 116.00 zł/month (or your preferred PLN price)

#### Team Plan Prices
1. **USD**: $79.00/month
2. **EUR**: €72.72/month (or your preferred EUR price)
3. **PLN**: 316.00 zł/month (or your preferred PLN price)

**Important**: Make sure all prices are set as:
- **Recurring**: Monthly
- **Active**: Yes

---

## Environment Variables (Optional Fallback)

Add to `.env` for USD fallback if Stripe API is unavailable:

```env
# Stripe Price IDs (USD only, used as fallback)
STRIPE_PRICE_ID_STARTER=price_xxxxx_usd
STRIPE_PRICE_ID_PRO=price_xxxxx_usd
STRIPE_PRICE_ID_TEAM=price_xxxxx_usd
```

These are only used if Stripe API fails to return prices.

---

## Database Migration

Run the migration to remove the `currency` column:

```bash
# If using Supabase CLI
supabase migration up

# Or manually apply: supabase/migrations/011_remove_currency_column.sql
```

---

## Country to Currency Mapping

The system automatically maps countries to currencies:

- **EUR**: Austria, Belgium, Cyprus, Estonia, Finland, France, Germany, Greece, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Portugal, Slovakia, Slovenia, Spain, Croatia
- **PLN**: Poland
- **USD**: United States, United Kingdom, Canada, Australia, New Zealand, and all other countries by default

This mapping is defined in `lib/currency-detection.ts` and can be customized.

---

## Testing

1. **Landing Page**: Visit homepage, select currency from toggle above pricing section
2. **Billing Page**: Login, go to `/dashboard/billing`, select currency from dropdown
3. **Checkout**: Currency preference is passed to Stripe checkout
4. **Persistence**: Currency preference is stored in localStorage across sessions

---

## Key Files

- `lib/currency-detection.ts` - Currency detection logic and country mapping
- `lib/stripe-prices.ts` - Stripe price fetching and caching
- `components/PricingSection.tsx` - Landing page pricing with currency toggle
- `app/dashboard/billing/page.tsx` - Billing page with currency selector
- `app/api/billing/prices-public/route.ts` - Public API for landing page prices
- `app/api/billing/prices/route.ts` - Authenticated API for dashboard prices
- `app/api/billing/create-checkout/route.ts` - Checkout session creation with currency

---

## Troubleshooting

### Prices show as $0.00 or "Unavailable"

1. Verify Products in Stripe have `plan_key` metadata set correctly
2. Verify each Product has Prices in all three currencies (USD, EUR, PLN)
3. Check Stripe API logs for errors
4. Ensure STRIPE_SECRET_KEY is set in environment variables

### Currency not detected

1. Check if Vercel geo headers are available (`x-vercel-ip-country`)
2. Fallback to USD if running locally (geo headers only work in production)
3. User can manually select currency from toggle/dropdown

### Currency not persisting

1. Check browser localStorage for `preferred_currency` key
2. Ensure localStorage is enabled in browser
3. Currency is per-browser, not per-user (by design)

---

## Notes

- Currency preference is stored in **localStorage**, not in database
- For users with **active subscriptions**, currency comes from their Stripe subscription
- For users **without subscriptions**, currency is auto-detected or manually selected
- Currency selection is available on **landing page** and **billing page** (not in settings)
- Prices are **cached for 1 hour** to reduce Stripe API calls

