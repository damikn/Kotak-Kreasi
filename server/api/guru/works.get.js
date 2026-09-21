// server/api/guru/works.get.js
// GET /api/guru/works?pin=XXXX
// Lists all student works (for the teacher dashboard). Auto-grades are shown.
import { readAllWorks, rowToWork, isWorkRow } from '../../utils/sheets'
import { validGuruPin } from '../../utils/teacher-auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const keyLooksReal = config.googlePrivateKey
    ? config.googlePrivateKey.includes('-----BEGIN') && !config.googlePrivateKey.includes('REDACTED')
    : false
  if (!config.googleClientEmail || !keyLooksReal) {
    throw createError({ statusCode: 500, statusMessage: 'Konfigurasi Google API belum diisi dengan kunci service account yang valid.' })
  }

  const query = getQuery(event)
  if (!validGuruPin(config, query.pin)) {
    throw createError({ statusCode: 401, statusMessage: 'PIN guru salah.' })
  }

  try {
    const rows = await readAllWorks(config)
    const works = rows
      .map((r, idx) => rowToWork(r, idx + 2))
      .filter((w) => w.nama)
    return { works }
  } catch (e) {
    console.warn('[guru/works] gagal baca Sheets:', e.message)
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal terhubung ke Google Sheets. Pastikan .env (GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEETS_ID) terisi dan spreadsheet di-share ke service account.',
    })
  }
})