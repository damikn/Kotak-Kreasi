
/**
 * useAudio.js
 * ============================================================
 * SISTEM AUDIO TERPUSAT — KOTAK KREASI
 * ============================================================
 *
 * Semua suara dibuat secara real-time menggunakan Web Audio API.
 * Tidak membutuhkan file MP3 / WAV eksternal.
 *
 * AUTOPLAY / BROWSER POLICY:
 *   - AudioContext TIDAK dipaksa berbunyi sebelum user gesture.
 *   - Browser di-unlock pada pointer/touch/keyboard pertama.
 *   - Bisa memanggil audio.unlock() dari tombol "Mulai".
 *   - Setelah unlocked, audio.play() dapat digunakan normal.
 *
 * Penggunaan:
 *
 *   const audio = useAudio()
 *
 *   audio.unlock()
 *   audio.play('ambient-forest')
 *
 * ============================================================
 */

import { ref, readonly } from 'vue'

// ============================================================
// GLOBAL STATE
// ============================================================

const isMuted = ref(false)
const isReady = ref(false)
const isUnlocked = ref(false)

let ctx = null
let masterGain = null

let unlockListenersInstalled = false

// ============================================================
// AUDIO CONTEXT
// ============================================================

function createContext() {
  if (ctx) return ctx

  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext

  if (!AudioContextClass) {
    console.warn(
      '[useAudio] Web Audio API tidak didukung browser.'
    )
    return null
  }

  ctx = new AudioContextClass()

  masterGain = ctx.createGain()
  masterGain.gain.value = isMuted.value ? 0 : 0.75

  masterGain.connect(ctx.destination)

  isReady.value = true

  return ctx
}

// ============================================================
// UNLOCK AUDIO
// ============================================================

async function unlock() {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const ac = createContext()

    if (!ac) {
      return false
    }

    /*
     * Browser biasanya membuat AudioContext dalam keadaan
     * "suspended" sampai ada user gesture.
     */
    if (ac.state === 'suspended') {
      await ac.resume()
    }

    /*
     * Beberapa browser/mobile browser lebih konsisten jika
     * kita melakukan playback buffer yang sangat kecil.
     *
     * Buffer ini tidak menghasilkan suara yang terdengar.
     */
    if (ac.state === 'running') {
      const buffer = ac.createBuffer(
        1,
        1,
        ac.sampleRate
      )

      const source = ac.createBufferSource()

      source.buffer = buffer
      source.connect(masterGain || ac.destination)

      source.start(0)
    }

    /*
     * Pastikan resume sekali lagi setelah silent buffer.
     */
    if (ac.state === 'suspended') {
      await ac.resume()
    }

    isUnlocked.value =
      ac.state === 'running'

    return isUnlocked.value

  } catch (error) {

    console.warn(
      '[useAudio] gagal unlock audio:',
      error
    )

    return false
  }
}

// ============================================================
// AUTOMATIC USER-GESTURE UNLOCK
// ============================================================

function installUnlockListeners() {
  if (
    typeof window === 'undefined' ||
    unlockListenersInstalled
  ) {
    return
  }

  unlockListenersInstalled = true

  /*
   * Gunakan capture phase agar event tetap tertangkap
   * walaupun target berada di dalam komponen lain.
   */
  const handler = () => {

    unlock()

    /*
     * Setelah berhasil unlock, listener tidak perlu
     * terus berjalan.
     */
    if (isUnlocked.value) {

      window.removeEventListener(
        'pointerdown',
        handler,
        true
      )

      window.removeEventListener(
        'touchstart',
        handler,
        true
      )

      window.removeEventListener(
        'keydown',
        handler,
        true
      )
    }
  }

  window.addEventListener(
    'pointerdown',
    handler,
    true
  )

  window.addEventListener(
    'touchstart',
    handler,
    true
  )

  window.addEventListener(
    'keydown',
    handler,
    true
  )
}

// Pasang listener segera ketika module digunakan.
if (typeof window !== 'undefined') {
  installUnlockListeners()
}

// ============================================================
// GET CONTEXT
// ============================================================

function getCtx() {
  if (!ctx) {
    createContext()
  }

  if (!ctx) {
    return null
  }

  /*
   * Jangan menganggap resume() sebagai jaminan autoplay.
   * unlock() tetap menjadi mekanisme utama.
   */
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => { })
  }

  return ctx
}

// ============================================================
// DESTINATION
// ============================================================

function destination(ac) {
  return masterGain || ac.destination
}

