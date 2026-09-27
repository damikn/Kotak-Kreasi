// server/api/guru/works/[kode]/grade.post.js
// POST /api/guru/works/:kode/grade   (body: { pin, nilai?, komentar?, tampilGaleri? })
// Writes the teacher grade (nilai + komentar) and/or the gallery flag to the work row.
// The old "Penilaian" summary tab is gone: the dashboard reads the same rows it writes.
import { findWorkByKode, updateWork, STATUS_SUDAH } from '../../../../utils/works-repo'
import { readBodyWithPin } from '../../../../utils/teacher-auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBodyWithPin(event)

  const kode = getRouterParam(event, 'kode')
  const hasNilai = body?.nilai !== undefined && body?.nilai !== null && body?.nilai !== ''
  const hasGaleri = body?.tampilGaleri !== undefined && body?.tampilGaleri !== null
  const komentar = (body?.komentar ?? '').toString().slice(0, 500)

  if (!hasNilai && !hasGaleri) {
    throw createError({ statusCode: 400, statusMessage: 'Tidak ada perubahan yang dikirim.' })
  }

  let nilai = null
  if (hasNilai) {
    nilai = Number(body.nilai)
    if (!Number.isFinite(nilai) || nilai < 0 || nilai > 100) {
      throw createError({ statusCode: 400, statusMessage: 'Nilai harus angka 0–100.' })
    }
  }

  const current = await findWorkByKode(config, kode)
  if (!current) {
    throw createError({ statusCode: 404, statusMessage: 'Karya tidak ditemukan.' })
  }

  const patch = {}
  if (hasNilai) {
    patch.grade = nilai
    patch.comment = komentar
    patch.status = STATUS_SUDAH
  }
  if (hasGaleri) {
    patch.gallery = !!body.tampilGaleri
  }

  const updated = await updateWork(config, kode, patch)
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Karya tidak ditemukan.' })
  }

  return {
    success: true,
    kode,
    nilai: updated.nilai,
    komentar: updated.komentar,
    status: updated.status,
    tampilGaleri: updated.tampilGaleri,
  }
})
