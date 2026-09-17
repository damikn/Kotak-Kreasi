<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-green-50 via-emerald-50/50 to-teal-50">
    <AppHeader />
    <StepBreadcrumb :current-step="3" />

    <main class="flex-1 px-3 sm:px-6 py-4 max-w-5xl mx-auto w-full">

      <!-- Judul -->
      <div class="flex items-start gap-3 mb-4">
        <div class="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xl shrink-0 shadow-sm">
          🌳
        </div>
        <div>
          <h1 class="font-fredoka font-bold text-xl sm:text-2xl text-jungle leading-tight">
            Pilih 2 Rima Pantun (A-B-A-B)!
          </h1>
          <p class="font-nunito text-xs sm:text-sm text-gray-600 mt-0.5">
            Pantun menggunakan sajak <strong>A-B-A-B</strong>. Pilih 2 rima berbeda:
            <span class="text-coral font-bold">Rima A</span> (baris 1 & 3) dan
            <span class="text-sky font-bold">Rima B</span> (baris 2 & 4).
          </p>
        </div>
      </div>

      <!-- Selector Slot Rima A / Rima B -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
        <!-- Tab Slot A -->
        <button @click="activeSlot = 'A'"
          class="rounded-2xl border-2 p-3 sm:p-4 text-left transition-all duration-200 relative focus:outline-none"
          :class="[
            activeSlot === 'A'
              ? 'bg-coral/10 border-coral shadow-md scale-[1.01] ring-2 ring-coral/20'
              : 'bg-white/80 border-gray-200 hover:border-coral/50 opacity-80'
          ]">
          <div class="flex items-center justify-between mb-1">
            <span class="font-fredoka font-bold text-sm sm:text-base text-coral flex items-center gap-1.5">
              <span>🔴 Slot Rima A</span>
              <span class="text-xs font-nunito font-normal text-gray-500 hidden sm:inline">(Baris 1 & 3)</span>
            </span>
            <span v-if="isSlotComplete('A')"
              class="w-5 h-5 rounded-full bg-jungle text-white text-xs flex items-center justify-center font-bold">✓</span>
          </div>

          <div class="mt-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span v-if="rimaA.suffix"
                class="px-2.5 py-0.5 rounded-full font-fredoka font-bold text-white text-xs bg-coral shadow-sm">
                Akhiran {{ rimaA.suffix }}
              </span>
              <span v-else class="text-xs font-nunito italic text-gray-400">Belum dipilih</span>
            </div>
            <p class="font-nunito text-xs text-gray-600 mt-1 truncate">
              Kata: <span class="font-medium text-bark">{{ rimaA.words.length ? rimaA.words.join(', ') : 'minimal 2 kata' }}</span>
            </p>
          </div>
        </button>

        <!-- Tab Slot B -->
        <button @click="activeSlot = 'B'"
          class="rounded-2xl border-2 p-3 sm:p-4 text-left transition-all duration-200 relative focus:outline-none"
          :class="[
            activeSlot === 'B'
              ? 'bg-sky/10 border-sky shadow-md scale-[1.01] ring-2 ring-sky/20'
              : 'bg-white/80 border-gray-200 hover:border-sky/50 opacity-80'
          ]">
          <div class="flex items-center justify-between mb-1">
            <span class="font-fredoka font-bold text-sm sm:text-base text-sky flex items-center gap-1.5">
              <span>🔵 Slot Rima B</span>
              <span class="text-xs font-nunito font-normal text-gray-500 hidden sm:inline">(Baris 2 & 4)</span>
            </span>
            <span v-if="isSlotComplete('B')"
              class="w-5 h-5 rounded-full bg-jungle text-white text-xs flex items-center justify-center font-bold">✓</span>
          </div>

          <div class="mt-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span v-if="rimaB.suffix"
                class="px-2.5 py-0.5 rounded-full font-fredoka font-bold text-white text-xs bg-sky shadow-sm">
                Akhiran {{ rimaB.suffix }}
              </span>
              <span v-else class="text-xs font-nunito italic text-gray-400">Belum dipilih</span>
            </div>
            <p class="font-nunito text-xs text-gray-600 mt-1 truncate">
              Kata: <span class="font-medium text-bark">{{ rimaB.words.length ? rimaB.words.join(', ') : 'minimal 2 kata' }}</span>
            </p>
          </div>
        </button>
      </div>

      <!-- Layout 2 Kolom: Pohon (kiri) | Panel Kata (kanan) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        <!-- Kolom Kiri: Pohon Apel -->
        <div class="lg:col-span-6 flex flex-col items-center bg-white/70 backdrop-blur-sm rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-sm">

          <!-- Indikator slot aktif -->
          <div class="mb-2 bg-white px-3.5 py-1 rounded-full border border-jungle/20 text-xs font-nunito font-semibold text-bark shadow-sm flex items-center gap-1.5">
            <span>Memilih untuk:</span>
            <strong :class="activeSlot === 'A' ? 'text-coral' : 'text-sky'">
              Rima {{ activeSlot }} (Baris {{ activeSlot === 'A' ? '1 & 3' : '2 & 4' }})
            </strong>
          </div>

          <RhymeTree
            :selected-suffix-a="rimaA.suffix"
            :selected-suffix-b="rimaB.suffix"
            :active-slot="activeSlot"
            :width="treeW"
            @select="handleSuffixSelect"
          />

          <p class="mt-2 text-center text-xs italic text-gray-500 font-nunito">
            💡 Klik salah satu apel di pohon untuk memilih akhiran rima
          </p>
        </div>

        <!-- Kolom Kanan: Panel Kata -->
        <div class="lg:col-span-6 space-y-3.5">

          <!-- Belum pilih suffix -->
          <div v-if="!activeSuffix"
            class="bg-white/70 border-2 border-dashed border-jungle/20 rounded-2xl p-8 text-center">
            <div class="text-4xl mb-2" aria-hidden="true">🍎</div>
            <p class="font-nunito text-sm text-gray-500">
              Klik salah satu <strong class="text-jungle">apel di pohon</strong> untuk memilih rima
              <strong :class="activeSlot === 'A' ? 'text-coral' : 'text-sky'">Rima {{ activeSlot }}</strong>!
            </p>
          </div>

          <!-- Panel kata ketika suffix dipilih -->
          <Transition name="slide-up">
            <div v-if="activeSuffix" class="space-y-3.5">

              <!-- Header suffix aktif -->
              <div class="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5">
                  <span
                    class="inline-flex items-center px-4 py-1 rounded-full font-fredoka font-bold text-white text-sm shadow"
                    :style="`background:${currentColor}`">
                    {{ activeSuffix }}
                  </span>
                  <div>
                    <p class="text-xs text-gray-500">Daftar kata KBBI untuk:</p>
                    <h3 class="font-fredoka font-bold text-sm" :class="activeSlot === 'A' ? 'text-coral' : 'text-sky'">
                      Rima {{ activeSlot }} (Akhiran {{ activeSuffix }})
                    </h3>
                  </div>
                </div>
                <span class="text-xs bg-emerald-50 text-jungle font-bold px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                  Resmi KBBI
                </span>
              </div>

              <!-- Loading -->
              <div v-if="pendingRhymes" class="flex justify-center py-6">
                <div class="w-7 h-7 border-4 border-jungle/30 border-t-jungle rounded-full animate-spin" />
              </div>

              <!-- 3 Kolom Kategori Kata -->
              <div v-else-if="currentWords" class="grid grid-cols-3 gap-2">
                <div v-for="cat in wordCategories" :key="cat.key"
                  class="bg-white rounded-xl p-2.5 shadow-sm"
                  :class="cat.borderColor">
                  <h3 class="font-fredoka font-bold text-xs uppercase tracking-wide mb-2 pb-1 border-b flex items-center gap-1"
                    :class="[cat.color, cat.borderBottom]">
                    <span>{{ cat.icon }}</span> {{ cat.shortLabel }}
                  </h3>

                  <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    <label v-for="word in (currentWords[cat.key] ?? [])" :key="word"
                      class="flex items-center gap-1.5 cursor-pointer hover:text-jungle transition-colors">
                      <input
                        type="checkbox"
                        :value="word"
                        :checked="activeWords.includes(word)"
                        @change="toggleWord(word)"
                        class="rounded w-3.5 h-3.5"
                        :class="activeSlot === 'A' ? 'text-coral focus:ring-coral' : 'text-sky focus:ring-sky'"
                        :disabled="activeWords.length >= maxWords && !activeWords.includes(word)"
                      />
                      <span class="font-nunito text-xs leading-tight"
                        :class="activeWords.includes(word) ? 'font-bold text-bark' : 'text-gray-600'">
                        {{ word }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Kata terpilih -->
              <div class="bg-white/90 border rounded-2xl p-3 shadow-sm"
                :class="activeSlot === 'A' ? 'border-coral/30' : 'border-sky/30'">
                <div class="flex items-center justify-between mb-2">
                  <p class="font-nunito font-bold text-xs text-bark">
                    Kata terpilih untuk
                    <span :class="activeSlot === 'A' ? 'text-coral' : 'text-sky'">Rima {{ activeSlot }}</span>
                    <span class="text-gray-400 font-normal">(minimal 2 kata):</span>
                  </p>
                  <span class="font-fredoka font-bold text-xs px-2.5 py-0.5 rounded-full"
                    :class="activeWords.length >= minWords ? 'bg-jungle/20 text-jungle' : 'bg-coral/10 text-coral'">
                    {{ activeWords.length }} / {{ minWords }} kata
                  </span>
                </div>

                <div class="flex flex-wrap gap-1.5 min-h-[32px]">
                  <span v-for="word in activeWords" :key="word"
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                    :class="activeSlot === 'A' ? 'bg-coral' : 'bg-sky'">
                    {{ word }}
                    <button @click="removeWord(word)"
                      class="hover:text-white/70 font-bold ml-1"
                      :aria-label="`Hapus ${word}`">✕</button>
                  </span>
                  <span v-if="!activeWords.length" class="font-nunito text-xs text-gray-400 italic">
                    Belum ada kata dipilih
                  </span>
                </div>
              </div>

            </div>
          </Transition>

          <!-- Ringkasan Status 2 Rima -->
          <div class="bg-white/90 border border-emerald-100 rounded-2xl p-3.5 shadow-sm">
            <h4 class="font-fredoka font-bold text-xs text-bark uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>📋</span> Ringkasan 2 Rima Terpilih:
            </h4>
            <div class="grid grid-cols-2 gap-2 text-xs font-nunito">
              <div class="p-2.5 rounded-xl bg-coral/5 border border-coral/20">
                <span class="font-bold text-coral block mb-0.5">🔴 Rima A (Baris 1 & 3):</span>
                <div>Akhiran: <strong>{{ rimaA.suffix || '—' }}</strong></div>
                <div class="truncate">Kata: <strong>{{ rimaA.words.length ? rimaA.words.join(', ') : '—' }}</strong></div>
              </div>
              <div class="p-2.5 rounded-xl bg-sky/5 border border-sky/20">
                <span class="font-bold text-sky block mb-0.5">🔵 Rima B (Baris 2 & 4):</span>
                <div>Akhiran: <strong>{{ rimaB.suffix || '—' }}</strong></div>
                <div class="truncate">Kata: <strong>{{ rimaB.words.length ? rimaB.words.join(', ') : '—' }}</strong></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Navigasi Bawah -->
      <div class="mt-6 pt-3 border-t border-emerald-100 flex items-center justify-between gap-3">
        <button @click="navigateTo('/pola')"
          class="text-sm font-semibold text-gray-500 hover:text-bark transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/60">
          <span>←</span>
          <span>Kembali ke Pola</span>
        </button>
        <button @click="handleNext"
          class="flex items-center gap-2 font-fredoka font-bold text-sm sm:text-base rounded-2xl px-6 sm:px-8 py-2.5 transition-all duration-200"
          :class="canProceed
            ? 'bg-jungle text-white hover:bg-jungle/90 shadow-lg shadow-jungle/30 hover:-translate-y-0.5'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
          :disabled="!canProceed">
          <span>Lanjut ke Susun Pantun</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>

    <!-- Toast Peringatan -->
    <Transition name="toast">
      <div v-if="toastMsg" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
               bg-bark text-white font-nunito text-sm px-5 py-3
               rounded-2xl shadow-xl flex items-center gap-2" role="alert">
        <span>⚠️</span><span>{{ toastMsg }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
import { useAudio } from '~/composables/useAudio'

definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })

const store = useKotakStore()
const audio = useAudio()

const minWords = 2
const maxWords = 6

onMounted(() => {
  if (!store.studentName) navigateTo('/')
  if (!store.phenomena) navigateTo('/fenomena')
  if (!store.pola) navigateTo('/pola')
})

const { data: rhymeData, pending: pendingRhymes } = await useAsyncData(
  'rhyme-words', () => queryContent('/rhyme-words').findOne()
)

const suffixColorMap = {
  '-a': '#E53935', '-i': '#FB8C00', '-an': '#43A047',
  '-ar': '#8E24AA', '-ang': '#1E88E5', '-ai': '#D81B60',
  '-at': '#F9A825', '-en': '#00897B', '-in': '#F44336', '-it': '#795548',
}

const wordCategories = [
  { key: 'kata_benda', label: 'Kata Benda', shortLabel: 'Benda', icon: '📦', color: 'text-sky', borderColor: 'border border-sky/20', borderBottom: 'border-sky/10' },
  { key: 'kata_kerja', label: 'Kata Kerja', shortLabel: 'Kerja', icon: '⚡', color: 'text-jungle', borderColor: 'border border-jungle/20', borderBottom: 'border-jungle/10' },
  { key: 'kata_sifat', label: 'Kata Sifat', shortLabel: 'Sifat', icon: '✨', color: 'text-sunshine', borderColor: 'border border-sunshine/30', borderBottom: 'border-sunshine/10' },
]

