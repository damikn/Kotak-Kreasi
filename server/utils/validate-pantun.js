// server/utils/validate-pantun.js
// Shared validation engine for student pantun submissions.
// Mirrors the client-side checks in pages/susun.vue so the server can
// independently auto-score every submission without trusting the browser.
//
// Returns { score, checks } where checks has one entry per rubric item:
//   { key, label, passed, detail }

// ── Syllable counting (Indonesian) ─────────────────────────
export function countSyllablesInWord(word) {
  let w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  const matches = w.match(/[aiueo]/g)
  if (!matches) return 1
  let count = matches.length
  const diphthongs = w.match(/(ai|au|oi)/g)
  if (diphthongs) count -= diphthongs.length
  return Math.max(1, count)
}

export function countLineSyllables(line) {
  if (!line || !line.trim()) return 0
  return line.trim().split(/\s+/).reduce((sum, word) => sum + countSyllablesInWord(word), 0)
}

// ── Rima matching ──────────────────────────────────────────
export function lineMatchesSuffix(lineText, suffix) {
  if (!lineText || !lineText.trim() || !suffix) return false
  const words = lineText.trim().toLowerCase().split(/\s+/)
  const lastWord = words[words.length - 1].replace(/[^a-z]/g, '')
  const s = suffix.replace('-', '').toLowerCase()
  if (s === 'a') return lastWord.endsWith('a')
  if (s === 'i') return lastWord.endsWith('i')
  if (s === 'an') return lastWord.endsWith('an')
  if (s === 'ar') return lastWord.endsWith('ar')
  if (s === 'ang') return lastWord.endsWith('ang')
  if (s === 'ai') return lastWord.endsWith('ai')
  if (s === 'at') return lastWord.endsWith('at')
  if (s === 'en') return lastWord.endsWith('en')
  if (s === 'in') return lastWord.endsWith('in')
  if (s === 'it') return lastWord.endsWith('it')
  return lastWord.endsWith(s)
}

// ── Word helpers ───────────────────────────────────────────
export function lineWords(line) {
  return (line || '').toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, '')).filter(Boolean)
}

export function lineHasAny(line, words) {
  const clean = (line || '').toLowerCase()
  return words.some(w => clean.includes(w))
}

export function hasRepeatedWord(line) {
  const words = lineWords(line)
  return words.length > 1 && new Set(words).size < words.length
}

export function containsNumber(line) {
  if (/\d/.test(line || '')) return true
  return lineHasAny(line, ['satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas', 'belas', 'puluh', 'ratus', 'ribu', 'juta', 'beberapa', 'semua', 'setengah', 'seperempat'])
}

