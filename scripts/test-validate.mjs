// scripts/test-validate.mjs
// Unit test untuk server/utils/validate-pantun.js
// Jalankan: node scripts/test-validate.mjs

import { validatePantun } from '../server/utils/validate-pantun.js'

const G = { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', x: '\x1b[0m' }
const ok = (m) => console.log(`${G.g}✓${G.x} ${m}`)
const fail = (m) => console.log(`${G.r}✗${G.x} ${m}`)
const bold = (m) => console.log(`${G.b}${m}${G.x}`)

let pass = 0
let total = 0

function expect(desc, cond) {
  total++
  if (cond) { pass++; ok(desc) } else { fail(desc) }
}

const rimaAB = {
  rimaA: { suffix: '-an', words: ['jalan', 'teman', 'harapan'] },
  rimaB: { suffix: '-ah', words: ['rumah', 'sekolah', 'wajah'] },
}

function basePola(type) {
  if (type === 'repetisi_awal_sampiran') {
    return {
      ruleType: 'repetisi_awal_sampiran',
      nama: 'Repetisi pada Awal Sampiran',
    }
  }
  if (type === 'sampiran_hewan') {
    return { ruleType: 'sampiran_hewan', nama: 'Sampiran Bertema Hewan' }
  }
  if (type === 'isi_ajakan') {
    return { ruleType: 'isi_ajakan', nama: 'Isi Berupa Ajakan' }
  }
  return { ruleType: 'pertanyaan_retoris', nama: 'Isi Berupa Pertanyaan Retoris' }
}

bold('\n🧪 Test: Pantun sempurna, rima gagal, pola gagal, baris kurang, kata rima')

// Skenario benar-benar lolos semua checks (pola 1: awal b1 = awal b2)
{
  // Semua baris 8-12 suku kata, rima -an/-ah, kata rima terpakai, awal b1=b2
  const r = validatePantun({
    lines: [
      'Teman rajin bawa harapan',      // -an ok, awal 'teman' (9 suku)
      'Teman juga jaga sekolah',       // -ah ok, awal 'teman' (9 suku)
      'Rajin berbuat penuh harapan',   // -an ok (10 suku)
      'Ayo bersihkan semua rumah',     // -ah ok (9 suku)
    ],
    rima: rimaAB,
    pola: basePola('repetisi_awal_sampiran'),
  })
  expect('skor = 100', r.score === 100)
  expect('baris_lengkap passed', r.checks[0].passed)
  expect('suku_kata passed', r.checks[1].passed)
  expect('rima_ab passed', r.checks[2].passed)
}

// Skenario rima A-B-A-B gagal (b1 tidak end -an)
{
  const r = validatePantun({
    lines: [
      'Teman rajin bawa ke pasar',     // end 'pasar' != -an
      'Teman juga jaga sekolah',       // -ah ok
      'Rajin berbuat penuh harapan',   // -an ok
      'Ayo bersihkan semua rumah',     // -ah ok
    ],
    rima: rimaAB,
    pola: basePola('repetisi_awal_sampiran'),
  })
  expect('skor < 100 (4/5 = 80)', r.score === 80)
  expect('rima_ab failed', !r.checks[2].passed)
}

// Skenario pola hewan gagal (tidak ada nama hewan di sampiran)
{
  const r = validatePantun({
    lines: [
      'Jalan pagi di taman harapan',
      'Tinggal di kota dekat sekolah',
      'Belajar tekun jangan bosan',
      'Rajin membaca buku sejarah',
    ],
    rima: rimaAB,
    pola: basePola('sampiran_hewan'),
  })
  expect('pola failed (tidak ada hewan)', !r.checks[4].passed)
  expect('polaRule.message ada', !!r.polaRule?.message)
}

// Skenario baris belum lengkap
{
  const r = validatePantun({
    lines: ['Satu baris saja', '', '', ''],
    rima: rimaAB,
    pola: basePola('repetisi_awal_sampiran'),
  })
  expect('skor 0 (0/5 passed)', r.score === 0)
  expect('baris_lengkap failed', !r.checks[0].passed)
}

// Skenario kata rima tidak dipakai (hanya rima A di b1, rima B tidak)  -> && fix
{
  const r = validatePantun({
    lines: [
      'Teman rajin bawa harapan',      // -an + 'teman'
      'Teman juga jaga sekolah',       // -ah + 'sekolah'? Sekolah is in wordsB, b2 -> rima B word used BUT line2 ends school -ah yes
      'Rajin berbuat penuh harapan',
      'Ayo bersihkan rumah',
    ],
    rima: {
      rimaA: { suffix: '-an', words: ['teman', 'harapan'] },
      rimaB: { suffix: '-ah', words: ['sekolah', 'rumah'] },
    },
    pola: basePola('repetisi_awal_sampiran'),
  })
  // both A and B words used => kata_rima passed
  expect('kata_rima passed (A & B words used)', r.checks[3].passed)
}

// Kelompok kata rima negatif: B word hilang dari b2/b4
{
  const r = validatePantun({
    lines: [
      'Teman rajin bawa harapan',      // A word (teman/harapan)
      'Teman juga jaga tinggal',       // end -gal? not -ah. but contains no B words
      'Rajin berbuat penuh harapan',   // A word
      'Ayo bersihkan tempat tinggal',  // end -gal no; contains no B words
    ],
    rima: rimaAB,
    pola: basePola('repetisi_awal_sampiran'),
  })
  expect('kata_rima failed (B words not used)', !r.checks[3].passed)
}

bold('\n📊 Hasil:')
console.log(`  ${pass}/${total} test lulus`)
if (pass === total) {
  bold('✅ SEMUA TEST LULUS!\n')
} else {
  bold(`❌ ${total - pass} test gagal\n`)
  process.exit(1)
}