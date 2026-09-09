<template>
  <div
    class="min-h-screen relative overflow-hidden flex flex-col"
    style="background: linear-gradient(180deg, #a8d8ea 0%, #c8e6c9 70%, #E8F5E9 100%)"
  >
    <AppHeader />

    <!-- Dekorasi tanaman kiri bawah -->
    <div class="absolute bottom-0 left-0 pointer-events-none select-none" aria-hidden="true">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <g transform="translate(20,90)">
          <rect x="-4" y="-80" width="8" height="80" fill="#795548" rx="4"/>
          <ellipse cx="0" cy="-90" rx="35" ry="28" fill="#27AE60"/>
          <ellipse cx="-20" cy="-70" rx="22" ry="18" fill="#2ECC71"/>
          <ellipse cx="20" cy="-70" rx="22" ry="18" fill="#2ECC71"/>
        </g>
        <g transform="translate(90,120)">
          <rect x="-3" y="-50" width="6" height="50" fill="#795548" rx="3"/>
          <ellipse cx="0" cy="-58" rx="28" ry="22" fill="#27AE60"/>
          <ellipse cx="-16" cy="-44" rx="18" ry="14" fill="#2ECC71"/>
          <ellipse cx="16" cy="-44" rx="18" ry="14" fill="#2ECC71"/>
        </g>
      </svg>
    </div>

    <!-- Dekorasi tanaman kanan bawah -->
    <div class="absolute bottom-0 right-0 pointer-events-none select-none" aria-hidden="true">
      <svg width="160" height="180" viewBox="0 0 160 180">
        <g transform="translate(130,100)">
          <rect x="-4" y="-80" width="8" height="80" fill="#795548" rx="4"/>
          <ellipse cx="0" cy="-88" rx="32" ry="26" fill="#27AE60"/>
          <ellipse cx="-18" cy="-68" rx="20" ry="16" fill="#2ECC71"/>
          <ellipse cx="18" cy="-68" rx="20" ry="16" fill="#2ECC71"/>
        </g>
        <g transform="translate(60,130)">
          <rect x="-3" y="-45" width="6" height="45" fill="#795548" rx="3"/>
          <ellipse cx="0" cy="-52" rx="25" ry="20" fill="#27AE60"/>
        </g>
      </svg>
    </div>

    <main class="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
      <div class="w-full max-w-lg">

        <!-- ═══════════════════════════════════════════════ -->
        <!-- FASE 1 — Kotak Ajaib (sebelum menu dibuka)     -->
        <!-- ═══════════════════════════════════════════════ -->
        <Transition name="box-hide">
          <div v-if="phase === 'box'" class="flex flex-col items-center gap-5">

            <!-- Greeting singkat -->
            <div class="text-center">
              <p class="font-fredoka font-bold text-2xl sm:text-3xl text-bark">
                Halo, <span class="text-jungle">{{ store.studentName }}</span>! 👋
              </p>
              <p class="font-nunito text-sm text-bark/60 mt-1">
                Klik kotak ajaib untuk membuka menu!
              </p>
            </div>

            <!-- Kotak Ajaib interaktif -->
            <button
              @click="openBox"
              class="group relative focus:outline-none"
              aria-label="Buka kotak ajaib untuk melihat menu"
            >
              <!-- Partikel bintang sekeliling -->
              <span
                v-for="(star, i) in stars" :key="i"
                class="absolute pointer-events-none text-sunshine font-bold select-none animate-float"
                :style="{
                  top: star.top, left: star.left,
                  fontSize: star.size + 'px',
                  animationDelay: star.delay + 's',
                  animationDuration: star.dur + 's',
                }"
                aria-hidden="true"
              >{{ star.char }}</span>

              <!-- SVG kotak ajaib -->
              <div
                class="relative transition-transform duration-200
                       group-hover:scale-110 group-active:scale-95"
                :class="isShaking ? 'animate-wiggle' : 'animate-wiggle'"
              >
                <svg width="160" height="150" viewBox="0 0 160 150" class="drop-shadow-2xl">
                  <!-- Badan kotak -->
                  <rect x="20" y="60" width="120" height="85" rx="10" fill="#795548"/>
                  <!-- Gradien highlight badan -->
                  <rect x="20" y="60" width="120" height="85" rx="10"
                    fill="url(#bodyGrad)" opacity="0.25"/>
                  <!-- Garis dekorasi tengah vertikal -->
                  <line x1="80" y1="60" x2="80" y2="145" stroke="#F39C12" stroke-width="2.5" opacity="0.6"/>
                  <!-- Garis dekorasi tengah horizontal -->
                  <line x1="20" y1="100" x2="140" y2="100" stroke="#F39C12" stroke-width="2.5" opacity="0.6"/>
                  <!-- Kunci -->
                  <circle cx="80" cy="100" r="9" fill="#F39C12" stroke="#E67E22" stroke-width="2"/>
                  <rect x="76" y="105" width="8" height="10" rx="2" fill="#F39C12"/>

                  <!-- Tutup kotak (terbuka ke belakang) -->
                  <path d="M15,62 Q80,15 145,62" fill="#5D4037" stroke="#795548" stroke-width="3"/>
                  <!-- Highlight tutup -->
                  <path d="M25,60 Q80,20 135,60" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>

                  <!-- Bintang & sparkle keluar dari kotak -->
                  <text x="72" y="48" font-size="20" fill="#F39C12" class="animate-float"
                        style="animation-delay:0s">✦</text>
                  <text x="95" y="38" font-size="14" fill="#E74C3C" class="animate-float"
                        style="animation-delay:0.4s">★</text>
                  <text x="52" y="35" font-size="12" fill="#2980B9" class="animate-float"
                        style="animation-delay:0.8s">✦</text>
                  <text x="108" y="52" font-size="10" fill="#27AE60" class="animate-float"
                        style="animation-delay:0.2s">●</text>

                  <!-- Gradien defs -->
                  <defs>
                    <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="white"/>
                      <stop offset="100%" stop-color="black"/>
                    </linearGradient>
                  </defs>
                </svg>

                <!-- Ripple saat hover -->
                <span class="absolute inset-0 rounded-full bg-sunshine/0 group-hover:bg-sunshine/5
                             transition-all duration-300 scale-100 group-hover:scale-110"/>
              </div>

              <!-- Teks klik -->
              <p class="font-nunito text-xs text-bark/50 italic mt-2 text-center animate-pulse">
                ✨ Klik untuk membuka ✨
              </p>
            </button>
          </div>
        </Transition>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- FASE 2 — Animasi ledak + transisi               -->
        <!-- ═══════════════════════════════════════════════ -->
        <div v-if="phase === 'explode'" class="flex items-center justify-center h-64" aria-hidden="true">
          <!-- Partikel meledak keluar -->
          <div class="relative w-32 h-32">
            <span
              v-for="(p, i) in particles" :key="i"
              class="absolute w-3 h-3 rounded-full"
              :style="{
                background: p.color,
                top: '50%', left: '50%',
                transform: `translate(-50%,-50%)`,
                animation: `explode-${i % 8} 0.6s ease-out forwards`,
              }"
            />
            <!-- Ikon bintang besar -->
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-5xl animate-bounce-in">✨</span>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- FASE 3 — Menu (setelah kotak dibuka)            -->
        <!-- ═══════════════════════════════════════════════ -->
        <Transition name="menu-appear">
          <div v-if="phase === 'menu'">

            <!-- Greeting card -->
            <div class="bg-white/80 backdrop-blur rounded-2xl border border-jungle/20 p-4 mb-5 text-center shadow-md">
              <div class="flex items-center justify-center gap-2 mb-0.5">
                <span class="text-xl">👋</span>
                <h2 class="font-fredoka font-bold text-xl sm:text-2xl text-jungle">
                  Halo, {{ store.studentName }}!
                </h2>
              </div>
              <p class="font-nunito text-sm text-bark/70">Pilih menu untuk mulai berkreasi!</p>
              <p class="font-nunito text-xs text-bark/50 italic mt-0.5">
                "Dari fenomena, lahir makna. Dari kata, tercipta karya."
              </p>
            </div>

            <!-- Grid 2×2 Menu Cards (animasi stagger per kartu) -->
            <div class="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
              <button
                v-for="(menu, idx) in menuList"
                :key="menu.id"
                @click="handleMenuClick(menu)"
                class="relative rounded-2xl border-2 p-4 sm:p-5 text-left
                       transition-all duration-200 hover:scale-105 hover:shadow-lg
                       active:scale-100 focus:outline-none focus:ring-2 card-enter"
                :class="[menu.bgClass, menu.borderClass, menu.focusClass]"
                :style="{ animationDelay: (idx * 80) + 'ms' }"
                :title="menu.label"
              >
                <!-- Badge selesai -->
                <span
                  v-if="store.isStepDone(menu.step)"
                  class="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-jungle
                         text-white text-xs flex items-center justify-center font-bold shadow"
                  aria-label="Sudah selesai"
                >✓</span>

                <div class="text-3xl sm:text-4xl mb-2 sm:mb-3" aria-hidden="true">{{ menu.icon }}</div>
                <div class="font-fredoka font-bold text-sm sm:text-base leading-tight" :class="menu.textClass">
                  {{ menu.label }}
                </div>
                <div class="font-nunito text-xs mt-1 text-gray-500 leading-tight">{{ menu.desc }}</div>
              </button>
            </div>

            <!-- Tombol MULAI -->
            <button
              @click="handleMulai"
              class="w-full bg-jungle hover:bg-jungle/90 text-white font-fredoka font-bold text-xl
                     rounded-2xl py-3.5 shadow-lg shadow-jungle/30 transition-all duration-200
                     hover:shadow-jungle/50 hover:-translate-y-0.5 active:translate-y-0
                     flex items-center justify-center gap-2"
            >
              <span>▶</span><span>Mulai</span>
            </button>

            <p class="text-center font-nunito text-xs text-bark/50 mt-3 italic">
              Ikuti 4 langkah: Fenomena → Pola → Rima → Susun Pantun
            </p>
          </div>
        </Transition>

      </div>
    </main>

    <!-- Toast -->
    <Transition name="toast">
      <div
        v-if="toastMsg"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
               bg-bark text-white font-nunito text-sm px-5 py-3
               rounded-2xl shadow-xl flex items-center gap-2"
        role="alert"
      >
        <span>⚠️</span><span>{{ toastMsg }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'
import { useAudio }      from '~/composables/useAudio'

definePageMeta({ pageTransition: { name: 'page', mode: 'out-in' } })

const store = useKotakStore()
const audio = useAudio()

// Guard
onMounted(() => {
  if (!store.studentName) navigateTo('/')
})

// ── Fetch menu dari content/menus.json ────────────────────
const { data: menusData } = await useAsyncData('menus', () => queryContent('/menus').findOne())

const menuList = computed(() => {
  if (!menusData.value) return []
  const raw = menusData.value
  if (Array.isArray(raw)) return raw
  for (const key of Object.keys(raw)) {
    if (Array.isArray(raw[key])) return raw[key]
  }
  return []
})

// ── State fase animasi ────────────────────────────────────
// 'box'     = tampilkan kotak ajaib
// 'explode' = animasi meledak singkat
// 'menu'    = tampilkan grid menu
const phase = ref('box')

// Bintang partikel dekorasi sekeliling kotak
const starChars = ['✦', '★', '✨', '◆', '●', '✦', '★']
const stars = Array.from({ length: 7 }, (_, i) => ({
  char:  starChars[i % starChars.length],
  top:   `${-10 + Math.sin(i * 0.9) * 30}%`,
  left:  `${5 + (i / 6) * 90}%`,
  size:  10 + (i % 3) * 4,
  delay: i * 0.3,
  dur:   2 + (i % 3) * 0.8,
}))

// Partikel ledak
const particleColors = ['#27AE60', '#2980B9', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C', '#E67E22', '#E91E63']
const particles = Array.from({ length: 16 }, (_, i) => ({
  color: particleColors[i % particleColors.length],
}))

const isShaking = ref(false)

function openBox() {
  // Suara kotak terbuka
  audio.play('box-open')
  // Goyang dulu
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
    phase.value = 'explode'
    // Suara ledak partikel
    audio.play('box-explode')
    // Setelah animasi ledak, tampilkan menu
    setTimeout(() => {
      phase.value = 'menu'
      // Suara kartu menu muncul (sedikit delay agar sync dengan animasi)
      setTimeout(() => audio.play('card-appear'), 80)
    }, 650)
  }, 300)
}

