<template>
  <!-- Halaman Hasil: konfirmasi penyimpanan + preview + download karya -->
  <div
    class="min-h-screen flex flex-col relative overflow-hidden"
    style="background: linear-gradient(180deg, #d4edda 0%, #cce5f0 60%, #E8F5E9 100%)"
  >
    <!-- Konfetti animasi saat halaman load -->
    <ConfettiEffect v-if="showConfetti" :duration="4000" :count="90" @done="showConfetti = false" />

    <!-- Header -->
    <header class="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
        <span class="font-fredoka font-bold text-xl tracking-wide">
          <span class="text-coral">K</span><span class="text-sunshine">O</span><span
            class="text-jungle">T</span><span class="text-sky">A</span><span
            class="text-coral">K</span>
          <span class="text-gray-300 mx-1 font-light">|</span>
          <span class="text-sky">K</span><span class="text-jungle">R</span><span
            class="text-sunshine">E</span><span class="text-coral">A</span><span
            class="text-sky">S</span><span class="text-jungle">I</span>
        </span>
        <button
          @click="navigateTo('/')"
          class="text-sm text-gray-400 hover:text-bark border border-gray-200
                 hover:border-bark/30 rounded-lg px-3 py-1.5 transition-all font-nunito font-semibold"
        >
          🏠 Beranda
        </button>
      </div>
    </header>

    <!-- Dekorasi tanaman kiri -->
    <div class="absolute bottom-0 left-0 pointer-events-none select-none" aria-hidden="true">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <g transform="translate(30,110)">
          <rect x="-5" y="-90" width="10" height="90" fill="#795548" rx="5"/>
          <ellipse cx="0" cy="-100" rx="42" ry="34" fill="#27AE60"/>
          <ellipse cx="-24" cy="-78" rx="26" ry="20" fill="#2ECC71"/>
          <ellipse cx="24" cy="-78" rx="26" ry="20" fill="#2ECC71"/>
        </g>
        <g transform="translate(110,140)">
          <rect x="-4" y="-60" width="8" height="60" fill="#795548" rx="4"/>
          <ellipse cx="0" cy="-68" rx="32" ry="26" fill="#27AE60"/>
        </g>
      </svg>
    </div>
    <!-- Dekorasi tanaman kanan -->
    <div class="absolute bottom-0 right-0 pointer-events-none select-none" aria-hidden="true">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <g transform="translate(150,110)">
          <rect x="-5" y="-85" width="10" height="85" fill="#795548" rx="5"/>
          <ellipse cx="0" cy="-95" rx="38" ry="32" fill="#27AE60"/>
          <ellipse cx="-22" cy="-74" rx="24" ry="18" fill="#2ECC71"/>
          <ellipse cx="22" cy="-74" rx="24" ry="18" fill="#2ECC71"/>
        </g>
      </svg>
    </div>

    <main class="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
      <div class="w-full max-w-2xl">

        <!-- ── Kartu sukses ──────────────────────────────── -->
        <div class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 sm:p-8 mb-6
                    border border-white/60 text-center">

          <!-- Ikon centang bounce-in -->
          <div class="flex justify-center mb-4">
            <div class="w-20 h-20 rounded-full bg-jungle flex items-center justify-center
                        shadow-xl shadow-jungle/30 animate-bounce-in relative">
              <svg class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12l5 5 11-11" stroke="currentColor" stroke-width="2.5"
                      stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="absolute -top-1 -right-1 text-xl animate-spin-slow">✦</span>
              <span class="absolute -bottom-1 -left-1 text-base text-sunshine">★</span>
            </div>
          </div>

          <h1 class="font-fredoka font-bold text-3xl sm:text-4xl text-jungle mb-2">
            Karyamu berhasil disimpan!
          </h1>

          <!-- Status simpan -->
          <div class="space-y-1 mb-4">
            <!-- Sheets selalu ada -->
            <p class="font-nunito text-sm text-gray-500 flex items-center justify-center gap-2">
              <span class="text-jungle font-bold">✓</span>
              Data tersimpan di Google Sheets
            </p>
            <!-- Drive (opsional) -->
            <p v-if="store.savedImageUrl"
               class="font-nunito text-sm text-gray-500 flex items-center justify-center gap-2">
              <span class="text-jungle font-bold">✓</span>
              Foto tersimpan di Google Drive
            </p>
            <!-- Download JPG -->
            <p class="font-nunito text-sm flex items-center justify-center gap-2"
               :class="downloadDone ? 'text-jungle' : 'text-sunshine'">
              <span class="font-bold">{{ downloadDone ? '✓' : '⏳' }}</span>
              {{ downloadDone ? 'File JPG berhasil diunduh!' : 'Menyiapkan file JPG...' }}
            </p>
          </div>

          <p class="font-nunito text-xs text-bark/50 italic mb-5">
            "Teruslah berkarya, karena setiap kata punya makna!"
          </p>

          <!-- Link Google Drive (jika ada) -->
          <a
            v-if="store.savedImageUrl"
            :href="store.savedImageUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-sm font-nunito font-semibold
                   text-sky hover:text-sky/70 underline underline-offset-2 transition-colors mb-4 block"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6.28 3L1 12.49l3.5 6.07L9.78 9.07 6.28 3zM22 12.49L16.72 3H9.72l5.28 9.17H22v.01L22 12.49zm-7.78 3.07l-3.5 6.07h7l3.5-6.07h-7z"/>
            </svg>
            Lihat di Google Drive →
          </a>

          <!-- ── Tombol Download JPG ──────────────────────── -->
          <div class="mt-2">
            <button
              @click="downloadJpg"
              :disabled="isGenerating || !canDownload"
              class="inline-flex items-center justify-center gap-2 font-fredoka font-bold text-base
                     rounded-2xl px-7 py-3 transition-all duration-200 w-full sm:w-auto"
              :class="canDownload && !isGenerating
                ? 'bg-jungle text-white hover:bg-jungle/90 shadow-lg shadow-jungle/30 hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
            >
              <!-- Loading spinner -->
              <svg v-if="isGenerating"
                   class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              <!-- Ikon download -->
              <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3v13M5 15l7 7 7-7"/>
                <rect x="3" y="20" width="18" height="2" rx="1"/>
              </svg>
              <span>{{ isGenerating ? 'Membuat gambar...' : 'Download Pantun (.jpg)' }}</span>
            </button>

            <!-- Pesan error jika generate gagal -->
            <p v-if="downloadError"
               class="mt-2 text-xs text-coral font-nunito text-center">
              ⚠️ {{ downloadError }}
              <button @click="downloadJpg" class="underline ml-1">Coba lagi</button>
            </p>

            <!-- Info nama file -->
            <p v-if="downloadDone"
               class="mt-2 text-xs text-gray-400 font-nunito text-center">
              📁 {{ downloadFilename }}
            </p>
          </div>
        </div>

        <!-- ── Preview kartu pantun (target render ulang jika base64 tidak ada) ── -->
        <div class="flex justify-center mb-8">
          <!-- div ini dipakai html2canvas jika base64 hilang dari store -->
          <div id="pantun-preview-hasil">
            <PantunCard
              :lines="store.pantunLines"
              :student-name="store.studentName"
              :phenomena="store.phenomena?.name ?? ''"
              :pola="`Pola ${store.pola?.id} — ${store.pola?.nama}`"
              :rima-words="store.rima.words"
              :suffix="store.rima.suffix"
            />
          </div>
        </div>

        <!-- ── Tombol navigasi bawah ───────────────────────── -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            @click="handleKembaliMenu"
            class="flex items-center gap-2 font-fredoka font-bold text-lg rounded-2xl
                   px-8 py-3.5 bg-sky text-white hover:bg-sky/90 shadow-lg shadow-sky/30
                   transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0
                   w-full sm:w-auto justify-center"
          >
            <span>🏠</span>
            <span>Kembali ke Menu Utama</span>
          </button>

          <button
            @click="handleBuatBaru"
            class="font-nunito text-sm font-semibold text-gray-400 hover:text-coral
                   underline underline-offset-2 transition-colors duration-200"
          >
            Buat Pantun Baru
          </button>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'

