<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 to-sky-50">
    <AppHeader />
    <StageBadge route="/gagasan" />
    <StepBreadcrumb :current-step="3" />

    <main class="flex-1 px-3 sm:px-4 py-4 sm:py-6 max-w-3xl mx-auto w-full">

      <!-- Judul -->
      <div class="flex items-start gap-2 sm:gap-3 mb-4">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-jungle/20 flex items-center justify-center text-base sm:text-lg shrink-0 mt-0.5">
          💡
        </div>
        <div class="min-w-0">
          <h1 class="font-fredoka font-bold text-xl sm:text-3xl text-jungle leading-tight">
            Ayo Tentukan Gagasan dan Pesannya!
          </h1>
          <p class="font-nunito text-xs sm:text-sm text-gray-500 leading-relaxed">
            Tuliskan gagasan dan pesan dari fenomena yang kamu pilih. Keduanya akan menjadi isi pantunmu.
          </p>
        </div>
      </div>

      <!-- Konteks fenomena -->
      <div class="rounded-2xl border-2 border-sky/20 bg-white/70 p-3 sm:p-4 mb-4">
        <p class="font-nunito font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">
          Fenomena yang dipilih:
        </p>
        <div class="flex items-start gap-3">
          <span class="text-2xl leading-none shrink-0" aria-hidden="true">{{ selected?.icon }}</span>
          <div class="min-w-0">
            <p class="font-fredoka font-bold text-base text-bark">{{ selected?.name }}</p>
            <p class="font-nunito text-xs text-gray-500 leading-relaxed mt-1">{{ selected?.contoh }}</p>
          </div>
        </div>
      </div>

      <!-- Form gagasan & pesan -->
      <div class="rounded-2xl border-2 border-jungle/20 bg-white/80 p-3 sm:p-4 space-y-4">
        <div>
          <label for="gagasan-input" class="block font-fredoka font-bold text-sm text-bark mb-1">
            Fenomena ini tentang apa?
          </label>
          <p class="font-nunito text-xs text-gray-400 mb-2">
            Tuliskan gagasan utamanya dengan satu kalimat singkat.
          </p>
          <textarea
            id="gagasan-input"
            v-model="gagasan"
            rows="3"
            maxlength="180"
            class="w-full rounded-xl border-2 px-3 py-2 font-nunito text-sm text-bark
                   placeholder:text-gray-300 focus:outline-none focus:ring-2 transition-colors"
            :class="gagasanError
              ? 'border-coral focus:ring-coral/40'
              : 'border-gray-200 focus:border-jungle/60 focus:ring-jungle/30'"
            placeholder="Contoh: Seorang siswa terlalu lama bermain gawai sampai lupa belajar."
            @input="saved = false"
          />
          <p v-if="gagasanError" class="font-nunito text-xs text-coral mt-1">{{ gagasanError }}</p>
        </div>

        <div>
          <label for="pesan-input" class="block font-fredoka font-bold text-sm text-bark mb-1">
            Apa pesan yang ingin disampaikan?
          </label>
          <p class="font-nunito text-xs text-gray-400 mb-2">
            Tuliskan pesan atau amanat yang ingin kamu sampaikan kepada pembaca.
          </p>
          <textarea
            id="pesan-input"
            v-model="pesan"
            rows="3"
            maxlength="180"
            class="w-full rounded-xl border-2 px-3 py-2 font-nunito text-sm text-bark
                   placeholder:text-gray-300 focus:outline-none focus:ring-2 transition-colors"
            :class="pesanError
              ? 'border-coral focus:ring-coral/40'
              : 'border-gray-200 focus:border-jungle/60 focus:ring-jungle/30'"
            placeholder="Contoh: Gunakan waktu dengan bijak agar belajar tidak terlupa."
            @input="saved = false"
          />
          <p v-if="pesanError" class="font-nunito text-xs text-coral mt-1">{{ pesanError }}</p>
        </div>

        <!-- Aksi -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            @click="handleBack"
            class="flex items-center gap-2 text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors"
          >
            <span>←</span><span>Kembali</span>
          </button>

          <div class="flex items-center gap-2">
            <button
              @click="handleSimpan"
              class="font-fredoka font-bold text-base rounded-2xl px-6 py-3 border-2
                     border-jungle/40 text-jungle bg-white hover:bg-jungle/10
                     transition-all duration-200"
            >
              Simpan
            </button>

            <button
              @click="handleLanjut"
              class="flex items-center gap-2 font-fredoka font-bold text-base rounded-2xl px-6 py-3
                     transition-all duration-200"
              :class="saved
                ? 'bg-jungle text-white hover:bg-jungle/90 shadow-lg shadow-jungle/30 hover:-translate-y-0.5'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
              :disabled="!saved"
            >
              <span>Lanjutkan</span><span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Ringkasan -->
      <Transition name="slide-up">
        <div
          v-if="saved && store.gagasan.pesan"
          class="mt-4 rounded-2xl border-2 border-jungle/30 bg-cream p-3 sm:p-4"
        >
          <p class="font-fredoka font-bold text-sm text-bark mb-2">Gagasan dan Pesan</p>
          <div class="space-y-2">
            <div>
              <p class="font-nunito text-[11px] font-bold text-gray-400 uppercase tracking-wider">Gagasan</p>
              <p class="font-nunito text-sm text-bark leading-relaxed">{{ store.gagasan.gagasan }}</p>
            </div>
            <div>
              <p class="font-nunito text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pesan</p>
              <p class="font-nunito text-sm text-bark leading-relaxed">{{ store.gagasan.pesan }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
import { useAudio }      from '~/composables/useAudio'

definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })

const store = useKotakStore()
const audio = useAudio()

// Guard
onMounted(() => {
  if (!store.studentName) navigateTo('/')
  if (!store.phenomena) navigateTo('/fenomena')
})

const { data: phenomenaData } = await useAsyncData(
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

// ── Form state ────────────────────────────────────────────
// Prefilled from the phenomenon's data so the learner has a starting example,
// then fully editable. A saved value in the store always wins.
const gagasan = ref(store.gagasan?.gagasan || '')
const pesan   = ref(store.gagasan?.pesan || '')
const saved   = ref(!!(store.gagasan?.gagasan && store.gagasan?.pesan))

const MIN_LENGTH = 10

const gagasanError = computed(() => {
  const v = gagasan.value.trim()
  if (!v) return ''
  return v.length < MIN_LENGTH ? `Tuliskan minimal ${MIN_LENGTH} karakter.` : ''
})

const pesanError = computed(() => {
  const v = pesan.value.trim()
  if (!v) return ''
  return v.length < MIN_LENGTH ? `Tuliskan minimal ${MIN_LENGTH} karakter.` : ''
})

const isValid = computed(() =>
  gagasan.value.trim().length >= MIN_LENGTH && pesan.value.trim().length >= MIN_LENGTH,
)

// Prefill only when the learner has not written anything yet.
watch(selected, (p) => {
  if (!p) return
  if (!gagasan.value && p.gagasan) gagasan.value = p.gagasan
  if (!pesan.value && p.pesan) pesan.value = p.pesan
}, { immediate: true })

function handleSimpan() {
  if (!isValid.value) {
    audio.play('toast-warn')
    return
  }
  audio.play('submit')
  store.setGagasan({ gagasan: gagasan.value.trim(), pesan: pesan.value.trim() })
  saved.value = true
}

function handleLanjut() {
  if (!isValid.value) {
    audio.play('toast-warn')
    return
  }
  if (!saved.value) handleSimpan()
  audio.play('next')
  navigateTo('/pola')
}

function handleBack() {
  audio.play('back')
  navigateTo('/cocokkan')
}
</script>

<style scoped>
.slide-up-enter-active { transition: all 0.3s ease; }
.slide-up-enter-from   { opacity: 0; transform: translateY(14px); }
</style>
