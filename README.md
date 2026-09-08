# 📦 Kotak Kreasi

**Kotak Kreasi** adalah aplikasi web edukatif interaktif yang membantu siswa belajar membuat **pantun** melalui 4 langkah terstruktur dan menyenangkan.

🔗 **Demo:** [https://kotak-kreasi.vercel.app/](https://kotak-kreasi.vercel.app/)

---

## 🎯 Tentang Aplikasi

Kotak Kreasi dirancang untuk memudahkan siswa dalam memahami dan menciptakan pantun secara bertahap. Dengan tampilan yang ramah anak dan animasi yang menarik, proses belajar membuat pantun menjadi lebih menyenangkan.

### Alur Pembelajaran (4 Langkah)

| Langkah | Nama | Deskripsi |
|---------|------|-----------|
| 1 | 🔍 **Eksplorasi Fenomena** | Pilih topik fenomena alam atau kehidupan sebagai inspirasi pantun |
| 2 | 🎡 **Tentukan Pola** | Putar roda untuk mendapatkan pola suku kata pantun |
| 3 | 🌳 **Pilih Rima** | Ambil kata rima dari pohon kata untuk sampiran dan isi |
| 4 | 📝 **Susun Pantun** | Tulis, rangkai, dan simpan karya pantun kamu |

### Fitur Utama

- Antarmuka bertema alam yang ceria dan ramah anak
- Alur langkah-langkah terkunci (harus selesai per tahap)
- Animasi interaktif (kotak ajaib, partikel, transisi halaman)
- Simpan dan ekspor hasil pantun
- State persisten menggunakan Pinia
- Responsif untuk berbagai ukuran layar

---

## 🛠️ Tech Stack

- **[Nuxt 3](https://nuxt.com/)** — Framework Vue.js full-stack
- **[Vue 3](https://vuejs.org/)** — UI library
- **[Tailwind CSS](https://tailwindcss.com/)** — Styling utility-first
- **[Pinia](https://pinia.vuejs.org/)** — State management
- **[@nuxt/content](https://content.nuxt.com/)** — Manajemen konten (JSON/Markdown)
- **[html2canvas](https://html2canvas.hertzen.com/)** — Ekspor hasil sebagai gambar
- **[VueUse](https://vueuse.org/)** — Composable utilities

---

## 🚀 Menjalankan Secara Lokal

### Prasyarat

- Node.js >= 18
- npm / pnpm / yarn / bun

### Instalasi

```bash
npm install
```

### Development Server

Jalankan server development di `http://localhost:3000`:

```bash
npm run dev
```

### Build untuk Production

```bash
npm run build
```

### Preview Build Production

```bash
npm run preview
```

---

## 📁 Struktur Proyek

```
kotak-kreasi/
├── app/              # Konfigurasi layout dan app
├── assets/           # Aset statis (CSS global, gambar)
├── components/       # Komponen Vue yang dapat digunakan ulang
├── composables/      # Composable (termasuk store Pinia)
├── content/          # Data konten (menus.json, fenomena, kata rima, dll.)
├── pages/            # Halaman utama
│   ├── index.vue     # Halaman awal (input nama siswa)
│   ├── menu.vue      # Menu utama dengan kotak ajaib
│   ├── fenomena.vue  # Langkah 1: Eksplorasi Fenomena
│   ├── pola.vue      # Langkah 2: Tentukan Pola
│   ├── rima.vue      # Langkah 3: Pilih Rima
│   ├── susun.vue     # Langkah 4: Susun Pantun
│   └── hasil.vue     # Halaman hasil pantun
├── public/           # File publik statis
└── server/           # API server-side (Nuxt server routes)
```

---

## 🌐 Deploy

Aplikasi ini di-deploy di **Vercel**. Lihat [DEPLOY.md](./DEPLOY.md) untuk panduan deployment lengkap.

---

## 📄 Lisensi

Project ini bersifat privat dan dibuat untuk keperluan edukatif.
