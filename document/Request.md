# Request / Task Summary

## 1. Analisis Perbedaan Versi Python API (`api_main.py` vs `api_main_new.py`)
Berdasarkan perbandingan antara `api_main.py` (lama) dan `api_main_new.py` (baru):
*   **Logika Freshness Score:** Versi baru menggunakan pengali berbasis desimal (`* 0.35` dan `* 0.25`) untuk kalkulasi `freshness_score` alih-alih nilai puluhan (`* 35` dan `* 25`), yang mana ini mencegah skor menjadi di atas 100 atau tidak logis.
*   **Fitur Estimasi:** Versi baru menambahkan proses `estimations = get_all_estimations(product, condition)` dan menyertakannya di dalam blok respons API.
*   **Route HEAD:** Route `@app.head("/")` yang tadinya ada di versi lama telah dihapus di versi baru (padahal biasanya ini berguna untuk pengecekan Uptime/Health check di beberapa platform hosting).

## 2. Best Practice: Pemindahan Logika "Estimation Dates" ke Backend (Node.js)
Terkait adanya *Estimation Dates* yang di-*handle* oleh layanan Python FastAPI, direkomendasikan untuk **memindahkan seluruh logika estimasi (business logic) tersebut ke Backend utama (Node.js)**. 

**Alasan Utama:**
1.  **Separation of Concerns:** Layanan FastAPI idealnya difungsikan murni sebagai *Computational Endpoint* (hanya memproses gambar masuk dan mengeluarkan probabilitas/prediksi: *Apel, Matang, 90%*). Sedangkan *Business Logic* seperti menentukan rentang tanggal kedaluwarsa, poin gamifikasi, dan manipulasi data harusnya berada di Node.js.
2.  **Maintainability & Kecepatan Deployment:** Jika aturan rentang kedaluwarsa berubah (misalnya: masa simpan Pisang berubah dari 3 hari menjadi 5 hari), tim tidak perlu melakukan *re-deploy* layanan Machine Learning yang umumnya lebih berat dan lama karena *dependency* (TensorFlow, dsb). Cukup mengubah satu baris di Node.js yang sangat ringan dan terpusat dengan database.

**Rekomendasi Aksi:**
*   **Tim AI/Python:** Hapus logika *date estimation* dari `api_main.py` (mengembalikan API menjadi sekadar pengklasifikasi).
*   **Tim Backend (Node.js):** Pindahkan mapping *date estimation* ke dalam `scanController.js` atau sebuah *service utility* di Express, lalu proses logika tanggal setelah menerima hasil prediksi mentah dari FastAPI, sebelum menuliskannya ke Database.
