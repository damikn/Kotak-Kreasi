// composables/useKotakStore.js
// Pinia store utama — menyimpan semua state alur pembuatan pantun
import { defineStore } from 'pinia'
import { initialsOf, identityLabel } from '~/utils/name'

export const useKotakStore = defineStore('kotak', {
  state: () => ({
    // Student identity — full name plus the class/roll number that identifies
    // the student to the teacher. Every screen shows a derived short form
    // (see getters below), never the raw full name.
    studentName: '',
    studentClass: '',
    studentAbsen: '',

    // Step saat ini: 0=welcome, 1=cocokkan, 2=fenomena, 3=gagasan, 4=pola, 5=rima, 6=susun
    step: 0,

    // Step 2: Fenomena yang dipilih
    // Struktur: { id, slug, name, icon, color, description, contoh, gagasan, pesan, pantun[] }
    phenomena: null,

    // Step 1: Hasil latihan mencocokkan (cocokkan.vue / FenomenaMatch)
    // answers = { '<group>-<slot>': jawaban } berisi jawaban siswa
    cocokkan: {
      done: false,
      answers: {},
    },

    // Step 3: Gagasan & pesan yang ditulis siswa
    gagasan: {
      gagasan: '',
      pesan: '',
    },

    // Latihan tahap "Eksplorasi Pantun": route game → true setelah selesai
    games: {},

    // Waktu draf terakhir disimpan (tombol "Simpan Draf" di halaman tulis)
    draftSavedAt: '',

    // Tahap "Galeri dan Refleksi": ceklist penilaian diri & jawaban refleksi
    ceklist: {},
    refleksi: { q1: '', q2: '', q3: '' },

    // Step 4: Pola pantun dari roda putar
    // Struktur: { id, nama, deskripsi_sampiran, deskripsi_isi, aturan, ruleType, contoh[] }
    pola: null,

    // Step 5: Rima yang dipilih (2 Rima untuk sajak AB-AB)
    // Rima A = Baris 1 & 3, Rima B = Baris 2 & 4
    rima: {
      rimaA: {
        suffix: '', // misal '-i'
        words: [],  // minimal 2 kata
      },
      rimaB: {
        suffix: '', // misal '-an'
        words: [],  // minimal 2 kata
      },
    },

    // Step 6: Isi pantun 4 baris
    pantun: {
      baris1: '',
      baris2: '',
      baris3: '',
      baris4: '',
    },

    // Simpan ke store (untuk download di halaman hasil)
    savedImageUrl: '',     // URL Google Drive (jika berhasil upload)
    savedImageBase64: '',  // base64 JPG untuk download lokal di browser
    sessionId: '',         // session / file ID
    kodeKarya: '',         // kode unik karya (dari server)
    autoScore: null,       // skor otomatis dari server
  }),

  getters: {
    // Short form shown inside the app: "Budi Jaya Harsono" -> "Budi J. H."
    displayName: (state) => initialsOf(state.studentName),

    // Class + roll number line: "7A • No. 12"
    identityLine: (state) => identityLabel({ kelas: state.studentClass, absen: state.studentAbsen }),

    // Identity captured at the entry page (name + class + roll number)
    hasIdentity: (state) =>
      !!state.studentName && !!String(state.studentClass || '').trim() && !!String(state.studentAbsen || '').trim(),

    // Getter gabungan rima (untuk backward compatibility)
    allRimaWords: (state) => [
      ...(state.rima.rimaA?.words || []),
      ...(state.rima.rimaB?.words || []),
    ],

    // Cek apakah semua data lengkap
    isComplete: (state) =>
      !!state.studentName &&
      !!state.phenomena &&
      !!state.gagasan?.gagasan &&
      !!state.gagasan?.pesan &&
      !!state.pola &&
      !!state.rima.rimaA?.suffix &&
      state.rima.rimaA.words.length >= 2 &&
      !!state.rima.rimaB?.suffix &&
      state.rima.rimaB.words.length >= 2 &&
      state.rima.rimaA.suffix !== state.rima.rimaB.suffix &&
      !!state.pantun.baris1 &&
      !!state.pantun.baris2 &&
      !!state.pantun.baris3 &&
      !!state.pantun.baris4,

    // Array 4 baris pantun
    pantunLines: (state) => [
      state.pantun.baris1,
      state.pantun.baris2,
      state.pantun.baris3,
      state.pantun.baris4,
    ],

    // Hitung berapa baris yang sudah terisi
    filledLines: (state) =>
      [
        state.pantun.baris1,
        state.pantun.baris2,
        state.pantun.baris3,
        state.pantun.baris4,
      ].filter((b) => b.trim().length > 0).length,

    // Auto-check: apakah kata Rima A muncul di baris 1/3 dan kata Rima B di baris 2/4
    rimaCheck: (state) => {
      const wordsA = (state.rima.rimaA?.words || []).map((w) => w.toLowerCase())
      const wordsB = (state.rima.rimaB?.words || []).map((w) => w.toLowerCase())
      if (!wordsA.length && !wordsB.length) return false

      const b1 = state.pantun.baris1.toLowerCase()
      const b2 = state.pantun.baris2.toLowerCase()
      const b3 = state.pantun.baris3.toLowerCase()
      const b4 = state.pantun.baris4.toLowerCase()

      const hasA = wordsA.some((w) => b1.includes(w) || b3.includes(w))
      const hasB = wordsB.some((w) => b2.includes(w) || b4.includes(w))

      return hasA && hasB
    },

    // Check apakah step tertentu sudah selesai
    // 1=cocokkan, 2=fenomena, 3=gagasan, 4=pola, 5=rima, 6=susun
    isStepDone: (state) => (step) => {
      if (step === 1) return !!state.cocokkan?.done
      if (step === 2) return !!state.phenomena
      if (step === 3) return !!(state.gagasan?.gagasan && state.gagasan?.pesan)
      if (step === 4) return !!state.pola
      if (step === 5) {
        const rA = state.rima?.rimaA
        const rB = state.rima?.rimaB
        return (
          !!rA?.suffix &&
          (rA?.words?.length || 0) >= 2 &&
          !!rB?.suffix &&
          (rB?.words?.length || 0) >= 2 &&
          rA?.suffix !== rB?.suffix
        )
      }
      if (step === 6) return state.filledLines === 4
      return false
    },

    // Check apakah satu latihan (tahap Eksplorasi Pantun) sudah selesai
    isGameDone: (state) => (route) => !!state.games?.[route],
  },

  actions: {
    setName(name) {
      this.studentName = name.trim()
    },

    // Entry page: full name + class + roll number
    setIdentity({ name, kelas, absen } = {}) {
      if (name !== undefined) this.studentName = (name || '').toString().trim().replace(/\s+/g, ' ')
      if (kelas !== undefined) this.studentClass = (kelas || '').toString().trim().toUpperCase()
      if (absen !== undefined) this.studentAbsen = (absen || '').toString().trim()
    },

    setPhenomena(phenomena) {
      // Memilih fenomena lain membatalkan gagasan/pesan yang ditulis untuk
      // fenomena sebelumnya (keduanya terikat ke fenomena ini). Latihan
      // mencocokkan di tahap 1 tidak bergantung pada pilihan ini.
      if (phenomena?.slug && this.phenomena?.slug && this.phenomena.slug !== phenomena.slug) {
        this.gagasan = { gagasan: '', pesan: '' }
        if (this.step > 3) this.step = 2
      }
      this.phenomena = phenomena
      this.step = Math.max(this.step, 2)
    },

    // Step 1: hasil latihan mencocokkan gambar + keterangan
    setCocokkan(answers) {
      this.cocokkan = {
        done: true,
        answers: { ...(answers || {}) },
      }
      this.step = Math.max(this.step, 1)
    },

    // Step 3: gagasan & pesan yang ditulis siswa
    setGagasan({ gagasan, pesan } = {}) {
      this.gagasan = {
        gagasan: (gagasan || '').trim(),
        pesan: (pesan || '').trim(),
      }
      this.step = Math.max(this.step, 3)
    },

    // Tandai satu latihan tahap "Eksplorasi Pantun" sudah dikerjakan
    markGameDone(route) {
      if (!route) return
      this.games = { ...(this.games || {}), [route]: true }
    },

    setPola(pola) {
      this.pola = pola
      this.step = Math.max(this.step, 4)
    },

    setRima(rimaA, rimaB) {
      this.rima = {
        rimaA: {
          suffix: rimaA?.suffix || '',
          words: [...(rimaA?.words || [])],
        },
        rimaB: {
          suffix: rimaB?.suffix || '',
          words: [...(rimaB?.words || [])],
        },
      }
      this.step = Math.max(this.step, 5)
    },

    setPantun(lines) {
      this.pantun = {
        baris1: lines.baris1 ?? this.pantun.baris1,
        baris2: lines.baris2 ?? this.pantun.baris2,
        baris3: lines.baris3 ?? this.pantun.baris3,
        baris4: lines.baris4 ?? this.pantun.baris4,
      }
    },

    // Simpan draf di halaman tulis tanpa mengirim ke server
    saveDraft() {
      this.draftSavedAt = new Date().toISOString()
    },

    // Step evaluasi: ceklist penilaian diri
    setCeklist(items) {
      this.ceklist = { ...(items || {}) }
    },

    // Step evaluasi: refleksi belajar
    setRefleksi(answers) {
      this.refleksi = {
        q1: (answers?.q1 ?? '').trim(),
        q2: (answers?.q2 ?? '').trim(),
        q3: (answers?.q3 ?? '').trim(),
      }
    },

    setSavedResult(driveUrl, sessionId, kodeKarya, autoScore) {
      this.savedImageUrl = driveUrl
      this.sessionId = sessionId
      if (kodeKarya) this.kodeKarya = kodeKarya
      if (typeof autoScore === 'number') this.autoScore = autoScore
    },

    // Simpan base64 gambar untuk download lokal
    setImageBase64(base64) {
      this.savedImageBase64 = base64
    },

    // Reset pantun saja (untuk buat pantun baru dengan nama sama)
    resetPantun() {
      this.phenomena = null
      this.cocokkan = { done: false, answers: {} }
      this.gagasan = { gagasan: '', pesan: '' }
      this.pola = null
      this.rima = {
        rimaA: { suffix: '', words: [] },
        rimaB: { suffix: '', words: [] },
      }
      this.pantun = { baris1: '', baris2: '', baris3: '', baris4: '' }
      this.savedImageUrl = ''
      this.savedImageBase64 = ''
      this.sessionId = ''
      this.step = 0
    },

    // Reset total (kembali ke halaman awal)
    resetAll() {
      this.$reset()
    },
  },

  // Persist ke localStorage agar tidak hilang saat refresh.
  // Catatan: kunci modul di nuxt.config adalah `piniaPersistedstate` (bukan
  // `piniaPluginPersistedstate`) — kalau salah, modul memakai default 'cookies' dan
  // state besar (mis. base64 gambar) gagal disimpan karena batas ukuran cookie.
  // `savedImageBase64` di-omit karena bisa ratusan KB dan bukan data yang perlu bertahan.
  persist: {
    omit: ['savedImageBase64'],
  },
})
