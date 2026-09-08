<template>
  <!-- Animasi konfetti jatuh dari atas — pure CSS + JS, tanpa library eksternal -->
  <Teleport to="body">
    <div v-if="active" class="fixed inset-0 pointer-events-none overflow-hidden z-[9999]" aria-hidden="true">
      <div v-for="piece in pieces" :key="piece.id" class="absolute rounded-sm" :style="{
        left: piece.left + '%',
        top: '-12px',
        width: piece.size + 'px',
        height: piece.size * 0.4 + 'px',
        backgroundColor: piece.color,
        transform: `rotate(${piece.rotation}deg)`,
        animation: `confettiFall ${piece.duration}s ${piece.delay}s linear forwards`,
        opacity: 1,
        borderRadius: piece.round ? '50%' : '2px',
      }" />
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  // Durasi total konfetti tampil (ms)
  duration: {
    type: Number,
    default: 3500,
  },
  // Jumlah partikel
  count: {
    type: Number,
    default: 80,
  },
})

const emit = defineEmits(['done'])

const active = ref(false)
const pieces = ref([])

const colors = [
  '#27AE60', // jungle
  '#2980B9', // sky
  '#F39C12', // sunshine
  '#E74C3C', // coral
  '#9B59B6', // purple
  '#1ABC9C', // teal
  '#E91E63', // pink
  '#FFFDE7', // cream
  '#E67E22', // orange
]

function launch() {
  pieces.value = Array.from({ length: props.count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 10 + 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    duration: Math.random() * 2 + 1.5,
    delay: Math.random() * 1.2,
    round: Math.random() > 0.6,
  }))
  active.value = true

  setTimeout(() => {
    active.value = false
    pieces.value = []
    emit('done')
  }, props.duration)
}

// Auto-launch saat komponen dimount
onMounted(() => {
  launch()
})

// Expose untuk trigger ulang dari luar jika perlu
defineExpose({ launch })
</script>

<style>
@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 1;
  }

  70% {
    opacity: 1;
  }

  100% {
    transform: translateY(105vh) rotate(720deg) scale(0.5);
    opacity: 0;
  }
}
</style>
