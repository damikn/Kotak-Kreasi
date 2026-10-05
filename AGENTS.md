# AGENTS.md — kotak-kreasi

## Overview
Interactive **pantun**-writing app for Indonesian school students. Navigation is five learning
stages (stage cards on `/menu`, each opening a hub at `/tahap/<slug>`): **Peta Ide Materi** →
**Belajar Menulis Pantun** → **Eksplorasi Pantun** → **Karya Pantun** → **Galeri dan Refleksi**.
Inside them sit six gated steps: Pilih Fenomena → Cocokkan (crossword matching) → Gagasan & Pesan →
Pola (spin wheel) → Rima (rhyme tree) → Tulis Pantun, then a result page that exports the pantun as
an image. `content/stages.json` is the single source of that structure.
Nuxt 3.21 (SSR, `srcDir: '.'`) + Vue 3.5 `<script setup>` + Pinia + Tailwind 3.4. Server routes in
`server/api/` write works to **Google Sheets** and upload the rendered image to **Google Drive**.
Package manager **npm** (Node 26 here, >= 18 required). Deployed on Vercel →
https://kotak-kreasi.vercel.app

**User-facing copy is Indonesian** (students, teachers); code, comments, docs, commits are English.
That split is intentional — do not translate UI strings or `statusMessage` values.

## Commands
```bash
npm install                 # deps
npm run dev                 # dev server → http://localhost:3000 (3100 if taken)
npm run build               # production build
npm run preview             # serve the production build

# smoke-test a route without the UI (PIN comes from .env / runtime config)
curl -s "localhost:3000/api/guru/works?pin=$GURU_PIN" | head -c 400
```
**No test suite, no lint config.** Verification = build passes + the route answers + a manual
click-through of the flow you touched. For UI work build and test the production output — dev mode
misbehaves in headless browsers (see Troubleshooting 6).

## Conventions
`content/stages.json` defines the stages, the pages inside each stage and their `step` numbers.
`composables/useStages.js` reads it and exposes `stages`, `steps`, `progressOf`, `isPageUnlocked`,
`isPageDone`, `nextPageOf`, `resumeRoute` — the menu, stage hub, breadcrumb and stage badge all go
through it, so **never hardcode a step list or route order in a component**. Adding a page means
adding it to `stages.json` (with `step: null` if it is not part of the gated sequence) and giving the
page a guard plus `<StageBadge route="/your-route" />` + `<StepBreadcrumb :current-step="n" />`.
A stage with `available: false` renders as "segera hadir" and cannot be opened.
Step completion lives in the Pinia store: `isStepDone(n)` for steps 1..6. Learner content lives in
`content/*.json`, never inline in a `.vue`.

Navigation follows three rules — follow them for every new page:

1. **Guards** go through `composables/usePageGuard.js`: `requireAll([[cond, '/fallback']])` inside
   `onMounted`. It fires only the first failing check and redirects with `replace`, so a blocked page
   never leaves a bounce in the browser history. Guard checks written as separate `navigateTo()` calls
   (the old style) stack entries and make the browser back button loop until the tab closes.
2. **Back affordances** go through `composables/useBackNav.js`: `goBack('/parent-route')` returns to
   the real previous page via `router.back()` when `history.state.back` says an app page sits behind
   it, and otherwise replaces to the named parent route. Never call `history.back()` directly — on a
   reload or a deep link that walks straight out of the app (in an in-app browser: closes the tab).
3. **Forward** navigation (next step, menu cards, breadcrumb) stays a plain `navigateTo(route)` push.

```js
// content/stages.json — one entry drives menu card, hub page, badge and breadcrumb
{ "step": 2, "route": "/cocokkan", "label": "Cocokkan Gambar dan Keterangan",
  "shortLabel": "Cocokkan", "icon": "🧩", "desc": "Pasangkan gambar fenomena dengan gagasan, pesan, dan pantunnya" }
```
`components/CrosswordMatch.vue` is generic: box count = `items.length`, `locked` boxes ship
pre-filled, chips are shuffled in `onMounted` (not in setup, or SSR hydration mismatches) and it
emits `change(id, value)` / `completed(answers)`. Pages own correctness checks, not the component.

## Boundaries
- **NEVER** commit `.env` — it holds the live Google service-account key and a `VERCEL_TOKEN`.
  `.env.example` carries placeholders only.
- **NEVER** reorder or rename Sheet1 columns (A..S, `SHEET_HEADERS` / `COL` in
  `server/utils/sheets.js`); the teacher dashboard reads by fixed index. New fields are **appended**
  (`Gagasan` = R, `Pesan` = S) so existing rows stay valid.
- **NEVER** log student names/works outside the configured Sheet. Drive sharing is currently
  `role: reader, type: anyone` (`server/api/save-pantun.post.js` ~line 94) — a known open security
  item; do not widen it without the team's decision.
- **NEVER** hardcode learner content (phenomena, gagasan, pesan, pantun examples) in a `.vue`.
- **ALWAYS** edit `components/AppHeader.vue`, never `components/layout/AppHeader.vue` (dead
  duplicate — Troubleshooting 1).
- **ALWAYS** keep Google credentials and `GURU_PIN` in private `runtimeConfig` keys, never in a
  `NUXT_PUBLIC_*` variable.

