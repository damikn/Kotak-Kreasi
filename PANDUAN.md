# Panduan Sistem — Kotak Kreasi

Panduan ini menjelaskan cara kerja aplikasi dari awal: alur siswa, alur guru, di mana datanya
disimpan, dan hal-hal yang perlu diperhatikan saat mengoperasikannya di kelas.

Dokumen ini untuk manusia (guru dan pengelola), jadi ditulis dalam Bahasa Indonesia. Kode, komentar,
dan nama variabel tetap Bahasa Inggris.

---

## 1. Gambaran singkat

Kotak Kreasi adalah aplikasi web untuk membantu siswa SMP/SMA menulis **pantun** secara bertahap.
Alurnya dibagi **5 tahap** besar. Di dalam tahap 1, 2, dan 4 ada **6 langkah berurutan yang terkunci**
(harus selesai bertahap), sedangkan tahap 3 (latihan) dan tahap 5 (galeri & refleksi) bebas diakses.

```
Tahap 1  Peta Ide Materi        →  1. Amati Fenomenanya (contoh)
                                   2. Pilih Fenomena            (langkah terkunci 1)
                                   3. Cocokkan Gambar dan Keterangan (langkah terkunci 2)
Tahap 2  Belajar Menulis Pantun →  4. Gagasan dan Pesan         (langkah terkunci 3)
                                   5. Rangkai Pola (roda putar)  (langkah terkunci 4)
                                   6. Eksplorasi Rima (pohon rima)(langkah terkunci 5)
Tahap 3  Eksplorasi Pantun      →  5 permainan latihan (bebas, tidak mengunci alur)
Tahap 4  Karya Pantun           →  7. Tulis Pantun              (langkah terkunci 6)
                                   8. Periksa dan Simpan Karya
                                   9. Lihat Hasil Karya
Tahap 5  Galeri dan Refleksi    →  Galeri, Ceklist Penilaian, Refleksi, Buku Karyaku
```

Teknologi: Nuxt 3 + Vue 3 + Tailwind + Pinia di sisi aplikasi, Supabase (Postgres + Storage) sebagai
penyimpan karya dan gambar kartu pantun. Nilai guru tersimpan di tabel yang sama (`works`), dan gambar
dibaca lewat signed URL dari bucket privat.

---

## 2. Alur dari sisi SISWA (dari nol sampai karyanya tersimpan)

### 2.1 Masuk aplikasi
1. Siswa membuka link aplikasi. Halaman pertama meminta **nama siswa** (maksimal 20 karakter) lalu
   tekanan tombol **Mulai**.
2. Nama disimpan di perangkat (localStorage) sehingga tidak hilang saat halaman dimuat ulang.
3. Masuk ke **Menu Utama** — ada animasi kotak ajaib; kotak harus diketuk/klik untuk membuka menu.

### 2.2 Menu Utama
- Berisi **5 kartu tahap** berwarna (kuning, hijau, biru, pink, ungu) dengan keterangan progres,
  misalnya "2 dari 3 kegiatan selesai".
- Kartu yang belum waktunya terkunci, tahap yang belum dibangun bertanda 🚧 **Segera hadir**.
- Tombol **▶ Mulai Berkelanjutan** langsung mengantar ke kegiatan pertama yang belum selesai.

### 2.3 Tahap 1 — Peta Ide Materi (kuning)
1. **Amati Fenomenanya** — contoh kerja utuh dalam 4 kotak: fenomena, gagasan, pesan, dan contoh
   pantun. Ada chip untuk memilih fenomena contoh lain. Tombol **Lanjutkan** ke pemilihan fenomena.
2. **Pilih Fenomena** — 8 kartu fenomena (mis. "Terlalu Lama Bermain Gawai?"). Siswa memilih satu,
   lalu tombol **Pilih & Lanjut**.
3. **Cocokkan Gambar dan Keterangan** — papan gaya teka-teki silang: 4 kotak bernomor. Kotak 1 sudah
   terisi gambar fenomena (terkunci). Kotak 2 gagasan, kotak 3 pesan, kotak 4 baris pantun, diisi dari
   **bank jawaban** yang urutannya diacak setiap kali halaman dibuka.
   - Di HP/tablet: **ketuk jawaban lalu ketuk kotaknya**. Di komputer bisa juga **drag**.
   - Tombol **Periksa Jawaban** baru aktif kalau semua kotak terisi; hasilnya "Benar x dari 3", kotak
     yang salah jadi merah, dan tersedia **Ulangi** serta panel **Kunci Jawaban dan Pembahasan**.