// Slot aktif yang sedang diedit: 'A' atau 'B'
const activeSlot = ref('A')

// Reactive State untuk 2 Rima
const rimaA = reactive({
  suffix: store.rima?.rimaA?.suffix || '',
  words: [...(store.rima?.rimaA?.words || [])],
})

const rimaB = reactive({
  suffix: store.rima?.rimaB?.suffix || '',
  words: [...(store.rima?.rimaB?.words || [])],
})

const activeSuffix = computed(() => activeSlot.value === 'A' ? rimaA.suffix : rimaB.suffix)
const currentColor = computed(() => suffixColorMap[activeSuffix.value] ?? '#27AE60')

const currentWords = computed(() => {
  if (!activeSuffix.value || !rhymeData.value) return null
  const raw = rhymeData.value
  if (raw[activeSuffix.value]) return raw[activeSuffix.value]
  for (const key of Object.keys(raw)) {
    if (raw[key]?.kata_benda) return raw[key]
  }
  return null
})

const activeWords = computed(() => activeSlot.value === 'A' ? rimaA.words : rimaB.words)

const toastMsg = ref('')
let toastTimer = null

function showToast(msg) {
  toastMsg.value = msg
  audio.play('toast-warn')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 3000)
}

function handleSuffixSelect(suffix) {
  if (activeSlot.value === 'A') {
    if (suffix === rimaB.suffix) {
      showToast('Rima A harus berbeda dengan Rima B agar sajak pantun A-B-A-B! 😊')
      return
    }
    rimaA.suffix = suffix
    rimaA.words = []
  } else {
    if (suffix === rimaA.suffix) {
      showToast('Rima B harus berbeda dengan Rima A agar sajak pantun A-B-A-B! 😊')
      return
    }
    rimaB.suffix = suffix
    rimaB.words = []
  }
  audio.play('apple-pluck')
}