// Kamus kata untuk validasi tema pola (kosa kata anak SD)
export const kosaKata = {
  kota: ['jakarta', 'bandung', 'surabaya', 'medan', 'semarang', 'makassar', 'palembang', 'depok', 'bekasi', 'tangerang', 'bogor', 'malang', 'padang', 'yogyakarta', 'denpasar', 'solo', 'surakarta', 'samarinda', 'banjarmasin', 'pontianak', 'manado', 'ambon', 'jayapura', 'pekanbaru', 'aceh', 'lampung', 'mataram', 'kupang', 'batam', 'cirebon', 'tasikmalaya', 'garut', 'kediri', 'jember', 'banyuwangi', 'sidoarjo', 'gresik', 'bali', 'papua', 'kalimantan', 'sumatera', 'sulawesi', 'betawi', 'sunda', 'jawa'],
  hewan: ['kucing', 'anjing', 'burung', 'ayam', 'bebek', 'ikan', 'kambing', 'sapi', 'kerbau', 'kuda', 'kelinci', 'tikus', 'gajah', 'harimau', 'singa', 'monyet', 'kupu', 'semut', 'lebah', 'nyamuk', 'lalat', 'ular', 'buaya', 'elang', 'merpati', 'jalak', 'kenari', 'penyu', 'paus', 'lumba', 'hiu', 'lele', 'nila', 'gurame', 'udang', 'kepiting', 'capung', 'belalang', 'laba', 'jangkrik', 'cacing', 'tupai', 'kadal', 'bunglon', 'katak', 'kodok', 'siput', 'rusa', 'jerapah', 'zebra', 'badak', 'kanguru', 'beruang', 'serigala', 'musang', 'landak', 'kelelawar', 'biawak', 'komodo', 'unggas', 'hewan'],
  tumbuhan: ['bunga', 'melati', 'mawar', 'anggrek', 'tulip', 'kenanga', 'kamboja', 'cempaka', 'teratai', 'sepatu', 'buah', 'mangga', 'pisang', 'apel', 'jeruk', 'rambutan', 'duku', 'durian', 'anggur', 'semangka', 'melon', 'pepaya', 'nanas', 'salak', 'jambu', 'belimbing', 'nangka', 'sawo', 'kelapa', 'kopi', 'teh', 'padi', 'jagung', 'gandum', 'sawit', 'karet', 'cengkeh', 'lada', 'jahe', 'kunyit', 'lengkuas', 'sereh', 'cabai', 'tomat', 'bayam', 'kangkung', 'sawi', 'wortel', 'kentang', 'bawang', 'pohon', 'daun', 'rumput', 'bambu', 'kayu', 'akar', 'biji', 'flamboyan', 'sakura', 'tumbuhan', 'tanaman'],
  benda: ['pensil', 'buku', 'tas', 'sepatu', 'meja', 'kursi', 'bangku', 'papan', 'kapur', 'penghapus', 'penggaris', 'rautan', 'pulpen', 'tinta', 'kertas', 'koran', 'majalah', 'piring', 'gelas', 'sendok', 'garpu', 'teko', 'panci', 'wajan', 'ember', 'gayung', 'sapu', 'pel', 'sikat', 'cermin', 'sisir', 'sabun', 'handuk', 'baju', 'celana', 'topi', 'payung', 'jam', 'lampu', 'kipas', 'lemari', 'kasur', 'bantal', 'selimut', 'botol', 'dompet', 'kunci', 'telepon', 'gawai', 'komputer', 'laptop', 'tv', 'radio', 'sepeda', 'motor', 'mobil', 'becak', 'gerobak', 'barang', 'benda'],
  ajakan: ['mari', 'ayo', 'marilah', 'yuk', 'mari kita', 'himbau', 'ajak', 'mengajak'],
  nasihat: ['jangan', 'sebaiknya', 'seharusnya', 'hendaknya', 'rajin', 'tekun', 'giat', 'hormat', 'patuh', 'sabar', 'jujur', 'disiplin', 'menabung', 'belajar', 'menjaga', 'hindari', 'peduli', 'berbagi', 'tolong', 'bantu', 'sopan', 'santun', 'bertanggung', 'hati-hati', 'sayangi', 'cintai', 'berbuat', 'berbakti'],
}

