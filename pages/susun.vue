<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 to-teal-50">
    <AppHeader />
    <StepBreadcrumb :current-step="4" />

    <main class="flex-1 px-3 sm:px-4 py-4 sm:py-6 max-w-6xl mx-auto w-full">

      <!-- Judul -->
      <div class="flex items-center gap-2 mb-1">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-coral/20 flex items-center justify-center text-lg shrink-0">📝</div>
        <div>
          <h1 class="font-fredoka font-bold text-xl sm:text-3xl text-bark leading-tight">Susun Pantunmu!</h1>
          <p class="font-nunito text-xs sm:text-sm text-gray-500">Gunakan semua bahan dan ikuti kaidah penulisan pantun baku.</p>
        </div>
      </div>
      <p class="font-nunito text-xs text-bark/50 italic mb-4 ml-1">"Rangkai kata menjadi karya, ciptakan pantun yang bermakna."</p>

      <!-- Grid 3 kolom (mobile: 1 kolom) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">

        <!-- ── Kolom 1: Kumpulan Bahan ───────────────────── -->
        <div class="bg-cream rounded-2xl border border-gray-100 p-3 shadow-sm flex flex-col">
          <!-- Header toggle -->
          <button
            type="button"
            @click="bahanCollapsed = !bahanCollapsed"
            class="flex items-center justify-between w-full text-left mb-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-jungle/30 rounded-lg px-1 -mx-1"
            :aria-expanded="String(!bahanCollapsed)"
            aria-controls="bahan-detail"
            :title="bahanCollapsed ? 'Klik untuk lihat detail lengkap' : 'Klik untuk ringkas'"
          >
            <h2 class="font-fredoka font-bold text-sm text-bark flex items-center gap-1.5">
              🗂️ Kumpulan Bahan
            </h2>
            <span
              class="text-xs font-nunito font-bold px-2.5 py-1 rounded-full transition-all duration-200 shrink-0"
              :class="bahanCollapsed
                ? 'bg-sky/15 text-sky group-hover:bg-sky/25'
                : 'bg-jungle/15 text-jungle group-hover:bg-jungle/25'"
            >
              {{ bahanCollapsed ? 'Lihat Detail ▾' : 'Ringkas ▴' }}
            </span>
          </button>

          <!-- Ringkasan (default) / Detail (maximize) -->
          <Transition name="collapse" mode="out-in">
            <div v-if="bahanCollapsed" key="ringkas" class="space-y-1.5">
              <div class="bg-white/70 rounded-xl border border-gray-100 p-2.5 space-y-1">
                <div class="flex items-center gap-1.5 text-xs">
                  <span class="shrink-0">🔍</span>
                  <span class="font-nunito text-gray-500 min-w-0 truncate">
                    {{ store.phenomena?.name ?? '—' }}
                  </span>
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                  <span class="shrink-0">📋</span>
                  <span class="font-nunito text-gray-500 min-w-0 truncate">
                    Pola {{ store.pola?.id ?? '—' }} — {{ store.pola?.nama ?? 'Belum dipilih' }}
                  </span>
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                  <span class="shrink-0">🔤</span>
                  <span class="font-nunito text-gray-500 min-w-0">
                    Rima <strong class="text-coral">A {{ store.rima?.rimaA?.suffix || '—' }}</strong>
                    •
                    <strong class="text-sky">B {{ store.rima?.rimaB?.suffix || '—' }}</strong>
                  </span>
                </div>
              </div>
              <p class="font-nunito text-[11px] italic text-bark/40 text-center">
                Klik "Lihat Detail" untuk bahan lengkap
              </p>
            </div>

            <div v-else key="detail" id="bahan-detail" class="space-y-2">
              <!-- Fenomena -->
              <div class="p-2.5 bg-sky/10 rounded-xl border border-sky/20">
                <p class="font-nunito text-xs font-bold text-sky mb-0.5">🔍 Fenomena</p>
                <p class="font-nunito text-sm font-semibold text-bark leading-tight">{{ store.phenomena?.name ?? '—' }}</p>
                <p v-if="store.phenomena?.description" class="font-nunito text-[11px] text-gray-500 leading-relaxed mt-0.5">{{ store.phenomena?.description }}</p>
              </div>

              <!-- Pola -->
              <div class="p-2.5 bg-sunshine/10 rounded-xl border border-sunshine/20">
                <p class="font-nunito text-xs font-bold text-sunshine mb-0.5">📋 Pola {{ store.pola?.id }}</p>
                <p class="font-nunito text-xs font-semibold text-bark">{{ store.pola?.nama }}</p>
                <p class="font-nunito text-xs text-gray-500 leading-tight mt-0.5">Sampiran: {{ store.pola?.deskripsi_sampiran }}</p>
                <p class="font-nunito text-xs text-gray-500 leading-tight">Isi: {{ store.pola?.deskripsi_isi }}</p>
              </div>

              <!-- 2 Rima (A & B) -->
              <div class="p-2.5 bg-jungle/10 rounded-xl border border-jungle/20 space-y-1.5">
                <div>
                  <p class="font-nunito text-xs font-bold text-coral">🔴 Rima A (Baris 1 & 3): <span class="text-bark font-extrabold">{{ store.rima?.rimaA?.suffix }}</span></p>
                  <div class="flex flex-wrap gap-1 mt-0.5">
                    <span v-for="word in (store.rima?.rimaA?.words || [])" :key="word"
                          class="px-2 py-0.5 rounded-full bg-coral/20 text-coral text-xs font-nunito font-semibold border border-coral/30">
                      {{ word }}
                    </span>
                  </div>
                </div>
                <div>
                  <p class="font-nunito text-xs font-bold text-sky">🔵 Rima B (Baris 2 & 4): <span class="text-bark font-extrabold">{{ store.rima?.rimaB?.suffix }}</span></p>
                  <div class="flex flex-wrap gap-1 mt-0.5">
                    <span v-for="word in (store.rima?.rimaB?.words || [])" :key="word"
                          class="px-2 py-0.5 rounded-full bg-sky/20 text-sky text-xs font-nunito font-semibold border border-sky/30">
                      {{ word }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Contoh Pola -->
              <div class="bg-white/70 rounded-xl p-2.5 border border-gray-100">
                <p class="font-nunito text-xs font-bold text-bark/60 mb-1">📖 Contoh pola:</p>
                <p v-for="(baris, idx) in (store.pola?.contoh ?? [])" :key="idx"
                   class="font-nunito text-xs italic leading-relaxed"
                   :class="idx < 2 ? 'text-sky' : 'text-jungle'">{{ baris }}</p>
              </div>
            </div>
          </Transition>
        </div>

        <!-- ── Kolom 2: Tulis Pantun ─────────────────────── -->
        <div class="bg-white rounded-2xl border-2 border-gray-100 p-3 shadow-sm">
          <h2 class="font-fredoka font-bold text-sm text-bark mb-1 flex items-center gap-1.5">✏️ Tulis Pantunmu di Sini!</h2>
          <p class="font-nunito text-xs text-gray-400 mb-3">Baris 1–2 = Sampiran | Baris 3–4 = Isi | Ideal: 8–12 suku kata</p>

          <div class="space-y-2.5">
            <div v-for="(cfg, idx) in barisConfig" :key="idx" class="relative">
              <div class="flex items-center justify-between mb-0.5">
                <label :for="`baris-${idx+1}`"
                       class="font-nunito text-xs font-semibold"
                       :class="idx < 2 ? 'text-sky' : 'text-jungle'">
                  {{ cfg.label }} <span class="text-gray-400 font-normal">{{ cfg.hint }}</span>
                </label>

                <!-- Syllable Counter Badge -->
                <span
                  class="font-nunito text-[11px] font-bold px-2 py-0.5 rounded-full"
                  :class="getSyllableBadgeClass(lineSyllables[idx])"
                >
                  {{ lineSyllables[idx] }} suku kata
                </span>
              </div>

              <textarea
                :id="`baris-${idx+1}`"
                v-model="pantunLines[idx]"
                :placeholder="cfg.placeholder"
                rows="2"
                maxlength="150"
                class="w-full border-2 rounded-xl px-3 py-2 font-nunito text-sm resize-none leading-relaxed
                       transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-jungle/20"
                :class="getLineInputClass(idx)"
                @input="syncStore"
              />
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <p class="font-nunito text-xs text-gray-400">
              <span class="font-bold" :class="filledCount >= 4 ? 'text-jungle' : 'text-coral'">{{ filledCount }}/4</span> baris terisi
            </p>
            <button @click="clearPantun" class="text-xs text-gray-300 hover:text-coral font-nunito transition-colors">🗑 Kosongkan</button>
          </div>
        </div>

        <!-- ── Kolom 3: Checklist Kesesuaian ───────────── -->
        <div class="bg-cream rounded-2xl border border-gray-100 p-3 shadow-sm flex flex-col">
          <h2 class="font-fredoka font-bold text-sm text-bark mb-2 flex items-center gap-1.5">✅ Checklist Kesesuaian</h2>

          <div class="space-y-1.5 flex-1">
            <ChecklistItem
              v-for="item in autoChecks" :key="item.id"
              :label="item.label"
              :checked="item.value"
              :manual="false"
            />
            <ChecklistItem
              label="Isi sesuai fenomena pilihan"
              :checked="manualMakna"
              :manual="true"
              @toggle="manualMakna = !manualMakna"
            />
            <ChecklistItem
              label="Bahasa baku & santun (KBBI)"
              :checked="manualBahasa"
              :manual="true"
              @toggle="manualBahasa = !manualBahasa"
            />
          </div>

          <!-- Progress ring -->
          <div class="mt-3 flex items-center justify-center gap-3">
            <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#ECF0F1" stroke-width="5"/>
              <circle cx="28" cy="28" r="22" fill="none" stroke="#27AE60" stroke-width="5"
                stroke-linecap="round"
                :stroke-dasharray="`${progressArc} ${138 - progressArc}`"
                stroke-dashoffset="34.5"
                style="transition: stroke-dasharray 0.4s ease"/>
              <text x="28" y="28" text-anchor="middle" dominant-baseline="middle"
                    font-family="Fredoka,sans-serif" font-weight="700" font-size="12" fill="#27AE60">
                {{ doneCount }}/{{ totalChecks }}
              </text>
            </svg>
            <div>
              <p class="font-fredoka font-bold text-base text-jungle">{{ progressPct }}%</p>
              <p class="font-nunito text-xs text-gray-400">kesesuaian baku</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Kartu Pantun -->
      <Transition name="slide-up">
        <div v-if="filledCount >= 4" class="mb-4">
          <h3 class="font-fredoka font-bold text-base text-bark mb-2 flex items-center gap-2">👀 Preview Karyamu</h3>
          <div class="flex justify-center overflow-x-auto">
            <PantunCard
              :lines="pantunLines"
              :student-name="store.studentName"
              :phenomena="store.phenomena?.name ?? ''"
              :pola="`Pola ${store.pola?.id} — ${store.pola?.nama}`"
              :rima-a="store.rima?.rimaA"
              :rima-b="store.rima?.rimaB"
            />
          </div>
        </div>
      </Transition>

      <!-- Navigasi + Simpan -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <button @click="navigateTo('/rima')" class="flex items-center gap-2 text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors">
          <span>←</span> Kembali ke Pohon Rima
        </button>

        <button
          @click="handleSimpan"
          :disabled="filledCount < 4 || isSaving"
          class="flex items-center justify-center gap-2 font-fredoka font-bold text-base sm:text-lg rounded-2xl px-6 sm:px-8 py-3 transition-all duration-200 w-full sm:w-auto shadow-lg"
          :class="filledCount >= 4 && !isSaving ? 'bg-jungle text-white hover:bg-jungle/90 shadow-jungle/30 hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
        >
          <template v-if="isSaving">
            <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            <span>Menyimpan...</span>
          </template>
          <template v-else>
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6.28 3L1 12.49l3.5 6.07L9.78 9.07 6.28 3zM22 12.49L16.72 3H9.72l5.28 9.17H22v.01L22 12.49zm-7.78 3.07l-3.5 6.07h7l3.5-6.07h-7z"/>
            </svg>
            <span>Simpan Karya</span>
          </template>
        </button>
      </div>

      <!-- Save Error Message -->
      <Transition name="slide-up">
        <div v-if="saveError" class="mt-3 bg-coral/10 border border-coral/30 text-coral rounded-xl px-4 py-3 font-nunito text-sm flex items-start gap-2" role="alert">
          <span>⚠️</span>
          <div>
            <strong>Gagal menyimpan:</strong> {{ saveError }}
            <br>
            <button @click="handleSimpan" class="underline mt-1 text-coral hover:text-coral/70">Coba lagi</button>
          </div>
        </div>
      </Transition>
    </main>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- MODAL FEEDBACK VALIDASI PANTUN                                 -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <Transition name="modal">
      <div v-if="showFeedbackModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-bark/60 backdrop-blur-sm">
        <div class="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border-4 border-coral/30 max-h-[90vh] flex flex-col animate-bounce-in">

          <!-- Header Modal -->
          <div class="flex items-start gap-3 pb-3 border-b border-gray-100 shrink-0">
            <div class="w-10 h-10 rounded-2xl bg-coral/15 flex items-center justify-center text-2xl shrink-0">
              💡
            </div>
            <div>
              <h3 class="font-fredoka font-bold text-lg sm:text-xl text-bark">Petunjuk Perbaikan Pantun</h3>
              <p class="font-nunito text-xs text-gray-500">Ada beberapa hal yang perlu disesuaikan agar pantunmu lulus kaidah baku!</p>
            </div>
          </div>

          <!-- List Feedback Errors -->
          <div class="my-4 space-y-3 overflow-y-auto pr-1 flex-1">
            <div
              v-for="(item, idx) in validationErrors"
              :key="idx"
              class="bg-coral/5 border border-coral/20 rounded-2xl p-3.5 space-y-1"
            >
              <div class="flex items-center gap-2">
                <span class="text-coral font-bold text-sm">❌</span>
                <h4 class="font-fredoka font-bold text-sm text-coral">{{ item.title }}</h4>
              </div>
              <p class="font-nunito text-xs text-bark/80 pl-6 leading-relaxed">
                {{ item.message }}
              </p>
              <div class="mt-2 pl-6 pt-1 border-t border-coral/10">
                <p class="font-nunito text-xs font-semibold text-jungle flex items-center gap-1">
                  <span>💡 Harus bagaimana:</span>
                </p>
                <p class="font-nunito text-xs text-gray-600 leading-relaxed italic">
                  "{{ item.action }}"
                </p>
              </div>
            </div>
          </div>

          <!-- Footer Modal -->
          <div class="pt-3 border-t border-gray-100 flex justify-end shrink-0">
            <button
              @click="showFeedbackModal = false"
              class="w-full bg-jungle hover:bg-jungle/90 text-white font-fredoka font-bold text-base rounded-2xl py-3 shadow-lg shadow-jungle/30 transition-all hover:-translate-y-0.5"
            >
              Saya Mengerti, Perbaiki Sekarang ✨
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
import { useAudio }      from '~/composables/useAudio'

const ChecklistItem = defineComponent({
  props: {
    label:   { type: String, required: true },
    checked: { type: Boolean, default: false },
    manual:  { type: Boolean, default: false },
  },
  emits: ['toggle'],
  setup(props, { emit }) {
    return () => h('div', {
      class: `flex items-start gap-2 p-2 rounded-xl transition-colors ${props.checked ? 'bg-jungle/8' : 'bg-white/40'}`,
    }, [
      h('button', {
        type: 'button',
        class: `w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
          props.checked
            ? 'bg-jungle border-jungle'
            : props.manual
              ? 'border-gray-300 hover:border-jungle/60 cursor-pointer'
              : 'border-gray-200 bg-gray-50 cursor-default'
        }`,
        onClick: () => props.manual && emit('toggle'),
        'aria-checked': String(props.checked),
        role: 'checkbox',
        tabindex: props.manual ? '0' : '-1',
        onKeydown: (e) => { if (props.manual && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); emit('toggle') } },
      }, [
        props.checked
          ? h('svg', { class: 'w-3 h-3 text-white', viewBox: '0 0 10 10', fill: 'none' }, [
              h('path', { d: 'M1.5 5L4 7.5 8.5 2.5', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
            ])
          : null,
      ]),
      h('div', { class: 'flex-1 min-w-0' }, [
        h('p', {
          class: `font-nunito text-xs font-semibold leading-tight ${props.checked ? 'text-jungle' : 'text-gray-500'}`,
        }, props.label),
        props.manual
          ? h('p', { class: 'font-nunito text-xs text-gray-400 mt-0.5' }, '(centang manual)')
          : null,
      ]),
    ])
  },
})

definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })

const store = useKotakStore()
const audio = useAudio()

onMounted(() => {
  if (!store.studentName)       navigateTo('/')
  if (!store.phenomena)         navigateTo('/fenomena')
  if (!store.pola)              navigateTo('/pola')
  if (!store.isStepDone(3))     navigateTo('/rima')
})

const pantunLines = reactive([
  store.pantun.baris1 ?? '',
  store.pantun.baris2 ?? '',
  store.pantun.baris3 ?? '',
  store.pantun.baris4 ?? '',
])

// Kolom "Kumpulan Bahan": default minimize, klik header untuk maximize
const bahanCollapsed = ref(true)

const barisConfig = [
  { label: 'Baris 1', hint: '(sampiran — Rima A)', placeholder: 'Contoh: Pohon rimbun tempat berteduh...' },
  { label: 'Baris 2', hint: '(sampiran — Rima B)', placeholder: 'Contoh: Burung bernyanyi riang gembira...' },
  { label: 'Baris 3', hint: '(isi — Rima A)',      placeholder: 'Contoh: Belajar tekun tanpa mengeluh...' },
  { label: 'Baris 4', hint: '(isi — Rima B)',      placeholder: 'Contoh: Agar cita-cita mudah ditempuh...' },
]

// ── Suku kata counter logic ──────────────────────────────
function countSyllablesInWord(word) {
  let w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  const matches = w.match(/[aiueo]/g)
  if (!matches) return 1
  let count = matches.length
  const diphthongs = w.match(/(ai|au|oi)/g)
  if (diphthongs) count -= diphthongs.length
  return Math.max(1, count)
}

