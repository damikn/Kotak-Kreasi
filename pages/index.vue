<template>
  <!-- =====================================================
       HALAMAN AWAL
       KOTAK KREASI — MAGICAL FOREST
       ===================================================== -->

  <div class="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-8 forest-page"
    style="background: linear-gradient(180deg, #87CEEB 0%, #b8e4b8 55%, #E8F5E9 100%)">

    <!-- =====================================================
         MATAHARI
         ===================================================== -->

    <div class="absolute top-8 right-8 sm:top-12 sm:right-16
             w-16 h-16 sm:w-20 sm:h-20
             rounded-full bg-sunshine/70
             sun-glow pointer-events-none" aria-hidden="true"></div>


    <!-- =====================================================
         AWAN
         ===================================================== -->

    <div class="absolute top-0 left-0 right-0
             pointer-events-none overflow-hidden" aria-hidden="true">

      <!-- Awan 1 -->
      <svg class="absolute top-6 left-4 opacity-80 animate-float" style="animation-delay:0s" width="140" height="60"
        viewBox="0 0 140 60">
        <ellipse cx="70" cy="40" rx="70" ry="28" fill="white" />

        <ellipse cx="50" cy="30" rx="38" ry="28" fill="white" />

        <ellipse cx="90" cy="28" rx="32" ry="24" fill="white" />
      </svg>


      <!-- Awan 2 -->
      <svg class="absolute top-10 right-10 opacity-70 animate-float" style="animation-delay:1.2s" width="110"
        height="48" viewBox="0 0 110 48">
        <ellipse cx="55" cy="32" rx="55" ry="22" fill="white" />

        <ellipse cx="38" cy="24" rx="30" ry="22" fill="white" />

        <ellipse cx="74" cy="22" rx="26" ry="20" fill="white" />
      </svg>


      <!-- Awan 3 -->
      <svg class="absolute top-20 left-1/3 opacity-60 animate-float" style="animation-delay:0.7s" width="90" height="40"
        viewBox="0 0 90 40">
        <ellipse cx="45" cy="28" rx="45" ry="18" fill="white" />

        <ellipse cx="30" cy="20" rx="25" ry="18" fill="white" />

        <ellipse cx="62" cy="18" rx="22" ry="16" fill="white" />
      </svg>

    </div>


    <!-- =====================================================
         BURUNG TERBANG
         ===================================================== -->

    <div class="forest-bird bird-flight" aria-hidden="true">
      🐦
    </div>


    <!-- =====================================================
         KUNANG-KUNANG
         ===================================================== -->

    <div class="fireflies pointer-events-none" aria-hidden="true">

      <span class="firefly f1">✦</span>
      <span class="firefly f2">✦</span>
      <span class="firefly f3">✦</span>
      <span class="firefly f4">✦</span>
      <span class="firefly f5">✦</span>
      <span class="firefly f6">✦</span>

    </div>


    <!-- =====================================================
         POHON KIRI
         ===================================================== -->

    <div class="absolute left-0 bottom-20
             sm:bottom-24
             -translate-x-5 sm:translate-x-0
             pointer-events-none
             select-none
             tree-sway" aria-hidden="true">

      <div class="text-[100px] sm:text-[130px] leading-none">
        🌳
      </div>

    </div>


    <!-- =====================================================
         POHON KANAN
         ===================================================== -->

    <div class="absolute right-0 bottom-20
             sm:bottom-24
             translate-x-5 sm:translate-x-0
             pointer-events-none
             select-none
             tree-sway tree-right" aria-hidden="true">

      <div class="text-[100px] sm:text-[140px] leading-none">
        🌳
      </div>

    </div>


    <!-- =====================================================
         CARD TENGAH
         ===================================================== -->

    <div class="relative z-20 w-full max-w-md">

      <div class="bg-cream/90 backdrop-blur
               rounded-3xl shadow-2xl
               p-8 sm:p-10
               border border-white/60
               forest-card">

        <!-- =================================================
             AREA LOGO + BURUNG
             ================================================= -->

        <div class="relative text-center mb-2
                 kreasi-stage">

          <!-- ===============================================
               BURUNG HINGGAP
               =============================================== -->

          <div class="resting-bird" aria-hidden="true">
            🐦
          </div>


          <!-- ===============================================
               BURUNG MENGELILINGI KREASI
               =============================================== -->

          <div class="bird-orbit" aria-hidden="true">
            <span>🐦</span>
          </div>


          <!-- ===============================================
               LOGO KREASI
               =============================================== -->

          <h1 class="font-fredoka font-bold leading-tight select-none">

            <div class="text-5xl sm:text-6xl kreasi-logo" aria-label="Kreasi">

              <span class="kreasi-letter text-sky" style="--i: 0">
                K
              </span>

              <span class="kreasi-letter text-jungle" style="--i: 1">
                R
              </span>

              <span class="kreasi-letter text-sunshine" style="--i: 2">
                E
              </span>

              <span class="kreasi-letter text-coral" style="--i: 3">
                A
              </span>

              <span class="kreasi-letter text-sky" style="--i: 4">
                S
              </span>

              <span class="kreasi-letter text-jungle" style="--i: 5">
                I
              </span>

            </div>

          </h1>


          <!-- Tagline -->

          <p class="font-nunito text-xs sm:text-sm
                   text-bark/70 tracking-widest
                   mt-2 mb-1 uppercase">
            Kembangkan • Rangkai • Eksplorasi • Cipta
          </p>


          <!-- Divider -->

          <div class="flex items-center justify-center
                   gap-2 my-3" aria-hidden="true">

            <span class="h-px w-12 bg-jungle/30 block"></span>

            <span class="text-jungle text-lg leaf-divider">
              🌿
            </span>

            <span class="h-px w-12 bg-jungle/30 block"></span>

          </div>

        </div>


        <!-- =================================================
             FORM NAMA
             ================================================= -->

        <form @submit.prevent="handleSubmit" novalidate class="w-full text-center">

          <label for="nama-input" class="block
                   font-nunito font-semibold
                   text-bark text-sm
                   mb-2 text-center">
            👤 Masukkan nama kamu:
          </label>


          <!-- ===============================================
               AREA INPUT + TUPAI
               =============================================== -->

          <div class="relative flex gap-2 justify-center
                   typing-stage">

            <!-- =============================================
                 TUPAI
                 ============================================= -->

            <div class="typing-squirrel" aria-hidden="true">

              <div class="squirrel-character">
                🐿️
              </div>

              <!-- Huruf keluar dari tupai -->
              <TransitionGroup name="letter-pop" tag="div" class="typed-flying-letters">

                <span v-for="letter in flyingLetters" :key="letter.id" class="flying-letter" :style="{
                  '--letter-x': `${letter.x}px`,
                  '--letter-y': `${letter.y}px`
                }">
                  {{ letter.char }}
                </span>

              </TransitionGroup>

            </div>


            <!-- =============================================
                 INPUT
                 ============================================= -->

            <input id="nama-input" ref="namaInputElement" v-model="namaInput" type="text" placeholder="Nama Siswa"
              autocomplete="given-name" maxlength="50" class="flex-1
                     border-2 rounded-xl
                     px-4 py-3
                     font-fredoka text-lg
                     text-center
                     focus:outline-none
                     transition-all duration-200
                     bg-white/80" :class="[
                      inputError
                        ? 'border-coral animate-shake focus:border-coral'
                        : 'border-jungle/30 focus:border-jungle focus:ring-2 focus:ring-jungle/20'
                    ]" @input="handleNameInput" @keydown.enter.prevent="handleSubmit" aria-describedby="nama-error" />


            <!-- =============================================
                 TOMBOL
                 ============================================= -->

            <button ref="submitButton" type="submit" class="relative bg-jungle
                     hover:bg-jungle/90
                     text-white
                     rounded-xl
                     px-5 py-3
                     transition-all duration-200
                     hover:shadow-lg
                     hover:shadow-jungle/30
                     hover:-translate-y-0.5
                     active:translate-y-0
                     flex items-center
                     justify-center" aria-label="Lanjutkan">

              <span class="text-xl font-bold">
                ✓
              </span>

              <!-- Kelinci -->
              <div class="button-rabbit" aria-hidden="true">
                🐇
              </div>

            </button>

          </div>


          <!-- =================================================
               PESAN ERROR
               ================================================= -->

          <p id="nama-error" v-if="inputError" class="mt-2
                   text-xs
                   text-coral
                   font-nunito
                   font-semibold
                   flex items-center
                   justify-center
                   gap-1
                   text-center" role="alert">

            <span>⚠️</span>

            <span>
              Nama minimal 2 karakter ya!
            </span>

          </p>

        </form>


        <!-- =================================================
             HINT
             ================================================= -->

        <p class="text-center
                 font-nunito
                 text-xs
                 text-bark/50
                 mt-5
                 italic
                 transition-opacity
                 duration-700" :class="showHint
                    ? 'opacity-100'
                    : 'opacity-0'
                  ">
          "Satu ide kecil, bisa jadi pantun luar biasa!"
        </p>
        <button @click="mulai">
          🌳 Mulai Bermain
        </button>

      </div>

    </div>


    <!-- =====================================================
         RUMPUT / TANAH
         ===================================================== -->

    <div class="absolute bottom-0 left-0 right-0
             pointer-events-none" aria-hidden="true">

      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" class="w-full h-24 sm:h-32">

        <!-- Tanah -->

        <rect x="0" y="80" width="1200" height="40" fill="#795548" opacity="0.3" />


        <!-- Rumput -->

        <path d="M0,80
             Q30,40 60,80
             Q90,40 120,80
             Q150,40 180,80
             Q210,40 240,80
             Q270,40 300,80
             Q330,40 360,80
             Q390,40 420,80
             Q450,40 480,80
             Q510,40 540,80
             Q570,40 600,80
             Q630,40 660,80
             Q690,40 720,80
             Q750,40 780,80
             Q810,40 840,80
             Q870,40 900,80
             Q930,40 960,80
             Q990,40 1020,80
             Q1050,40 1080,80
             Q1110,40 1140,80
             Q1170,40 1200,80
             L1200,120
             L0,120 Z" fill="#27AE60" opacity="0.7" class="grass-wave" />


        <!-- Tanaman kiri -->

        <g transform="translate(80,50)">

          <rect x="-3" y="0" width="6" height="30" fill="#795548" rx="3" />

          <ellipse cx="0" cy="-5" rx="18" ry="14" fill="#27AE60" />

          <ellipse cx="-12" cy="5" rx="12" ry="9" fill="#2ECC71" />

          <ellipse cx="12" cy="5" rx="12" ry="9" fill="#2ECC71" />

        </g>


        <!-- Tanaman kanan -->

        <g transform="translate(1100,45)">

          <rect x="-3" y="0" width="6" height="35" fill="#795548" rx="3" />

          <ellipse cx="0" cy="-8" rx="22" ry="16" fill="#27AE60" />

          <ellipse cx="-14" cy="4" rx="14" ry="10" fill="#2ECC71" />

          <ellipse cx="14" cy="4" rx="14" ry="10" fill="#2ECC71" />

        </g>


        <!-- Bunga -->

        <g transform="translate(300,70)">

          <rect x="-2" y="0" width="4" height="20" fill="#795548" rx="2" />

          <circle cx="0" cy="-2" r="8" fill="#F39C12" />

          <circle cx="0" cy="-2" r="4" fill="#E74C3C" />

        </g>


        <g transform="translate(900,68)">

          <rect x="-2" y="0" width="4" height="22" fill="#795548" rx="2" />

          <circle cx="0" cy="-2" r="9" fill="#E91E63" />

          <circle cx="0" cy="-2" r="4" fill="#FFFDE7" />

        </g>

      </svg>

    </div>

  </div>
