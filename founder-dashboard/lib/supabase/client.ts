import { createBrowserClient } from '@supabase/ssr'

let cachedClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return cached client if available
  if (cachedClient) return cachedClient
  
  const url = process.env.NEXT_PUBLIC_RITUAL_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_RITUAL_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // During build time, return a placeholder that will be replaced at runtime
  if (!url || !key) {
    // This will only happen during static build, throw a clear error
    throw new Error('Supabase environment variables are not set')
  }
  
  cachedClient = createBrowserClient(url, key)
  return cachedClient
}
