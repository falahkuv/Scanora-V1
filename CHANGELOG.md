# Changelog

Semua perubahan yang signifikan pada proyek Scanora akan didokumentasikan dalam file ini.

## [v1.10.1] - 2026-06-02
### Changed
- **Dynamic Shelf Life Estimation**: Mengubah logika `SHELF_LIFE_RULES` di `freshnessService` dari jumlah hari statis menjadi rentang dinamis (`min` dan `max` berbeda). Kini estimasi tanggal kedaluwarsa benar-benar dihitung proporsional mengikuti *freshness score* AI.
- **Offline Suggestions**: Menyesuaikan fallback teks offline untuk Apel (1-3 hari) dan Jeruk (keterangan bahwa jeruk mentah tidak bisa matang setelah dipetik) agar selaras dengan sistem.
- **Prompt AI Anti-Halusinasi**: Memperbarui instruksi internal model OpenRouter untuk mencegah AI mengarang cara fiktif saat ditugaskan memberi saran pada buah jeruk yang masih mentah.

## [v1.10.0] - 2026-06-02
### Added
- **Push Notifications Architecture**: Mengimplementasikan endpoint pendaftaran *web push* (`POST /api/notifications/subscribe`) lengkap dengan skema `PushSubscription` di database (Prisma) serta Service Worker khusus (`push-sw.js`) untuk mendengarkan notifikasi secara *background*.
- **Daily Notification Cron Job**: Menambahkan endpoint *serverless-friendly* (`POST /api/cron/daily-notify`) yang bertugas mengirim notifikasi otomatis setiap jam 08:00 WIB untuk memberitahu user jika buah mereka siap matang, perlu segera dikonsumsi, atau sudah busuk.
- **Dark Mode di Onboarding**: Layar selamat datang kini sepenuhnya mendukung mode gelap secara dinamis mengikuti preferensi sistem.

### Changed
- **Asset Integrasi**: Mengganti teks statis logo di Sidebar dengan gambar aset `LOGO_Scanora_Color_Long.png` yang responsif.
- **Badge Kondisi UI**: Lencana status buah ("Matang", "Mentah", "Busuk") di halaman Inventori diselaraskan menggunakan palet warna solid *Light Mode* agar lebih mencolok terlepas dari tema aktif aplikasi.
- **Statistic Distribusi Buah Alignment**: Konten pada kolom *Distribusi Buah* sekarang rata atas (`justify-start`) agar judul tabel tidak bergeser turun ketika jumlah daftar buah sedikit.

### Fixed
- **Shortcut Mode Tabrakan**: Mencegah tabrakan antara fungsi internal browser dengan pintasan *shortcut* aplikasi dengan memperbarui kombinasi hotkey (`Shift + Alt + 9/0`).
- **PWA Status Bar Mismatch**: Menyinkronkan tema *Status Bar* Android/iOS melalui tag `theme-color` yang diperbarui secara dinamis saat pergantian mode gelap/terang.
- **Onboarding UX Flow**: Menonaktifkan login otomatis sebagai tamu (*Guest Account*); semua user baru kini secara eksplisit harus memilih akun (Google OAuth) atau melalui halaman Onboarding terlebih dahulu.


## [v1.9.4] - 2026-06-02
### Added
- **AI Chef Scanora Suggestion Box**: UI baru yang mendetail di `FruitDetailModal` dengan state *loading* khusus, animasi, dan format *markdown*.
- **Dynamic Mascot Images**: Maskot kini berubah dinamis berdasarkan jenis buah (Pisang, Apel, Jeruk) dan kondisinya (mentah, matang, busuk).
- **SideNav Profile Image**: `SideNav` versi Desktop kini menggunakan ikon `User` sebagai fallback (bukan inisial teks) jika belum ada foto profil.
- **Dark Mode Support**: Mode gelap (*dark mode*) yang mendukung seluruh sistem dengan penerapan `dark:bg-gray-900` di root body.
- **Dark Mode Splash Screen**: *Splash screen* (`LoadingScreen.jsx`) kini mendeteksi mode gelap sistem dan otomatis menyesuaikan warna latar untuk mencegah kilatan layar putih.

