# 🎨 Scanora Design System

Aplikasi **Scanora** didesain dengan prinsip **Mobile-First Soft Minimalism**, memprioritaskan estetika antarmuka bersih yang responsif serta pengarahan fokus yang jelas. Panduan ini merupakan sistem desain standar yang harus diikuti pada pengembangan selanjutnya.

## 1. Tipografi
Aplikasi ini hanya menggunakan satu jenis font family utama agar tidak memberatkan _load speed_ dan menjaga konsistensi:
- **Primary Font:** `Nunito` (dengan fallback `sans-serif`)
- **Weights:** Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800)

## 2. Palet Warna (*Color Tokens*)

### A. Brand Colors
- **Scanora Green (`scanora-green`):** `#10b981` (Emerald 500) - Digunakan untuk identitas inti, *Primary Buttons*, *Progress bars*.
- **Scanora Dark (`scanora-dark`):** `#064e3b` (Emerald 900) - Digunakan untuk gradien yang lebih pekat dan efek hover.

### B. Status & Freshness Colors
- 🍊 **Ripe (`status-ripe`):** <img src="https://placehold.co/15x15/f97316/f97316.png" width="12" height="12"> `#f97316` (Orange 500) - Indikasi matang optimal / warning tingkat rendah.
- 🍏 **Unripe (`status-unripe`):** <img src="https://placehold.co/15x15/22c55e/22c55e.png" width="12" height="12"> `#22c55e` (Green 500) - Indikasi belum siap konsumsi.
- 🍎 **Rotten (`status-rotten`):** <img src="https://placehold.co/15x15/ef4444/ef4444.png" width="12" height="12"> `#ef4444` (Red 500) - Indikasi peringatan keras, kebusukan.
- 🍌 **Yellow Main (`yellow-main`):** <img src="https://placehold.co/15x15/fdc107/fdc107.png" width="12" height="12"> `#fdc107` - Warna aksen ilustrasi maskot Pisang.
- 🍊 **Orange Main (`orange-main`):** <img src="https://placehold.co/15x15/f87305/f87305.png" width="12" height="12"> `#f87305` - Warna aksen ilustrasi maskot Jeruk.
- 🍎 **Red Main (`red-main`):** <img src="https://placehold.co/15x15/e02224/e02224.png" width="12" height="12"> `#e02224` - Warna aksen ilustrasi maskot Apel dan alert *Kedaluwarsa*.

### C. System Colors
- **Backgrounds:** `bg-gray-50` (terang) / `bg-gray-900` (gelap).
- **Cards & Surfaces:** `bg-white` dengan border `border-gray-100`.
- **Text:** `text-gray-900` untuk heading, `text-gray-500` untuk secondary.

## 3. Komponen UI Inti

### A. Bottom Sheet (Scanner & Details)
Karakteristik *Scanner Modal* dan *Inventory Detail*:
- Muncul menggunakan animasi transisi `slide-up`.
- Memiliki efek `backdrop-blur-sm` di bagian latar.
- Selalu memilki sudut tumpul besar `rounded-3xl` di bagian atas atau keseluruhan pinggirannya.

### B. Card Components
- **Bentuk:** Penggunaan dominan `rounded-2xl` untuk setiap Card Item.
- **Elevasi:** Bayangan sangat halus (`shadow-sm`) dan membesar / naik ketika *hover* (`hover:-translate-y-0.5`).
- **Penyatuan Visual:** Gambar di bagian atas _card_ menyatu tanpa _padding_ samping.

### C. Buttons (Tombol CTA)
- Memiliki sudut kumpul `rounded-xl` atau `rounded-full`.
- Menimbulkan animasi mengecil 5% ketika ditekan aktif (`active:scale-95`).
- Primary button selalu menggunakan *Scanora Green* dan teks putih tebal (`font-semibold`).

### D. Badges & Labels
- Sudut kapsul memanjang (`rounded-full`) untuk status utama.
- Sudut kotak tumpul kecil (`rounded-md`) untuk indikator angka skor persentase.
- Teks menggunakan transformasi kapital absolut (`uppercase`) atau kapital tiap awal kata (`capitalize`).
- Selalu mempertahankan min-width yang stabil ketika diletakkan secara berkelompok (misal: list riwayat selalu `min-w-[72px]`).

## 4. Daftar Aset Brand
- `logo-square.png` / `LOGO_Scanora_Color_Square.png`: Logo proporsi rasio 1:1, ideal untuk loading screen dan *icon*.
- `logo-long.png` / `LOGO_Scanora_Color_Long.png`: Logo memanjang horizontal lengkap dengan nama merk, ideal diletakkan di *Header* / *Navbar*.
- `mascots/*`: Koleksi karakter antropomorfik buah berdasar 3 tingkatan kematangan, disuguhkan di Inventory dan Scanner Sheet.
