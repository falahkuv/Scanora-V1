# 🍏 Scanora - Project Brief & Development Guide
**AI-Powered Freshness Detection: "Choose Better, Waste Less"**

## 1. Project Overview
Scanora adalah aplikasi berbasis web (*mobile-first*) yang menggunakan Computer Vision untuk memindai tingkat kesegaran, kematangan, dan kualitas komoditas buah spesifik (Apel, Jeruk, Pisang). Tujuannya adalah membantu mengurangi sampah makanan (*food waste*) di lingkup domestik.

## 2. Tech Stack & Architecture
*   **Frontend:** React.js + Vite, Tailwind CSS v4 (Mobile-first responsive, `max-w-md` container).
*   **Backend:** Node.js + Express (port 3000).
*   **AI Serving:** FastAPI + TensorFlow (port 8000). Menerima gambar dari Express, mengembalikan *inference*.
*   **Database:** PostgreSQL via Prisma ORM (disambungkan via Express).
*   **Authentication:** *No-Auth MVP* — UUID `device_id` di LocalStorage, di-*register* diam-diam ke backend sebagai user anonim untuk mendapatkan JWT token.
*   **Icons:** Lucide React.

## 3. Visual Identity & UI/UX Tokens
*   **Warna Utama:** `scanora-green` (#10b981, Emerald 500) / `scanora-dark` (#064e3b, Emerald 900).
*   **Warna Status:**
    *   *Ripe* (Matang): `status-ripe` (#f59e0b, Amber 500).
    *   *Unripe* (Belum Matang): `status-unripe` (#9ca3af, Gray 400).
    *   *Rotten* (Busuk): `status-rotten` (#ef4444, Red 500).
*   **Tipografi:** `Inter` (Google Fonts).
*   **Style Utama:** *Rounded corners* (Soft Minimalism), *Bottom Sheet Card* dengan animasi *drag up/down* untuk hasil scan.

## 4. Page Breakdown & User Flow

Aplikasi menggunakan skema **2 Halaman Utama** dengan sistem *Bottom Navigation Bar* dan 1 Halaman *Overlay* (Scanner).

### A. Beranda (Home)
*   **Header:** Sapaan simpel dan avatar anonim.
*   **Urgent Action (Highlight):** Menampilkan daftar buah dari Inventori yang `reminder_at` ≤ 2 hari ke depan. Data diambil live dari API.
*   **Impact Card:** Kartu hijau bergradient yang menampilkan total buah yang tersimpan di inventori.
*   **Call to Action:** FAB kamera di *Bottom Navigation* tengah.

### B. Scanner & Result Page (Overlay — `ScannerSheet.jsx`)
*   **Kamera Inti:** Video feed penuh layar via `navigator.mediaDevices.getUserMedia` (`facingMode: environment`).
*   **Viewfinder:** Kotak transparan dengan sudut putih sebagai panduan area bidikan.
*   **Hint Label:** Teks "Arahkan ke buah: Apel, Jeruk, atau Pisang" di bawah viewfinder.
*   **Flash Toggle:** Tombol Zap/ZapOff di pojok kanan atas, hanya muncul jika perangkat mendukung `torch` via `MediaTrackConstraints`.
*   **Galeri:** Tombol `ImageIcon` di kiri bawah untuk upload dari file/galeri perangkat. Juga muncul sebagai *fallback* ketika kamera ditolak.
*   **Notch Safety:** Top controls menggunakan `pt-12` agar tidak tertutup notch di perangkat mobile.
*   **Proses Loading:** Animasi spinner saat gambar dikirim ke AI.
*   **Bottom Sheet Result:**
    *   *Half-View:* Circular Gauge (SVG), Emoji Buah, Nama Buah, Status badge berwarna.
    *   *Full-View (drag/tap up):* Informasi teks dari AI, Skor Kesegaran %, tombol Tutup & Simpan ke Inventori.
    *   *Logic:* Foto yang di-scan OTOMATIS masuk ke **Riwayat** (via `POST /api/scan`). Tidak otomatis masuk ke **Inventori** kecuali tombol "Simpan" ditekan (via `POST /api/inventory`).

### C. Riwayat & Inventori (`Inventory.jsx`)
*   **Toggle Switch/Tabs:** Berpindah antara "Inventori" dan "Riwayat".
*   **Inventori (Grid 2 kolom):** Fruit Card berisi emoji, nama buah, status badge, dan estimasi sisa hari (berdasarkan `reminder_at`). Data live dari `GET /api/inventory`.
*   **Riwayat (List):** Item scan dengan nama buah, tanggal/jam, dan badge status. Data live dari `GET /api/scan/history`.
*   **Empty State:** Teks informatif saat data kosong.

> [!WARNING]
> **Gap yang belum diimplementasi (Target Iterasi 3):**
> - Riwayat Scan: Belum ada tombol shortcut untuk "Pindahkan ke Inventori" langsung dari list.
> - Riwayat Scan: Belum ada ikon *trash* untuk menghapus riwayat yang *miss-scan*.
> - Inventori: Belum ada ikon *trash* untuk menghapus item dari inventori.
> - Error handling: Belum ada state khusus untuk buah "Non-Target Object" (confidence rendah dari AI).
> - Saran konsumsi teks masih statis (hardcoded). Idealnya generatif via Generative AI API (Side Quest opsional).

## 5. API Endpoints yang Digunakan Frontend

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/auth/register` | Register user anonim (dari `api.js`) |
| POST | `/api/auth/login` | Login user anonim (dari `api.js`) |
| POST | `/api/scan` | Upload gambar → Prediksi AI → Simpan ke Riwayat |
| GET | `/api/scan/history` | Ambil semua riwayat scan user |
| DELETE | `/api/scan/history/:id` | Hapus item riwayat *(endpoint ada, UI belum)* |
| POST | `/api/inventory` | Simpan buah ke inventori |
| GET | `/api/inventory` | Ambil semua item inventori user |
| DELETE | `/api/inventory/:id` | Hapus item inventori *(endpoint ada, UI belum)* |

## 6. Error Handling & Edge Cases
*   **Kamera Ditolak:** Muncul pesan error + tombol "Upload dari Galeri" sebagai fallback.
*   **AI Service Mati:** Pesan error "Koneksi ke AI gagal" di Bottom Sheet dengan tombol retry.
*   **Skor AI Rendah (Non-Target Object):** *(Belum diimplementasi — target Iterasi 3)*

## 7. Cara Menjalankan (Development)

### Terminal 1 — FastAPI (AI Server, port 8000):
```bash
cd fastapi
python api_main.py
```

### Terminal 2 — Express (Backend, port 3000):
```bash
npm run dev
```
*(Sebelumnya: pastikan `.env` sudah diisi dan `npm run prisma:migrate` sudah dijalankan)*

### Terminal 3 — Vite (Frontend, port 5173):
```bash
cd frontend
npm run dev
```

## 8. Next Iterations (Backlog)

### Iterasi 3 — Polish & Detailing
*   Tombol hapus item di Riwayat Scan dan Inventori.
*   Shortcut "Pindah ke Inventori" dari card Riwayat Scan.
*   Error state untuk Non-Target Object (buah di luar Apel/Jeruk/Pisang).
*   Animasi transisi halaman (React Router + framer-motion atau CSS transitions).
*   Integrasi Generative AI API untuk saran konsumsi yang personal.
*   Deployment ke server (Vercel/Render + Railway).

### More Improvement
*   **Image Enhancement:** Preprocessing brightness/contrast untuk foto low-light.
*   **Gamifikasi & Impact Tracker:** Lacak estimasi buah yang berhasil diselamatkan per bulan.
*   **Sistem Autentikasi Penuh:** Migrasi dari UUID sementara ke Google OAuth / Email Login.