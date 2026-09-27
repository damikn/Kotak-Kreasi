<template>
  <!-- Kamus Rima — helper panel on the writing screen: shows the two chosen rhyme
       suffixes, the words already picked, and other words with the same ending. -->
  <div class="bg-white/80 rounded-2xl border border-jungle/20 p-3 shadow-sm mb-4">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
      <h2 class="font-fredoka font-bold text-sm text-bark flex items-center gap-1.5">
        📖 Kamus Rima
      </h2>
      <p class="font-nunito text-[11px] text-gray-400">
        Ketuk kata untuk menambahkannya ke
        <span class="font-bold text-jungle">Baris {{ activeLine + 1 }}</span>
      </p>
    </div>

    <input
      v-model="query"
      type="search"
      placeholder="Cari kata rima…"
      class="w-full mb-3 rounded-xl border-2 border-gray-200 px-3 py-1.5 font-nunito text-sm
             focus:outline-none focus:border-jungle/60 focus:ring-2 focus:ring-jungle/20"
    />

    <div class="grid gap-3 sm:grid-cols-2">
      <div v-for="group in groups" :key="group.key" class="rounded-xl border-2 p-2.5" :class="group.borderClass">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="font-fredoka font-bold text-sm" :class="group.textClass">
            Rima {{ group.key }} · {{ group.suffix || '—' }}
          </span>
          <span class="font-nunito text-[10px] text-gray-400">{{ group.lineHint }}</span>
        </div>

        <!-- Kata yang sudah dipilih -->
        <p class="font-nunito text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kata pilihanmu</p>
        <div v-if="group.chosen.length" class="flex flex-wrap gap-1.5 mb-2">
          <span
            v-for="word in group.chosen"
            :key="word"
            class="rounded-full px-2.5 py-1 font-nunito text-xs font-semibold"
            :class="group.chipClass"
          >
            {{ word }}
          </span>
        </div>
        <p v-else class="font-nunito text-xs text-gray-300 mb-2">Belum ada kata dipilih.</p>

        <!-- Saran kata lain dengan akhiran sama -->
        <p class="font-nunito text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kata lain</p>
        <div v-if="group.suggestions.length" class="flex flex-wrap gap-1.5">
          <button
            v-for="word in group.suggestions"
            :key="word"
            type="button"
            class="rounded-full px-2.5 py-1 border font-nunito text-xs transition-all duration-200
                   hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-jungle/30"
            :class="group.suggestClass"
            @click="$emit('insert', word)"
          >
            {{ word }}
          </button>
        </div>
        <p v-else class="font-nunito text-xs text-gray-300">{{ query ? 'Tidak ada kata yang cocok.' : 'Tidak ada kata lain.' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  // { suffix, words } for rima A (baris 1 & 3)
  rimaA: { type: Object, default: () => ({ suffix: '', words: [] }) },
  // { suffix, words } for rima B (baris 2 & 4)
  rimaB: { type: Object, default: () => ({ suffix: '', words: [] }) },
  // content/rhyme-words.json: { '-an': { kata_benda: [], kata_kerja: [], kata_sifat: [] }, … }
  dictionary: { type: Object, default: () => ({}) },
  // Line index the next inserted word goes to
  activeLine: { type: Number, default: 0 },
})

defineEmits(['insert'])

const query = ref('')

function wordsFor(suffix) {
  const bucket = props.dictionary?.[suffix]
  if (!bucket) return []
  return [...(bucket.kata_benda ?? []), ...(bucket.kata_kerja ?? []), ...(bucket.kata_sifat ?? [])]
}

const groups = computed(() => [
  {
    key: 'A',
    lineHint: 'Baris 1 & 3',
    suffix: props.rimaA?.suffix ?? '',
    chosen: props.rimaA?.words ?? [],
    borderClass: 'border-jungle/25 bg-jungle/5',
    textClass: 'text-jungle',
    chipClass: 'bg-jungle/15 text-jungle',
    suggestClass: 'bg-white border-jungle/30 text-bark hover:border-jungle',
  },
  {
    key: 'B',
    lineHint: 'Baris 2 & 4',
    suffix: props.rimaB?.suffix ?? '',
    chosen: props.rimaB?.words ?? [],
    borderClass: 'border-sky/25 bg-sky/5',
    textClass: 'text-sky',
    chipClass: 'bg-sky/15 text-sky',
    suggestClass: 'bg-white border-sky/30 text-bark hover:border-sky',
  },
].map((group) => {
  const chosen = group.chosen.map((w) => String(w).toLowerCase())
  const search = query.value.trim().toLowerCase()
  const suggestions = wordsFor(group.suffix)
    .filter((word) => !chosen.includes(String(word).toLowerCase()))
    .filter((word) => !search || String(word).toLowerCase().includes(search))
    .slice(0, 24)
  return { ...group, suggestions }
}))
</script>
