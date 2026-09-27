// server/api/save-pantun.post.js
// Stores a student work in Supabase Postgres and uploads the rendered card
// image to Supabase Storage (private bucket).
import { validatePantun } from '../utils/validate-pantun'
import { insertWork, uploadWorkImage, imageApiPath, STATUS_BELUM } from '../utils/works-repo'

// Unique code per work, used as the public identifier in the teacher dashboard.
export function generateKodeKarya() {
  return `KK-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { studentName, phenomena, gagasan, pesan, pola, rima, pantunLines, imageBase64 } = body

  if (!studentName || !pantunLines?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Data tidak lengkap.',
    })
  }

  const config = useRuntimeConfig()

  // Normalize values that may arrive as objects (defensive against the client)
  const polaCell = typeof pola === 'string'
    ? pola
    : (pola?.nama ?? JSON.stringify(pola ?? ''))
  const phenomenaCell = typeof phenomena === 'string'
    ? phenomena
    : (phenomena?.name ?? JSON.stringify(phenomena ?? ''))

  const timestamp = Date.now()
  const safeName = (studentName ?? 'siswa')
    .replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_')
  const kodeKarya = generateKodeKarya()

  // ── 1. Upload the card image to Storage (a failure never blocks the save) ──
  let imagePath = null
  let imageStatus = 'skipped'
  if (imageBase64) {
    try {
      const up = await uploadWorkImage(config, kodeKarya, imageBase64)
      if (up.error) {
        console.warn('[save-pantun] upload gambar gagal:', up.error.message)
        imageStatus = 'error'
      } else {
        imagePath = up.path
        imageStatus = 'success'
      }
    } catch (e) {
      console.warn('[save-pantun] upload gambar gagal:', e.message)
      imageStatus = 'error'
    }
  }

  // ── 2. Auto-score with the shared validation engine ───────────────────────
  const validation = validatePantun({ lines: pantunLines, rima, pola })

  // ── 3. Persist the row ────────────────────────────────────────────────────
  let rimaSuffixCell = rima?.suffix ?? ''
  let rimaWordsCell = (rima?.words ?? []).join(', ')

  if (rima?.rimaA?.suffix && rima?.rimaB?.suffix) {
    rimaSuffixCell = `A:${rima.rimaA.suffix}, B:${rima.rimaB.suffix}`
    rimaWordsCell = `A: ${(rima.rimaA.words || []).join(', ')} | B: ${(rima.rimaB.words || []).join(', ')}`
  }

  const work = await insertWork(config, {
    kode: kodeKarya,
    student_name: (studentName ?? '').toString().slice(0, 200),
    fenomena: phenomenaCell,
    pola: polaCell,
    rima_suffix: rimaSuffixCell,
    rima_words: rimaWordsCell,
    line1: pantunLines[0] ?? '',
    line2: pantunLines[1] ?? '',
    line3: pantunLines[2] ?? '',
    line4: pantunLines[3] ?? '',
    gagasan: (gagasan ?? '').toString(),
    pesan: (pesan ?? '').toString(),
    image_path: imagePath,
    auto_score: validation.score,
    grade: null,
    comment: '',
    status: STATUS_BELUM,
    gallery: false,
  })

  return {
    success: true,
    kodeKarya,
    autoScore: validation.score,
    sessionId: imagePath ?? `local_${timestamp}`,
    driveUrl: imagePath ? imageApiPath(kodeKarya) : '',
    driveStatus: imageStatus,
    filename: `pantun_${safeName}_${timestamp}.jpg`,
    createdAt: work.createdAt,
  }
})