</template>


<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
import { useAudio } from '~/composables/useAudio'

/* =========================================================
   PAGE META
   ========================================================= */

definePageMeta({
  pageTransition: {
    name: 'page',
    mode: 'out-in'
  }
})


/* =========================================================
   STORE + AUDIO
   ========================================================= */

const store = useKotakStore()
const audio = useAudio()
async function mulai() {
  // Unlock audio melalui user gesture
  await audio.unlock()

  // Putar ambience setelah audio berhasil di-unlock
  audio.play('ambient-forest')

  // Fokus ke input nama
  requestAnimationFrame(() => {
    namaInputElement.value?.focus()
  })
}


/* =========================================================
   STATE
   ========================================================= */

const namaInput = ref(
  store.studentName || ''
)

const inputError = ref(false)

const showHint = ref(false)

const namaInputElement = ref(null)

const submitButton = ref(null)


/* =========================================================
   HURUF YANG KELUAR DARI TUPAI
   ========================================================= */

const flyingLetters = ref([])

let letterCounter = 0


/* =========================================================
   SAAT USER MENGETIK
   ========================================================= */

function handleNameInput(event) {

  inputError.value = false

  const value = event.target.value

  /*
   * Ambil karakter terakhir yang baru diketik.
   */
  const lastChar = value[value.length - 1]

  if (!lastChar || lastChar === ' ') {
    return
  }

  /*
   * Buat huruf ajaib.
   */
  const id = ++letterCounter

  flyingLetters.value.push({
    id,
    char: lastChar,
    x: 0,
    y: 0
  })

  /*
   * Bersihkan setelah animasi selesai.
   */
  setTimeout(() => {

    flyingLetters.value =
      flyingLetters.value.filter(
        item => item.id !== id
      )

  }, 1000)
}


