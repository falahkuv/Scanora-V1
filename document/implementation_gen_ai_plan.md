# Implementation Plan - Integrasi Gemini 3 Flash untuk Resep & Tips Antihanyut (Food Waste)

Dokumen ini mendefinisikan rencana integrasi kecerdasan buatan generatif Google Gemini ke dalam proyek **Scanora V1** untuk menghadirkan tips penyimpanan personal dan resep makanan darurat guna mencegah pemborosan makanan (_food waste prevention_).

---

## Model Gemini yang Dipilih

Berdasarkan ketersediaan model dan stabilitas untuk produksi:

- **Model Pilihan (Default):** **`gemini-2.5-flash`**.
- **Mekanisme Fallback:** Sistem akan memprioritaskan `gemini-2.5-flash`. Namun, sebelum dipanggil, sistem akan mengecek daftar model via API/SDK. Jika `gemini-2.5-flash` tidak tersedia di API Key pengguna (misal karena _deprecation_ di masa depan), sistem akan otomatis mencari model turunan keluarga `flash` lainnya sebagai _fallback_.
- **Alasan Pemilihan (Keluarga Flash):**
  - **Kecepatan Super:** Latensi sangat rendah (di bawah 1.5 detik), sangat penting untuk kenyamanan pengguna perangkat mobile saat membuka lembar hasil pemindaian.
  - **Cost-Efficient / Free-Tier Friendly:** Memiliki batas kuota gratis yang longgar untuk keperluan pengerjaan capstone/skripsi.
  - **Multilingual:** Sangat fasih berbahasa Indonesia yang santai, terstruktur, dan ramah.

---

## Usulan Arsitektur: Lazy-Loading dengan Caching Database

Untuk memastikan kecepatan pemindaian awal tetap kencang ($<500\text{ ms}$), kita akan menerapkan **Lazy-Loading**:

1.  **Scan Awal (Cepat):** Pengguna men-scan buah $\rightarrow$ model TensorFlow lokal memproses gambar $\rightarrow$ langsung mengembalikan klasifikasi dan skor kesegaran secara instan.
2.  **Generasi AI (Latar Belakang):** Begitu hasil scan keluar, Frontend akan memanggil endpoint `/api/scan/suggestion` di latar belakang secara asinkron.
3.  **Caching (Hemat & Cepat):** Hasil saran dari Gemini akan langsung disimpan ke kolom `ai_suggestion` di database. Kunjungan berikutnya ke detail buah ini tidak akan memanggil API Gemini lagi, melainkan mengambil data cache dari PostgreSQL.

---

## Desain Prompt & System Instruction Gemini

Agar Gemini memberikan jawaban yang sangat terstruktur, padat, dan ramah pengguna, kita akan mendefinisikan instruksi prompt yang spesifik:

### 1. System Instruction (Mengatur Karakter & Peran AI)

```text
Anda adalah "Scanora", asisten cerdas dan pejuang Zero Food Waste.
Tugas Anda adalah memberikan saran instan, ramah, dan solutif untuk mengelola Apel, Jeruk, atau Pisang berdasarkan hasil scan (jenis buah, kondisi ripeness, dan tingkat kesegaran (%)) agar terhindar dari tempat sampah.

Gaya Komunikasi: 
- Ramah, bersemangat, dan kekinian (cocok untuk anak muda & keluarga di Indonesia).
- Tanpa basa-basi atau salam pembuka panjang. Langsung berikan solusi.

Aturan Format Wajib:
- SANGAT RINGKAS: Maksimal 3 kalimat pendek ATAU 2 poin ringkas.
- SPESIFIK: Saran harus masuk akal untuk jenis buah yang di-scan (misal: jangan sarankan kulit pisang untuk eco-enzyme jika kompos lebih mudah).
- PRAKTIS: Berikan langkah yang bisa langsung dilakukan di dapur rumah tangga saat itu juga.
```

### 2. Dinamis Prompt Generator (Input Data Sensus)

