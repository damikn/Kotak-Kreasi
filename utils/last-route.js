// utils/last-route.js
// Two helpers around the "where was I" key written by plugins/route-tracker.client.js.
// Split out of the plugin so pages can read and clear it without importing a plugin.
export const LAST_ROUTE_KEY = 'kotak-last-route'
export const ENTRY_ROUTE = '/'

/** @returns {string} fullPath of the last visited page, '' when unknown or unreadable */
export function readLastRoute() {
  if (typeof window === 'undefined') return ''
  try {
    const value = window.localStorage.getItem(LAST_ROUTE_KEY) || ''
    return value === ENTRY_ROUTE ? '' : value
  } catch (e) {
    return ''
  }
}

/** Drops the remembered route — used when the student leaves or starts over. */
export function forgetLastRoute() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(LAST_ROUTE_KEY)
  } catch (e) {
    // storage disabled (private mode) — resume is optional, never fatal
  }
}
