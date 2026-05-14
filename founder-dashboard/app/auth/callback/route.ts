import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/'

  // Handle OAuth errors (e.g., user denied access)
  if (error) {
    const errorMessage = encodeURIComponent(errorDescription || error)
    return NextResponse.redirect(`${origin}/auth/login?error=${errorMessage}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    // Log exchange error for debugging
    console.error('[auth callback] Code exchange failed:', exchangeError.message)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`)
  }

  return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Missing authorization code.')}`)
}