// ============================================================
// UTILITIES
// ============================================================

function clamp(
  value,
  min = 0,
  max = 1
) {
  return Math.max(
    min,
    Math.min(max, value)
  )
}

// ============================================================
// TONE
// ============================================================

function tone(
  ac,
  freq,
  start,
  dur,
  gain = 0.3,
  type = 'sine',
  endFreq = null
) {
  const osc = ac.createOscillator()
  const vol = ac.createGain()

  osc.type = type

  const t =
    ac.currentTime + start

  const safeDur =
    Math.max(0.02, dur)

  osc.frequency.setValueAtTime(
    freq,
    t
  )

  if (endFreq !== null) {

    osc.frequency.exponentialRampToValueAtTime(
      Math.max(1, endFreq),
      t + safeDur
    )
  }

  vol.gain.setValueAtTime(
    0,
    t
  )

  vol.gain.linearRampToValueAtTime(
    clamp(gain),
    t + Math.min(
      0.015,
      safeDur * 0.2
    )
  )

  vol.gain.setValueAtTime(
    clamp(gain),
    Math.max(
      t + 0.015,
      t + safeDur - 0.04
    )
  )

  vol.gain.exponentialRampToValueAtTime(
    0.001,
    t + safeDur
  )

  osc.connect(vol)
  vol.connect(destination(ac))

  osc.start(t)

  osc.stop(
    t + safeDur + 0.03
  )
}

// ============================================================
// SOFT TONE
// ============================================================

function softTone(
  ac,
  freq,
  start,
  dur,
  gain = 0.12
) {
  tone(
    ac,
    freq,
    start,
    dur,
    gain,
    'sine'
  )
}

// ============================================================
// NOISE
// ============================================================

function noise(
  ac,
  start,
  dur,
  gain = 0.08,
  filterFreq = 800,
  type = 'bandpass'
) {
  const sampleRate =
    ac.sampleRate

  const length = Math.max(
    1,
    Math.floor(
      sampleRate * dur
    )
  )

  const buffer =
    ac.createBuffer(
      1,
      length,
      sampleRate
    )

  const data =
    buffer.getChannelData(0)

  for (
    let i = 0;
    i < length;
    i++
  ) {
    data[i] =
      Math.random() * 2 - 1
  }

  const src =
    ac.createBufferSource()

  const filter =
    ac.createBiquadFilter()

  const vol =
    ac.createGain()

  src.buffer = buffer

  filter.type = type

  filter.frequency.value =
    filterFreq

  filter.Q.value = 0.6

  const t =
    ac.currentTime + start

  vol.gain.setValueAtTime(
    0,
    t
  )

  vol.gain.linearRampToValueAtTime(
    clamp(gain),
    t + Math.min(
      0.06,
      dur * 0.2
    )
  )

  vol.gain.exponentialRampToValueAtTime(
    0.001,
    t + dur
  )

  src.connect(filter)
  filter.connect(vol)
  vol.connect(destination(ac))

  src.start(t)

  src.stop(
    t + dur + 0.05
  )
}

// ============================================================
// WHOOSH
// ============================================================

function whoosh(
  ac,
  start = 0,
  dur = 0.6,
  gain = 0.12
) {
  const sampleRate =
    ac.sampleRate

  const length =
    Math.floor(
      sampleRate * dur
    )

  const buffer =
    ac.createBuffer(
      1,
      length,
      sampleRate
    )

  const data =
    buffer.getChannelData(0)

  for (
    let i = 0;
    i < length;
    i++
  ) {
    data[i] =
      Math.random() * 2 - 1
  }

  const src =
    ac.createBufferSource()

  const filter =
    ac.createBiquadFilter()

  const vol =
    ac.createGain()

  src.buffer = buffer

  filter.type =
    'bandpass'

  const t =
    ac.currentTime + start

  filter.frequency.setValueAtTime(
    300,
    t
  )

  filter.frequency.exponentialRampToValueAtTime(
    5000,
    t + dur
  )

  filter.Q.value = 0.7

  vol.gain.setValueAtTime(
    0,
    t
  )

  vol.gain.linearRampToValueAtTime(
    gain,
    t + dur * 0.35
  )

  vol.gain.exponentialRampToValueAtTime(
    0.001,
    t + dur
  )

  src.connect(filter)
  filter.connect(vol)
  vol.connect(destination(ac))

  src.start(t)

  src.stop(
    t + dur + 0.05
  )
}

// ============================================================
// BIRD
// ============================================================

