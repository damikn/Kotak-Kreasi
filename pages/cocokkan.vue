<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 to-green-50">
    <AppHeader />
    <StageBadge route="/cocokkan" />
    <StepBreadcrumb :current-step="1" />

    <main class="flex-1 px-3 sm:px-4 py-4 sm:py-6 max-w-4xl mx-auto w-full">

      <!-- Judul -->
      <div class="flex items-start gap-2 sm:gap-3 mb-2">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky/20 flex items-center justify-center text-base sm:text-lg shrink-0 mt-0.5">
          🧩
        </div>
        <div class="min-w-0">
          <h1 class="font-fredoka font-bold text-xl sm:text-3xl text-sky leading-tight">
            Cocokkan Gambar dan Keterangannya!
          </h1>
          <p class="font-nunito text-xs sm:text-sm text-gray-500 leading-relaxed">
            Tarik gagasan, pesan, dan pantun dari bank jawaban ke gambar fenomena yang sesuai.
          </p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="space-y-3 mt-4">
        <div v-for="i in 2" :key="i" class="min-h-[130px] rounded-2xl bg-gray-100 animate-pulse" />
      </div>

      <!-- Error -->
      <div v-else-if="error || !groups.length" class="text-center py-10">
        <p class="text-coral font-nunito text-sm">Data latihan tidak ditemukan. Coba muat ulang halaman.</p>
      </div>

      <template v-else>
        <FenomenaMatch
          ref="boardRef"
          :groups="groups"
          :checked="checked"
          :results="results"
          @change="handleChange"
          @completed="handleCompleted"
        />

        <!-- Aksi -->
        <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            @click="handleBack"
            class="flex items-center gap-2 text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors"
          >
            <span>←</span><span>Kembali ke Kenali Fenomena 1</span>
          </button>

          <div class="flex items-center gap-2">
            <button
              v-if="!checked"
              @click="handlePeriksa"
              class="font-fredoka font-bold text-base rounded-2xl px-6 py-3 transition-all duration-200"
              :class="allFilled
                ? 'bg-sky text-white hover:bg-sky/90 shadow-lg shadow-sky/30 hover:-translate-y-0.5'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
              :disabled="!allFilled"
            >
              Periksa Jawaban
            </button>

            <template v-else>
              <button
                @click="handleUlangi"
                class="font-fredoka font-bold text-base rounded-2xl px-5 py-3 border-2
                       border-sky/40 text-sky bg-white hover:bg-sky/10 transition-all duration-200"
              >
                Ulangi
              </button>
              <button
                @click="handleNext"
                class="flex items-center gap-2 font-fredoka font-bold text-base rounded-2xl px-6 py-3
                       bg-jungle text-white hover:bg-jungle/90 shadow-lg shadow-jungle/30 hover:-translate-y-0.5
                       transition-all duration-200"
              >
                <span>Lanjutkan</span><span aria-hidden="true">→</span>
              </button>
            </template>
          </div>
        </div>

        <!-- Hasil pemeriksaan -->
        <Transition name="slide-up">
          <div v-if="checked" class="mt-4 space-y-3">
            <div
              class="rounded-2xl border-2 p-3 sm:p-4"
              :class="isAllCorrect ? 'bg-jungle/10 border-jungle/40' : 'bg-sunshine/10 border-sunshine/40'"
            >
              <p class="font-fredoka font-bold text-sm text-bark">
                Benar {{ correctCount }} dari {{ totalCount }} jawaban.
              </p>
              <p class="font-nunito text-xs text-gray-500 mt-1">
                {{ isAllCorrect
                  ? 'Hebat! Semua jawabanmu sudah tepat.'
                  : 'Masih ada yang belum tepat. Baca lagi keterangannya, lalu klik Ulangi.' }}
              </p>
            </div>

            <!-- Kunci jawaban & pembahasan -->
            <div class="rounded-2xl border-2 border-gray-100 bg-white/70 overflow-hidden">
              <button
                @click="showKey = !showKey"
                class="w-full flex items-center justify-between px-3 sm:px-4 py-3 text-left"
              >
                <span class="font-fredoka font-bold text-sm text-bark">Kunci Jawaban dan Pembahasan</span>
                <span class="text-gray-400 text-sm" aria-hidden="true">{{ showKey ? '▲' : '▼' }}</span>
              </button>
              <div v-if="showKey" class="px-3 sm:px-4 pb-4 space-y-2">
                <div
                  v-for="item in answerKey"
                  :key="item.label"
                  class="rounded-xl bg-cream/70 border border-jungle/10 p-2.5"
                >
                  <p class="font-nunito text-xs font-bold text-bark">{{ item.label }}</p>
                  <p class="font-nunito text-xs text-gray-600 leading-relaxed whitespace-pre-line">{{ item.answer }}</p>
                </div>
                <p class="font-nunito text-xs text-gray-500 leading-relaxed pt-1">
                  {{ explanation }}
                </p>
              </div>
            </div>
          </div>
        </Transition>
      </template>
    </main>
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
import { useAudio }      from '~/composables/useAudio'
import FenomenaMatch     from '~/components/FenomenaMatch.vue'

definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })

const store = useKotakStore()
const audio = useAudio()
const { requireAll } = usePageGuard()
const { goBack }     = useBackNav()

// Guard — a single redirect, and it replaces the entry instead of pushing a new one.
// This is step 1 of the wizard: nothing but the identity is required to start it.
onMounted(() => {
  requireAll([
    [store.hasIdentity, '/'],
  ])
})

// ── Data: which phenomena the exercise pairs up ───────────
const { data: configData, pending: configPending, error: configError } = await useAsyncData(
  'cocokkan-config',
  () => queryContent('/cocokkan').findOne(),
)

const { data: phenomenaData, pending: phenomenaPending, error: phenomenaError } = await useAsyncData(
  'phenomena',
  () => queryContent('/phenomena').findOne(),
)

const pending = computed(() => configPending.value || phenomenaPending.value)
const error = computed(() => configError.value || phenomenaError.value)

function bodyList(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  for (const key of Object.keys(raw)) { if (Array.isArray(raw[key])) return raw[key] }
  return []
}

const phenomenaList = computed(() => bodyList(phenomenaData.value))

const pairSlugs = computed(() => {
  const raw = configData.value
  const pair = raw?.body?.pair ?? raw?.pair ?? []
  return Array.isArray(pair) ? pair : []
})

const selectedPhenomena = computed(() =>
  pairSlugs.value
    .map((slug) => phenomenaList.value.find((p) => p.slug === slug))
    .filter(Boolean),
)

// ── Groups: an image anchor plus gagasan / pesan / pantun slots ──
const groups = computed(() =>
  selectedPhenomena.value.map((p) => ({
    id: p.slug,
    icon: p.icon,
    name: p.name,
    slots: [
      { id: 'gagasan', label: 'Gagasan', answer: p.gagasan ?? '' },
      { id: 'pesan',   label: 'Pesan',   answer: p.pesan ?? '' },
      { id: 'pantun',  label: 'Pantun',  answer: (p.pantun ?? []).join('\n') },
    ],
  })),
)

const allSlots = computed(() =>
  groups.value.flatMap((group) => group.slots.map((slot) => ({ key: `${group.id}:${slot.id}`, group, slot }))),
)

const totalCount = computed(() => allSlots.value.length)

const answerKey = computed(() =>
  selectedPhenomena.value.map((p, index) => ({
    label: `Gambar ${index + 1} — ${p.icon ?? ''} ${p.name ?? ''}`.trim(),
    answer: [
      `Gagasan: ${p.gagasan ?? ''}`,
      `Pesan: ${p.pesan ?? ''}`,
      `Pantun:\n${(p.pantun ?? []).join('\n')}`,
    ].join('\n'),
  })),
)

const explanation = 'Setiap gambar menunjukkan satu fenomena. Gagasan menjelaskan isi yang ingin dibahas, pesan berisi amanatnya, dan baris pantun menyampaikan gagasan serta pesan itu dengan rima yang teratur.'

// ── State interaksi ───────────────────────────────────────
const boardRef = ref(null)
const answers  = ref({})
const checked  = ref(false)
const showKey  = ref(false)

const allFilled = computed(() => allSlots.value.every(({ key }) => !!answers.value[key]))

const results = computed(() => {
  if (!checked.value) return null
  const out = {}
  for (const { key, slot } of allSlots.value) {
    out[key] = answers.value[key] === slot.answer
  }
  return out
})

const correctCount = computed(() => Object.values(results.value ?? {}).filter(Boolean).length)
const isAllCorrect = computed(() => totalCount.value > 0 && correctCount.value === totalCount.value)

function handleChange(key, value) {
  answers.value = { ...answers.value, [key]: value }
  checked.value = false
  showKey.value = false
}

function handleCompleted(list) {
  answers.value = { ...list }
  audio.play('card-select')
}

function handlePeriksa() {
  if (!allFilled.value) return
  checked.value = true
  showKey.value = false
  audio.play(isAllCorrect.value ? 'card-select' : 'toast-warn')
}

function handleUlangi() {
  boardRef.value?.reset?.()
  answers.value = {}
  checked.value = false
  showKey.value = false
}

function handleNext() {
  audio.play('next')
  store.setCocokkan(answers.value)
  navigateTo('/fenomena')
}

function handleBack() {
  audio.play('back')
  goBack('/tahap/kenali-fenomena')
}
</script>

<style scoped>
.slide-up-enter-active { transition: all 0.3s ease; }
.slide-up-enter-from   { opacity: 0; transform: translateY(14px); }
</style>