function countLineSyllables(line) {
  if (!line.trim()) return 0
  const words = line.trim().split(/\s+/)
  let total = 0
  for (const word of words) {
    total += countSyllablesInWord(word)
  }
  return total
}

const lineSyllables = computed(() => [
  countLineSyllables(pantunLines[0]),
  countLineSyllables(pantunLines[1]),
  countLineSyllables(pantunLines[2]),
  countLineSyllables(pantunLines[3]),
])

function getSyllableBadgeClass(syl) {
  if (syl === 0) return 'bg-gray-100 text-gray-400'
  if (syl >= 8 && syl <= 12) return 'bg-jungle/15 text-jungle'
  return 'bg-coral/15 text-coral font-bold'
}

function getLineInputClass(idx) {
  const syl = lineSyllables[idx]
  if (!pantunLines[idx].trim()) return 'border-gray-200 bg-gray-50 focus:border-jungle/50'
  if (syl >= 8 && syl <= 12) return 'border-jungle/40 bg-white focus:border-jungle'
  return 'border-coral/40 bg-coral/5 focus:border-coral'
}

const filledCount = computed(() => pantunLines.filter(b => b.trim().length > 0).length)

const prevFilled = ref(filledCount.value)

function syncStore() {
  store.setPantun({ baris1: pantunLines[0], baris2: pantunLines[1], baris3: pantunLines[2], baris4: pantunLines[3] })
  const curr = filledCount.value
  if (curr > prevFilled.value) {
    if (curr === 4) audio.play('all-lines-done')
    else audio.play(`line-filled-${curr}`)
    prevFilled.value = curr
  } else if (curr < prevFilled.value) {
    prevFilled.value = curr
  }
}