// ── Pola rule evaluation ───────────────────────────────────
// Returns an object { rule, title, message, action } or null when satisfied.
function evaluatePolaRule(ruleType, lines) {
  const p1Words = lineWords(lines[0])
  const p2Words = lineWords(lines[1])
  const p3Words = lineWords(lines[2])
  const p4Words = lineWords(lines[3])
  const p1First = p1Words[0]
  const p2First = p2Words[0]
  const p3First = p3Words[0]
  const p4First = p4Words[0]
  const p1Last = p1Words[p1Words.length - 1]
  const p2Last = p2Words[p2Words.length - 1]
  const sampiranText = `${lines[0]} ${lines[1]}`.toLowerCase()
  const isiText = `${lines[2]} ${lines[3]}`.toLowerCase()

  switch (ruleType) {
    case 'repetisi_awal_sampiran': // Pola 1
      if (p1First && p2First && p1First !== p2First) {
        return { rule: 'POLA_REPETISI_AWAL_SAMPIRAN', title: 'Pola 1', message: `Kata pertama Baris 1 ('${p1First}') harus sama dengan kata pertama Baris 2 ('${p2First}').`, action: `Ubah kata pertama Baris 2 menjadi '${p1First}'.` }
      }
      break
    case 'repetisi_awal_akhir_sampiran': // Pola 2
      if (p1First && p2Last && p1First !== p2Last) {
        return { rule: 'POLA_REPETISI_AWAL_AKHIR_SAMPIRAN', title: 'Pola 2', message: `Kata pertama Baris 1 ('${p1First}') harus sama dengan kata terakhir Baris 2 ('${p2Last}').`, action: `Ubah kata terakhir Baris 2 menjadi '${p1First}'.` }
      }
      break
    case 'sampiran_kota': // Pola 3
      if (!lineHasAny(sampiranText, kosaKata.kota)) {
        return { rule: 'POLA_SAMPIRAN_KOTA', title: 'Pola 3', message: 'Sampiran harus memuat nama kota Indonesia.', action: 'Tambahkan nama kota seperti Jakarta, Bandung, Surabaya, Padang, dll pada Baris 1 atau 2.' }
      }
      break
    case 'sampiran_hewan': // Pola 4
      if (!lineHasAny(sampiranText, kosaKata.hewan)) {
        return { rule: 'POLA_SAMPIRAN_HEWAN', title: 'Pola 4', message: 'Sampiran harus memuat nama hewan.', action: 'Tambahkan nama hewan seperti kucing, burung, kupu-kupu, dll pada Baris 1 atau 2.' }
      }
      break
    case 'sampiran_tumbuhan': // Pola 5
      if (!lineHasAny(sampiranText, kosaKata.tumbuhan)) {
        return { rule: 'POLA_SAMPIRAN_TUMBUHAN', title: 'Pola 5', message: 'Sampiran harus memuat nama bunga, buah, atau tumbuhan.', action: 'Tambahkan nama bunga, buah, atau tumbuhan seperti melati, mangga, bambu, dll pada Baris 1 atau 2.' }
      }
      break
    case 'sampiran_angka': // Pola 6
      if (!containsNumber(sampiranText)) {
        return { rule: 'POLA_SAMPIRAN_ANGKA', title: 'Pola 6', message: 'Sampiran harus memuat angka atau kata bilangan.', action: 'Tambahkan angka atau kata bilangan seperti tiga, lima, atau sepuluh pada Baris 1 atau 2.' }
      }
      break
    case 'repetisi_sampiran': // Pola 7
      if (!hasRepeatedWord(lines[0]) && !hasRepeatedWord(lines[1])) {
        return { rule: 'POLA_REPETISI_SAMPIRAN', title: 'Pola 7', message: 'Sampiran harus memuat kata yang diulang.', action: 'Ulangi salah satu kata di Baris 1 atau 2, contoh: "Ombak datang ombak pergi".' }
      }
      break
    case 'repetisi_isi': // Pola 8
      if (!hasRepeatedWord(lines[2]) && !hasRepeatedWord(lines[3])) {
        return { rule: 'POLA_REPETISI_ISI', title: 'Pola 8', message: 'Isi harus memuat kata yang diulang.', action: 'Ulangi salah satu kata di Baris 3 atau 4, contoh: "Belajar tekun belajar giat".' }
      }
      break
    case 'sampiran_benda_sehari': // Pola 9
      if (!lineHasAny(sampiranText, kosaKata.benda)) {
        return { rule: 'POLA_SAMPIRAN_BENDA', title: 'Pola 9', message: 'Sampiran harus memuat nama benda sehari-hari.', action: 'Tambahkan nama benda seperti pensil, buku, meja, atau tas pada Baris 1 atau 2.' }
      }
      break
    case 'isi_ajakan': // Pola 10
      if (!lineHasAny(isiText, kosaKata.ajakan)) {
        return { rule: 'POLA_ISI_AJAKAN', title: 'Pola 10', message: 'Isi harus memuat kata ajakan.', action: "Gunakan kata ajakan seperti 'mari', 'ayo', atau 'marilah' pada Baris 3 atau 4." }
      }
      break
    case 'isi_nasihat': // Pola 11
      if (!lineHasAny(isiText, kosaKata.nasihat)) {
        return { rule: 'POLA_ISI_NASIHAAT', title: 'Pola 11', message: 'Isi harus memuat pesan nasihat.', action: 'Tambahkan kata nasihat seperti jangan, sebaiknya, rajin, atau tekun pada Baris 3 atau 4.' }
      }
      break
    case 'pertanyaan_retoris': // Pola 12
      if (!lines[3].trim().endsWith('?') && !lineHasAny(lines[3], ['siapa', 'mengapa', 'apakah', 'kenapa', 'bagaimana', 'kapan', 'di mana'])) {
        return { rule: 'POLA_PERTANYAAN_RETORIS', title: 'Pola 12', message: 'Baris 4 harus berupa pertanyaan retoris.', action: "Akhiri Baris 4 dengan tanda tanya '?' atau gunakan kata tanya." }
      }
      break
    default:
      break
  }
  return null
}