definePageMeta({
  pageTransition: { name: 'page', mode: 'out-in' },
})

const store = useKotakStore()

// ── Guard ─────────────────────────────────────────────────
onMounted(async () => {
  if (!store.studentName) { navigateTo('/'); return }
  if (!store.pantunLines.some((b) => b.trim())) { navigateTo('/susun'); return }

  // Auto-download setelah 800ms (beri waktu halaman render + konfetti muncul)
  setTimeout(() => autoDownload(), 800)
})

// ── State konfetti + download ─────────────────────────────
const showConfetti   = ref(true)
const isGenerating   = ref(false)
const downloadDone   = ref(false)
const downloadError  = ref('')
const downloadFilename = ref('')
const canDownload    = computed(() => store.pantunLines.some((b) => b.trim()))

// Buat nama file yang rapi
function buildFilename() {
  const nama = (store.studentName ?? 'siswa')
    .replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_')
  const tanggal = new Date().toISOString().slice(0, 10)
  return `pantun_${nama}_${tanggal}.jpg`
}

// ── Core: ambil base64 (dari store atau render ulang) ─────
async function getBase64() {
  // 1. Pakai base64 yang sudah disimpan di store (hasil dari susun.vue)
  if (store.savedImageBase64 && store.savedImageBase64.startsWith('data:image')) {
    return store.savedImageBase64
  }

  // 2. Fallback: render ulang dari elemen DOM di halaman ini
  const html2canvas = (await import('html2canvas')).default
  const el = document.getElementById('pantun-preview-hasil')
  if (!el) throw new Error('Elemen preview tidak ditemukan.')

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#FFFDE7',
    logging: false,
  })
  const base64 = canvas.toDataURL('image/jpeg', 0.95)

  // Simpan ke store supaya klik berikutnya instan
  store.setImageBase64(base64)
  return base64
}

// ── Auto-download saat halaman pertama dibuka ─────────────
async function autoDownload() {
  if (downloadDone.value || isGenerating.value) return
  await downloadJpg()
}

// ── Tombol download (bisa diklik berulang) ────────────────
async function downloadJpg() {
  if (isGenerating.value) return
  isGenerating.value  = true
  downloadError.value = ''

  try {
    const base64 = await getBase64()
    const fname  = buildFilename()

    // Trigger download di browser
    const link = document.createElement('a')
    link.href     = base64
    link.download = fname
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    downloadFilename.value = fname
    downloadDone.value     = true
  } catch (err) {
    console.error('[hasil] download error:', err)
    downloadError.value = err?.message ?? 'Gagal membuat gambar.'
  } finally {
    isGenerating.value = false
  }
}

// ── Navigasi ──────────────────────────────────────────────
function handleKembaliMenu() {
  store.resetPantun()
  navigateTo('/menu')
}

function handleBuatBaru() {
  const nama = store.studentName
  store.resetAll()
  store.setName(nama)
  navigateTo('/fenomena')
}
</script>
