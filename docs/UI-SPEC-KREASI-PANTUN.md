# UI spec capture — "Kreasi Pantun" storyboard (17 panels)

Status: analysis only, no code in this document. Source: the UI/UX write-up sent 2026-09-26 plus
`REVISI MEDIA KREASI PANTUN.docx` and `KOTAK_KREASI_PRD_PROMPT.md` (v2.0). Written in English per
repo convention; UI copy is quoted verbatim in Indonesian because it ships to students.

## 1. What the storyboard actually describes

A **stage-based learning app** (5E internally: Engage / Explore / Explain / Elaborate / Evaluate) with
a two-level navigation: a stage menu, then pages *inside* each stage with their own progress counter
("1 dari 5"). That is a different information architecture from the current repo, which is a single
flat wizard (`/fenomena → /cocokkan → /gagasan → /pola → /rima → /susun`).

Reconstructed page map (the numbering in the source document is out of order — 8, 9, 12, 19, 10,
15, 16, 17 — so the sequence below follows the stage logic, not the original numbers):

| Stage | Screen | Interaction | Current repo |
|---|---|---|---|
| — | 1. Masukkan nama | Text input + "Mulai →", hero illustration (treasure chest) | `/` — exists, different hero art |
| — | 2. Menu utama | 5 stage cards (ien: Peta Ide Materi, Belajar Menulis Pantun, Eksplorasi Pantun, Karya Pantun, Galeri dan Refleksi) | `/menu` — exists but 6 linear steps |
| Engage | 3. Kenal fenomena + pesan + contoh pantun | Two columns: illustration left, numbered list (Fenomena / Pesan / Contoh Pantun) right | **NEW** (partially covered by `/cocokkan`) |
| Engage | 4. Cocokkan fenomena, pesan, pantun | 3 columns (Gambar Fenomena / Pilihan Pesan / Pilihan Pantun), drag-drop or line matching, "Periksa Jawaban" | `/cocokkan` exists as the revised 4-box version (see §3) |
| Explore | 5. Pilih fenomena | 2x2 selectable image cards: Kebersihan kelas, Membantu teman, Penggunaan gawai, Menunda tugas | `/fenomena` — exists, but 8 phenomena and a different card layout |
| Explore | 6-7. Gagasan & pesan | Two textareas ("1. Fenomena ini tentang apa?", "2. Apa pesan yang ingin disampaikan?"), phenomenon image left | `/gagasan` — exists (labels already per revision) |
| Explain | 8. TTS Pantun | Crossword grid + "Petunjuk Mendatar/Menurun", "Periksa Jawaban" | **NEW** |
| Explain | 9. Bongkar Susun Pantun | Drag lines from "Larik Acak" into 4 ordered slots | **NEW** |
| Explain | 12. Orak-Arik Sampiran dan Isi | Drag "Larik Pantun" into "Sampiran" / "Isi" baskets | **NEW** |
| Explain | — Melengkapi Pantun | Fill blanks in a pantun from a word bank | **NEW** |
| Explain | — Pohon Rima (game) | Find words ending like a reference word on a tree | `/rima` is close but built for picking the 2 rhyme suffixes of A-B-A-B |
| Elaborate | 19. Menulis pantun | "Kamus Rima" side panel + 4 stacked line inputs; "Simpan Draf", "Kembali ke Peta Ide" | `/susun` — exists as one combined editor + preview |
| Elaborate | 10. Review / susun pantun | Recap: name, phenomenon, full pantun; "Simpan Karya" | `/hasil` + save button on `/susun` |
| Evaluate | 15. Pohon Rima + Ceklist Penilaian | Tree UI + checkbox self-assessment; "Simpan", "Lanjutkan" | `/rima` has a checklist, not this composite screen |
| Evaluate | 16. Galeri Pantun | "Karya Pilihan Teman-Teman" grid of other students' cards + "Lihat Karya" | **NEW** (needs a read API over the Sheet) |
| Evaluate | 17. Refleksi & Buku Karyaku | Reflection textareas + portfolio card; "Simpan & Unduh Buku Karya" | **NEW** |