### 2.4 Tahap 2 — Belajar Menulis Pantun (hijau)
4. **Gagasan dan Pesan** — dua kotak tulis: "Fenomena ini tentang apa?" dan "Apa pesan yang ingin
   disampaikan?". Sudah terisi contoh dari fenomena yang dipilih, tinggal diedit. Tombol **Simpan**
   dulu baru **Lanjutkan** aktif. Ringkasan berlabel **Gagasan dan Pesan** muncul setelah disimpan.
5. **Rangkai Pola** — roda putar berisi 12 pola pantun (repetisi awal sampiran, nama kota, nama
   hewan, angka, dan seterusnya). Siswa memutar roda, mendapat pola acak, lalu **Gunakan Pola Ini**.
6. **Eksplorasi Rima** — pohon rima SVG. Siswa memilih **dua** akhiran rima: rima A (untuk baris 1 & 3)
   dan rima B (untuk baris 2 & 4), masing-masing minimal 2 kata. Itu yang membentuk sajak A-B-A-B.

### 2.5 Tahap 3 — Eksplorasi Pantun (biru, latihan bebas)
Lima permainan, semuanya punya pola sama: **Periksa Jawaban** → skor → **Ulangi** →
**Kunci Jawaban dan Pembahasan** → **Latihan berikutnya**.

| Permainan | Yang dilakukan siswa |
|---|---|
| TTS Pantun | Mengisi teka-teki silang 4 kata silang: SAMPIRAN, ISI, RIMA, PANTUN, dengan petunjuk Mendatar dan Menurun |
| Bongkar Susun Pantun | Menyusun ulang 4 baris acak menjadi pantun utuh di slot 1–4 |
| Orak-Arik Sampiran dan Isi | Memasukkan setiap baris ke keranjang **Sampiran** atau **Isi** |
| Melengkapi Pantun | Mengisi 2 kata rumpang dari pilihan kata yang tersedia |
| Pohon Rima | 2 ronde: memilih semua daun yang bunyi akhirnya sama dengan kata acuan |

