<template>
  <!-- Progress bar 4 step alur pantun -->
  <nav class="w-full bg-white/60 backdrop-blur-sm border-b border-gray-100 py-3 px-4">
    <div class="max-w-3xl mx-auto">
      <ol class="flex items-center justify-center gap-0">
        <li v-for="(step, index) in steps" :key="step.id" class="flex items-center">
          <!-- Step item -->
          <div class="flex flex-col items-center gap-1 relative">
            <!-- Lingkaran step -->
            <button
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center
                     font-fredoka font-bold text-sm transition-all duration-300 border-2"
              :class="getStepClass(step.id)"
              @click="handleStepClick(step.id)"
              :disabled="!canNavigate(step.id)"
              :title="getStepTitle(step)"
              :aria-label="`Step ${step.id}: ${step.label}`"
              :aria-current="currentStep === step.id ? 'step' : undefined"
            >
              <!-- Ikon centang untuk step selesai -->
              <span v-if="isDone(step.id) && currentStep !== step.id" aria-hidden="true">✓</span>
              <!-- Ikon gembok untuk step terkunci -->
              <span v-else-if="!canNavigate(step.id)" aria-hidden="true" class="text-xs">🔒</span>
              <span v-else>{{ step.id }}</span>
            </button>

            <!-- Label step (desktop) -->
            <span
              class="hidden sm:block text-xs font-nunito font-semibold text-center
                     whitespace-nowrap transition-colors duration-300"
              :class="currentStep === step.id ? 'text-jungle' : isDone(step.id) ? 'text-jungle/70' : 'text-gray-400'"
            >
              {{ step.label }}
            </span>
          </div>

          <!-- Garis penghubung (kecuali setelah step terakhir) -->
          <div
            v-if="index < steps.length - 1"
            class="h-0.5 w-8 sm:w-16 mx-1 rounded-full transition-all duration-500"
            :class="isDone(step.id) ? 'bg-jungle' : 'bg-gray-200'"
            aria-hidden="true"
          />
        </li>
      </ol>
    </div>
  </nav>
</template>

<script setup>
import { useKotakStore } from '~/composables/useKotakStore'

const props = defineProps({
  // Step yang sedang aktif (1–4)
  currentStep: {
    type: Number,
    required: true,
  },
})

const store = useKotakStore()

const steps = [
  { id: 1, label: 'Fenomena', route: '/fenomena' },
  { id: 2, label: 'Pola', route: '/pola' },
  { id: 3, label: 'Rima', route: '/rima' },
  { id: 4, label: 'Susun Pantun', route: '/susun' },
]

// Cek apakah step sudah diselesaikan
function isDone(stepId) {
  return store.isStepDone(stepId)
}

// Cek apakah step bisa di-navigate (semua step sebelumnya sudah selesai)
function canNavigate(stepId) {
  if (stepId === 1) return true
  for (let s = 1; s < stepId; s++) {
    if (!store.isStepDone(s)) return false
  }
  return true
}

function getStepTitle(step) {
  if (canNavigate(step.id)) return step.label
  return `${step.label} (Terkunci - selesaikan step sebelumnya terlebih dahulu)`
}

// Kelas dinamis untuk tiap step button
function getStepClass(stepId) {
  if (props.currentStep === stepId) {
    // Aktif
    return 'bg-jungle border-jungle text-white shadow-md shadow-jungle/30 scale-110'
  }
  if (isDone(stepId)) {
    // Selesai
    return 'bg-jungle/20 border-jungle/50 text-jungle hover:bg-jungle/30 cursor-pointer'
  }
  if (canNavigate(stepId)) {
    // Terbuka tapi belum dikerjakan
    return 'bg-white border-jungle/40 text-jungle hover:bg-jungle/10 cursor-pointer'
  }
  // Belum dikerjakan & Terkunci
  return 'bg-gray-100 border-gray-200 text-gray-400 opacity-60 cursor-not-allowed'
}

function handleStepClick(stepId) {
  if (!canNavigate(stepId)) return
  const step = steps.find((s) => s.id === stepId)
  if (step) navigateTo(step.route)
}
</script>
