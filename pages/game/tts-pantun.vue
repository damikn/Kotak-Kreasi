<template>
  <GameShell
    route="/game/tts-pantun"
    :title="game?.title ?? 'TTS Pantun'"
    :icon="game?.icon ?? '🔤'"
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
        <!-- Grid TTS -->
        <div class="rounded-2xl border-2 border-sky/20 bg-white/80 p-2 sm:p-3 overflow-x-auto">
          <div
            class="grid gap-1 mx-auto w-max"
            :style="{ gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))` }"
          >
            <template v-for="row in config.rows" :key="row">
              <div
                v-for="col in config.cols"
                :key="`${row}-${col}`"
                class="relative"
              >
                <template v-if="cellAt(row - 1, col - 1)">
                  <span
                    v-if="cellAt(row - 1, col - 1).numbers.length"
                    class="absolute -top-0.5 left-0.5 font-fredoka font-bold text-[9px] text-gray-500 select-none z-10"
                  >
                    {{ cellAt(row - 1, col - 1).numbers.join(',') }}
                  </span>
                  <input
                    :ref="(el) => registerCell(`${row - 1}-${col - 1}`, el)"
                    v-model="letters[`${row - 1}-${col - 1}`]"
                    type="text"
                    inputmode="text"
                    maxlength="1"
                    class="w-7 h-7 sm:w-9 sm:h-9 rounded-md border-2 text-center font-fredoka font-bold
                           uppercase text-sm text-bark focus:outline-none focus:ring-2 focus:ring-sky/40"
                    :class="cellClass(row - 1, col - 1)"
                    :aria-label="`Kotak baris ${row} kolom ${col}`"
                    @input="handleInput($event, `${row - 1}-${col - 1}`)"
                  />
                </template>
                <div v-else class="w-7 h-7 sm:w-9 sm:h-9" aria-hidden="true" />
              </div>
            </template>
          </div>
        </div>

        <!-- Petunjuk -->
        <div class="mt-4 rounded-2xl border-2 border-gray-100 bg-white/70 p-3 sm:p-4">
          <p class="font-fredoka font-bold text-sm text-bark mb-2">Petunjuk</p>
          <div class="grid gap-3 sm:grid-cols-2">
            <div v-for="group in clueGroups" :key="group.title">
              <p class="font-nunito text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {{ group.title }}
              </p>
              <ol class="space-y-1">
                <li
                  v-for="entry in group.entries"
                  :key="entry.id"
                  class="font-nunito text-xs text-gray-600 leading-relaxed"
                >
                  <span class="font-bold text-bark">{{ entry.number }}.</span> {{ entry.clue }}
                </li>
              </ol>
            </div>
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

const game = computed(() => gameList.value.find((g) => g.id === 'tts-pantun') ?? null)
const config = computed(() => game.value?.grid ?? { rows: 0, cols: 0, entries: [] })
const entries = computed(() => config.value.entries ?? [])

const clueGroups = computed(() => [
  { title: 'Mendatar', entries: entries.value.filter((e) => e.direction === 'mendatar') },
  { title: 'Menurun', entries: entries.value.filter((e) => e.direction === 'menurun') },
])

// ── Cell map: which cells exist, their solution letter and owning entries ──
const cells = computed(() => {
  const map = {}
  for (const entry of entries.value) {
    entry.answer.split('').forEach((letter, offset) => {
      const row = entry.direction === 'mendatar' ? entry.row : entry.row + offset
      const col = entry.direction === 'mendatar' ? entry.col + offset : entry.col
      const key = `${row}-${col}`
      if (!map[key]) map[key] = { row, col, letter, entries: [], numbers: [] }
      map[key].entries.push(entry.id)
      if (offset === 0) map[key].numbers.push(entry.number)
    })
  }
  return map
})

const letters = ref({})
const cellRefs = {}

function registerCell(key, el) {
  if (el) cellRefs[key] = el
}

function cellAt(row, col) {
  return cells.value[`${row}-${col}`] ?? null
}

const orderedKeys = computed(() => Object.keys(cells.value).sort((a, b) => {
  const [ar, ac] = a.split('-').map(Number)
  const [br, bc] = b.split('-').map(Number)
  return ar - br || ac - bc
}))

const allFilled = computed(() => orderedKeys.value.every((key) => (letters.value[key] ?? '').trim().length === 1))

// Auto-jump to the next empty cell so typing flows like a real crossword.
function handleInput(event, key) {
  const value = (event.target.value || '').replace(/[^a-zA-Z]/g, '').toUpperCase()
  letters.value = { ...letters.value, [key]: value }
  if (!value) return
  const next = orderedKeys.value.find((k) => k !== key && !(letters.value[k] ?? '').trim())
  if (next) cellRefs[next]?.focus()
}

function entryLetters(entry) {
  return entry.answer.split('').map((_, offset) => {
    const row = entry.direction === 'mendatar' ? entry.row : entry.row + offset
    const col = entry.direction === 'mendatar' ? entry.col + offset : entry.col
    return (letters.value[`${row}-${col}`] ?? '').toUpperCase()
  }).join('')
}

function handleCheck() {
  const verdicts = {}
  for (const entry of entries.value) verdicts[entry.id] = entryLetters(entry) === entry.answer.toUpperCase()
  evaluate(verdicts)
  audio.play(isAllCorrect.value ? 'fanfare' : 'toast-warn')
}

function handleRetry() {
  // Only the verdict colours reset here: retyping eight letters just because one
  // cell is wrong would be punishing, so the letters stay on the board.
  retry()
  audio.play('back')
}

function cellClass(row, col) {
  const cell = cellAt(row, col)
  if (!cell) return ''
  if (checked.value) {
    const verdicts = cell.entries.map((id) => verdictFor(id))
    if (verdicts.every(Boolean)) return 'bg-jungle/10 border-jungle text-jungle'
    if (verdicts.some((v) => v === false)) return 'bg-coral/10 border-coral text-coral'
  }
  return (letters.value[`${row}-${col}`] ?? '').trim()
    ? 'bg-white border-sky/50 text-bark'
    : 'bg-gray-50 border-gray-300 text-bark'
}

const answerKey = computed(() =>
  entries.value.map((entry) => ({
    label: `${entry.number}. ${entry.direction === 'mendatar' ? 'Mendatar' : 'Menurun'} — ${entry.clue}`,
    answer: entry.answer,
  })),
)
</script>
