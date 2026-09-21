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
| `GOOGLE_CLIENT_EMAIL` | file JSON service account → `client_email` | `kotak-kreasi@leafy-flash-469016-i7.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | file JSON service account → `private_key` | `-----BEGIN PRIVATE KEY-----\n...` |
| `GOOGLE_SHEETS_ID` | URL spreadsheet → bagian `d/.../` | `1RJDEVpbSNHcs5N04xnj6F5wyIBS4jhIB20wdibVu4jA` |
| `GOOGLE_DRIVE_FOLDER_ID` | ID folder Shared Drive (opsional) | `0ABC...` |
| `GURU_PIN` | bebas (PIN dashboard guru) | `856462` |

> ⚠️ File JSON service account **tidak ikut di-commit** — hanya nilainya yang dipakai (client_email + private_key). Simpan file JSON di tempat aman (password manager / lokal).

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
| `GOOGLE_CLIENT_EMAIL` | isi client_email service account |
| `GOOGLE_PRIVATE_KEY` | isi private_key **apa adanya** — termasuk `\n` literal di dalamnya |
| `GOOGLE_SHEETS_ID` | isi ID spreadsheet |
| `GOOGLE_DRIVE_FOLDER_ID` | isi ID folder (atau kosongkan kalau ga pake Drive) |
| `GURU_PIN` | isi PIN dashboard guru |

### Cara aman isi `GOOGLE_PRIVATE_KEY` di Vercel

Private key multiline bisa nyusahin. Ikuti ini:

1. Buka file `.env` lokal
2. Cari baris `GOOGLE_PRIVATE_KEY="..."` — di dalam tanda kutip itu **sudah ada literal `\n`** (backslash-n)
3. **Copy isi di antara tanda kutip** itu (termasuk `-----BEGIN PRIVATE KEY-----` dan `-----END PRIVATE KEY-----`, plus semua `\n`)
4. Paste ke Vercel apa adanya

**Jangan** paste private key yang sudah jadi baris-baris terpisah (multiline asli) — Vercel bakal salah parse.

> Opsi alternatif (lebih mudah & aman): di Vercel pakai **file service account JSON** → generate sendiri nilai `GOOGLE_PRIVATE_KEY` dari situ:
> ```bash
> # Di lokal, ambil nilai private_key + ubah newline jadi \n literal
> python3 -c "import json; k=json.load(open('kotak-kreasi-service-account.json'))['private_key']; print(k.replace(chr(10), '\\\\n'))"
> ```
> Pakai output itu sebagai value `GOOGLE_PRIVATE_KEY` di Vercel.

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
3. **Cek Google Sheets** → baris baru muncul (dengan `Kode Karya` + `Skor Auto`)
4. **Dashboard guru** → buka `https://<url>.vercel.app/guru` → login PIN → karya muncul → nilai → cek tab **Penilaian** di Sheets

### Troubleshooting cepat

| Gejala | Kemungkinan | Fix |
|--------|-------------|-----|
| Simpan karya → error `Konfigurasi Google API belum diisi` | `GOOGLE_CLIENT_EMAIL`/`GOOGLE_PRIVATE_KEY` belum ke-set di Vercel | Cek Environment Variables |
| Error `permission denied` akses Sheets | Spreadsheet belum di-share ke service account | Share `GOOGLE_CLIENT_EMAIL` sebagai Editor |
| Dashboard `/guru` → `PIN guru salah` | `GURU_PIN` beda / belum ke-set | Cek env Vercel |
| `valueInputOption` / 400 saat akses | Versi build lama | Redeploy (pull latest) |

---

## 🔁 Update Setelah Perubahan

Push update ke GitHub → Vercel **auto-deploy** (untuk production branch `master`). Ga perlu manual.

Kalau nambah env var baru: set di Vercel dashboard → **Redeploy** biar ke-bake.

---

## 🔐 Catatan Keamanan (belum diterapkan — perlu keputusan tim)

Beberapa hal yang aku sarankan **sebelum production dipakai beneran**, tapi masih butuh koordinasi:

1. **Drive permission `type: 'anyone'`** — saat ini file gambar pantun siswa di-set publik (`server/api/save-pantun.post.js` baris 94). Sebaiknya diganti: set permission khusus ke akun guru (atau pakai folder private + `webViewLink` yang di-share per-guru). **Jangan sampai gambar siswa ke-expose publik.**
2. **PIN 6 digit bisa brute-force** — buat jangka panjang, ganti auth `/guru` ke token panjang (`GURU_TOKEN` 32+ char) atau login OTP Telegram. Minimal: rate-limit percobaan PIN.
3. **Spreadsheet jangan di-share "anyone with link"** — cukup share ke akun guru + service account (Editor).

Kalau tim udah putuskan mau fix yang mana, bilang aja — siap dikerjakan sebelum push.

---

## 📦 Referensi

- [DEPLOY.md](./DEPLOY.md) — panduan deploy ke Vercel/VPS/Docker secara umum
- [GITHUB.md](./GITHUB.md) — alur push & aturan jangan commit `.env`
- [AGENTS.md](./AGENTS.md) — konfigurasi project & arsitektur server

---

*Dibuat untuk tim Kotak Kreasi — update terakhir: 18 Sep 2026*