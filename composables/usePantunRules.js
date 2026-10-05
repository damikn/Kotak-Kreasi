// composables/usePantunRules.js
// Pure pantun-checking helpers shared by every screen that validates a learner's work
// (/susun shows the full report, /nilai shows the rima + syllable findings in its
// "Petunjuk Perbaikan Pantun" panel). Keeping the syllable counter and the suffix
// matcher here means both pages can never disagree about the same pantun.
//
// No reactive state: these are plain functions, safe to call inside a computed.

export function countSyllablesInWord(word) {
  const w = String(word ?? '').toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  const matches = w.match(/[aiueo]/g)
  if (!matches) return 1
  let count = matches.length
  const diphthongs = w.match(/(ai|au|oi)/g)
  if (diphthongs) count -= diphthongs.length
  return Math.max(1, count)
}

export function countLineSyllables(line) {
  if (!String(line ?? '').trim()) return 0
  const words = String(line).trim().split(/\s+/)
  let total = 0
  for (const word of words) total += countSyllablesInWord(word)
  return total
}

export function lineWords(line) {
  return String(line ?? '').toLowerCase().split(/\s+/).map((w) => w.replace(/[^a-z0-9]/g, '')).filter(Boolean)
}

export function lineHasAny(line, words) {
  const clean = String(line ?? '').toLowerCase()
  return (words ?? []).some((w) => clean.includes(w))
}

export function hasRepeatedWord(line) {
  const words = lineWords(line)
  return words.length > 1 && new Set(words).size < words.length
}

// Does the LAST word of the line rhyme with the chosen suffix ('-i', '-an', ...)?
export function lineMatchesSuffix(lineText, suffix) {
  if (!String(lineText ?? '').trim() || !suffix) return false
  const words = String(lineText).trim().toLowerCase().split(/\s+/)
  const lastWord = words[words.length - 1].replace(/[^a-z]/g, '')
  const s = String(suffix).replace('-', '').toLowerCase()
  return lastWord.endsWith(s)
}

// Findings for the "Petunjuk Perbaikan Pantun" panel: the per-line rima checks and
// the 8–12 syllable rule, worded exactly like the report on /susun.
// lines: [baris1, baris2, baris3, baris4] · rimaA / rimaB: { suffix, words[] }
export function collectPantunIssues(lines, rimaA, rimaB) {
  const issues = []
  const filled = (lines ?? []).map((line) => String(line ?? ''))
  const filledCount = filled.filter((line) => line.trim().length > 0).length

  if (filledCount < 4) {
    issues.push({
      rule: 'BARIS_LENGKAP',
      title: 'Jumlah Baris Belum Lengkap',
      message: `Pantun harus memiliki 4 baris. Saat ini baru terisi ${filledCount} baris.`,
      action: 'Lengkapi semua 4 baris pantun.',
    })
    return issues
  }

  filled.forEach((line, idx) => {
    const syl = countLineSyllables(line)
    if (syl < 8) {
      issues.push({
        rule: 'SUKU_KATA_MIN',
        title: `Baris ${idx + 1} Terlalu Pendek`,
        message: `Baris ${idx + 1} hanya memiliki ${syl} suku kata. Pantun yang baik memiliki 8–12 suku kata per baris.`,
        action: `Tambahkan beberapa kata pada Baris ${idx + 1} agar menjadi 8–12 suku kata.`,
      })
    } else if (syl > 12) {
      issues.push({
        rule: 'SUKU_KATA_MAX',
        title: `Baris ${idx + 1} Terlalu Panjang`,
        message: `Baris ${idx + 1} memiliki ${syl} suku kata. Pantun yang baik memiliki 8–12 suku kata per baris.`,
        action: `Persingkat baris ${idx + 1} agar berada di kisaran 8–12 suku kata.`,
      })
    }
  })

  const sufA = rimaA?.suffix || ''
  const sufB = rimaB?.suffix || ''

  const rimaChecks = [
    { index: 0, suffix: sufA, rule: 'RIMA_A_BARIS_1', title: 'Rima Akhir Baris 1 Belum Sesuai', label: 'Baris 1', rima: 'A' },
    { index: 2, suffix: sufA, rule: 'RIMA_A_BARIS_3', title: 'Rima Akhir Baris 3 (Isi) Belum Sesuai', label: 'Baris 3 (Isi)', rima: 'A' },
    { index: 1, suffix: sufB, rule: 'RIMA_B_BARIS_2', title: 'Rima Akhir Baris 2 Belum Sesuai', label: 'Baris 2', rima: 'B' },
    { index: 3, suffix: sufB, rule: 'RIMA_B_BARIS_4', title: 'Rima Akhir Baris 4 (Isi) Belum Sesuai', label: 'Baris 4 (Isi)', rima: 'B' },
  ]

  for (const check of rimaChecks) {
    if (!check.suffix) continue
    if (lineMatchesSuffix(filled[check.index], check.suffix)) continue
    const lastWord = filled[check.index].trim().split(/\s+/).pop() || ''
    issues.push({
      rule: check.rule,
      title: check.title,
      message: `${check.label} harus berakhiran rima ${check.rima} ('${check.suffix}'). Kata terakhir saat ini adalah '${lastWord}'.`,
      action: `Ganti kata terakhir ${check.label} dengan kata yang berakhiran rima '${check.suffix}'.`,
    })
  }

  const wordsA = (rimaA?.words || []).map((w) => w.toLowerCase())
  const wordsB = (rimaB?.words || []).map((w) => w.toLowerCase())

  if (wordsA.length) {
    const usedA = wordsA.some((w) => filled[0].toLowerCase().includes(w) || filled[2].toLowerCase().includes(w))
    if (!usedA) {
      issues.push({
        rule: 'KATA_RIMA_A_MISSING',
        title: 'Kata Rima A Belum Digunakan',
        message: `Belum ada kata dari Rima A (${wordsA.join(', ')}) yang dipakai pada Baris 1 atau Baris 3.`,
        action: `Gunakan kata pilihan Rima A (${wordsA.join(', ')}) ke dalam Baris 1 atau Baris 3.`,
      })
    }
  }

  if (wordsB.length) {
    const usedB = wordsB.some((w) => filled[1].toLowerCase().includes(w) || filled[3].toLowerCase().includes(w))
    if (!usedB) {
      issues.push({
        rule: 'KATA_RIMA_B_MISSING',
        title: 'Kata Rima B Belum Digunakan',
        message: `Belum ada kata dari Rima B (${wordsB.join(', ')}) yang dipakai pada Baris 2 atau Baris 4.`,
        action: `Gunakan kata pilihan Rima B (${wordsB.join(', ')}) pada Baris 2 atau Baris 4.`,
      })
    }
  }

  return issues
}
