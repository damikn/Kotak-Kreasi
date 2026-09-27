// composables/useKaryaBook.js
// "Buku Karyaku" — the student's own portfolio, kept on the device.
// Every successful save appends one entry; the reflection and self-assessment answers are
// stored alongside so the downloadable book works offline.
const BOOK_KEY = 'kotak-kreasi-buku'

function readBook() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(BOOK_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeBook(entries) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(BOOK_KEY, JSON.stringify(entries.slice(0, 20)))
  } catch {
    // Storage full or unavailable — the book simply stays in memory for this session.
  }
}

export function useKaryaBook() {
  const entries = ref([])

  onMounted(() => {
    entries.value = readBook()
  })

  // Append a finished work. `imageBase64` is optional and only kept for the newest few entries.
  function addEntry(entry) {
    if (!entry?.kode && !entry?.baris) return
    const record = {
      kode: entry.kode ?? '',
      tanggal: entry.tanggal ?? new Date().toLocaleDateString('id-ID'),
      nama: entry.nama ?? '',
      fenomena: entry.fenomena ?? '',
      gagasan: entry.gagasan ?? '',
      pesan: entry.pesan ?? '',
      pola: entry.pola ?? '',
      baris: entry.baris ?? [],
      driveUrl: entry.driveUrl ?? '',
      refleksi: entry.refleksi ?? null,
      ceklist: entry.ceklist ?? null,
    }
    const withoutDuplicate = entries.value.filter((item) => item.kode !== record.kode)
    entries.value = [record, ...withoutDuplicate].slice(0, 20)
    writeBook(entries.value)
    return record
  }

  // Attach reflection / checklist answers to an existing entry (or to the newest one).
  function updateEntry(kode, patch) {
    const index = kode ? entries.value.findIndex((item) => item.kode === kode) : 0
    if (index < 0) return null
    const next = [...entries.value]
    next[index] = { ...next[index], ...patch }
    entries.value = next
    writeBook(entries.value)
    return next[index]
  }

  function clearBook() {
    entries.value = []
    writeBook([])
  }

  return { entries, addEntry, updateEntry, clearBook }
}
