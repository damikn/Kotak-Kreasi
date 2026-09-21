<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.45)"
        role="dialog"
        aria-modal="true"
        @click.self="onCancel"
      >
        <div class="confirm-box bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-white/60 text-center">
          <div
            class="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3"
            :class="danger ? 'bg-coral/15' : 'bg-sky/15'"
          >
            <span class="text-2xl">{{ danger ? '⚠️' : '❓' }}</span>
          </div>
          <h3 class="font-fredoka font-bold text-xl text-bark mb-2">{{ title }}</h3>
          <p class="font-nunito text-sm text-gray-500 mb-6">{{ message }}</p>
          <div class="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              @click="onCancel"
              class="flex-1 font-nunito font-semibold text-sm text-gray-500 border border-gray-200 rounded-xl px-4 py-2.5 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              @click="onConfirm"
              class="flex-1 font-fredoka font-bold text-sm rounded-xl px-4 py-2.5 transition-all duration-200 shadow-lg hover:-translate-y-0.5"
              :class="danger
                ? 'bg-coral text-white hover:bg-coral/90 shadow-coral/30'
                : 'bg-jungle text-white hover:bg-jungle/90 shadow-jungle/30'"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue:   { type: Boolean, default: false },
  title:        { type: String,  default: 'Konfirmasi' },
  message:      { type: String,  default: '' },
  confirmText:  { type: String,  default: 'Ya, Lanjutkan' },
  cancelText:   { type: String,  default: 'Batal' },
  danger:       { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function onCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}

function onConfirm() {
  emit('update:modelValue', false)
  emit('confirm')
}

function onKey(e) {
  if (e.key === 'Escape' && props.modelValue) onCancel()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style>
.confirm-enter-active,
.confirm-leave-active { transition: opacity 0.2s ease; }
.confirm-enter-from,
.confirm-leave-to { opacity: 0; }
.confirm-enter-active .confirm-box,
.confirm-leave-active .confirm-box { transition: transform 0.2s ease; }
.confirm-enter-from .confirm-box,
.confirm-leave-to .confirm-box { transform: scale(0.95); }
</style>