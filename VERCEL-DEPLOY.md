# 🚀 Vercel Deploy — Kotak Kreasi

Panduan setup setelah push ke GitHub, lalu deploy ke Vercel.

> ⏸️ **Status**: push ke GitHub masih ditahan (koordinasi tim). Dokumen ini siap dipakai begitu push dilakukan.

---

## 📋 Prasyarat

Sebelum mulai, pastikan hal ini udah siap:

1. **Repo GitHub**: `https://github.com/damikn/Kotak-Kreasi` (sudah ada, tinggal push)
2. **Akun Vercel**: daftar di https://vercel.com (login pakai GitHub biar gampang connect repo)
3. **Nilai-nilai konfigurasi** (yang sekarang ada di `.env` lokal):

| Variable | Dari mana | Contoh |
|----------|-----------|--------|
| `NUXT_SUPABASE_URL` | Supabase → Settings → API Keys → **Project URL** | `https://<ref>.supabase.co` |
| `NUXT_SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API Keys → tab **Publishable and secret API keys** → **secret key** | `sb_secret_...` |
| `NUXT_SUPABASE_BUCKET` | nama bucket gambar | `works-images` |
| `NUXT_GURU_PIN` | PIN dashboard guru | `856462` |

> ⚠️ Secret key Supabase (dan key lama `service_role`) **jangan pernah** masuk repo, bundle browser,
> atau log. Di lokal simpan di `.env` (sudah ter-gitignore), di Vercel cukup sebagai Environment
> Variable. Key publishable (`sb_publishable_...`) bukan penggantinya — key itu untuk kode client.

---

## 🔁 Tahap 1: Push ke GitHub

```bash
cd /home/ubuntu/Kotak-Kreasi

# Cek dulu: pastikan .env TIDAK muncul di daftar
git status

# Stage & commit
git add .
git commit -m "feat: dashboard guru, kode karya, auto-score, deploy prep"
git push origin master
```

Verifikasi di GitHub: buka repo → pastikan file **`.env` tidak ada** di daftar.

---

## 🔗 Tahap 2: Connect Repo ke Vercel

1. Buka **https://vercel.com** → login dengan **GitHub**
2. Klik **Add New… → Project**
3. Pilih repo **`Kotak-Kreasi`**
4. Vercel otomatis detect framework → **Nuxt.js** (build: `nuxt build`, output: `.output`)

> Kalau Vercel ga auto-detect Nuxt, set manual:
> - Framework Preset: **Nuxt.js**
> - Build Command: `npm run build`
> - Output Directory: (biarkan kosong / default)

---

## 🧪 Tahap 3: Isi Environment Variables

Ini bagian **paling penting** — Vercel ga baca `.env` lokal, semua harus di-set manual di dashboard.

1. Di halaman konfigurasi project, cari bagian **Environment Variables**
2. Tambahkan **satu per satu**:

| Key | Value |
|-----|-------|
| `NUXT_SUPABASE_URL` | Project URL dari Supabase → Settings → API Keys |
| `NUXT_SUPABASE_SERVICE_ROLE_KEY` | **secret key** (`sb_secret_...`) — bukan publishable |
| `NUXT_SUPABASE_BUCKET` | `works-images` |
| `NUXT_GURU_PIN` | isi PIN dashboard guru |

### Nama env di Vercel wajib pakai prefix `NUXT_`

`nuxt.config.ts` membaca `SUPABASE_*` saat build, tapi server hasil build (dan Vercel) mengambil
nilai runtime dari `NUXT_SUPABASE_URL` / `NUXT_SUPABASE_SERVICE_ROLE_KEY` / `NUXT_SUPABASE_BUCKET` /
`NUXT_GURU_PIN`. Set yang ber-prefix `NUXT_` supaya tidak bergantung pada momen build:

1. Vercel → Project → **Settings → Environment Variables**
2. Tambahkan empat variabel di atas untuk environment **Production** (dan Preview kalau mau ikut tes)
3. Simpan → **Redeploy** supaya nilai terbaca proses yang baru

> Alternatif lokal: `.env` di VPS memakai nama tanpa prefix (`SUPABASE_URL`, dst) karena dibaca saat
> `npm run dev` / build. Kalau menjalankan hasil build manual, jalankan dengan prefix `NUXT_`.

### Scope env

- **Production**: wajib
- **Preview/Development**: opsional (tapi disaranin isi juga biar preview bisa tes)

---

## 🚀 Tahap 4: Deploy

Klik **Deploy** → tunggu ±2–3 menit.

Setelah beres, aplikasi bisa diakses di:
```
https://kotak-kreasi-xxxx.vercel.app
```

(Rename domain: Vercel → Project → **Settings → Domains**)

---

## ✅ Tahap 5: Verifikasi Setelah Deploy

Buka URL produksi, tes alur lengkap:

1. **Halaman depan** → isi nama → masuk menu
2. **Alur 4 langkah** (fenomena → pola → rima → susun) → tulis pantun → **Simpan Karya**
3. **Cek Supabase** → Table Editor → tabel `works` → baris baru muncul dengan `kode` + `auto_score`;
   Storage → bucket `works-images` → objek `works/<kode>.jpg`
4. **Dashboard guru** → buka `https://<url>.vercel.app/guru` → login PIN → karya muncul → beri nilai +
   tandai "tampil di galeri" → muncul di `/galeri` dengan nama depan saja

