// composables/useBackNav.js
// In-app "back" that never drops the student out of the app.
//
// Why this exists: a plain history.back() on a page that was opened directly — a
// shared link, a reload, or a page reached right after a guard redirect — leaves the
// app entirely. In Telegram's in-app browser that closes the tab, which is what the
// students saw instead of "the previous page".
//
// Vue Router keeps the previous in-app route in history.state.back, so that value is
// the signal:
//   history.state.back != null -> an app page sits behind us, safe to go back to it
//   history.state.back == null -> we are the first app page in this tab
//                                 (reload / deep link), so open the fallback route
//                                 instead of stepping out of the app.
import { useRouter } from 'vue-router'

export function useBackNav() {
  const router = useRouter()

  function hasAppHistory() {
    if (typeof window === 'undefined') return false
    const state = window.history.state
    return !!state && state.back !== null && state.back !== undefined
  }

  /**
   * Go back one page. `fallback` is used when the tab has no in-app history yet
   * (reload, deep link, first page) — it is replaced, not pushed, so the current
   * page cannot bounce straight back here.
   */
  function goBack(fallback = '/menu') {
    if (typeof window === 'undefined') return
    if (hasAppHistory()) {
      router.back()
      return
    }
    router.replace(fallback)
  }

  return { goBack, hasAppHistory }
}
