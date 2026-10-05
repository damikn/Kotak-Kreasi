// scripts/delete-dummy.mjs
// Removes every demo row seeded by scripts/seed-dummy.mjs (kode LIKE 'KK-DUMMY-%')
// together with its stored card image. Real student works are never touched.
//
// Usage:
//   node scripts/delete-dummy.mjs           # dry run: list what would be removed
//   node scripts/delete-dummy.mjs --apply    # actually delete
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')

function loadEnv(path = resolve(ROOT, '.env')) {
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue
    const i = line.indexOf('=')
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, '')
  }
  return out
}

const env = loadEnv()
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const bucket = env.SUPABASE_BUCKET || 'works-images'

const { data, error } = await sb.from('works').select('kode,student_name,class_name,image_path').like('kode', 'KK-DUMMY-%')
if (error) {
  console.error(`Read failed: ${error.message}`)
  process.exit(1)
}

console.log(`Demo rows found: ${data.length}`)
for (const row of data) console.log(`  - ${row.kode} | ${row.student_name} | ${row.class_name || '-'} | ${row.image_path || 'no image'}`)

if (!data.length) process.exit(0)
if (!APPLY) {
  console.log('\nDry run — nothing deleted. Re-run with --apply to remove them.')
  process.exit(0)
}

const images = data.filter((r) => r.image_path).map((r) => r.image_path)
if (images.length) {
  const { error: rmErr } = await sb.storage.from(bucket).remove(images)
  if (rmErr) console.warn(`Image removal warning: ${rmErr.message}`)
  else console.log(`Images removed: ${images.length}`)
}

const { error: delErr } = await sb.from('works').delete().like('kode', 'KK-DUMMY-%')
if (delErr) {
  console.error(`Delete failed: ${delErr.message}`)
  process.exit(1)
}

const { count } = await sb.from('works').select('id', { count: 'exact', head: true })
const { data: left } = await sb.storage.from(bucket).list('works', { limit: 1000 })
console.log(`Demo rows deleted. Remaining works: ${count} | storage objects: ${(left || []).length}`)
