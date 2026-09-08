<template>
  <!-- Header aplikasi: logo kiri, nama siswa tengah/kanan, tombol keluar -->
  <header class="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm sticky top-0 z-50">
    <div class="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-3">

      <!-- Logo KOTAK KREASI -->
      <NuxtLink to="/menu" class="flex items-center gap-2 shrink-0 group">
        <span class="text-xl leading-none select-none" aria-hidden="true">✦</span>
        <span class="font-fredoka font-bold text-xl tracking-wide">
          <span class="text-coral">K</span><span class="text-sunshine">O</span><span class="text-jungle">T</span><span
            class="text-sky">A</span><span class="text-coral">K</span>
          <span class="text-gray-400 mx-1 font-light">|</span>
          <span class="text-sky">K</span><span class="text-jungle">R</span><span class="text-sunshine">E</span><span
            class="text-coral">A</span><span class="text-sky">S</span><span class="text-jungle">I</span>
        </span>
      </NuxtLink>

      <!-- Nama siswa (hanya muncul jika sudah login) -->
      <div v-if="store.studentName" class="flex items-center gap-2 text-sm text-bark font-nunito font-semibold">
        <span class="text-base">👤</span>
        <span class="hidden sm:inline">Halo,</span>
        <span class="text-jungle">{{ store.studentName }}</span>
        <span class="hidden sm:inline">👋</span>
      </div>

      <!-- Tombol Keluar -->
      <button v-if="store.studentName" @click="handleKeluar" class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-coral
               border border-gray-200 hover:border-coral/40 rounded-lg px-3 py-1.5
               transition-all duration-200 font-nunito font-semibold shrink-0" title="Keluar dan mulai ulang"
        aria-label="Keluar">
        <span class="text-base leading-none">🏠</span>
        <span class="hidden sm:inline">Keluar</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'

const store = useKotakStore()
const router = useRouter()

function handleKeluar() {
  if (confirm('Yakin ingin keluar? Progress pantunmu akan disimpan.')) {
    navigateTo('/')
  }
}
</script>
