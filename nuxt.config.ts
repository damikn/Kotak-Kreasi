// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  // Gunakan Nuxt 3 style folder (bukan app/ subfolder)
  srcDir: '.',

  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/google-fonts',
    'nuxt-icon',
    '@vueuse/nuxt',
  ],

  googleFonts: {
    families: {
      Fredoka: [400, 600, 700],
      Nunito: [400, 500, 600, 700, 800],
    },
    display: 'swap',
    preload: true,
  },

  content: {
    // Aktifkan query content dari folder /content
  },

  runtimeConfig: {
    // Server-only (private)
    googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
    googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    googleSheetsId: process.env.GOOGLE_SHEETS_ID,
    guruPin: process.env.GURU_PIN || '',
  },

  app: {
    head: {
      title: 'Kotak Kreasi — Platform Belajar Pantun',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Platform pembelajaran pantun interaktif untuk siswa SMP/SMA.',
        },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  css: ['~/assets/css/main.css'],

  piniaPluginPersistedstate: {
    storage: 'localStorage',
  },

  // Note: Error "Failed to resolve import #app-manifest" adalah warning internal
  // Vite 7 + Nuxt 3.13 yang tidak mempengaruhi fungsi aplikasi.
  // Akan diperbaiki di Nuxt versi berikutnya.
})
