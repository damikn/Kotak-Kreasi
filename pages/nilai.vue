<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-plum/5 to-emerald-50">
    <AppHeader />
    <StageBadge route="/nilai" />

    <main class="flex-1 px-3 sm:px-4 py-4 sm:py-6 max-w-5xl mx-auto w-full">

      <div class="flex items-start gap-2 sm:gap-3 mb-4">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-plum/20 flex items-center justify-center text-base sm:text-lg shrink-0 mt-0.5">
          📋
        </div>
        <div class="min-w-0">
          <h1 class="font-fredoka font-bold text-xl sm:text-3xl text-plum leading-tight">
            Evaluasi Karyamu
          </h1>
          <p class="font-nunito text-xs sm:text-sm text-gray-500 leading-relaxed">
            Periksa sendiri pantunmu sebelum guru menilai, lalu perbaiki bagian yang ditandai.
          </p>
        </div>
      </div>

      <!-- Pantun yang dinilai -->
      <div v-if="hasPantun" class="rounded-2xl border-2 border-jungle/15 bg-cream/70 p-3 sm:p-4 mb-4">
        <p class="font-fredoka font-bold text-sm text-bark mb-2">Pantunmu</p>
        <p
          v-for="(line, index) in lines"
          :key="index"
          class="font-nunito text-sm leading-relaxed"
          :class="index < 2 ? 'text-sky italic' : 'text-jungle font-semibold'"
        >
          {{ line }}
        </p>
        <p class="font-nunito text-[11px] text-gray-500 mt-2">
          Rima A {{ store.rima?.rimaA?.suffix || '—' }} (baris 1 &amp; 3) ·
          Rima B {{ store.rima?.rimaB?.suffix || '—' }} (baris 2 &amp; 4)
        </p>
      </div>
      <p v-else class="rounded-2xl border-2 border-dashed border-gray-200 bg-white/70 p-4 font-nunito text-xs text-gray-500 mb-4">
        Kamu belum menulis pantun. Isi dulu di halaman Tulis Pantun, lalu kembali ke sini.
      </p>

      <div class="grid gap-3 md:grid-cols-2 mb-4">
        <!-- ── Kiri: checklist kesesuaian ─────────────────── -->
        <div class="rounded-2xl border-2 border-gray-100 bg-white/80 p-3 sm:p-4">
          <div class="flex items-center justify-between gap-2 mb-2">
            <h2 class="font-fredoka font-bold text-sm text-plum">✅ Checklist Kesesuaian</h2>
            <span class="font-nunito text-[11px] font-bold text-plum shrink-0">{{ progressLabel }}</span>
          </div>

          <!-- Progress -->
          <div class="h-2 rounded-full bg-plum/10 overflow-hidden mb-3" role="progressbar"
               :aria-valuenow="doneCount" aria-valuemin="0" aria-valuemax="totalChecks">
            <div class="h-full bg-plum transition-all duration-300" :style="{ width: `${progressPct}%` }" />
          </div>

          <ul class="space-y-2">
            <li v-for="item in checkItems" :key="item.key">
              <label class="flex items-start gap-2.5" :class="item.manual ? 'cursor-pointer' : 'cursor-default'">
                <input
                  type="checkbox"
                  class="mt-0.5 w-4 h-4 accent-jungle shrink-0"
                  :checked="item.value"
                  :disabled="!item.manual"
                  @change="toggle(item.key, $event.target.checked)"
                />
                <span class="min-w-0">
                  <span class="font-nunito text-sm font-semibold" :class="item.value ? 'text-jungle' : 'text-bark'">
                    {{ item.label }}
                  </span>
                  <span class="block font-nunito text-xs text-gray-500 leading-relaxed">{{ item.hint }}</span>
                </span>
              </label>
            </li>
          </ul>

          <p class="font-nunito text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            Tercentang <span class="font-bold text-jungle">{{ doneCount }}</span> dari {{ totalChecks }}.
            Empat poin pertama dinilai otomatis dari pantunmu; dua poin terakhir kamu nilai sendiri.
          </p>
        </div>

        <!-- ── Kanan: petunjuk perbaikan ──────────────────── -->
        <div class="rounded-2xl border-2 border-gray-100 bg-white/80 p-3 sm:p-4 flex flex-col">
          <h2 class="font-fredoka font-bold text-sm text-sunshine mb-2">💡 Petunjuk Perbaikan Pantun</h2>

          <template v-if="issues.length">
            <div class="space-y-2 flex-1">
              <div
                v-for="issue in issues"
                :key="issue.rule"
                class="rounded-xl border-2 border-coral/30 bg-coral/5 p-2.5"
              >
                <p class="font-nunito text-xs font-bold text-coral">✕ {{ issue.title }}</p>
                <p class="font-nunito text-xs text-gray-600 leading-relaxed mt-0.5">{{ issue.message }}</p>
                <p class="font-nunito text-xs text-jungle leading-relaxed mt-1">{{ issue.action }}</p>
              </div>
            </div>

            <button
              @click="handlePerbaiki"
              class="mt-3 w-full rounded-2xl bg-jungle text-white font-fredoka font-bold text-sm py-3
                     hover:bg-jungle/90 shadow-lg shadow-jungle/30 transition-all duration-200"
            >
              Saya Mengerti, Perbaiki Sekarang
            </button>
          </template>

          <div v-else class="flex-1 flex flex-col items-center justify-center text-center py-6">
            <span class="text-3xl mb-2" aria-hidden="true">🌟</span>
            <p class="font-fredoka font-bold text-sm text-jungle">Pantunmu sudah sesuai kaidah!</p>
            <p class="font-nunito text-xs text-gray-500 leading-relaxed mt-1">
              Simpan drafnya, lalu lanjutkan periksa karya untuk dikumpulkan ke gurumu.
            </p>
          </div>
        </div>
      </div>

      <!-- Aksi -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <button
          @click="navigateTo('/galeri')"
          class="flex items-center gap-2 text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors"
        >
          <span>←</span><span>Lihat Galeri</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            @click="handleSimpanDraf"
            class="font-fredoka font-bold text-base rounded-2xl px-6 py-3 border-2
                   border-plum/40 text-plum bg-white hover:bg-plum/10 transition-all duration-200"
          >
            Simpan Draf
          </button>

          <button
            @click="handlePeriksaKarya"
            class="flex items-center gap-2 font-fredoka font-bold text-base rounded-2xl px-6 py-3
                   bg-jungle text-white hover:bg-jungle/90 shadow-lg shadow-jungle/30
                   hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Periksa Karyamu</span><span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <Transition name="slide-up">
        <p
          v-if="saved"
          class="mt-3 bg-jungle/10 border border-jungle/30 text-jungle rounded-xl px-4 py-2.5 font-nunito text-sm"
          role="status"
        >
          Ceklist tersimpan. Jawabanmu ikut masuk ke Buku Karyaku.
        </p>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { useKotakStore }  from '~/composables/useKotakStore'
