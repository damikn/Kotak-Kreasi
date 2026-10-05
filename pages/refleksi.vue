<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-plum/5 to-cream">
    <AppHeader />
    <StageBadge route="/refleksi" />

    <main class="flex-1 px-3 sm:px-4 py-4 sm:py-6 max-w-3xl mx-auto w-full">

      <div class="flex items-start gap-2 sm:gap-3 mb-4">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-plum/20 flex items-center justify-center text-base sm:text-lg shrink-0 mt-0.5">
          🪞
        </div>
        <div class="min-w-0">
          <h1 class="font-fredoka font-bold text-xl sm:text-3xl text-plum leading-tight">
            Refleksi Belajar
          </h1>
          <p class="font-nunito text-xs sm:text-sm text-gray-500 leading-relaxed">
            Tulis pengalamanmu membuat pantun. Jawabanmu masuk ke Buku Karyaku.
          </p>
        </div>
      </div>

      <div class="rounded-2xl border-2 border-gray-100 bg-white/80 p-3 sm:p-4 space-y-4 mb-4">
        <div v-for="prompt in PROMPTS" :key="prompt.key">
          <label :for="`refleksi-${prompt.key}`" class="block font-fredoka font-bold text-sm text-bark mb-1">
            {{ prompt.label }}
          </label>
          <p class="font-nunito text-xs text-gray-400 mb-2">{{ prompt.hint }}</p>
          <textarea
            :id="`refleksi-${prompt.key}`"
            v-model="answers[prompt.key]"
            rows="3"
            maxlength="400"
            class="w-full rounded-xl border-2 border-gray-200 px-3 py-2 font-nunito text-sm text-bark
                   placeholder:text-gray-300 focus:outline-none focus:border-plum/60 focus:ring-2 focus:ring-plum/20"
            :placeholder="prompt.placeholder"
            @input="saved = false"
          />
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <button
          @click="goBack('/nilai')"
          class="flex items-center gap-2 text-sm font-nunito font-semibold text-gray-400 hover:text-bark transition-colors"
        >
          <span>←</span><span>Kembali ke Ceklist</span>
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
          Refleksimu tersimpan dan sudah masuk ke Buku Karyaku.
        </p>
      </Transition>
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
const { updateEntry } = useKaryaBook()
const { goBack } = useBackNav()

const PROMPTS = [
  {
    key: 'q1',
    label: 'Bagian mana yang paling seru saat membuat pantun?',
    hint: 'Ceritakan tahap yang paling kamu nikmati.',
    placeholder: 'Contoh: Aku suka saat memutar roda pola karena dapat pola baru…',
  },
  {
    key: 'q2',
    label: 'Apa kesulitanmu, dan bagaimana kamu mengatasinya?',
    hint: 'Menulis kesulitan membuat belajarmu lebih cepat berkembang.',
    placeholder: 'Contoh: Aku sulit mencari rima akhir, lalu aku membuka Kamus Rima…',
  },
  {
    key: 'q3',
    label: 'Apa yang ingin kamu perbaiki pada pantun berikutnya?',
    hint: 'Tulis satu target kecil untuk karya selanjutnya.',
    placeholder: 'Contoh: Aku ingin memilih kata yang lebih indah…',
  },
]

const answers = reactive({
  q1: store.refleksi?.q1 ?? '',
  q2: store.refleksi?.q2 ?? '',
  q3: store.refleksi?.q3 ?? '',
})

const saved = ref(!!(store.refleksi?.q1 || store.refleksi?.q2 || store.refleksi?.q3))

function handleSimpan() {
  store.setRefleksi(answers)
  store.markGameDone('/refleksi')
  updateEntry(store.kodeKarya, { refleksi: { ...answers } })
  saved.value = true
  audio.play('submit')
}

function handleLanjut() {
  if (!saved.value) handleSimpan()
  audio.play('next')
  navigateTo('/buku')
}
</script>

<style scoped>
.slide-up-enter-active { transition: all 0.3s ease; }
.slide-up-enter-from   { opacity: 0; transform: translateY(14px); }
</style>