/* =========================================================
   SUBMIT
   ========================================================= */

function handleSubmit() {

  const nama = namaInput.value.trim()

  if (nama.length < 2) {

    inputError.value = true
    audio.play('toast-warn')

    return
  }

  // Suara submit berhasil — "do mi sol do"
  audio.play('submit')

  store.setName(nama)

  navigateTo('/menu')
}


/* =========================================================
   ON MOUNTED
   ========================================================= */

onMounted(() => {

  if (store.studentName) {
    namaInput.value = store.studentName
  }

  /*
   * Ambient hutan: diputar sekali saat halaman terbuka.
   * Delay 600ms agar user sudah berinteraksi (browser autoplay policy).
   */
  // setTimeout(() => {
  //   audio.play('ambient-forest')
  // }, 600)

  /*
   * Hint muncul setelah 1 detik.
   */
  setTimeout(() => {

    showHint.value = true

  }, 1000)

})
</script>


<style scoped>
/* =========================================================
   KREASI LOGO
   ========================================================= */

.kreasi-stage {

  position: relative;

}


.kreasi-logo {

  display: inline-flex;

  justify-content: center;

  align-items: center;

  animation:
    kreasiFloat 4s ease-in-out 3s infinite;
}


.kreasi-letter {

  display: inline-block;

  opacity: 0;

  transform:
    translateY(25px) scale(0.7);

  animation:
    kreasiLetterIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,

    kreasiLetterIdle 3s ease-in-out 3.2s infinite;

  animation-delay:
    calc(var(--i) * 0.12s),
    calc(3.2s + var(--i) * 0.04s);
}


