// scripts/test-save.mjs
// Simulasi lengkap: simpan data pantun ke Google Sheets (tanpa gambar)
// Jalankan: node scripts/test-save.mjs

import { google } from 'googleapis'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const content = readFileSync(resolve(__dirname, '../.env'), 'utf-8')
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

const COLORS = {
  green: '\x1b[32m', red: '\x1b[31m', cyan: '\x1b[36m',
  bold: '\x1b[1m', reset: '\x1b[0m',
}
const ok   = (m) => console.log(`${COLORS.green}✓${COLORS.reset} ${m}`)
const fail = (m) => console.log(`${COLORS.red}✗${COLORS.reset} ${m}`)
const bold = (m) => console.log(`${COLORS.bold}${m}${COLORS.reset}`)

async function main() {
  bold('\n📝 Test Simpan Pantun ke Google Sheets\n')

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.GOOGLE_CLIENT_EMAIL,
      private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const client = await auth.getClient()
  const sheets = google.sheets({ version: 'v4', auth: client })

  // Data dummy pantun test
  const testData = {
    tanggal: new Date().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
    nama: 'Andi Siswa Test',
    fenomena: 'Penggunaan Media Sosial Berlebihan',
    pola: 'Pola 3 — Repetisi pada Akhir dan Awal Sampiran',
    suffix: '-a',
    kata_rima: 'cahaya, karya, budaya',
    baris1: 'Pergi ke taman membeli bunga,',
    baris2: 'Bunga mekar di pagi hari,',
    baris3: 'Media sosial jangan dipuja,',
    baris4: 'Agar hidup lebih bermakna.',
    drive_link: '(TEST — tidak ada foto)',
  }

  try {
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: env.GOOGLE_SHEETS_ID,
      range: 'Sheet1!A:K',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          testData.tanggal,
          testData.nama,
          testData.fenomena,
          testData.pola,
          testData.suffix,
          testData.kata_rima,
          testData.baris1,
          testData.baris2,
          testData.baris3,
          testData.baris4,
          testData.drive_link,
        ]],
      },
    })

    ok(`Data pantun tersimpan di Sheets!`)
    ok(`Range: ${res.data.updates?.updatedRange}`)
    ok(`Baris ditambahkan: ${res.data.updates?.updatedRows}`)
    console.log(`\n${COLORS.cyan}🔗 Cek hasilnya di:${COLORS.reset}`)
    console.log(`   https://docs.google.com/spreadsheets/d/${env.GOOGLE_SHEETS_ID}\n`)

    // Hapus baris test
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SHEETS_ID,
      range: 'Sheet1!A:A',
    })
    const lastRow = getRes.data.values?.length ?? 0
    if (lastRow > 1) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: env.GOOGLE_SHEETS_ID,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
                startIndex: lastRow - 1,
                endIndex: lastRow,
              },
            },
          }],
        },
      })
      ok('Baris test dihapus (cleanup)')
    }

    bold('\n✅ TEST SIMPAN BERHASIL — Sistem siap digunakan!\n')
  } catch (e) {
    fail(`Gagal: ${e.message}`)
  }
}

main().catch((e) => { console.error('Fatal:', e.message); process.exit(1) })
