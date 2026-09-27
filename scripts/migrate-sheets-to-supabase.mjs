// scripts/migrate-sheets-to-supabase.mjs
// One-off migration: copy existing works from Google Sheets (Sheet1) into the
// Supabase `works` table. Idempotent — rows are upserted on `kode`, so it can be
// re-run safely. Rows that have no kode yet get a deterministic legacy code.
//
// Usage:
//   node scripts/migrate-sheets-to-supabase.mjs            # apply
//   node scripts/migrate-sheets-to-supabase.mjs --dry-run  # read + report only
import { readFileSync } from 'node:fs'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

const DRY_RUN = process.argv.includes('--dry-run')
const SPREADSHEET_RANGE = 'Sheet1!A:T'

// ── env ──────────────────────────────────────────────────────────────────────
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
const required = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SHEETS_ID', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
const missing = required.filter((k) => !env[k])
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(', ')}`)
  process.exit(1)
}

// ── Google Sheets read ───────────────────────────────────────────────────────
const auth = new google.auth.JWT({
  email: env.GOOGLE_CLIENT_EMAIL,
  key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})
const sheets = google.sheets({ version: 'v4', auth })
const res = await sheets.spreadsheets.values.get({
  spreadsheetId: env.GOOGLE_SHEETS_ID,
  range: SPREADSHEET_RANGE,
})

const rows = res.data.values ?? []
console.log(`Sheet rows read (including header): ${rows.length}`)

// ── helpers ──────────────────────────────────────────────────────────────────
const cell = (row, i) => (row?.[i] ?? '').toString().trim()

const MONTHS = {
  januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
  juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
}

// "8 September 2026 pukul 20.09" -> Date (null when unparseable)
function parseTanggal(label) {
  const m = (label || '').match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:\s+pukul\s+(\d{1,2})[.:](\d{2}))?/)
  if (!m) return null
  const month = MONTHS[m[2].toLowerCase()]
  if (month === undefined) return null
  const d = new Date(Date.UTC(Number(m[3]), month, Number(m[1]), Number(m[4] ?? 0), Number(m[5] ?? 0)))
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function toWorkRow(row, sheetRowNumber) {
  const nama = cell(row, 1)
  if (!nama) return null

  const kode = cell(row, 12) || `KK-LEGACY-${String(sheetRowNumber).padStart(4, '0')}`
  const tanggalLabel = cell(row, 0)
  const createdAt = parseTanggal(tanggalLabel)

  const nilaiRaw = cell(row, 14)
  const nilai = nilaiRaw === '' ? null : Number(nilaiRaw)

  const driveCell = cell(row, 10)
  const driveUrl = /^https?:\/\//.test(driveCell) ? driveCell : null

  return {
    kode,
    student_name: nama.slice(0, 200),
    date_label: tanggalLabel || null,
    ...(createdAt ? { created_at: createdAt } : {}),
    fenomena: cell(row, 2),
    pola: cell(row, 3),
    rima_suffix: cell(row, 4),
    rima_words: cell(row, 5),
    line1: cell(row, 6),
    line2: cell(row, 7),
    line3: cell(row, 8),
    line4: cell(row, 9),
    drive_url: driveUrl,
    auto_score: cell(row, 13) === '' ? null : Number(cell(row, 13)),
    grade: Number.isFinite(nilai) ? nilai : null,
    comment: cell(row, 15),
    status: cell(row, 16) || 'BELUM DINILAI',
    gagasan: cell(row, 17),
    pesan: cell(row, 18),
    gallery: cell(row, 19).toUpperCase() === 'YA',
  }
}

// Column L may hold an inline data-URL image for very old rows.
function inlineImage(row) {
  const raw = row?.[11] ?? ''
  return typeof raw === 'string' && raw.startsWith('data:image') ? raw : null
}

const mapped = rows
  .slice(1)
  .map((row, idx) => ({ work: toWorkRow(row, idx + 2), image: inlineImage(row) }))
  .filter((entry) => entry.work)

const skipped = rows.length - 1 - mapped.length
console.log(`Data rows mapped: ${mapped.length} (skipped empty rows: ${skipped})`)

if (DRY_RUN) {
  for (const { work } of mapped) {
    console.log(`  - ${work.kode} | ${work.student_name} | ${work.line1.slice(0, 40)}`)
  }
  console.log('Dry run: nothing written.')
  process.exit(0)
}

// ── Supabase upsert ──────────────────────────────────────────────────────────
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const bucket = env.SUPABASE_BUCKET || 'works-images'

let uploaded = 0
for (const entry of mapped) {
  if (!entry.image) continue
  const base64 = entry.image.replace(/^data:image\/\w+;base64,/, '')
  const { error } = await sb.storage
    .from(bucket)
    .upload(`works/${entry.work.kode}.jpg`, Buffer.from(base64, 'base64'), {
      contentType: 'image/jpeg',
      upsert: true,
    })
  if (error) {
    console.warn(`  ! image upload failed for ${entry.work.kode}: ${error.message}`)
  } else {
    entry.work.image_path = `works/${entry.work.kode}.jpg`
    uploaded++
  }
}

const { data, error } = await sb
  .from('works')
  .upsert(mapped.map((e) => e.work), { onConflict: 'kode' })
  .select('kode')

if (error) {
  console.error(`Upsert failed: ${error.message}`)
  process.exit(1)
}

console.log(`Upserted rows: ${data?.length ?? 0} (inline images uploaded: ${uploaded})`)
