# 🍏 Scanora - Project Brief & Development Guide
**AI-Powered Freshness Detection: “Choose Better, Waste Less”**

## 1. Project Overview
Scanora adalah aplikasi berbasis web (*mobile-first*) yang menggunakan Computer Vision untuk memindai tingkat kesegaran, kematangan, dan kualitas komoditas buah spesifik (Apel, Jeruk, Pisang). Tujuannya adalah membantu mengurangi sampah makanan (*food waste*) di lingkup domestik.

## 2. Tech Stack & Architecture
*   **Frontend:** React.js + Vite, Tailwind CSS (Mobile-first responsive).
*   **Backend:** Node.js + Express.
*   **AI Serving:** FastAPI (Menerima gambar dari Express/Frontend, mengembalikan *inference*).
*   **Database:** PostgreSQL (Disambungkan via Express).
*   **Authentication:** *No-Auth MVP* (Menggunakan UUID `device_id` yang disimpan di LocalStorage sebagai pengenal user sementara).

## 3. Visual Identity & UI/UX Tokens
*   **Warna Utama:** Emerald Green / Forest Green (Kesegaran).
*   **Warna Peringatan (Status):**
    *   *Ripe* (Matang): Sunset Orange / Bright Yellow.
    *   *Unripe* (Belum Matang): Light Blue / Greyish.
    *   *Rotten* (Busuk/Tidak Layak): Muted Red.
*   **Tipografi:** Sans-serif modern dan *legible* (Inter, Plus Jakarta Sans, atau Lexend).
*   **Style Utama:** *Rounded corners* (Soft Minimalism), *Bottom Sheet Card* (untuk hasil scan).

## 4. Page Breakdown & User Flow

Aplikasi menggunakan skema **2 Halaman Utama** dengan sistem *Bottom Navigation Bar* dan 1 Halaman *Overlay* (Scanner).

### A. Beranda (Home)
*   **Header:** Sapaan simpel dan avatar anonim/profil singkat.
*   **Urgent Action (Highlight):** Menampilkan daftar buah dari "Inventori" yang sisa kelayakannya < 2 hari. (Menjadi prioritas visual).
*   **Call to Action:** Tombol *Floating Action Button* (FAB) "Scan" berukuran besar di navigasi bawah tengah.

### B. Scanner & Result Page (Overlay)
*   **Kamera Inti:** Layar penuh kamera dengan *viewfinder* transparan. Ada tombol integrasi *Flash* (jika browser mendukung) dan akses galeri.
*   **Proses Loading:** Animasi pemindaian saat gambar di-*post* ke backend.
*   **Bottom Sheet Result (Half-Screen):**
    *   *Muncul dari bawah* setelah hasil didapat.
    *   **Half-View (Default):** Menampilkan Skor Kesegaran (*Circular/Ring Gauge* minimalis), Ikon Buah (Apel/Jeruk/Pisang), dan Status (Ripe/Unripe/Rotten).
    *   **Swipe/Drag Up (Full Details):** Menampilkan saran konsumsi generatif (contoh: *"Pisang ini sudah sangat matang, paling cocok dijadikan smoothies atau bolu pisang!"*). Di ujung bawah terdapat tombol **"Simpan ke Inventori"**.
    *   **Swipe/Drag Down:** Menutup hasil dan langsung mengembalikan UI ke mode kamera siap jepret.
    *   *Logic:* Foto yang di-scan OTOMATIS masuk ke database **Riwayat**. Tidak otomatis masuk ke **Inventori** kecuali tombol "Simpan ke Inventori" ditekan.

### C. Riwayat & Inventori (History & Inventory Page)
*   **Toggle Switch/Tabs:** Tab untuk berpindah antara "Riwayat Scan" dan "Inventori Saya".
*   **Riwayat Scan:** 
    *   Daftar seluruh jepretan kamera (berupa *List* atau *Grid*).
    *   Setiap *item* memiliki *Shortcut Icon* (misal ikon *bookmark* atau panah) untuk memindahkan *item* tersebut langsung ke Inventori.
    *   Fitur Hapus: Ikon *trash* untuk menghapus riwayat yang *miss-scan* atau buram.
*   **Inventori:**
    *   Hanya berisi buah yang sengaja disimpan user.
    *   Ditampilkan menggunakan komponen **Fruit Card**: Berisi ikon/foto, jenis buah, status, dan estimasi sisa hari kelayakan (menjadi acuan data untuk komponen Highlight di Beranda).

## 5. Error Handling & Edge Cases
*   **Non-Target Object:** Jika skor probabilitas AI untuk Apel/Jeruk/Pisang di bawah *threshold* yang ditetapkan, *bottom sheet* muncul dengan *state error*: *"Ups! Buahnya belum terlihat jelas atau sistem kami baru bisa mengenali Apel, Jeruk, dan Pisang. Coba foto lagi ya!"*
*   **Gagal Kamera:** *Fallback* otomatis ke mode "Upload dari Galeri" jika permission kamera ditolak oleh browser.

## 6. Next Advanced Iterations (Backlog)
*   **Image Enhancement:** Menambahkan *preprocessing* otomatis (*brightness/contrast adjustment*) di *pipeline* backend/AI untuk foto yang di-*scan* pada kondisi minim cahaya (*low-light*).
*   **Gamifikasi & Impact Tracker:** Dashboard metrik sederhana di Beranda yang melacak jumlah estimasi buah/makanan yang berhasil diselamatkan user per bulan.
*   **Sistem Autentikasi Penuh:** Migrasi dari skema UUID sementara ke Google OAuth / Email Login standar.