@keyframes kreasiLetterIn {

  0% {
    opacity: 0;

    transform:
      translateY(25px) scale(0.7);
  }

  60% {

    opacity: 1;

    transform:
      translateY(-7px) scale(1.08);
  }

  80% {

    transform:
      translateY(3px) scale(0.98);
  }

  100% {

    opacity: 1;

    transform:
      translateY(0) scale(1);
  }
}


@keyframes kreasiLetterIdle {

  0%,
  100% {

    transform:
      translateY(0) rotate(0deg);
  }

  50% {

    transform:
      translateY(-3px) rotate(-1deg);
  }
}


@keyframes kreasiFloat {

  0%,
  100% {
    transform:
      translateY(0);
  }

  50% {
    transform:
      translateY(-4px);
  }
}


/* =========================================================
   BURUNG
   ========================================================= */

/*
 * Burung pertama terbang dari kiri ke kanan.
 */

.forest-bird {

  position: absolute;

  z-index: 12;

  font-size: 27px;

  pointer-events: none;

  user-select: none;
}


.bird-flight {

  top: 22%;

  left: -60px;

  animation:
    birdEnter 10s cubic-bezier(0.45, 0, 0.55, 1) 1.5s forwards;
}


@keyframes birdEnter {

  0% {

    left: -60px;

    top: 22%;

    opacity: 0;
  }

  10% {

    opacity: 1;
  }

  30% {

    left: 20%;

    top: 18%;
  }

  55% {

    left: 50%;

    top: 13%;
  }

  75% {

    left: 70%;

    top: 17%;
  }

  100% {

    /*
     * Berhenti di atas card.
     */

    left: 67%;

    top: 23%;

    opacity: 1;
  }
}


/* =========================================================
   BURUNG HINGGAP
   ========================================================= */

.resting-bird {

  position: absolute;

  left: 50%;

  top: -33px;

  transform:
    translateX(-50%);

  font-size: 28px;

  z-index: 30;

  opacity: 0;

  animation:
    birdRest 1s ease-out 11.5s forwards;
}


