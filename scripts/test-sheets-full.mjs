// scripts/test-sheets-full.mjs
// Test lengkap: koneksi Sheets + tulis data pantun nyata
import { google } from 'googleapis'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const content = readFileSync(resolve(__dir, '../.env'), 'utf-8')
  const env = {}
  for (const line of content.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq < 0) continue
    const key = t.slice(0, eq).trim()
    let val = t.slice(eq + 1).trim()
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    env[key] = val
  }
  return env
}

const env = loadEnv()
const G = { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', b: '\x1b[1m', x: '\x1b[0m' }
const ok   = m => console.log(`${G.g}✓${G.x} ${m}`)
const fail = m => console.log(`${G.r}✗${G.x} ${m}`)
const bold = m => console.log(`${G.b}${m}${G.x}`)

async function main() {
  bold('\n🧪 Full Sheets Test\n')
  bold(`Service Account : ${env.GOOGLE_CLIENT_EMAIL}`)
  bold(`Sheets ID       : ${env.GOOGLE_SHEETS_ID}\n`)

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.GOOGLE_CLIENT_EMAIL,
      private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  })
  const client = await auth.getClient()
  const sheets = google.sheets({ version: 'v4', auth: client })

  // ── 1. Cek akses spreadsheet ───────────────────────────
  bold('1. Cek akses Spreadsheet')
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: env.GOOGLE_SHEETS_ID })
    ok(`Spreadsheet: "${meta.data.properties.title}"`)
  } catch (e) {
    fail(`Tidak bisa akses: ${e.message}`)
    console.log(`\n${G.y}⚠️  Share spreadsheet ke:`)
    console.log(`   ${env.GOOGLE_CLIENT_EMAIL}`)
    console.log(`   URL: https://docs.google.com/spreadsheets/d/${env.GOOGLE_SHEETS_ID}${G.x}`)
    process.exit(1)
  }

  // ── 2. Pastikan header ada ─────────────────────────────
  bold('\n2. Cek / buat header row')
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SHEETS_ID,
    range: 'Sheet1!A1:L1',
  })
  const headers = ['Tanggal','Nama Siswa','Fenomena','Pola','Suffix Rima',
                   'Kata Rima','Baris 1','Baris 2','Baris 3','Baris 4',
                   'Link Drive','Gambar (Base64)']

  if (!headerRes.data.values?.[0]?.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SHEETS_ID,
      range: 'Sheet1!A1:L1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [headers] },
    })
    ok('Header row dibuat')
  } else {
    ok(`Header: ${headerRes.data.values[0].join(', ')}`)
  }

  // ── 3. Tulis baris data test ───────────────────────────
  bold('\n3. Tulis data pantun test ke Sheets')
  const tanggal = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const writeRes = await sheets.spreadsheets.values.append({
    spreadsheetId: env.GOOGLE_SHEETS_ID,
    range: 'Sheet1!A:L',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        tanggal,
        'Siswa Test Otomatis',
        'Penggunaan Media Sosial Berlebihan',
        'Pola 3 — Repetisi pada Akhir dan Awal Sampiran',
        '-a',
        'cahaya, karya, budaya',
        'Pergi ke pasar membeli mangga,',
        'Mangga manis dibawa pulang,',
        'Jaga diri dari godaan dunia,',
        'Agar hidup penuh cahaya dan karya.',
        '(test — tidak ada foto)',
        '[base64 test kosong]',
      ]],
    },
  })
  ok(`Baris ditulis di: ${writeRes.data.updates?.updatedRange}`)

  // ── 4. Baca kembali untuk verifikasi ──────────────────
  bold('\n4. Verifikasi data tersimpan')
  const rowIdx = writeRes.data.updates?.updatedRange?.match(/(\d+)$/)?.[1]
  if (rowIdx) {
    const read = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SHEETS_ID,
      range: `Sheet1!A${rowIdx}:L${rowIdx}`,
    })
    const row = read.data.values?.[0] ?? []
    ok(`Nama   : ${row[1]}`)
    ok(`Pantun : ${row[6]} / ${row[7]} / ${row[8]} / ${row[9]}`)
  }

  // ── 5. Hapus baris test (cleanup) ─────────────────────
  bold('\n5. Cleanup baris test')
  const allRows = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SHEETS_ID, range: 'Sheet1!A:A',
  })
  const lastRow = (allRows.data.values?.length ?? 1) - 1 // 0-indexed

  // Dapat sheetId dari metadata
  const meta2 = await sheets.spreadsheets.get({ spreadsheetId: env.GOOGLE_SHEETS_ID })
  const sheetId = meta2.data.sheets?.[0]?.properties?.sheetId ?? 0

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: env.GOOGLE_SHEETS_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: lastRow, endIndex: lastRow + 1 },
        },
      }],
    },
  })
  ok('Baris test dihapus')

  bold('\n════════════════════════════════════')
  bold('✅ SEMUA TEST BERHASIL!')
  bold('   Google Sheets siap digunakan.')
  bold('════════════════════════════════════\n')
  console.log(`🔗 Spreadsheet: https://docs.google.com/spreadsheets/d/${env.GOOGLE_SHEETS_ID}\n`)
}

main().catch(e => { console.error('\nFatal:', e.message); process.exit(1) })