### Troubleshooting cepat

| Gejala | Kemungkinan | Fix |
|--------|-------------|-----|
| Simpan karya → error `Konfigurasi Supabase belum diisi` | env belum ke-set, atau di-set **tanpa** prefix `NUXT_` di runtime | Cek Environment Variables Vercel |
| Error saat baca tabel: `Could not find the table 'public.works'` | `supabase/provision.sql` belum dijalankan di SQL Editor | Jalankan SQL-nya |
| Gambar 404 / `Bucket not found` | bucket `works-images` belum ada | Jalankan `provision.sql`, atau `node scripts/test-supabase.mjs` untuk cek |
| Dashboard `/guru` → `PIN guru salah` | `NUXT_GURU_PIN` beda / belum ke-set | Cek env Vercel |

---

## 🔁 Update Setelah Perubahan

Push update ke GitHub → Vercel **auto-deploy** (untuk production branch `master`). Ga perlu manual.

Kalau nambah env var baru: set di Vercel dashboard → **Redeploy** biar ke-bake.

---

## 🔐 Catatan Keamanan (belum diterapkan — perlu keputusan tim)

Beberapa hal yang aku sarankan **sebelum production dipakai beneran**, tapi masih butuh koordinasi:

1. **Drive permission `type: 'anyone'`** — **sudah beres**: gambar karya kini disimpan di bucket privat
   `works-images` dan dibaca lewat signed URL berumur 5 menit dari route `/api/karya/gambar/<kode>`.
   Tidak ada lagi link gambar publik permanen.
2. **PIN 6 digit bisa brute-force** — buat jangka panjang, ganti auth `/guru` ke token panjang (`GURU_TOKEN` 32+ char) atau login OTP Telegram. Minimal: rate-limit percobaan PIN.
3. **Akses database** — tabel `works` sudah RLS aktif tanpa policy, jadi key publishable/anon ditolak
   total; hanya service key (server) yang bisa baca-tulis. Jangan pernah pakai service key di client.

Kalau tim udah putuskan mau fix yang mana, bilang aja — siap dikerjakan sebelum push.

---

## 📦 Referensi

- [DEPLOY.md](./DEPLOY.md) — panduan deploy ke Vercel/VPS/Docker secara umum
- [GITHUB.md](./GITHUB.md) — alur push & aturan jangan commit `.env`
- [AGENTS.md](./AGENTS.md) — konfigurasi project & arsitektur server

---

*Dibuat untuk tim Kotak Kreasi — update terakhir: 18 Sep 2026*