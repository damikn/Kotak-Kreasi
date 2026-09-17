<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 to-green-50">
    <AppHeader />
    <StepBreadcrumb :current-step="1" />

    <main class="flex-1 px-3 sm:px-4 py-4 sm:py-6 max-w-4xl mx-auto w-full">

      <!-- Judul -->
      <div class="flex items-start gap-2 sm:gap-3 mb-2">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky/20 flex items-center justify-center text-base sm:text-lg shrink-0 mt-0.5">🔍</div>
        <div class="min-w-0">
          <h1 class="font-fredoka font-bold text-xl sm:text-3xl text-sky leading-tight">Eksplorasi Fenomena</h1>
          <p class="font-nunito text-xs sm:text-sm text-gray-500 leading-relaxed">
            Pilih salah satu fenomena yang menarik perhatianmu! Fenomena ini akan menjadi tema isi pantunmu.
          </p>
        </div>
      </div>
      <p class="font-nunito text-xs text-bark/50 italic mb-4 ml-1">
        "Lihat sekelilingmu, banyak cerita yang bisa menjadi pantun yang bermakna."
      </p>

      <!-- Loading Skeleton -->
      <div v-if="pending" class="phenomena-grid mb-4">
        <div v-for="i in 10" :key="i" class="aspect-square rounded-xl bg-gray-100 animate-pulse" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-10">
        <p class="text-coral font-nunito text-sm">Gagal memuat data. Coba muat ulang halaman.</p>
      </div>

      <template v-else>
        <!-- Grid kartu fenomena responsif -->
        <div class="phenomena-grid mb-4">
          <PhenomenaCard
            v-for="item in phenomenaList"
            :key="item.id"
            :phenomena="item"
            :selected="selectedId === item.id"
            @select="handleSelect"
          />
        </div>

        <!-- Panel preview fenomena yang dipilih -->
        <div
          class="rounded-2xl border-2 p-3 sm:p-4 transition-all duration-300 mb-4"
          :class="selectedFenomena ? 'bg-cream border-jungle/30 shadow-md' : 'bg-white/60 border-gray-100'"
        >
          <p class="font-nunito font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">
            Fenomena yang kamu pilih:
          </p>

          <!-- Belum dipilih -->
          <div v-if="!selectedFenomena" class="flex items-center gap-3 py-1">
            <span class="text-3xl text-gray-200 shrink-0" aria-hidden="true">❓</span>
            <p class="font-nunito text-sm text-gray-300">Belum ada fenomena yang dipilih.</p>
          </div>

          <!-- Sudah dipilih -->
          <Transition name="scale-in">
            <div v-if="selectedFenomena" class="flex items-start gap-3">
              <span class="text-3xl sm:text-4xl shrink-0" aria-hidden="true">{{ selectedFenomena.icon }}</span>
              <div class="min-w-0 flex-1">
                <h3 class="font-fredoka font-bold text-sm sm:text-base text-bark leading-tight mb-1">
                  {{ selectedFenomena.name }}
                </h3>
                <!-- Deskripsi penuh, TIDAK di-truncate -->
                <p class="font-nunito text-xs text-gray-500 leading-relaxed">
                  {{ selectedFenomena.description }}
                </p>
              </div>
            </div>
          </Transition>
        </div>
      </template>

      <!-- Navigasi -->
      <div class="flex items-center justify-between gap-3">
        <button
          @click="navigateTo('/menu')"
          class="text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors flex items-center gap-1"
        >
          <span>←</span><span>Kembali ke Menu</span>
        </button>
        <button
          @click="handleNext"
          class="flex items-center gap-2 font-fredoka font-bold text-base sm:text-lg rounded-2xl px-5 sm:px-8 py-2.5 sm:py-3 transition-all duration-200"
          :class="selectedFenomena
            ? 'bg-jungle text-white hover:bg-jungle/90 shadow-lg shadow-jungle/30 hover:-translate-y-0.5'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
          :disabled="!selectedFenomena"
        >
          <span>Pilih &amp; Lanjut</span><span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
import { useAudio }      from '~/composables/useAudio'

definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })
const store = useKotakStore()
const audio = useAudio()

onMounted(() => { if (!store.studentName) navigateTo('/') })

const { data: phenomenaData, pending, error } = await useAsyncData('phenomena', () => queryContent('/phenomena').findOne())

const phenomenaList = computed(() => {
  if (!phenomenaData.value) return []
  const raw = phenomenaData.value
  if (Array.isArray(raw)) return raw
  for (const key of Object.keys(raw)) { if (Array.isArray(raw[key])) return raw[key] }
  return []
})

const selectedId = ref(store.phenomena?.id ?? null)
const selectedFenomena = computed(() => phenomenaList.value.find((p) => p.id === selectedId.value) ?? null)

function handleSelect(item) {
  selectedId.value = item.id
  audio.play('card-select')
}

function handleNext() {
  if (!selectedFenomena.value) return
  audio.play('next')
  store.setPhenomena(selectedFenomena.value)
  navigateTo('/pola')
}
</script>

<style scoped>
/* Grid responsif fenomena */
.phenomena-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 480px) {
  .phenomena-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 640px) {
  .phenomena-grid {
    gap: 0.75rem;
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .phenomena-grid { grid-template-columns: repeat(5, 1fr); }
}

.scale-in-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-in-enter-from {
  transform: scale(0.9);
  opacity: 0;
}
</style>