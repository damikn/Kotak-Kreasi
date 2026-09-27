// server/api/guru/works.get.js
// GET /api/guru/works?pin=XXXX
// Lists all student works (for the teacher dashboard). Auto-grades are shown.
import { listWorks } from '../../utils/works-repo'
import { validGuruPin } from '../../utils/teacher-auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const query = getQuery(event)
  if (!validGuruPin(config, query.pin)) {
    throw createError({ statusCode: 401, statusMessage: 'PIN guru salah.' })
  }

  try {
    const works = await listWorks(config)
    return { works: works.filter((w) => w.nama) }
  } catch (e) {
    console.warn('[guru/works] gagal baca Supabase:', e.message)
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal terhubung ke database karya. Pastikan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env sudah benar.',
    })
  }
})
