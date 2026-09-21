// server/api/guru/works/[kode]/grade.post.js
// POST /api/guru/works/:kode/grade   (body: { pin, nilai, komentar })
// Writes teacher grade (nilai + komentar) to Sheet1 columns O/P/Q and syncs
// the row into the "Penilaian" summary tab.
import { findWorkByKode, syncPenilaianTab } from '../../../../utils/sheets'
import { getSheetsClient } from '../../../../utils/google-auth'
import { readBodyWithPin } from '../../../../utils/teacher-auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const keyLooksReal = config.googlePrivateKey
    ? config.googlePrivateKey.includes('-----BEGIN') && !config.googlePrivateKey.includes('REDACTED')
    : false
  if (!config.googleClientEmail || !keyLooksReal) {
    throw createError({ statusCode: 500, statusMessage: 'Konfigurasi Google API belum diisi dengan kunci service account yang valid.' })
  }

  const body = await readBodyWithPin(event)

  const kode = getRouterParam(event, 'kode')
  const nilaiRaw = body?.nilai
  const komentar = (body?.komentar ?? '').toString().slice(0, 500)

  const nilai = Number(nilaiRaw)
  if (!Number.isFinite(nilai) || nilai < 0 || nilai > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Nilai harus angka 0–100.' })
  }

  const found = await findWorkByKode(config, kode)
  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Karya tidak ditemukan.' })
  }

  const sheets = await getSheetsClient(config)
  const { work, rowIndex } = found

  // Update O, P, Q on the work row
  await sheets.spreadsheets.values.update({
    spreadsheetId: config.googleSheetsId,
    range: `Sheet1!N${rowIndex}:Q${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        work.skorAuto ?? '',
        nilai,
        komentar,
        'SUDAH DINILAI',
      ]],
    },
  })

  // Update the in-memory work with final grade for summary sync
  const updated = { ...work, nilai, komentar, status: 'SUDAH DINILAI' }
  await syncPenilaianTab(config, sheets, config.googleSheetsId, updated)

  return { success: true, kode, nilai, komentar, status: 'SUDAH DINILAI' }
})