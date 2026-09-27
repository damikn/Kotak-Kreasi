<template>
  <!--
    CrosswordMatch — crossword-style matching board.
    Numbered boxes (like a crossword grid) hold answer chips that the learner
    drags or taps from the shuffled answer bank below. The box count follows
    `items.length`, so the board stays dynamic.

    Item shape: { id, number, clue, answer, locked?, lockedValue? }
  -->
  <div class="w-full">
    <!-- ── Board ───────────────────────────────────────────── -->
    <div class="grid gap-2 sm:gap-3 grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
      <div
        v-for="item in items"
        :key="item.id"
        class="relative min-h-[96px] rounded-2xl border-2 p-2 pt-7 flex items-center justify-center
               text-center transition-all duration-200"
        :class="boxClass(item)"
        :role="item.locked ? undefined : 'button'"
        :tabindex="item.locked ? undefined : 0"
        :aria-label="item.locked ? `Kotak ${item.number} terkunci` : `Kotak ${item.number}: ${item.clue}`"
        @click="onBoxClick(item)"
        @keydown.enter.prevent="onBoxClick(item)"
        @keydown.space.prevent="onBoxClick(item)"
        @dragover.prevent="onDragOver(item)"
        @dragleave="onDragLeave(item)"
        @drop.prevent="onDrop(item)"
      >
        <!-- Nomor kotak, seperti penanda TTS -->
        <span class="absolute top-1 left-2 font-fredoka font-bold text-xs text-gray-500 select-none">
          {{ item.number }}
        </span>

        <!-- Kotak terkunci: gambar/ikon fenomena sudah terisi sejak awal -->
        <template v-if="item.locked">
          <div class="flex flex-col items-center gap-1">
            <span class="text-4xl leading-none select-none" aria-hidden="true">{{ item.lockedValue }}</span>
            <span class="font-nunito text-[11px] text-gray-500 font-semibold">Gambar fenomena</span>
          </div>
        </template>

        <!-- Kotak terisi -->
        <p
          v-else-if="placed[item.id]"
          class="font-nunito text-[13px] font-semibold leading-snug whitespace-pre-line break-words"
          :class="filledTextClass(item)"
        >
          {{ chipText(placed[item.id]) }}
        </p>

        <!-- Kotak kosong -->
        <p v-else class="font-nunito text-xs text-gray-300 leading-snug">
          {{ dragOverId === item.id ? 'Lepaskan di sini' : 'Tarik jawaban ke sini' }}
        </p>
      </div>
    </div>

    <!-- ── Clues ───────────────────────────────────────────── -->
    <div class="mt-4 rounded-2xl border-2 border-gray-100 bg-white/70 p-3 sm:p-4">
      <p class="font-fredoka font-bold text-sm text-bark mb-2">Keterangan:</p>
      <ol class="space-y-1">
        <li
          v-for="item in items"
          :key="item.id"
          class="font-nunito text-xs sm:text-sm text-gray-600 leading-relaxed"
        >
          <span class="font-bold text-bark">{{ item.number }}.</span> {{ item.clue }}
        </li>
      </ol>
    </div>

    <!-- ── Answer bank ─────────────────────────────────────── -->
    <div class="mt-4">
      <p class="font-fredoka font-bold text-sm text-bark mb-2">Bank Jawaban:</p>

      <div v-if="bank.length" class="flex flex-wrap gap-2">
        <button
          v-for="chip in bank"
          :key="chip.id"
          type="button"
          :draggable="canDrag"
          class="rounded-full px-4 py-2 border-2 font-nunito text-xs sm:text-sm font-semibold
                 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none
                 focus:ring-2 focus:ring-jungle/40 text-left touch-manipulation select-none"
          :class="[chipClass(chip.order), selectedChipId === chip.id ? 'ring-2 ring-jungle scale-105' : '']"
          :aria-pressed="selectedChipId === chip.id"
          @click="onChipClick(chip)"
          @dragstart="onDragStart(chip, $event)"
          @dragend="onDragEnd"
        >
          {{ chip.text }}
        </button>
      </div>

      <p v-else class="font-nunito text-xs text-jungle font-semibold">
        Semua jawaban sudah dipasang. Periksa kembali sebelum lanjut ya!
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  /** Boxes to render. Box count follows this array — never hardcoded. */
  items: { type: Array, required: true },
  /** Set true by the parent after "Periksa Jawaban" to reveal right/wrong colours. */
  checked: { type: Boolean, default: false },
  /** Map of item id → whether the learner placed the correct chip. */
  results: { type: Object, default: null },
})

const emit = defineEmits(['change', 'completed'])

// Boxes that accept a chip: everything except the locked ones.
const openItems = computed(() => props.items.filter((i) => !i.locked))

// HTML5 drag & drop only exists for mice/trackpads. On touch devices `draggable`
// makes a long-press start a native drag/selection instead of a tap, so drag is
// enabled only for fine pointers — phones and tablets use tap-to-place.
const canDrag = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    canDrag.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  }
})

