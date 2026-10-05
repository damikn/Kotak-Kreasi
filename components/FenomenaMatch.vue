<template>
  <!--
    FenomenaMatch — grouped drag-match board for the "Kenali Fenomena 2" page.

    Each group is one phenomenon: a fixed image card (the anchor) next to three
    drop slots (gagasan / pesan / pantun). Every slot contributes one chip to the
    shuffled answer bank below; the learner drags a chip onto a slot (or taps a
    chip, then taps the slot) and checks the result.

    Group shape:  { id, icon, name, slots: [{ id, label, answer }] }
    Slot key:     `${group.id}:${slot.id}` — used for `results` and `answers`.
  -->
  <div class="w-full">
    <!-- ── Groups: image anchor + drop slots ───────────────── -->
    <div class="space-y-3 sm:space-y-4">
      <div
        v-for="(group, groupIndex) in groups"
        :key="group.id"
        class="rounded-2xl border-2 border-gray-100 bg-white/70 p-2.5 sm:p-3"
      >
        <div class="grid gap-2.5 sm:gap-3 md:grid-cols-4">
          <!-- Fixed image card -->
          <div class="rounded-2xl border-2 border-jungle/40 bg-cream p-3 flex flex-col items-center justify-center text-center min-h-[110px]">
            <span class="text-4xl sm:text-5xl leading-none select-none" aria-hidden="true">{{ group.icon }}</span>
            <span class="mt-1 font-fredoka font-bold text-xs sm:text-sm text-bark leading-tight">{{ group.name }}</span>
            <span class="font-nunito text-[11px] text-gray-500 font-semibold">Gambar {{ groupIndex + 1 }}</span>
          </div>

          <!-- Drop slots -->
          <div
            v-for="slot in group.slots"
            :key="slotKey(group, slot)"
            class="rounded-2xl border-2 p-2 pt-6 relative min-h-[110px] flex items-center justify-center text-center transition-all duration-200"
            :class="slotClass(group, slot)"
            role="button"
            :tabindex="0"
            :aria-label="`${slot.label} untuk gambar ${groupIndex + 1}`"
            @click="onSlotClick(group, slot)"
            @keydown.enter.prevent="onSlotClick(group, slot)"
            @keydown.space.prevent="onSlotClick(group, slot)"
            @dragover.prevent="onDragOver(group, slot)"
            @dragleave="onDragLeave(group, slot)"
            @drop.prevent="onDrop(group, slot)"
          >
            <span class="absolute top-1 left-2 font-fredoka font-bold text-[11px] text-gray-500 select-none">
              {{ slot.label }}
            </span>

            <p
              v-if="placed[slotKey(group, slot)]"
              class="font-nunito text-[13px] font-semibold leading-snug whitespace-pre-line break-words"
              :class="filledTextClass(group, slot)"
            >
              {{ slotText(placed[slotKey(group, slot)]) }}
            </p>
            <p v-else class="font-nunito text-xs text-gray-300 leading-snug">
              {{ dragOverKey === slotKey(group, slot) ? 'Lepaskan di sini' : 'Tarik jawaban ke sini' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Answer bank ─────────────────────────────────────── -->
    <div class="mt-4">
      <p class="font-fredoka font-bold text-sm text-bark mb-2">Bank Jawaban:</p>

      <div v-if="bank.length" class="flex flex-wrap gap-2">
        <button
          v-for="chip in bank"
          :key="chip.key"
          type="button"
          :draggable="canDrag"
          class="max-w-full rounded-2xl px-3.5 py-2 border-2 font-nunito text-xs sm:text-sm font-semibold
                 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none
                 focus:ring-2 focus:ring-jungle/40 text-left touch-manipulation select-none"
          :class="[chipClass(chip.order), selectedChipKey === chip.key ? 'ring-2 ring-jungle scale-[1.02]' : '']"
          :aria-pressed="selectedChipKey === chip.key"
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
  /** One entry per phenomenon: { id, icon, name, slots: [{ id, label, answer }] } */
  groups: { type: Array, required: true },
  /** Set true by the parent after "Periksa Jawaban" to reveal right/wrong colours. */
  checked: { type: Boolean, default: false },
  /** Map of slot key → whether the learner placed the correct chip. */
  results: { type: Object, default: null },
})

const emit = defineEmits(['change', 'completed'])

function slotKey(group, slot) {
  return `${group.id}:${slot.id}`
}

