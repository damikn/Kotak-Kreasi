<template>
  <!--
    StageBadge — shows which learning stage the current page belongs to plus the
    in-stage progress ("2 dari 3"), matching the storyboard's stage badge.
  -->
  <div v-if="stage" class="w-full bg-white/70 border-b border-gray-100">
    <div class="max-w-5xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-base leading-none shrink-0" aria-hidden="true">{{ stage.icon }}</span>
        <span class="font-fredoka font-bold text-xs sm:text-sm truncate" :class="stage.textClass">
          {{ stage.label }}
        </span>
      </div>
      <span
        v-if="progress.total"
        class="font-nunito text-[11px] sm:text-xs font-semibold text-gray-500 shrink-0
               rounded-full border border-gray-200 px-2.5 py-0.5"
      >
        {{ progressLabel }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { useStages } from '~/composables/useStages'

const props = defineProps({
  // Route of the page this badge sits on, e.g. '/cocokkan'
  route: { type: String, required: true },
})

const { pageForRoute, progressOf } = useStages()

const found = computed(() => pageForRoute(props.route))
const stage = computed(() => found.value?.stage ?? null)

const progress = computed(() => {
  if (!found.value) return { done: 0, total: 0 }
  return progressOf(found.value.stage)
})

const progressLabel = computed(() => {
  if (!found.value || !progress.value.total) return ''
  // Wizard stages number only the gated pages; practice stages number every game.
  const pages = found.value.stage?.pages ?? []
  const list = found.value.stage?.progressKind === 'games' ? pages : pages.filter((p) => !!p.step)
  const index = list.findIndex((p) => p.route === props.route)
  if (index < 0) return ''
  return `${Math.min(index + 1, progress.value.total)} dari ${progress.value.total}`
})
</script>
