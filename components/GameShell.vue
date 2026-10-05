<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 to-emerald-50">
    <AppHeader />
    <StageBadge :route="route" />

    <main class="flex-1 px-3 sm:px-4 py-4 sm:py-6 max-w-3xl mx-auto w-full">

      <!-- Judul latihan -->
      <div class="flex items-start gap-2 sm:gap-3 mb-4">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky/20 flex items-center justify-center text-base sm:text-lg shrink-0 mt-0.5">
          <span aria-hidden="true">{{ icon }}</span>
        </div>
        <div class="min-w-0">
          <h1 class="font-fredoka font-bold text-xl sm:text-2xl text-sky leading-tight">{{ title }}</h1>
          <p class="font-nunito text-xs sm:text-sm text-gray-500 leading-relaxed">{{ instruction }}</p>
        </div>
      </div>

      <!-- Area permainan -->
      <slot name="board" />

      <!-- Aksi -->
      <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          @click="handleBack"
          class="flex items-center gap-2 text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors"
        >
          <span>←</span><span>{{ backLabel }}</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            v-if="!checked"
            @click="$emit('check')"
            class="font-fredoka font-bold text-base rounded-2xl px-6 py-3 transition-all duration-200"
            :class="canCheck
              ? 'bg-sky text-white hover:bg-sky/90 shadow-lg shadow-sky/30 hover:-translate-y-0.5'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
            :disabled="!canCheck"
          >
            Periksa Jawaban
          </button>

          <template v-else>
            <button
              @click="$emit('retry')"
              class="font-fredoka font-bold text-base rounded-2xl px-5 py-3 border-2
                     border-sky/40 text-sky bg-white hover:bg-sky/10 transition-all duration-200"
            >
              Ulangi
            </button>
            <button
              @click="handleNext"
              class="flex items-center gap-2 font-fredoka font-bold text-base rounded-2xl px-6 py-3
                     bg-jungle text-white hover:bg-jungle/90 shadow-lg shadow-jungle/30
                     hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>{{ nextLabel }}</span><span aria-hidden="true">→</span>
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
                : 'Masih ada yang belum tepat. Baca lagi petunjuknya, lalu klik Ulangi.' }}
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
                v-for="(entry, index) in answerKey"
                :key="index"
                class="rounded-xl bg-cream/70 border border-jungle/10 p-2.5"
              >
                <p class="font-nunito text-xs font-bold text-bark">{{ entry.label }}</p>
                <p class="font-nunito text-xs text-gray-600 leading-relaxed whitespace-pre-line">{{ entry.answer }}</p>
              </div>
              <p v-if="explanation" class="font-nunito text-xs text-gray-500 leading-relaxed pt-1">
                {{ explanation }}
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
import { useAudio }      from '~/composables/useAudio'
import { useStages }     from '~/composables/useStages'

const props = defineProps({
  // Route of this game page — used for the stage badge and for progress tracking.
  route: { type: String, required: true },
  title: { type: String, required: true },
  icon: { type: String, default: '🧩' },
  instruction: { type: String, default: '' },
  // The learner has filled everything needed for a check pass.
  canCheck: { type: Boolean, default: false },
  checked: { type: Boolean, default: false },
  correctCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  isAllCorrect: { type: Boolean, default: false },
  // [{ label, answer }] rendered inside "Kunci Jawaban dan Pembahasan"
  answerKey: { type: Array, default: () => [] },
  explanation: { type: String, default: '' },
  // Overrides isAllCorrect for progress tracking (multi-round games pass `false`
  // until every round is solved, while still showing the current round's feedback).
  complete: { type: Boolean, default: null },
})

defineEmits(['check', 'retry'])

const store = useKotakStore()
const audio = useAudio()
const { pageForRoute } = useStages()
const { goBack } = useBackNav()

const showKey = ref(false)

// Finishing a game marks the practice stage progress — practice never gates the wizard.
const isFinished = computed(() => props.complete ?? props.isAllCorrect)

watch(isFinished, (done) => {
  if (done) store.markGameDone(props.route)
})

const found = computed(() => pageForRoute(props.route))
const stage = computed(() => found.value?.stage ?? null)
const stageHub = computed(() => (stage.value ? `/tahap/${stage.value.id}` : '/menu'))

// After a check pass the learner goes back to the practice menu instead of
// chaining straight into the next game.
const nextLabel = computed(() => 'Kembali ke Menu')
const backLabel = computed(() => (stage.value ? `Kembali ke ${stage.value.label}` : 'Kembali ke Menu'))

function handleNext() {
  audio.play('next')
  navigateTo(stageHub.value)
}

function handleBack() {
  audio.play('back')
  goBack(stageHub.value)
}
</script>

<style scoped>
.slide-up-enter-active { transition: all 0.3s ease; }
.slide-up-enter-from   { opacity: 0; transform: translateY(14px); }
</style>