// ── Toast & navigasi ──────────────────────────────────────
const toastMsg = ref('')
let toastTimer = null

function showToast(msg) {
  toastMsg.value = msg
  audio.play('toast-warn')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 2500)
}

function handleMenuClick(menu) {
  if (menu.step === 1) { navigateTo(menu.route); return }
  if (!store.isStepDone(menu.step - 1)) {
    showToast('Selesaikan step sebelumnya dulu! 😊')
    return
  }
  navigateTo(menu.route)
}

function handleMulai() {
  audio.play('next')
  if (!store.isStepDone(1))      navigateTo('/fenomena')
  else if (!store.isStepDone(2)) navigateTo('/pola')
  else if (!store.isStepDone(3)) navigateTo('/rima')
  else                           navigateTo('/susun')
}

onUnmounted(() => clearTimeout(toastTimer))
</script>

<style scoped>
/* ── Transisi kotak hilang ──────────────────────────────── */
.box-hide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.box-hide-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

/* ── Transisi menu muncul ───────────────────────────────── */
.menu-appear-enter-active {
  transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.menu-appear-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(20px);
}

/* ── Kartu menu stagger (animasi masuk satu-satu) ─────────  */
.card-enter {
  animation: cardIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes cardIn {
  from { opacity: 0; transform: scale(0.7) translateY(15px); }
  to   { opacity: 1; transform: scale(1)   translateY(0); }
}

/* ── Partikel ledak ─────────────────────────────────────── */
@keyframes explode-0 { to { transform: translate(-120%, -120%) scale(0); opacity: 0; } }
@keyframes explode-1 { to { transform: translate(0,     -160%) scale(0); opacity: 0; } }
@keyframes explode-2 { to { transform: translate(120%,  -120%) scale(0); opacity: 0; } }
@keyframes explode-3 { to { transform: translate(160%,  0)     scale(0); opacity: 0; } }
@keyframes explode-4 { to { transform: translate(120%,  120%)  scale(0); opacity: 0; } }
@keyframes explode-5 { to { transform: translate(0,     160%)  scale(0); opacity: 0; } }
@keyframes explode-6 { to { transform: translate(-120%, 120%)  scale(0); opacity: 0; } }
@keyframes explode-7 { to { transform: translate(-160%, 0)     scale(0); opacity: 0; } }

/* ── Toast ──────────────────────────────────────────────── */
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
