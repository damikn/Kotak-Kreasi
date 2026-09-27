// composables/useGameState.js
// Shared state for the practice games in the "Eksplorasi Pantun" stage:
// one check pass, per-item verdicts, and a retry that wipes the board.
export function useGameState() {
  const checked = ref(false)
  const results = ref(null)

  function evaluate(verdicts) {
    results.value = { ...verdicts }
    checked.value = true
  }

  function retry() {
    checked.value = false
    results.value = null
  }

  const correctCount = computed(() => Object.values(results.value ?? {}).filter(Boolean).length)
  const totalCount = computed(() => Object.keys(results.value ?? {}).length)
  const isAllCorrect = computed(() => totalCount.value > 0 && correctCount.value === totalCount.value)

  function verdictFor(id) {
    return results.value ? results.value[id] : null
  }

  return {
    checked,
    results,
    evaluate,
    retry,
    correctCount,
    totalCount,
    isAllCorrect,
    verdictFor,
  }
}
