// server/api/get-rhyme.get.js
// Endpoint: ambil kata rima berdasarkan suffix query parameter
// Contoh: GET /api/get-rhyme?suffix=-an

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const suffix = query.suffix

  if (!suffix) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Parameter suffix diperlukan. Contoh: ?suffix=-an',
    })
  }

  // Baca data dari file JSON content
  // Gunakan $fetch internal agar tidak ada dependency ke googleapis
  try {
    const { queryContent } = await import('#content/server')
    const data = await queryContent('/rhyme-words').findOne()

    if (!data || !data[suffix]) {
      throw createError({
        statusCode: 404,
        statusMessage: `Kata rima untuk suffix "${suffix}" tidak ditemukan.`,
      })
    }

    return {
      suffix,
      words: data[suffix],
    }
  } catch (err) {
    // Fallback: kembalikan error yang mudah dibaca
    throw createError({
      statusCode: 500,
      statusMessage: err?.message ?? 'Gagal membaca data rima.',
    })
  }
})
