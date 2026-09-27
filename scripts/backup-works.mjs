// scripts/backup-works.mjs
// Weekly backup of the Supabase `works` table + storage object inventory.
// Writes one JSON file per run and keeps the newest N files.
//
// Usage:
//   node scripts/backup-works.mjs
//   BACKUP_DIR=/somewhere BACKUP_KEEP=10 node scripts/backup-works.mjs
import { readFileSync, mkdirSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const BACKUP_DIR = process.env.BACKUP_DIR || '/home/ubuntu/scripts/kotak-kreasi/backups'
const BACKUP_KEEP = Number(process.env.BACKUP_KEEP || 5)

function loadEnv(path = '.env') {
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue
    const i = line.indexOf('=')
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, '')
  }
  return out
}

const env = loadEnv()
if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in .env — nothing to back up.')
  process.exit(1)
}

const bucket = env.SUPABASE_BUCKET || 'works-images'
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data: works, error } = await sb.from('works').select('*').order('created_at', { ascending: true })
if (error) {
  console.error(`Backup failed: ${error.message}`)
  process.exit(1)
}

const { data: objects, error: storageError } = await sb.storage.from(bucket).list('works', { limit: 1000 })
if (storageError) console.warn(`Storage listing warning: ${storageError.message}`)

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const payload = {
  created_at: new Date().toISOString(),
  source: env.SUPABASE_URL,
  bucket,
  table: 'works',
  row_count: works?.length ?? 0,
  rows: works ?? [],
  storage_objects: (objects ?? []).map((o) => o.name),
}

mkdirSync(BACKUP_DIR, { recursive: true })
const file = resolve(BACKUP_DIR, `works-${stamp}.json`)
writeFileSync(file, JSON.stringify(payload, null, 2))

// Retention
const files = readdirSync(BACKUP_DIR)
  .filter((f) => f.startsWith('works-') && f.endsWith('.json'))
  .sort()
  .reverse()
for (const old of files.slice(BACKUP_KEEP)) {
  unlinkSync(resolve(BACKUP_DIR, old))
}

console.log(`Backup written: ${file} (${payload.row_count} rows, ${payload.storage_objects.length} images)`)
