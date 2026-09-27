<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 to-sky-50">
    <AppHeader />
    <StageBadge route="/tinjau" />

    <main class="flex-1 px-3 sm:px-4 py-4 sm:py-6 max-w-4xl mx-auto w-full">

      <!-- Judul -->
      <div class="flex items-start gap-2 sm:gap-3 mb-4">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-coral/20 flex items-center justify-center text-base sm:text-lg shrink-0 mt-0.5">
          ✅
        </div>
        <div class="min-w-0">
          <h1 class="font-fredoka font-bold text-xl sm:text-3xl text-bark leading-tight">
            Periksa Karyamu!
          </h1>
          <p class="font-nunito text-xs sm:text-sm text-gray-500 leading-relaxed">
            Baca sekali lagi pantunmu, lalu simpan kalau sudah yakin.
          </p>
        </div>
      </div>

      <!-- Rangkuman -->
      <div class="rounded-2xl border-2 border-gray-100 bg-white/80 p-3 sm:p-4 mb-4">
        <div class="grid gap-2 sm:grid-cols-2">
          <div class="rounded-xl bg-cream/70 p-2.5">
            <p class="font-nunito text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nama Siswa</p>
            <p class="font-nunito text-sm font-semibold text-bark">{{ store.studentName || '—' }}</p>
          </div>
          <div class="rounded-xl bg-cream/70 p-2.5">
            <p class="font-nunito text-[11px] font-bold text-gray-400 uppercase tracking-wider">Fenomena</p>
            <p class="font-nunito text-sm font-semibold text-bark">
              {{ store.phenomena?.icon }} {{ store.phenomena?.name || '—' }}
            </p>
          </div>
          <div class="rounded-xl bg-cream/70 p-2.5">
            <p class="font-nunito text-[11px] font-bold text-gray-400 uppercase tracking-wider">Gagasan</p>
            <p class="font-nunito text-sm text-bark">{{ store.gagasan?.gagasan || '—' }}</p>
          </div>
          <div class="rounded-xl bg-cream/70 p-2.5">
            <p class="font-nunito text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pesan</p>
            <p class="font-nunito text-sm text-bark">{{ store.gagasan?.pesan || '—' }}</p>
          </div>
          <div class="rounded-xl bg-cream/70 p-2.5">
            <p class="font-nunito text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pola Pantun</p>
            <p class="font-nunito text-sm text-bark">{{ store.pola?.nama || '—' }}</p>
          </div>
          <div class="rounded-xl bg-cream/70 p-2.5">
            <p class="font-nunito text-[11px] font-bold text-gray-400 uppercase tracking-wider">Rima</p>
            <p class="font-nunito text-sm text-bark">
              A: {{ store.rima?.rimaA?.suffix || '—' }} ({{ (store.rima?.rimaA?.words ?? []).join(', ') || '—' }})
              · B: {{ store.rima?.rimaB?.suffix || '—' }} ({{ (store.rima?.rimaB?.words ?? []).join(', ') || '—' }})
            </p>
          </div>
        </div>
      </div>

      <!-- Kartu pantun final -->
      <div class="flex justify-center overflow-x-auto mb-4">
        <PantunCard
          :lines="lines"
          :student-name="store.studentName"
          :phenomena="store.phenomena?.name ?? ''"
          :pola="store.pola ? `Pola ${store.pola.id} — ${store.pola.nama}` : ''"
          :rima-a="store.rima?.rimaA"
          :rima-b="store.rima?.rimaB"
        />
      </div>

      <!-- Aksi -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          @click="navigateTo('/susun')"
          class="flex items-center gap-2 text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors"
        >
          <span>←</span><span>Kembali ke Editor Pantun</span>
        </button>

        <button
          @click="handleSimpanKarya"
          :disabled="!canSave || isSaving"
          class="flex items-center justify-center gap-2 font-fredoka font-bold text-base rounded-2xl px-6 sm:px-8 py-3
                 transition-all duration-200 w-full sm:w-auto shadow-lg"
          :class="canSave && !isSaving
            ? 'bg-jungle text-white hover:bg-jungle/90 shadow-jungle/30 hover:-translate-y-0.5'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
        >
          <template v-if="isSaving">
            <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span>Menyimpan...</span>
          </template>
          <template v-else>
            <span aria-hidden="true">💾</span><span>Simpan Karya</span>
          </template>
        </button>
      </div>

      <!-- Error simpan -->
      <Transition name="slide-up">
        <div
          v-if="saveError"
          class="mt-3 bg-coral/10 border border-coral/30 text-coral rounded-xl px-4 py-3 font-nunito text-sm flex items-start gap-2"
          role="alert"
        >
          <span aria-hidden="true">⚠️</span>
          <div>
            <strong>Gagal menyimpan:</strong> {{ saveError }}
            <br />
            <button @click="handleSimpanKarya" class="underline mt-1 text-coral hover:text-coral/70">Coba lagi</button>
          </div>
        </div>
      </Transition>

      <p class="font-nunito text-xs text-gray-400 mt-4 leading-relaxed">
        Menyimpan akan mengirim karyamu ke rekap guru beserta gambar kartu pantunnya.
      </p>
    </main>
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
import { useAudio }      from '~/composables/useAudio'
import { useKaryaBook }  from '~/composables/useKaryaBook'
import PantunCard        from '~/components/PantunCard.vue'

definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })

const store = useKotakStore()
const audio = useAudio()
const { addEntry } = useKaryaBook()

// Guard — the review page only makes sense with a complete draft
onMounted(() => {
  if (!store.studentName) navigateTo('/')
  if (!store.phenomena) navigateTo('/fenomena')
  if (!store.isStepDone(5)) navigateTo('/rima')
  if (!canSave.value) navigateTo('/susun')
})

const lines = computed(() => [
  store.pantun.baris1 ?? '',
  store.pantun.baris2 ?? '',
  store.pantun.baris3 ?? '',
  store.pantun.baris4 ?? '',
])

const canSave = computed(() => lines.value.every((line) => line.trim().length > 0))

const isSaving = ref(false)
const saveError = ref('')

async function handleSimpanKarya() {
  if (!canSave.value) return

  isSaving.value = true
  saveError.value = ''
  audio.play('save-start')

  try {
    const html2canvas = (await import('html2canvas')).default
    const el = document.getElementById('pantun-preview')
    if (!el) throw new Error('Element preview tidak ditemukan')

    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#FFFDE7', logging: false })
    const base64 = canvas.toDataURL('image/jpeg', 0.95)

    const result = await $fetch('/api/save-pantun', {
      method: 'POST',
      body: {
        studentName: store.studentName,
        phenomena:   store.phenomena?.name ?? '',
        gagasan:     store.gagasan?.gagasan ?? '',
        pesan:       store.gagasan?.pesan ?? '',
        pola:        store.pola?.nama ?? '',
        rima:        store.rima,
        pantunLines: [...lines.value],
        imageBase64: base64,
      },
    })

    store.setSavedResult(result.driveUrl ?? '', result.sessionId ?? '', result.kodeKarya ?? '', result.autoScore ?? null)
    store.setImageBase64(base64)

    // Masukkan karya ke Buku Karyaku di perangkat ini
    addEntry({
      kode: result.kodeKarya ?? '',
      nama: store.studentName,
      fenomena: store.phenomena?.name ?? '',
      gagasan: store.gagasan?.gagasan ?? '',
      pesan: store.gagasan?.pesan ?? '',
      pola: store.pola?.nama ?? '',
      baris: [...lines.value],
      driveUrl: result.driveUrl ?? '',
      ceklist: { ...(store.ceklist ?? {}) },
      refleksi: { ...(store.refleksi ?? {}) },
    })

    audio.play('save-success')
    navigateTo('/hasil')
  } catch (err) {
    console.error('Save error:', err)
    saveError.value = err?.data?.message ?? err?.message ?? 'Terjadi kesalahan tidak terduga.'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.slide-up-enter-active { transition: all 0.3s ease; }
.slide-up-enter-from   { opacity: 0; transform: translateY(14px); }
</style>