function birdChirp(
  ac,
  start = 0,
  base = 1200,
  gain = 0.14
) {
  tone(
    ac,
    base,
    start,
    0.07,
    gain,
    'sine',
    base * 1.25
  )

  tone(
    ac,
    base * 1.3,
    start + 0.07,
    0.07,
    gain,
    'sine',
    base * 1.55
  )

  tone(
    ac,
    base * 1.55,
    start + 0.14,
    0.09,
    gain * 0.8,
    'sine',
    base * 1.35
  )
}

// ============================================================
// MAGIC
// ============================================================

function sparkle(
  ac,
  start = 0,
  gain = 0.12
) {
  const notes = [
    1047,
    1319,
    1568,
    2093
  ]

  notes.forEach(
    (f, i) => {

      tone(
        ac,
        f,
        start + i * 0.055,
        0.18,
        gain * (1 - i * 0.1),
        'sine'
      )
    }
  )
}

// ============================================================
// POP
// ============================================================

function pop(
  ac,
  start = 0,
  gain = 0.18
) {
  noise(
    ac,
    start,
    0.12,
    gain,
    500,
    'lowpass'
  )

  tone(
    ac,
    180,
    start,
    0.08,
    gain * 0.5,
    'sine',
    80
  )
}

// ============================================================
// CLICK
// ============================================================

function clickSound(
  ac,
  start = 0,
  gain = 0.1
) {
  tone(
    ac,
    900,
    start,
    0.035,
    gain,
    'triangle'
  )
}

// ============================================================
// SOUND MAP
// ============================================================

