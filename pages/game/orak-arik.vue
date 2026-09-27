<template>
  <GameShell
    route="/game/orak-arik"
    :title="game?.title ?? 'Orak-Arik Sampiran dan Isi'"
    :icon="game?.icon ?? '🧺'"
    :instruction="game?.instruction ?? ''"
    :can-check="allPlaced"
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
        <!-- Larik pantun yang bisa diangkat -->
        <div class="rounded-2xl border-2 border-gray-100 bg-white/70 p-3 sm:p-4 mb-4">
          <p class="font-fredoka font-bold text-sm text-bark mb-2">Larik Pantun</p>
          <div v-if="pool.length" class="space-y-2">
            <button
              v-for="line in pool"
              :key="line"
              type="button"
              class="w-full rounded-xl border-2 px-3 py-2 text-left font-nunito text-xs sm:text-sm font-semibold
                     transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-sky/40"
              :class="selected === line
                ? 'bg-sky/15 border-sky text-sky ring-2 ring-sky/40'
                : 'bg-white border-gray-300 text-bark'"
              :aria-pressed="selected === line"
              @click="selected = selected === line ? null : line"
            >
              {{ line }}
            </button>
          </div>
          <p v-else class="font-nunito text-xs text-jungle font-semibold">
            Semua larik sudah masuk keranjang. Klik "Periksa Jawaban" ya!
          </p>
        </div>

        <!-- Dua keranjang -->
        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="basket in baskets"
            :key="basket.id"
            class="rounded-2xl border-2 p-3 sm:p-4 transition-all duration-200"
            :class="basketClass(basket.id)"
            @click="handleBasketClick(basket.id)"
            @dragover.prevent="dragOver = basket.id"
            @dragleave="dragOver === basket.id ? dragOver = null : null"
            @drop.prevent="handleDrop(basket.id)"
          >
            <p class="font-fredoka font-bold text-sm mb-2 flex items-center gap-1.5" :class="basket.textClass">
              <span aria-hidden="true">{{ basket.icon }}</span>{{ basket.label }}
            </p>
            <p class="font-nunito text-[11px] text-gray-400 mb-2">{{ basket.hint }}</p>

            <div v-if="placed[basket.id]?.length" class="space-y-1.5">
              <button
                v-for="line in placed[basket.id]"
                :key="line"
                type="button"
                class="w-full rounded-lg border px-2.5 py-2 text-left font-nunito text-xs leading-snug
                       transition-colors duration-200"
                :class="placedLineClass(basket.id, line)"
                @click.stop="removeLine(basket.id, line)"
              >
                {{ line }}
              </button>
            </div>
            <p v-else class="font-nunito text-xs text-gray-300">
              {{ dragOver === basket.id ? 'Lepaskan di sini' : 'Ketuk larik lalu ketuk keranjang ini' }}
            </p>
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

const game = computed(() => gameList.value.find((g) => g.id === 'orak-arik') ?? null)
const lines = computed(() => game.value?.lines ?? [])

const baskets = [
  { id: 'sampiran', label: 'Sampiran', icon: '🌿', hint: 'Dua baris pembuka pantun', textClass: 'text-sky' },
  { id: 'isi', label: 'Isi', icon: '💬', hint: 'Dua baris yang memuat pesan', textClass: 'text-jungle' },
]

const pool = ref([])
const placed = ref({ sampiran: [], isi: [] })
const selected = ref(null)
const dragOver = ref(null)

function shuffle(list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function buildBoard() {
  pool.value = shuffle(lines.value.map((l) => l.text))
  placed.value = { sampiran: [], isi: [] }
  selected.value = null
  dragOver.value = null
}

onMounted(buildBoard)

const allPlaced = computed(() => pool.value.length === 0 && lines.value.length > 0)

function placeLine(basketId, line) {
  if (!line) return
  pool.value = pool.value.filter((l) => l !== line)
  placed.value = {
    ...placed.value,
    sampiran: placed.value.sampiran.filter((l) => l !== line),
    isi: placed.value.isi.filter((l) => l !== line),
    [basketId]: [...placed.value[basketId], line],
  }
  selected.value = null
  audio.play('card-select')
}

function removeLine(basketId, line) {
  placed.value = { ...placed.value, [basketId]: placed.value[basketId].filter((l) => l !== line) }
  pool.value = [...pool.value, line]
}

function handleBasketClick(basketId) {
  if (selected.value) placeLine(basketId, selected.value)
}

function handleDrop(basketId) {
  dragOver.value = null
  placeLine(basketId, selected.value)
}

function handleCheck() {
  const verdicts = {}
  for (const line of lines.value) {
    const basket = placed.value.sampiran.includes(line.text)
      ? 'sampiran'
      : placed.value.isi.includes(line.text) ? 'isi' : null
    verdicts[line.text] = basket === line.category
  }
  evaluate(verdicts)
  audio.play(isAllCorrect.value ? 'fanfare' : 'toast-warn')
}

function handleRetry() {
  retry()
  buildBoard()
  audio.play('back')
}

function basketClass(basketId) {
  if (dragOver.value === basketId) return 'bg-sky/10 border-sky border-dashed'
  return basketId === 'sampiran' ? 'bg-sky/5 border-sky/25' : 'bg-jungle/5 border-jungle/25'
}

function placedLineClass(basketId, line) {
  if (checked.value) {
    const verdict = verdictFor(line)
    if (verdict === true) return 'bg-jungle/10 border-jungle/40 text-jungle'
    if (verdict === false) return 'bg-coral/10 border-coral/40 text-coral'
  }
  return basketId === 'sampiran'
    ? 'bg-white border-sky/30 text-bark'
    : 'bg-white border-jungle/30 text-bark'
}

const answerKey = computed(() => [
  {
    label: 'Jawaban',
    answer: lines.value
      .map((line) => `${line.category === 'sampiran' ? 'Sampiran' : 'Isi'}: ${line.text}`)
      .join('\n'),
  },
])
</script>
