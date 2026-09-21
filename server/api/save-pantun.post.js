// server/api/save-pantun.post.js
// Menyimpan pantun ke Google Sheets + upload gambar ke Google Drive (Shared Drive).
// Kolom:
//   A Tanggal, B Nama Siswa, C Fenomena, D Pola, E Suffix Rima, F Kata Rima,
//   G-J Baris 1-4, K Link Drive, L Gambar (Base64), M Kode Karya,
//   N Skor Auto, O Nilai Guru, P Komentar, Q Status
import { google } from 'googleapis'
import { Readable } from 'stream'
import { validatePantun } from '../utils/validate-pantun'
import { getGoogleAuth } from '../utils/google-auth'
import { RANGE_FULL, SHEET_HEADERS, ensureHeaderRow } from '../utils/sheets'

// Kode unik per karya siswa (dipakai sebagai primary key di penilaian)
export function generateKodeKarya() {
  return `KK-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { studentName, phenomena, pola, rima, pantunLines, imageBase64 } = body

  if (!studentName || !pantunLines?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Data tidak lengkap.',
    })
  }

  const config = useRuntimeConfig()
  const keyLooksReal = config.googlePrivateKey
    ? config.googlePrivateKey.includes('-----BEGIN') && !config.googlePrivateKey.includes('REDACTED')
    : false
  if (!config.googleClientEmail || !keyLooksReal) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Konfigurasi Google API belum diisi dengan kunci service account yang valid.',
    })
  }

  // Normalisasi nilai yang bisa object (defensif dari client)
  const polaCell = typeof pola === 'string'
    ? pola
    : (pola?.nama ?? JSON.stringify(pola ?? ''))
  const phenomenaCell = typeof phenomena === 'string'
    ? phenomena
    : (phenomena?.name ?? JSON.stringify(phenomena ?? ''))

  const auth = getGoogleAuth(config)
  const authClient = await auth.getClient()

  const timestamp = Date.now()
  const safeName = (studentName ?? 'siswa')
    .replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_')
  const filename = `pantun_${safeName}_${timestamp}.jpg`
  const kodeKarya = generateKodeKarya()

  // ── 1. Coba upload ke Google Drive ───────────────────────
  let driveUrl = ''
  let fileId = `local_${timestamp}`
  let driveStatus = 'skipped'

  if (imageBase64 && config.googleDriveFolderId) {
    try {
      const drive = google.drive({ version: 'v3', auth: authClient })

      const folderInfo = await drive.files.get({
        fileId: config.googleDriveFolderId,
        fields: 'id,name,driveId',
        supportsAllDrives: true,
      }).catch(() => ({ data: {} }))

      const isSharedDrive = !!folderInfo.data?.driveId

      if (!isSharedDrive) {
        driveStatus = 'unavailable_my_drive'
      } else {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
        const stream = Readable.from(Buffer.from(base64Data, 'base64'))

        const res = await drive.files.create({
          requestBody: {
            name: filename,
            parents: [config.googleDriveFolderId],
            mimeType: 'image/jpeg',
          },
          media: { mimeType: 'image/jpeg', body: stream },
          fields: 'id,webViewLink',
          supportsAllDrives: true,
        })

        fileId = res.data.id
        await drive.permissions.create({
          fileId,
          requestBody: { role: 'reader', type: 'anyone' },
          supportsAllDrives: true,
        })

        driveUrl = res.data.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`
        driveStatus = 'success'
      }
    } catch (e) {
      console.warn('[save-pantun] Drive upload gagal:', e.message)
      driveStatus = 'error'
    }
  }

  // ── 2. Auto-score dengan shared validation engine ─────────
  const validation = validatePantun({ lines: pantunLines, rima, pola })

  // ── 3. Simpan ke Google Sheets ────────────────────────────
  const sheets = google.sheets({ version: 'v4', auth: authClient })
  await ensureHeaderRow(sheets, config.googleSheetsId)

  const tanggal = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const driveCell = driveUrl || (driveStatus === 'unavailable_my_drive'
    ? '(Drive: perlu Shared Drive)'
    : '(foto tidak tersimpan)')

  let base64Cell = ''
  if (imageBase64) {
    if (imageBase64.length <= 45000) {
      base64Cell = imageBase64
    } else {
      const sizeKb = Math.round(imageBase64.length * 0.75 / 1024)
      base64Cell = `[gambar JPG ~${sizeKb}KB — unduh dari aplikasi]`
    }
  }

  let rimaSuffixCell = rima?.suffix ?? ''
  let rimaWordsCell = (rima?.words ?? []).join(', ')

  if (rima?.rimaA?.suffix && rima?.rimaB?.suffix) {
    rimaSuffixCell = `A:${rima.rimaA.suffix}, B:${rima.rimaB.suffix}`
    rimaWordsCell = `A: ${(rima.rimaA.words || []).join(', ')} | B: ${(rima.rimaB.words || []).join(', ')}`
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.googleSheetsId,
    range: RANGE_FULL,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        tanggal,
        studentName,
        phenomenaCell,
        polaCell,
        rimaSuffixCell,
        rimaWordsCell,
        pantunLines[0] ?? '',
        pantunLines[1] ?? '',
        pantunLines[2] ?? '',
        pantunLines[3] ?? '',
        driveCell,        // K
        base64Cell,       // L
        kodeKarya,        // M
        validation.score, // N
        '',               // O — nilai guru (belum)
        '',               // P — komentar guru
        'BELUM DINILAI',  // Q — status
      ]],
    },
  })

  return {
    success: true,
    kodeKarya,
    autoScore: validation.score,
    sessionId: fileId,
    driveUrl,
    driveStatus,
    filename,
  }
})