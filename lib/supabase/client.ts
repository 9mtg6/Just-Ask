import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase env variables are missing in lib/supabase/client.ts')
}

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase URL and anon key must be configured in .env.local')
  }
  if (SUPABASE_URL.includes('your-project') || SUPABASE_ANON_KEY.includes('your-anon-key')) {
    throw new Error('Supabase URL and anon key appear to be placeholder values')
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
