// scripts/seed-dummy.mjs
// Seeds demo works so the dashboard, gallery and image route can be reviewed with
// real-looking content. Every seeded row uses the `KK-DUMMY-` code prefix, which
// is the marker scripts/delete-dummy.mjs uses to remove them again.
//
// Usage:
//   node scripts/seed-dummy.mjs              # insert 12 demo works (idempotent)
//   node scripts/seed-dummy.mjs --no-images  # skip the generated card images
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { validatePantun } from '../server/utils/validate-pantun.js'

const WITH_IMAGES = !process.argv.includes('--no-images')
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')

function loadEnv(path = resolve(ROOT, '.env')) {
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue
    const i = line.indexOf('=')
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, '')
  }
  return out
}

const env = loadEnv()
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const bucket = env.SUPABASE_BUCKET || 'works-images'

const phenomena = JSON.parse(readFileSync(resolve(ROOT, 'content/phenomena.json'), 'utf8')).body

// Students across three classes so the class badge and search have something to show.
const STUDENTS = [
  { name: 'Budi Jaya Harsono', kelas: '7A', absen: 3 },
  { name: 'Siti Nurhaliza Putri', kelas: '7A', absen: 11 },
  { name: 'Ahmad Fauzan Ramadhan', kelas: '7A', absen: 17 },
  { name: 'Dewi Anggraini Sari', kelas: '7B', absen: 5 },
  { name: 'Rizky Pratama Wijaya', kelas: '7B', absen: 14 },
  { name: 'Nabila Zahra', kelas: '7B', absen: 22 },
  { name: 'Fajar Nugroho', kelas: '8C', absen: 2 },
  { name: 'Intan Permata Dewi', kelas: '8C', absen: 9 },
  { name: 'Yusuf Maulana Ibrahim', kelas: '8C', absen: 28 },
  { name: 'Kirana Ayu Lestari', kelas: '8C', absen: 6 },
  { name: 'Budi Santoso Saputra', kelas: '7A', absen: 8 },
  { name: 'Melati Kusuma Wardani', kelas: '7B', absen: 19 },
]

const RIMA_PAIRS = [
  ['-an', '-u', ['jalan', 'taman'], ['buku', 'satu']],
  ['-i', '-ang', ['pagi', 'kali'], ['datang', 'terang']],
  ['-a', '-ung', ['desa', 'bicara'], ['pulang', 'tenang']],
  ['-ai', '-u', ['pantai', 'ramai'], ['guru', 'ilmu']],
]

const COMMENTS = [
  'Rima sudah rapi, lanjutkan kebiasaan baik ini.',
  'Isi sudah sesuai fenomena. Perhatikan jumlah suku kata di baris 2.',
  'Bagus, pesannya jelas. Gagasan bisa dibuat lebih khusus lagi.',
  'Karya yang menyenangkan. Perbaiki sedikit pilihan kata di samping.',
]

function cardJpeg(path, lines, fullName, kelas, absen, judul) {
  const body = [
    `KARTU PANTUN — ${kelas} / No. ${absen}`,
    fullName,
    '',
    judul,
    '',
    ...lines.flatMap((l, i) => [`${i + 1}.  ${l}`, '']),
  ].join('\n')

  execFileSync('convert', [
    '-size', '900x1150', "xc:#FFFDE7",
    '-fill', '#27AE60', '-font', 'DejaVu-Sans-Bold', '-pointsize', '46',
    '-gravity', 'north', '-annotate', '+0+50', 'KREASI',
    '-fill', '#6D4C41', '-font', 'DejaVu-Sans', '-pointsize', '30',
    '-gravity', 'northwest', '-annotate', '+60+170', body,
    '-fill', '#BDBDBD', '-pointsize', '20',
    '-gravity', 'south', '-annotate', '+0+40', 'Kotak Kreasi — contoh data demo',
    path,
  ])
}

const now = Date.now()
let inserted = 0
let imaged = 0

for (let i = 0; i < STUDENTS.length; i++) {
  const student = STUDENTS[i]
  const phenomenon = phenomena[i % phenomena.length]
  const [sufA, sufB, wordsA, wordsB] = RIMA_PAIRS[i % RIMA_PAIRS.length]
  const lines = [...(phenomenon.pantun || [])].slice(0, 4)
  if (lines.length < 4) continue

  const kode = `KK-DUMMY-${String(i + 1).padStart(3, '0')}`
  const rima = {
    rimaA: { suffix: sufA, words: wordsA },
    rimaB: { suffix: sufB, words: wordsB },
  }
  // Score with the same engine the save route uses, so numbers look plausible.
  const validation = validatePantun({ lines, rima, pola: phenomenon.pola || '' })

  // Every third work is already graded; the first three approved for the gallery.
  const graded = i % 3 === 0
  const gallery = i < 3

  let imagePath = null
  if (WITH_IMAGES && i % 3 === 1) {
    const file = `/tmp/kk-dummy-${kode}.jpg`
    cardJpeg(file, lines, student.name, student.kelas, student.absen, phenomenon.name)
    const bytes = readFileSync(file)
    const { error } = await sb.storage
      .from(bucket)
      .upload(`works/${kode}.jpg`, bytes, { contentType: 'image/jpeg', upsert: true })
    if (error) console.warn(`  ! image upload failed for ${kode}: ${error.message}`)
    else { imagePath = `works/${kode}.jpg`; imaged++ }
  }

  const createdAt = new Date(now - (STUDENTS.length - i) * 30 * 60 * 60 * 1000).toISOString()

  const { error } = await sb.from('works').upsert({
    kode,
    created_at: createdAt,
    date_label: null,
    student_name: student.name,
    class_name: student.kelas,
    absen_no: student.absen,
    fenomena: phenomenon.name,
    gagasan: phenomenon.gagasan || '',
    pesan: phenomenon.pesan || '',
    pola: phenomenon.pola || '',
    rima_suffix: `A:${sufA}, B:${sufB}`,
    rima_words: `A: ${wordsA.join(', ')} | B: ${wordsB.join(', ')}`,
    line1: lines[0], line2: lines[1], line3: lines[2], line4: lines[3],
    image_path: imagePath,
    drive_url: null,
    auto_score: validation.score,
    grade: graded ? 85 + (i % 3) * 5 : null,
    comment: graded ? COMMENTS[i % COMMENTS.length] : '',
    status: graded ? 'SUDAH DINILAI' : 'BELUM DINILAI',
    gallery,
  }, { onConflict: 'kode' })

  if (error) console.warn(`  ! upsert failed for ${kode}: ${error.message}`)
  else inserted++
}

const { count } = await sb.from('works').select('id', { count: 'exact', head: true })
console.log(`Demo works written: ${inserted} (with card image: ${imaged})`)
console.log(`Total rows in works now: ${count}`)
console.log('Delete them later with: node scripts/delete-dummy.mjs')
