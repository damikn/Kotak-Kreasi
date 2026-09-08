// scripts/test-api.mjs
// Skrip pengujian koneksi Google API
// Jalankan: node scripts/test-api.mjs

import { google } from 'googleapis'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Baca .env manual (tanpa dotenv dependency)
function loadEnv() {
  const envPath = resolve(__dirname, '../.env')
  const content = readFileSync(envPath, 'utf-8')
  const env = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    // Hapus quote pembungkus
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

const env = loadEnv()

const COLORS = {
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  bold:   '\x1b[1m',
  reset:  '\x1b[0m',
}
const ok   = (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`)
const fail = (msg) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`)
const info = (msg) => console.log(`${COLORS.cyan}ℹ${COLORS.reset} ${msg}`)
const bold = (msg) => console.log(`${COLORS.bold}${msg}${COLORS.reset}`)

async function runTests() {
  bold('\n🧪 KOTAK KREASI — API Connection Test\n')

  // ── 1. Cek variabel env ──────────────────────────────────
  bold('1. Cek konfigurasi .env')
  const required = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_DRIVE_FOLDER_ID', 'GOOGLE_SHEETS_ID']
  let envOk = true
  for (const key of required) {
    if (env[key] && env[key].length > 10) {
      ok(`${key} terisi`)
    } else {
      fail(`${key} kosong atau tidak valid`)
      envOk = false
    }
  }
  if (!envOk) {
    console.log('\n⛔ Isi semua variabel .env terlebih dahulu.')
    process.exit(1)
  }

  // ── 2. Setup Google Auth ─────────────────────────────────
  bold('\n2. Test Google Auth (Service Account)')
  let authClient
  try {
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
    authClient = await auth.getClient()
    ok(`Auth berhasil — ${env.GOOGLE_CLIENT_EMAIL}`)
  } catch (e) {
    fail(`Auth gagal: ${e.message}`)
    process.exit(1)
  }

  // ── 3. Test Google Sheets ────────────────────────────────
  bold('\n3. Test Google Sheets API')
  try {
    const sheets = google.sheets({ version: 'v4', auth: authClient })
    const res = await sheets.spreadsheets.get({ spreadsheetId: env.GOOGLE_SHEETS_ID })
    ok(`Spreadsheet ditemukan: "${res.data.properties.title}"`)
    info(`URL: https://docs.google.com/spreadsheets/d/${env.GOOGLE_SHEETS_ID}`)

    // Cek/buat header row
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SHEETS_ID,
      range: 'Sheet1!A1:K1',
    })
    if (!headerRes.data.values || headerRes.data.values[0]?.length < 2) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: env.GOOGLE_SHEETS_ID,
        range: 'Sheet1!A1:L1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Tanggal', 'Nama Siswa', 'Fenomena', 'Pola', 'Suffix Rima', 'Kata Rima', 'Baris 1', 'Baris 2', 'Baris 3', 'Baris 4', 'Link Drive', 'Gambar (Base64)']],
        },
      })
      ok('Header row dibuat di Sheet1')
    } else {
      ok(`Header sudah ada: ${headerRes.data.values[0].join(', ')}`)
    }
  } catch (e) {
    fail(`Sheets gagal: ${e.message}`)
    if (e.message.includes('has not been used') || e.message.includes('disabled')) {
      const projectId = env.GOOGLE_CLIENT_EMAIL?.split('@')[1]?.split('.')[0] ?? 'YOUR_PROJECT'
      console.log(`\n${COLORS.yellow}⚠️  Aktifkan Google Sheets API di:`)
      console.log(`   https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=${projectId}${COLORS.reset}`)
    }
  }

  // ── 4. Test Google Drive ─────────────────────────────────
  bold('\n4. Test Google Drive API')
  try {
    const drive = google.drive({ version: 'v3', auth: authClient })
    const res = await drive.files.get({ fileId: env.GOOGLE_DRIVE_FOLDER_ID, fields: 'id,name,mimeType' })
    ok(`Folder Drive ditemukan: "${res.data.name}"`)
    info(`URL: https://drive.google.com/drive/folders/${env.GOOGLE_DRIVE_FOLDER_ID}`)

    const listRes = await drive.files.list({
      q: `'${env.GOOGLE_DRIVE_FOLDER_ID}' in parents`,
      pageSize: 5,
      fields: 'files(id,name)',
    })
    ok(`Folder berisi ${listRes.data.files.length} file`)
  } catch (e) {
    fail(`Drive gagal: ${e.message}`)
    if (e.message.includes('has not been used') || e.message.includes('disabled')) {
      const projectId = env.GOOGLE_CLIENT_EMAIL?.split('@')[1]?.split('.')[0] ?? 'YOUR_PROJECT'
      console.log(`\n${COLORS.yellow}⚠️  Aktifkan Google Drive API di:`)
      console.log(`   https://console.cloud.google.com/apis/library/drive.googleapis.com?project=${projectId}${COLORS.reset}`)
    }
  }

  // ── 5. Test upload dummy ke Drive ───────────────────────
  bold('\n5. Test upload file ke Google Drive')
  try {
    const drive = google.drive({ version: 'v3', auth: authClient })
    const { Readable } = await import('stream')

    // Cek apakah folder adalah Shared Drive
    const folderInfo = await drive.files.get({
      fileId: env.GOOGLE_DRIVE_FOLDER_ID,
      fields: 'id,name,driveId',
      supportsAllDrives: true,
    })

    const isSharedDrive = !!folderInfo.data?.driveId
    info(`Tipe folder: ${isSharedDrive ? 'Shared Drive ✓' : 'My Drive (perlu Shared Drive untuk upload)'}`)

    const testContent = `Kotak Kreasi Test - ${new Date().toISOString()}`
    const stream = Readable.from(Buffer.from(testContent))

    const createParams = {
      requestBody: {
        name: `_test_koneksi_${Date.now()}.txt`,
        parents: [env.GOOGLE_DRIVE_FOLDER_ID],
        mimeType: 'text/plain',
      },
      media: { mimeType: 'text/plain', body: stream },
      fields: 'id,webViewLink',
      supportsAllDrives: true,
    }

    const uploadRes = await drive.files.create(createParams)
    ok(`Upload berhasil — ID: ${uploadRes.data.id}`)
    ok(`Link: ${uploadRes.data.webViewLink}`)

    // Hapus test file
    await drive.files.delete({ fileId: uploadRes.data.id, supportsAllDrives: true })
    ok('File test dihapus (cleanup)')
  } catch (e) {
    fail(`Upload gagal: ${e.message}`)
    if (e.message.includes('storage quota')) {
      console.log(`
${COLORS.yellow}⚠️  Folder Drive harus berupa SHARED DRIVE (bukan My Drive).

Langkah fix:
1. Buka https://drive.google.com
2. Klik "+ New" → "Shared drive" → buat folder baru
3. Share folder tersebut ke service account sebagai "Content manager":
   ${env.GOOGLE_CLIENT_EMAIL}
4. Salin ID folder Shared Drive yang baru
5. Update GOOGLE_DRIVE_FOLDER_ID di file .env${COLORS.reset}`)
    }
  }

  bold('\n═══════════════════════════════════════')
  bold('✅ Semua test selesai!')
  bold('═══════════════════════════════════════\n')
}

runTests().catch((e) => {
  console.error('Fatal error:', e)
  process.exit(1)
})
