<template>
  <div class="w-full select-none flex flex-col items-center">

    <!-- ======================================================
         POHON APEL
         ====================================================== -->
    <div class="relative w-full flex justify-center" :style="{ maxWidth: `${props.width}px` }">

      <!-- viewBox diperlebar dari 320x360 ke 360x390 agar ring animasi berputar tidak terpotong tepi -->
      <svg class="block w-full h-auto overflow-visible" viewBox="0 0 360 390" preserveAspectRatio="xMidYMid meet"
        role="img" :aria-label="`Pohon rima dengan ${apples.length} pilihan akhiran`">

        <!-- ==================================================
             DEFINITIONS
             ================================================== -->
        <defs>
          <linearGradient id="trunkGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#4E342E" />
            <stop offset="45%" stop-color="#795548" />
            <stop offset="70%" stop-color="#6D4C41" />
            <stop offset="100%" stop-color="#3E2723" />
          </linearGradient>

          <radialGradient id="leafGradient" cx="35%" cy="25%" r="80%">
            <stop offset="0%" stop-color="#43C46B" />
            <stop offset="65%" stop-color="#27AE60" />
            <stop offset="100%" stop-color="#168447" />
          </radialGradient>

          <radialGradient id="leafHighlight" cx="35%" cy="25%" r="80%">
            <stop offset="0%" stop-color="#70E88D" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#2ECC71" stop-opacity="0" />
          </radialGradient>

          <filter id="treeShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#145A32" flood-opacity="0.20" />
          </filter>

          <filter id="appleShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.25" />
          </filter>
        </defs>

        <!-- ==================================================
             BAYANGAN TANAH
             ================================================== -->
        <ellipse cx="180" cy="365" rx="88" ry="12" fill="#2E7D32" opacity="0.16" />

        <!-- ==================================================
             BATANG POHON
             ================================================== -->
        <path d="
            M 163 235
            C 163 268, 164 305, 163 358
            C 163 365, 169 368, 180 368
            C 191 368, 197 365, 197 358
            C 196 305, 197 268, 197 235
            Z
          " fill="url(#trunkGradient)" />

        <path d="
            M 172 242
            C 172 274, 174 316, 173 358
          " fill="none" stroke="#A1887F" stroke-width="4" stroke-linecap="round" opacity="0.30" />

        <path d="
            M 187 245
            C 187 282, 186 318, 188 356
          " fill="none" stroke="#3E2723" stroke-width="3" stroke-linecap="round" opacity="0.35" />

        <!-- ==================================================
             CABANG POHON
             ================================================== -->
        <path d="
            M 179 265
            C 164 245, 145 224, 122 202
            C 114 194, 107 185, 101 175
          " fill="none" stroke="#5D4037" stroke-width="12" stroke-linecap="round" />

        <path d="
            M 137 230
            C 129 211, 125 195, 126 178
          " fill="none" stroke="#6D4C41" stroke-width="7" stroke-linecap="round" />

        <path d="
            M 181 265
            C 196 244, 215 224, 238 202
            C 247 193, 254 183, 260 171
          " fill="none" stroke="#5D4037" stroke-width="12" stroke-linecap="round" />

        <path d="
            M 221 227
            C 229 210, 233 194, 232 177
          " fill="none" stroke="#6D4C41" stroke-width="7" stroke-linecap="round" />

        <path d="
            M 180 252
            C 179 227, 179 203, 180 173
          " fill="none" stroke="#6D4C41" stroke-width="9" stroke-linecap="round" />

        <!-- ==================================================
             TAJUK POHON (DIPERLEBAR & LEBIH PENUH SUPAYA SEMUA APEL DI DALAM DAUN)
             ================================================== -->
        <!-- Siluet latar belakang tajuk -->
        <path d="
            M 85 220
            C 71 206, 73 185, 86 171
            C 73 153, 81 133, 99 124
            C 97 102, 116 86, 137 87
            C 145 66, 167 58, 184 68
            C 201 54, 228 62, 235 83
            C 260 76, 276 94, 273 115
            C 293 124, 298 147, 284 163
            C 299 178, 293 203, 275 213
            C 267 235, 246 243, 227 234
            C 210 250, 187 246, 172 235
            C 154 247, 130 241, 122 223
            C 106 231, 89 227, 85 220
            Z
          " fill="#146B39" opacity="0.35" transform="translate(0 10)" />

        <!-- Gumpalan tajuk lingkaran berlapis yang proporsional -->
        <circle cx="98" cy="188" r="46" fill="#218C4A" filter="url(#treeShadow)" />
        <circle cx="114" cy="139" r="46" fill="url(#leafGradient)" filter="url(#treeShadow)" />
        <circle cx="148" cy="113" r="50" fill="url(#leafGradient)" filter="url(#treeShadow)" />
        <circle cx="183" cy="98" r="52" fill="url(#leafGradient)" filter="url(#treeShadow)" />
        <circle cx="224" cy="115" r="50" fill="url(#leafGradient)" filter="url(#treeShadow)" />
        <circle cx="254" cy="148" r="48" fill="url(#leafGradient)" filter="url(#treeShadow)" />
        <circle cx="260" cy="190" r="46" fill="#208B48" filter="url(#treeShadow)" />
        
        <!-- Kubah tengah tajuk yang tebal & tinggi -->
        <circle cx="180" cy="155" r="65" fill="url(#leafGradient)" />
        <!-- Tajuk bawah yang menaungi apel bawah agar tidak keluar dahan -->
        <ellipse cx="180" cy="202" rx="98" ry="56" fill="#229D52" />
        <ellipse cx="148" cy="105" rx="58" ry="32" fill="url(#leafHighlight)" opacity="0.65" />

        <!-- ==================================================
             DAUN-DAUN KECIL DEKORATIF
             ================================================== -->
        <g fill="#75D98C" opacity="0.65">
          <ellipse cx="102" cy="140" rx="9" ry="4.5" transform="rotate(-30 102 140)" />
          <ellipse cx="129" cy="99" rx="10" ry="4.5" transform="rotate(-20 129 99)" />
          <ellipse cx="206" cy="75" rx="10" ry="4.5" transform="rotate(25 206 75)" />
          <ellipse cx="254" cy="125" rx="10" ry="4.5" transform="rotate(30 254 125)" />
          <ellipse cx="268" cy="177" rx="9" ry="4.5" transform="rotate(-25 268 177)" />
          <ellipse cx="115" cy="199" rx="9" ry="4.5" transform="rotate(25 115 199)" />
        </g>

        <!-- ==================================================
             APEL-APEL
             Semua koordinat dirancang ulang tanpa tumpang tindih (gap aman min 54px antarpusat),
             semua berada di dalam zona hijau tajuk, dan radius 24px memberi ruang teks yang lega.
             ================================================== -->
        <g v-for="apple in apples" :key="apple.suffix" class="cursor-pointer group" role="button"
          :aria-label="`Pilih rima ${apple.suffix}`" tabindex="0" @click="emit('select', apple.suffix)"
          @keydown.enter.prevent="emit('select', apple.suffix)" @keydown.space.prevent="emit('select', apple.suffix)"
          filter="url(#appleShadow)">

          <!-- Hitbox transparan 64px untuk kenyamanan sentuhan di mobile (WCAG compliant) -->
          <circle :cx="apple.x" :cy="apple.y" r="32" fill="transparent" />

          <!-- Bayangan apel -->
          <ellipse :cx="apple.x" :cy="apple.y + apple.r * 0.75" :rx="apple.r * 0.72" :ry="apple.r * 0.22" fill="#000"
            opacity="0.16" />

          <!-- Ring penanda Rima A / Rima B (Dashed circle berputar dengan padding cukup dari tepi SVG) -->
          <circle v-if="apple.isRimaA || apple.isRimaB" :cx="apple.x" :cy="apple.y" :r="apple.r + 5" fill="none"
            :stroke="apple.isRimaA ? '#E53935' : '#1E88E5'" stroke-width="3.5" stroke-dasharray="5 3"
            class="animate-spin-slow" />

          <!-- Badan apel -->
          <circle :cx="apple.x" :cy="apple.y" :r="apple.r" :fill="apple.color"
            :stroke="apple.isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.75)'"
            :stroke-width="apple.isSelected ? 3.5 : 2"
            class="transition-all duration-200 group-hover:scale-105"
            :style="apple.isSelected ? 'filter:drop-shadow(0 0 10px rgba(255,255,255,0.95))' : ''" />

          <!-- Badge huruf A / B pada apel terpilih -->
          <g v-if="apple.isRimaA || apple.isRimaB">
            <circle :cx="apple.x + apple.r * 0.68" :cy="apple.y - apple.r * 0.68" r="9"
              :fill="apple.isRimaA ? '#E53935' : '#1E88E5'" stroke="#FFFFFF" stroke-width="2" />
            <text :x="apple.x + apple.r * 0.68" :y="apple.y - apple.r * 0.68 + 1" text-anchor="middle"
              dominant-baseline="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="10"
              fill="#FFFFFF">
              {{ apple.isRimaA ? 'A' : 'B' }}
            </text>
          </g>

          <!-- Lekukan atas apel -->
          <path :d="`
              M ${apple.x - apple.r * 0.48} ${apple.y - apple.r * 0.58}
              Q ${apple.x} ${apple.y - apple.r * 0.82} ${apple.x + apple.r * 0.48} ${apple.y - apple.r * 0.58}
            `" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" />

          <!-- Kilauan highlight apel -->
          <circle :cx="apple.x - apple.r * 0.30" :cy="apple.y - apple.r * 0.30" :r="apple.r * 0.22" fill="white"
            opacity="0.55" pointer-events="none" />

          <!-- Tangkai coklat -->
          <line :x1="apple.x" :y1="apple.y - apple.r + 1" :x2="apple.x + 4" :y2="apple.y - apple.r - 8" stroke="#4E342E"
            stroke-width="2.8" stroke-linecap="round" />

          <!-- Daun kecil di tangkai -->
          <ellipse :cx="apple.x + apple.r * 0.22" :cy="apple.y - apple.r - 6" :rx="apple.r * 0.24" :ry="apple.r * 0.11"
            fill="#2E7D32" :transform="`rotate(-25 ${apple.x + apple.r * 0.22} ${apple.y - apple.r - 6})`" />

          <!-- Label teks akhiran rima dengan kontras tajam (stroke tipis gelap untuk keterbacaan) -->
          <text :x="apple.x" :y="apple.y + 1" text-anchor="middle" dominant-baseline="middle"
            font-family="Fredoka, sans-serif" font-weight="700" :font-size="apple.fontSize" fill="#FFFFFF"
            stroke="rgba(0,0,0,0.25)" stroke-width="0.75" paint-order="stroke fill" pointer-events="none">
            {{ apple.suffix }}
          </text>
        </g>
      </svg>
    </div>

    <!-- PETUNJUK -->
    <p class="mt-2 w-full px-3 text-center font-nunito text-xs italic text-bark/60">
      Klik apel di pohon untuk memilih akhiran rima
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedSuffixA: {
    type: String,
    default: '',
  },
  selectedSuffixB: {
    type: String,
    default: '',
  },
  activeSlot: {
    type: String,
    default: 'A', // 'A' atau 'B'
  },
  width: {
    type: Number,
    default: 360,
  },
})

const emit = defineEmits(['select'])

/**
 * Palet warna yang cerah dan konsisten untuk 10 rima pantun anak:
 * Catatan: rima -en diganti dengan -ah (sangat banyak kosakata pantun di KBBI & rhyme-words.json)
 * Semua 10 akhiran terdaftar lengkap di suffixColorMap tanpa warna coklat kusam.
 */
const suffixColor = {
  '-a': '#E53935',   // Merah cerah
  '-i': '#FB8C00',   // Oranye segar
  '-an': '#43A047',  // Hijau zamrud
  '-ar': '#8E24AA',  // Ungu cerah
  '-ang': '#1E88E5', // Biru royal
  '-ai': '#D81B60',  // Magenta / Pink
  '-at': '#F57C00',  // Oranye tua (kontras tinggi)
  '-ah': '#00ACC1',  // Teal cerah (pengganti -en yang tidak ada di kamus)
  '-in': '#00897B',  // Hijau toska
  '-it': '#C2185B',  // Ruby crimson cerah (bukan coklat)
}

/**
 * 10 Koordinat Apel Baru di dalam viewBox 360x390:
 * - Tajuk pohon membentang: X (85 s.d. 275), Y (75 s.d. 240).
 * - Jarak Euclidean antar-titik minimal > 52px (tidak ada lagi overlap/tumpukan).
 * - Radius seragam 24px (cukup besar untuk label "-ang", "-ah", "-in" dll).
 * - Tepi terluar X: 110 (kiri) dan 252 (kanan) sehingga ring berputar r+5 (29px) punya margin > 70px dari tepi SVG.
 */
const rawPositions = [
  // Baris Atas (3 apel)
  { suffix: '-a',   x: 142, y: 110, r: 24 },
  { suffix: '-i',   x: 218, y: 112, r: 24 },
  { suffix: '-ah',  x: 180, y: 88,  r: 24 }, // Puncak tajuk tengah

  // Baris Tengah (4 apel - tersebar luas dari kiri ke kanan)
  { suffix: '-ang', x: 108, y: 152, r: 24 }, // Kiri tengah (dalam daun)
  { suffix: '-ai',  x: 156, y: 154, r: 24 }, // Tengah-kiri
  { suffix: '-at',  x: 206, y: 156, r: 24 }, // Tengah-kanan
  { suffix: '-an',  x: 254, y: 152, r: 24 }, // Kanan tengah (dalam daun)

  // Baris Bawah (3 apel - tetap di dalam lingkaran tajuk bawah, tidak di batang luar)
  { suffix: '-it',  x: 124, y: 204, r: 24 }, // Kiri bawah
  { suffix: '-in',  x: 180, y: 202, r: 24 }, // Tengah bawah (di atas dahan dan di dalam tajuk)
  { suffix: '-ar',  x: 236, y: 204, r: 24 }, // Kanan bawah
]

const apples = computed(() => {
  return rawPositions.map((apple) => {
    const isRimaA = props.selectedSuffixA === apple.suffix
    const isRimaB = props.selectedSuffixB === apple.suffix
    const isSelected = isRimaA || isRimaB

    // Ukuran font disesuaikan: 4 karakter (misal -ang) pakai 10px, 2-3 karakter pakai 11.5px
    const textLen = apple.suffix.length
    const fontSize = textLen >= 4 ? 10 : textLen === 3 ? 11 : 12.5

    return {
      ...apple,
      color: suffixColor[apple.suffix] ?? '#E53935',
      fontSize,
      isRimaA,
      isRimaB,
      isSelected,
    }
  })
})
</script>

<style scoped>
@keyframes spinSlow {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  transform-origin: center;
  animation: spinSlow 12s linear infinite;
}
</style>
