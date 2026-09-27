<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-sunshine/5 to-sky-50">
    <AppHeader />
    <StageBadge route="/amati" />

    <main class="flex-1 px-3 sm:px-4 py-4 sm:py-6 max-w-4xl mx-auto w-full">

      <div class="flex items-start gap-2 sm:gap-3 mb-2">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sunshine/20 flex items-center justify-center text-base sm:text-lg shrink-0 mt-0.5">
          👀
        </div>
        <div class="min-w-0">
          <h1 class="font-fredoka font-bold text-xl sm:text-3xl text-sunshine leading-tight">
            Amati Fenomenanya!
          </h1>
          <p class="font-nunito text-xs sm:text-sm text-gray-500 leading-relaxed">
            Sebelum menulis, lihat contoh berikut: satu fenomena bisa menjadi gagasan, pesan, dan pantun.
          </p>
        </div>
      </div>

      <!-- Pilih contoh fenomena -->
      <div class="flex flex-wrap items-center gap-2 mb-4 mt-3">
        <span class="font-nunito text-xs text-bark/60">Contoh fenomena:</span>
        <button
          v-for="item in phenomenaList"
          :key="item.slug"
          type="button"
          class="rounded-full px-3 py-1.5 border-2 font-nunito text-xs font-semibold transition-all duration-200"
          :class="item.slug === example?.slug
            ? 'bg-sunshine/15 border-sunshine text-sunshine'
            : 'bg-white border-gray-200 text-gray-500 hover:border-sunshine/40'"
          @click="exampleSlug = item.slug"
        >
          {{ item.icon }} {{ shortName(item.name) }}
        </button>
      </div>

      <div v-if="pending" class="grid gap-3 sm:grid-cols-2">
        <div v-for="i in 4" :key="i" class="h-32 rounded-2xl bg-gray-100 animate-pulse" />
      </div>

      <template v-else-if="example">
        <div class="grid gap-3 sm:grid-cols-2">
          <!-- 1. Fenomena -->
          <div class="rounded-2xl border-2 border-sky/25 bg-white/80 p-3.5">
            <p class="font-nunito text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">1. Fenomena</p>
            <div class="flex items-start gap-2.5">
              <span class="text-3xl leading-none shrink-0" aria-hidden="true">{{ example.icon }}</span>
              <div class="min-w-0">
                <p class="font-fredoka font-bold text-sm text-bark">{{ example.name }}</p>
                <p class="font-nunito text-xs text-gray-500 leading-relaxed mt-1">{{ example.description }}</p>
              </div>
            </div>
          </div>

          <!-- 2. Gagasan -->
          <div class="rounded-2xl border-2 border-lagoon/25 bg-white/80 p-3.5">
            <p class="font-nunito text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">2. Gagasan</p>
            <p class="font-nunito text-sm text-bark leading-relaxed">{{ example.gagasan || example.contoh }}</p>
          </div>

          <!-- 3. Pesan -->
          <div class="rounded-2xl border-2 border-jungle/25 bg-white/80 p-3.5">
            <p class="font-nunito text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">3. Pesan</p>
            <p class="font-nunito text-sm text-bark leading-relaxed">{{ example.pesan }}</p>
          </div>

          <!-- 4. Contoh pantun -->
          <div class="rounded-2xl border-2 border-coral/25 bg-cream/80 p-3.5">
            <p class="font-nunito text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">4. Contoh Pantun</p>
            <p
              v-for="(line, index) in example.pantun ?? []"
              :key="index"
              class="font-nunito text-sm leading-relaxed"
              :class="index < 2 ? 'text-sky italic' : 'text-jungle font-semibold'"
            >
              {{ line }}
            </p>
            <p class="font-nunito text-[11px] text-gray-400 mt-2">
              Baris 1–2 sampiran, baris 3–4 isi. Perhatikan bunyi akhirnya.
            </p>
          </div>
        </div>

        <!-- Aksi -->
        <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            @click="navigateTo('/tahap/peta-ide-materi')"
            class="flex items-center gap-2 text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors"
          >
            <span>←</span><span>Kembali ke Tahap Peta Ide Materi</span>
          </button>

          <button
            @click="handleNext"
            class="flex items-center gap-2 font-fredoka font-bold text-base rounded-2xl px-6 py-3
                   bg-sunshine text-white hover:bg-sunshine/90 shadow-lg shadow-sunshine/30
                   hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Lanjutkan</span><span aria-hidden="true">→</span>
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
import { useAudio }      from '~/composables/useAudio'

definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })

const store = useKotakStore()
const audio = useAudio()

const { data: phenomenaData, pending } = await useAsyncData('phenomena', () => queryContent('/phenomena').findOne())

const phenomenaList = computed(() => {
  const raw = phenomenaData.value
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  for (const key of Object.keys(raw)) { if (Array.isArray(raw[key])) return raw[key] }
  return []
})

// Mulai dari fenomena yang sudah dipilih siswa (kalau ada), kalau belum pakai contoh pertama.
const exampleSlug = ref(store.phenomena?.slug ?? '')

const example = computed(() => {
  if (exampleSlug.value) {
    const found = phenomenaList.value.find((item) => item.slug === exampleSlug.value)
    if (found) return found
  }
  return phenomenaList.value[0] ?? null
})

function shortName(name) {
  return String(name ?? '').replace(/\?$/, '')
}

function handleNext() {
  store.markGameDone('/amati')
  audio.play('next')
  navigateTo('/fenomena')
}
</script>
