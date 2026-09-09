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
          <p class="font-nunito text-xs sm:text-sm text-gray-500">Gunakan semua bahan yang kamu miliki untuk membuat pantun.</p>
        </div>
      </div>
      <p class="font-nunito text-xs text-bark/50 italic mb-4 ml-1">"Rangkai kata menjadi karya, ciptakan pantun yang bermakna."</p>

      <!-- Grid 3 kolom (mobile: 1 kolom) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">

        <!-- ── Kolom 1: Kumpulan Bahan ───────────────────── -->
        <div class="bg-cream rounded-2xl border border-gray-100 p-3 shadow-sm">
          <h2 class="font-fredoka font-bold text-sm text-bark mb-2 flex items-center gap-1.5">🗂️ Kumpulan Bahan</h2>
          <div class="mb-2 p-2.5 bg-sky/10 rounded-xl border border-sky/20">
            <p class="font-nunito text-xs font-bold text-sky mb-0.5">🔍 Fenomena</p>
            <p class="font-nunito text-sm font-semibold text-bark leading-tight">{{ store.phenomena?.name ?? '—' }}</p>
          </div>
          <div class="mb-2 p-2.5 bg-sunshine/10 rounded-xl border border-sunshine/20">
            <p class="font-nunito text-xs font-bold text-sunshine mb-0.5">📋 Pola {{ store.pola?.id }}</p>
            <p class="font-nunito text-xs font-semibold text-bark">{{ store.pola?.nama }}</p>
            <p class="font-nunito text-xs text-gray-400 leading-tight">Sampiran: {{ store.pola?.deskripsi_sampiran }}</p>
            <p class="font-nunito text-xs text-gray-400 leading-tight">Isi: {{ store.pola?.deskripsi_isi }}</p>
          </div>
          <div class="mb-2 p-2.5 bg-jungle/10 rounded-xl border border-jungle/20">
            <p class="font-nunito text-xs font-bold text-jungle mb-1">🍎 Kata Rima ({{ store.rima.suffix }})</p>
            <div class="flex flex-wrap gap-1">
              <span v-for="word in store.rima.words" :key="word"
                    class="px-2 py-0.5 rounded-full bg-jungle/20 text-jungle text-xs font-nunito font-semibold border border-jungle/30">
                {{ word }}
              </span>
            </div>
          </div>
          <div class="bg-white/60 rounded-xl p-2.5 border border-gray-100">
            <p class="font-nunito text-xs font-bold text-bark/60 mb-1">📖 Contoh pola:</p>
            <p v-for="(baris, idx) in (store.pola?.contoh ?? [])" :key="idx"
               class="font-nunito text-xs italic leading-relaxed"
               :class="idx < 2 ? 'text-sky' : 'text-jungle'">{{ baris }}</p>
          </div>
        </div>

        <!-- ── Kolom 2: Tulis Pantun ─────────────────────── -->
        <div class="bg-white rounded-2xl border-2 border-gray-100 p-3 shadow-sm">
          <h2 class="font-fredoka font-bold text-sm text-bark mb-1 flex items-center gap-1.5">✏️ Tulis Pantunmu di Sini!</h2>
          <p class="font-nunito text-xs text-gray-400 mb-3">Baris 1–2 = Sampiran | Baris 3–4 = Isi</p>
          <div class="space-y-2">
            <div v-for="(cfg, idx) in barisConfig" :key="idx">
              <label :for="`baris-${idx+1}`"
                     class="block font-nunito text-xs font-semibold mb-0.5"
                     :class="idx < 2 ? 'text-sky' : 'text-jungle'">
                {{ cfg.label }} <span class="text-gray-300 font-normal">{{ cfg.hint }}</span>
              </label>
              <textarea
                :id="`baris-${idx+1}`"
                v-model="pantunLines[idx]"
                :placeholder="cfg.placeholder"
                rows="2"
                maxlength="150"
                class="w-full border-2 rounded-xl px-3 py-2 font-nunito text-sm resize-none leading-relaxed
                       transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-jungle/20"
                :class="pantunLines[idx].trim() ? 'border-jungle/30 focus:border-jungle bg-white' : 'border-gray-200 focus:border-jungle/50 bg-gray-50'"
                @input="syncStore"
              />
            </div>
          </div>
          <div class="mt-2 flex items-center justify-between">
            <p class="font-nunito text-xs text-gray-400">
              <span class="font-bold" :class="filledCount >= 4 ? 'text-jungle' : 'text-coral'">{{ filledCount }}/4</span> baris terisi
            </p>
            <button @click="clearPantun" class="text-xs text-gray-300 hover:text-coral font-nunito transition-colors">🗑 Kosongkan</button>
          </div>
        </div>

        <!-- ── Kolom 3: Checklist ─────────────────────────── -->
        <div class="bg-cream rounded-2xl border border-gray-100 p-3 shadow-sm flex flex-col">
          <h2 class="font-fredoka font-bold text-sm text-bark mb-2 flex items-center gap-1.5">✅ Checklist Kesesuaian</h2>

          <div class="space-y-1.5 flex-1">
            <!-- Item auto (tidak bisa diklik langsung) -->
            <ChecklistItem
              v-for="item in autoChecks" :key="item.id"
              :label="item.label"
              :checked="item.value"
              :manual="false"
            />
            <!-- Item manual (bisa diklik) -->
            <ChecklistItem
              label="Isi sesuai fenomena"
              :checked="manualMakna"
              :manual="true"
              @toggle="manualMakna = !manualMakna"
            />
            <ChecklistItem
              label="Bahasa baku dan mudah dipahami"
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
              <p class="font-nunito text-xs text-gray-400">selesai</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview kartu pantun -->
      <Transition name="slide-up">
        <div v-if="filledCount >= 4" class="mb-4">
          <h3 class="font-fredoka font-bold text-base text-bark mb-2 flex items-center gap-2">👀 Preview Karyamu</h3>
          <div class="flex justify-center overflow-x-auto">
            <PantunCard
              :lines="pantunLines"
              :student-name="store.studentName"
              :phenomena="store.phenomena?.name ?? ''"
              :pola="`Pola ${store.pola?.id} — ${store.pola?.nama}`"
              :rima-words="store.rima.words"
              :suffix="store.rima.suffix"
            />
          </div>
        </div>
      </Transition>

      <!-- Navigasi + Simpan -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <button @click="navigateTo('/rima')" class="flex items-center gap-2 text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors">
          <span>←</span> Kembali
        </button>
        <button
          @click="handleSimpan"
          :disabled="filledCount < 4 || isSaving"
          class="flex items-center justify-center gap-2 font-fredoka font-bold text-base sm:text-lg rounded-2xl px-6 sm:px-8 py-3 transition-all duration-200 w-full sm:w-auto"
          :class="filledCount >= 4 && !isSaving ? 'bg-jungle text-white hover:bg-jungle/90 shadow-lg shadow-jungle/30 hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
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

      <!-- Error -->
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
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
import { useAudio }      from '~/composables/useAudio'

