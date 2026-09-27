<template>
  <GameShell
    route="/game/melengkapi-pantun"
    :title="game?.title ?? 'Melengkapi Pantun'"
    :icon="game?.icon ?? '✏️'"
    :instruction="game?.instruction ?? ''"
    :can-check="allFilled"
    :checked="checked"
    :correct-count="correctCount"
    :total-count="totalCount"
    :is-all-correct="isAllCorrect"
    :answer-key="answerKey"
    :explanation="game?.explanation ?? ''"
    @check="handleCheck"
    @retry="handleRetry"
  >
    <template #board>
      <div v-if="!game" class="rounded-2xl bg-gray-100 h-24 animate-pulse" />

      <template v-else>
        <!-- Pantun dengan kotak kosong -->
        <div class="rounded-2xl border-2 border-sky/20 bg-cream/70 p-3 sm:p-4 mb-4">
          <p class="font-fredoka font-bold text-sm text-bark mb-3">Pantun</p>
          <div class="space-y-2.5">
            <div v-for="row in linesWithParts" :key="row.lineIndex" class="flex items-start gap-2">
              <span
                class="w-5 h-5 shrink-0 rounded-full bg-sky/15 text-sky font-fredoka font-bold text-[10px]
                       flex items-center justify-center mt-1"
              >
                {{ row.lineIndex + 1 }}
              </span>

              <p class="font-nunito text-sm sm:text-base text-bark leading-relaxed">
                <template v-for="(part, partIndex) in row.parts" :key="partIndex">
                  <span v-if="part.type === 'text'">{{ part.value }}</span>
                  <button
                    v-else
                    type="button"
                    class="inline-flex items-center justify-center align-middle min-w-[72px] mx-1 px-2 py-0.5
                           rounded-lg border-2 font-nunito text-sm font-semibold transition-all duration-200"
                    :class="blankClass(part.blankIndex)"
                    @click="handleBlankClick(part.blankIndex)"
                  >
                    {{ placements[part.blankIndex] || '....' }}
                  </button>
                </template>
              </p>
            </div>
          </div>
        </div>

        <!-- Pilihan kata -->
        <div class="rounded-2xl border-2 border-gray-100 bg-white/70 p-3 sm:p-4">
          <p class="font-fredoka font-bold text-sm text-bark mb-2">Pilihan Kata</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="word in bank"
              :key="word"
              type="button"
              class="rounded-full px-4 py-2 border-2 font-nunito text-sm font-semibold transition-all duration-200
                     hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-sky/40"
              :class="selected === word
                ? 'bg-sky/15 border-sky text-sky ring-2 ring-sky/40'
                : 'bg-white border-gray-300 text-bark'"
              :aria-pressed="selected === word"
              @click="handleWordClick(word)"
            >
              {{ word }}
            </button>
          </div>
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

const game = computed(() => gameList.value.find((g) => g.id === 'melengkapi-pantun') ?? null)
const blanks = computed(() => game.value?.blanks ?? [])

// ── Blank <-> bank state ──────────────────────────────────
const placements = ref({})
const bank = ref([])
const selected = ref(null)

function shuffle(list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function buildBoard() {
  placements.value = {}
  bank.value = shuffle(game.value?.bank ?? [])
  selected.value = null
}

onMounted(buildBoard)

// The blank order inside the "____" markers must match the blanks[] order.
const blankIndices = computed(() => blanks.value.map((_, index) => index))

const allFilled = computed(() => blankIndices.value.every((index) => !!placements.value[index]))

function handleWordClick(word) {
  selected.value = selected.value === word ? null : word
}

function handleBlankClick(blankIndex) {
  // Tapping a filled blank sends its word back to the bank.
  if (placements.value[blankIndex]) {
    const word = placements.value[blankIndex]
    const next = { ...placements.value }
    delete next[blankIndex]
    placements.value = next
    bank.value = [...bank.value, word]
    return
  }
  if (!selected.value) return
  const word = selected.value
  placements.value = { ...placements.value, [blankIndex]: word }
  bank.value = bank.value.filter((w) => w !== word)
  selected.value = null
  audio.play('card-select')
}

function handleCheck() {
  const verdicts = {}
  blankIndices.value.forEach((index) => {
    verdicts[index] = placements.value[index] === blanks.value[index].answer
  })
  evaluate(verdicts)
  audio.play(isAllCorrect.value ? 'fanfare' : 'toast-warn')
}

function handleRetry() {
  retry()
  buildBoard()
  audio.play('back')
}

function blankClass(blankIndex) {
  if (checked.value) {
    const verdict = verdictFor(blankIndex)
    if (verdict === true) return 'bg-jungle/10 border-jungle text-jungle'
    if (verdict === false) return 'bg-coral/10 border-coral text-coral'
  }
  if (placements.value[blankIndex]) return 'bg-white border-sky/50 text-bark'
  if (selected.value) return 'bg-sky/10 border-sky border-dashed text-gray-400'
  return 'bg-white/70 border-gray-300 border-dashed text-gray-300'
}

// Split every line into text parts and blank parts. Blank indices are assigned
// sequentially across the whole poem, not per line — otherwise two blanks in
// different lines would share index 0 and fight over the same placement.
const linesWithParts = computed(() => {
  let blankIndex = 0
  return (game.value?.lines ?? []).map((line, lineIndex) => {
    const parts = []
    const segments = String(line).split('____')
    segments.forEach((segment, index) => {
      if (segment) parts.push({ type: 'text', value: segment })
      if (index < segments.length - 1) parts.push({ type: 'blank', blankIndex: blankIndex++ })
    })
    return { lineIndex, parts }
  })
})

const answerKey = computed(() => [
  {
    label: 'Jawaban',
    answer: blanks.value.map((blank, index) => `${index + 1}. ${blank.answer}`).join('\n'),
  },
])
</script>
