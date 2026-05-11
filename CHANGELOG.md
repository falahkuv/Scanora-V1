# Changelog

Semua perubahan yang signifikan pada proyek Scanora akan didokumentasikan dalam file ini.

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