## Dependencies
`nuxt` 3.21 + `vue` 3.5 + `vue-router` 4 (shell/SSR/pages) · `pinia` + `@pinia/nuxt` +
`@pinia-plugin-persistedstate/nuxt` (state persistence — currently not writing, see
Troubleshooting 5) · `@nuxtjs/tailwindcss` + `tailwindcss` 3.4 (sole styling system) ·
`@nuxt/content` (reads `content/*.json`) · `nuxt-icon`, `@vueuse/core` ·
`html2canvas` + `@nuxtjs/google-fonts` (result export, Fredoka/Nunito) · `googleapis` 144.
No UI kit, chart library or test runner — the look is custom and none are wired in.

## Config
Placeholders only; real values live in `.env` locally and in the Vercel dashboard.
- `GOOGLE_CLIENT_EMAIL` — `<SERVICE_ACCOUNT_EMAIL>`
- `GOOGLE_PRIVATE_KEY` — `<SERVICE_ACCOUNT_PRIVATE_KEY>`; keep the literal `\n` escapes when pasting
  into Vercel. Routes reject it unless it contains `-----BEGIN` and no `REDACTED`.
- `GOOGLE_SHEETS_ID` — `<SPREADSHEET_ID>`; `GOOGLE_DRIVE_FOLDER_ID` — `<SHARED_DRIVE_FOLDER_ID>`
- `GURU_PIN` — `<TEACHER_DASHBOARD_PIN>`, server-only, gates every `/api/guru/*` route
- `VERCEL_TOKEN` — local `.env` only, for CLI deploys; the app never reads it.

## Error Handling
Routes `throw createError({ statusCode, statusMessage })` with an Indonesian message the UI shows
verbatim (400 incomplete payload, 401 bad PIN, 500 Google config / Sheets / Drive failure). Sheets
and Drive errors are logged first with a bracketed route tag
(`console.warn('[guru/works] gagal baca Sheets:', e.message)`) so Vercel logs point at the route.
Nothing retries in the background: a failed save is surfaced to the student. Rule violations never
throw — `server/utils/validate-pantun.js` returns feedback objects the UI renders.

## Troubleshooting
1. **An edit changes nothing** — `components/layout/AppHeader.vue` and
   `components/layout/StepBreadcrumb.vue` are older duplicates auto-imported as `LayoutAppHeader` /
   `LayoutStepBreadcrumb`; every page's `<AppHeader />` resolves to the **root** file.
2. **500 "Konfigurasi Google API belum diisi dengan kunci service account yang valid."** — the
   private-key guard failed. Locally the key uses `\n` escapes; on Vercel the same escapes must
   survive (a multi-line paste is mangled). Confirm with the `curl` smoke test, not the dashboard.
3. **A page is reachable but its step never counts as done** — the page's step number in
   `content/stages.json` must match the branch you added to `isStepDone()` in the store; a mismatch
   leaves the breadcrumb and the stage progress stuck at 0. Also check `content/stages.json` is the
   file being read (`useStages` expects the `body` array, not a raw object).
4. **An SFC fails with `parsing .nuxt/tsconfig.app.json failed: ENOENT`** — this project's root
   `tsconfig.json` references `.nuxt/tsconfig.app.json`, which Nuxt 3.21 does not emit here. Write
   components as plain JS (`<script setup>`, runtime `defineProps`), matching the rest of the repo.
5. **A refresh drops the student on the entry form** — the store does persist (localStorage key
   `kotak`, `piniaPersistedstate: { storage: 'localStorage' }` in `nuxt.config.ts`), so check the
   content first: a state saved before kelas/nomor absen existed fails `store.hasIdentity` and every
   guard sends the student to `/` by design. The entry page says so (`needsCompletion`) and only asks
   for the missing fields. On a reload of `/` the student is forwarded back to the last page via
   `kotak-last-route` (`utils/last-route.js` + `plugins/route-tracker.client.js`).
6. **Back button does not return to the previous page, or closes the tab** — the page was reached by
   a redirect or a deep link and the guard pushed instead of replacing. See Conventions: guards use
   `usePageGuard`, back buttons use `useBackNav`. Reproduce with an empty localStorage: load `/menu`
   directly, then `history.state.back` must be `null` (one entry, no bounce).
7. **Page transitions freeze when driving the app headlessly** — `document.hidden` makes
   `requestAnimationFrame` never fire, so Vue's `out-in` transition keeps the old page mounted with
   `page-leave-active` and the next page never appears. Shim rAF (`setTimeout(cb, 16)`) or test in a
   real browser; it is not an app bug.
8. **Chips/bank not rendering right after navigation** — `CrosswordMatch` builds its bank in
   `onMounted`; give it a tick before asserting on the DOM from a script.
9. **A saved work is missing from the table** — read the `/api/save-pantun` response in the network
   tab, then confirm the service role key can write to the Storage bucket; a bucket the key cannot
   write to fails the image upload after the row was inserted.

## Docs
`README.md` (overview), `DEPLOY.md`, `VERCEL-DEPLOY.md` (env vars + go-live checklist),
`CARA-AKSES-LOKAL.md`, `GITHUB.md` — maintained in Indonesian for the project team.