// ── Main validation ────────────────────────────────────────
// Rubric items (5 auto checks) + pola rule check folded in:
//  1. 4 baris lengkap (auto)
//  2. Suku kata 8–12 tiap baris (auto)
//  3. Rima A (b1&3) & B (b2&4) sesuai (auto)
//  4. Kata rima dari pohon dipakai (auto)
//  5. Pola sesuai ruleType (auto)
//  6. (manual oleh guru: kesesuaian fenomena & bahasa)
export function validatePantun({ lines, rima, pola }) {
  const arr = [...(lines || [])].map(l => (l || '').trim())
  const rimaA = rima?.rimaA
  const rimaB = rima?.rimaB

  const filled = arr.filter(l => l.length > 0)
  const allFilled = filled.length === 4

  // Per-line syllable counts
  const syllables = arr.map(countLineSyllables)
  const syllablesOk = allFilled && syllables.every(s => s >= 8 && s <= 12)

  // Rima match
  const sufA = rimaA?.suffix
  const sufB = rimaB?.suffix
  const rimaOK = allFilled
    && !!sufA && !!sufB
    && sufA !== sufB
    && lineMatchesSuffix(arr[0], sufA)
    && lineMatchesSuffix(arr[2], sufA)
    && lineMatchesSuffix(arr[1], sufB)
    && lineMatchesSuffix(arr[3], sufB)

  // Kata rima pilihan dipakai
  const wordsA = (rimaA?.words || []).map(w => w.toLowerCase())
  const wordsB = (rimaB?.words || []).map(w => w.toLowerCase())
  const kataRimaOK = allFilled
    && wordsA.length >= 2
    && wordsB.length >= 2
    && wordsA.some(w => arr[0].toLowerCase().includes(w) || arr[2].toLowerCase().includes(w))
    && wordsB.some(w => arr[1].toLowerCase().includes(w) || arr[3].toLowerCase().includes(w))

  // Pola rule
  const polaRule = evaluatePolaRule(pola?.ruleType || '', arr)

  const checks = [
    { key: 'baris_lengkap', label: 'Terdiri dari 4 baris lengkap', passed: allFilled, detail: `${filled.length}/4 baris terisi` },
    { key: 'suku_kata', label: 'Tiap baris 8–12 suku kata', passed: allFilled && syllablesOk, detail: allFilled ? syllables.map((s, i) => `B${i + 1}:${s}`).join(' ') : 'belum terisi' },
    { key: 'rima_ab', label: 'Rima A (b1&3) & Rima B (b2&4) sesuai', passed: rimaOK, detail: sufA && sufB ? `A:${sufA} B:${sufB}` : 'rima belum lengkap' },
    { key: 'kata_rima', label: 'Menggunakan kata rima dari pohon', passed: kataRimaOK, detail: `A:${wordsA.join(',')} B:${wordsB.join(',')}` },
    { key: 'pola', label: `Pola sesuai aturan (${pola?.nama || ''})`, passed: allFilled && !polaRule, detail: polaRule ? polaRule.message : 'sesuai' },
  ]

  const score = Math.round((checks.filter(c => c.passed).length / checks.length) * 100)

  return {
    score,
    checks,
    syllables,
    allFilled,
    polaRule,
  }
}