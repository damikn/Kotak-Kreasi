<template>
  <GameShell
    route="/game/bongkar-susun"
    :title="game?.title ?? 'Bongkar Susun Pantun'"
    :icon="game?.icon ?? '🧱'"
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
        <!-- Larik acak -->
        <div class="rounded-2xl border-2 border-gray-100 bg-white/70 p-3 sm:p-4 mb-4">
          <p class="font-fredoka font-bold text-sm text-bark mb-2">Larik Acak</p>
          <div v-if="bank.length" class="flex flex-col gap-2">
            <button
              v-for="line in bank"
              :key="line"
              type="button"
              :draggable="canDrag"
              class="rounded-xl border-2 px-3 py-2 text-left font-nunito text-xs sm:text-sm font-semibold
                     transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-sky/40
                     touch-manipulation select-none"
              :class="selected === line
                ? 'bg-sky/15 border-sky text-sky ring-2 ring-sky/40'
                : 'bg-white border-gray-300 text-bark'"
              :aria-pressed="selected === line"
              @click="selected = selected === line ? null : line"
              @dragstart="handleDragStart(line, $event)"
              @dragend="dragOver = null"
            >
              {{ line }}
            </button>
          </div>
          <p v-else class="font-nunito text-xs text-jungle font-semibold">
            Semua baris sudah kamu susun. Klik "Periksa Jawaban" ya!
          </p>
        </div>

        <!-- Urutan yang benar -->
        <div class="rounded-2xl border-2 border-sky/20 bg-cream/60 p-3 sm:p-4">
          <p class="font-fredoka font-bold text-sm text-bark mb-2">Urutan yang Benar</p>
          <div class="space-y-2">
            <button
              v-for="(slot, index) in slots"
              :key="index"
              type="button"
              class="w-full flex items-start gap-2 rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-200"
              :class="slotClass(index)"
              @click="handleSlotClick(index)"
              @dragover.prevent="dragOver = index"
              @dragleave="dragOver === index ? dragOver = null : null"
              @drop.prevent="handleDrop(index)"
            >
              <span
                class="w-6 h-6 shrink-0 rounded-full bg-sky/15 text-sky font-fredoka font-bold text-xs
                       flex items-center justify-center"
              >
                {{ index + 1 }}
              </span>
              <span
                class="font-nunito text-xs sm:text-sm leading-snug"
                :class="slot ? 'font-semibold text-bark' : 'text-gray-300'"
              >
                {{ slot || (dragOver === index ? 'Lepaskan di sini' : 'Tarik baris ke sini') }}
              </span>
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

const game = computed(() => gameList.value.find((g) => g.id === 'bongkar-susun') ?? null)
const solution = computed(() => game.value?.answer ?? [])

// Shuffled in onMounted so the server and client render the same markup first.
const bank = ref([])
const slots = ref([])
const selected = ref(null)
const dragOver = ref(null)

// Drag is a mouse/trackpad affordance: on touch, `draggable` turns a long-press
// into a native drag or text selection instead of a tap.
const canDrag = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    canDrag.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  }
})

function shuffle(list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function buildBoard() {
  bank.value = shuffle(solution.value)
  slots.value = solution.value.map(() => null)
  selected.value = null
  dragOver.value = null
}

onMounted(buildBoard)

const allFilled = computed(() => slots.value.length > 0 && slots.value.every(Boolean))

function placeLine(index, line) {
  const next = [...slots.value]
  // Return any line already sitting in this slot to the bank.
  const previous = next[index]
  next[index] = line
  let nextBank = bank.value.filter((l) => l !== line)
  if (previous) nextBank = [...nextBank, previous]
  slots.value = next
  bank.value = nextBank
  selected.value = null
  audio.play('card-select')
}

function handleSlotClick(index) {
  if (slots.value[index]) {
    // Empty the slot: the line goes back to the bank.
    bank.value = [...bank.value, slots.value[index]]
    const next = [...slots.value]
    next[index] = null
    slots.value = next
    return
  }
  if (selected.value) placeLine(index, selected.value)
}

function handleDragStart(line, event) {
  selected.value = line
  event.dataTransfer?.setData('text/plain', line)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function handleDrop(index) {
  dragOver.value = null
  if (selected.value) placeLine(index, selected.value)
}

function handleCheck() {
  const verdicts = {}
  slots.value.forEach((line, index) => { verdicts[`slot-${index}`] = line === solution.value[index] })
  evaluate(verdicts)
  audio.play(isAllCorrect.value ? 'fanfare' : 'toast-warn')
}

function handleRetry() {
  retry()
  buildBoard()
  audio.play('back')
}

function slotClass(index) {
  if (checked.value) {
    const verdict = verdictFor(`slot-${index}`)
    if (verdict === true) return 'bg-jungle/10 border-jungle'
    if (verdict === false) return 'bg-coral/10 border-coral'
  }
  if (dragOver.value === index) return 'bg-sky/10 border-sky border-dashed'
  if (slots.value[index]) return 'bg-white border-sky/40'
  return 'bg-white/60 border-gray-300 border-dashed'
}

const answerKey = computed(() => [
  {
    label: 'Urutan yang benar',
    answer: solution.value.map((line, index) => `${index + 1}. ${line}`).join('\n'),
  },
])
</script>
