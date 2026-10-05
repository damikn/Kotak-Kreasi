<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 to-green-50">
    <AppHeader />

    <main class="flex-1 px-3 sm:px-4 py-5 sm:py-7 max-w-3xl mx-auto w-full">

      <!-- Tahap tidak dikenal -->
      <div v-if="!stage" class="text-center py-14">
        <p class="text-3xl mb-3" aria-hidden="true">🧭</p>
        <p class="font-fredoka font-bold text-lg text-bark mb-1">Tahap tidak ditemukan</p>
        <button
          class="font-nunito text-sm font-bold text-jungle underline decoration-dotted"
          @click="navigateTo('/menu')"
        >
          Kembali ke menu utama
        </button>
      </div>

      <template v-else>
        <!-- Judul tahap -->
        <div class="flex items-start gap-3 mb-3">
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shrink-0"
            :class="stage.bgClass"
          >
            <span aria-hidden="true">{{ stage.icon }}</span>
          </div>
          <div class="min-w-0">
            <p class="font-nunito text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Tahap {{ stage.stage }} dari {{ stages.length }}
            </p>
            <h1 class="font-fredoka font-bold text-xl sm:text-2xl text-bark leading-tight">
              {{ stage.label }}
            </h1>
          </div>
        </div>

        <p class="font-nunito text-xs sm:text-sm text-gray-500 leading-relaxed mb-4">
          {{ stage.detail || stage.desc }}
        </p>

        <!-- Tahap belum tersedia -->
        <div
          v-if="!stage.available"
          class="rounded-2xl border-2 border-dashed border-gray-200 bg-white/70 p-6 text-center mb-4"
        >
          <p class="text-3xl mb-2" aria-hidden="true">🚧</p>
          <p class="font-fredoka font-bold text-base text-bark mb-1">Segera hadir</p>
          <p class="font-nunito text-xs text-gray-500 leading-relaxed">
            Kegiatan pada tahap ini sedang disiapkan. Sementara itu, lanjutkan dulu tahap yang sudah terbuka ya!
          </p>
        </div>

        <!-- Daftar halaman dalam tahap -->
        <div v-else class="space-y-2.5 mb-5">
          <button
            v-for="page in stage.pages"
            :key="page.route"
            @click="handlePageClick(page)"
            class="w-full relative rounded-2xl border-2 p-3.5 sm:p-4 text-left
                   transition-all duration-200 focus:outline-none focus:ring-2"
            :class="[
              stage.bgClass, stage.borderClass, stage.focusClass,
              isPageUnlocked(page) ? 'hover:scale-[1.02] hover:shadow-md' : 'opacity-70 grayscale-[0.3]',
            ]"
            :title="isPageUnlocked(page) ? page.label : 'Selesaikan kegiatan sebelumnya terlebih dahulu'"
          >
            <span
              v-if="isPageDone(page)"
              class="absolute top-2 right-2 w-5 h-5 rounded-full bg-jungle text-white text-xs
                     flex items-center justify-center font-bold shadow"
              aria-label="Sudah selesai"
            >✓</span>
            <span
              v-else-if="!isPageUnlocked(page)"
              class="absolute top-2 right-2 w-5 h-5 rounded-full bg-gray-400/80 text-white text-xs
                     flex items-center justify-center font-bold shadow"
              aria-label="Terkunci"
            >🔒</span>

            <div class="flex items-start gap-3">
              <span class="text-2xl leading-none shrink-0" aria-hidden="true">{{ page.icon }}</span>
              <div class="min-w-0">
                <p class="font-fredoka font-bold text-sm sm:text-base leading-tight" :class="stage.textClass">
                  {{ page.label }}
                </p>
                <p class="font-nunito text-xs text-gray-500 mt-0.5 leading-snug">{{ page.desc }}</p>
              </div>
            </div>
          </button>
        </div>

        <!-- Aksi -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <button
            @click="handleBack"
            class="flex items-center gap-2 text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors"
          >
            <span>←</span><span>Kembali ke Menu Utama</span>
          </button>

          <button
            v-if="nextPage && isPageUnlocked(nextPage)"
            @click="handleNext"
            class="flex items-center gap-2 font-fredoka font-bold text-base rounded-2xl px-6 py-3
                   bg-jungle text-white hover:bg-jungle/90 shadow-lg shadow-jungle/30
                   hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>{{ nextLabel }}</span><span aria-hidden="true">→</span>
          </button>
        </div>
      </template>
    </main>

    <!-- Toast peringatan -->
    <Transition name="toast">
      <div
        v-if="toastMsg"
        class="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50
               bg-bark text-white font-nunito text-sm px-6 py-3.5
               rounded-2xl shadow-2xl flex items-center gap-2.5 max-w-sm text-center border border-white/20"
        role="alert"
      >
        <span class="text-xl">🔒</span><span>{{ toastMsg }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
import { useAudio }      from '~/composables/useAudio'
import { useStages }     from '~/composables/useStages'

definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })

const store = useKotakStore()
const audio = useAudio()
const { stages, stageById, isPageUnlocked, isPageDone, nextPageOf } = useStages()

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const stage = computed(() => stageById(slug.value))

const nextPage = computed(() => (stage.value ? nextPageOf(stage.value) : null))
const nextLabel = computed(() => (isPageDone(nextPage.value) ? 'Selesai, cek hasil' : 'Lanjutkan'))

// Guard — a single redirect, and it replaces the entry instead of pushing a new one
const { requireAll } = usePageGuard()
const { goBack }     = useBackNav()
onMounted(() => {
  requireAll([
    [store.hasIdentity, '/'],
  ])
})

const toastMsg = ref('')
let toastTimer = null

function showToast(message) {
  toastMsg.value = message
  audio.play('toast-warn')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 3000)
}

function handlePageClick(page) {
  if (!isPageUnlocked(page)) {
    showToast('Eits! Selesaikan kegiatan sebelumnya dulu ya! 😊')
    return
  }
  audio.play('card-select')
  navigateTo(page.route)
}

function handleNext() {
  if (!nextPage.value) return
  audio.play('next')
  navigateTo(nextPage.value.route)
}

function handleBack() {
  audio.play('back')
  goBack('/menu')
}

onUnmounted(() => clearTimeout(toastTimer))
</script>
