# 🎨 Kotak Kreasi — Panduan Akses Lokal

Platform pembelajaran pantun interaktif untuk siswa SMP/SMA.

---

## ✅ Status Sistem

| Komponen | Status |
|----------|--------|
| Build Nuxt 3 | ✅ Berhasil |
| Google Auth (Service Account) | ✅ Terhubung |
| Google Sheets API | ✅ Aktif & berfungsi |
| Google Drive API | ✅ Aktif (folder terdeteksi) |
| Upload foto ke Drive | ⚠️ Butuh Shared Drive (lihat setup) |

**Aplikasi berfungsi penuh.** Data pantun siswa tersimpan di Google Sheets. Upload foto otomatis ke Drive aktif jika folder diubah ke Shared Drive.

---

## 📋 Prasyarat

- **Node.js** v18+ → https://nodejs.org
- **npm** v9+

```bash
node --version   # pastikan v18+
npm --version
```

---

## ⚡ Menjalankan di Lokal

```bash
# 1. Masuk ke folder project
cd "d:\xampp\htdocs\Laravel\Project\Kotak Kreasi\kotak-kreasi"

# 2. Install dependencies (cukup sekali)
npm install --legacy-peer-deps

# 3. Jalankan development server
npm run dev
```

Buka browser: **http://localhost:3000**

---

## 🔑 Konfigurasi Google API

File `.env` sudah terisi. **Jangan bagikan atau commit file ini!**

### Credential yang digunakan:
- **Service Account:** `kotak-kreasi@kotak-kreasi.iam.gserviceaccount.com`
- **Project:** `kotak-kreasi`
- **Google Sheets:** https://docs.google.com/spreadsheets/d/1Ffo8YExXKsbOb7zwpbu1qPGiSb2t-x5b_A_qor3iDjM
- **Google Drive Folder:** https://drive.google.com/drive/folders/1UM0lHGj6tfAvwL3bGnH46f9OhWC9Q21H

### API yang harus aktif (sudah diaktifkan):
- ✅ Google Sheets API
- ✅ Google Drive API

### Setup yang sudah selesai:
- ✅ Service Account sudah di-share ke Spreadsheet sebagai Editor
- ✅ Service Account sudah di-share ke folder Drive sebagai Editor

---

## ⚠️ Setup Upload Foto ke Drive (Opsional)

Saat ini upload foto ke Drive tidak aktif karena folder Drive adalah **My Drive** (Google akun personal). Service Account hanya bisa upload ke **Shared Drive**.

**Untuk mengaktifkan upload foto:**

1. Buka https://drive.google.com
2. Di sidebar kiri, klik **"Shared drives"** (Shared drive / Drive Bersama)
3. Klik **"+ New"** → beri nama: `Kotak Kreasi - Karya Siswa`
4. Klik kanan folder baru → **Manage members**
5. Tambahkan: `kotak-kreasi@kotak-kreasi.iam.gserviceaccount.com` → role: **Content manager**
6. Salin **ID folder** dari URL (bagian setelah `/folders/`)
7. Update `.env`:
   ```
   GOOGLE_DRIVE_FOLDER_ID=ID_FOLDER_SHARED_DRIVE_BARU
   ```
8. Verifikasi:
   ```bash
   node scripts/test-api.mjs
   ```

> **Tanpa Shared Drive:** Aplikasi tetap berfungsi normal. Data pantun tetap tersimpan di Google Sheets (nama, fenomena, pola, 4 baris pantun, kata rima, tanggal).

---

## 🧪 Skrip Uji

```bash
# Test koneksi semua API
node scripts/test-api.mjs

# Test simpan data ke Sheets
node scripts/test-save.mjs

# Setup Shared Drive otomatis (jika akun mendukung)
node scripts/setup-shared-drive.mjs
```

---

## 🗺️ Alur Penggunaan Aplikasi

```
http://localhost:3000       → Input nama siswa
  ↓
/menu                       → Pilih menu / mulai
  ↓
/fenomena (Step 1)          → Pilih 1 dari 10 fenomena
  ↓
/pola (Step 2)              → Spin roda → dapatkan pola pantun
  ↓
/rima (Step 3)              → Klik apel pohon → pilih ≥3 kata rima
  ↓
/susun (Step 4)             → Tulis 4 baris pantun → Simpan
  ↓
/hasil                      → Karya tersimpan ✓
```

---

## 🗂️ Struktur Folder

```
kotak-kreasi/
├── pages/               ← 7 halaman Vue
│   ├── index.vue        ← Halaman awal (input nama)
│   ├── menu.vue         ← Menu utama
│   ├── fenomena.vue     ← Step 1: Pilih fenomena
│   ├── pola.vue         ← Step 2: Spin roda pola
│   ├── rima.vue         ← Step 3: Pilih kata rima
│   ├── susun.vue        ← Step 4: Tulis pantun
│   └── hasil.vue        ← Halaman hasil
│
├── components/          ← Komponen UI
│   ├── layout/
│   │   ├── AppHeader.vue
│   │   └── StepBreadcrumb.vue
│   ├── PhenomenaCard.vue
│   ├── SpinningWheel.vue
│   ├── RhymeTree.vue
│   ├── PantunCard.vue
│   └── ConfettiEffect.vue
│
├── composables/         ← State & logic
│   ├── useKotakStore.js     ← Pinia store
│   ├── usePantunExport.js   ← html2canvas export
│   ├── useGoogleDrive.js
│   └── useGoogleSheets.js
│
├── server/api/          ← API endpoints
│   ├── save-pantun.post.js  ← Simpan ke Sheets + Drive
│   └── get-rhyme.get.js     ← Ambil kata rima
│
├── content/             ← Data JSON
│   ├── phenomena.json   ← 10 fenomena
│   ├── pola.json        ← 8 pola pantun
│   └── rhyme-words.json ← Kata rima per suffix
│
├── scripts/             ← Utilitas & testing
│   ├── test-api.mjs         ← Test koneksi Google API
│   ├── test-save.mjs        ← Test simpan ke Sheets
│   └── setup-shared-drive.mjs
│
├── assets/css/main.css  ← Tailwind + animasi
├── .env                 ← 🔑 Credential (jangan di-share!)
├── .env.example         ← Template .env
├── nuxt.config.ts
├── tailwind.config.js
├── CARA-AKSES-LOKAL.md  ← Dokumen ini
└── DEPLOY.md            ← Panduan deploy
```

---

## 🛠️ Perintah Berguna

```bash
npm run dev          # Development server (http://localhost:3000)
npm run build        # Build production
npm run preview      # Preview production build

node scripts/test-api.mjs    # Test semua API
node scripts/test-save.mjs   # Test simpan ke Sheets
```

---

## ❓ Troubleshooting

### Port 3000 sudah dipakai
```bash
npx nuxt dev --port 3001
```

### Error saat install
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Data pantun tidak muncul / halaman kosong
```bash
rm -rf .nuxt .output
npm run dev
```

### Simpan pantun gagal
1. Jalankan `node scripts/test-api.mjs`
2. Pastikan Sheets API aktif di Google Cloud Console
3. Pastikan service account sudah di-share ke Spreadsheet

### Upload foto ke Drive gagal
- Buat Shared Drive dan ikuti langkah di bagian **Setup Upload Foto** di atas
- Ini **tidak menghalangi** fungsi utama aplikasi — data tetap tersimpan di Sheets