const soundMap = {

  // ----------------------------------------------------------
  // 🌳 HUTAN
  // ----------------------------------------------------------

  'ambient-forest'(ac) {

    noise(
      ac,
      0,
      2.5,
      0.035,
      450
    )

    noise(
      ac,
      0.9,
      0.45,
      0.035,
      2200
    )

    noise(
      ac,
      2.0,
      0.35,
      0.025,
      2800
    )

    birdChirp(
      ac,
      0.15,
      1200,
      0.14
    )

    birdChirp(
      ac,
      1.0,
      1700,
      0.10
    )

    tone(
      ac,
      1900,
      2.25,
      0.06,
      0.07,
      'sine'
    )

    tone(
      ac,
      2200,
      2.33,
      0.07,
      0.06,
      'sine'
    )
  },

  // ----------------------------------------------------------
  // 🔘 SUBMIT
  // ----------------------------------------------------------

  'submit'(ac) {

    tone(
      ac,
      523,
      0,
      0.10,
      0.22,
      'sine'
    )

    tone(
      ac,
      659,
      0.08,
      0.10,
      0.22,
      'sine'
    )

    tone(
      ac,
      784,
      0.16,
      0.13,
      0.22,
      'sine'
    )

    tone(
      ac,
      1047,
      0.27,
      0.24,
      0.18,
      'sine'
    )

    sparkle(
      ac,
      0.28,
      0.06
    )
  },

  // ----------------------------------------------------------
  // 📦 BOX OPEN
  // ----------------------------------------------------------

  'box-open'(ac) {

    tone(
      ac,
      380,
      0,
      0.22,
      0.12,
      'sawtooth',
      170
    )

    noise(
      ac,
      0.03,
      0.20,
      0.045,
      900
    )

    sparkle(
      ac,
      0.20,
      0.13
    )

    tone(
      ac,
      523,
      0.20,
      0.15,
      0.14,
      'sine'
    )

    tone(
      ac,
      784,
      0.28,
      0.15,
      0.15,
      'sine'
    )

    tone(
      ac,
      1047,
      0.36,
      0.20,
      0.13,
      'sine'
    )
  },

  // ----------------------------------------------------------
  // 💥 BOX EXPLODE
  // ----------------------------------------------------------

  'box-explode'(ac) {

    pop(
      ac,
      0,
      0.24
    )

    whoosh(
      ac,
      0,
      0.45,
      0.10
    )

    tone(
      ac,
      880,
      0.05,
      0.12,
      0.18,
      'sine'
    )

    tone(
      ac,
      1175,
      0.12,
      0.13,
      0.18,
      'sine'
    )

    tone(
      ac,
      1568,
      0.19,
      0.18,
      0.16,
      'sine'
    )

    sparkle(
      ac,
      0.20,
      0.08
    )
  },

  // ----------------------------------------------------------
  // 🃏 CARD
  // ----------------------------------------------------------

  'card-appear'(ac) {

    ;[
      523,
      659,
      784,
      1047
    ].forEach(
      (f, i) => {

        tone(
          ac,
          f,
          i * 0.065,
          0.13,
          0.15,
          'triangle'
        )
      }
    )

    sparkle(
      ac,
      0.18,
      0.05
    )
  },

  'card-select'(ac) {

    clickSound(
      ac,
      0,
      0.14
    )

    tone(
      ac,
      660,
      0.03,
      0.08,
      0.18,
      'sine'
    )

    tone(
      ac,
      880,
      0.09,
      0.12,
      0.15,
      'sine'
    )
  },

  // ----------------------------------------------------------
  // ➡️ NEXT
  // ----------------------------------------------------------

  'next'(ac) {

    tone(
      ac,
      523,
      0,
      0.08,
      0.18,
      'sine'
    )

    tone(
      ac,
      659,
      0.07,
      0.08,
      0.18,
      'sine'
    )

    tone(
      ac,
      784,
      0.14,
      0.13,
      0.20,
      'sine'
    )

    whoosh(
      ac,
      0.02,
      0.25,
      0.04
    )
  },

  // ----------------------------------------------------------
  // 🎡 SPINNER
  // ----------------------------------------------------------

  'spin-start'(ac) {

    whoosh(
      ac,
      0,
      0.45,
      0.13
    )

    tone(
      ac,
      440,
      0,
      0.08,
      0.13,
      'sawtooth'
    )

    tone(
      ac,
      660,
      0.10,
      0.08,
      0.13,
      'sawtooth'
    )
  },

  'spin-tick'(ac) {

    tone(
      ac,
      1150,
      0,
      0.025,
      0.10,
      'square'
    )

    tone(
      ac,
      1450,
      0.012,
      0.018,
      0.04,
      'sine'
    )
  },

  'spin-done'(ac) {

    tone(
      ac,
      1047,
      0,
      0.50,
      0.28,
      'sine'
    )

    tone(
      ac,
      1319,
      0,
      0.38,
      0.18,
      'sine'
    )

    tone(
      ac,
      1568,
      0,
      0.30,
      0.13,
      'sine'
    )

    tone(
      ac,
      2093,
      0,
      0.24,
      0.08,
      'sine'
    )

    tone(
      ac,
      1047,
      0.38,
      0.35,
      0.09,
      'sine'
    )

    sparkle(
      ac,
      0.10,
      0.06
    )
  },

  // ----------------------------------------------------------
  // 🍎 RIMA
  // ----------------------------------------------------------

  'apple-pluck'(ac) {

    tone(
      ac,
      880,
      0,
      0.045,
      0.22,
      'triangle'
    )

    tone(
      ac,
      1109,
      0.035,
      0.08,
      0.16,
      'triangle'
    )

    pop(
      ac,
      0,
      0.07
    )
  },

  'word-check'(ac) {

    tone(
      ac,
      784,
      0,
      0.06,
      0.15,
      'sine'
    )

    tone(
      ac,
      988,
      0.045,
      0.08,
      0.13,
      'sine'
    )

    sparkle(
      ac,
      0.06,
      0.035
    )
  },

  'word-uncheck'(ac) {

    tone(
      ac,
      988,
      0,
      0.05,
      0.12,
      'sine'
    )

    tone(
      ac,
      740,
      0.05,
      0.08,
      0.10,
      'sine'
    )
  },

  'words-ready'(ac) {

    ;[
      784,
      988,
      1175,
      1319
    ].forEach(
      (f, i) => {

        tone(
          ac,
          f,
          i * 0.08,
          0.15,
          0.18,
          'triangle'
        )
      }
    )

    sparkle(
      ac,
      0.25,
      0.08
    )
  },

  // ----------------------------------------------------------
  // ✍️ SUSUN
  // ----------------------------------------------------------

  'line-filled-1'(ac) {

    tone(
      ac,
      523,
      0,
      0.12,
      0.18,
      'sine'
    )
  },

  'line-filled-2'(ac) {

    tone(
      ac,
      587,
      0,
      0.12,
      0.18,
      'sine'
    )
  },

  'line-filled-3'(ac) {

    tone(
      ac,
      659,
      0,
      0.12,
      0.18,
      'sine'
    )
  },

  'line-filled-4'(ac) {

    tone(
      ac,
      698,
      0,
      0.12,
      0.18,
      'sine'
    )
  },

  'all-lines-done'(ac) {

    ;[
      523,
      659,
      784,
      1047,
      1319
    ].forEach(
      (f, i) => {

        tone(
          ac,
          f,
          i * 0.09,
          0.18,
          0.22,
          'triangle'
        )
      }
    )

    tone(
      ac,
      2093,
      0.30,
      0.45,
      0.08,
      'sine'
    )

    sparkle(
      ac,
      0.40,
      0.08
    )
  },

  // ----------------------------------------------------------
  // 💾 SAVE
  // ----------------------------------------------------------

  'save-start'(ac) {

    whoosh(
      ac,
      0,
      0.30,
      0.07
    )

    tone(
      ac,
      523,
      0,
      0.10,
      0.18,
      'sine'
    )

    tone(
      ac,
      659,
      0.10,
      0.10,
      0.18,
      'sine'
    )
  },

  'save-success'(ac) {

    ;[
      523,
      659,
      784,
      880,
      1047
    ].forEach(
      (f, i) => {

        tone(
          ac,
          f,
          i * 0.07,
          0.15,
          0.22,
          'sine'
        )
      }
    )

    tone(
      ac,
      1319,
      0.35,
      0.35,
      0.15,
      'sine'
    )

    sparkle(
      ac,
      0.35,
      0.07
    )
  },

  // ----------------------------------------------------------
  // 🎉 FANFARE
  // ----------------------------------------------------------

  'fanfare'(ac) {

    const melody = [
      [523, 0.00],
      [523, 0.12],
      [784, 0.24],
      [659, 0.36],
      [784, 0.50],
      [1047, 0.65],
      [1047, 0.80],
      [1047, 1.00]
    ]

    melody.forEach(
      ([f, t]) => {

        tone(
          ac,
          f,
          t,
          0.18,
          0.25,
          'square'
        )
      }
    )

    const harmony = [
      [659, 0.00],
      [659, 0.12],
      [988, 0.24],
      [880, 0.36],
      [988, 0.50],
      [1319, 0.65]
    ]

    harmony.forEach(
      ([f, t]) => {

        tone(
          ac,
          f,
          t,
          0.14,
          0.15,
          'sine'
        )
      }
    )

      ;[
        261,
        261,
        392,
        330
      ].forEach(
        (f, i) => {

          tone(
            ac,
            f,
            i * 0.25,
            0.22,
            0.17,
            'triangle'
          )
        }
      )

    sparkle(
      ac,
      0.70,
      0.09
    )
  },

  // ----------------------------------------------------------
  // 🌅 SUCCESS AMBIENT
  // ----------------------------------------------------------

  'ambient-success'(ac) {

    const melody = [
      523,
      587,
      659,
      784,
      659,
      587,
      523
    ]

    melody.forEach(
      (f, i) => {

        softTone(
          ac,
          f,
          i * 0.35,
          0.30,
          0.12
        )
      }
    )

    noise(
      ac,
      0,
      2.5,
      0.018,
      600
    )

    birdChirp(
      ac,
      1.8,
      1500,
      0.045
    )
  },

  // ----------------------------------------------------------
  // 💰 DOWNLOAD
  // ----------------------------------------------------------

  'download-done'(ac) {

    tone(
      ac,
      1319,
      0,
      0.12,
      0.20,
      'triangle'
    )

    tone(
      ac,
      1568,
      0.10,
      0.12,
      0.20,
      'triangle'
    )

    tone(
      ac,
      2093,
      0.20,
      0.22,
      0.18,
      'triangle'
    )

    sparkle(
      ac,
      0.20,
      0.06
    )
  },

  // ----------------------------------------------------------
  // ⚠️ WARNING
  // ----------------------------------------------------------

  'toast-warn'(ac) {

    tone(
      ac,
      440,
      0,
      0.08,
      0.15,
      'sine'
    )

    tone(
      ac,
      330,
      0.09,
      0.11,
      0.15,
      'sine'
    )
  },

  // ----------------------------------------------------------
  // 🐿️ TUPAI
  // ----------------------------------------------------------

  'squirrel'(ac) {

    tone(
      ac,
      1450,
      0,
      0.055,
      0.13,
      'triangle'
    )

    tone(
      ac,
      1750,
      0.07,
      0.055,
      0.13,
      'triangle'
    )

    tone(
      ac,
      1500,
      0.14,
      0.05,
      0.10,
      'triangle'
    )

    whoosh(
      ac,
      0.18,
      0.20,
      0.035
    )
  },

  // ----------------------------------------------------------
  // 🐰 KELINCI
  // ----------------------------------------------------------

  'rabbit-hop'(ac) {

    tone(
      ac,
      240,
      0,
      0.08,
      0.08,
      'sine',
      420
    )

    tone(
      ac,
      620,
      0.07,
      0.08,
      0.10,
      'triangle',
      800
    )

    pop(
      ac,
      0.14,
      0.06
    )
  },

  // ----------------------------------------------------------
  // 🐦 BURUNG TERBANG
  // ----------------------------------------------------------

  'bird-fly'(ac) {

    whoosh(
      ac,
      0,
      0.55,
      0.06
    )

    birdChirp(
      ac,
      0.15,
      1500,
      0.08
    )
  },

  // ----------------------------------------------------------
  // ✨ MAGIC
  // ----------------------------------------------------------

  'magic'(ac) {

    whoosh(
      ac,
      0,
      0.60,
      0.08
    )

    sparkle(
      ac,
      0.08,
      0.14
    )

    sparkle(
      ac,
      0.32,
      0.08
    )
  },

  // ----------------------------------------------------------
  // 🌿 DAUN
  // ----------------------------------------------------------

  'leaf-rustle'(ac) {

    noise(
      ac,
      0,
      0.35,
      0.055,
      1800
    )

    noise(
      ac,
      0.12,
      0.25,
      0.035,
      2600
    )
  },

  // ----------------------------------------------------------
  // 💧 AIR
  // ----------------------------------------------------------

  'water-drop'(ac) {

    tone(
      ac,
      1500,
      0,
      0.10,
      0.12,
      'sine',
      900
    )

    tone(
      ac,
      900,
      0.08,
      0.20,
      0.08,
      'sine',
      600
    )
  },

  // ----------------------------------------------------------
  // ❤️ HEART
  // ----------------------------------------------------------

  'heart'(ac) {

    tone(
      ac,
      659,
      0,
      0.10,
      0.16,
      'sine'
    )

    tone(
      ac,
      784,
      0.08,
      0.13,
      0.16,
      'sine'
    )
  }
}

