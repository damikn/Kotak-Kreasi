// scripts/test-supabase.mjs
// Smoke test for the Supabase backend used by kotak-kreasi.
// Verifies: env config, `works` table, storage bucket, insert → read → grade → delete.
//
// Usage:
//   node scripts/test-supabase.mjs            # read-only checks
//   node scripts/test-supabase.mjs --write     # also exercise insert/grade/delete with a throwaway row
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const WRITE = process.argv.includes('--write')

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
const url = env.SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
const bucket = env.SUPABASE_BUCKET || 'works-images'

// Accepts the new `sb_secret_…` key and the legacy service_role JWT.
const keyOk = typeof key === 'string' && key.length >= 20 && !key.includes('REDACTED')
  && (key.startsWith('sb_secret_') || key.startsWith('eyJ'))

let failures = 0
const ok = (m) => console.log(`OK   ${m}`)
const bad = (m) => { failures++; console.log(`FAIL ${m}`) }

if (!url?.startsWith('https://')) bad(`SUPABASE_URL missing/invalid (${url || 'empty'})`)
if (!keyOk) bad('SUPABASE_SERVICE_ROLE_KEY / secret key missing or not a recognized format')
if (failures) process.exit(1)

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

// 1. table reachable (RLS is bypassed by service_role)
const { data: probe, error: tableErr } = await sb.from('works').select('id').limit(1)
if (tableErr) bad(`works table: ${tableErr.code || ''} ${tableErr.message}`)
else ok('works table reachable')

const { count, error: countErr } = await sb.from('works').select('id', { count: 'exact', head: true })
if (countErr) bad(`works count: ${countErr.code || ''} ${countErr.message}`)
else if (!tableErr) ok(`works row count: ${count ?? 0}`)

// 2. bucket reachable
const { data: buckets, error: bucketErr } = await sb.storage.listBuckets()
if (bucketErr) bad(`storage: ${bucketErr.message}`)
else if (!buckets.some((b) => b.name === bucket)) bad(`bucket "${bucket}" not found (have: ${buckets.map(b => b.name).join(', ') || 'none'})`)
else ok(`bucket "${bucket}" present (public: ${buckets.find(b => b.name === bucket).public})`)

// 3. anon key must NOT be able to read the table (RLS has no policies)
const anonKey = env.SUPABASE_ANON_KEY
if (anonKey) {
  const anon = createClient(url, anonKey, { auth: { persistSession: false } })
  const { data } = await anon.from('works').select('id').limit(1)
  if (data?.length) bad('anon key can read works — RLS is not blocking it')
  else ok('anon key cannot read works (RLS denies all)')
}

if (WRITE && failures === 0) {
  const kode = `KK-TEST-${Date.now().toString(36).toUpperCase()}`
  const { error: insErr } = await sb.from('works').insert({
    kode,
    student_name: 'Smoke Test',
    fenomena: 'uji',
    line1: 'jalan jalan ke kota padang',
    line2: 'beli kain untuk selendang',
    line3: 'rajin belajar jangan menyerah',
    line4: 'ilmu bermanfaat sampai ke padang',
    auto_score: 42,
  })
  if (insErr) bad(`insert: ${insErr.message}`)
  else ok(`insert ${kode}`)

  const { data: row, error: readErr } = await sb.from('works').select('*').eq('kode', kode).maybeSingle()
  if (readErr || !row) bad(`read back: ${readErr?.message ?? 'row not found'}`)
  else ok(`read back ok (status: ${row.status}, gallery: ${row.gallery})`)

  const { error: gradeErr } = await sb.from('works')
    .update({ grade: 88, comment: 'smoke test', status: 'SUDAH DINILAI', gallery: true })
    .eq('kode', kode)
  if (gradeErr) bad(`grade update: ${gradeErr.message}`)
  else ok('grade update ok')

  // storage round-trip with a tiny JPEG
  const jpeg = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==', 'base64')
  const { error: upErr } = await sb.storage.from(bucket).upload(`works/${kode}.jpg`, jpeg, { contentType: 'image/jpeg', upsert: true })
  if (upErr) bad(`image upload: ${upErr.message}`)
  else ok('image upload ok')

  const { data: signed, error: signErr } = await sb.storage.from(bucket).createSignedUrl(`works/${kode}.jpg`, 60)
  if (signErr || !signed?.signedUrl) bad(`signed url: ${signErr?.message ?? 'empty'}`)
  else ok(`signed url created (${signed.signedUrl.length} chars)`)

  // cleanup
  await sb.storage.from(bucket).remove([`works/${kode}.jpg`])
  const { error: delErr } = await sb.from('works').delete().eq('kode', kode)
  if (delErr) bad(`cleanup delete: ${delErr.message}`)
  else ok('cleanup ok (row + image removed)')
}

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
