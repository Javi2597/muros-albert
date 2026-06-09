import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente de Supabase para componentes cliente ('use client').
 * Singleton para evitar múltiples instancias.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