function clearPantun() {
  if (confirm('Yakin ingin menghapus semua baris pantun?')) {
    pantunLines[0] = pantunLines[1] = pantunLines[2] = pantunLines[3] = ''
    syncStore()
  }
}

// ── Validation Engine ─────────────────────────────────────
function lineMatchesSuffix(lineText, suffix) {
  if (!lineText.trim() || !suffix) return false
  const words = lineText.trim().toLowerCase().split(/\s+/)
  const lastWord = words[words.length - 1].replace(/[^a-z]/g, '')
  const s = suffix.replace('-', '').toLowerCase()

  if (s === 'a') return lastWord.endsWith('a')
  if (s === 'i') return lastWord.endsWith('i')
  if (s === 'an') return lastWord.endsWith('an')
  if (s === 'ar') return lastWord.endsWith('ar')
  if (s === 'ang') return lastWord.endsWith('ang')
  if (s === 'ai') return lastWord.endsWith('ai')
  if (s === 'at') return lastWord.endsWith('at')
  if (s === 'en') return lastWord.endsWith('en')
  if (s === 'in') return lastWord.endsWith('in')
  if (s === 'it') return lastWord.endsWith('it')
  return lastWord.endsWith(s)
}

// ── Pola rule helpers ─────────────────────────────────────
function lineWords(line) {
  return (line || '').toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, '')).filter(Boolean)
}

