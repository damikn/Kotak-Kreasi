// server/api/karya/gambar/[kode].get.js
// GET /api/karya/gambar/:kode
// Redirects to a short-lived signed URL for the work's card image. The image
// bucket is private, so this route is the only way to read an image: the kode
// karya acts as the unguessable handle.
import { findWorkByKode, createImageSignedUrl } from '../../../utils/works-repo'

const EXPIRES_IN = 300

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const kode = getRouterParam(event, 'kode')

  let work
  try {
    work = await findWorkByKode(config, kode)
  } catch (e) {
    console.warn('[karya/gambar] gagal baca Supabase:', e.message)
    throw createError({ statusCode: 500, statusMessage: 'Gagal memuat gambar karya.' })
  }

  if (!work || !work.imagePath) {
    throw createError({ statusCode: 404, statusMessage: 'Gambar karya tidak ditemukan.' })
  }

  try {
    const signedUrl = await createImageSignedUrl(config, work.imagePath, EXPIRES_IN)
    return sendRedirect(event, signedUrl, 302)
  } catch (e) {
    console.warn('[karya/gambar] gagal membuat signed URL:', e.message)
    throw createError({ statusCode: 500, statusMessage: 'Gagal memuat gambar karya.' })
  }
})
