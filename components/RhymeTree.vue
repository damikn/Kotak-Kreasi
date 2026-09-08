<template>
  <div class="w-full select-none flex flex-col items-center">

    <!-- ======================================================
         POHON APEL
         ====================================================== -->
    <div class="relative w-full flex justify-center" :style="{
      maxWidth: `${props.width}px`
    }">

      <svg class="block w-full h-auto overflow-visible" viewBox="0 0 320 360" preserveAspectRatio="xMidYMid meet"
        role="img" :aria-label="`Pohon rima dengan ${apples.length} pilihan akhiran`">

        <!-- ==================================================
             DEFINITIONS
             ================================================== -->
        <defs>

          <!-- Gradasi batang -->
          <linearGradient id="trunkGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#4E342E" />
            <stop offset="45%" stop-color="#795548" />
            <stop offset="70%" stop-color="#6D4C41" />
            <stop offset="100%" stop-color="#3E2723" />
          </linearGradient>

          <!-- Gradasi daun -->
          <radialGradient id="leafGradient" cx="35%" cy="25%" r="80%">
            <stop offset="0%" stop-color="#43C46B" />

            <stop offset="65%" stop-color="#27AE60" />

            <stop offset="100%" stop-color="#168447" />
          </radialGradient>

          <!-- Highlight daun -->
          <radialGradient id="leafHighlight" cx="35%" cy="25%" r="80%">
            <stop offset="0%" stop-color="#70E88D" stop-opacity="0.9" />

            <stop offset="100%" stop-color="#2ECC71" stop-opacity="0" />
          </radialGradient>

          <!-- Bayangan pohon -->
          <filter id="treeShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#145A32" flood-opacity="0.20" />
          </filter>

          <!-- Bayangan apel -->
          <filter id="appleShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.20" />
          </filter>
        </defs>


        <!-- ==================================================
             BAYANGAN TANAH
             ================================================== -->
        <ellipse cx="160" cy="334" rx="78" ry="11" fill="#2E7D32" opacity="0.14" />


        <!-- ==================================================
             BATANG POHON
             ================================================== -->

        <!-- Batang utama -->
        <path d="
            M 145 214
            C 145 242, 146 275, 145 326
            C 145 332, 150 335, 160 335
            C 170 335, 175 332, 175 326
            C 174 276, 175 242, 175 214
            Z
          " fill="url(#trunkGradient)" />

        <!-- Tekstur batang -->
        <path d="
            M 153 220
            C 153 250, 155 288, 154 326
          " fill="none" stroke="#A1887F" stroke-width="4" stroke-linecap="round" opacity="0.30" />

        <path d="
            M 166 223
            C 166 256, 165 290, 167 324
          " fill="none" stroke="#3E2723" stroke-width="3" stroke-linecap="round" opacity="0.35" />


        <!-- ==================================================
             CABANG POHON
             Harus berada DI BELAKANG tajuk dan apel
             ================================================== -->

        <!-- Cabang kiri -->
        <path d="
            M 159 245
            C 146 227, 129 208, 109 188
            C 102 181, 96 173, 91 164
          " fill="none" stroke="#5D4037" stroke-width="11" stroke-linecap="round" />

        <!-- Cabang kiri kecil -->
        <path d="
            M 123 213
            C 116 196, 112 181, 113 166
          " fill="none" stroke="#6D4C41" stroke-width="6" stroke-linecap="round" />

        <!-- Cabang kanan -->
        <path d="
            M 161 245
            C 174 226, 191 208, 211 188
            C 219 180, 225 171, 230 160
          " fill="none" stroke="#5D4037" stroke-width="11" stroke-linecap="round" />

        <!-- Cabang kanan kecil -->
        <path d="
            M 196 210
            C 203 195, 207 180, 206 165
          " fill="none" stroke="#6D4C41" stroke-width="6" stroke-linecap="round" />

        <!-- Cabang tengah -->
        <path d="
            M 160 232
            C 159 209, 159 187, 160 160
          " fill="none" stroke="#6D4C41" stroke-width="8" stroke-linecap="round" />


        <!-- ==================================================
             TAJUK POHON
             Dibuat dari banyak bentuk bulat supaya
             terlihat seperti pohon, bukan ellipse.
             ================================================== -->

        <!-- Shadow bagian bawah -->
        <path d="
            M 75 196
            C 63 184, 65 165, 76 153
            C 65 137, 72 119, 88 111
            C 86 91, 103 77, 121 78
            C 128 59, 148 52, 163 61
            C 178 48, 202 55, 208 74
            C 230 68, 245 84, 242 103
            C 260 111, 264 132, 252 146
            C 265 160, 260 182, 244 191
            C 237 211, 218 218, 201 210
            C 186 224, 166 221, 153 211
            C 137 222, 115 216, 108 200
            C 94 207, 79 203, 75 196
            Z
          " fill="#146B39" opacity="0.35" transform="translate(0 8)" />


        <!-- Gumpalan daun kiri bawah -->
        <circle cx="87" cy="167" r="39" fill="#218C4A" filter="url(#treeShadow)" />

        <!-- Gumpalan daun kiri atas -->
        <circle cx="101" cy="124" r="39" fill="url(#leafGradient)" filter="url(#treeShadow)" />

        <!-- Gumpalan daun tengah kiri -->
        <circle cx="132" cy="101" r="43" fill="url(#leafGradient)" filter="url(#treeShadow)" />

        <!-- Gumpalan daun atas -->
        <circle cx="163" cy="88" r="45" fill="url(#leafGradient)" filter="url(#treeShadow)" />

        <!-- Gumpalan daun kanan atas -->
        <circle cx="199" cy="103" r="43" fill="url(#leafGradient)" filter="url(#treeShadow)" />

        <!-- Gumpalan daun kanan -->
        <circle cx="226" cy="132" r="42" fill="url(#leafGradient)" filter="url(#treeShadow)" />

        <!-- Gumpalan daun kanan bawah -->
        <circle cx="231" cy="169" r="40" fill="#208B48" filter="url(#treeShadow)" />

        <!-- Gumpalan daun tengah -->
        <circle cx="161" cy="137" r="55" fill="url(#leafGradient)" />

        <!-- Gumpalan daun bawah -->
        <ellipse cx="160" cy="175" rx="81" ry="49" fill="#229D52" />

        <!-- Highlight tajuk -->
        <ellipse cx="132" cy="93" rx="50" ry="28" fill="url(#leafHighlight)" opacity="0.65" />


        <!-- ==================================================
             DAUN-DAUN KECIL DEKORATIF
             ================================================== -->

        <g fill="#75D98C" opacity="0.65">
          <ellipse cx="91" cy="125" rx="8" ry="4" transform="rotate(-30 91 125)" />

          <ellipse cx="115" cy="88" rx="9" ry="4" transform="rotate(-20 115 88)" />

          <ellipse cx="183" cy="67" rx="9" ry="4" transform="rotate(25 183 67)" />

          <ellipse cx="226" cy="111" rx="9" ry="4" transform="rotate(30 226 111)" />

          <ellipse cx="238" cy="157" rx="8" ry="4" transform="rotate(-25 238 157)" />

          <ellipse cx="102" cy="177" rx="8" ry="4" transform="rotate(25 102 177)" />
        </g>


        <!-- ==================================================
             APEL
             ================================================== -->
        <g v-for="apple in apples" :key="apple.suffix" class="cursor-pointer" role="button"
          :aria-label="`Pilih rima ${apple.suffix}`" :aria-pressed="selectedSuffix === apple.suffix" tabindex="0"
          @click="emit('select', apple.suffix)" @keydown.enter.prevent="
            emit('select', apple.suffix)
            " @keydown.space.prevent="
            emit('select', apple.suffix)
            " filter="url(#appleShadow)">

          <!-- Bayangan apel -->
          <ellipse :cx="apple.x" :cy="apple.y + apple.r * 0.72" :rx="apple.r * 0.72" :ry="apple.r * 0.20" fill="#000"
            opacity="0.13" />

          <!-- Badan apel -->
          <circle :cx="apple.x" :cy="apple.y" :r="apple.r" :fill="apple.color" :stroke="selectedSuffix === apple.suffix
              ? '#FFFFFF'
              : 'rgba(255,255,255,0.55)'
            " :stroke-width="selectedSuffix === apple.suffix
                ? 3
                : 1.5
              " class="transition-all duration-200" :style="selectedSuffix === apple.suffix
                ? 'filter:drop-shadow(0 0 6px rgba(255,255,255,0.9))'
                : ''
              " />

          <!-- Lekukan atas apel -->
          <path :d="`
              M ${apple.x - apple.r * 0.48}
                ${apple.y - apple.r * 0.58}

              Q ${apple.x}
                ${apple.y - apple.r * 0.82}
                ${apple.x + apple.r * 0.48}
                ${apple.y - apple.r * 0.58}
            `" fill="none" stroke="rgba(0,0,0,0.10)" stroke-width="1.5" />

          <!-- Highlight -->
          <circle :cx="apple.x - apple.r * 0.28" :cy="apple.y - apple.r * 0.28" :r="apple.r * 0.20" fill="white"
            opacity="0.50" pointer-events="none" />

          <!-- Tangkai -->
          <line :x1="apple.x" :y1="apple.y - apple.r + 1" :x2="apple.x + 4" :y2="apple.y - apple.r - 7" stroke="#4E342E"
            stroke-width="2.5" stroke-linecap="round" />

          <!-- Daun kecil di tangkai -->
          <ellipse :cx="apple.x + apple.r * 0.20" :cy="apple.y - apple.r - 5" :rx="apple.r * 0.22" :ry="apple.r * 0.10"
            fill="#2E7D32" transform="
              rotate(
                -25
                ${apple.x + apple.r * 0.20}
                ${apple.y - apple.r - 5}
              )
            " />

          <!-- Label -->
          <text :x="apple.x" :y="apple.y + 1" text-anchor="middle" dominant-baseline="middle"
            font-family="Fredoka, sans-serif" font-weight="700" :font-size="apple.fontSize" fill="white"
            pointer-events="none">
            {{ apple.suffix }}
          </text>

        </g>

      </svg>
    </div>


    <!-- ======================================================
         PETUNJUK
         ====================================================== -->
    <p class="
        mt-1
        w-full
        px-3
        text-center
        font-nunito
        text-xs
        italic
        text-bark/40
      ">
      Klik apel untuk memilih jenis rima
    </p>

  </div>
</template>


<script setup>
import { computed } from 'vue'


// ============================================================
// PROPS
// ============================================================

const props = defineProps({

  selectedSuffix: {
    type: String,
    default: '',
  },

  /*
   * width sekarang berarti:
   * ukuran MAKSIMUM pohon,
   * bukan ukuran wajib.
   *
   * Contoh:
   * width = 360
   *
   * HP 320px:
   * pohon otomatis menjadi sekitar 320px.
   *
   * Desktop:
   * maksimal 360px.
   */
  width: {
    type: Number,
    default: 360,
  },
})

const emit = defineEmits(['select'])


// ============================================================
// WARNA APEL
// ============================================================

const suffixColor = {

  '-a': '#E53935',

  '-i': '#FB8C00',

  '-an': '#43A047',

  '-ar': '#8E24AA',

  '-ang': '#1E88E5',

  '-ai': '#D81B60',

  '-at': '#F9A825',

  '-en': '#00897B',

  '-in': '#F44336',

  '-it': '#795548',
}


// ============================================================
// POSISI APEL
//
// Semua menggunakan koordinat VIEWBOX 320 × 360.
//
// Ini membuat posisi apel tetap konsisten,
// berapa pun ukuran layar.
// ============================================================

const rawPositions = [

  // -------------------------------
  // Ring luar
  // -------------------------------

  {
    suffix: '-ang',
    x: 101,
    y: 145,
    r: 22,
  },

  {
    suffix: '-a',
    x: 132,
    y: 103,
    r: 23,
  },

  {
    suffix: '-i',
    x: 185,
    y: 105,
    r: 23,
  },

  {
    suffix: '-an',
    x: 218,
    y: 143,
    r: 23,
  },

  {
    suffix: '-ar',
    x: 210,
    y: 180,
    r: 22,
  },

  {
    suffix: '-it',
    x: 110,
    y: 179,
    r: 22,
  },


  // -------------------------------
  // Ring dalam
  // -------------------------------

  {
    suffix: '-ai',
    x: 130,
    y: 153,
    r: 21,
  },

  {
    suffix: '-at',
    x: 190,
    y: 151,
    r: 21,
  },

  {
    suffix: '-en',
    x: 160,
    y: 128,
    r: 22,
  },

  {
    suffix: '-in',
    x: 160,
    y: 174,
    r: 22,
  },
]


// ============================================================
// APEL FINAL
// ============================================================

const apples = computed(() => {

  return rawPositions.map((apple) => ({

    ...apple,

    color:
      suffixColor[apple.suffix]
      ?? '#E53935',

    /*
     * Ukuran font mengikuti ukuran apel.
     */
    fontSize:
      apple.r <= 21
        ? 8.5
        : 9.5,
  }))
})
</script>