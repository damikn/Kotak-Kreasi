<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-plum/5 to-emerald-50">
    <AppHeader />
    <StageBadge route="/nilai" />

    <main class="flex-1 px-3 sm:px-4 py-4 sm:py-6 max-w-3xl mx-auto w-full">

      <div class="flex items-start gap-2 sm:gap-3 mb-4">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-plum/20 flex items-center justify-center text-base sm:text-lg shrink-0 mt-0.5">
          📋
        </div>
        <div class="min-w-0">
          <h1 class="font-fredoka font-bold text-xl sm:text-3xl text-plum leading-tight">
            Ceklist Penilaian
          </h1>
          <p class="font-nunito text-xs sm:text-sm text-gray-500 leading-relaxed">
            Periksa sendiri pantunmu sebelum guru menilai. Centang yang sudah kamu penuhi.
          </p>
        </div>
      </div>

      <!-- Pantun yang dinilai -->
      <div v-if="hasPantun" class="rounded-2xl border-2 border-jungle/15 bg-cream/70 p-3 sm:p-4 mb-4">
        <p class="font-fredoka font-bold text-sm text-bark mb-2">Pantunmu</p>
        <p
          v-for="(line, index) in lines"
          :key="index"
          class="font-nunito text-sm leading-relaxed"
          :class="index < 2 ? 'text-sky italic' : 'text-jungle font-semibold'"
        >
          {{ line }}
        </p>
      </div>
      <p v-else class="rounded-2xl border-2 border-dashed border-gray-200 bg-white/70 p-4 font-nunito text-xs text-gray-500 mb-4">
        Kamu belum menulis pantun. Isi dulu di halaman Tulis Pantun, lalu kembali ke sini.
      </p>

      <!-- Ceklist -->
      <div class="rounded-2xl border-2 border-gray-100 bg-white/80 p-3 sm:p-4 mb-4">
        <ul class="space-y-2">
          <li v-for="item in CHECKLIST" :key="item.key">
            <label class="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                class="mt-0.5 w-4 h-4 accent-jungle shrink-0"
                :checked="!!checked[item.key]"
                @change="toggle(item.key, $event.target.checked)"
              />
              <span class="min-w-0">
                <span class="font-nunito text-sm font-semibold text-bark">{{ item.label }}</span>
                <span class="block font-nunito text-xs text-gray-500 leading-relaxed">{{ item.hint }}</span>
              </span>
            </label>
          </li>
        </ul>

        <p class="font-nunito text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
          Tercentang <span class="font-bold text-jungle">{{ checkedCount }}</span> dari {{ CHECKLIST.length }}.
          Ceklist ini untuk menilai dirimu sendiri — penilaian akhir tetap dari guru.
        </p>
      </div>

      <!-- Aksi -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <button
          @click="navigateTo('/galeri')"
          class="flex items-center gap-2 text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors"
        >
          <span>←</span><span>Lihat Galeri</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            @click="handleSimpan"
            class="font-fredoka font-bold text-base rounded-2xl px-6 py-3 border-2
                   border-plum/40 text-plum bg-white hover:bg-plum/10 transition-all duration-200"
          >
            Simpan
          </button>

          <button
            @click="handleLanjut"
            class="flex items-center gap-2 font-fredoka font-bold text-base rounded-2xl px-6 py-3
                   bg-jungle text-white hover:bg-jungle/90 shadow-lg shadow-jungle/30
                   hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Lanjutkan</span><span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <Transition name="slide-up">
        <p
          v-if="saved"
          class="mt-3 bg-jungle/10 border border-jungle/30 text-jungle rounded-xl px-4 py-2.5 font-nunito text-sm"
          role="status"
        >
          Ceklist tersimpan. Jawabanmu ikut masuk ke Buku Karyaku.
        </p>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { useKotakStore }  from '~/composables/useKotakStore'
import { useAudio }       from '~/composables/useAudio'
import { useKaryaBook }   from '~/composables/useKaryaBook'

definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })

const store = useKotakStore()
const audio = useAudio()
const { updateEntry } = useKaryaBook()

const CHECKLIST = [
  { key: 'baris',     label: 'Empat baris, dua sampiran dan dua isi',      hint: 'Baris 1–2 sampiran, baris 3–4 isi pantun.' },
  { key: 'rima',      label: 'Rima akhir sama (A-B-A-B)',                  hint: 'Bunyi akhir baris 1 = baris 3, dan baris 2 = baris 4.' },
  { key: 'sukuKata',  label: 'Setiap baris 8–12 suku kata',                hint: 'Cukup panjang agar enak dibaca, tidak terlalu pendek.' },
  { key: 'pesan',     label: 'Isi sesuai fenomena dan pesan yang dipilih', hint: 'Pantunmu benar-benar membahas fenomena dan pesanmu.' },
  { key: 'ejaan',     label: 'Ejaan dan tanda baca rapi',                  hint: 'Huruf kapital di awal baris, koma di akhir baris.' },
]

const lines = computed(() => [
  store.pantun.baris1 ?? '',
  store.pantun.baris2 ?? '',
  store.pantun.baris3 ?? '',
  store.pantun.baris4 ?? '',
])
const hasPantun = computed(() => lines.value.some((line) => line.trim().length > 0))

const checked = ref({ ...(store.ceklist ?? {}) })
const saved = ref(Object.keys(store.ceklist ?? {}).length > 0)
const checkedCount = computed(() => CHECKLIST.filter((item) => checked.value[item.key]).length)

function toggle(key, value) {
  checked.value = { ...checked.value, [key]: value }
  saved.value = false
}

function handleSimpan() {
  store.setCeklist(checked.value)
  store.markGameDone('/nilai')
  updateEntry(store.kodeKarya, { ceklist: { ...checked.value } })
  saved.value = true
  audio.play('submit')
}

function handleLanjut() {
  if (!saved.value) handleSimpan()
  audio.play('next')
  navigateTo('/refleksi')
}
</script>

<style scoped>
.slide-up-enter-active { transition: all 0.3s ease; }
.slide-up-enter-from   { opacity: 0; transform: translateY(14px); }
</style>
