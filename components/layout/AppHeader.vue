<template>
  <!-- Header aplikasi: logo kiri, nama siswa tengah/kanan, tombol mute + keluar -->
  <header class="w-full bg-white/85 backdrop-blur-md border-b border-emerald-100 shadow-sm sticky top-0 z-50">
    <div class="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">

      <!-- Logo KOTAK KREASI -->
      <NuxtLink to="/menu" class="flex items-center gap-2 shrink-0 group">
        <span class="text-xl leading-none select-none text-sunshine" aria-hidden="true">✦</span>
        <span class="font-fredoka font-bold text-xl tracking-wide">
          <span class="text-coral">K</span><span class="text-sunshine">O</span><span class="text-jungle">T</span><span
            class="text-sky">A</span><span class="text-coral">K</span>
          <span class="text-gray-300 mx-1 font-light">|</span>
          <span class="text-sky">K</span><span class="text-jungle">R</span><span class="text-sunshine">E</span><span
            class="text-coral">A</span><span class="text-sky">S</span><span class="text-jungle">I</span>
        </span>
      </NuxtLink>

      <!-- Nama siswa (hanya muncul jika sudah login) -->
      <div
        v-if="store.studentName"
        class="flex items-center gap-2 text-sm text-bark font-nunito font-semibold bg-emerald-50/80 px-3 py-1 rounded-full border border-emerald-200/50"
      >
        <span class="text-base">👤</span>
        <span class="hidden sm:inline text-gray-500">Halo,</span>
        <span class="text-jungle font-bold">{{ store.studentName }}</span>
        <span class="hidden sm:inline">👋</span>
      </div>

      <!-- Tombol kanan: Mute + Keluar -->
      <div class="flex items-center gap-2 shrink-0">

        <!-- Tombol Toggle Mute 🔊/🔇 -->
        <button
          @click="handleToggleMute"
          class="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors shrink-0"
          :class="audio.isMuted.value
            ? 'border-coral/40 bg-coral/5 text-coral hover:bg-coral/10'
            : 'border-gray-200 text-gray-600 hover:text-jungle hover:border-jungle/40'"
          :title="audio.isMuted.value ? 'Suara dimatikan — klik untuk menyalakan' : 'Suara menyala — klik untuk mematikan'"
          :aria-label="audio.isMuted.value ? 'Aktifkan suara' : 'Matikan suara'"
          :aria-pressed="audio.isMuted.value"
        >
          <!-- Ikon speaker nyala -->
          <svg v-if="!audio.isMuted.value" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
          <!-- Ikon speaker mati -->
          <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        </button>

        <!-- Tombol Keluar -->
        <button
          v-if="store.studentName"
          @click="showKeluarConfirm = true"
          class="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-coral
                border border-gray-200 hover:border-coral/40 rounded-lg px-2.5 py-1.5
                transition-colors font-nunito font-semibold"
          title="Keluar dan mulai ulang"
          aria-label="Keluar"
        >
          <span class="text-base leading-none">🏠</span>
          <span class="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </div>
  </header>

  <ConfirmDialog
    v-model="showKeluarConfirm"
    title="Keluar dari Kotak Kreasi?"
    message="Yakin ingin keluar? Progress pantunmu akan disimpan."
    confirm-text="Ya, Keluar"
    cancel-text="Tetap di Sini"
    @confirm="handleKeluar"
  />
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
import { useAudio }      from '~/composables/useAudio'

const store = useKotakStore()
const audio = useAudio()

const showKeluarConfirm = ref(false)

function handleToggleMute() {
  audio.toggleMute()
}

function handleKeluar() {
  navigateTo('/')
}
</script>