Shared game chrome visible in every Explain/Evaluate screen: "Kembali ke Menu Explain", badge
`<STAGE> — <Indonesian title>`, progress "n dari m", "Periksa Jawaban", "Ulangi", and a collapsible
"Kunci Jawaban dan Pembahasan". Worth building once as a reusable shell + a `useGameState`
composable rather than five times.

## 2. What already exists in the repo

`/` `/menu` `/fenomena` `/cocokkan` `/gagasan` `/pola` `/rima` `/susun` `/hasil` `/guru`, with
`CrosswordMatch.vue` (generic, dynamic item count), `SpinningWheel.vue`, `RhymeTree.vue`,
`PantunCard.vue`, `StepBreadcrumb.vue`, `AppHeader.vue`, store gating for 6 steps, Sheets/Drive API
with `Gagasan` (R) and `Pesan` (S) columns.

## 3. Conflicts between the three sources — resolve before building

1. **Matching screen**: the storyboard shows 3 columns (gambar / pesan / pantun); the revision docx
   explicitly overrides it — "terdapat 4 kotak yaitu, gambar fenomena, gagasan, dan pantun" with
   "kotak-kotak jawaban di bawah secara acak… (kecuali gambar)"; the PRD adds numbered boxes + a clue
   list. The repo implements the revision. Building the 3-column version would undo an explicit
   revision item.
2. **5E wording**: the revision says no Engage/Explore/Explain/Elaborate/Evaluate in the UI. The
   storyboard's stage badges still show those words. Repo is clean today; if the 5-stage menu is
   built, use the Indonesian card titles from the storyboard and keep 5E names internal only.
3. **Phenomena count**: storyboard Explore-3 shows 4 phenomena; the revision content doc ships 8
   (the repo has all 8, each now with `gagasan`, `pesan`, `pantun`). Pick 4 or keep 8?
4. **Navigation model**: flat 6-step wizard (current) vs 5-stage cards with sub-pages and in-stage
   progress (storyboard). These are not additive — one has to win, because `isStepDone`, the
   breadcrumb and `/menu` all encode a single model.
