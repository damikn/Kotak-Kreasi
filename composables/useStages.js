// composables/useStages.js
// Single source of truth for the stage → page structure.
// content/stages.json defines the five learning stages and the pages inside them;
// every navigation surface (menu, stage hub, breadcrumb, stage badge) reads it from here
// so the step order can never drift between components.
import { useKotakStore } from '~/composables/useKotakStore'

function normalize(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  for (const key of Object.keys(raw)) {
    if (Array.isArray(raw[key])) return raw[key]
  }
  return []
}

export function useStages() {
  const store = useKotakStore()

  const { data } = useAsyncData('stages', () => queryContent('/stages').findOne())

  const stages = computed(() => normalize(data.value))

  // Flat, ordered list of the pages that carry a step number — this is the wizard order.
  const steps = computed(() =>
    stages.value
      .flatMap((stage) =>
        (stage.pages ?? [])
          .filter((page) => !!page.step)
          .map((page) => ({
            id: page.step,
            label: page.shortLabel || page.label,
            route: page.route,
            stageId: stage.id,
          })),
      )
      .sort((a, b) => a.id - b.id),
  )

  function stageForRoute(route) {
    return stages.value.find((stage) => (stage.pages ?? []).some((p) => p.route === route)) ?? null
  }

  function pageForRoute(route) {
    for (const stage of stages.value) {
      const page = (stage.pages ?? []).find((p) => p.route === route)
      if (page) return { stage, page }
    }
    return null
  }

  function progressOf(stage) {
    const pages = stage?.pages ?? []
    // Practice stages (games) count every page; wizard stages count the gated steps only.
    if (stage?.progressKind === 'games') {
      return { done: pages.filter((p) => store.isGameDone(p.route)).length, total: pages.length }
    }
    const stepped = pages.filter((p) => !!p.step)
    return { done: stepped.filter((p) => store.isStepDone(p.step)).length, total: stepped.length }
  }

  // A page is reachable once every earlier step is done (step 1 and step-less pages are open).
  function isPageUnlocked(page) {
    if (!page?.step || page.step === 1) return true
    return store.isStepDone(page.step - 1)
  }

  function isPageDone(page) {
    if (page?.step) return store.isStepDone(page.step)
    return store.isGameDone(page?.route)
  }

  // First unfinished page of a stage — used by the hub's "Lanjutkan" button.
  function nextPageOf(stage) {
    const pages = stage?.pages ?? []
    if (stage?.progressKind === 'games') {
      return pages.find((p) => !store.isGameDone(p.route)) ?? pages[pages.length - 1] ?? null
    }
    const stepped = pages.filter((p) => !!p.step)
    // A page marked `intro` leads into the stage: show it until the first step is done.
    const intro = pages.find((p) => p.intro)
    if (intro && !stepped.some((p) => store.isStepDone(p.step)) && !store.isGameDone(intro.route)) {
      return intro
    }
    return stepped.find((p) => !store.isStepDone(p.step)) ?? stepped[stepped.length - 1] ?? null
  }

  // Where "Mulai Berkelanjutan" should drop the student.
  function resumeRoute() {
    const next = steps.value.find((step) => !store.isStepDone(step.id))
    return next?.route ?? '/susun'
  }

  return {
    stages,
    steps,
    stageForRoute,
    pageForRoute,
    progressOf,
    isPageUnlocked,
    isPageDone,
    nextPageOf,
    resumeRoute,
  }
}
