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
    // Struktur: { id, nama, deskripsi_sampiran, deskripsi_isi, aturan, contoh[] }
    pola: null,

    // Step 3: Rima yang dipilih
    rima: {
      suffix: '',   // misal: '-an', '-i', '-a'
      words: [],    // minimal 3 kata terpilih
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
    // Cek apakah semua data lengkap
    isComplete: (state) =>
      !!state.studentName &&
      !!state.phenomena &&
      !!state.pola &&
      state.rima.words.length >= 3 &&
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

    // Auto-check: apakah kata rima muncul di baris isi (3 atau 4)
    rimaCheck: (state) => {
      if (!state.rima.words.length) return false
      const words = state.rima.words.map((w) => w.toLowerCase())
      const b3 = state.pantun.baris3.toLowerCase()
      const b4 = state.pantun.baris4.toLowerCase()
      return words.some((w) => b3.includes(w) || b4.includes(w))
    },

    // Check apakah step tertentu sudah selesai
    isStepDone: (state) => (step) => {
      if (step === 1) return !!state.phenomena
      if (step === 2) return !!state.pola
      if (step === 3) return state.rima.words.length >= 3
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

    setRima(suffix, words) {
      this.rima = { suffix, words }
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
      this.rima = { suffix: '', words: [] }
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
