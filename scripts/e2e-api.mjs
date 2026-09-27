// scripts/temp/e2e.mjs — temporary end-to-end check of the Supabase-backed API.
// Creates a work through POST /api/save-pantun, reads it back through the teacher
// routes, grades it, checks the gallery feed and the signed-URL image route,
// then removes the test row and image.
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const BASE = process.env.E2E_BASE || 'http://localhost:3212'
const PIN = process.env.E2E_PIN
const env = Object.fromEntries(readFileSync('.env', 'utf8').split('\n')
  .filter((l) => l && !l.trim().startsWith('#') && l.includes('='))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] }))

let fails = 0
const sha = (b) => createHash('sha256').update(b).digest('hex')
const ok = (m) => console.log(`OK   ${m}`)
const bad = (m) => { fails++; console.log(`FAIL ${m}`) }
const j = async (r) => { try { return await r.json() } catch { return null } }

// Real (tiny) JPEG so the storage round-trip is byte-comparable
const jpeg = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==', 'base64')
const jpegSha = sha(jpeg)

const lines = [
  'sore-sore pergi ke taman',
  'membeli roti sambil berjalan',
  'rajin belajar sepanjang zaman',
  'supaya hidup penuh harapan',
]

// ── 1. save through the real route ───────────────────────────────────────────
const saveRes = await fetch(`${BASE}/api/save-pantun`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    studentName: 'E2E Waguri',
    phenomena: 'Uji Otomatis',
    gagasan: 'gagasan uji',
    pesan: 'pesan uji',
    pola: 'Pola 10 — Isi Ajakan',
    rima: {
      suffix: '-an', words: ['taman', 'jalan'],
      rimaA: { suffix: '-an', words: ['taman', 'berjalan'] },
      rimaB: { suffix: '-an', words: ['zaman', 'harapan'] },
    },
    pantunLines: lines,
    imageBase64: `data:image/jpeg;base64,${jpeg.toString('base64')}`,
  }),
})
const saved = await j(saveRes)
if (saveRes.status !== 200 || !saved?.kodeKarya) bad(`save-pantun → HTTP ${saveRes.status} ${JSON.stringify(saved)}`)
else ok(`save-pantun → kode ${saved.kodeKarya}, skor ${saved.autoScore}, image status ${saved.driveStatus}, url ${saved.driveUrl}`)

const kode = saved?.kodeKarya

// ── 2. teacher list, wrong PIN then right PIN ────────────────────────────────
const wrongPin = await fetch(`${BASE}/api/guru/works?pin=nope`)
if (wrongPin.status !== 401) bad(`wrong PIN → HTTP ${wrongPin.status} (expected 401)`)
else ok('wrong PIN → 401')

const listRes = await fetch(`${BASE}/api/guru/works?pin=${encodeURIComponent(PIN)}`)
const list = await j(listRes)
const mine = list?.works?.find((w) => w.kode === kode)
if (!mine) bad(`guru/works does not contain ${kode}`)
else ok(`guru/works → ${list.works.length} rows, test row present (nama "${mine.nama}", tanggal "${mine.tanggal}", skorAuto ${mine.skorAuto})`)

if (mine?.baris?.join('|') !== lines.join('|')) bad(`lines mismatch: ${JSON.stringify(mine?.baris)}`)
else ok('pantun lines round-trip intact')

// ── 3. detail ────────────────────────────────────────────────────────────────
const detailRes = await fetch(`${BASE}/api/guru/works/${kode}?pin=${encodeURIComponent(PIN)}`)
const detail = await j(detailRes)
if (detailRes.status !== 200 || !detail?.work) bad(`detail → HTTP ${detailRes.status}`)
else ok(`detail → status ${detail.work.status}, nilai ${detail.work.nilai}, validation score ${detail.validation?.score}`)

// ── 4. grade + gallery flag ──────────────────────────────────────────────────
const gradeRes = await fetch(`${BASE}/api/guru/works/${kode}/grade`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ pin: PIN, nilai: 90, komentar: 'e2e otomatis', tampilGaleri: true }),
})
const graded = await j(gradeRes)
if (gradeRes.status !== 200 || graded?.nilai !== 90 || graded?.tampilGaleri !== true) bad(`grade → HTTP ${gradeRes.status} ${JSON.stringify(graded)}`)
else ok(`grade → nilai ${graded.nilai}, status "${graded.status}", galeri ${graded.tampilGaleri}`)

const badGrade = await fetch(`${BASE}/api/guru/works/${kode}/grade`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ pin: PIN, nilai: 150 }),
})
if (badGrade.status !== 400) bad(`out-of-range grade → HTTP ${badGrade.status} (expected 400)`)
else ok('out-of-range grade rejected with 400')

// ── 5. gallery feed (teacher-approved, first name only) ──────────────────────
const feedRes = await fetch(`${BASE}/api/karya/pilihan`)
const feed = await j(feedRes)
const inFeed = feed?.works?.find((w) => w.kode === kode)
if (!inFeed) bad('gallery feed does not contain the approved work')
else if (inFeed.nama !== 'E2E') bad(`gallery exposes full name: "${inFeed.nama}"`)
else ok(`gallery feed → ${feed.works.length} work(s), name truncated to "${inFeed.nama}"`)

// ── 6. image route → signed URL → bytes match ────────────────────────────────
const imgRes = await fetch(`${BASE}/api/karya/gambar/${kode}`, { redirect: 'manual' })
const location = imgRes.headers.get('location')
if (imgRes.status !== 302 || !location) bad(`image route → HTTP ${imgRes.status} (expected 302)`)
else {
  const fetched = await fetch(location)
  const bytes = Buffer.from(await fetched.arrayBuffer())
  if (sha(bytes) !== jpegSha) bad(`signed URL bytes differ (${bytes.length}B, expected ${jpeg.length}B)`)
  else ok(`image route → 302 to signed URL, ${bytes.length}B, sha256 matches`)
  if (!/token=/.test(location)) bad('signed URL has no token (bucket may be public)')
  else ok('signed URL carries a token (private bucket)')
}

// ── cleanup ──────────────────────────────────────────────────────────────────
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
if (kode) {
  await sb.storage.from(env.SUPABASE_BUCKET || 'works-images').remove([`works/${kode}.jpg`])
  const { error } = await sb.from('works').delete().eq('kode', kode)
  if (error) bad(`cleanup: ${error.message}`)
  else ok('cleanup: test row + image removed')
}

console.log(fails === 0 ? '\nE2E: all checks passed.' : `\nE2E: ${fails} check(s) failed.`)
process.exit(fails === 0 ? 0 : 1)
