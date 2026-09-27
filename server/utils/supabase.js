// server/utils/supabase.js
// Server-only Supabase client factory.
//
// The service_role key bypasses RLS, so it must never leave the server: this
// module is imported by server/utils and server/api only. Client bundles read
// nothing from runtimeConfig keys prefixed without NUXT_PUBLIC_.
import { createClient } from '@supabase/supabase-js'

export const DEFAULT_BUCKET = 'works-images'

// Accepts both key generations: the new secret key (`sb_secret_…`) and the
// legacy `service_role` JWT. Placeholders from .env.example must never pass.
function isPlausibleKey(key) {
  if (typeof key !== 'string') return false
  const k = key.trim()
  if (k.length < 20 || k.includes('REDACTED') || k.includes('<')) return false
  return k.startsWith('sb_secret_') || k.startsWith('eyJ')
}

// Throws the exact Indonesian message the UI surfaces when config is missing.
export function getSupabase(config) {
  const url = config.supabaseUrl
  const key = config.supabaseServiceRoleKey

  if (!url?.startsWith('https://') || !isPlausibleKey(key)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Konfigurasi Supabase belum diisi dengan URL dan service key yang valid.',
    })
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-application-name': 'kotak-kreasi' } },
  })
}

export function getBucket(config) {
  return config.supabaseBucket || DEFAULT_BUCKET
}