function lineHasAny(line, words) {
  const clean = (line || '').toLowerCase()
  return words.some(w => clean.includes(w))
}

function hasRepeatedWord(line) {
  const words = lineWords(line)
  return words.length > 1 && new Set(words).size < words.length
}

function containsNumber(line) {
  if (/\d/.test(line)) return true
  return lineHasAny(line, ['satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas', 'belas', 'puluh', 'ratus', 'ribu', 'juta', 'beberapa', 'semua', 'setengah', 'seperempat'])
}

// Kamus kata untuk validasi tema pola (kosa kata anak SD)
const kosaKata = {
  kota: ['jakarta', 'bandung', 'surabaya', 'medan', 'semarang', 'makassar', 'palembang', 'depok', 'bekasi', 'tangerang', 'bogor', 'malang', 'padang', 'yogyakarta', 'denpasar', 'solo', 'surakarta', 'samarinda', 'banjarmasin', 'pontianak', 'manado', 'ambon', 'jayapura', 'pekanbaru', 'aceh', 'lampung', 'mataram', 'kupang', 'batam', 'cirebon', 'tasikmalaya', 'garut', 'kediri', 'jember', 'banyuwangi', 'sidoarjo', 'gresik', 'bali', 'papua', 'kalimantan', 'sumatera', 'sulawesi', 'betawi', 'sunda', 'jawa'],
  hewan: ['kucing', 'anjing', 'burung', 'ayam', 'bebek', 'ikan', 'kambing', 'sapi', 'kerbau', 'kuda', 'kelinci', 'tikus', 'gajah', 'harimau', 'singa', 'monyet', 'kupu', 'semut', 'lebah', 'nyamuk', 'lalat', 'ular', 'buaya', 'elang', 'merpati', 'jalak', 'kenari', 'penyu', 'paus', 'lumba', 'hiu', 'lele', 'nila', 'gurame', 'udang', 'kepiting', 'capung', 'belalang', 'laba', 'jangkrik', 'cacing', 'tupai', 'kadal', 'bunglon', 'katak', 'kodok', 'siput', 'rusa', 'jerapah', 'zebra', 'badak', 'kanguru', 'beruang', 'serigala', 'musang', 'landak', 'kelelawar', 'biawak', 'komodo', 'unggas', 'hewan'],
  tumbuhan: ['bunga', 'melati', 'mawar', 'anggrek', 'tulip', 'kenanga', 'kamboja', 'cempaka', 'teratai', 'sepatu', 'buah', 'mangga', 'pisang', 'apel', 'jeruk', 'rambutan', 'duku', 'durian', 'anggur', 'semangka', 'melon', 'pepaya', 'nanas', 'salak', 'jambu', 'belimbing', 'nangka', 'sawo', 'kelapa', 'kopi', 'teh', 'padi', 'jagung', 'gandum', 'sawit', 'karet', 'cengkeh', 'lada', 'jahe', 'kunyit', 'lengkuas', 'sereh', 'cabai', 'tomat', 'bayam', 'kangkung', 'sawi', 'wortel', 'kentang', 'bawang', 'pohon', 'daun', 'rumput', 'bambu', 'kayu', 'akar', 'biji', 'flamboyan', 'sakura', 'tumbuhan', 'tanaman'],
  benda: ['pensil', 'buku', 'tas', 'sepatu', 'meja', 'kursi', 'bangku', 'papan', 'kapur', 'penghapus', 'penggaris', 'rautan', 'pulpen', 'tinta', 'kertas', 'koran', 'majalah', 'piring', 'gelas', 'sendok', 'garpu', 'teko', 'panci', 'wajan', 'ember', 'gayung', 'sapu', 'pel', 'sikat', 'cermin', 'sisir', 'sabun', 'handuk', 'baju', 'celana', 'topi', 'payung', 'jam', 'lampu', 'kipas', 'lemari', 'kasur', 'bantal', 'selimut', 'botol', 'dompet', 'kunci', 'telepon', 'gawai', 'komputer', 'laptop', 'tv', 'radio', 'sepeda', 'motor', 'mobil', 'becak', 'gerobak', 'barang', 'benda'],
  ajakan: ['mari', 'ayo', 'marilah', 'yuk', 'mari kita', 'himbau', 'ajak', 'mengajak'],
  nasihat: ['jangan', 'sebaiknya', 'seharusnya', 'hendaknya', 'rajin', 'tekun', 'giat', 'hormat', 'patuh', 'sabar', 'jujur', 'disiplin', 'menabung', 'belajar', 'menjaga', 'hindari', 'peduli', 'berbagi', 'tolong', 'bantu', 'sopan', 'santun', 'bertanggung', 'hati-hati', 'sayangi', 'cintai', 'berbuat', 'berbakti'],
}

