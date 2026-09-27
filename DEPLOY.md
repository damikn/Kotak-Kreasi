# 🚀 Kotak Kreasi — Panduan Deploy

Panduan lengkap untuk deploy ke berbagai platform.

---

## Platform yang Direkomendasikan

| Platform | Cocok untuk | Gratis? | SSR? |
|----------|-------------|---------|------|
| **Vercel** | Paling mudah, otomatis | ✅ Ya | ✅ Ya |
| **Railway** | Full-stack sederhana | ✅ Ya (limited) | ✅ Ya |
| **Render** | Alternatif Railway | ✅ Ya (limited) | ✅ Ya |
| **VPS / Shared Hosting** | Kontrol penuh | 💰 Bayar | ✅ Ya |

---

## 🟢 Opsi 1: Deploy ke Vercel (Paling Mudah)

### Cara 1: Via GitHub (Direkomendasikan)

#### 1. Push project ke GitHub
```bash
# Di folder kotak-kreasi
git init
git add .
git commit -m "feat: initial kotak kreasi app"

# Buat repo baru di https://github.com/new
git remote add origin https://github.com/USERNAME/kotak-kreasi.git
git push -u origin main
```

> ⚠️ File `.env` otomatis ter-ignore oleh `.gitignore` — aman!

#### 2. Connect ke Vercel
1. Buka https://vercel.com → Login dengan GitHub
2. Klik **"New Project"** → Import repo `kotak-kreasi`
3. Framework: **Nuxt.js** (auto-detected)
4. Klik **"Environment Variables"** → Tambahkan satu per satu:

| Key | Value |
|-----|-------|
| `NUXT_SUPABASE_URL` | *(Project URL, mis. `https://<ref>.supabase.co`)* |
| `NUXT_SUPABASE_SERVICE_ROLE_KEY` | *(secret key dari Supabase → Settings → API Keys)* |
| `NUXT_SUPABASE_BUCKET` | `works-images` |
| `NUXT_GURU_PIN` | *(PIN dashboard guru)* |

5. Klik **"Deploy"** → Tunggu ±2 menit

Setelah deploy, aplikasi bisa diakses di:
```
https://kotak-kreasi.vercel.app
```

#### 3. Setup domain kustom (opsional)
Di Vercel Dashboard → Settings → Domains → tambahkan domain kamu.

---

### Cara 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (dari folder kotak-kreasi)
vercel

# Deploy ke production
vercel --prod
```

Saat ditanya environment variables, masukkan satu per satu.

---

## 🟡 Opsi 2: Deploy ke Railway

1. Buka https://railway.app → Login
2. **New Project** → **Deploy from GitHub repo**
3. Pilih repo `kotak-kreasi`
4. Railway auto-detect Nuxt → deploy otomatis
5. Di tab **Variables**, tambahkan semua env vars
6. Di **Settings** → tambahkan domain kustom

---

## 🔵 Opsi 3: Deploy ke VPS (Node.js Server)

### Build production
```bash
npm run build
```

Output di folder `.output/`. Jalankan dengan:
```bash
node .output/server/index.mjs
```

### Menggunakan PM2 (process manager)
```bash
# Install PM2
npm install -g pm2

# Jalankan
pm2 start .output/server/index.mjs --name kotak-kreasi

# Auto-start saat server reboot
pm2 startup
pm2 save

# Monitor
pm2 logs kotak-kreasi
pm2 status
```

### Menggunakan Nginx sebagai reverse proxy
```nginx
server {
    listen 80;
    server_name domain-kamu.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment variables di VPS
```bash
# Buat file .env di server (sama dengan .env lokal)
nano /path/to/kotak-kreasi/.env

# Atau export langsung
export NUXT_SUPABASE_URL="https://<ref>.supabase.co"
export NUXT_SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."
export NUXT_SUPABASE_BUCKET="works-images"
export NUXT_GURU_PIN="..."
```

---

## 🔴 Opsi 4: Docker

### Buat Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.output ./.output
EXPOSE 3000
ENV HOST=0.0.0.0 PORT=3000
CMD ["node", ".output/server/index.mjs"]
```

### Build & run
```bash
docker build -t kotak-kreasi .
docker run -p 3000:3000 \
  -e NUXT_SUPABASE_URL="https://<ref>.supabase.co" \
  -e NUXT_SUPABASE_SERVICE_ROLE_KEY="sb_secret_..." \
  -e NUXT_SUPABASE_BUCKET="works-images" \
  -e NUXT_GURU_PIN="..." \
  kotak-kreasi
```

---

## ⚠️ Catatan Penting untuk Kredensial Supabase

**Nama variabel menentukan kapan dibaca**:

- `npm run dev` dan proses build membaca nama `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
  `SUPABASE_BUCKET`, `GURU_PIN` dari `.env` (lihat `nuxt.config.ts`).
- Server hasil build (`node .output/server/index.mjs`) dan Vercel membaca override runtime dengan
  prefix `NUXT_` (`NUXT_SUPABASE_URL`, dst). Kalau di produksi yang di-set hanya nama tanpa prefix,
  semua route `/api/*` akan balas 500 "Konfigurasi Supabase belum diisi".

**Secret key** (`sb_secret_...`) dan key lama `service_role` dua-duanya didukung. Jangan pernah pakai
key publishable (`sb_publishable_...`) di server — key itu hanya untuk kode yang jalan di browser.

---

## 🧪 Verifikasi Setelah Deploy

1. Buka URL aplikasi
2. Masukkan nama siswa → klik centang
3. Ikuti alur sampai klik **Simpan Karya**
4. Cek tabel `works` (Supabase → Table Editor) → baris baru muncul dengan `kode` + `auto_score`
5. Cek bucket `works-images` (Supabase → Storage) → ada objek `works/<kode>.jpg`
6. Dashboard guru → `/guru` → masukkan PIN → karya muncul → beri nilai / tandai tampil di galeri

---

## 📊 Melihat Hasil Karya Siswa

Data tersimpan otomatis di:
- **Supabase Postgres** → tabel `works`: rekap semua pantun siswa (tanggal, nama, fenomena, gagasan,
  pesan, pola, baris pantun, skor auto, nilai + komentar guru, status, flag tampil di galeri)
- **Supabase Storage** → bucket privat `works-images`, objek `works/<kode>.jpg`. Gambar dibaca lewat
  signed URL berumur pendek melalui route `/api/karya/gambar/<kode>` — tidak ada link publik permanen

---

## 🔄 Update Aplikasi

```bash
# Pull update terbaru
git pull origin main

# Install dependency baru (jika ada)
npm install --legacy-peer-deps

# Build ulang
npm run build

# Restart (di VPS dengan PM2)
pm2 restart kotak-kreasi
```
