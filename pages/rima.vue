<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-emerald-50">
    <AppHeader />
    <StepBreadcrumb :current-step="3" />

    <main class="flex-1 px-3 sm:px-4 py-4 sm:py-6 max-w-4xl mx-auto w-full">

      <!-- Judul -->
      <div class="flex items-center gap-2 mb-1">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-jungle/20 flex items-center justify-center text-lg shrink-0">🌳</div>
        <div>
          <h1 class="font-fredoka font-bold text-xl sm:text-3xl text-jungle leading-tight">Pilih Rima Pantun!</h1>
          <p class="font-nunito text-xs sm:text-sm text-gray-500">Pilih jenis rima yang sesuai. Minimal 3 kata.</p>
        </div>
      </div>
      <p class="font-nunito text-xs text-bark/50 italic mb-4 ml-1">
        "Pilih rimamu, perkaya pilihan kata, kuatkan maknanya."
      </p>

      <!-- Layout: pohon di atas (mobile) / kiri (desktop) -->
      <div class="flex flex-col lg:flex-row gap-4 items-start">

        <!-- Pohon apel -->
        <div class="w-full lg:w-auto flex justify-center shrink-0">
          <RhymeTree
            :selected-suffix="selectedSuffix"
            :width="treeW" :height="treeH"
            @select="handleSuffixSelect"
          />
        </div>

        <!-- Panel kanan: suffix terpilih + daftar kata -->
        <div class="flex-1 w-full min-w-0">

          <!-- Belum pilih suffix -->
          <div v-if="!selectedSuffix"
               class="bg-white/70 border-2 border-dashed border-jungle/20 rounded-2xl p-6 text-center">
            <div class="text-4xl mb-2" aria-hidden="true">🍎</div>
            <p class="font-nunito text-sm text-gray-400">
              Klik salah satu <strong class="text-jungle">apel</strong> di pohon untuk memilih jenis rima!
            </p>
          </div>

          <!-- Panel setelah suffix dipilih -->
          <Transition name="slide-up">
            <div v-if="selectedSuffix" class="space-y-3">

              <!-- Header suffix -->
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="inline-flex items-center px-4 py-1 rounded-full font-fredoka font-bold text-white text-sm shadow"
                  :style="`background:${currentColor}`"
                >{{ selectedSuffix }}</span>
                <span class="font-nunito text-sm text-gray-500">
                  Kata-kata untuk rima <strong>{{ selectedSuffix }}</strong>
                </span>
              </div>

              <!-- Loading -->
              <div v-if="pendingRhymes" class="flex justify-center py-6">
                <div class="w-7 h-7 border-4 border-jungle/30 border-t-jungle rounded-full animate-spin"/>
              </div>

              <!-- 3 kolom kategori kata — scroll horizontal jika sempit -->
              <div v-else-if="currentWords" class="grid grid-cols-3 gap-2">
                <div
                  v-for="cat in wordCategories" :key="cat.key"
                  class="bg-white rounded-xl border border-gray-100 p-2.5 shadow-sm"
                >
                  <h3 class="font-nunito font-bold text-xs uppercase tracking-wide mb-2 pb-1 border-b"
                      :class="cat.color">{{ cat.label }}</h3>
                  <!-- Tampilkan semua kata, scrollable jika banyak -->
                  <div class="space-y-1 max-h-36 overflow-y-auto pr-0.5">
                    <label
                      v-for="word in (currentWords[cat.key] ?? [])"
                      :key="word"
                      class="flex items-center gap-1.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        :value="word"
                        v-model="selectedWords"
                        class="sr-only"
                        :disabled="selectedWords.length >= maxWords && !selectedWords.includes(word)"
                      />
                      <!-- Custom checkbox -->
                      <span
                        class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                        :class="selectedWords.includes(word)
                          ? 'bg-jungle border-jungle'
                          : 'border-gray-300 group-hover:border-jungle/60'"
                        aria-hidden="true"
                      >
                        <svg v-if="selectedWords.includes(word)" class="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5L4 7.5 8.5 2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </span>
                      <span class="font-nunito text-xs leading-tight transition-colors"
                            :class="selectedWords.includes(word) ? 'text-jungle font-semibold' : 'text-gray-600 group-hover:text-bark'">
                        {{ word }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Kata terpilih -->
          <div class="mt-3 bg-cream border border-jungle/20 rounded-2xl p-3">
            <div class="flex items-center justify-between mb-2">
              <p class="font-nunito font-bold text-sm text-bark">
                Kata yang kamu pilih <span class="text-gray-400 font-normal">(minimal 3):</span>
              </p>
              <span
                class="font-fredoka font-bold text-sm px-2.5 py-0.5 rounded-full"
                :class="selectedWords.length >= minWords ? 'bg-jungle/20 text-jungle' : 'bg-coral/10 text-coral'"
              >{{ selectedWords.length }}/{{ minWords }}</span>
            </div>
            <div class="flex flex-wrap gap-1.5 min-h-7">
              <span
                v-for="word in selectedWords" :key="word"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-nunito font-semibold bg-jungle/10 text-jungle border border-jungle/30"
              >
                {{ word }}
                <button @click="removeWord(word)" class="hover:text-coral transition-colors font-bold text-sm leading-none ml-0.5" :aria-label="`Hapus ${word}`">✕</button>
              </span>
              <span v-if="!selectedWords.length" class="font-nunito text-xs text-gray-300 italic">Belum ada kata dipilih</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigasi -->
      <div class="mt-5 flex items-center justify-between gap-3">
        <button @click="navigateTo('/pola')" class="text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors flex items-center gap-1">
          <span>←</span><span>Kembali</span>
        </button>
        <button
          @click="handleNext"
          class="flex items-center gap-2 font-fredoka font-bold text-base sm:text-lg rounded-2xl px-6 sm:px-8 py-2.5 sm:py-3 transition-all duration-200"
          :class="canProceed ? 'bg-jungle text-white hover:bg-jungle/90 shadow-lg shadow-jungle/30 hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
          :disabled="!canProceed"
        >
          <span>Next</span><span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })

const store   = useKotakStore()
const minWords = 3
const maxWords = 8

onMounted(() => {
  if (!store.studentName) navigateTo('/')
  if (!store.phenomena)   navigateTo('/fenomena')
  if (!store.pola)        navigateTo('/pola')
})

const { data: rhymeData, pending: pendingRhymes } = await useAsyncData(
  'rhyme-words', () => queryContent('/rhyme-words').findOne()
)

const suffixColorMap = {
  '-a':   '#E53935', '-i':   '#FB8C00', '-an':  '#43A047',
  '-ar':  '#8E24AA', '-ang': '#1E88E5', '-ai':  '#D81B60',
  '-at':  '#F9A825', '-en':  '#00897B', '-in':  '#F44336', '-it': '#795548',
}

const wordCategories = [
  { key: 'kata_benda', label: 'Kata Benda',  color: 'text-sky' },
  { key: 'kata_kerja', label: 'Kata Kerja',  color: 'text-jungle' },
  { key: 'kata_sifat', label: 'Kata Sifat',  color: 'text-sunshine' },
]

const selectedSuffix = ref(store.rima.suffix || '')
const selectedWords  = ref([...store.rima.words])
const currentColor   = computed(() => suffixColorMap[selectedSuffix.value] ?? '#27AE60')

const currentWords = computed(() => {
  if (!selectedSuffix.value || !rhymeData.value) return null
  const raw = rhymeData.value
  if (raw[selectedSuffix.value]) return raw[selectedSuffix.value]
  for (const key of Object.keys(raw)) {
    if (raw[key]?.kata_benda) return raw[key]
  }
  return null
})

function handleSuffixSelect(suffix) {
  selectedSuffix.value = suffix
  selectedWords.value  = []
}
function removeWord(word) {
  selectedWords.value = selectedWords.value.filter(w => w !== word)
}

const canProceed = computed(() => selectedSuffix.value && selectedWords.value.length >= minWords)

function handleNext() {
  if (!canProceed.value) return
  store.setRima(selectedSuffix.value, [...selectedWords.value])
  navigateTo('/susun')
}

// Ukuran pohon responsif
const treeW = ref(300)
const treeH = ref(290)
onMounted(() => {
  const update = () => {
    const w = window.innerWidth
    treeW.value = w < 380 ? 260 : w < 640 ? 290 : 320
    treeH.value = w < 380 ? 260 : w < 640 ? 280 : 300
  }
  update()
  window.addEventListener('resize', update)
  onUnmounted(() => window.removeEventListener('resize', update))
})
</script>

<style scoped>
.slide-up-enter-active { transition: all 0.25s ease; }
.slide-up-enter-from   { opacity: 0; transform: translateY(10px); }
</style>