### Changed
- **Modal Consolidation**: Mengganti *modal* detail terpisah di `Home.jsx` dan `Inventory.jsx` menjadi satu komponen terpadu, yaitu `FruitDetailModal.jsx`.
- **Tab Navigation**: Membersihkan *state* pada *sticky header*. Berpindah tab kini memperbarui *state* React Router dan disorot dengan benar di SideNav.
- **Statistic Layout**: Menyelaraskan tata letak kartu "Skor Keberhasilan Terbaik" agar konsisten dengan kartu lainnya (skor di kiri bawah, bulan di kanan bawah).
- **Score Formatting**: Menyatukan lencana UI untuk label kondisi di semua halaman (`bg-orange-main text-white` untuk status Matang).
- **i18n Structure**: Merestrukturisasi `i18n.js` menjadi fungsi *builder kamus* yang berdampingan agar lebih terukur.
- **Terminology**: Mengubah "Skor Keberhasilan" / "Success Rate" menjadi "Skor Penyelamatan" dan "Rescue Score" di seluruh sistem.

### Fixed
- **Utensils Icon Crash**: Menambahkan kembali impor ikon `Utensils` yang hilang di `Home.jsx` (menyebabkan `Uncaught ReferenceError`).
- **Skeleton Dark Mode**: Rangka (*skeleton*) *loading* kini menggunakan `dark:bg-gray-700` di Beranda dan Inventori.
- **Error Handling UX**: Memperbaiki `errorHandler.js` backend agar menutupi pesan *error* Prisma/Database mentah dengan pesan yang lebih bersahabat untuk UX.
- **Prisma Schema Sync**: Generate ulang *Prisma Client* untuk menyinkronkan properti `profileImage` dan memulihkan fungsi Login.


## [v1.9.2] - 2026-05-30
### Added
- **PWA (Progressive Web App)**: Scanora kini mendukung instalasi PWA. Pengguna dapat menambahkan aplikasi langsung ke Home Screen smartphone tanpa perlu melalui App Store atau Play Store.
- **Navigasi Profil**: Menambahkan menu "Statistik Performa" dan "Install Aplikasi (PWA)" pada halaman profil untuk kemudahan navigasi.

### Changed
- **Statistik Aksi UX**: Menyederhanakan penulisan tahun (contoh: '26 menjadi 2026), memperhalus border card, menambahkan animasi *loading* dengan kalimat interaktif `"Mengumpulkan data statistikmu..."`, serta memperbaiki bug rotasi ikon *dropdown*.
- **Animasi Loading AI**: Merampingkan *skeleton loader* pada fitur "Minta Saran AI" menjadi lebih elegan (1 baris *pulse* dipadu dengan *indeterminate progress bar*) lintas halaman (`Home`, `Inventory`, dan `Scanner`).
- **Ikonografi & Warna**: Menyeragamkan warna palet utama (`orange-main` dan `scanora-green`) pada antarmuka Profil dan badge inventori. 
- **Tombol Konsumsi & Buang**: Logika UI diseragamkan sehingga buah berstatus busuk (*rotten*) di Inventori tetap dapat dieksekusi (Dikonsumsi/Dibuang).

## [v1.9.3] - 2026-05-30
### Added
- **Notifikasi Interaktif**: Klik notifikasi kini membuka detail buah yang sama seperti di Inventori.

### Changed
- **Avatar Profil**: Foto profil ditampilkan penuh dan bulat di Profil, Beranda, dan Sidebar.
- **Toggle Inventori/Riwayat**: Kontrol tab diubah menjadi slider toggle halus pada top bar dan floating bar.
- **Filter Kategori Inventori**: Warna aktif "Semua" diseragamkan ke abu-abu dan stabil saat perpindahan tab.
- **Tombol Sortir**: Tampilan "Tanggal Foto" dirapikan agar selaras dengan tombol Inventori/Riwayat (tanpa shadow).

### Fixed
- **Logout Google**: Logout kini juga sign out dari Supabase agar tidak auto-login kembali.
- **Auth Silent Login**: Auto-login device diblokir setelah logout, lalu diaktifkan kembali setelah login sukses.
- **Login Flash**: Halaman login tidak lagi muncul sesaat saat proses OAuth berlangsung.

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