5. **Order of Engage-2**: the storyboard matches phenomenon→pesan→pantun *before* the student picks a
   phenomenon; the PRD and the repo put matching *after* picking one. Keep the repo order (matching
   uses the chosen phenomenon's data).

## 4. Suggested phasing (each phase independently shippable)

- **Phase A — navigation model. DONE (2026-09-26).** Implemented as the 5-stage model:
  `content/stages.json` is the single source (stage → pages → step numbers), `composables/useStages.js`
  exposes it to `/menu` (5 stage cards with in-stage progress), `pages/tahap/[slug].vue` (hub) and
  `components/StageBadge.vue` ("n dari m" badge above the breadcrumb). `StepBreadcrumb` now derives
  its 6 steps from the same file, so the old duplicated step list (and `content/menus.json`) is gone.
  Decisions taken: flat gated wizard **inside** stages (the breadcrumb stays for jump navigation);
  page assignment — Peta Ide Materi = `/fenomena` + `/cocokkan`, Belajar Menulis Pantun = `/gagasan`
  + `/pola` + `/rima`, Karya Pantun = `/susun` (+ `/hasil`), Eksplorasi Pantun and Galeri dan Refleksi
  ship as "Segera hadir" (`available: false`) until Phase B and D fill them.
- **Phase B — game shell + Explain games. DONE (2026-09-26).** `components/GameShell.vue` (badge,
  title, instruction, "Periksa Jawaban" / "Ulangi" / "Lanjut", score line, collapsible "Kunci
  Jawaban dan Pembahasan", "Kembali ke Eksplorasi Pantun") + `composables/useGameState.js` (verdicts
  and counts). Five games shipped under `pages/game/` with all content in `content/games.json`:
  `/game/tts-pantun` (4-entry mini crossword: SAMPIRAN, ISI, RIMA, PANTUN with Mendatar/Menurun
  clues), `/game/bongkar-susun` (order 4 shuffled lines into slots 1–4), `/game/orak-arik`
  (classify lines into Sampiran / Isi baskets), `/game/melengkapi-pantun` (fill two blanks from a
  word bank), `/game/pohon-rima` (two rounds of picking words that rhyme with a reference word).
  The stage "Eksplorasi Pantun" is now `available: true` with `progressKind: "games"` — practice
  never gates the wizard, progress is tracked per game route in the store (`isGameDone`), and every
  game shows the teacher-style answer key + pembahasan after checking.
- **Phase C — Elaborate. DONE (2026-09-26).** `/susun` is now the writing screen: it gained a
  "Kamus Rima" panel (`components/RimaDictionary.vue`) that lists the two chosen suffixes, the words
  already picked and other words with the same ending from `content/rhyme-words.json`, filtered by a
  search box, and inserts a tapped word into the line currently in focus. Its actions are now
  "Simpan Draf" (store-only, shows a saved notice) and "Periksa Karyamu →", with "Kembali ke Peta Ide"
  going back to `/gagasan`. Saving to the server moved to the new review page `/tinjau`
  ("Periksa Karyamu!"): recap of name, phenomenon, gagasan, pesan, pola and rima, the PantunCard
  preview that html2canvas captures, "Simpan Karya" (the Sheets + Drive POST), save errors and a
  "Kembali ke Editor Pantun" link.
- **Phase D — Evaluate. DONE (2026-09-26).** Four new pages: `/galeri` ("Karya Pilihan Teman-Teman",
  fed by the new public `GET /api/karya/pilihan` which returns **only** works the teacher flagged, and
  only the author's first name — no Drive links, no grades), `/nilai` (Ceklist Penilaian: five
  self-assessment items, saved to the store and to the book), `/refleksi` (three reflection prompts),
  and `/buku` (Buku Karyaku: every saved work with gagasan, pesan, ceklist and refleksi, plus
  "Simpan & Unduh Buku Karya" which prints the page — "Simpan sebagai PDF" in the browser dialog).
  The teacher dashboard gained a "Tampilkan karya ini di galeri siswa" toggle, stored in the new
  Sheet column T (`Tampil di Galeri`, `GALERI_YA`), and `grade.post` now accepts a gallery-only update
  without touching the grade. Portfolios live in `localStorage` (`kotak-kreasi-buku`, max 20 works) via
  `composables/useKaryaBook.js`, so gallery/reflection/book work without a new backend table.
  Sheet1 therefore grew to 20 columns: A..Q unchanged, R Gagasan, S Pesan, T Tampil di Galeri.
- **Phase E — Engage polish. DONE (2026-09-26).** `/amati` ("Amati Fenomenanya!") leads stage 1: it
  shows one worked example as four blocks — fenomena, gagasan, pesan, contoh pantun — with chips to
  switch the example, and "Lanjutkan" hands over to `/fenomena` (marked with `intro: true` in
  `stages.json`, so the stage hub and "Mulai Berkelanjutan" surface it until step 1 is done). The
  landing page got the treasure-chest illustration (inline SVG, books + plant, brand palette).

## 5. Open decisions (need product input)

1. Flat wizard or 5-stage menu? (blocks Phase A and everything visual)
2. 4 phenomena (storyboard) or 8 (current content)?
3. Gallery: which works are public, and do we show the author's name?
4. "Unduh Buku Karya": one image per work, a multi-page PDF, or a zip?
5. Game content ownership: who writes the TTS clues, the shuffled line sets, and the fill-in blanks?
   They are content, not code, and must live in `content/*.json` for the teacher to edit.
