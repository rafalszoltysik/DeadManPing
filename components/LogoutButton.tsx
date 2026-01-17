'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    // Use form submission to POST to logout route - this ensures cookies are sent and processed correctly
    // Create a form and submit it programmatically
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/auth/logout'
    document.body.appendChild(form)
    form.submit()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg hover:bg-accent transition-smooth text-left"
    >
      Logout
    </button>
  )
}

