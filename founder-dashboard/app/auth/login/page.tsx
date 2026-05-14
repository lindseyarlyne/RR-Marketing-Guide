'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isFounderUser } from '@/lib/founder-tasks'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) {
      setError(urlError)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signError) {
      if (signError.message.includes('Invalid login credentials')) {
        setError('Invalid email or password.')
      } else if (signError.message.includes('Email not confirmed')) {
        setError('Please check your email to confirm your account first.')
      } else {
        setError(signError.message || 'Unable to sign in. Please try again.')
      }
      setIsLoading(false)
      return
    }

    if (!data.user || !isFounderUser(data.user.email)) {
      await supabase.auth.signOut()
      setError('This workspace is only for the Ritual Runway founder account.')
      setIsLoading(false)
      return
    }

    const next = searchParams.get('next')
    router.push(next && next.startsWith('/') ? next : '/dashboard')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl italic text-foreground">
          <span className="text-primary">Founder</span> OS
        </h1>
        <p className="text-muted-foreground mt-2 mb-2 text-sm leading-relaxed">
          Same Supabase login as ritualrunway.com. You must use the founder email for this site.
        </p>
      </div>

      <form onSubmit={handleLogin} className="bg-card rounded-xl border border-border p-6 space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
            placeholder="Password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-mono-accent text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity min-h-[48px]"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center mt-6 text-muted-foreground text-sm">
        Need the consumer app?{' '}
        <Link href="https://ritualrunway.com" className="text-primary hover:underline">
          ritualrunway.com
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm text-center py-12">
          <h1 className="font-serif text-3xl italic text-foreground">
            <span className="text-primary">Founder</span> OS
          </h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