Latihan bersifat **opsional** dan tidak mengunci alur utama. Progresnya dicatat per permainan ("3 dari 5
kegiatan selesai" di kartu tahap).

### 2.6 Tahap 4 — Karya Pantun (pink)
7. **Tulis Pantun** — halaman menulis:
   - Panel **📖 Kamus Rima** di atas: menampilkan rima A dan rima B yang dipilih, kata-kata yang sudah
     dipakai, dan kata lain dengan akhiran sama (bisa dicari). **Ketuk kata = langsung masuk ke baris
     yang sedang aktif** (baris terakhir yang disentuh).
   - Empat kolom baris pantun, penghitung suku kata per baris, ceklist kesesuaian, dan pratinjau kartu.
   - Tombol **💾 Simpan Draf** (menyimpan di perangkat, muncul keterangan "Draf tersimpan") dan
     **Periksa Karyamu →**.
   - Kalau ada kaidah pantun yang belum terpenuhi, muncul modal **Petunjuk Perbaikan Pantun** dan siswa
     tidak bisa lanjut.
8. **Periksa dan Simpan Karya** — rangkuman lengkap: nama, fenomena, gagasan, pesan, pola, rima, dan
   kartu pantun. Tombol **💾 Simpan Karya** mengirim data ke rekap guru (database) dan mengunggah gambar
   kartu ke penyimpanan, lalu siswa dibawa ke halaman hasil. Karya juga otomatis masuk **Buku Karyaku**.
9. **Lihat Hasil Karya** — kartu pantun final, bisa diunduh sebagai gambar, plus tombol
   **📚 Buka Buku Karyaku**.

### 2.7 Tahap 5 — Galeri dan Refleksi (ungu)
- **Galeri Pantun** — "Karya Pilihan Teman-Teman": hanya karya yang **ditandai guru**, dan yang tampil
  hanya **nama depan** penulisnya (tanpa gambar, tanpa nilai).
- **Ceklist Penilaian** — 5 butir penilaian diri (jumlah baris, rima A-B-A-B, suku kata, kesesuaian isi,
  ejaan). Jawabannya tersimpan dan ikut ke Buku Karyaku.
- **Refleksi Belajar** — 3 pertanyaan: bagian paling seru, kesulitan dan cara mengatasinya, rencana
  perbaikan berikutnya.
- **Buku Karyaku** — kumpulan pantun siswa beserta gagasan, pesan, ceklist, dan refleksinya. Tombol
  **Simpan & Unduh Buku Karya** membuka dialog cetak; pilih **Simpan sebagai PDF** untuk mengumpulkan.

### 2.8 Aturan yang berlaku sepanjang alur
- Langkah 1–6 **terkunci berurutan**. Breadcrumb di atas halaman bisa dipakai untuk melompat ke langkah
  yang sudah terbuka; langkah terkunci menampilkan ikon 🔒.
- Kalau siswa mengganti fenomena di tengah jalan, hasil latihan mencocokkan dan gagasan/pesan ikut
  direset (karena keduanya terikat ke fenomena tersebut).
- Progres tersimpan di perangkat (localStorage), jadi **halaman bisa dimuat ulang tanpa kehilangan
  progres** pada perangkat yang sama.
- Ganti perangkat atau mode incognito = mulai dari awal lagi.

---

## 3. Alur dari sisi GURU

### 3.1 Masuk dashboard
1. Buka alamat aplikasi + `/guru` (mis. `https://domain-anda/guru`).
2. Masukkan **PIN guru** (nilai `GURU_PIN`, hanya ada di server, tidak pernah dikirim ke browser).
   PIN yang benar disimpan di perangkat supaya tidak perlu mengetik berulang.
3. PIN salah atau kosong → pesan **"PIN guru salah."** dan dashboard tidak terbuka.

### 3.2 Daftar karya siswa
- Dashboard menampilkan seluruh karya dari spreadsheet, terbaru di atas, dengan pencarian dan paginasi.
- Tiap kartu karya menampilkan: nama siswa, fenomena, pola, status (**BELUM DINILAI** / **SUDAH
  DINILAI**), dan skor otomatis.

### 3.3 Menilai satu karya
1. Klik salah satu karya → modal detail berisi: tanggal, kode karya, fenomena, gagasan, pesan, pola,
   empat baris pantun, tautan gambar kartu, dan hasil validasi kaidah.
2. Isi **nilai (0–100)** dan **komentar untuk siswa** → **Simpan Nilai** / **Perbarui Nilai**.
   Data tersimpan ke kolom nilai/komentar/status di tabel `works` — dashboard membaca tabel yang sama,
   jadi tidak ada lagi sinkronisasi ke tab ringkasan terpisah.
3. Tombol **☆ Tampilkan karya ini di galeri siswa** → karya itu muncul di halaman Galeri siswa
   (nama depan saja). Klik lagi untuk menariknya dari galeri.

### 3.4 Yang perlu diputuskan guru
- Karya mana yang layak tampil di galeri (untuk contoh dan apresiasi).
- Apakah nilai yang dipakai nilai otomatis (skor sistem) atau nilai manual yang guru isi.

---

## 4. Di mana data disimpan

### 4.1 Supabase Postgres (tabel `works`)
Satu baris = satu karya. Kolomnya:

| Kolom | Isi |
|---|---|
| `kode` | Kode Karya (unik, dipakai untuk penilaian) |
| `created_at` | Waktu penyimpanan |
| `date_label` | Tanggal tampilan format Indonesia (khusus baris hasil migrasi lama) |
| `student_name` | Nama siswa |
| `fenomena`, `gagasan`, `pesan`, `pola` | Pilihan dan isi yang diisi siswa |
| `rima_suffix`, `rima_words` | Akhiran rima (mis. `A:-i, B:-u`) dan kata rima pilihan |
| `line1`–`line4` | Baris 1–4 pantun |
| `image_path` | Path gambar di Storage (`works/<kode>.jpg`) |
| `auto_score` | Skor otomatis dari validasi kaidah |
| `grade`, `comment`, `status` | Nilai guru, komentar, `BELUM DINILAI` / `SUDAH DINILAI` |
| `gallery` | `true` kalau karya ditampilkan di galeri siswa |

Tab ringkasan **Penilaian** yang dulu ada di Sheets sudah dihapus — dashboard guru membaca tabel yang
sama, jadi tidak ada lagi data kembar.

### 4.2 Supabase Storage
Gambar kartu pantun disimpan di bucket **privat** `works-images` dengan nama `works/<kode>.jpg`.
Tidak ada link publik permanen: halaman/guru memuat gambar lewat route `/api/karya/gambar/<kode>`,
yang mengalihkan ke signed URL berumur 5 menit. Kalau unggah gambar gagal, baris karya tetap
tersimpan (hanya gambarnya yang kosong).

### 4.3 Perangkat siswa (localStorage)
| Kunci | Isi |
|---|---|
| `kotak` | Nama siswa dan seluruh progres alur (fenomena, hasil mencocokkan, gagasan/pesan, pola, rima, pantun, ceklist, refleksi) |
| `kotak-kreasi-buku` | Buku Karyaku: sampai 20 karya terakhir beserta ceklist dan refleksinya |

---

## 5. Menyiapkan dan menjalankan aplikasi

### 5.1 Variabel lingkungan yang dibutuhkan
```
SUPABASE_URL               = https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY  = <secret key dari Settings → API Keys>
SUPABASE_BUCKET            = works-images
GURU_PIN                   = <PIN dashboard guru>
```
Nilai asli disimpan di `.env` (tidak pernah masuk Git) dan di dashboard Vercel untuk versi produksi.
Di Vercel/untuk hasil build, nama variabelnya wajib ber-prefix `NUXT_` (`NUXT_SUPABASE_URL`,
`NUXT_SUPABASE_SERVICE_ROLE_KEY`, `NUXT_SUPABASE_BUCKET`, `NUXT_GURU_PIN`).

### 5.2 Perintah
```bash
npm install      # pasang dependensi
npm run dev      # server pengembangan (http://localhost:3000)
npm run build    # build produksi
npm run preview  # menjalankan hasil build
```

### 5.3 Mengubah isi pembelajaran (tanpa menyentuh kode)
| Berkas | Isi |
|---|---|
| `content/phenomena.json` | 8 fenomena: nama, ikon, deskripsi, contoh, gagasan, pesan, dan contoh pantun |
| `content/games.json` | Seluruh soal 5 permainan (petunjuk TTS, baris pantun, kotak rumpang, kata rima) |
| `content/pola.json` | 12 pola pantun untuk roda putar |
| `content/rhyme-words.json` | Bank kata per akhiran rima (untuk pohon rima dan Kamus Rima) |
| `content/pantun-rules.json` | Aturan validasi: 4 baris, 8–12 suku kata, sajak A-B-A-B |
| `content/stages.json` | Struktur 5 tahap: daftar kegiatan, nomor langkah, dan status ketersediaannya |

---

## 6. Hal yang perlu diketahui sebelum dipakai di kelas

1. **Uji sekali alur simpan** dari halaman Periksa Karya (isi nama, tulis pantun, klik Simpan Karya) dan
   pastikan barisnya muncul di tabel `works` (Supabase → Table Editor) beserta gambarnya di bucket.
2. **Gambar karya tersimpan di bucket privat** dan hanya bisa dibaca lewat signed URL berumur 5 menit —
   tidak ada lagi link gambar yang bisa disebar bebas.
3. **PIN guru 6 digit** masih bisa ditebak kalau alamatnya tersebar. Untuk pemakaian serius, ganti dengan
   token panjang atau tambahkan pembatasan percobaan.
4. **Buku Karyaku bersifat perangkat.** Karya yang dikumpulkan siswa ada di HP/laptop masing-masing;
   mintalah siswa menekan "Simpan & Unduh Buku Karya" sebelum perangkatnya berganti atau dibersihkan.
5. **Galeri kosong sampai guru menandai karya.** Itu memang perilaku yang diinginkan (privasi).
6. **Konten pantun contoh dan soal permainan disusun oleh pengembang**, bukan oleh guru bahasa. Perlu
   diperiksa dulu sebelum dipakai, terutama rima dan isi pesannya.
7. **Belum ada pengujian otomatis** di proyek ini; setiap perubahan diverifikasi dengan build + uji
   manual di browser.

---

## 7. Kalau ada masalah

| Gejala | Penyebab dan penanganan |
|---|---|
| "Konfigurasi Supabase belum diisi dengan URL dan service key yang valid." | `SUPABASE_URL` / secret key kosong atau salah. Di Vercel, set dengan prefix `NUXT_` |
| Karya tersimpan tapi gambar tidak ada | Unggah ke bucket gagal (lihat log `[save-pantun] upload gambar gagal`). Baris tetap tersimpan tanpa gambar |
| Dashboard guru kosong padahal ada karya | PIN salah (tidak akan terbuka) atau data ada di project Supabase lain — periksa `SUPABASE_URL` |
| Progres siswa hilang | Siswa berganti perangkat, memakai mode incognito, atau membersihkan data browser |
| Halaman tidak mau lanjut padahal sudah diisi | Ada kaidah pantun yang belum terpenuhi; modal Petunjuk Perbaikan akan menyebutkan bagian mana |
