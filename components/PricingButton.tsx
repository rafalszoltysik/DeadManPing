'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface PricingButtonProps {
  plan: 'starter' | 'pro' | 'team'
  isPrimary?: boolean
  children: React.ReactNode
}

export function PricingButton({ plan, isPrimary = false, children }: PricingButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // Zalogowany - idź do billing z wybranym planem
        router.push(`/dashboard/billing?plan=${plan}`)
      } else {
        // Niezalogowany - idź do signup bez parametru plan
        router.push('/auth/signup')
      }
    } catch (error) {
      console.error('Error checking session:', error)
      // W razie błędu, przekieruj do signup (bezpieczniejsze)
      router.push('/auth/signup')
    }
  }

  const baseClasses = "block w-full text-center px-4 py-3 rounded-md font-medium transition-smooth"
  const primaryClasses = "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
  const secondaryClasses = "bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth"

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseClasses} ${isPrimary ? primaryClasses : secondaryClasses} disabled:opacity-50`}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  )
}