// ── Komponen checklist inline (tidak perlu file terpisah) ──
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
  if (!store.rima.words.length) navigateTo('/rima')
})

// ── State baris pantun ─────────────────────────────────────
const pantunLines = reactive([
  store.pantun.baris1 ?? '',
  store.pantun.baris2 ?? '',
  store.pantun.baris3 ?? '',
  store.pantun.baris4 ?? '',
])

const barisConfig = [
  { label: 'Baris 1', hint: '(sampiran)', placeholder: 'Baris pertama sampiran...' },
  { label: 'Baris 2', hint: '(sampiran)', placeholder: 'Baris kedua sampiran...' },
  { label: 'Baris 3', hint: '(isi)',      placeholder: 'Baris pertama isi...' },
  { label: 'Baris 4', hint: '(isi)',      placeholder: 'Baris kedua isi...' },
]

const filledCount = computed(() => pantunLines.filter(b => b.trim().length > 0).length)

// Track baris yang sebelumnya sudah terisi (untuk detect baris baru)
const prevFilled = ref(filledCount.value)

function syncStore() {
  store.setPantun({ baris1: pantunLines[0], baris2: pantunLines[1], baris3: pantunLines[2], baris4: pantunLines[3] })

  // Mainkan nada naik saat baris baru terisi (do re mi fa)
  const curr = filledCount.value
  if (curr > prevFilled.value) {
    if (curr === 4) {
      audio.play('all-lines-done')
    } else {
      audio.play(`line-filled-${curr}`)
    }
    prevFilled.value = curr
  } else if (curr < prevFilled.value) {
    prevFilled.value = curr
  }
}
function clearPantun() {
  if (confirm('Yakin ingin menghapus semua baris?')) {
    pantunLines[0] = pantunLines[1] = pantunLines[2] = pantunLines[3] = ''
    syncStore()
  }
}

// ── Checklist ─────────────────────────────────────────────
// Auto checks (berubah otomatis berdasarkan isi)
const autoChecks = computed(() => [
  { id: 'empat-baris',    label: 'Terdiri dari 4 baris',               value: filledCount.value >= 4 },
  { id: 'pola-sampiran',  label: 'Pola sampiran sesuai',               value: filledCount.value >= 2 },
  { id: 'pola-isi',       label: 'Pola isi sesuai',                    value: filledCount.value >= 4 },
  { id: 'kata-rima',      label: 'Menggunakan kata rima yang dipilih', value: store.rimaCheck },
])

// Manual checks (user centang sendiri)
const manualMakna  = ref(false)
const manualBahasa = ref(false)

const totalChecks  = 6
const doneCount    = computed(() =>
  autoChecks.value.filter(c => c.value).length
  + (manualMakna.value ? 1 : 0)
  + (manualBahasa.value ? 1 : 0)
)
const progressPct  = computed(() => Math.round((doneCount.value / totalChecks) * 100))
// keliling = 2π×22 ≈ 138
const progressArc  = computed(() => Math.round((doneCount.value / totalChecks) * 138))

// ── Simpan ─────────────────────────────────────────────────
const isSaving  = ref(false)
const saveError = ref('')

async function handleSimpan() {
  if (filledCount.value < 4) return
  isSaving.value  = true
  saveError.value = ''
  syncStore()
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
</style>
