// scripts/setup-guru.mjs
// One-shot provisioning for the teacher dashboard:
//   1. Reads .env (must have GOOGLE_* set)
//   2. Verifies Sheets access + writes headers A1:Q1
//   3. Ensures "Penilaian" summary tab exists (with header row)
//   4. Optionally creates a Shared Drive folder for images
// Jalankan: node scripts/setup-guru.mjs
import { google } from 'googleapis'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const envPath = resolve(__dirname, '../.env')
  if (!existsSync(envPath)) {
    console.error('❌ .env tidak ditemukan. Salin .env.example dan isi dulu.')
    process.exit(1)
  }
  const content = readFileSync(envPath, 'utf-8')
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

const G = { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', b: '\x1b[1m', x: '\x1b[0m' }
const ok = (m) => console.log(`${G.g}✓${G.x} ${m}`)
const fail = (m) => console.log(`${G.r}✗${G.x} ${m}`)
const info = (m) => console.log(`${G.y}i${G.x} ${m}`)
const bold = (m) => console.log(`${G.b}${m}${G.x}`)

const SHEET_HEADERS = [
  'Tanggal', 'Nama Siswa', 'Fenomena', 'Pola', 'Suffix Rima', 'Kata Rima',
  'Baris 1', 'Baris 2', 'Baris 3', 'Baris 4', 'Link Drive', 'Gambar (Base64)',
  'Kode Karya', 'Skor Auto', 'Nilai Guru', 'Komentar', 'Status',
]

const PENILAIAN_HEADERS = [
  'Nama Siswa', 'Kode Karya', 'Fenomena', 'Pola',
  'Baris 1', 'Baris 2', 'Baris 3', 'Baris 4', 'Skor Auto', 'Status',
]

async function main() {
  bold('\n🔧 SETUP DASHBOARD GURU — KOTAK KREASI\n')

  const env = loadEnv()
  const required = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SHEETS_ID']
  let envOk = true
  for (const key of required) {
    if (env[key] && env[key].length > 10) ok(`${key} terisi`)
    else { fail(`${key} kosong / tidak valid`); envOk = false }
  }
  if (!envOk) {
    fail('\n⛔ Lengkapi .env dulu. Lihat .env.example')
    process.exit(1)
  }

  if (env.GURU_PIN) ok(`GURU_PIN terisi (${env.GURU_PIN.length} digit)`)
  else info('GURU_PIN belum diset — set di .env untuk mengamankan /guru')

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.GOOGLE_CLIENT_EMAIL,
      private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  })
  const client = await auth.getClient()
  const sheets = google.sheets({ version: 'v4', auth: client })
  const drive = google.drive({ version: 'v3', auth: client })

  // ── 1. Verifikasi akses spreadsheet ──
  bold('\n1. Akses Spreadsheet')
  let meta
  try {
    meta = await sheets.spreadsheets.get({ spreadsheetId: env.GOOGLE_SHEETS_ID })
    ok(`Spreadsheet: "${meta.data.properties.title}"`)
  } catch (e) {
    fail(`Tidak bisa akses: ${e.message}`)
    console.log(`\n⚠️  Share spreadsheet (role Editor) ke: ${env.GOOGLE_CLIENT_EMAIL}`)
    console.log(`   URL: https://docs.google.com/spreadsheets/d/${env.GOOGLE_SHEETS_ID}\n`)
    process.exit(1)
  }

  // ── 2. Header Sheet1 ──
  bold('\n2. Header Sheet1 (A1:Q1)')
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SHEETS_ID,
    range: 'Sheet1!A1:Q1',
  })
  const existing = headerRes.data.values?.[0] ?? []
  if (existing.length >= SHEET_HEADERS.length) {
    ok('Header sudah ada')
  } else {
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SHEETS_ID,
      range: 'Sheet1!A1:Q1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [SHEET_HEADERS] },
    })
    ok('Header Sheet1 dibuat (17 kolom)')
  }

  // ── 3. Tab Penilaian ──
  bold('\n3. Tab "Penilaian"')
  const sheetList = meta.data.sheets ?? []
  const tab = sheetList.find((s) => (s.properties?.title || '').toLowerCase() === 'penilaian')
  if (tab) {
    ok(`Tab Penilaian sudah ada (sheetId: ${tab.properties.sheetId})`)
  } else {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: env.GOOGLE_SHEETS_ID,
      requestBody: {
        requests: [{
          addSheet: { properties: { title: 'Penilaian', gridProperties: { rowCount: 2, columnCount: 10 } } },
        }],
      },
    })
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SHEETS_ID,
      range: "'Penilaian'!A1:J1",
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [PENILAIAN_HEADERS] },
    })
    ok('Tab Penilaian dibuat + header ditulis')
  }

  // ── 4. Shared Drive opsional ──
  bold('\n4. Google Drive (opsional)')
  if (env.GOOGLE_DRIVE_FOLDER_ID) {
    try {
      const folderRes = await drive.files.get({
        fileId: env.GOOGLE_DRIVE_FOLDER_ID,
        fields: 'id,name,driveId',
        supportsAllDrives: true,
      })
      const isShared = !!folderRes.data?.driveId
      ok(`Folder drive: "${folderRes.data?.name}"${isShared ? ' (Shared Drive)' : ' (My Drive — service account tidak bisa upload)'}`)
      if (!isShared) {
        info('Gambar tidak akan ter-upload. Gunakan Shared Drive + isi GOOGLE_DRIVE_FOLDER_ID dengan ID shared drive.')
      }
    } catch {
      info('GOOGLE_DRIVE_FOLDER_ID ada tapi tidak bisa diakses — biarkan kosong jika tidak dipakai.')
    }
  } else {
    info('GOOGLE_DRIVE_FOLDER_ID kosong — gambar tidak akan di-upload ke Drive (tetap disimpan di Sheets sebagai base64 kecil / placeholder).')
  }

  bold('\n══════════════════════════════════════════')
  bold('✅ SETUP SELESAI!')
  bold('   Restart server:  node .output/server/index.mjs')
  bold('   Buka dashboard:  /guru (login pakai GURU_PIN)')
  bold('══════════════════════════════════════════\n')
}

main().catch((e) => {
  console.error('\nFatal:', e.message)
  process.exit(1)
})