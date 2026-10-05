<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-plum/5 to-sky-50">
    <AppHeader />
    <StageBadge route="/galeri" />

    <main class="flex-1 px-3 sm:px-4 py-4 sm:py-6 max-w-4xl mx-auto w-full">

      <div class="flex items-start gap-2 sm:gap-3 mb-2">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-plum/20 flex items-center justify-center text-base sm:text-lg shrink-0 mt-0.5">
          🖼️
        </div>
        <div class="min-w-0">
          <h1 class="font-fredoka font-bold text-xl sm:text-3xl text-plum leading-tight">
            Karya Pilihan Teman-Teman
          </h1>
          <p class="font-nunito text-xs sm:text-sm text-gray-500 leading-relaxed">
            Karya yang dipilih gurumu untuk ditampilkan. Bacalah untuk mencari ide dan membandingkan cara menulis.
          </p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="grid gap-3 sm:grid-cols-2 mt-4">
        <div v-for="i in 4" :key="i" class="h-40 rounded-2xl bg-gray-100 animate-pulse" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="mt-4 rounded-2xl border-2 border-coral/30 bg-coral/5 p-4">
        <p class="font-nunito text-sm text-coral">Galeri gagal dimuat. Coba muat ulang halaman ya.</p>
      </div>

      <!-- Kosong -->
      <div v-else-if="!works.length" class="mt-4 rounded-2xl border-2 border-dashed border-gray-200 bg-white/70 p-6 text-center">
        <p class="text-3xl mb-2" aria-hidden="true">📭</p>
        <p class="font-fredoka font-bold text-base text-bark mb-1">Belum ada karya di galeri</p>
        <p class="font-nunito text-xs text-gray-500 leading-relaxed">
          Gurumu belum memilih karya untuk ditampilkan. Sementara itu, kamu bisa melihat karya sendiri di Buku Karyaku.
        </p>
        <button
          class="mt-3 font-nunito text-xs font-bold text-plum underline decoration-dotted"
          @click="navigateTo('/buku')"
        >
          Buka Buku Karyaku
        </button>
      </div>

      <!-- Daftar karya -->
      <div v-else class="grid gap-3 sm:grid-cols-2 mt-4">
        <div
          v-for="work in works"
          :key="work.kode || work.tanggal"
          class="rounded-2xl border-2 border-plum/20 bg-white/80 p-3.5 flex flex-col"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl leading-none" aria-hidden="true">🍃</span>
            <div class="min-w-0">
              <p class="font-fredoka font-bold text-sm text-bark truncate">Karya {{ work.nama }}<span v-if="work.kelas" class="text-gray-400 font-normal"> · {{ work.kelas }}</span></p>
              <p class="font-nunito text-[11px] text-gray-400 truncate">{{ work.fenomena }}</p>
            </div>
          </div>

          <div class="rounded-xl bg-cream/70 border border-jungle/10 p-2.5 mb-2 flex-1">
            <p
              v-for="(line, index) in work.baris"
              :key="index"
              class="font-nunito text-xs leading-relaxed"
              :class="index < 2 ? 'text-sky italic' : 'text-jungle font-semibold'"
            >
              {{ line }}
            </p>
          </div>

          <button
            class="self-end font-nunito text-xs font-bold text-plum underline decoration-dotted"
            @click="openWork(work)"
          >
            Lihat Karya
          </button>
        </div>
      </div>

      <button
        @click="goBack('/tahap/evaluasi-karya')"
        class="mt-5 flex items-center gap-2 text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors"
      >
        <span>←</span><span>Kembali ke Tahap Evaluasi Karya</span>
      </button>
    </main>

    <!-- Modal lihat karya -->
    <Transition name="fade">
      <div
        v-if="selected"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bark/50 backdrop-blur-sm"
        @click.self="selected = null"
      >
        <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5">
          <div class="flex items-start justify-between gap-3 mb-3">
            <div>
              <p class="font-fredoka font-bold text-lg text-bark">Karya {{ selected.nama }}<span v-if="selected.kelas" class="text-xs text-gray-400 font-normal"> · {{ selected.kelas }}</span></p>
              <p class="font-nunito text-xs text-gray-400">{{ selected.fenomena }} · {{ selected.tanggal }}</p>
            </div>
            <button class="text-gray-400 hover:text-coral text-2xl leading-none px-1" aria-label="Tutup" @click="selected = null">×</button>
          </div>

          <div class="rounded-2xl bg-cream border-2 border-jungle/15 p-4">
            <p
              v-for="(line, index) in selected.baris"
              :key="index"
              class="font-nunito text-sm leading-relaxed"
              :class="index < 2 ? 'text-sky italic' : 'text-jungle font-semibold'"
            >
              {{ line }}
            </p>
          </div>

          <p v-if="selected.pola" class="font-nunito text-xs text-gray-500 mt-3">Pola: {{ selected.pola }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { useAudio } from '~/composables/useAudio'

definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })

const audio = useAudio()
const { goBack } = useBackNav()
const selected = ref(null)

const { data, pending, error } = await useAsyncData('karya-pilihan', () =>
  $fetch('/api/karya/pilihan').catch(() => ({ works: [] })),
)

const works = computed(() => data.value?.works ?? [])

function openWork(work) {
  selected.value = work
  audio.play('card-select')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
