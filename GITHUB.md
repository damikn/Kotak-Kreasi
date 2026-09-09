# 📤 Panduan Push ke GitHub — Kotak Kreasi

Repository: **https://github.com/damikn/Kotak-Kreasi**

---

## 🔁 Alur Normal (Update Rutin)

Gunakan ini setiap kali ada perubahan kode yang ingin di-push.

### 1. Cek status perubahan

```bash
git status
```

Akan muncul daftar file yang berubah (modified) atau baru (untracked).

### 2. Stage file yang ingin di-commit

Stage file tertentu saja:
```bash
git add nama-file.vue
git add components/NamaKomponen.vue
```

Atau stage semua perubahan sekaligus:
```bash
git add .
```

> ⚠️ Pastikan file `.env` tidak ikut ter-stage. Cek dengan `git status` sebelum commit.

### 3. Buat commit

```bash
git commit -m "deskripsi singkat perubahan"
```

Contoh pesan commit yang baik:
```bash
git commit -m "fix: perbaiki tampilan menu di mobile"
git commit -m "feat: tambah animasi di halaman rima"
git commit -m "docs: update README"
```

### 4. Push ke GitHub

```bash
git push origin master
```

---

## 🆕 Jika Pertama Kali Setup di Komputer Baru

### 1. Clone repository

```bash
git clone https://github.com/damikn/Kotak-Kreasi.git
cd Kotak-Kreasi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Buat file `.env`

```bash
cp .env.example .env
# Lalu isi nilai di .env dengan credential yang benar
```

### 4. Jalankan development server

```bash
npm run dev
```

---

## 🔐 Aturan Penting — Jangan Push Data Sensitif

File berikut **dilarang** masuk ke GitHub dan sudah ada di `.gitignore`:

| File | Alasan |
|------|--------|
| `.env` | Berisi credential Google (private key, client email, ID) |
| `*.json` service account | Berisi private key lengkap |

Selalu verifikasi dengan `git status` sebelum commit — pastikan `.env` tidak muncul di daftar staged files.

---

## 🛠️ Skenario Khusus

### Batalkan staging file yang tidak sengaja ter-add

```bash
git restore --staged nama-file
```

### Lihat history commit

```bash
git log --oneline
```

### Lihat perubahan sebelum commit

```bash
git diff
```

### Hapus commit terakhir tapi pertahankan perubahan file

```bash
git reset HEAD~1
```

---

## ⚠️ Force Push (Gunakan Hati-hati)

Digunakan hanya jika perlu menimpa history di GitHub, misalnya untuk menghapus data sensitif yang terlanjur ter-commit.

```bash
# Amend commit terakhir (setelah stage perubahan)
git commit --amend --no-edit

# Force push — akan menimpa history GitHub
git push --force origin master
```

> ❗ Force push akan menghapus commit lama di GitHub secara permanen. Gunakan hanya jika benar-benar diperlukan.

---

## 📋 Cheat Sheet Cepat

```bash
git status                          # cek status
git add nama-file                   # stage file tertentu
git add .                           # stage semua
git commit -m "pesan commit"        # buat commit
git push origin master              # push ke GitHub
git pull origin master              # ambil update terbaru dari GitHub
git log --oneline                   # lihat history commit
```