import { useAudio }       from '~/composables/useAudio'
import { useKaryaBook }   from '~/composables/useKaryaBook'
import { collectPantunIssues, countLineSyllables } from '~/composables/usePantunRules'

definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })

const store = useKotakStore()
const audio = useAudio()
const { updateEntry } = useKaryaBook()

const lines = computed(() => [
  store.pantun.baris1 ?? '',
  store.pantun.baris2 ?? '',
  store.pantun.baris3 ?? '',
  store.pantun.baris4 ?? '',
])
const hasPantun = computed(() => lines.value.some((line) => line.trim().length > 0))
const filledCount = computed(() => lines.value.filter((line) => line.trim().length > 0).length)

// ── Findings: the same rules /susun reports, from one composable ──
const issues = computed(() => collectPantunIssues(lines.value, store.rima?.rimaA, store.rima?.rimaB))
const issuesOfRule = (prefix) => issues.value.filter((issue) => issue.rule.startsWith(prefix))

const syllables = computed(() => lines.value.map((line) => countLineSyllables(line)))
const syllablesInRange = computed(() =>
  filledCount.value >= 4 && syllables.value.every((count) => count >= 8 && count <= 12),
)
const rimaOk = computed(() =>
  filledCount.value >= 4 && issues.value.every((issue) => !issue.rule.startsWith('RIMA_')),
)

// ── Manually assessed points, kept in the store like the old ceklist ──
const MANUAL_ITEMS = [
  { key: 'pesan',  label: 'Isi sesuai fenomena dan pesan yang dipilih', hint: 'Pantunmu benar-benar membahas fenomena dan pesanmu.' },
  { key: 'sopan',  label: 'Nada dan bahasa sopan',                      hint: 'Pilihan katanya santun dan enak dibaca.' },
]

const manual = ref({ ...(store.ceklist ?? {}) })

const checkItems = computed(() => [
  {
    key: 'baris',
    label: 'Empat baris, dua sampiran dan dua isi',
    hint: `Baris 1–2 sampiran, baris 3–4 isi pantun. (terisi ${filledCount.value}/4)`,
    value: filledCount.value >= 4,
    manual: false,
  },
  {
    key: 'sukuKata',
    label: 'Setiap baris 8–12 suku kata',
    hint: `Suku kata sekarang: ${syllables.value.join(' · ')}`,
    value: syllablesInRange.value,
    manual: false,
  },
  {
    key: 'rima',
    label: 'Rima akhir A-B-A-B sesuai pilihanmu',
    hint: issuesOfRule('RIMA_').length
      ? issuesOfRule('RIMA_').map((issue) => issue.title).join(', ')
      : 'Bunyi akhir baris 1 = 3 (A) dan baris 2 = 4 (B).',
    value: rimaOk.value,
    manual: false,
  },
  {
    key: 'kataRima',
    label: 'Menggunakan kata rima dari Pohon Rima',
    hint: 'Minimal satu kata pilihanmu dipakai di baris yang tepat.',
    value: filledCount.value >= 4 && !!store.rimaCheck,
    manual: false,
  },
  ...MANUAL_ITEMS.map((item) => ({
    ...item,
    value: !!manual.value[item.key],
    manual: true,
  })),
])

const totalChecks = computed(() => checkItems.value.length)
const doneCount = computed(() => checkItems.value.filter((item) => item.value).length)
const progressPct = computed(() => Math.round((doneCount.value / totalChecks.value) * 100))
const progressLabel = computed(() => `${Math.round((doneCount.value / totalChecks.value) * 100)}% · ${doneCount.value}/${totalChecks.value}`)

const saved = ref(Object.keys(store.ceklist ?? {}).length > 0)

function toggle(key, value) {
  manual.value = { ...manual.value, [key]: value }
  saved.value = false
}

function handleSimpanDraf() {
  if (!hasPantun.value) {
    audio.play('toast-warn')
    return
  }
  store.setCeklist(manual.value)
  store.markGameDone('/nilai')
  store.saveDraft()
  updateEntry(store.kodeKarya, { ceklist: { ...manual.value } })
  saved.value = true
  audio.play('submit')
}

function handlePeriksaKarya() {
  if (!saved.value) handleSimpanDraf()
  if (!hasPantun.value) return
  audio.play('next')
  navigateTo('/tinjau')
}

function handlePerbaiki() {
  audio.play('back')
  navigateTo('/susun')
}
</script>

<style scoped>
.slide-up-enter-active { transition: all 0.3s ease; }
.slide-up-enter-from   { opacity: 0; transform: translateY(14px); }
</style>
