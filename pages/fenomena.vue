<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 to-green-50">
    <AppHeader />
    <StepBreadcrumb :current-step="1" />

    <main class="flex-1 px-3 sm:px-4 py-4 sm:py-6 max-w-4xl mx-auto w-full">

      <!-- Judul -->
      <div class="flex items-center gap-2 mb-1">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky/20 flex items-center justify-center text-lg shrink-0">🔍
        </div>
        <div>
          <h1 class="font-fredoka font-bold text-xl sm:text-3xl text-sky leading-tight">Eksplorasi Fenomena</h1>
          <p class="font-nunito text-xs sm:text-sm text-gray-500">Pilih salah satu fenomena yang menarik perhatianmu!
          </p>
        </div>
      </div>
      <p class="font-nunito text-xs text-bark/50 italic mb-4 ml-1">
        "Lihat sekelilingmu, banyak cerita yang bisa menjadi pantun."
      </p>

      <!-- Loading -->
      <div v-if="pending" class="phenomena-grid">
        <div v-for="i in 10" :key="i" class="aspect-square rounded-xl bg-gray-100 animate-pulse" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-10">
        <p class="text-coral font-nunito text-sm">Gagal memuat data. Coba refresh halaman.</p>
      </div>

      <template v-else>
        <!-- Grid kartu fenomena: responsif sesuai ukuran layar -->
        <div class="phenomena-grid mb-4">
          <PhenomenaCard v-for="item in phenomenaList" :key="item.id" :phenomena="item"
            :selected="selectedId === item.id" @select="handleSelect" />
        </div>

        <!-- Panel preview -->
        <div class="rounded-2xl border-2 p-3 sm:p-4 transition-all duration-300 mb-4"
          :class="selectedFenomena ? 'bg-cream border-jungle/30 shadow-md' : 'bg-white/60 border-gray-100'">
          <p class="font-nunito font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">
            Fenomena yang kamu pilih:
          </p>

          <!-- Belum dipilih -->
          <div v-if="!selectedFenomena" class="flex items-center gap-3 py-1">
            <span class="text-3xl text-gray-200" aria-hidden="true">❓</span>
            <p class="font-nunito text-sm text-gray-300">Belum ada fenomena yang dipilih.</p>
          </div>

          <!-- Sudah dipilih -->
          <Transition name="scale-in">
            <div v-if="selectedFenomena" class="flex items-start gap-3">
              <span class="text-3xl shrink-0" aria-hidden="true">{{ selectedFenomena.icon }}</span>
              <div class="min-w-0">
                <h3 class="font-fredoka font-bold text-sm sm:text-base text-bark leading-tight mb-1">
                  {{ selectedFenomena.name }}
                </h3>
                <p class="font-nunito text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {{ selectedFenomena.description }}
                </p>
              </div>
            </div>
          </Transition>
        </div>
      </template>

      <!-- Navigasi -->
      <div class="flex items-center justify-between gap-3">
        <button @click="navigateTo('/menu')"
          class="text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors flex items-center gap-1">
          <span>←</span><span>Kembali</span>
        </button>
        <button @click="handleNext"
          class="flex items-center gap-2 font-fredoka font-bold text-base sm:text-lg rounded-2xl px-6 sm:px-8 py-2.5 sm:py-3 transition-all duration-200"
          :class="selectedFenomena
            ? 'bg-jungle text-white hover:bg-jungle/90 shadow-lg shadow-jungle/30 hover:-translate-y-0.5'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'" :disabled="!selectedFenomena">
          <span>Next</span><span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })
const store = useKotakStore()
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
function handleSelect(item) { selectedId.value = item.id }
function handleNext() {
  if (!selectedFenomena.value) return
  store.setPhenomena(selectedFenomena.value)
  navigateTo('/pola')
}
</script>

<style scoped>
/* Grid responsif: bypass Tailwind JIT agar pasti bekerja */
.phenomena-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(2, 1fr);
  /* default: 2 kolom (HP kecil) */
}

@media (min-width: 480px) {
  .phenomena-grid {
    grid-template-columns: repeat(3, 1fr);
    /* 480px ke atas: 3 kolom */
  }
}

@media (min-width: 640px) {
  .phenomena-grid {
    gap: 0.5rem;
    grid-template-columns: repeat(4, 1fr);
    /* 640px ke atas: 4 kolom */
  }
}

@media (min-width: 1024px) {
  .phenomena-grid {
    grid-template-columns: repeat(5, 1fr);
    /* desktop: 5 kolom */
  }
}

.scale-in-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-in-enter-from {
  transform: scale(0.9);
  opacity: 0;
}
</style>