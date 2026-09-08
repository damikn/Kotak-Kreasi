<template>
  <div class="flex w-full flex-col items-center gap-3 px-2 sm:px-4">

    <!-- Wheel wrapper responsive -->
    <div class="relative w-full max-w-[360px] aspect-square" :style="{ width: `min(92vw, ${props.size}px)` }">

      <!-- RODA -->
      <svg class="block h-full w-full" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true"
        :style="{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? `transform ${duration}s cubic-bezier(0.17,0.67,0.12,0.99)`
            : 'none',
          transformOrigin: 'center center',
        }">

        <defs>
          <filter id="btnShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#00000040" />
          </filter>
        </defs>

        <!-- Segmen -->
        <g v-for="(seg, i) in segments" :key="i">
          <path :d="getSegmentPath(i)" :fill="seg.color" stroke="white" stroke-width="2" />

          <text :x="getLabelPos(i).x" :y="getLabelPos(i).y" text-anchor="middle" dominant-baseline="middle" :transform="`
              rotate(
                ${getLabelRotation(i)},
                ${getLabelPos(i).x},
                ${getLabelPos(i).y}
              )
            `" fill="white" font-family="Fredoka, sans-serif" font-weight="700" :font-size="300 < 260 ? 10 : 12">
            {{ seg.label }}
          </text>
        </g>

        <!-- Lingkaran tengah -->
        <circle :cx="CENTER" :cy="CENTER" :r="CENTER_R" fill="#F39C12" stroke="white" stroke-width="3"
          filter="url(#btnShadow)" />
      </svg>

      <!-- TOMBOL SPIN -->
      <button @click="spin" :disabled="isSpinning" class="
          absolute
          left-1/2
          top-1/2
          flex
          -translate-x-1/2
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          font-fredoka
          font-bold
          text-white
          shadow-lg
          transition-all
          duration-150
          hover:scale-105
          active:scale-95
          disabled:cursor-not-allowed
          disabled:opacity-70
          focus:outline-none
          focus:ring-2
          focus:ring-sunshine/60
        " :style="{
          width: `${CENTER_R * 2}px`,
          height: `${CENTER_R * 2}px`,
          fontSize: '17px',
          background:
            'linear-gradient(135deg, #F39C12, #E67E22)',
        }" :aria-label="isSpinning
            ? 'Sedang memutar...'
            : 'Putar roda'
          ">
        {{ isSpinning ? '…' : 'SPIN' }}
      </button>

      <!-- JARUM -->
      <svg class="
          pointer-events-none
          absolute
          left-1/2
          top-[-2px]
          -translate-x-1/2
        " width="24" height="32" viewBox="0 0 24 32" aria-hidden="true" :class="needleShake ? 'animate-shake' : ''">
        <polygon points="12,2 3,30 21,30" fill="#E74C3C" stroke="white" stroke-width="2" stroke-linejoin="round" />

        <circle cx="12" cy="30" r="4" fill="#E74C3C" stroke="white" stroke-width="1.5" />
      </svg>
    </div>

    <!-- STATUS -->
    <p class="
        min-h-5
        w-full
        max-w-[360px]
        px-2
        text-center
        font-nunito
        text-sm
        italic
        text-gray-500
      ">
      <span v-if="isSpinning">
        ⏳ Menentukan polamu…
      </span>

      <span v-else-if="result">
        🎉 Kamu mendapat
        <strong class="text-sunshine">
          {{ result.label }}
        </strong>!
      </span>

      <span v-else>
        Tekan SPIN untuk menentukan pola pantunmu!
      </span>
    </p>
  </div>
</template>


<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  polaList: {
    type: Array,
    required: true,
  },

  // ukuran maksimum roda
  size: {
    type: Number,
    default: 360,
  },
})

const emit = defineEmits(['selected'])


// ============================================================
// KONSTANTA DESAIN
// ============================================================

const CENTER = 150
const OUTER_R = 146
const CENTER_R = 52.5

const duration = 3.6

const segmentColors = [
  '#27AE60',
  '#2980B9',
  '#F39C12',
  '#E74C3C',
  '#9B59B6',
  '#1ABC9C',
  '#E67E22',
  '#E91E63',
]


// ============================================================
// DATA SEGMENT
// ============================================================

const segments = computed(() =>
  props.polaList.map((pola, i) => ({
    color: segmentColors[i % segmentColors.length],

    label:
      pola.label ??
      `Pola ${pola.id ?? i + 1}`,

    pola,
  }))
)

const segCount = computed(() =>
  segments.value.length
)


// ============================================================
// STATE
// ============================================================

const rotation = ref(0)
const isSpinning = ref(false)
const result = ref(null)
const needleShake = ref(false)


// ============================================================
// PATH SEGMENT
// ============================================================

function getSegmentPath(idx) {

  const seg =
    (2 * Math.PI) /
    segCount.value

  // JAM 12 = -90°
  const start =
    idx * seg -
    Math.PI / 2

  const end =
    start + seg

  const r = OUTER_R
  const ir = CENTER_R + 2

  const x1 =
    CENTER +
    ir * Math.cos(start)

  const y1 =
    CENTER +
    ir * Math.sin(start)

  const x2 =
    CENTER +
    r * Math.cos(start)

  const y2 =
    CENTER +
    r * Math.sin(start)

  const x3 =
    CENTER +
    r * Math.cos(end)

  const y3 =
    CENTER +
    r * Math.sin(end)

  const x4 =
    CENTER +
    ir * Math.cos(end)

  const y4 =
    CENTER +
    ir * Math.sin(end)

  return [
    `M ${x1} ${y1}`,
    `L ${x2} ${y2}`,
    `A ${r} ${r} 0 0 1 ${x3} ${y3}`,
    `L ${x4} ${y4}`,
    `A ${ir} ${ir} 0 0 0 ${x1} ${y1}`,
    'Z',
  ].join(' ')
}


// ============================================================
// POSISI LABEL
// ============================================================

function getLabelPos(idx) {

  const seg =
    (2 * Math.PI) /
    segCount.value

  const mid =
    idx * seg -
    Math.PI / 2 +
    seg / 2

  const lr =
    (OUTER_R + CENTER_R + 2) / 2

  return {
    x:
      CENTER +
      lr * Math.cos(mid),

    y:
      CENTER +
      lr * Math.sin(mid),
  }
}


// ============================================================
// ROTASI LABEL
// ============================================================

function getLabelRotation(idx) {

  const segDeg =
    360 / segCount.value

  return (
    idx * segDeg +
    segDeg / 2
  )
}


// ============================================================
// NORMALISASI SUDUT
// ============================================================

function normalizeAngle(angle) {

  return (
    ((angle % 360) + 360) %
    360
  )
}


// ============================================================
// MENENTUKAN POLA BERDASARKAN POSISI JARUM
// ============================================================

function getSelectedIndex(currentRotation) {

  const n = segCount.value

  const segDeg = 360 / n

  /*
   * Jarum berada di -90°.
   *
   * Karena roda berputar sebesar rotation,
   * kita hitung kembali sudut jarum
   * terhadap koordinat roda.
   */

  const needleAngle =
    normalizeAngle(
      -90 - currentRotation
    )

  /*
   * Segmen pertama dimulai dari -90°.
   * Geser sehingga -90° menjadi 0°.
   */

  const relativeAngle =
    normalizeAngle(
      needleAngle + 90
    )

  let index =
    Math.floor(
      relativeAngle / segDeg
    )

  // Pengaman
  if (index < 0)
    index = 0

  if (index >= n)
    index = n - 1

  return index
}


// ============================================================
// SPIN
// ============================================================

function spin() {

  if (
    isSpinning.value ||
    !props.polaList.length
  ) {
    return
  }

  isSpinning.value = true
  result.value = null

  const n =
    segCount.value

  const segDeg =
    360 / n

  /*
   * Pilih target secara random
   */
  const targetIdx =
    Math.floor(
      Math.random() * n
    )

  /*
   * Jangan berhenti tepat di garis putih.
   *
   * Kita beri offset random sekitar
   * titik tengah segmen.
   *
   * ±25% lebar segmen.
   *
   * Jadi posisi akhir tetap aman
   * berada di dalam segmen.
   */
  const offset =
    (Math.random() - 0.5) *
    segDeg *
    0.5

  /*
   * Sudut tengah target:
   *
   * segmen 0:
   * -90° + 22.5°
   *
   * segmen 1:
   * -90° + 67.5°
   *
   * dst.
   */
  const targetLocalAngle =
    -90 +
    (targetIdx + 0.5) *
    segDeg +
    offset

  /*
   * Kita ingin targetLocalAngle
   * berada tepat di posisi jarum -90°.
   *
   * Jadi:
   *
   * rotation tambahan =
   * -90 - targetLocalAngle
   */
  const correction =
    -90 -
    targetLocalAngle

  /*
   * 5–10 putaran penuh
   */
  const extraSpins =
    Math.floor(
      Math.random() * 6
    ) + 5

  const finalRotation =
    rotation.value +
    extraSpins * 360 +
    correction

  rotation.value =
    finalRotation


  // ==========================================================
  // SETELAH ANIMASI
  // ==========================================================

  setTimeout(() => {

    isSpinning.value = false

    /*
     * PENTING:
     *
     * Jangan menggunakan targetIdx
     * secara langsung sebagai hasil.
     *
     * Kita hitung ulang berdasarkan
     * posisi roda yang benar-benar berhenti.
     */
    const actualIndex =
      getSelectedIndex(
        rotation.value
      )

    const selected =
      segments.value[actualIndex]

    result.value =
      selected

    emit(
      'selected',
      selected.pola
    )

    needleShake.value = true

    setTimeout(() => {
      needleShake.value = false
    }, 500)

  }, duration * 1000 + 150)
}
</script>