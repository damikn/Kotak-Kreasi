<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 to-green-50">
    <AppHeader />
    <StageBadge route="/cocokkan" />
    <StepBreadcrumb :current-step="2" />

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
            Isi setiap kotak bernomor dengan jawaban yang sesuai. Tarik atau ketuk jawaban dari bank di bawah, ya!
          </p>
        </div>
      </div>

      <!-- Fenomena terpilih -->
      <div class="flex items-center gap-2 mb-4 ml-1">
        <span class="font-nunito text-xs text-bark/60">Fenomena yang dipilih:</span>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-sky/30 px-3 py-1 font-nunito text-xs font-bold text-sky">
          <span aria-hidden="true">{{ selected?.icon }}</span>
          {{ selected?.name }}
        </span>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="space-y-3">
        <div class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
          <div v-for="i in 4" :key="i" class="min-h-[96px] rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error || !crosswordItems.length" class="text-center py-10">
        <p class="text-coral font-nunito text-sm">Data latihan tidak ditemukan. Coba muat ulang halaman.</p>
      </div>

      <template v-else>
        <CrosswordMatch
          ref="boardRef"
          :items="crosswordItems"
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
            <span>←</span><span>Kembali ke Fenomena</span>
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

            <button
              v-else
              @click="handleNext"
              class="flex items-center gap-2 font-fredoka font-bold text-base rounded-2xl px-6 py-3
                     bg-jungle text-white hover:bg-jungle/90 shadow-lg shadow-jungle/30 hover:-translate-y-0.5
                     transition-all duration-200"
            >
              <span>Lanjutkan</span><span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <!-- Hasil pemeriksaan -->
        <Transition name="slide-up">
          <div v-if="checked" class="mt-4 space-y-3">
            <div
              class="rounded-2xl border-2 p-3 sm:p-4"
              :class="correctCount === crosswordItems.length - 1
                ? 'bg-jungle/10 border-jungle/40'
                : 'bg-sunshine/10 border-sunshine/40'"
            >
              <p class="font-fredoka font-bold text-sm text-bark">
                Benar {{ correctCount }} dari {{ crosswordItems.length - 1 }} jawaban.
              </p>
              <p class="font-nunito text-xs text-gray-500 mt-1">
                {{ correctCount === crosswordItems.length - 1
                  ? 'Hebat! Semua jawabanmu sudah tepat.'
                  : 'Masih ada yang belum tepat. Baca lagi keterangannya, lalu coba ulangi.' }}
              </p>
              <button
                @click="handleUlangi"
                class="mt-2 font-nunito text-xs font-bold text-sky underline decoration-dotted"
              >
                Ulangi
              </button>
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
                  :key="item.id"
                  class="rounded-xl bg-cream/70 border border-jungle/10 p-2.5"
                >
                  <p class="font-nunito text-xs font-bold text-bark">
                    {{ item.number }}. {{ item.label }}
                  </p>
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
import CrosswordMatch    from '~/components/CrosswordMatch.vue'

definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })

const store = useKotakStore()
const audio = useAudio()

// Guard
onMounted(() => {
  if (!store.studentName) navigateTo('/')
  if (!store.phenomena) navigateTo('/fenomena')
})

// ── Data fenomena terpilih (gagasan, pesan, contoh pantun) ─
const { data: phenomenaData, pending, error } = await useAsyncData(
  'phenomena',
  () => queryContent('/phenomena').findOne(),
)

const phenomenaList = computed(() => {
  const raw = phenomenaData.value
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  for (const key of Object.keys(raw)) { if (Array.isArray(raw[key])) return raw[key] }
  return []
})

const selected = computed(() =>
  phenomenaList.value.find((p) => p.slug === store.phenomena?.slug) ?? store.phenomena ?? null,
)

// ── 4 kotak: gambar (terkunci) + gagasan + pesan + pantun ──
const crosswordItems = computed(() => {
  const p = selected.value
  if (!p?.gagasan) return []
  return [
    {
      id: 'gambar',
      number: 1,
      clue: 'Gambar yang menunjukkan fenomena yang kamu pilih',
      answer: p.name,
      locked: true,
      lockedValue: p.icon,
    },
    {
      id: 'gagasan',
      number: 2,
      clue: 'Gagasan utama — kejadian atau hal yang dibahas',
      answer: p.gagasan,
    },
    {
      id: 'pesan',
      number: 3,
      clue: 'Pesan atau amanat — ajakan untuk pembaca',
      answer: p.pesan,
    },
    {
      id: 'pantun',
      number: 4,
      clue: 'Baris pantun yang sesuai dengan fenomena dan pesannya',
      answer: (p.pantun ?? []).join('\n'),
    },
  ]
})

const answerKey = computed(() => [
  { id: 'gambar', number: 1, label: 'Gambar fenomena', answer: `${selected.value?.icon ?? ''} ${selected.value?.name ?? ''}`.trim() },
  { id: 'gagasan', number: 2, label: 'Gagasan', answer: selected.value?.gagasan ?? '' },
  { id: 'pesan', number: 3, label: 'Pesan', answer: selected.value?.pesan ?? '' },
  { id: 'pantun', number: 4, label: 'Pantun', answer: (selected.value?.pantun ?? []).join('\n') },
])

const explanation = 'Gambar menunjukkan fenomena yang diamati, gagasan menjelaskan isi yang ingin dibahas, pesan berisi amanat pantun, dan baris pantun menyampaikan gagasan serta pesan itu dengan rima yang teratur.'

// ── State interaksi ───────────────────────────────────────
const boardRef    = ref(null)
const answers     = ref({})
const checked     = ref(false)
const showKey     = ref(false)

const openItems = computed(() => crosswordItems.value.filter((i) => !i.locked))
const allFilled = computed(() => openItems.value.every((i) => !!answers.value[i.id]))

const results = computed(() => {
  if (!checked.value) return null
  const out = {}
  for (const item of openItems.value) {
    out[item.id] = answers.value[item.id] === item.answer
  }
  return out
})

const correctCount = computed(() => Object.values(results.value ?? {}).filter(Boolean).length)

function handleChange(id, value) {
  answers.value = { ...answers.value, [id]: value }
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
  audio.play(correctCount.value === openItems.value.length ? 'card-select' : 'toast-warn')
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
  navigateTo('/gagasan')
}

function handleBack() {
  audio.play('back')
  navigateTo('/fenomena')
}
</script>

<style scoped>
.slide-up-enter-active { transition: all 0.3s ease; }
.slide-up-enter-from   { opacity: 0; transform: translateY(14px); }
</style>