// ============================================================
// COMPOSABLE
// ============================================================

export function useAudio() {

  /*
   * Panggil secara eksplisit dari tombol:
   *
   *   @click="audio.unlock()"
   *
   * Ini adalah cara PALING aman untuk mobile browser.
   */
  async function unlockAudio() {
    return await unlock()
  }

  // ----------------------------------------------------------
  // PLAY
  // ----------------------------------------------------------

  async function play(name) {

    if (isMuted.value) {
      return false
    }

    if (
      typeof window === 'undefined'
    ) {
      return false
    }

    try {

      /*
       * Jika audio belum unlock, coba resume.
       *
       * Jika browser menolak karena belum ada user gesture,
       * kita tidak memaksa playback.
       */
      const ac = getCtx()

      if (!ac) {
        return false
      }

      if (
        ac.state !== 'running'
      ) {

        const unlocked =
          await unlock()

        if (!unlocked) {

          console.warn(
            `[useAudio] audio "${name}" menunggu user gesture.`
          )

          return false
        }
      }

      const fn =
        soundMap[name]

      if (!fn) {

        console.warn(
          `[useAudio] suara "${name}" tidak ditemukan.`
        )

        return false
      }

      fn(ac)

      return true

    } catch (error) {

      console.warn(
        '[useAudio] error:',
        error
      )

      return false
    }
  }

  // ----------------------------------------------------------
  // MUTE
  // ----------------------------------------------------------

  function toggleMute() {

    isMuted.value =
      !isMuted.value

    if (
      masterGain &&
      ctx
    ) {

      masterGain.gain.setTargetAtTime(
        isMuted.value
          ? 0
          : 0.75,
        ctx.currentTime,
        0.03
      )
    }
  }

  // ----------------------------------------------------------
  // SET MUTE
  // ----------------------------------------------------------

  function setMute(value) {

    isMuted.value =
      !!value

    if (
      masterGain &&
      ctx
    ) {

      masterGain.gain.setTargetAtTime(
        isMuted.value
          ? 0
          : 0.75,
        ctx.currentTime,
        0.03
      )
    }
  }

  return {

    play,

    /*
     * Gunakan pada tombol "Mulai":
     *
     *   @click="audio.unlock()"
     */
    unlock: unlockAudio,

    toggleMute,

    setMute,

    isMuted:
      readonly(isMuted),

    isReady:
      readonly(isReady),

    isUnlocked:
      readonly(isUnlocked)
  }
}

