<template>
  <!-- Halaman Awal: input nama siswa dengan latar alam ajaib -->
  <div class="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-8"
       style="background: linear-gradient(180deg, #87CEEB 0%, #b8e4b8 60%, #E8F5E9 100%)">

    <!-- ── SVG Awan mengambang ─────────────────────────────── -->
    <div class="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <!-- Awan 1 -->
      <svg class="absolute top-6 left-4 opacity-80 animate-float" style="animation-delay:0s" width="140" height="60" viewBox="0 0 140 60">
        <ellipse cx="70" cy="40" rx="70" ry="28" fill="white"/>
        <ellipse cx="50" cy="30" rx="38" ry="28" fill="white"/>
        <ellipse cx="90" cy="28" rx="32" ry="24" fill="white"/>
      </svg>
      <!-- Awan 2 -->
      <svg class="absolute top-10 right-10 opacity-70 animate-float" style="animation-delay:1.2s" width="110" height="48" viewBox="0 0 110 48">
        <ellipse cx="55" cy="32" rx="55" ry="22" fill="white"/>
        <ellipse cx="38" cy="24" rx="30" ry="22" fill="white"/>
        <ellipse cx="74" cy="22" rx="26" ry="20" fill="white"/>
      </svg>
      <!-- Awan 3 -->
      <svg class="absolute top-20 left-1/3 opacity-60 animate-float" style="animation-delay:0.7s" width="90" height="40" viewBox="0 0 90 40">
        <ellipse cx="45" cy="28" rx="45" ry="18" fill="white"/>
        <ellipse cx="30" cy="20" rx="25" ry="18" fill="white"/>
        <ellipse cx="62" cy="18" rx="22" ry="16" fill="white"/>
      </svg>
    </div>

    <!-- ── Tanaman / rumput bawah layar ───────────────────── -->
    <div class="absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden="true">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" class="w-full h-24 sm:h-32">
        <!-- Tanah -->
        <rect x="0" y="80" width="1200" height="40" fill="#795548" opacity="0.3" rx="0"/>
        <!-- Rumput -->
        <path d="M0,80 Q30,40 60,80 Q90,40 120,80 Q150,40 180,80 Q210,40 240,80 Q270,40 300,80 Q330,40 360,80 Q390,40 420,80 Q450,40 480,80 Q510,40 540,80 Q570,40 600,80 Q630,40 660,80 Q690,40 720,80 Q750,40 780,80 Q810,40 840,80 Q870,40 900,80 Q930,40 960,80 Q990,40 1020,80 Q1050,40 1080,80 Q1110,40 1140,80 Q1170,40 1200,80 L1200,120 L0,120 Z" fill="#27AE60" opacity="0.7"/>
        <!-- Tanaman kecil kiri -->
        <g transform="translate(80,50)">
          <rect x="-3" y="0" width="6" height="30" fill="#795548" rx="3"/>
          <ellipse cx="0" cy="-5" rx="18" ry="14" fill="#27AE60"/>
          <ellipse cx="-12" cy="5" rx="12" ry="9" fill="#2ECC71"/>
          <ellipse cx="12" cy="5" rx="12" ry="9" fill="#2ECC71"/>
        </g>
        <!-- Tanaman kecil kanan -->
        <g transform="translate(1100,45)">
          <rect x="-3" y="0" width="6" height="35" fill="#795548" rx="3"/>
          <ellipse cx="0" cy="-8" rx="22" ry="16" fill="#27AE60"/>
          <ellipse cx="-14" cy="4" rx="14" ry="10" fill="#2ECC71"/>
          <ellipse cx="14" cy="4" rx="14" ry="10" fill="#2ECC71"/>
        </g>
        <!-- Bunga kecil -->
        <g transform="translate(300,70)">
          <rect x="-2" y="0" width="4" height="20" fill="#795548" rx="2"/>
          <circle cx="0" cy="-2" r="8" fill="#F39C12"/>
          <circle cx="0" cy="-2" r="4" fill="#E74C3C"/>
        </g>
        <g transform="translate(900,68)">
          <rect x="-2" y="0" width="4" height="22" fill="#795548" rx="2"/>
          <circle cx="0" cy="-2" r="9" fill="#E91E63"/>
          <circle cx="0" cy="-2" r="4" fill="#FFFDE7"/>
        </g>
      </svg>
    </div>

    <!-- ── Kotak Ajaib SVG (kiri, animasi wiggle) ─────────── -->
    <div class="absolute left-4 bottom-24 sm:left-12 sm:bottom-28 pointer-events-none select-none" aria-hidden="true">
      <div class="animate-wiggle">
        <svg width="100" height="90" viewBox="0 0 100 90" class="drop-shadow-xl">
          <!-- Badan kotak -->
          <rect x="15" y="40" width="70" height="50" rx="6" fill="#795548"/>
          <rect x="15" y="40" width="70" height="50" rx="6" fill="url(#boxGrad)"/>
          <!-- Tutup kotak (terbuka) -->
          <path d="M10,42 Q50,10 90,42" fill="#5D4037" stroke="#795548" stroke-width="2"/>
          <!-- Bintang terbang keluar -->
          <g class="animate-float" style="transform-origin:50px 20px">
            <text x="45" y="28" font-size="18" fill="#F39C12">✦</text>
          </g>
          <text x="62" y="15" font-size="12" fill="#F39C12" opacity="0.8">✦</text>
          <text x="30" y="12" font-size="10" fill="#FFFDE7" opacity="0.9">★</text>
          <!-- Garis dekorasi kotak -->
          <line x1="50" y1="40" x2="50" y2="90" stroke="#F39C12" stroke-width="2" opacity="0.5"/>
          <line x1="15" y1="60" x2="85" y2="60" stroke="#F39C12" stroke-width="2" opacity="0.5"/>
          <!-- Kunci -->
          <circle cx="50" cy="65" r="5" fill="#F39C12"/>
          <rect x="48" y="67" width="4" height="6" fill="#F39C12" rx="1"/>
          <!-- Gradien -->
          <defs>
            <linearGradient id="boxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15"/>
              <stop offset="100%" stop-color="#000000" stop-opacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>

    <!-- ── Card Tengah ────────────────────────────────────── -->
    <div class="relative z-10 w-full max-w-md">
      <div class="bg-cream/90 backdrop-blur rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/60">

        <!-- Logo besar KOTAK KREASI -->
        <div class="text-center mb-2">
          <h1 class="font-fredoka font-bold leading-tight select-none">
            <div class="text-4xl sm:text-5xl mb-1">
              <span class="text-coral">K</span><span class="text-sunshine">O</span><span
                class="text-jungle">T</span><span class="text-sky">A</span><span
                class="text-coral">K</span>
            </div>
            <div class="text-5xl sm:text-6xl">
              <span class="text-sky">K</span><span class="text-jungle">R</span><span
                class="text-sunshine">E</span><span class="text-coral">A</span><span
                class="text-sky">S</span><span class="text-jungle">I</span>
            </div>
          </h1>

          <!-- Tagline -->
          <p class="font-nunito text-xs sm:text-sm text-bark/70 tracking-widest mt-2 mb-1 uppercase">
            Kembangkan • Rangkai • Eksplorasi • Cipta
          </p>

          <!-- Divider tanaman kecil -->
          <div class="flex items-center justify-center gap-2 my-3" aria-hidden="true">
            <span class="h-px w-12 bg-jungle/30 block"></span>
            <span class="text-jungle text-lg">🌿</span>
            <span class="h-px w-12 bg-jungle/30 block"></span>
          </div>
        </div>

        <!-- Sub tagline -->
        <p class="text-center font-nunito text-sm text-bark/60 mb-6">
          Yuk, ciptakan pantunmu dengan langkah yang tepat!
        </p>

        <!-- Form input nama -->
        <form @submit.prevent="handleSubmit" novalidate>
          <label for="nama-input" class="block font-nunito font-semibold text-bark text-sm mb-2">
            👤 Masukkan nama kamu:
          </label>
          <div class="flex gap-2">
            <input
              id="nama-input"
              v-model="namaInput"
              type="text"
              placeholder="Nama Siswa"
              autocomplete="given-name"
              maxlength="50"
              class="flex-1 border-2 rounded-xl px-4 py-3 font-fredoka text-lg text-center
                     focus:outline-none transition-all duration-200 bg-white/80"
              :class="[
                inputError
                  ? 'border-coral animate-shake focus:border-coral'
                  : 'border-jungle/30 focus:border-jungle focus:ring-2 focus:ring-jungle/20'
              ]"
              @input="inputError = false"
              @keydown.enter.prevent="handleSubmit"
              aria-describedby="nama-error"
            />
            <button
              type="submit"
              class="bg-jungle hover:bg-jungle/90 text-white rounded-xl px-5 py-3
                     transition-all duration-200 hover:shadow-lg hover:shadow-jungle/30
                     hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
              aria-label="Lanjutkan"
            >
              <span class="text-xl font-bold">✓</span>
            </button>
          </div>

          <!-- Pesan error -->
          <p
            id="nama-error"
            v-if="inputError"
            class="mt-2 text-xs text-coral font-nunito font-semibold flex items-center gap-1"
            role="alert"
          >
            <span>⚠️</span> Nama minimal 2 karakter ya!
          </p>
        </form>

        <!-- Teks kecil bawah (fade-in setelah 1 detik) -->
        <p
          class="text-center font-nunito text-xs text-bark/50 mt-5 italic transition-opacity duration-700"
          :class="showHint ? 'opacity-100' : 'opacity-0'"
        >
          "Satu ide kecil, bisa jadi pantun luar biasa!"
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'

definePageMeta({
  pageTransition: { name: 'page', mode: 'out-in' },
})

const store = useKotakStore()
const namaInput = ref(store.studentName || '')
const inputError = ref(false)
const showHint = ref(false)

// Kalau sudah ada nama, redirect ke menu
onMounted(() => {
  if (store.studentName) {
    namaInput.value = store.studentName
  }
  // Teks hint muncul setelah 1 detik
  setTimeout(() => {
    showHint.value = true
  }, 1000)
})

function handleSubmit() {
  const nama = namaInput.value.trim()
  if (nama.length < 2) {
    inputError.value = true
    return
  }
  store.setName(nama)
  navigateTo('/menu')
}
</script>