import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-12 sm:mt-16 lg:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              <span className="font-bold text-xl sm:text-2xl">
                <span className="text-foreground">DeadMan</span>
                <span className="text-primary">Ping</span>
              </span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Simple monitoring for your cron jobs and scheduled tasks.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-smooth">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/terms" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/opt-out" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Analytics Opt-Out
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DeadManPing. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

