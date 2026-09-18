// composables/useKotakStore.js
// Pinia store utama — menyimpan semua state alur pembuatan pantun
import { defineStore } from 'pinia'

export const useKotakStore = defineStore('kotak', {
  state: () => ({
    // Identitas siswa
    studentName: '',

    // Step saat ini: 0=welcome, 1=fenomena, 2=pola, 3=rima, 4=susun
    step: 0,

    // Step 1: Fenomena yang dipilih
    // Struktur: { id, slug, name, icon, color, description }
    phenomena: null,

    // Step 2: Pola pantun dari roda putar
    // Struktur: { id, nama, deskripsi_sampiran, deskripsi_isi, aturan, ruleType, contoh[] }
    pola: null,

    // Step 3: Rima yang dipilih (2 Rima untuk sajak AB-AB)
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

    // Step 4: Isi pantun 4 baris
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
  }),

  getters: {
    // Getter gabungan rima (untuk backward compatibility)
    allRimaWords: (state) => [
      ...(state.rima.rimaA?.words || []),
      ...(state.rima.rimaB?.words || []),
    ],

    // Cek apakah semua data lengkap
    isComplete: (state) =>
      !!state.studentName &&
      !!state.phenomena &&
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
    isStepDone: (state) => (step) => {
      if (step === 1) return !!state.phenomena
      if (step === 2) return !!state.pola
      if (step === 3) {
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
      if (step === 4) return state.filledLines === 4
      return false
    },
  },

  actions: {
    setName(name) {
      this.studentName = name.trim()
    },

    setPhenomena(phenomena) {
      this.phenomena = phenomena
      this.step = Math.max(this.step, 1)
    },

    setPola(pola) {
      this.pola = pola
      this.step = Math.max(this.step, 2)
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
      this.step = Math.max(this.step, 3)
    },

    setPantun(lines) {
      this.pantun = {
        baris1: lines.baris1 ?? this.pantun.baris1,
        baris2: lines.baris2 ?? this.pantun.baris2,
        baris3: lines.baris3 ?? this.pantun.baris3,
        baris4: lines.baris4 ?? this.pantun.baris4,
      }
    },

    setSavedResult(driveUrl, sessionId) {
      this.savedImageUrl = driveUrl
      this.sessionId = sessionId
    },

    // Simpan base64 gambar untuk download lokal
    setImageBase64(base64) {
      this.savedImageBase64 = base64
    },

    // Reset pantun saja (untuk buat pantun baru dengan nama sama)
    resetPantun() {
      this.phenomena = null
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

  // Persist ke localStorage agar tidak hilang saat refresh
  persist: true,
})