const validationErrors = computed(() => {
  const errors = []
  const lines = [...pantunLines]
  const filled = lines.filter(l => l.trim().length > 0)

  if (filled.length < 4) {
    errors.push({
      rule: 'BARIS_LENGKAP',
      title: 'Jumlah Baris Belum Lengkap',
      message: `Pantun harus memiliki 4 baris. Saat ini baru terisi ${filled.length} baris.`,
      action: 'Lengkapi semua 4 baris pantun.'
    })
    return errors
  }

  // 1. Suku kata 8-12
  lines.forEach((line, idx) => {
    const syl = countLineSyllables(line)
    if (syl < 8) {
      errors.push({
        rule: 'SUKU_KATA_MIN',
        title: `Baris ${idx + 1} Terlalu Pendek`,
        message: `Baris ${idx + 1} hanya memiliki ${syl} suku kata. Pantun yang baik memiliki 8–12 suku kata per baris.`,
        action: `Tambahkan beberapa kata pada Baris ${idx + 1} agar menjadi 8–12 suku kata.`
      })
    } else if (syl > 12) {
      errors.push({
        rule: 'SUKU_KATA_MAX',
        title: `Baris ${idx + 1} Terlalu Panjang`,
        message: `Baris ${idx + 1} memiliki ${syl} suku kata. Pantun yang baik memiliki 8–12 suku kata per baris.`,
        action: `Persingkat baris ${idx + 1} agar berada di kisaran 8–12 suku kata.`
      })
    }
  })

  // 2. Rima AB-AB
  const rimaA = store.rima?.rimaA
  const rimaB = store.rima?.rimaB
  const sufA = rimaA?.suffix || ''
  const sufB = rimaB?.suffix || ''

  if (sufA && !lineMatchesSuffix(lines[0], sufA)) {
    const lastWord = lines[0].trim().split(/\s+/).pop() || ''
    errors.push({
      rule: 'RIMA_A_BARIS_1',
      title: 'Rima Akhir Baris 1 Belum Sesuai',
      message: `Baris 1 harus berakhiran rima A ('${sufA}'). Kata terakhir saat ini adalah '${lastWord}'.`,
      action: `Ganti kata terakhir Baris 1 dengan kata yang berakhiran rima '${sufA}'.`
    })
  }

  if (sufA && !lineMatchesSuffix(lines[2], sufA)) {
    const lastWord = lines[2].trim().split(/\s+/).pop() || ''
    errors.push({
      rule: 'RIMA_A_BARIS_3',
      title: 'Rima Akhir Baris 3 (Isi) Belum Sesuai',
      message: `Baris 3 (Isi) harus berakhiran rima A ('${sufA}'). Kata terakhir saat ini adalah '${lastWord}'.`,
      action: `Ganti kata terakhir Baris 3 dengan kata yang berakhiran rima '${sufA}'.`
    })
  }

  if (sufB && !lineMatchesSuffix(lines[1], sufB)) {
    const lastWord = lines[1].trim().split(/\s+/).pop() || ''
    errors.push({
      rule: 'RIMA_B_BARIS_2',
      title: 'Rima Akhir Baris 2 Belum Sesuai',
      message: `Baris 2 harus berakhiran rima B ('${sufB}'). Kata terakhir saat ini adalah '${lastWord}'.`,
      action: `Ganti kata terakhir Baris 2 dengan kata yang berakhiran rima '${sufB}'.`
    })
  }

  if (sufB && !lineMatchesSuffix(lines[3], sufB)) {
    const lastWord = lines[3].trim().split(/\s+/).pop() || ''
    errors.push({
      rule: 'RIMA_B_BARIS_4',
      title: 'Rima Akhir Baris 4 (Isi) Belum Sesuai',
      message: `Baris 4 (Isi) harus berakhiran rima B ('${sufB}'). Kata terakhir saat ini adalah '${lastWord}'.`,
      action: `Ganti kata terakhir Baris 4 dengan kata yang berakhiran rima '${sufB}'.`
    })
  }

  // 3. Kata rima pilihan
  const wordsA = (rimaA?.words || []).map(w => w.toLowerCase())
  const wordsB = (rimaB?.words || []).map(w => w.toLowerCase())

  if (wordsA.length) {
    const b1Low = lines[0].toLowerCase()
    const b3Low = lines[2].toLowerCase()
    const usedA = wordsA.some(w => b1Low.includes(w) || b3Low.includes(w))
    if (!usedA) {
      errors.push({
        rule: 'KATA_RIMA_A_MISSING',
        title: 'Kata Rima A Belum Digunakan',
        message: `Belum ada kata dari Rima A (${wordsA.join(', ')}) yang dipakai pada Baris 1 atau Baris 3.`,
        action: `Gunakan kata pilihan Rima A (${wordsA.join(', ')}) ke dalam Baris 1 atau Baris 3.`
      })
    }
  }

  if (wordsB.length) {
    const b2Low = lines[1].toLowerCase()
    const b4Low = lines[3].toLowerCase()
    const usedB = wordsB.some(w => b2Low.includes(w) || b4Low.includes(w))
    if (!usedB) {
      errors.push({
        rule: 'KATA_RIMA_B_MISSING',
        title: 'Kata Rima B Belum Digunakan',
        message: `Belum ada kata dari Rima B (${wordsB.join(', ')}) yang dipakai pada Baris 2 atau Baris 4.`,
        action: `Gunakan kata pilihan Rima B (${wordsB.join(', ')}) ke dalam Baris 2 atau Baris 4.`
      })
    }
  }

  // 4. Pola rules
  const pola = store.pola
  if (pola) {
    const ruleType = pola.ruleType || ''
    const p1Words = lineWords(lines[0])
    const p2Words = lineWords(lines[1])
    const p3Words = lineWords(lines[2])
    const p4Words = lineWords(lines[3])
    const p1First = p1Words[0]
    const p2First = p2Words[0]
    const p3First = p3Words[0]
    const p4First = p4Words[0]
    const p1Last  = p1Words[p1Words.length - 1]
    const p2Last  = p2Words[p2Words.length - 1]
    const sampiranText = `${lines[0]} ${lines[1]}`.toLowerCase()
    const isiText = `${lines[2]} ${lines[3]}`.toLowerCase()

    const pushPolaError = (rule, title, message, action) => {
      errors.push({ rule, title, message, action })
    }

    switch (ruleType) {
      case 'repetisi_awal_sampiran': // Pola 1
        if (p1First && p2First && p1First !== p2First) {
          pushPolaError(
            'POLA_REPETISI_AWAL_SAMPIRAN',
            'Aturan Pola 1 Belum Terpenuhi',
            `Pola 1 meminta kata pertama Baris 1 ('${p1First}') sama dengan kata pertama Baris 2 ('${p2First}').`,
            `Ubah kata pertama Baris 2 menjadi '${p1First}'.`
          )
        }
        break

      case 'repetisi_awal_akhir_sampiran': // Pola 2
        if (p1First && p2Last && p1First !== p2Last) {
          pushPolaError(
            'POLA_REPETISI_AWAL_AKHIR_SAMPIRAN',
            'Aturan Pola 2 Belum Terpenuhi',
            `Pola 2 meminta kata pertama Baris 1 ('${p1First}') sama dengan kata terakhir Baris 2 ('${p2Last}').`,
            `Ubah kata terakhir Baris 2 menjadi '${p1First}'.`
          )
        }
        break

      case 'sampiran_kota': // Pola 3
        if (!lineHasAny(sampiranText, kosaKata.kota)) {
          pushPolaError(
            'POLA_SAMPIRAN_KOTA',
            'Aturan Pola 3 Belum Terpenuhi',
            'Pola 3 meminta sampiran (Baris 1 atau 2) memuat nama kota Indonesia.',
            'Tambahkan nama kota seperti Jakarta, Bandung, Surabaya, Padang, dll pada Baris 1 atau Baris 2.'
          )
        }
        break

      case 'sampiran_hewan': // Pola 4
        if (!lineHasAny(sampiranText, kosaKata.hewan)) {
          pushPolaError(
            'POLA_SAMPIRAN_HEWAN',
            'Aturan Pola 4 Belum Terpenuhi',
            'Pola 4 meminta sampiran (Baris 1 atau 2) memuat nama hewan.',
            'Tambahkan nama hewan seperti kucing, burung, kupu-kupu, dll pada Baris 1 atau Baris 2.'
          )
        }
        break

      case 'sampiran_tumbuhan': // Pola 5
        if (!lineHasAny(sampiranText, kosaKata.tumbuhan)) {
          pushPolaError(
            'POLA_SAMPIRAN_TUMBUHAN',
            'Aturan Pola 5 Belum Terpenuhi',
            'Pola 5 meminta sampiran (Baris 1 atau 2) memuat nama bunga, buah, atau tumbuhan.',
            'Tambahkan nama bunga, buah, atau tumbuhan seperti bunga melati, mangga, bambu, dll pada Baris 1 atau Baris 2.'
          )
        }
        break

      case 'sampiran_angka': // Pola 6
        if (!containsNumber(sampiranText)) {
          pushPolaError(
            'POLA_SAMPIRAN_ANGKA',
            'Aturan Pola 6 Belum Terpenuhi',
            'Pola 6 meminta sampiran (Baris 1 atau 2) memuat angka atau kata bilangan.',
            'Tambahkan angka atau kata bilangan seperti tiga, lima, atau sepuluh pada Baris 1 atau Baris 2.'
          )
        }
        break

      case 'repetisi_sampiran': // Pola 7
        if (!hasRepeatedWord(lines[0]) && !hasRepeatedWord(lines[1])) {
          pushPolaError(
            'POLA_REPETISI_SAMPIRAN',
            'Aturan Pola 7 Belum Terpenuhi',
            'Pola 7 meminta terdapat kata yang diulang di dalam baris sampiran (Baris 1 atau Baris 2).',
            'Ulangi salah satu kata di Baris 1 atau Baris 2, contoh: "Ombak datang ombak pergi".'
          )
        }
        break

      case 'repetisi_isi': // Pola 8
        if (!hasRepeatedWord(lines[2]) && !hasRepeatedWord(lines[3])) {
          pushPolaError(
            'POLA_REPETISI_ISI',
            'Aturan Pola 8 Belum Terpenuhi',
            'Pola 8 meminta terdapat kata yang diulang di dalam baris isi (Baris 3 atau Baris 4).',
            'Ulangi salah satu kata di Baris 3 atau Baris 4, contoh: "Belajar tekun belajar giat".'
          )
        }
        break

      case 'sampiran_benda_sehari': // Pola 9
        if (!lineHasAny(sampiranText, kosaKata.benda)) {
          pushPolaError(
            'POLA_SAMPIRAN_BENDA',
            'Aturan Pola 9 Belum Terpenuhi',
            'Pola 9 meminta sampiran (Baris 1 atau 2) memuat nama benda kehidupan sehari-hari.',
            'Tambahkan nama benda seperti pensil, buku, meja, atau tas pada Baris 1 atau Baris 2.'
          )
        }
        break

      case 'isi_ajakan': // Pola 10
        if (!lineHasAny(isiText, kosaKata.ajakan)) {
          pushPolaError(
            'POLA_ISI_AJAKAN',
            'Aturan Pola 10 Belum Terpenuhi',
            'Pola 10 meminta isi pantun (Baris 3 atau 4) memuat kata ajakan.',
            "Gunakan kata ajakan seperti 'mari', 'ayo', atau 'marilah' pada Baris 3 atau Baris 4."
          )
        }
        break

      case 'isi_nasihat': // Pola 11
        if (!lineHasAny(isiText, kosaKata.nasihat)) {
          pushPolaError(
            'POLA_ISI_NASIHAAT',
            'Aturan Pola 11 Belum Terpenuhi',
            'Pola 11 meminta isi pantun (Baris 3 atau 4) memuat pesan nasihat.',
            'Tambahkan kata nasihat seperti jangan, sebaiknya, rajin, atau tekun pada Baris 3 atau Baris 4.'
          )
        }
        break

      case 'pertanyaan_retoris': // Pola 12
        if (!lines[3].trim().endsWith('?') && !lineHasAny(lines[3], ['siapa', 'mengapa', 'apakah', 'kenapa', 'bagaimana', 'kapan', 'di mana'])) {
          pushPolaError(
            'POLA_PERTANYAAN_RETORIS',
            'Aturan Pola 12 Belum Terpenuhi',
            'Pola 12 meminta Baris 4 berupa pertanyaan retoris.',
            "Akhiri Baris 4 dengan tanda tanya '?' atau gunakan kata tanya."
          )
        }
        break

      default:
        break
    }
  }

  return errors
})

