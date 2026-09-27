// server/api/karya/pilihan.get.js
// GET /api/karya/pilihan — read-only feed for the student gallery ("Karya Pilihan Teman-Teman").
// Privacy rules baked in:
//   * only works the TEACHER flagged as "Tampil di Galeri" are returned,
//   * only the author's first name is exposed — never the full name,
//   * no image links/paths, no grades, no comments.
import { listGalleryWorks } from '../../utils/works-repo'

const MAX_WORKS = 12

function firstNameOf(fullName) {
  return (fullName || '').trim().split(/\s+/)[0] || 'Siswa'
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    const works = await listGalleryWorks(config, MAX_WORKS)
    return {
      works: works.map((work) => ({
        kode: work.kode,
        nama: firstNameOf(work.nama),
        fenomena: work.fenomena,
        pola: work.pola,
        tanggal: work.tanggal,
        baris: work.baris,
      })),
    }
  } catch (e) {
    console.warn('[karya/pilihan] gagal baca Supabase:', e.message)
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal memuat galeri karya. Coba lagi sebentar lagi.',
    })
  }
})
