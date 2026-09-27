<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-plum/5 to-cream">
    <AppHeader />
    <StageBadge route="/buku" />

    <main class="book-page flex-1 px-3 sm:px-4 py-4 sm:py-6 max-w-3xl mx-auto w-full">

      <div class="flex items-start gap-2 sm:gap-3 mb-4 no-print">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-plum/20 flex items-center justify-center text-base sm:text-lg shrink-0 mt-0.5">
          📚
        </div>
        <div class="min-w-0">
          <h1 class="font-fredoka font-bold text-xl sm:text-3xl text-plum leading-tight">
            Buku Karyaku
          </h1>
          <p class="font-nunito text-xs sm:text-sm text-gray-500 leading-relaxed">
            Kumpulan pantun yang kamu simpan dari perangkat ini, lengkap dengan ceklist dan refleksimu.
          </p>
        </div>
      </div>

      <!-- Karya siswa -->
      <p class="font-fredoka font-bold text-sm text-bark mb-1">{{ store.studentName || 'Siswa' }}</p>

      <!-- Kosong -->
      <div v-if="!entries.length" class="rounded-2xl border-2 border-dashed border-gray-200 bg-white/70 p-6 text-center no-print">
        <p class="text-3xl mb-2" aria-hidden="true">📖</p>
        <p class="font-fredoka font-bold text-base text-bark mb-1">Buku ini masih kosong</p>
        <p class="font-nunito text-xs text-gray-500 leading-relaxed mb-3">
          Simpan satu karya dari halaman Periksa Karyamu, lalu karya itu akan muncul di sini.
        </p>
        <button
          class="font-nunito text-xs font-bold text-plum underline decoration-dotted"
          @click="navigateTo('/susun')"
        >
          Tulis pantun sekarang
        </button>
      </div>

      <!-- Daftar karya -->
      <div v-else class="space-y-4">
        <article
          v-for="(entry, index) in entries"
          :key="entry.kode || index"
          class="rounded-2xl border-2 border-plum/20 bg-white/85 p-3.5 sm:p-4 break-inside-avoid"
        >
          <header class="flex items-start justify-between gap-2 mb-2">
            <div class="min-w-0">
              <p class="font-fredoka font-bold text-sm text-bark">
                Pantun {{ index + 1 }} — {{ entry.fenomena || 'Tanpa fenomena' }}
              </p>
              <p class="font-nunito text-[11px] text-gray-400">
                {{ entry.tanggal }}<span v-if="entry.kode"> · {{ entry.kode }}</span>
              </p>
            </div>
            <span class="font-nunito text-[10px] font-bold px-2 py-0.5 rounded-full bg-plum/10 text-plum shrink-0">
              Karya {{ index + 1 }}
            </span>
          </header>

          <div class="rounded-xl bg-cream/70 border border-jungle/10 p-2.5 mb-2">
            <p
              v-for="(line, lineIndex) in entry.baris"
              :key="lineIndex"
              class="font-nunito text-sm leading-relaxed"
              :class="lineIndex < 2 ? 'text-sky italic' : 'text-jungle font-semibold'"
            >
              {{ line }}
            </p>
          </div>

          <dl class="grid gap-1.5 sm:grid-cols-2 mb-2">
            <div v-if="entry.gagasan">
              <dt class="font-nunito text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gagasan</dt>
              <dd class="font-nunito text-xs text-bark">{{ entry.gagasan }}</dd>
            </div>
            <div v-if="entry.pesan">
              <dt class="font-nunito text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pesan</dt>
              <dd class="font-nunito text-xs text-bark">{{ entry.pesan }}</dd>
            </div>
          </dl>

          <div v-if="entry.ceklist" class="mb-2">
            <p class="font-nunito text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ceklist Penilaian</p>
            <p class="font-nunito text-xs text-bark">
              {{ checkedLabels(entry.ceklist).join(' · ') || 'Belum ada yang dicentang.' }}
            </p>
          </div>

          <div v-if="entry.refleksi && (entry.refleksi.q1 || entry.refleksi.q2 || entry.refleksi.q3)">
            <p class="font-nunito text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Refleksi</p>
            <ul class="space-y-1">
              <li v-for="prompt in REFLEKSI_LABELS" :key="prompt.key" class="font-nunito text-xs text-bark">
                <span class="font-semibold">{{ prompt.short }}:</span>
                {{ entry.refleksi[prompt.key] || '—' }}
              </li>
            </ul>
          </div>

          <a
            v-if="entry.driveUrl && !entry.driveUrl.startsWith('(')"
            :href="entry.driveUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1 font-nunito text-[11px] font-semibold text-sky underline underline-offset-2 mt-2 no-print"
          >
            Lihat gambar
          </a>
        </article>
      </div>

      <!-- Aksi -->
      <div class="mt-5 flex flex-wrap items-center justify-between gap-3 no-print">
        <button
          @click="navigateTo('/refleksi')"
          class="flex items-center gap-2 text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors"
        >
          <span>←</span><span>Kembali ke Refleksi</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            v-if="entries.length"
            @click="handleClear"
            class="font-nunito text-xs font-semibold text-gray-400 hover:text-coral transition-colors"
          >
            Kosongkan buku
          </button>

          <button
            @click="handleUnduh"
            :disabled="!entries.length"
            class="flex items-center gap-2 font-fredoka font-bold text-base rounded-2xl px-6 py-3
                   transition-all duration-200"
            :class="entries.length
              ? 'bg-plum text-white hover:bg-plum/90 shadow-lg shadow-plum/30 hover:-translate-y-0.5'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
          >
            <span aria-hidden="true">⬇️</span><span>Simpan &amp; Unduh Buku Karya</span>
          </button>
        </div>
      </div>

      <p class="font-nunito text-xs text-gray-400 mt-3 leading-relaxed no-print">
        Tombol unduh membuka dialog cetak — pilih "Simpan sebagai PDF" untuk menyimpan buku karyamu.
        Buku ini tersimpan di perangkat ini, jadi jangan dihapus dulu sebelum dikumpulkan ke guru.
      </p>
    </main>
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
import { useAudio }      from '~/composables/useAudio'
import { useKaryaBook }  from '~/composables/useKaryaBook'

definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })

const store = useKotakStore()
const audio = useAudio()
const { entries, clearBook } = useKaryaBook()

const CHECKLIST_LABELS = {
  baris: 'Empat baris (sampiran & isi)',
  rima: 'Rima A-B-A-B',
  sukuKata: '8–12 suku kata',
  pesan: 'Isi sesuai fenomena & pesan',
  ejaan: 'Ejaan dan tanda baca rapi',
}

const REFLEKSI_LABELS = [
  { key: 'q1', short: 'Paling seru' },
  { key: 'q2', short: 'Kesulitan' },
  { key: 'q3', short: 'Perbaikan berikutnya' },
]

function checkedLabels(ceklist) {
  return Object.keys(ceklist).filter((key) => ceklist[key]).map((key) => CHECKLIST_LABELS[key] ?? key)
}

// Unduh = cetak halaman ini (Simpan sebagai PDF di dialog browser)
function handleUnduh() {
  if (!entries.value.length) return
  audio.play('download-done')
  window.print()
}

function handleClear() {
  if (!window.confirm('Kosongkan Buku Karyaku di perangkat ini? Tindakan ini tidak bisa dibatalkan.')) return
  clearBook()
  audio.play('back')
}

onMounted(() => {
  if (entries.value.length) store.markGameDone('/buku')
})
</script>

<style scoped>
.break-inside-avoid { break-inside: avoid; }

@media print {
  .no-print { display: none !important; }
  :deep(header), :deep(nav) { display: none !important; }
  .book-page { padding: 0 !important; max-width: none !important; }
}
</style>