@keyframes birdRest {

  0% {
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  100% {
    opacity: 1;
  }
}


/* =========================================================
   BURUNG MEMUTARI KREASI
   ========================================================= */

.bird-orbit {

  position: absolute;

  left: 50%;

  top: 50%;

  width: 175px;

  height: 90px;

  transform:
    translate(-50%, -50%);

  pointer-events: none;

  z-index: 25;

  opacity: 0;

  animation:
    orbitBird 7s ease-in-out 11s 2;
}


.bird-orbit span {

  position: absolute;

  left: 50%;

  top: 50%;

  font-size: 23px;

  transform-origin:
    0 0;
}


@keyframes orbitBird {

  0% {

    opacity: 0;

    transform:
      translate(-50%, -50%) rotate(0deg);
  }

  5% {
    opacity: 1;
  }

  25% {

    transform:
      translate(-50%, -50%) rotate(90deg);
  }

  50% {

    transform:
      translate(-50%, -50%) rotate(180deg);
  }

  75% {

    transform:
      translate(-50%, -50%) rotate(270deg);
  }

  95% {
    opacity: 1;
  }

  100% {

    opacity: 0;

    transform:
      translate(-50%, -50%) rotate(360deg);
  }
}


/* =========================================================
   TUPAI
   ========================================================= */

.typing-stage {

  position: relative;

}


.typing-squirrel {

  position: absolute;

  left: -48px;

  top: 50%;

  transform:
    translateY(-50%);

  z-index: 15;

  pointer-events: none;

  user-select: none;
}


.squirrel-character {

  font-size: 35px;

  animation:
    squirrelTyping 2s ease-in-out infinite;
}


@keyframes squirrelTyping {

  0%,
  100% {

    transform:
      translateY(0) rotate(0deg);
  }

  50% {

    transform:
      translateY(-4px) rotate(-5deg);
  }
}


/* =========================================================
   HURUF KELUAR DARI TUPAI
   ========================================================= */

.typed-flying-letters {

  position: absolute;

  left: 20px;

  top: 4px;

  width: 100px;

  height: 50px;

  pointer-events: none;
}


.flying-letter {

  position: absolute;

  left: 0;

  top: 0;

  font-family: 'Fredoka', sans-serif;

  font-size: 17px;

  font-weight: 700;

  color: #27AE60;

  text-shadow:
    0 2px 3px rgba(0, 0, 0, 0.12);

  animation:
    letterMagic 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}


@keyframes letterMagic {

  0% {

    opacity: 0;

    transform:
      translate(0, 0) scale(0.3) rotate(-20deg);
  }

  20% {

    opacity: 1;

    transform:
      translate(12px, -10px) scale(1.1) rotate(10deg);
  }

  60% {

    opacity: 1;

    transform:
      translate(45px, -3px) scale(1) rotate(-5deg);
  }

  100% {

    opacity: 0;

    transform:
      translate(75px, 3px) scale(0.75) rotate(10deg);
  }
}


/* =========================================================
   KELINCI DI ATAS TOMBOL
   ========================================================= */

.button-rabbit {

  position: absolute;

  left: 50%;

  top: -39px;

  transform:
    translateX(-50%);

  font-size: 27px;

  pointer-events: none;

  user-select: none;

  z-index: 20;

  animation:
    rabbitAdventure 5s ease-in-out infinite;
}


@keyframes rabbitAdventure {

  /* Awal */

  0% {

    transform:
      translateX(-50%) translateY(0) rotate(0deg);
  }

  /* Lompat */

  10% {

    transform:
      translateX(-70%) translateY(-17px) rotate(-8deg);
  }

  20% {

    transform:
      translateX(-20%) translateY(-24px) rotate(8deg);
  }

  30% {

    transform:
      translateX(20%) translateY(-17px) rotate(-5deg);
  }

  40% {

    transform:
      translateX(-50%) translateY(0) rotate(0deg);
  }

  /* Lompat kedua */

  48% {

    transform:
      translateX(-50%) translateY(-20px) rotate(5deg);
  }

  58% {

    transform:
      translateX(-40%) translateY(-29px) rotate(-8deg);
  }

  68% {

    transform:
      translateX(-50%) translateY(0) rotate(0deg);
  }

  /* ================================================
     TERJATUH
     ================================================ */

  73% {

    transform:
      translateX(-50%) translateY(0) rotate(0deg);
  }

  78% {

    transform:
      translateX(-50%) translateY(12px) rotate(35deg);
  }

  83% {

    transform:
      translateX(-50%) translateY(21px) rotate(85deg);
  }

  88% {

    transform:
      translateX(-50%) translateY(12px) rotate(140deg);
  }

  /* Bangkit */

  94% {

    transform:
      translateX(-50%) translateY(-5px) rotate(175deg);
  }

  100% {

    transform:
      translateX(-50%) translateY(0) rotate(360deg);
  }
}


/* =========================================================
   KUNANG-KUNANG
   ========================================================= */

.fireflies {

  position: absolute;

  inset: 0;

  z-index: 4;
}


.firefly {

  position: absolute;

  font-size: 12px;

  color: #fff6a8;

  text-shadow:
    0 0 5px #fff6a8,
    0 0 12px #f9d65c;

  animation:
    fireflyGlow 3s ease-in-out infinite;
}


.f1 {
  left: 12%;
  top: 48%;
}

.f2 {
  left: 22%;
  top: 35%;
  animation-delay: 1s;
}

.f3 {
  right: 18%;
  top: 45%;
  animation-delay: 2s;
}

.f4 {
  right: 28%;
  top: 58%;
  animation-delay: .5s;
}

.f5 {
  left: 34%;
  top: 60%;
  animation-delay: 1.5s;
}

.f6 {
  right: 8%;
  top: 38%;
  animation-delay: 2.5s;
}


@keyframes fireflyGlow {

  0%,
  100% {

    opacity: .2;

    transform:
      translateY(0) scale(.8);
  }

  50% {

    opacity: 1;

    transform:
      translateY(-8px) scale(1.3);
  }
}


/* =========================================================
   MATAHARI
   ========================================================= */

.sun-glow {

  animation:
    sunPulse 4s ease-in-out infinite;
}


@keyframes sunPulse {

  0%,
  100% {

    opacity: .55;

    transform:
      scale(1);
  }

  50% {

    opacity: .8;

    transform:
      scale(1.08);
  }
}


/* =========================================================
   POHON
   ========================================================= */

.tree-sway {

  transform-origin:
    bottom center;

  animation:
    treeSway 5s ease-in-out infinite;
}


.tree-right {

  animation-delay:
    1.5s;
}


@keyframes treeSway {

  0%,
  100% {

    transform:
      rotate(-1deg);
  }

  50% {

    transform:
      rotate(1.5deg);
  }
}


/* =========================================================
   RUMPUT
   ========================================================= */

.grass-wave {

  transform-origin:
    bottom center;

  animation:
    grassWave 4s ease-in-out infinite;
}


@keyframes grassWave {

  0%,
  100% {
    transform:
      skewX(0deg);
  }

  50% {
    transform:
      skewX(.6deg);
  }
}


/* =========================================================
   DIVIDER
   ========================================================= */

.leaf-divider {

  display: inline-block;

  animation:
    leafPulse 3s ease-in-out infinite;
}


@keyframes leafPulse {

  0%,
  100% {

    transform:
      scale(1) rotate(0deg);
  }

  50% {

    transform:
      scale(1.12) rotate(-5deg);
  }
}


/* =========================================================
   CARD
   ========================================================= */

.forest-card {

  animation:
    cardAppear .8s cubic-bezier(.22, 1, .36, 1) both;
}


@keyframes cardAppear {

  0% {

    opacity: 0;

    transform:
      translateY(20px) scale(.97);
  }

  100% {

    opacity: 1;

    transform:
      translateY(0) scale(1);
  }
}


/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 640px) {

  .typing-squirrel {

    left: -34px;
  }

  .squirrel-character {

    font-size: 28px;
  }

  .resting-bird {

    top: -29px;

    font-size: 24px;
  }

  .bird-orbit {

    width: 145px;

    height: 75px;
  }

  .bird-orbit span {

    font-size: 19px;
  }

  .button-rabbit {

    font-size: 24px;

    top: -35px;
  }

}


/* =========================================================
   REDUCED MOTION
   ========================================================= */

@media (prefers-reduced-motion: reduce) {

  .kreasi-logo,
  .kreasi-letter,
  .sun-glow,
  .forest-bird,
  .resting-bird,
  .bird-orbit,
  .squirrel-character,
  .flying-letter,
  .button-rabbit,
  .firefly,
  .tree-sway,
  .grass-wave,
  .leaf-divider,
  .forest-card {

    animation: none !important;
  }

  .kreasi-letter {

    opacity: 1;

    transform: none;
  }

}
</style>