function toggleWord(word) {
  const targetWords = activeSlot.value === 'A' ? rimaA.words : rimaB.words
  const idx = targetWords.indexOf(word)
  if (idx > -1) {
    targetWords.splice(idx, 1)
    audio.play('word-uncheck')
  } else {
    if (targetWords.length < maxWords) {
      targetWords.push(word)
      if (targetWords.length >= minWords) {
        audio.play('words-ready')
      } else {
        audio.play('word-check')
      }
    }
  }
}

function removeWord(word) {
  const targetWords = activeSlot.value === 'A' ? rimaA.words : rimaB.words
  const idx = targetWords.indexOf(word)
  if (idx > -1) {
    targetWords.splice(idx, 1)
    audio.play('word-uncheck')
  }
}

function isSlotComplete(slot) {
  if (slot === 'A') return rimaA.suffix && rimaA.words.length >= minWords
  return rimaB.suffix && rimaB.words.length >= minWords
}

const canProceed = computed(() => {
  return (
    rimaA.suffix &&
    rimaA.words.length >= minWords &&
    rimaB.suffix &&
    rimaB.words.length >= minWords &&
    rimaA.suffix !== rimaB.suffix
  )
})

function handleNext() {
  if (!canProceed.value) return
  audio.play('next')
  store.setRima(
    { suffix: rimaA.suffix, words: [...rimaA.words] },
    { suffix: rimaB.suffix, words: [...rimaB.words] }
  )
  navigateTo('/susun')
}

const treeW = ref(300)
onMounted(() => {
  const update = () => {
    const w = window.innerWidth
    treeW.value = w < 380 ? 260 : w < 640 ? 290 : 320
  }
  update()
  window.addEventListener('resize', update)
  onUnmounted(() => {
    window.removeEventListener('resize', update)
    clearTimeout(toastTimer)
  })
})
</script>

<style scoped>
.slide-up-enter-active {
  transition: all 0.25s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
