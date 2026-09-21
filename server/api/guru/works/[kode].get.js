// server/api/guru/works/[kode].get.js
// GET /api/guru/works/:kode?pin=XXXX
// Returns one work by its kode karya, with full details + validation breakdown.
import { findWorkByKode } from '../../../utils/sheets'
import { validGuruPin } from '../../../utils/teacher-auth'
import { validatePantun } from '../../../utils/validate-pantun'

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

  const kode = getRouterParam(event, 'kode')
  const found = await findWorkByKode(config, kode)
  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Karya tidak ditemukan.' })
  }

  const { work } = found

  // Re-run server validation for the detail panel breakdown
  const pola = { ruleType: parsePolaRule(work.pola) }
  const rima = parseRima(work.rimaSuffix, work.kataRima)
  const validation = validatePantun({
    lines: work.baris,
    rima,
    pola,
  })

  return { work, validation }
})

function parseRima(suffixCell, wordsCell) {
  const rimaA = { suffix: '', words: [] }
  const rimaB = { suffix: '', words: [] }
  if (!suffixCell) return { rimaA, rimaB }

  const mA = suffixCell.match(/A:([^,\s]+)/)
  if (mA) rimaA.suffix = mA[1]
  const mB = suffixCell.match(/B:([^,\s]+)/)
  if (mB) rimaB.suffix = mB[1]

  // Parse words: format "A: jalan, teman | B: rumah, sekolah"
  if (wordsCell) {
    const wordA = wordsCell.match(/A:\s*([^|]+)/)
    if (wordA) rimaA.words = wordA[1].split(',').map(w => w.trim()).filter(Boolean)
    const wordB = wordsCell.match(/B:\s*([^|]+)/)
    if (wordB) rimaB.words = wordB[1].split(',').map(w => w.trim()).filter(Boolean)
  }

  return { rimaA, rimaB }
}

function parsePolaRule(polaText) {
  const map = {
    1: 'repetisi_awal_sampiran',
    2: 'repetisi_awal_akhir_sampiran',
    3: 'sampiran_kota',
    4: 'sampiran_hewan',
    5: 'sampiran_tumbuhan',
    6: 'sampiran_angka',
    7: 'repetisi_sampiran',
    8: 'repetisi_isi',
    9: 'sampiran_benda_sehari',
    10: 'isi_ajakan',
    11: 'isi_nasihat',
    12: 'pertanyaan_retoris',
  }
  const m = (polaText || '').match(/Pola\s*(\d+)/)
  const id = m ? Number(m[1]) : 0
  return map[id] || ''
}