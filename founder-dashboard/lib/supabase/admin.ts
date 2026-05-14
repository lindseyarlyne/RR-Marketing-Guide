import "server-only"
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseAdmin(): SupabaseClient<any, 'public', any> {
  const url =
    process.env.NEXT_PUBLIC_RITUAL_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.RITUAL_SUPABASE_URL ||
    process.env.SUPABASE_URL
  const key =
    process.env.RITUAL_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase admin env vars missing. Set NEXT_PUBLIC_RITUAL_SUPABASE_URL and RITUAL_SUPABASE_SERVICE_ROLE_KEY in Vercel.'
    )
  }
  return createClient(url, key)
}
