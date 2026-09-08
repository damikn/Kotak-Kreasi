<template>
  <!-- Halaman error global Nuxt -->
  <div
    class="min-h-screen flex flex-col items-center justify-center px-4 text-center"
    style="background: linear-gradient(180deg, #87CEEB 0%, #E8F5E9 100%)"
  >
    <!-- Ikon -->
    <div class="text-6xl mb-4" aria-hidden="true">
      {{ error?.statusCode === 404 ? '🗺️' : '⚠️' }}
    </div>

    <h1 class="font-fredoka font-bold text-4xl text-bark mb-2">
      {{ error?.statusCode === 404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan' }}
    </h1>

    <p class="font-nunito text-base text-gray-600 mb-2 max-w-sm">
      {{ error?.statusCode === 404
        ? 'Halaman yang kamu cari tidak ada atau sudah dipindahkan.'
        : error?.statusMessage ?? 'Terjadi kesalahan tak terduga. Coba muat ulang halaman.'
      }}
    </p>

    <p class="font-nunito text-sm text-gray-400 mb-8">
      Kode: {{ error?.statusCode ?? 'Unknown' }}
    </p>

    <button
      @click="handleError"
      class="bg-jungle hover:bg-jungle/90 text-white font-fredoka font-bold text-lg
             rounded-2xl px-8 py-3 shadow-lg shadow-jungle/30 transition-all duration-200
             hover:-translate-y-0.5"
    >
      🏠 Kembali ke Beranda
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object,
})

function handleError() {
  clearError({ redirect: '/' })
}
</script>
