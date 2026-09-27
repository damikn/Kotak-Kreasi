# Analisis Identitas Siswa & Akses Karya — Kotak Kreasi

Dokumen konsultasi. **Belum ada perubahan kode apa pun** yang dilakukan atas dasar dokumen ini.
Ditulis dalam Bahasa Indonesia karena pembacanya pengelola/guru; istilah teknis tetap Inggris.

Isi:
1. Simulasi kasus: Budi menyimpan karya hari ini, kembali 10 hari kemudian
2. Jawaban: apakah Budi bisa melihat seluruh karyanya
3. Jawaban: apakah Budi bisa melihat karya siswa lain
4. Lubang yang ditemukan saat menganalisis
5. Kasus 15 siswa bernama "Budi": apakah crash, dan apa yang sebenarnya rusak
6. Akar masalah
7. Saran management: model Kode Siswa
8. Alternatif model identitas (0–4) beserta trade-off
9. Urutan pengerjaan bertahap
10. Keputusan yang dibutuhkan sebelum eksekusi
11. Opsi A–E (dicatat untuk nanti)

---

## 1. Simulasi: Budi, hari ini dan 10 hari kemudian

### Hari 0 — Budi menyelesaikan pantunnya
Budi mengisi nama, menuntaskan 6 langkah terkunci, lalu menekan **Simpan Karya** di halaman
"Periksa dan Simpan Karya". Saat itu terjadi empat hal sekaligus:

1. Satu baris baru di `Sheet1` dengan **Kode Karya** unik (contoh `KK-LX2K4A7`)
2. Gambar kartu pantun diunggah ke Google Drive, link-nya masuk kolom K
3. **Satu entri baru di Buku Karyaku** di perangkat itu (localStorage `kotak-kreasi-buku`) berisi
   kode, tanggal, fenomena, gagasan, pesan, pola, empat baris pantun, dan link Drive
4. Kalau Budi lanjut ke tahap Galeri dan Refleksi, jawaban ceklist dan refleksinya ditempelkan ke
   entri karya itu (bukan ke karya lain), karena penyimpanannya memakai Kode Karya

### Hari ke-10 — Budi kembali dengan ide baru
Kalau ia memakai **perangkat dan browser yang sama**:

- Halaman awal otomatis mengisi nama "Budi" (tersimpan di perangkat), jadi tidak perlu mengetik ulang
- Menekan **Mulai** membawa ke menu; tombol **Mulai Berkelanjutan** mengantar ke **editor dengan
  pantun lamanya masih terisi** — karena langkah 1–6 sudah tuntas, sistem menganggapnya
  "melanjutkan pekerjaan", bukan memulai karya baru
- Untuk memeriksa karya lama: **Menu → kartu Galeri dan Refleksi → Buku Karyaku**, atau dari halaman
  hasil lewat tombol **Buka Buku Karyaku**

---

## 2. Apakah Budi bisa melihat seluruh hasil karyanya?

**Bisa, tapi tidak "seluruhnya", dan tidak tahan ganti perangkat.** Empat batasannya:

1. **Terikat perangkat dan browser, bukan akun.** Buku Karyaku dibaca dari localStorage. Ganti HP,
   ganti browser, mode incognito, atau data browser dibersihkan → riwayat itu hilang dari
   pandangannya. Datanya sendiri tetap aman di spreadsheet guru
2. **Maksimal 20 karya terakhir.** Karya ke-21 menggeser yang paling lama keluar dari buku
3. **Hanya karya yang benar-benar tersimpan (POST berhasil).** Kalau penyimpanan gagal, atau siswa
   hanya menekan "Simpan Draf", karya itu tidak masuk buku
4. **Tidak dipisah per siswa.** Di perangkat yang dipakai bergantian, Buku Karyaku menampilkan karya
   semua siswa yang pernah memakai perangkat itu, tercampur urut waktu

---

## 3. Apakah Budi bisa melihat karya siswa lain?

**Bisa, hanya lewat Galeri Pantun "Karya Pilihan Teman-Teman"**, dengan batasan ketat:

- Hanya karya yang **ditandai guru** (kolom T = `YA`). Kalau guru belum menandai apa pun, galeri kosong
- Hanya **nama depan** yang tampil ("Budi Santoso" → "Budi")
- Maksimal **12 karya terbaru** yang bertanda
- **Tanpa** link Drive, tanpa gambar, tanpa nilai dan komentar guru
- Galeri tidak butuh PIN — siapa pun yang punya link aplikasi bisa melihat 12 karya bertanda itu

