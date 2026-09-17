<template>
  <!--
    Kartu preview pantun.
    ID="pantun-preview" dipakai oleh html2canvas di susun.vue.
    Lebar fixed 400px agar hasil capture konsisten di semua perangkat.
  -->
  <div
    id="pantun-preview"
    class="bg-cream rounded-3xl border-4 border-jungle/20 shadow-xl overflow-hidden"
    style="width:400px; max-width:100%;"
  >
    <!-- Header -->
    <div class="bg-gradient-to-r from-jungle/15 to-sky/15 px-5 pt-4 pb-2.5 flex items-center gap-3">
      <span class="font-fredoka font-bold text-sm tracking-wide shrink-0">
        <span class="text-coral">K</span><span class="text-sunshine">O</span><span class="text-jungle">T</span><span class="text-sky">A</span><span class="text-coral">K</span>
        <span class="text-gray-300 mx-1">|</span>
        <span class="text-sky">K</span><span class="text-jungle">R</span><span class="text-sunshine">E</span><span class="text-coral">A</span><span class="text-sky">S</span><span class="text-jungle">I</span>
      </span>
      <span class="flex-1 h-px bg-jungle/20 block"></span>
      <span class="text-base shrink-0" aria-hidden="true">🍃</span>
    </div>

    <!-- Judul -->
    <div class="text-center px-5 pt-3 pb-1">
      <h2 class="font-fredoka font-bold text-lg text-bark">Pantun Karyamu</h2>
      <div class="flex items-center justify-center gap-2 mt-1" aria-hidden="true">
        <span class="h-px w-8 bg-jungle/25 block"></span>
        <span class="text-jungle text-sm">🌿</span>
        <span class="h-px w-8 bg-jungle/25 block"></span>
      </div>
    </div>

    <!-- Isi pantun 4 baris -->
    <div class="px-5 py-3">
      <div class="bg-white/70 rounded-2xl border border-jungle/10 px-4 py-4 shadow-inner">
        <template v-if="hasContent">
          <p
            v-for="(baris, idx) in lines" :key="idx"
            class="font-nunito text-sm sm:text-base leading-relaxed break-words"
            :class="idx < 2 ? 'text-sky italic' : 'text-jungle font-semibold'"
            style="word-break: break-word; overflow-wrap: anywhere;"
            v-html="highlightRima(baris, idx)"
          />
        </template>
        <template v-else>
          <div v-for="i in 4" :key="i" class="h-4 bg-gray-100 rounded animate-pulse mb-2 last:mb-0"
               :style="`width:${55 + i*10}%`"/>
        </template>
      </div>
    </div>

    <!-- Info siswa -->
    <div class="px-5 pb-3">
      <div class="flex items-center gap-2 mb-2" aria-hidden="true">
        <span class="flex-1 h-px bg-gray-200 block"></span>
        <span class="text-bark/25 text-xs">✦</span>
        <span class="flex-1 h-px bg-gray-200 block"></span>
      </div>
      <!-- Grid informasi, teks di-wrap penuh agar tidak terpotong -->
      <dl class="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs font-nunito">
        <div v-if="studentName">
          <dt class="text-gray-400 text-[11px]">Nama Siswa</dt>
          <dd class="font-semibold text-bark break-words">{{ studentName }}</dd>
        </div>
        <div v-if="phenomena">
          <dt class="text-gray-400 text-[11px]">Fenomena</dt>
          <dd class="font-semibold text-bark break-words leading-tight">{{ phenomena }}</dd>
        </div>
        <div v-if="pola" class="col-span-2 sm:col-span-1">
          <dt class="text-gray-400 text-[11px]">Pola</dt>
          <dd class="font-semibold text-bark break-words leading-tight">{{ pola }}</dd>
        </div>
        <div v-if="displayRima" class="col-span-2">
          <dt class="text-gray-400 text-[11px]">Rima A & B</dt>
          <dd class="font-semibold text-bark break-words leading-snug">{{ displayRima }}</dd>
        </div>
      </dl>
      <p class="text-xs text-gray-400 font-nunito text-right mt-2">📅 {{ today }}</p>
    </div>

    <!-- Kutipan motivasi -->
    <div class="mx-4 mb-4 bg-jungle/10 rounded-2xl px-4 py-2.5 border border-jungle/10">
      <p class="font-nunito text-xs italic text-jungle/80 text-center leading-relaxed">
        "{{ motivasi }}"
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  lines:       { type: Array,  default: () => ['', '', '', ''] },
  studentName: { type: String, default: '' },
  phenomena:   { type: String, default: '' },
  pola:        { type: String, default: '' },
  rimaWords:   { type: Array,  default: () => [] },
  suffix:      { type: String, default: '' },
  rimaA:       { type: Object, default: () => ({ suffix: '', words: [] }) },
  rimaB:       { type: Object, default: () => ({ suffix: '', words: [] }) },
})

const motivasiList = [
  'Setiap kata adalah langkah kecil menuju perubahan besar. Teruslah berkarya!',
  'Pantun bukan sekadar kata, ia adalah cermin kreativitasmu.',
  'Dari imajinasimu lahir karya yang menginspirasi.',
  'Satu pantun yang baik bisa mengubah cara pandang dunia.',
  'Kreasi terbaik lahir dari hati yang tulus dan pikiran yang terbuka.',
]
const motivasi = motivasiList[Math.floor(Math.random() * motivasiList.length)]

const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

const hasContent = computed(() => props.lines.some(b => b?.trim().length > 0))

const displayRima = computed(() => {
  if (props.rimaA?.suffix && props.rimaB?.suffix) {
    return `A (${props.rimaA.suffix}): ${props.rimaA.words.join(', ')} | B (${props.rimaB.suffix}): ${props.rimaB.words.join(', ')}`
  }
  if (props.rimaWords?.length) {
    return `${props.suffix}: ${props.rimaWords.join(', ')}`
  }
  return ''
})

const combinedWords = computed(() => [
  ...(props.rimaA?.words || []),
  ...(props.rimaB?.words || []),
  ...(props.rimaWords || []),
])

function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Highlight kata rima di baris pantun
function highlightRima(text, lineIndex) {
  const safe = escapeHtml(text ?? '')
  if (!combinedWords.value.length) return safe
  let result = safe
  for (const word of combinedWords.value) {
    if (!word) continue
    const esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(
      new RegExp(`(${esc})`, 'gi'),
      '<mark style="background:#27ae6030;color:#27AE60;font-weight:700;border-radius:3px;padding:0 2px">$1</mark>'
    )
  }
  return result
}
</script>
