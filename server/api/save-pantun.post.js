// server/api/save-pantun.post.js
// Menyimpan pantun ke Google Sheets.
// Gambar di-upload ke Google Drive jika folder Drive adalah Shared Drive.
// Jika tidak (akun Gmail biasa), data tetap tersimpan di Sheets tanpa gambar.
import { google } from 'googleapis'
import { Readable } from 'stream'

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
  if (!config.googleClientEmail || !config.googlePrivateKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Konfigurasi Google API belum diisi.',
    })
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: config.googleClientEmail,
      private_key: config.googlePrivateKey?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  })
  const authClient = await auth.getClient()

  const timestamp = Date.now()
  const safeName = (studentName ?? 'siswa')
    .replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_')
  const filename = `pantun_${safeName}_${timestamp}.jpg`

  // ── 1. Coba upload ke Google Drive ───────────────────────
  let driveUrl = ''
  let fileId = `local_${timestamp}`
  let driveStatus = 'skipped'

  if (imageBase64 && config.googleDriveFolderId) {
    try {
      const drive = google.drive({ version: 'v3', auth: authClient })

      // Cek apakah folder Shared Drive
      const folderInfo = await drive.files.get({
        fileId: config.googleDriveFolderId,
        fields: 'id,name,driveId',
        supportsAllDrives: true,
      }).catch(() => ({ data: {} }))

      const isSharedDrive = !!folderInfo.data?.driveId

      if (!isSharedDrive) {
        // My Drive — service account tidak bisa upload, skip
        driveStatus = 'unavailable_my_drive'
      } else {
        // Shared Drive — bisa upload
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

  // ── 2. Simpan ke Google Sheets ────────────────────────────
  const sheets = google.sheets({ version: 'v4', auth: authClient })

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

  // Format rima A dan B
  let rimaSuffixCell = rima?.suffix ?? ''
  let rimaWordsCell   = (rima?.words ?? []).join(', ')

  if (rima?.rimaA?.suffix && rima?.rimaB?.suffix) {
    rimaSuffixCell = `A:${rima.rimaA.suffix}, B:${rima.rimaB.suffix}`
    rimaWordsCell  = `A: ${(rima.rimaA.words || []).join(', ')} | B: ${(rima.rimaB.words || []).join(', ')}`
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.googleSheetsId,
    range: 'Sheet1!A:L',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        tanggal,
        studentName,
        phenomena ?? '',
        pola ?? '',
        rimaSuffixCell,
        rimaWordsCell,
        pantunLines[0] ?? '',
        pantunLines[1] ?? '',
        pantunLines[2] ?? '',
        pantunLines[3] ?? '',
        driveCell,        // K: Link Drive
        base64Cell,       // L: Base64 gambar
      ]],
    },
  })

  return {
    success: true,
    sessionId: fileId,
    driveUrl,
    driveStatus,
    filename,
  }
})
