// utils/name.js
// Display-name helpers shared by the Pinia store (client) and the server routes.
//
// The FULL name is what gets stored with every work — the teacher needs it for
// grading. What students see inside the app is derived here, so the rule
// ("Budi Jaya Harsono" -> "Budi J. H.") lives in exactly one place.

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

// "Budi Jaya Harsono" -> "Budi"
export function firstNameOf(fullName) {
  return normalizeName(fullName).split(' ').filter(Boolean)[0] || 'Siswa'
}

// "7A" + "12" -> "7A • No. 12" (empty parts are dropped)
export function identityLabel({ kelas, absen } = {}) {
  const k = (kelas || '').toString().trim()
  const a = absen === null || absen === undefined || absen === '' ? '' : String(absen).trim()
  if (k && a) return `${k} • No. ${a}`
  return k || (a ? `No. ${a}` : '')
}

// Short line used under a card title: "Budi J. H. · 7A • No. 12"
export function displayLine(fullName, { kelas, absen } = {}) {
  const name = initialsOf(fullName)
  const id = identityLabel({ kelas, absen })
  return id ? `${name} · ${id}` : name
}
