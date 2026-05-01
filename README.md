# 🍏 Scanora: Choose Better, Waste Less!

Halo! Selamat datang di repositori **Scanora V1** 👋 
Ini adalah aplikasi web *mobile-first* berbasis *Artificial Intelligence* (AI) yang ngebantu kamu ngecek tingkat kesegaran dan kematangan buah (fokus awal: Apel, Jeruk, dan Pisang) cuma lewat jepretan kamera! Tujuannya simpel: kita mau ngurangin *food waste* dari hal sekecil mungkin di dapur sendiri.

## 🚀 Fitur Unggulan (MVP)
- **AI Scanner Asli:** Buka kamera, arahin ke buah, dan biarkan AI kita (pakai *TensorFlow*) nilai skor kesegarannya.
- **Inventori Pintar:** Simpan hasil scan kamu, dan sistem bakal kasih tahu "Sisa berapa hari lagi nih buah layak dimakan?"
- **Dashboard Impact:** Lacak berapa banyak buah yang udah berhasil kamu selamatkan bulan ini.
- **No-Auth Ribet-ribet:** Buka aplikasinya dan langsung pakai! Identitas kamu otomatis diurus di belakang layar pakai `device_id`.

## 🛠️ Tech Stack Kita Nih
- **Frontend:** React.js, Vite, Tailwind CSS v4 (Desain cakep, responsif abis).
- **Backend (Gerbang Utama):** Node.js + Express (Ngasih data ke Frontend, nyimpan ke Database).
- **Backend AI (Otaknya):** Python + FastAPI (Ngeksekusi model Machine Learning kita).
- **Database:** PostgreSQL (Diatur rapi pakai Prisma ORM).

---

## 📖 Cara Install & Setup Lokal?
Udah kita bikinin panduan lengkap step-by-step dari nol! Langsung aja meluncur ke:
👉 **[Setup Guide & Instalasi Lengkap](document/Setup_Guide.md)**

## 📡 API Endpoints (Buat yang Suka Ngoprek)
Kalo kamu butuh dokumentasi *endpoint* atau pengen ngetes via Postman, ini list jalan tikusnya:
- `POST /api/scan` (Upload foto buat dicek AI)
- `GET /api/inventory` (Ambil daftar buah yang disimpen)
- `GET /api/scan/history` (Liat riwayat scan kamu)
*Detail auth dan format JSON bisa dicek langsung di source codenya ya.*

---
*Dibuat dengan 💚 untuk menyelamatkan buah-buahan dari tong sampah!*
