// composables/usePageGuard.js
// Single redirect helper for the per-page onMounted guards.
//
// Every guard check used to call navigateTo() on its own and without `replace`, so a
// page that failed two checks pushed two history entries and a page reached by a deep
// link pushed an extra entry on top of itself. The browser back button then bounced
// between the redirecting page and its target — the student could never get back, and
// in an in-app browser the tab eventually closed.
//
// Rules enforced here, once for every page:
//   1. only the FIRST failing check navigates (no racing pushes)
//   2. the redirect replaces the entry (a redirect is not a visit)
import { navigateTo } from '#imports'

export function usePageGuard() {
  /**
   * @param {Array<[boolean, string]>} checks ordered [isSatisfied, redirectRoute]
   * @returns {boolean} true when every check passed and the page may continue
   */
  function requireAll(checks) {
    for (const [satisfied, route] of checks) {
      if (satisfied) continue
      navigateTo(route, { replace: true })
      return false
    }
    return true
  }

  return { requireAll }
}