// Checklist item state
const autoChecks = computed(() => [
  { id: 'empat-baris',   label: 'Terdiri dari 4 baris lengkap',                        value: filledCount.value >= 4 },
  { id: 'suku-kata',     label: 'Tiap baris 8–12 suku kata',                           value: lineSyllables.value.every(s => s >= 8 && s <= 12) },
  { id: 'rima-ab-ab',    label: 'Rima A (b1&3) & Rima B (b2&4) sesuai',                value: filledCount.value >= 4 && validationErrors.value.every(e => !e.rule.startsWith('RIMA_')) },
  { id: 'kata-rima',     label: 'Menggunakan kata rima dari Pohon',                    value: store.rimaCheck },
])

const manualMakna  = ref(false)
const manualBahasa = ref(false)

const totalChecks = 6
const doneCount   = computed(() =>
  autoChecks.value.filter(c => c.value).length + (manualMakna.value ? 1 : 0) + (manualBahasa.value ? 1 : 0)
)
const progressPct = computed(() => Math.round((doneCount.value / totalChecks) * 100))
const progressArc = computed(() => Math.round((doneCount.value / totalChecks) * 138))

// ── Modal Feedback state ──────────────────────────────────
const showFeedbackModal = ref(false)

// ── Simpan karya ─────────────────────────────────────────
const isSaving  = ref(false)
const saveError = ref('')

