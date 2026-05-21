# Changelog

Semua perubahan yang signifikan pada proyek Scanora akan didokumentasikan dalam file ini.

## [v1.7.0] - 2026-05-21
### Added
- **Viewport Switcher & Responsiveness**: Implementasi fitur toggle responsif (Dekstop/Tablet/Mobile) dan penggunaan ikon navigasi yang berbeda (🍎 untuk Localhost, 🍊 untuk Web Asli).
- **Scanner UI**: Menambahkan latar belakang gelap dinamis (`backdrop-blur-sm`) pada modal scanner.

### Changed
- **Sidebar & Beranda**: Pemosisian ulang tombol Scan Buah yang lebih besar ke area atas. Profil dipindah ke paling bawah. Penyesuaian tata letak grid dan statistik pada versi Desktop/Tablet (sekarang 3 kolom).
- **Logika Kesegaran**: Perbaikan logika status buah (pisang unripe dengan skor 100% kini tampil sebagai "Siap Matang").

### Fixed
- Tampilan tanggal pada modal dibuat tidak bold (reguler).
- Perbaikan layout dan konsistensi ukuran filter dropdown.

## [v1.4.0] - 2026-05-11
### Added
- **Freshness Service**: Node.js service (`freshnessService.js`) untuk menghitung skor kesegaran dan estimasi kadaluwarsa buah (Pisang, Apel, Jeruk) secara terpusat, lengkap dengan dokumentasi riset (`penyimpananbuah.md`).
- **Maskot & UI Dinamis**: Menambahkan aset maskot interaktif di `frontend/public/mascots/` dan animasi progres *Freshness Score* menggunakan `ChevronRight`.
- **Validasi Gambar**: Buah yang tidak dikenali AI kini langsung memunculkan peringatan *"Objek tidak dikenali, silakan foto ulang buah Anda"* dan tidak diizinkan masuk ke database.

### Changed
- **Node.js REST API**: Memindahkan seluruh logika bisnis dan perhitungan prediksi tanggal dari Python FastAPI ke backend Node.js (Prinsip pemisahan *concern*). FastAPI kini fokus eksklusif pada inferensi model.
- **UI Inventory**: Total perombakan tampilan antarmuka *Inventory* & *ScannerSheet* dengan padding presisi, rasio gambar 1:1 (`aspect-square`), dan komponen detail *pop-up* yang bersih dan informatif.
- **Aturan Bisnis (Jeruk)**: Logika deteksi "Jeruk Unripe" diubah langsung menjadi "Rotten", mengingat jeruk tidak bisa lanjut matang setelah dipetik dari pohon.

### Fixed
- **Sync & Bugs UI**: Memperbaiki masalah sinkronisasi UI saat item dihapus/dikonsumsi/dibuang.
- Mengubah *event listener* `scanora:inventoryUpdated` agar daftar inventori ter-update *real-time* setelah pemindaian tanpa perlu memuat ulang halaman.
