# Changelog

Semua perubahan yang signifikan pada proyek Scanora akan didokumentasikan dalam file ini.

## [v1.9.0] - 2026-05-30
### Added
- **API Statistik Bulanan (`/inventory/monthly-stats`)**: Endpoint baru untuk mengakumulasi data "Dikonsumsi" dan "Dibuang" per bulan dari backend.
- **Data Toggle Override (Alt+1)**: Menambahkan *shortcut* rahasia pada halaman Statistik untuk melakukan transisi secara instan antara Data Asli (Database) dan Data Sample.
- **Empty State Statistik**: Menampilkan desain ilustrasi responsif saat pengguna belum memiliki riwayat aksi pembuangan atau konsumsi buah.

### Changed
- **Pembaruan Visual Statistik Aksi**: Mendesain ulang bagian *Skor Keberhasilan Terbaik* agar menggunakan gaya UI modern dan mengubah tombol menjadi filter interaktif berdasarkan bulan.
- **Penyelarasan Warna**: Memperbaiki deklarasi warna `orange-main` di `tailwind.config.js` sehingga seragam menggunakan format heksadesimal standar Tailwind (#f97316).
- **Animasi Loading AI**: Menyeragamkan transisi pemuatan *Saran AI* di seluruh aplikasi dengan menampilkan teks dan indikator tulang (*skeleton/shimmer effect*) yang *smooth* selayaknya pada halaman *Scanner*.
- **Penyesuaian Istilah**: Mengubah semua penyebutan label "Tingkat Keberhasilan" menjadi "Skor Keberhasilan".
## [v1.8.1] - 2026-05-29
### Fixed
- **Freshness Score Decay**: Memperbaiki masalah *bug* di `freshnessService.js` di mana *freshness score* buah yang bertransisi dari *unripe* (mentah) ke *ripe* (matang) turun terlalu cepat hingga 0%. Kini perhitungan *decay* menggunakan *base date* yang dikalkulasi secara dinamis sejak buah benar-benar matang.
- **Auto-Transition Ripe to Rotten**: Menambahkan logika *auto-transition* baru di `inventoryController.js` agar buah yang berstatus *ripe* dan telah melewati batas kedaluwarsanya otomatis berubah menjadi *rotten* (busuk), sehingga tidak tertahan di status matang selamanya dengan skor 0.
## [v1.8.0] - 2026-05-24
### Added
- **Halaman Statistik Aksi (`/stats`)**: Halaman baru dengan animasi *page-in*, dibangun ulang menggunakan **Chart.js + react-chartjs-2**. Menampilkan dua section utama:
  - *Performa Bulan Ini*: Navigasi antar bulan (← →), kartu stat Dibuang/Dikonsumsi/Disimpan, dan progress bar Save Rate.
  - *Overview*: Kartu highlight (Buah Favorit & Save Rate Terbaik), Bar Chart riwayat performa dengan efek *focus bar* pada bulan aktif, dan Pie Chart komposisi jenis buah.
- **Profile Footer**: Menambahkan *footer* versi aplikasi di halaman Profil dengan teks `"Scanora · v1.8.0 Beta · Mei 2026"`, slogan *"Choose Better, Waste Less."*, dan hak cipta `© 2026 Scanora`.

### Changed
- **Home — Section Performa**: Mengubah judul `"Impact Kamu"` → `"Performa Bulan Ini"` dan menambahkan tombol `"Detail"` (abu-abu, tanpa ikon) yang mengarahkan ke halaman `/stats`.
- **App Routing**: Route `/stats` didaftarkan dan *Bottom Nav* disembunyikan otomatis saat berada di halaman statistik.
- **Statistik Aksi — Layout**: Layout didesain ulang dengan dua section terstruktur (*Performa Bulan Ini* dan *Overview*). Sub-heading menggunakan teks tanpa ikon untuk tampilan yang lebih bersih. Radius komponen diseragamkan ke `rounded-xl` (tidak terlalu rounded).
- **Bar Chart**: Urutan bar diperbaiki — *Dibuang* tampil pertama (kiri), *Dikonsumsi* kedua. Warna legend dan bar kini dikelola Chart.js secara konsisten.

## [v1.7.1] - 2026-05-24
### Added
- **Category Filter Pills**: Menambahkan filter kategori dinamis (Semua, Ripe, Unripe, Rotten) pada halaman Inventori untuk memudahkan sortir buah.
- **Scanner Image Cropping**: Gambar hasil tangkapan kamera kini akan di-crop otomatis sesuai kotak *viewfinder* (crosshair) untuk hasil yang presisi.

### Changed
- **UI & Viewport Standardization**: Memperhalus padding, margin, styling `capitalize`, dan standarisasi ukuran serta animasi komponen lintas viewport (Mobile S hingga Laptop 1024px).
- **Notifikasi Push UX**: Penataan ulang *layout* profil agar tombol Notifikasi Push tidak tertumpuk dengan teks berlebih. Penambahan *softfeather mask* pada daftar Segera Konsumsi.

### Fixed
- **Countdown Auto-Transition**: Perbaikan *bug* krusial pada backend (`inventoryController.js`) di mana buah yang berstatus `unripe` kini akan otomatis bertransisi menjadi `ripe` saat melewati tanggal matang, lalu mengkalkulasi ulang sisa umur kesegaran barunya secara *real-time*.
- Penyesuaian warna `Kedaluwarsa` dan Freshness Score 0% menjadi `#8e0610` untuk urgensi seragam.

## [v1.7.1] - 2026-05-25
### Changed
- **Real-Time UI Condition Sync**: Mengubah logika tampilan antarmuka (UI) Inventori agar badge status buah memprioritaskan kondisi terkini (`condition_latest`). Kini, badge "Mentah" (Unripe) akan otomatis berubah menjadi "Matang" (Ripe), dan badge "Matang" akan otomatis berubah menjadi "Busuk" (Rotten) ketika usianya sudah habis. Hal ini membuat tampilan antarmuka tersinkronisasi penuh dengan logika AI secara *real-time*.

### Fixed
- **Sinkronisasi AI Suggestion**: Memperbaiki masalah ketidaksinkronan kondisi buah dengan saran AI di `scanController.js`. Kondisi buah mentah (*unripe*) yang sudah masuk masa matang (*ripe*), serta buah matang yang sudah busuk/kedaluwarsa (skor kesegaran <= 0%), kini otomatis disesuaikan secara *real-time* sebelum dikirimkan ke AI, sehingga Chef Scanora selalu memberikan saran yang akurat.

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
