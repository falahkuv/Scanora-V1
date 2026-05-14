# 🧠 Algoritma & Logika Scanora

Dokumen ini menjelaskan metrik perhitungan yang digunakan untuk menentukan skor kesegaran buah dan mekanisme perubahan nilai seiring berjalannya waktu dalam sistem Inventori Scanora.

## 1. Freshness Score Algorithm
**Sumber Input:** Model Artificial Intelligence (AI) YOLOv11 yang di-_serve_ menggunakan FastAPI.

Ketika foto dikirim untuk *scanning*, AI mendeteksi kelas objek dan kondisi dominan. Selain klasifikasi (misal: "apple_ripe"), AI juga mengembalikan tingkat *confidence score* atau probabilitas hasil yang diinterpretasikan oleh Scanora sebagai **Freshness Score Initial**.

Formula Konversi:
- Sistem memastikan input selalu dikonversi menjadi persentase dalam rentang `[0.0, 1.0]`.
- Untuk kondisi buah `unripe` (mentah), sistem melakukan *bypass* dengan memberikan *Freshness Score* absolut sebesar `1.0` (100%), terlepas dari angka *confidence score* mentah. Hal ini karena proses depresiasi belum berlaku sampai buah memasuki fase `ripe`.
- Khusus untuk `Jeruk Unripe`, sistem akan memaksanya menjadi `rotten` (busuk) karena jeruk idealnya tidak akan mengalami *ripening process* setelah dipetik dari pohon.

## 2. Kalkulasi "Reminder At" (Tgl. Matang / Tgl. Kedaluwarsa)
Scanora menggunakan tabel umur simpan (shelf-life) yang didasarkan pada studi saintifik kondisi ruang penyimpanan:

| Buah | Kondisi | Min. Hari | Max. Hari | Kategori UI |
|------|---------|-----------|-----------|-------------|
| Pisang | Mentah (`unripe`) | 2 | 5 | Tgl. matang |
| Pisang | Matang (`ripe`) | 1 | 2 | Tgl. kedaluwarsa |
| Apel | Mentah (`unripe`) | 1 | 3 | Tgl. matang |
| Apel | Matang (`ripe`) | 3 | 5 | Tgl. kedaluwarsa |
| Jeruk | Matang (`ripe`) | 7 | 14 | Tgl. kedaluwarsa |

**Metrik Perhitungan Hari (*Days Estimation*):**
Algoritma melakukan interpolasi linier berdasarkan *Freshness Score Initial* di dalam range Min dan Max hari.

`Hari Estimasi = Min_Hari + Round( (Max_Hari - Min_Hari) * Freshness_Score )`

Contoh (Pisang Ripe, Score AI = `0.90`):
`1 + Round( (2 - 1) * 0.90 ) = 1 + Round(0.90) = 2 Hari`

**Output Akhir (`reminder_at`):**
Tgl penambahan ke Inventori (`addedAt`) + Hari Estimasi.

## 3. Sistem Perkembangan Perubahan Freshness Score
Score yang tersimpan di Inventori tidak selamanya berada di titik awal. *Freshness Score Latest* selalu menurun setiap harinya berdasarkan perhitungan depresiasi linier terhadap waktu yang telah berjalan (*days elapsed*).

`Score_Per_Hari = Freshness_Score_Initial / Hari_Estimasi_Maksimal`
`Freshness_Score_Latest = Freshness_Score_Initial - (Lama_Hari_Berjalan * Score_Per_Hari)`

*Catatan:*
- Nilai ini mentok pada `0.0`.
- Kondisi `unripe` ditahan pada nilai `1.0` tanpa depresiasi.

## 4. Dampak Action UI terhadap Metrik
Metrik kalkulasi di atas secara langsung mempengaruhi desain dan aksi antarmuka (UI):

### A. Perubahan Warna Indikator dan Countdown
UI Inventori menggunakan fungsi `getCountdownConfig()` untuk memberikan indikator visual yang memandu prioritas user:
- **`Unripe`**: Warna hijau brand (Scanora Green) - Teks "Siap Matang!" / "Matang X Hari Lagi".
- **`Ripe` - Sisa Waktu > 2 Hari**: Warna hijau brand (Scanora Green) - Keadaan Aman.
- **`Ripe` - Sisa Waktu = 2 Hari**: Warna kuning/orange peringatan (`bg-orange-400`).
- **`Ripe` - Sisa Waktu = 1 Hari**: Warna merah waspada (`bg-[#e02224]`).
- **`Ripe` - Hari Ini atau Lewat**: Warna abu-abu (`bg-gray-700`) - Teks "Kedaluwarsa".
- **`Rotten`**: Warna abu-abu (`bg-gray-700`) - Teks "Kedaluwarsa".

### B. Notifikasi Prioritas Beranda (Urgent Action)
Setiap buah yang memiliki `reminder_at` <= 2 hari akan dicantumkan secara otomatis pada komponen "Segera Konsumsi" di Beranda (Home).

### C. Persentase Freshness Score Badge
- **Skor >= 70%**: Warna hijau, text hijau - Kualitas optimal.
- **Skor 1% - 69%**: Warna orange, text orange - Peringatan penurunan kualitas.
- **Skor 0%**: Warna merah pekat, text putih - Kualitas habis / Busuk.
