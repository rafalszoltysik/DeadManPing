import { NextResponse } from 'next/server'
import { stripe, PRICING_PLANS } from '@/lib/stripe'

/**
 * Test endpoint to verify Stripe connection and configuration
 * 
 * Usage:
 * GET /api/test/stripe-connection
 * 
 * This endpoint checks:
 * - If Stripe API keys are configured
 * - If connection to Stripe works
 * - If products/price IDs are configured correctly
 */
export async function GET() {
  const results: {
    status: 'success' | 'error' | 'warning'
    message: string
    details?: any
  }[] = []

  // Check 1: API Keys configured
  if (!process.env.STRIPE_SECRET_KEY) {
    results.push({
      status: 'error',
      message: 'STRIPE_SECRET_KEY is not configured',
    })
    return NextResponse.json({ results }, { status: 500 })
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    results.push({
      status: 'error',
      message: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured',
    })
    return NextResponse.json({ results }, { status: 500 })
  }

  // Check 2: Verify API key type (test vs live)
  const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')
  const isLiveMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')

  if (!isTestMode && !isLiveMode) {
    results.push({
      status: 'error',
      message: 'Invalid STRIPE_SECRET_KEY format (should start with sk_test_ or sk_live_)',
    })
  } else if (isTestMode) {
    results.push({
      status: 'success',
      message: '✅ Using TEST mode API keys (safe for testing)',
      details: {
        keyType: 'test',
        note: 'No real charges will be made',
      },
    })
  } else if (isLiveMode) {
    results.push({
      status: 'warning',
      message: '⚠️ Using LIVE mode API keys (real charges will be made!)',
      details: {
        keyType: 'live',
        note: 'Be careful - these keys will charge real money!',
      },
    })
  }

  // Check 3: Test Stripe API connection
  try {
    const account = await stripe.accounts.retrieve()
    results.push({
      status: 'success',
      message: '✅ Successfully connected to Stripe API',
      details: {
        accountId: account.id,
        country: account.country,
        defaultCurrency: account.default_currency,
      },
    })
  } catch (error: any) {
    results.push({
      status: 'error',
      message: '❌ Failed to connect to Stripe API',
      details: {
        error: error.message,
      },
    })
    return NextResponse.json({ results }, { status: 500 })
  }

  // Check 4: Verify Price IDs are configured
  const priceIds = {
    starter: process.env.STRIPE_PRICE_ID_STARTER,
    pro: process.env.STRIPE_PRICE_ID_PRO,
    team: process.env.STRIPE_PRICE_ID_TEAM,
    // Legacy support
    solo: process.env.STRIPE_PRICE_ID_SOLO,
    agency: process.env.STRIPE_PRICE_ID_AGENCY,
  }

  const configuredPrices: string[] = []
  const missingPrices: string[] = []

  Object.entries(priceIds).forEach(([plan, priceId]) => {
    if (priceId && priceId.startsWith('price_')) {
      configuredPrices.push(`${plan}: ${priceId}`)
    } else {
      missingPrices.push(plan)
    }
  })

  if (configuredPrices.length > 0) {
    results.push({
      status: 'success',
      message: `✅ Configured Price IDs: ${configuredPrices.length}`,
      details: {
        configured: configuredPrices,
      },
    })
  }

  if (missingPrices.length > 0) {
    results.push({
      status: 'warning',
      message: `⚠️ Missing Price IDs: ${missingPrices.join(', ')}`,
      details: {
        missing: missingPrices,
        note: 'Some plans may not work without Price IDs',
      },
    })
  }

  // Check 5: Verify Price IDs exist in Stripe (optional - only if configured)
  if (configuredPrices.length > 0) {
    const priceIdToCheck = priceIds.starter || priceIds.pro || priceIds.team || priceIds.solo || priceIds.agency
    if (priceIdToCheck) {
      try {
        const price = await stripe.prices.retrieve(priceIdToCheck)
        results.push({
          status: 'success',
          message: `✅ Price ID verified: ${priceIdToCheck}`,
          details: {
            priceId: price.id,
            amount: price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'N/A',
            currency: price.currency,
            active: price.active,
          },
        })
      } catch (error: any) {
        results.push({
          status: 'error',
          message: `❌ Price ID not found in Stripe: ${priceIdToCheck}`,
          details: {
            error: error.message,
            note: 'Make sure the Price ID exists in your Stripe account (test mode if using test keys)',
          },
        })
      }
    }
  }

  // Check 6: Webhook secret
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    results.push({
      status: 'success',
      message: '✅ STRIPE_WEBHOOK_SECRET is configured',
    })
  } else {
    results.push({
      status: 'warning',
      message: '⚠️ STRIPE_WEBHOOK_SECRET is not configured',
      details: {
        note: 'Webhooks will not work without this. Use: stripe listen --forward-to localhost:3000/api/webhooks/stripe',
      },
    })
  }

  // Summary
  const hasErrors = results.some((r) => r.status === 'error')
  const hasWarnings = results.some((r) => r.status === 'warning')

  const summary = {
    overall: hasErrors ? 'error' : hasWarnings ? 'warning' : 'success',
    totalChecks: results.length,
    passed: results.filter((r) => r.status === 'success').length,
    warnings: results.filter((r) => r.status === 'warning').length,
    errors: results.filter((r) => r.status === 'error').length,
  }

  return NextResponse.json(
    {
      summary,
      results,
      recommendations: hasErrors
        ? [
            'Fix all errors before testing payments',
            'Make sure you are using test mode keys (sk_test_...) for testing',
            'Verify Price IDs exist in Stripe Dashboard (test mode)',
          ]
        : hasWarnings
          ? [
              'Configure missing Price IDs for all plans',
              'Set up webhook secret for webhook testing',
            ]
          : [
              '✅ All checks passed! You can now test payments with test cards',
              'Use card: 4242 4242 4242 4242 for successful payments',
              'Run: stripe listen --forward-to localhost:3000/api/webhooks/stripe',
            ],
    },
    { status: hasErrors ? 500 : 200 }
  )
}

