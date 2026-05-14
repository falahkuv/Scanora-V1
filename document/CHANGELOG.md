# Changelog

Semua perubahan yang mencolok pada project Scanora akan didokumentasikan di dalam file ini.

## [v1.5.0] - 2026-05-14

### Added
- Menambahkan **Skeleton Loading** pada *list* "Segera Konsumsi" untuk pengalaman memuat UI yang mulus.
- Menambahkan **Freshness Score Badge** menggantikan icon *chevron* (>) pada list Segera Konsumsi.
- Menambahkan icon **Sprout** di area judul Impact Kamu.
- Menambahkan *Fallback Broken Image* bertuliskan **"Gambar tidak ditemukan"** dengan style seragam apabila aset gambar hilang.

### Changed
- **Pembaruan Scanner**: Logo pada halaman pemindai diperbesar menjadi 80px, dan border scanner dipertegas dengan efek *glowing* dan diposisikan secara optimal di bagian *outer*.
- **Pembaruan Home**: Mengubah urutan metrik "Impact Kamu" menjadi *Dikonsumsi, Dibuang, Disimpan* dan menggunakan icon **Salad**. Menukar letak *section* "Impact Kamu" dengan "Segera Konsumsi".
- **Visualisasi Teks Tanggal**: Melakukan simplifikasi label menjadi **"Matang saat:"** dan **"Batas layak:"** pada *Inventory Card* serta merapikan *margin top* (0.5rem).
- **Efek Visual Item Rusak**: Item dengan status busuk atau kedaluwarsa kini memperoleh efek gelap (`opacity-60` & `brightness-95`) yang membuat visualisasinya lebih redup.
- **Warna Countdown Sisa Hari**: Mewarnai dinamis badge waktu: Hijau (menuju matang), Oranye (sisa >1 hari), Merah (sisa 1 hari), dan "Tidak Layak" untuk item busuk (Abu-abu lembut).
- **Teks Kebanggaan**: Teks *feedback* "Impact Kamu" (*pride message*) dibuat rata tengah dan semua emoji diposisikan di akhir kalimat.
- **Wording Profil**: Memperbaiki nama navigasi dari "Profile dan Pengaturan" menjadi **"Profil dan Pengaturan"** (standar EYD).
- **Autentikasi Profil**: Memastikan *Parsing* parameter profil langsung dari DB memunculkan nama panggilan *user* yang sesungguhnya serta tanggal bergabung.
- **Login UI**: Menyesuaikan latar belakang dari halaman login agar selaras dengan warna *background* ekosistem (bersih, tidak mencolok).

### Fixed
- Mengizinkan pembalikkan orientasi kamera (*flip camera*) ke *front facing* agar tidak terlihat *mirrored*.
- Menyesuaikan filter pada daftar "Segera Konsumsi" agar memuat semua item dengan *condition* "ripe" saja.
- Mengubah *font size* badge *Freshness Score* di list Segera Konsumsi menjadi lebih besar agar terbaca jelas.
- Memperbaiki perhitungan `joinDate` di Profil yang sebelumnya hanya menampilkan teks "sekarang" menjadi mem-parsing data tanggal `createdAt` yang sebenarnya.
- Menukar aksi tombol "Dikonsumsi" dan "Dibuang" yang sebelumnya terbalik di halaman *Detail Modal*.

## [v1.3.0] - 2026-05-11

### Added
- Integrasi backend Node.js dengan **Supabase Storage** untuk membuat penyimpanan gambar hasil *scan* menjadi permanen, menggantikan sistem penyimpanan sementara (*ephemeral*) dari Render.
- Endpoint `HEAD /` di server FastAPI agar berhasil merespons dan lolos sistem pengecekan jaringan (*health check*) yang ketat dari platform Render.

### Fixed
- Memperbaiki *error* `502 Bad Gateway` pada server FastAPI dengan menyelipkan *header* `Content-Length` pada Axios untuk mengatasi penolakan *chunked Request* dari *proxy* Render.
- Menyelesaikan masalah gambar gagal muat (404/alt text) di sisi frontend Vercel dengan menyimpan *URL Absolute* utuh ke dalam *database* agar letak server gambar tetap akurat.

### Changed
- Memperbarui konfigurasi alamat *Port* Uvicorn (`api_main.py`) pada FastAPI agar secara dinamis menyesuaikan dan membaca dari *Environment Variable* `PORT` yang diberikan cloud.

## [v1.2.0] - 2026-05-10

### Added
- Menambahkan tampilan daftar (Register) dan login yang simpel.
- Menambahkan opsi integrasi Single Sign-On (SSO) "Lanjut dengan Google" pada halaman autentikasi.
- Menambahkan halaman "Profile & Pengaturan" baru untuk akses profil user.
- Menambahkan fitur dan *toggle* "Dark Mode" yang berfungsi penuh serta dapat menyimpan preferensi tema pengguna.
- Menambahkan modal (*pop-up*) detail informasi buah yang muncul ketika item di bagian "Segera Konsumsi" (Beranda) di-klik.

### Changed
- Mengubah letak teks indikator jumlah item agar langsung tertera secara rapi di dalam Tab Navigasi maupun Judul (contoh: "Inventori (X)", "Riwayat (Y)", dan "Segera Konsumsi (X)").
- Memperbarui palet warna di dalam `tailwind.config.js` (menambahkan `yellow-main`, `orange-main`, `red-main`, `leaf-main`).
- Mengganti penggunaan icon `Package` menjadi `Boxes` dan icon `Clock` menjadi `History` secara menyeluruh pada aplikasi.
- Menyempurnakan desain *Empty State* (State Kosong) untuk Inventori dengan menyertakan ilustrasi tiga icon buah (Apel, Pisang, Citrus) yang diwarnai secara spesifik (`red-main`, `yellow-main`, `orange-main`).
- Mengubah orientasi icon Citrus menjadi terbalik (*flip* horizontal dan vertikal) serta sedikit memperkecil ukurannya untuk estetika.
- Menyempurnakan *alignment* perataan vertikal (*center*) dari *Empty State* untuk tab Inventori dan Riwayat agar lebih presisi.
- Memperbaiki dan mengubah *label* "Nama Lengkap" menjadi "Nama Panggilan" di form registrasi.
- Membatasi tinggi maksimum (*max-height*) pada daftar "Segera Konsumsi" di layar Beranda serta menambahkan *scrollable frame* (tanpa *scrollbar*) agar susunan tidak terlalu panjang ke bawah.
- Menonaktifkan aktivasi otomatis Dark Mode (yang dulunya membaca preferensi OS otomatis) agar tidak mengejutkan pengguna.
- Merapatkan jarak *padding* secara keseluruhan pada halaman Register dan Login.
- Mengubah judul *tab browser* secara global pada `index.html` menjadi "Scanora-V1".
- Menghapus *padding/background* membulat pada icon History saat state kosong untuk membuat tampilan lebih *clean*.