Yang **tidak bisa** dilakukan siswa sekarang:

- Melihat daftar karya milik satu siswa tertentu
- Memanggil karyanya sendiri dari server (jadi kalau ganti perangkat, riwayatnya tidak bisa diambil)
- Melihat karya teman yang belum ditandai guru

---

## 4. Lubang yang ditemukan saat menganalisis

1. **Tidak ada pintu "karya baru" dari menu.** Kasus Budi (ide baru 10 hari kemudian) tidak punya
   jalur yang wajar. Satu-satunya tombol "Buat Pantun Baru" ada di halaman hasil, dan untuk sampai
   ke sana setelah semua langkah selesai, Budi harus melewati editor lama → Periksa Karyamu →
   Simpan Karya (menyimpan karya kedua) → baru menemukan tombolnya
2. **Tombol "Kembali ke Menu Utama" di halaman hasil memanggil `resetPantun()`** — progres pantun
   (fenomena, pola, rima, empat baris) dibuang, walau nama tetap. Akibatnya "Mulai Berkelanjutan"
   mengantar ke langkah 1, bukan kembali ke pekerjaan lama. Karya lama tetap aman di Buku Karyaku
   dan spreadsheet
3. **Buku Karyaku tidak difilter per siswa** padahal setiap entri sudah menyimpan nama
4. **Tombol Keluar tidak membersihkan data lokal.** `handleKeluar()` hanya `navigateTo('/')`.
   Digabung dengan halaman awal yang otomatis mengisi nama siswa sebelumnya, di perangkat bersama
   siswa berikutnya bisa masuk sebagai siswa sebelumnya hanya dengan menekan Mulai

---

## 5. Kasus 15 siswa bernama "Budi"

### Apakah crash?

**Tidak.** Sistem tidak punya konsep "nama unik" di mana pun:

- Identitas siswa hanya string bebas di localStorage; spreadsheet hanya menambah baris, duplikat nama
  tidak masalah
- Beban 15 siswa sangat ringan. Catatan skala: dashboard membaca seluruh isi sheet setiap permintaan,
  jadi ratusan baris masih lancar; kalau sudah ribuan baris akan terasa lambat karena paginasi masih
  di sisi browser, bukan server

### Yang benar-benar rusak

1. **Guru tidak bisa membedakan 15 Budi.** Tidak ada kolom kelas, nomor absen, atau kode siswa. Sheet
   hanya punya A tanggal, B nama, C fenomena, dst. Di dashboard akan ada 15 baris "Budi" dan
   pembedanya hanya Kode Karya, tanggal, serta fenomena. Penilaian jadi menebak-nebak
2. **Perangkat bersama bocor antar siswa** (paling serius). Lihat bagian 4 butir 4: keluar tidak
   membersihkan apa pun, dan nama siswa sebelumnya sudah terisi otomatis
3. **Galeri tidak lagi berguna sebagai bahan belajar.** Dua belas kartu "Karya Budi" tanpa pembeda
   kelas membuat siswa tidak tahu mana karya siapa

---

## 6. Akar masalah

Identitas siswa = **nama tampilan**. Tidak ada kunci unik siswa. Semua fitur (Buku Karyaku, galeri,
dashboard guru) bergantung pada nama, sehingga nama yang sama otomatis bercampur.

---

## 7. Saran management: model Kode Siswa

**Prinsip: pisahkan "nama tampilan" dari "kunci data".**

### Bentuk kode
`KELAS-ABSEN-4KARAKTER` → contoh `7A-15-K9D4`.

- Nama tetap dipakai untuk tampilan di depan siswa dan guru
- Kode dipakai untuk mengambil dan memisahkan data

### Perubahan alur siswa
Halaman awal menjadi tiga langkah: **pilih kelas → nomor absen → 4 karakter kode**. Cukup sekali per
perangkat; setelah itu perangkat mengenali siswa secara otomatis.

### Perubahan spreadsheet
Tambahan kolom di ujung (tidak menggeser kolom lama):
- `U` = Kode Siswa
- `V` = Kelas

Dengan itu dashboard guru bisa memfilter per kelas dan menampilkan "Budi 7A-15" versus "Budi 7B-03".