// Every slot of every group gets exactly one chip.
const allSlots = computed(() =>
  props.groups.flatMap((group) => (group.slots ?? []).map((slot) => ({ group, slot }))),
)

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
const selectedChipKey = ref(null)
const dragOverKey = ref(null)

function buildBank() {
  bank.value = allSlots.value.map((entry, index) => ({
    key: slotKey(entry.group, entry.slot),
    text: entry.slot.answer,
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

function slotText(chipKey) {
  for (const { group, slot } of allSlots.value) {
    if (slotKey(group, slot) === chipKey) return slot.answer
  }
  return ''
}

function bankOrder(chipKey) {
  return allSlots.value.findIndex(({ group, slot }) => slotKey(group, slot) === chipKey)
}

const answers = computed(() => {
  const out = {}
  for (const { group, slot } of allSlots.value) {
    const key = slotKey(group, slot)
    out[key] = placed.value[key] ? slotText(placed.value[key]) : ''
  }
  return out
})

const isAllFilled = computed(() => allSlots.value.every(({ group, slot }) => !!placed.value[slotKey(group, slot)]))

watch(isAllFilled, (filled) => {
  if (filled) emit('completed', answers.value)
})

function emitChange(key) {
  emit('change', key, placed.value[key] ? slotText(placed.value[key]) : '')
}

// ── Placing / removing chips ──────────────────────────────
function placeChip(group, slot, chipKey) {
  const key = slotKey(group, slot)
  // A slot holds one chip: send any previous occupant back to the bank.
  const previous = placed.value[key]
  let chips = [...bank.value]
  if (previous) chips.push({ key: previous, text: slotText(previous), order: bankOrder(previous) })

  placed.value = { ...placed.value, [key]: chipKey }
  bank.value = chips.filter((chip) => chip.key !== chipKey).sort((a, b) => a.order - b.order)
  selectedChipKey.value = null
  emitChange(key)
}

function removeChip(group, slot) {
  const key = slotKey(group, slot)
  const chipKey = placed.value[key]
  if (!chipKey) return
  const next = { ...placed.value }
  delete next[key]
  placed.value = next
  bank.value = [...bank.value, { key: chipKey, text: slotText(chipKey), order: bankOrder(chipKey) }]
    .sort((a, b) => a.order - b.order)
  emitChange(key)
}

function onSlotClick(group, slot) {
  const key = slotKey(group, slot)
  if (placed.value[key]) {
    removeChip(group, slot)
    return
  }
  if (selectedChipKey.value) placeChip(group, slot, selectedChipKey.value)
}

function onChipClick(chip) {
  selectedChipKey.value = selectedChipKey.value === chip.key ? null : chip.key
}

// ── Drag & drop (desktop) ─────────────────────────────────
function onDragStart(chip, event) {
  selectedChipKey.value = chip.key
  event.dataTransfer?.setData('text/plain', chip.key)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onDragEnd() {
  dragOverKey.value = null
}

function onDragOver(group, slot) {
  const key = slotKey(group, slot)
  if (!placed.value[key]) dragOverKey.value = key
}

function onDragLeave(group, slot) {
  const key = slotKey(group, slot)
  if (dragOverKey.value === key) dragOverKey.value = null
}

function onDrop(group, slot) {
  dragOverKey.value = null
  if (selectedChipKey.value) placeChip(group, slot, selectedChipKey.value)
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

function slotClass(group, slot) {
  const key = slotKey(group, slot)
  if (props.checked && props.results && key in props.results) {
    return props.results[key] ? 'bg-jungle/10 border-jungle' : 'bg-coral/10 border-coral'
  }
  if (placed.value[key]) return 'bg-white border-jungle/50 shadow-sm'
  if (dragOverKey.value === key) return 'bg-sky/10 border-sky border-dashed'
  return 'bg-gray-50 border-gray-300 border-dashed'
}

function filledTextClass(group, slot) {
  const key = slotKey(group, slot)
  if (props.checked && props.results && key in props.results) {
    return props.results[key] ? 'text-jungle' : 'text-coral'
  }
  return 'text-bark'
}

// Parent can wipe the board (e.g. "Ulangi").
function reset() {
  placed.value = {}
  selectedChipKey.value = null
  dragOverKey.value = null
  buildBank()
  shuffleBank()
}

defineExpose({ reset, answers })
</script>