```javascript
const prompt = `
Hasil Scanora:
- Buah: ${fruitType}
- Kondisi: ${condition}
- Kesegaran: ${freshnessScore}%

Berdasarkan data di atas, berikan saran spesifik:
- Jika "Mentah" (mentah / 100%): Berikan 1 trik penyimpanan ajaib agar buah ini matang sempurna dan manis.
- Jika "Matang" (matang / 65-100%): 
  1. Jika skor masih tinggi (>85%), sarankan konsumsi segar. 
  2. Jika skor mulai rendah (<85%), berikan peringatan urgensi ("Segera habiskan!") atau sarankan untuk dimakan langsung dan 1 ide resep penyelamat kilat (misal: smoothies/olahan lainnya).
- Jika "Busuk" (busuk / <50%): Jangan menghakimi. Berikan 1 cara praktis mengolah sisa buah ini (seperti kompos atau pupuk tanaman) agar tidak berujung di TPA (Tempat Pembuangan Akhir).
`;
```

---

## Strategi Ketahanan Sistem (Offline & Error Fallback)

Untuk memastikan aplikasi **Scanora V1** Anda 100% andal bahkan ketika server kehilangan koneksi internet atau API Gemini mengalami gangguan (Outage/Rate Limit), kita akan menerapkan **"Hybrid-Fallback Architecture"**:

### 1. File Penyelamat Lokal (`offlineSuggestions.json`)

Kita akan membuat file konfigurasi lokal di backend `src/config/offlineSuggestions.json` yang menyimpan 9 saran standar terkurasi untuk setiap kombinasi buah dan kondisi.

### 2. Logika Graceful Degradation (Try-Catch Fallback)

Di dalam `geminiService.js`, proses pemanggilan API Gemini akan dibungkus dalam blok `try-catch`.

- **Kondisi Normal (Online):** Memanggil Gemini API $\rightarrow$ mengembalikan resep & tips dinamis yang unik.
- **Kondisi Gangguan (Offline / API Error):** Jika pemanggilan API gagal, sistem akan langsung menangkap error tersebut, membaca `offlineSuggestions.json` secara lokal, dan mengembalikan saran kurasi standar secara instan.
- _Hasil:_ Pengguna sama sekali tidak menyadari adanya gangguan koneksi internet ke Gemini karena saran tetap muncul di layar dengan sukses!

---

## Rencana Perubahan Kode

### 1. Database & ORM (Prisma Schema)

Kita perlu menambahkan kolom `aiSuggestion` di tabel `ScanHistory` dan `Inventory` untuk menyimpan teks saran dari AI.

#### [MODIFY] [schema.prisma](file:///d:/Scanora-V1/prisma/schema.prisma)

- Tambahkan kolom `aiSuggestion String? @map("ai_suggestion")` ke dalam model `ScanHistory`.
- Tambahkan kolom `aiSuggestion String? @map("ai_suggestion")` ke dalam model `Inventory`.
- Jalankan migrasi Prisma: `npm run prisma:generate` dan `npx prisma migrate dev --name add_ai_suggestion`.

---

### 2. Backend (Node.js/Express)

#### [NEW] [geminiService.js](file:///d:/Scanora-V1/src/services/geminiService.js)

- Buat berkas pembantu (_helper service_) untuk memanggil SDK resmi Google Generative AI (`@google/generative-ai`) dengan menggunakan model utama `gemini-2.5-flash`.
- Tambahkan logika **Fallback Model Fetching**: Jika model utama gagal atau tidak tersedia, sistem akan otomatis melakukan `getModels()` untuk mengambil model `flash` alternatif yang tersedia.
- Tambahkan logika **Translasi Label (If-Else)** sebelum mengirim prompt ke Gemini. Karena model AI membaca data bahasa Inggris dari FastAPI (misal: `Apple`, `unripe`), ubah terlebih dahulu menjadi bahasa Indonesia (misal: `Apel`, `Mentah`) dengan *if-else* agar respon Chef Scanora lebih natural.
- Konfigurasikan sistem instruksi agar Gemini bertindak sebagai asisten dapur anti-food-waste dan mengembalikan output terstruktur (saran penyimpanan + resep darurat singkat).

