<template>
  <!-- Root layout — NuxtPage dengan transisi halaman -->
  <div class="min-h-screen font-nunito">
    <NuxtPage />
  </div>
</template>

<script setup>
// Impor font global sudah di-handle oleh @nuxtjs/google-fonts
// Tidak ada logic khusus di root app
</script>

<style>
/* Transisi halaman global */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.page-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
</style>
