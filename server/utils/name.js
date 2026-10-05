// server/utils/name.js
// Server-side copy of utils/name.js.
//
// Nitro cannot resolve modules that live outside the server/ tree (an import of
// ../../utils/name ends up in the prerender bundle as a bare "/utils/name" and
// crashes the build), so the server keeps its own copy of these three helpers.
// The client reads utils/name.js — if you change the rule, change both files.

export function normalizeName(raw) {
  return (raw || '').toString().trim().replace(/\s+/g, ' ')
}

// "Budi Jaya Harsono" -> "Budi J. H." · "Budi" -> "Budi"
export function initialsOf(fullName) {
  const parts = normalizeName(fullName).split(' ').filter(Boolean)
  if (parts.length === 0) return 'Siswa'
  if (parts.length === 1) return parts[0]

  const [first, ...rest] = parts
  const initials = rest
    .map((part) => (part[0] ? `${part[0].toUpperCase()}.` : ''))
    .filter(Boolean)
    .join(' ')

  return `${first} ${initials}`.trim()
}

export function firstNameOf(fullName) {
  return normalizeName(fullName).split(' ').filter(Boolean)[0] || 'Siswa'
}

export function identityLabel({ kelas, absen } = {}) {
  const k = (kelas || '').toString().trim()
  const a = absen === null || absen === undefined || absen === '' ? '' : String(absen).trim()
  if (k && a) return `${k} • No. ${a}`
  return k || (a ? `No. ${a}` : '')
}
