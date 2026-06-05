# 🍏 Scanora: Choose Better, Waste Less!

Halo! Selamat datang di repositori **Scanora V1** 👋 
Ini adalah aplikasi web *mobile-first* berbasis *Artificial Intelligence* (AI) yang ngebantu kamu ngecek tingkat kesegaran dan kematangan buah (fokus awal: Apel, Jeruk, dan Pisang) cuma lewat jepretan kamera! Tujuannya simpel: kita mau ngurangin *food waste* dari hal sekecil mungkin di dapur sendiri.

## 🚀 Fitur Unggulan (MVP)
- **AI Scanner Asli:** Buka kamera, arahin ke buah, dan biarkan AI kita (pakai *TensorFlow*) nilai skor kesegarannya.
- **Inventori Pintar:** Simpan hasil scan kamu, dan sistem bakal kasih tahu "Sisa berapa hari lagi nih buah layak dimakan?"
- **Dashboard Impact:** Lacak berapa banyak buah yang udah berhasil kamu selamatkan bulan ini.
- **Autentikasi Aman & Mudah:** Login tanpa ribet dengan Email/Password atau Google OAuth. Progres, riwayat, dan inventori buahmu aman tersimpan di cloud antar perangkat!

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

## Requirements

- Node.js 18+
- PostgreSQL 14+

## Setup

1. Install dependencies:
   - `npm install`
2. Copy environment file:
   - `cp .env.example .env`
3. Update `.env` values (DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN).

## Prisma

- Generate Prisma client:
  - `npm run prisma:generate`
- Run migrations (ask for confirmation before running):
  - `npm run prisma:migrate`

## Run the server

- Development:
  - `npm run dev`
- Production:
  - `npm start`

## Run the AI service (FastAPI)

1. Ensure the model file exists:
  - `fastapi/fruit_model.keras`
2. Activate the Python venv:
  - `source .venv/bin/activate`
3. Start the FastAPI service:
  - `python fastapi/api_main.py`
4. Verify it is running:
  - Open `http://localhost:8000`

## API Response Format

All endpoints return:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

## Testing

1. Create a test env file (optional but recommended):
  - `cp .env.example .env.test`
  - Update `DATABASE_URL` to a test database.
2. Run the tests:
  - `npm test`

## Endpoints

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/scan`
- `GET /api/scan/history`
- `GET /api/scan/history/:id`
- `DELETE /api/scan/history/:id`
- `GET /api/inventory`
- `POST /api/inventory`
- `PATCH /api/inventory/:id`
- `DELETE /api/inventory/:id`

## Notes

- Protected routes require `Authorization: Bearer <token>`
- `POST /api/scan` forwards images to the FastAPI service at `FASTAPI_URL`