#### [MODIFY] [scanController.js](file:///d:/Scanora-V1/src/controllers/scanController.js)

- Tambahkan fungsi controller baru `getScanSuggestion` yang bertugas:
  1. Cek apakah record `ScanHistory` terkait memiliki kelas `Others` atau `others`. Jika ya, langsung kembalikan pesan statis (misal: "Bukan buah yang dikenali") tanpa memanggil Gemini API.
  2. Jika bukan kelas `Others`, cek apakah sudah memiliki `aiSuggestion` di database.
  3. Jika sudah ada, langsung kembalikan (_Cache Hit_).
  4. Jika belum ada, panggil `geminiService` untuk menggenerasi saran baru, simpan ke database, lalu kembalikan (_Cache Miss_).
- Sesuaikan respon controller `/api/scan` agar menyertakan data jika diperlukan.

#### [MODIFY] [inventoryController.js](file:///d:/Scanora-V1/src/controllers/inventoryController.js)

- Sesuaikan `addInventory` agar menyalin kolom `aiSuggestion` dari `ScanHistory` ke `Inventory` saat pengguna menekan tombol "Simpan ke Inventori".
- Sesuaikan data pengembalian `getInventory` untuk menyertakan `ai_suggestion`.

#### [MODIFY] [.env.example](file:///d:/Scanora-V1/.env.example) & `.env`

- Tambahkan variabel lingkungan baru: `GEMINI_API_KEY=your_gemini_api_key_here`.

---

### 3. Frontend (React.js)

#### [MODIFY] [ScannerSheet.jsx](file:///d:/Scanora-V1/frontend/src/components/ScannerSheet.jsx)

- Tambahkan _state_ baru `isLoadingTips` (boolean) dan `aiSuggestion` (string).
- Setelah berhasil memanggil endpoint `/api/scan`, picu pemanggilan API asinkron baru ke `/api/scan/:id/suggestion` untuk mengambil tips AI di latar belakang.
- Tampilkan teks saran AI yang dinamis di bagian lembaran bawah (_Bottom Sheet_ - Full View), lengkap dengan animasi _shimmer loading_ yang premium saat data sedang dimuat.

#### [MODIFY] [Home.jsx](file:///d:/Scanora-V1/frontend/src/pages/Home.jsx)

- Modifikasi Modal Detail Inventori agar membaca field `ai_suggestion` dari buah yang tersimpan.
- Tampilkan saran penyimpanan / resep masakan di dalam kotak berwarna hijau muda yang cantik dan elegan di atas tombol aksi "Dikonsumsi / Dibuang".

---

## Rencana Pengujian & Verifikasi

### Pengujian Otomatis & Integrasi:

- Verifikasi instalasi paket `@google/generative-ai` di backend.
- Uji koneksi API Gemini dengan membuat skrip tes kecil (`test-gemini.js`).
- Pastikan migrasi Prisma sukses dan kolom baru `ai_suggestion` terbuat di database PostgreSQL lokal.

### Pengujian Manual:

1.  **Skenario Scan Awal:** Buka kamera, foto buah apel segar. Verifikasi bahwa hasil scan (Apel - Ripe) muncul instan, dan tulisan "Memuat saran dapur AI..." muncul sebentar sebelum berganti menjadi tips pengawetan dari Gemini.
2.  **Skenario Buka Detail:** Masuk ke menu Inventori utama, lalu klik buah yang baru disimpan. Verifikasi bahwa detail buah langsung menampilkan tips AI secara instan (mengambil dari cache database) tanpa ada layar loading tambahan.
3.  **Skenario Tanpa Koneksi / API Error:** Matikan koneksi internet / hapus API key. Pastikan aplikasi tidak _crash_ dan menampilkan pesan fallback alternatif yang elegan.
