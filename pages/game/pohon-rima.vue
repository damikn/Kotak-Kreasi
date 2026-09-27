<template>
  <GameShell
    route="/game/pohon-rima"
    :title="game?.title ?? 'Pohon Rima'"
    :icon="game?.icon ?? '🌳'"
    :instruction="game?.instruction ?? ''"
    :can-check="selected.length > 0"
    :checked="checked"
    :correct-count="correctCount"
    :total-count="totalCount"
    :is-all-correct="isAllCorrect"
    :complete="allRoundsDone"
    :answer-key="answerKey"
    :explanation="currentExplanation"
    @check="handleCheck"
    @retry="handleRetry"
  >
    <template #board>
      <div v-if="!game" class="rounded-2xl bg-gray-100 h-24 animate-pulse" />

      <template v-else>
        <!-- Kata acuan + indikator ronde -->
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div class="rounded-2xl border-2 border-sky/25 bg-white/80 px-4 py-2">
            <p class="font-nunito text-[11px] font-bold text-gray-400 uppercase tracking-wider">Kata Acuan</p>
            <p class="font-fredoka font-bold text-lg text-sky">{{ current?.reference }}</p>
          </div>
          <span class="font-nunito text-xs font-semibold text-gray-500 rounded-full border border-gray-200 px-3 py-1">
            Ronde {{ roundIndex + 1 }} dari {{ rounds.length }}
          </span>
        </div>

        <!-- Pohon -->
        <div class="rounded-3xl border-2 border-jungle/25 bg-gradient-to-b from-emerald-50 to-emerald-100/50 p-4 sm:p-5">
          <div class="flex flex-wrap justify-center gap-2 sm:gap-3 mb-3">
            <button
              v-for="word in current?.words ?? []"
              :key="word"
              type="button"
              class="rounded-full px-4 py-2 border-2 font-nunito text-sm font-semibold transition-all duration-200
                     hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-jungle/40"
              :class="leafClass(word)"
              :aria-pressed="selected.includes(word)"
              @click="toggleWord(word)"
            >
              <span class="mr-1" aria-hidden="true">🍃</span>{{ word }}
            </button>
          </div>

          <!-- Batang pohon -->
          <div class="flex flex-col items-center" aria-hidden="true">
            <div class="w-8 h-8 sm:h-10 bg-bark/70 rounded-b-md" />
            <div class="w-24 h-2 rounded-full bg-bark/30" />
          </div>
        </div>

        <p class="font-nunito text-xs text-gray-500 mt-3 text-center">
          Ketuk semua kata yang bunyi akhirnya sama dengan kata acuan. Ketuk lagi untuk membatalkan.
        </p>

        <!-- Lanjut ronde berikutnya -->
        <div v-if="checked && isAllCorrect && !isLastRound" class="mt-4 text-center">
          <button
            @click="handleNextRound"
            class="inline-flex items-center gap-2 font-fredoka font-bold text-base rounded-2xl px-6 py-3
                   bg-sunshine text-white hover:bg-sunshine/90 shadow-lg shadow-sunshine/30 transition-all duration-200"
          >
            <span>Ronde Berikutnya</span><span aria-hidden="true">→</span>
          </button>
        </div>
      </template>
    </template>
  </GameShell>
</template>

<script setup>
import { useGameState } from '~/composables/useGameState'
import { useAudio }     from '~/composables/useAudio'
import GameShell        from '~/components/GameShell.vue'

const audio = useAudio()
const { checked, evaluate, retry, correctCount, totalCount, isAllCorrect, verdictFor } = useGameState()

const { data: gamesData } = await useAsyncData('games', () => queryContent('/games').findOne())

const gameList = computed(() => {
  const raw = gamesData.value
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  for (const key of Object.keys(raw)) { if (Array.isArray(raw[key])) return raw[key] }
  return []
})

const game = computed(() => gameList.value.find((g) => g.id === 'pohon-rima') ?? null)
const rounds = computed(() => game.value?.rounds ?? [])

const roundIndex = ref(0)
const selected = ref([])
const solvedRounds = ref([])

const current = computed(() => rounds.value[roundIndex.value] ?? null)
const isLastRound = computed(() => roundIndex.value >= rounds.value.length - 1)
const allRoundsDone = computed(() => rounds.value.length > 0 && solvedRounds.value.length === rounds.value.length)
const currentExplanation = computed(() => current.value?.explanation ?? '')

function toggleWord(word) {
  selected.value = selected.value.includes(word)
    ? selected.value.filter((w) => w !== word)
    : [...selected.value, word]
}

function handleCheck() {
  const answers = current.value?.answers ?? []
  const verdicts = {}
  for (const word of current.value?.words ?? []) {
    verdicts[word] = selected.value.includes(word) === answers.includes(word)
  }
  evaluate(verdicts)

  if (isAllCorrect.value && !solvedRounds.value.includes(roundIndex.value)) {
    solvedRounds.value = [...solvedRounds.value, roundIndex.value]
  }
  audio.play(isAllCorrect.value ? 'fanfare' : 'toast-warn')
}

function handleNextRound() {
  roundIndex.value += 1
  selected.value = []
  retry()
  audio.play('next')
}

function handleRetry() {
  retry()
  selected.value = []
  audio.play('back')
}

function leafClass(word) {
  if (checked.value) {
    const verdict = verdictFor(word)
    if (verdict === true) return 'bg-jungle/15 border-jungle text-jungle'
    if (verdict === false) return 'bg-coral/10 border-coral text-coral'
  }
  return selected.value.includes(word)
    ? 'bg-jungle/20 border-jungle text-jungle ring-2 ring-jungle/40'
    : 'bg-white border-jungle/40 text-bark'
}

const answerKey = computed(() =>
  rounds.value.map((round, index) => ({
    label: `Ronde ${index + 1} — kata acuan "${round.reference}"`,
    answer: round.answers.join(', '),
  })),
)
</script>
