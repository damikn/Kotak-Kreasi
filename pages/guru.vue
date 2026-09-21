<template>
  <div
    class="min-h-screen flex flex-col relative overflow-hidden"
    style="background: linear-gradient(180deg, #d4edda 0%, #cce5f0 60%, #E8F5E9 100%)"
  >
    <!-- Header -->
    <header class="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
        <span class="font-fredoka font-bold text-xl tracking-wide">
          <span class="text-coral">K</span><span class="text-sunshine">O</span><span
            class="text-jungle">T</span><span class="text-sky">A</span><span
            class="text-coral">K</span>
          <span class="text-gray-300 mx-1 font-light">|</span>
          <span class="text-sky">K</span><span class="text-jungle">R</span><span
            class="text-sunshine">E</span><span class="text-coral">A</span><span
            class="text-sky">S</span><span class="text-jungle">I</span>
          <span class="text-sm text-gray-400 ml-2 font-nunito font-semibold">Dashboard Guru</span>
        </span>
        <button
          @click="navigateTo('/')"
          class="text-sm text-gray-400 hover:text-bark border border-gray-200
                 hover:border-bark/30 rounded-lg px-3 py-1.5 transition-all font-nunito font-semibold"
        >
          🏠 Beranda
        </button>
      </div>
    </header>

    <main class="flex-1 flex flex-col items-center px-4 py-8 relative z-10">
      <div class="w-full max-w-4xl">

        <!-- ── Login PIN ──────────────────────────────────── -->
        <div v-if="!authed" class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-8 max-w-md mx-auto
                                   border border-white/60 text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-sky flex items-center justify-center shadow-lg shadow-sky/30">
              <span class="text-3xl">👩‍🏫</span>
            </div>
          </div>
          <h1 class="font-fredoka font-bold text-2xl text-bark mb-1">Dashboard Guru</h1>
          <p class="font-nunito text-sm text-gray-500 mb-6">Masukkan PIN guru untuk melihat dan menilai karya siswa</p>

          <form @submit.prevent="handleLogin" class="space-y-3">
            <input
              v-model="pin"
              type="password"
              inputmode="numeric"
              autocomplete="current-password"
              placeholder="PIN Guru"
              class="w-full font-nunito text-center text-lg tracking-[0.4em] border border-gray-200
                     rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky/40
                     focus:border-sky transition-all"
              :disabled="loading"
            />
            <button
              type="submit"
              :disabled="loading || !pin"
              class="w-full font-fredoka font-bold text-base rounded-xl px-6 py-3 transition-all duration-200
                     bg-sky text-white hover:bg-sky/90 shadow-lg shadow-sky/30 hover:-translate-y-0.5
                     disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Memeriksa...' : 'Masuk' }}
            </button>
          </form>

          <p v-if="error" class="mt-3 text-sm text-coral font-nunito">⚠️ {{ error }}</p>
        </div>

        <!-- ── Dashboard ──────────────────────────────────── -->
        <div v-else>
          <!-- Header dashboard -->
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h1 class="font-fredoka font-bold text-2xl text-bark">📚 Karya Siswa</h1>
              <p class="font-nunito text-sm text-gray-500">
                {{ works.length }} karya • {{ belumDini }} belum dinilai • {{ sudahDini }} sudah dinilai
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="loadWorks()"
                :disabled="loading"
                class="text-sm font-nunito font-semibold text-sky border border-sky/30 rounded-lg px-3 py-1.5
                       hover:bg-sky/10 transition-colors disabled:opacity-60"
              >
                ↻ Refresh
              </button>
              <button
                @click="logout"
                class="text-sm font-nunito font-semibold text-gray-500 border border-gray-200 rounded-lg
                       px-3 py-1.5 hover:border-coral/40 hover:text-coral transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>

          <!-- Filter chips -->
          <div class="flex flex-wrap gap-2 mb-4">
            <button
              v-for="f in filters" :key="f.value"
              @click="filter = f.value"
              class="text-xs font-nunito font-bold px-3 py-1.5 rounded-full border transition-all"
              :class="filter === f.value
                ? 'bg-jungle text-white border-jungle shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-jungle/40'"
            >
              {{ f.label }}
            </button>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="bg-white/80 rounded-2xl p-10 text-center">
            <div class="w-10 h-10 mx-auto border-4 border-sky/30 border-t-sky rounded-full animate-spin mb-3"></div>
            <p class="font-nunito text-sm text-gray-500">Memuat karya siswa...</p>
          </div>

          <!-- Daftar karya -->
          <div v-else-if="filteredWorks.length" class="space-y-3">
            <div
              v-for="w in filteredWorks" :key="w.kode"
              class="bg-white/85 backdrop-blur rounded-2xl border border-white/60 shadow-sm
                     p-4 hover:shadow-md transition-all cursor-pointer"
              @click="selectWork(w)"
            >
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-fredoka font-bold text-lg text-bark">{{ w.nama }}</span>
                    <span class="text-xs font-nunito font-bold px-2 py-0.5 rounded-full"
                      :class="w.status === 'SUDAH DINILAI'
                        ? 'bg-jungle/15 text-jungle'
                        : 'bg-sunshine/20 text-sunshine'">
                      {{ w.status === 'SUDAH DINILAI' ? '✓ Dinilai' : '⏳ Belum' }}
                    </span>
                  </div>
                  <p class="font-nunito text-xs text-gray-500 mt-1">{{ w.tanggal }}</p>
                  <p class="font-nunito text-xs text-gray-600 mt-1 line-clamp-2">
                    <span class="font-semibold text-sky">{{ w.fenomena }}</span>
                    <span class="mx-1 text-gray-300">•</span>{{ w.pola }}
                  </p>
                  <div class="mt-2 flex flex-wrap gap-1">
                    <span v-for="(b, i) in w.baris" :key="i"
                          class="text-[11px] font-nunito text-gray-500 border border-gray-200 bg-white
                                 rounded-md px-2 py-0.5 max-w-[220px] truncate">
                      {{ i + 1 }}. {{ b || '—' }}
                    </span>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1.5 shrink-0">
                  <span class="font-nunito text-[11px] text-gray-400">Kode: <strong class="text-bark">{{ w.kode }}</strong></span>
                  <span class="text-sm font-fredoka font-bold"
                    :class="w.status === 'SUDAH DINILAI' ? 'text-jungle' : (w.skorAuto != null ? 'text-sky' : 'text-gray-400')">
                    {{ w.status === 'SUDAH DINILAI' ? `Nilai: ${w.nilai ?? '—'}` : (w.skorAuto != null ? `Auto: ${w.skorAuto}` : 'Belum diskor') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="bg-white/80 rounded-2xl p-10 text-center">
            <p class="text-4xl mb-3">📭</p>
            <p class="font-nunito text-gray-500">Belum ada karya siswa.</p>
            <p class="font-nunito text-xs text-gray-400 mt-1">Karya yang disimpan dari halaman /hasil akan muncul di sini.</p>
          </div>
        </div>
      </div>
    </main>

    <!-- ── Modal detail karya ────────────────────────────── -->
    <div v-if="selected" class="fixed inset-0 z-[100] flex items-center justify-center p-4"
         style="background: rgba(0,0,0,0.4)" @click.self="selected = null">
      <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal header -->
        <div class="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 class="font-fredoka font-bold text-xl text-bark">Karya {{ selected.nama }}</h2>
          <button @click="selected = null" class="text-gray-400 hover:text-coral text-2xl leading-none px-2" aria-label="Tutup">×</button>
        </div>

        <div class="p-6 space-y-5">
          <!-- Info + pantun -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="bg-sky/5 rounded-xl p-3 border border-sky/15">
              <p class="text-xs font-nunito font-bold text-sky mb-1">📅 Tanggal</p>
              <p class="text-sm font-nunito text-bark">{{ selected.tanggal }}</p>
            </div>
            <div class="bg-sunshine/5 rounded-xl p-3 border border-sunshine/15">
              <p class="text-xs font-nunito font-bold text-sunshine mb-1">🗂️ Kode Karya</p>
              <p class="text-sm font-nunito text-bark font-semibold">{{ selected.kode }}</p>
            </div>
            <div class="bg-jungle/5 rounded-xl p-3 border border-jungle/15 col-span-1 sm:col-span-2">
              <p class="text-xs font-nunito font-bold text-jungle mb-1">🌍 Fenomena</p>
              <p class="text-sm font-nunito text-bark">{{ selected.fenomena }}</p>
            </div>
            <div class="bg-coral/5 rounded-xl p-3 border border-coral/15 col-span-1 sm:col-span-2">
              <p class="text-xs font-nunito font-bold text-coral mb-1">📋 Pola</p>
              <p class="text-sm font-nunito text-bark">{{ selected.pola }}</p>
            </div>
          </div>

          <!-- Pantun display -->
          <div class="bg-cream rounded-2xl border-2 border-jungle/15 p-4">
            <p class="font-fredoka font-bold text-sm text-bark mb-2">✍️ Pantun</p>
            <div class="space-y-1">
              <p v-for="(b, i) in selected.baris" :key="i"
                 class="font-nunito text-sm leading-relaxed"
                 :class="i < 2 ? 'text-sky italic' : 'text-jungle font-semibold'">
                {{ b || '—' }}
              </p>
            </div>
            <a v-if="selected.driveUrl && !selected.driveUrl.startsWith('(')"
               :href="selected.driveUrl" target="_blank" rel="noopener"
               class="inline-flex items-center gap-1 text-xs font-nunito font-semibold text-sky underline underline-offset-2 mt-3 hover:text-sky/70">
              🖼️ Lihat gambar di Drive →
            </a>
          </div>

          <!-- Auto validation breakdown -->
          <div v-if="detailValidation" class="bg-white/70 rounded-xl border border-gray-100 p-4">
            <div class="flex items-center justify-between mb-3">
              <p class="font-nunito text-sm font-bold text-bark">✅ Cek Otomatis</p>
              <span class="text-sm font-fredoka font-bold"
                :class="detailValidation.score >= 80 ? 'text-jungle' : detailValidation.score >= 50 ? 'text-sunshine' : 'text-coral'">
                Skor Auto: {{ detailValidation.score }}
              </span>
            </div>
            <div class="space-y-1.5">
              <div v-for="c in detailValidation.checks" :key="c.key"
                   class="flex items-start gap-2 text-xs font-nunito">
                <span class="mt-0.5 shrink-0 font-bold"
                  :class="c.passed ? 'text-jungle' : 'text-coral'">
                  {{ c.passed ? '✓' : '✗' }}
                </span>
                <span class="text-gray-600" :class="c.passed ? '' : 'text-gray-500'">
                  {{ c.label }}
                  <span v-if="!c.passed && c.detail" class="text-gray-400 text-[11px]">— {{ c.detail }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Form penilaian -->
          <div class="bg-jungle/5 rounded-2xl border border-jungle/15 p-4">
            <p class="font-fredoka font-bold text-sm text-bark mb-3">🎯 Penilaian Guru</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label class="text-xs font-nunito font-semibold text-gray-500">Nilai (0–100)</label>
                <div class="flex items-center gap-2 mt-1">
                  <input
                    v-model.number="gradeForm.nilai"
                    type="number" min="0" max="100" step="1"
                    class="w-full font-nunito text-lg font-bold border border-gray-200 rounded-xl px-3 py-2
                           focus:outline-none focus:ring-2 focus:ring-jungle/40"
                  />
                  <span class="text-xs font-nunito text-gray-400">
                    {{ selected.skorAuto != null ? `auto: ${selected.skorAuto}` : '—' }}
                  </span>
                </div>
              </div>
              <div>
                <label class="text-xs font-nunito font-semibold text-gray-500">Status</label>
                <div class="mt-1">
                  <span class="text-sm font-nunito font-bold px-3 py-1.5 rounded-full inline-block"
                    :class="selected.status === 'SUDAH DINILAI'
                      ? 'bg-jungle/15 text-jungle'
                      : 'bg-sunshine/20 text-sunshine'">
                    {{ selected.status === 'SUDAH DINILAI' ? '✓ Sudah dinilai' : '⏳ Belum dinilai' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="text-xs font-nunito font-semibold text-gray-500">Komentar untuk siswa</label>
              <textarea
                v-model="gradeForm.komentar"
                rows="3" maxlength="500"
                class="w-full font-nunito text-sm border border-gray-200 rounded-xl px-3 py-2 mt-1
                       focus:outline-none focus:ring-2 focus:ring-jungle/40 resize-none"
                placeholder="Tulis apresiasi atau masukan untuk siswa..."
              ></textarea>
              <p class="text-right text-[10px] text-gray-400 mt-0.5">{{ gradeForm.komentar.length }}/500</p>
            </div>

            <button
              @click="submitGrade"
              :disabled="grading || gradeForm.nilai == null"
              class="w-full font-fredoka font-bold text-base rounded-xl px-6 py-3 transition-all duration-200
                     bg-jungle text-white hover:bg-jungle/90 shadow-lg shadow-jungle/30 hover:-translate-y-0.5
                     disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {{ grading ? 'Menyimpan...' : (selected.status === 'SUDAH DINILAI' ? 'Perbarui Nilai' : 'Simpan Nilai') }}
            </button>
            <p v-if="gradeError" class="mt-2 text-xs text-coral font-nunito">⚠️ {{ gradeError }}</p>
            <p v-if="gradeOk" class="mt-2 text-xs text-jungle font-nunito">✓ Nilai tersimpan!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  pageTransition: { name: 'page', mode: 'out-in' },
})

const pin = ref('')
const authed = ref(false)
const loading = ref(false)
const error = ref('')
const works = ref([])
const filter = ref('semua')
const selected = ref(null)
const detailValidation = ref(null)
const grading = ref(false)
const gradeError = ref('')
const gradeOk = ref(false)

// PIN session (localStorage)
const SESSION_KEY = 'kotak-guru-session'
const sessionPin = useState('guruSession', () => '')

const filters = [
  { value: 'semua', label: 'Semua' },
  { value: 'belum', label: '⏳ Belum Dinilai' },
  { value: 'sudah', label: '✓ Sudah Dinilai' },
]

const filteredWorks = computed(() => {
  if (filter.value === 'belum') return works.value.filter(w => w.status !== 'SUDAH DINILAI')
  if (filter.value === 'sudah') return works.value.filter(w => w.status === 'SUDAH DINILAI')
  return works.value
})

const belumDini = computed(() => works.value.filter(w => w.status !== 'SUDAH DINILAI').length)
const sudahDini = computed(() => works.value.filter(w => w.status === 'SUDAH DINILAI').length)

const gradeForm = reactive({ nilai: null, komentar: '' })

onMounted(async () => {
  // Try restore session
  const saved = localStorage.getItem(SESSION_KEY)
  if (saved) {
    sessionPin.value = saved
    await tryAuthed()
  }
})

async function tryAuthed() {
  try {
    await $fetch('/api/guru/works', {
      query: { pin: sessionPin.value },
    })
    authed.value = true
    await loadWorks()
  } catch {
    sessionPin.value = ''
    localStorage.removeItem(SESSION_KEY)
  }
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  sessionPin.value = pin.value.trim()
  try {
    await $fetch('/api/guru/works', {
      query: { pin: sessionPin.value },
    })
    authed.value = true
    localStorage.setItem(SESSION_KEY, sessionPin.value)
    await loadWorks()
  } catch (err) {
    error.value = err?.data?.statusMessage ?? 'PIN salah.'
    sessionPin.value = ''
  } finally {
    loading.value = false
  }
}

async function loadWorks() {
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch('/api/guru/works', {
      query: { pin: sessionPin.value },
    })
    works.value = res.works || []
  } catch (err) {
    error.value = err?.data?.statusMessage ?? 'Gagal memuat karya.'
  } finally {
    loading.value = false
  }
}

function logout() {
  authed.value = false
  sessionPin.value = ''
  localStorage.removeItem(SESSION_KEY)
  works.value = []
}

async function selectWork(w) {
  selected.value = w
  detailValidation.value = null
  gradeError.value = ''
  gradeOk.value = false
  gradeForm.nilai = w.nilai ?? w.skorAuto ?? null
  gradeForm.komentar = w.komentar ?? ''

  try {
    const res = await $fetch(`/api/guru/works/${w.kode}`, {
      query: { pin: sessionPin.value },
    })
    detailValidation.value = res.validation
  } catch {
    // detail validation optional; keep list data
  }
}

async function submitGrade() {
  if (gradeForm.nilai == null) return
  grading.value = true
  gradeError.value = ''
  gradeOk.value = false
  try {
    await $fetch(`/api/guru/works/${selected.value.kode}/grade`, {
      method: 'POST',
      body: {
        pin: sessionPin.value,
        nilai: gradeForm.nilai,
        komentar: gradeForm.komentar,
      },
    })
    gradeOk.value = true
    selected.value.status = 'SUDAH DINILAI'
    selected.value.nilai = gradeForm.nilai
    await loadWorks()
  } catch (err) {
    gradeError.value = err?.data?.statusMessage ?? 'Gagal menyimpan nilai.'
  } finally {
    grading.value = false
  }
}
</script>