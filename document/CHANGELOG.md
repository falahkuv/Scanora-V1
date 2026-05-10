# Changelog

Semua perubahan yang mencolok pada project Scanora akan didokumentasikan di dalam file ini.

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