async function handleSimpan() {
  if (filledCount.value < 4) return
  syncStore()

  // Jalankan Validasi Strict
  if (validationErrors.value.length > 0) {
    audio.play('toast-warn')
    showFeedbackModal.value = true
    return // Tidak bisa lanjut simpan!
  }

  isSaving.value  = true
  saveError.value = ''
  audio.play('save-start')

  try {
    const html2canvas = (await import('html2canvas')).default
    const el = document.getElementById('pantun-preview')
    if (!el) throw new Error('Element preview tidak ditemukan')

    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#FFFDE7', logging: false })
    const base64 = canvas.toDataURL('image/jpeg', 0.95)

    const result = await $fetch('/api/save-pantun', {
      method: 'POST',
      body: {
        studentName: store.studentName,
        phenomena:   store.phenomena?.name ?? '',
        pola:        store.pola?.nama ?? '',
        rima:        store.rima,
        pantunLines: [...pantunLines],
        imageBase64: base64,
      },
    })

    store.setSavedResult(result.driveUrl ?? '', result.sessionId ?? '')
    store.setImageBase64(base64)
    audio.play('save-success')
    navigateTo('/hasil')
  } catch (err) {
    console.error('Save error:', err)
    saveError.value = err?.data?.message ?? err?.message ?? 'Terjadi kesalahan tidak terduga.'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.slide-up-enter-active { transition: all 0.3s ease; }
.slide-up-enter-from   { opacity: 0; transform: translateY(14px); }
.bg-jungle\/8 { background-color: rgb(39 174 96 / 0.08); }

/* Collapse transition untuk Kumpulan Bahan */
.collapse-enter-active, .collapse-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.collapse-enter-from, .collapse-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  max-height: 0;
}
.collapse-enter-to, .collapse-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>