// Chips live in the bank until they are placed. Built in a stable order so the
// server and client render the same markup; shuffled after mount.
const bank = ref([])
const placed = ref({})
const selectedChipId = ref(null)
const dragOverId = ref(null)

function buildBank() {
  bank.value = openItems.value.map((item, index) => ({
    id: item.id,
    text: item.answer,
    order: index,
  }))
}

function shuffleBank() {
  const chips = [...bank.value]
  for (let i = chips.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chips[i], chips[j]] = [chips[j], chips[i]]
  }
  bank.value = chips
}

onMounted(() => {
  buildBank()
  shuffleBank()
})

function chipText(chipId) {
  const item = props.items.find((i) => i.id === chipId)
  return item?.answer ?? ''
}

function bankOrder(chipId) {
  return openItems.value.findIndex((i) => i.id === chipId)
}

const answers = computed(() => {
  const out = {}
  for (const item of openItems.value) {
    out[item.id] = placed.value[item.id] ? chipText(placed.value[item.id]) : ''
  }
  return out
})

const isAllFilled = computed(() => openItems.value.every((i) => !!placed.value[i.id]))

watch(isAllFilled, (filled) => {
  if (filled) emit('completed', answers.value)
})

function emitChange(id) {
  emit('change', id, placed.value[id] ? chipText(placed.value[id]) : '')
}

// ── Placing / removing chips ──────────────────────────────
function placeChip(item, chipId) {
  if (item.locked) return
  // A box holds one chip: send any previous occupant back to the bank.
  const previous = placed.value[item.id]
  let chips = [...bank.value]
  if (previous) chips.push({ id: previous, text: chipText(previous), order: bankOrder(previous) })

  placed.value = { ...placed.value, [item.id]: chipId }
  bank.value = chips.filter((c) => c.id !== chipId).sort((a, b) => a.order - b.order)
  selectedChipId.value = null
  emitChange(item.id)
}

function removeChip(item) {
  const chipId = placed.value[item.id]
  if (!chipId) return
  const next = { ...placed.value }
  delete next[item.id]
  placed.value = next
  bank.value = [...bank.value, { id: chipId, text: chipText(chipId), order: bankOrder(chipId) }]
    .sort((a, b) => a.order - b.order)
  emitChange(item.id)
}

function onBoxClick(item) {
  if (item.locked) return
  if (placed.value[item.id]) {
    removeChip(item)
    return
  }
  if (selectedChipId.value) {
    placeChip(item, selectedChipId.value)
  }
}

function onChipClick(chip) {
  selectedChipId.value = selectedChipId.value === chip.id ? null : chip.id
}

// ── Drag & drop (desktop) ─────────────────────────────────
function onDragStart(chip, event) {
  selectedChipId.value = chip.id
  event.dataTransfer?.setData('text/plain', chip.id)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onDragEnd() {
  dragOverId.value = null
}

function onDragOver(item) {
  if (!item.locked && !placed.value[item.id]) dragOverId.value = item.id
}

function onDragLeave(item) {
  if (dragOverId.value === item.id) dragOverId.value = null
}

function onDrop(item) {
  dragOverId.value = null
  if (item.locked) return
  const chipId = selectedChipId.value
  if (chipId) placeChip(item, chipId)
}

// ── Styling helpers ───────────────────────────────────────
const CHIP_COLORS = [
  'bg-sky/10 border-sky/40 text-sky',
  'bg-sunshine/10 border-sunshine/40 text-sunshine',
  'bg-jungle/10 border-jungle/40 text-jungle',
  'bg-coral/10 border-coral/40 text-coral',
  'bg-purple-50 border-purple-300 text-purple-600',
  'bg-teal-50 border-teal-300 text-teal-600',
]

function chipClass(order) {
  return CHIP_COLORS[order % CHIP_COLORS.length]
}

function boxClass(item) {
  if (item.locked) return 'bg-cream border-jungle/40'
  if (props.checked && props.results && item.id in props.results) {
    return props.results[item.id]
      ? 'bg-jungle/10 border-jungle'
      : 'bg-coral/10 border-coral'
  }
  if (placed.value[item.id]) return 'bg-white border-jungle/50 shadow-sm'
  if (dragOverId.value === item.id) return 'bg-sky/10 border-sky border-dashed'
  return 'bg-gray-50 border-gray-300 border-dashed'
}

function filledTextClass(item) {
  if (props.checked && props.results && item.id in props.results) {
    return props.results[item.id] ? 'text-jungle' : 'text-coral'
  }
  return 'text-bark'
}

// Parent can wipe the board (e.g. "Ulangi").
function reset() {
  placed.value = {}
  selectedChipId.value = null
  dragOverId.value = null
  buildBank()
  shuffleBank()
}

defineExpose({ reset, answers })
</script>
