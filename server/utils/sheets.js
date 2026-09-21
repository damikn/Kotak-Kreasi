// server/utils/sheets.js
// Shared Google Sheets helpers for works + grading.
import { getSheetsClient } from './google-auth'

export const SHEET_HEADERS = [
  'Tanggal', 'Nama Siswa', 'Fenomena', 'Pola', 'Suffix Rima', 'Kata Rima',
  'Baris 1', 'Baris 2', 'Baris 3', 'Baris 4', 'Link Drive', 'Gambar (Base64)',
  'Kode Karya', 'Skor Auto', 'Nilai Guru', 'Komentar', 'Status',
]

// E=5, F=6, G=7, H=8, I=9, J=10, K=11, L=12, M=13, N=14, O=15, P=16, Q=17
export const COL = {
  TANGGAL: 0, NAMA: 1, FENOMENA: 2, POLA: 3, RIMA_SUFFIX: 4, KATA_RIMA: 5,
  BARIS1: 6, BARIS2: 7, BARIS3: 8, BARIS4: 9, DRIVE: 10, BASE64: 11,
  KODE: 12, SKOR_AUTO: 13, NILAI: 14, KOMENTAR: 15, STATUS: 16,
}

export const RANGE_FULL = 'Sheet1!A:Q'
export const RANGE_DATA = 'Sheet1!A:Q'
export const STATUS_BELUM = 'BELUM DINILAI'
export const STATUS_SUDAH = 'SUDAH DINILAI'

// Normalize a raw row (array of 17 cells) into a work object.
export function rowToWork(row, index) {
  const g = (i) => (row[i] ?? '').toString().trim()
  return {
    rowIndex: index,
    kode: g(COL.KODE),
    tanggal: g(COL.TANGGAL),
    nama: g(COL.NAMA),
    fenomena: g(COL.FENOMENA),
    pola: g(COL.POLA),
    rimaSuffix: g(COL.RIMA_SUFFIX),
    kataRima: g(COL.KATA_RIMA),
    baris: [g(COL.BARIS1), g(COL.BARIS2), g(COL.BARIS3), g(COL.BARIS4)],
    driveUrl: g(COL.DRIVE),
    skorAuto: g(COL.SKOR_AUTO) ? Number(g(COL.SKOR_AUTO)) : null,
    nilai: g(COL.NILAI) ? Number(g(COL.NILAI)) : null,
    komentar: g(COL.KOMENTAR),
    status: g(COL.STATUS) || STATUS_BELUM,
  }
}

export function isWorkRow(row) {
  return !!(row && (row[COL.NAMA] ?? '').toString().trim())
}

export async function ensureHeaderRow(sheets, spreadsheetId) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:Q1',
  })
  const existing = res.data.values?.[0] ?? []
  if (existing.length >= SHEET_HEADERS.length) return

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Sheet1!A1:Q1',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [SHEET_HEADERS] },
  })
}

// Read all works from Sheet1 (skips header row). Returns raw rows array.
export async function readAllWorks(config) {
  const sheets = await getSheetsClient(config)
  await ensureHeaderRow(sheets, config.googleSheetsId)

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.googleSheetsId,
    range: RANGE_DATA,
  })

  const rows = res.data.values ?? []
  // rows[0] is header; data starts at index 1 (row 2 in sheet)
  return rows.slice(1)
}

// Find a work by kode. Returns { work, rowIndex } or null.
export async function findWorkByKode(config, kode) {
  const rows = await readAllWorks(config)
  for (let i = 0; i < rows.length; i++) {
    if ((rows[i][COL.KODE] ?? '').toString().trim() === kode) {
      // sheet row number = i + 2 (1-indexed, header at row 1)
      return { work: rowToWork(rows[i], i + 2), rowIndex: i + 2 }
    }
  }
  return null
}

// Ensure the "Penilaian" summary tab exists, returns its sheetId.
export async function ensurePenilaianTab(sheets, spreadsheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const sheetList = meta.data.sheets ?? []
  let tab = sheetList.find(s => (s.properties?.title || '').toLowerCase() === 'penilaian')

  if (tab) return tab.properties.sheetId

  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        addSheet: {
          properties: {
            title: 'Penilaian',
            gridProperties: { rowCount: 2, columnCount: 10 },
          },
        },
      }],
    },
  })

  const newSheet = res.data.replies?.[0]?.addSheet?.properties
  const newId = newSheet?.sheetId ?? 0
  const newTitle = newSheet?.title ?? 'Penilaian'

  // Write header row on the new tab
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${newTitle}'!A1:J1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        'Nama Siswa', 'Kode Karya', 'Fenomena', 'Pola',
        'Baris 1', 'Baris 2', 'Baris 3', 'Baris 4',
        'Skor Auto', 'Status',
      ]],
    },
  })

  return newId
}

// Sync a work row into the Penilaian tab (append or update by kode).
export async function syncPenilaianTab(config, sheets, spreadsheetId, work) {
  const tabId = await ensurePenilaianTab(sheets, spreadsheetId)
  const tabTitle = 'Penilaian'

  const values = [[
    work.nama,
    work.kode,
    work.fenomena,
    work.pola,
    work.baris[0], work.baris[1], work.baris[2], work.baris[3],
    work.skorAuto,
    work.status,
  ]]

  // Find existing row by kode in col B
  const read = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabTitle}'!A:J`,
  })
  const rows = read.data.values ?? []
  let foundIdx = -1
  for (let i = 1; i < rows.length; i++) { // skip header
    if ((rows[i][1] ?? '').toString().trim() === work.kode) {
      foundIdx = i + 1 // sheet row number
      break
    }
  }

  if (foundIdx > -1) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${tabTitle}'!A${foundIdx}:J${foundIdx}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    })
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${tabTitle}'!A:J`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    })
  }
  return tabId
}

// Rebuild the whole Penilaian tab from current works (called on grade update).
export async function rebuildPenilaianTab(config, sheets, spreadsheetId) {
  const rows = await readAllWorks(config)
  const works = rows.map((r, idx) => rowToWork(r, idx + 2)).filter(w => w.nama)

  await ensurePenilaianTab(sheets, spreadsheetId)

  const values = [
    ['Nama Siswa', 'Kode Karya', 'Fenomena', 'Pola',
     'Baris 1', 'Baris 2', 'Baris 3', 'Baris 4', 'Skor Auto', 'Status'],
  ]

  for (const w of works) {
    values.push([w.nama, w.kode, w.fenomena, w.pola, w.baris[0], w.baris[1], w.baris[2], w.baris[3], w.skorAuto, w.status])
  }

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `'Penilaian'!A:J`,
  })
  if (values.length > 1) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'Penilaian'!A1:J1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    })
  } else {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'Penilaian'!A1:J1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    })
  }
}