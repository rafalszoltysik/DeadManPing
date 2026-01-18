import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/session'
import { createClient } from '@supabase/supabase-js'
import { getCachedPrices, type Currency, type PlanKey } from '@/lib/stripe-prices'
import { PLAN_FEATURES } from '@/lib/stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Pobierz currency z workspace
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('currency')
      .eq('owner_id', session.userId)
      .limit(1)
      .maybeSingle()

    const currency = (workspace?.currency || 'usd') as Currency

    // Pobierz ceny z Stripe
    const prices = await getCachedPrices()

    // Zbuduj odpowiedź z planami i cenami
    const plans = (['starter', 'pro', 'team'] as PlanKey[]).map((planKey) => {
      const priceInfo = prices.get(planKey)?.get(currency)
      const features = PLAN_FEATURES[planKey]

      return {
        key: planKey,
        name: features.name,
        amount: priceInfo?.amount || 0,
        currency: currency,
        priceId: priceInfo?.priceId || null,
        monitors: features.monitors,
        minInterval: features.minInterval,
        maxMembers: features.maxMembers,
      }
    })

    return NextResponse.json({ plans, currency })
  } catch (error: any) {
    console.error('Error fetching prices:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}

