<template>
  <!-- Step 2: Tentukan Pola Pantun via Roda Putar -->
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-yellow-50 to-orange-50">
    <AppHeader />
    <StepBreadcrumb :current-step="2" />

    <main class="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">

      <!-- Judul -->
      <div class="flex items-center gap-3 mb-1">
        <div class="w-10 h-10 rounded-2xl bg-sunshine/20 flex items-center justify-center text-xl shrink-0">
          🎡
        </div>
        <div>
          <h1 class="font-fredoka font-bold text-2xl sm:text-3xl text-sunshine leading-tight">
            Tentukan Pola Pantun!
          </h1>
          <p class="font-nunito text-sm text-gray-500">
            Putar roda untuk mendapatkan pola pantunmu!
          </p>
        </div>
      </div>
      <p class="font-nunito text-xs text-bark/50 italic mb-6 ml-1">
        "Pola membantumu menata, kata membantumu bermakna."
      </p>

      <div class="flex flex-col lg:flex-row gap-6 items-start">

        <!-- Kolom kiri: Roda + pilih manual -->
        <div class="flex-1 flex flex-col items-center gap-4 w-full">

          <!-- Loading state -->
          <div v-if="pending" class="flex items-center justify-center h-64">
            <div class="w-12 h-12 border-4 border-sunshine/30 border-t-sunshine rounded-full animate-spin"/>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="text-center py-12">
            <p class="text-coral font-nunito">Gagal memuat data. Coba refresh halaman.</p>
          </div>

          <!-- Roda putar -->
          <SpinningWheel
            v-else
            :pola-list="polaList"
            :size="wheelSize"
            @spin-start="handleSpinStart"
            @selected="handleSpinResult"
          />

          <!-- Pilih manual (toggle) -->
          <div class="w-full max-w-xs">
            <button
              @click="showManual = !showManual"
              class="w-full text-sm text-gray-400 hover:text-bark font-nunito
                     underline underline-offset-2 transition-colors duration-200"
            >
              {{ showManual ? 'tutup pilihan manual ↑' : 'atau pilih sendiri ↓' }}
            </button>

            <Transition name="slide-down">
              <div v-if="showManual" class="mt-2">
                <select
                  v-model="manualPolaId"
                  @change="handleManualSelect"
                  class="w-full border-2 border-sunshine/30 rounded-xl px-3 py-2
                         font-nunito text-sm focus:border-sunshine focus:outline-none
                         focus:ring-2 focus:ring-sunshine/20 bg-white"
                  aria-label="Pilih pola secara manual"
                >
                  <option value="" disabled>— Pilih Pola —</option>
                  <option
                    v-for="p in polaList"
                    :key="p.id"
                    :value="p.id"
                  >
                    Pola {{ p.id }} — {{ p.nama }}
                  </option>
                </select>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Kolom kanan: Kartu hasil pola -->
        <div class="lg:w-80 xl:w-96 w-full shrink-0 overflow-hidden">

          <!-- Belum spin -->
          <div
            v-if="!selectedPola"
            class="bg-white/60 border-2 border-dashed border-sunshine/30
                   rounded-2xl p-8 text-center"
          >
            <div class="text-5xl mb-3" aria-hidden="true">🎡</div>
            <p class="font-nunito text-sm text-gray-400">
              Tekan tombol <strong class="text-sunshine">SPIN</strong> untuk mendapatkan pola pantunmu!
            </p>
          </div>

          <!-- Kartu hasil pola -->
          <Transition name="bounce-in">
            <div
              v-if="selectedPola"
              class="bg-cream border-2 border-sunshine/30 rounded-2xl p-5 shadow-md animate-bounce-in"
            >
              <!-- Header kartu -->
              <div class="flex items-center justify-between mb-4">
                <h2 class="font-fredoka font-bold text-base text-bark">
                  Kartu Pola Nomor {{ selectedPola.id }}
                </h2>
                <span class="w-10 h-10 rounded-full bg-sunshine text-white font-fredoka font-bold
                             text-xl flex items-center justify-center shadow-md shadow-sunshine/30">
                  {{ selectedPola.id }}
                </span>
              </div>

              <!-- Nama pola -->
              <p class="font-fredoka font-semibold text-sunshine text-sm mb-3 flex items-center gap-2">
                <span>✦</span>
                <span>{{ selectedPola.nama }}</span>
              </p>

              <!-- Deskripsi pola -->
              <div class="space-y-2 mb-4">
                <div class="bg-sky/10 rounded-xl p-3">
                  <p class="font-nunito text-xs font-bold text-sky mb-1">📋 Pola sampiran:</p>
                  <p class="font-nunito text-xs text-gray-600">{{ selectedPola.deskripsi_sampiran }}</p>
                </div>
                <div class="bg-jungle/10 rounded-xl p-3">
                  <p class="font-nunito text-xs font-bold text-jungle mb-1">💡 Pola isi:</p>
                  <p class="font-nunito text-xs text-gray-600">{{ selectedPola.deskripsi_isi }}</p>
                </div>
              </div>

              <!-- Contoh pantun -->
              <div class="bg-white/80 rounded-xl p-3 mb-3">
                <p class="font-nunito text-xs font-bold text-bark/60 mb-2">📖 Contoh:</p>
                <p
                  v-for="(baris, idx) in selectedPola.contoh"
                  :key="idx"
                  class="font-nunito text-xs italic text-bark leading-relaxed"
                  :class="idx < 2 ? 'text-sky' : 'text-jungle'"
                >
                  {{ baris }}
                </p>
              </div>

              <!-- Aturan -->
              <div class="bg-sky/5 border border-sky/20 rounded-lg p-2">
                <p class="font-nunito text-xs text-sky/80">
                  📌 <strong>Aturan:</strong> {{ selectedPola.aturan }}
                </p>
              </div>
            </div>
          </Transition>

          <!-- Panel "pola yang kamu dapatkan" di bawah -->
          <div class="mt-4 bg-white/60 border border-sunshine/20 rounded-xl px-4 py-3">
            <p class="font-nunito text-xs text-gray-400 mb-1">Pola yang kamu dapatkan:</p>
            <p class="font-nunito text-sm font-semibold" :class="selectedPola ? 'text-bark' : 'text-gray-300'">
              {{ selectedPola ? `${selectedPola.nama}` : '...' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Tombol Selanjutnya -->
      <div class="mt-8 flex items-center justify-between gap-4">
        <!-- Tombol kembali -->
        <button
          @click="navigateTo('/fenomena')"
          class="flex items-center gap-2 text-sm font-nunito font-semibold text-gray-400
                 hover:text-bark transition-colors duration-200"
        >
          <span>←</span>
          <span>Kembali</span>
        </button>

        <button
          @click="handleNext"
          class="flex items-center gap-2 font-fredoka font-bold text-lg rounded-2xl
                 px-8 py-3 transition-all duration-200"
          :class="selectedPola
            ? 'bg-sunshine text-white hover:bg-sunshine/90 shadow-lg shadow-sunshine/30 hover:-translate-y-0.5'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
          :disabled="!selectedPola"
        >
          <span>Next</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
import { useAudio }      from '~/composables/useAudio'

definePageMeta({
  pageTransition: { name: 'page', mode: 'out-in' },
})

const store = useKotakStore()
const audio = useAudio()

// Guard
onMounted(() => {
  if (!store.studentName) navigateTo('/')
  if (!store.phenomena) navigateTo('/fenomena')
})

// Fetch pola data
const { data: polaData, pending, error } = await useAsyncData(
  'pola',
  () => queryContent('/pola').findOne()
)

const polaList = computed(() => {
  if (!polaData.value) return []
  const raw = polaData.value
  if (Array.isArray(raw)) return raw
  for (const key of Object.keys(raw)) {
    if (Array.isArray(raw[key])) return raw[key]
  }
  return []
})

// State
const selectedPola = ref(store.pola ?? null)
const showManual = ref(false)
const manualPolaId = ref(store.pola?.id ?? '')

// Responsif ukuran roda
const wheelSize = ref(280)
onMounted(() => {
  const updateSize = () => {
    const w = window.innerWidth
    wheelSize.value = w < 360 ? 220 : w < 480 ? 250 : w < 640 ? 270 : 300
  }
  updateSize()
  window.addEventListener('resize', updateSize)
  onUnmounted(() => window.removeEventListener('resize', updateSize))
})

// ── Audio: tick saat roda berputar ────────────────────────
let tickInterval = null
let tickDelay = 80   // ms antar tick, makin lama makin lambat

function startSpinAudio() {
  audio.play('spin-start')
  tickDelay = 80
  scheduleNextTick()
}

function scheduleNextTick() {
  if (tickInterval) clearTimeout(tickInterval)
  // Tick makin lambat simulasi roda melambat
  tickInterval = setTimeout(() => {
    audio.play('spin-tick')
    tickDelay = Math.min(tickDelay * 1.18, 600)
    if (tickDelay < 600) scheduleNextTick()
  }, tickDelay)
}

function stopSpinAudio() {
  if (tickInterval) { clearTimeout(tickInterval); tickInterval = null }
  audio.play('spin-done')
}

onUnmounted(() => { if (tickInterval) clearTimeout(tickInterval) })

function handleSpinResult(pola) {
  selectedPola.value = pola
  manualPolaId.value = pola.id
  stopSpinAudio()
}

// SpinningWheel memanggil @spin-start saat tombol ditekan
function handleSpinStart() {
  startSpinAudio()
}

function handleManualSelect() {
  const pola = polaList.value.find((p) => p.id === Number(manualPolaId.value))
  if (pola) {
    selectedPola.value = pola
    audio.play('card-select')
  }
}

function handleNext() {
  if (!selectedPola.value) return
  audio.play('next')
  store.setPola(selectedPola.value)
  navigateTo('/rima')
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.bounce-in-enter-active {
  animation: bounceInAnim 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes bounceInAnim {
  from { transform: scale(0.85); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}
</style>