### Halaman "Karya Saya"
Mengambil data lewat kode (`GET /api/karya/saya?kode=...`), bukan nama. Inilah yang memenuhi
**akses dari perangkat mana pun**: siswa cukup memasukkan tiga faktor tadi di perangkat baru.

### Buku Karyaku di perangkat
Difilter berdasarkan kode siswa, sehingga perangkat bersama tidak lagi mencampur karya.

### Tombol Keluar
**Wajib** membersihkan data lokal (store dan buku). Ini prasyarat mutlak untuk perangkat bersama.

### Galeri
Diberi pembeda kelas: "Budi — 7A", atau dianonimkan menjadi "Karya 7A #03". Tidak ada lagi dua belas
Budi kembar.

### Pembagian dan pengelolaan kode
- Guru membuat kode sekali dari spreadsheet, lalu mencetaknya sebagai kartu/stiker
- Pergantian semester atau kelas → kode baru; data lama tetap terhubung karena tersimpan per kode
- Keamanan: tiga faktor (kelas + absen + 4 karakter acak) membuat penebakan tidak realistis.
  Tambahan: batasi percobaan per IP dan jangan membedakan pesan "kode salah" dengan "tidak ada karya"

---

## 8. Alternatif model identitas

| Model | Cara kerja | Kelebihan | Kekurangan |
|---|---|---|---|
| 0 — tanpa perubahan | Portofolio menempel di perangkat; guru penyimpan data | Tidak ada pekerjaan tambahan, tanpa risiko baru | Tidak memenuhi akses lintas perangkat; perangkat bersama tetap bocor |
| 1 — Kode Siswa | Kelas + absen + 4 karakter acak | Seimbang: sedikit ketikan, tanpa akun, tahan ganti perangkat, guru bisa kelola dari spreadsheet | Kode harus dibagikan dan bisa hilang; masih shared secret |
| 2 — PIN siswa | PIN 4–6 digit per siswa | Paling mudah diingat | Risiko lupa PIN tinggi di usia 7–12; perlu proses reset oleh guru |
| 3 — QR / token | Kartu berisi `?t=xxxx`, cukup dipindai | Paling ramah anak, tanpa mengetik, aman (token acak panjang) | Perlu distribusi kartu, alat regenerate, dan pencetakan |
| 4 — Akun sekolah | Google Workspace / SSO sekolah | Paling kuat dan tahan lama | Butuh kebijakan ICT sekolah dan perubahan arsitektur login |

**Rekomendasi:** Model 1 untuk kondisi sekarang. Naik ke Model 3 kalau siswa dinilai kesulitan
mengetik kode atau dipakai di banyak kelas sekaligus. Model 4 kalau aplikasi ini nanti menjadi
aplikasi resmi sekolah.

---

## 9. Urutan pengerjaan bertahap

1. **Wajib dulu (kecil, dampak besar):** tambah kolom Kelas + Kode Siswa, dan tombol Keluar
   membersihkan data lokal → menutup kebocoran antar siswa
2. Filter Buku Karyaku per kode + halaman "Karya Saya" lewat kode → memenuhi akses lintas perangkat
3. Galeri berlabel kelas + filter kelas di dashboard guru
4. Opsional: QR per siswa, rate-limit lookup, dan kebijakan retensi/arsip per semester

---

## 10. Keputusan yang dibutuhkan sebelum eksekusi

1. Kode siswa berbasis **nomor absen + acak** (mudah dicetak) atau **kode penuh acak** (lebih aman)?
2. Siapa yang membuat kode: guru dari dashboard, atau diimpor dari daftar kelas sekolah?
3. Apakah siswa **boleh** melihat karya siswa lain sama sekali, atau galeri hanya untuk ditampilkan
   guru di proyektor?
4. Berapa lama data disimpan sebelum diarsipkan tiap semester?

---

## 11. Opsi A–E (dicatat, belum dikerjakan)

- **A.** Tombol "Buat Pantun Baru" di menu
- **B.** Filter Buku Karyaku per siswa yang sedang aktif
- **C.** Halaman/endpoint "Karya Saya" agar portofolio bisa diakses dari perangkat mana pun
- **D.** Naikkan batas buku dari 20 ke misalnya 50 entri
- **E.** Tombol "Kembali ke Menu Utama" di halaman hasil tidak lagi menghapus progres

Status keseluruhan: **nol eksekusi**. Dokumen ini murni analisis dan usulan untuk dibahas.
