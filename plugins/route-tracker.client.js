// plugins/route-tracker.client.js
// Remembers the last page the student visited so a reload can put them back there.
//
// The wizard state itself is persisted by the Pinia store; this only stores the route.
// pages/index.vue reads it and, when the entry page is opened by a reload, forwards the
// student to that route instead of showing the form again.
import { LAST_ROUTE_KEY, ENTRY_ROUTE } from '~/utils/last-route'

export default defineNuxtPlugin(() => {
  const router = useRouter()

  router.afterEach((to) => {
    if (to.path === ENTRY_ROUTE) return
    try {
      window.localStorage.setItem(LAST_ROUTE_KEY, to.fullPath)
    } catch (e) {
      // storage disabled (private mode) — resume is optional, never fatal
    }
  })
})
