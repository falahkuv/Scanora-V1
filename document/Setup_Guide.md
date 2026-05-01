# 🛠️ Scanora - Setup & Installation Guide

Dokumen ini berisi panduan langkah-demi-langkah untuk menjalankan proyek Scanora V1 di lingkungan lokal (Local Development), mulai dari cloning hingga menjalankan semua servis.

## 1. Prasyarat (Prerequisites)
Pastikan perangkat Anda sudah terinstal:
*   **Node.js** (v18 ke atas) & npm.
*   **Python** (v3.9 - v3.12 direkomendasikan).
*   **PostgreSQL** (Sudah menyala di localhost:5432).
*   **Git**.

---

## 2. Langkah Instalasi

### Step 1: Clone Repository
Buka terminal dan jalankan:
```bash
git clone https://github.com/falahkuv/Scanora-V1.git
cd Scanora-V1
```

### Step 2: Setup Database & Backend (Node.js)
1.  Instal dependensi di folder root:
    ```bash
    npm install
    ```
2.  Buat file `.env` di folder root (Copy dari `.env.example`):
    ```env
    PORT=3000
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scanora?schema=public
    JWT_SECRET=supersecretkey-scanora-123
    JWT_EXPIRES_IN=7d
    FASTAPI_URL=http://localhost:8000
    ```
    *(Sesuaikan username & password Postgres jika berbeda)*.
3.  Sinkronisasi Database dengan Prisma:
    ```bash
    npx prisma db push
    ```

### Step 3: Setup Frontend (React/Vite)
1.  Masuk ke folder frontend:
    ```bash
    cd frontend
    ```
2.  Instal dependensi frontend:
    ```bash
    npm install
    ```
3.  Kembali ke root:
    ```bash
    cd ..
    ```

### Step 4: Setup AI Server (FastAPI)
1.  Masuk ke folder fastapi:
    ```bash
    cd fastapi
    ```
2.  Instal dependensi Python:
    ```bash
    pip install -r requirements.txt
    ```
3.  Kembali ke root:
    ```bash
    cd ..
    ```

---

## 3. Cara Menjalankan Aplikasi
Aplikasi Scanora membutuhkan **3 terminal** yang menyala secara bersamaan:

### Terminal 1: Backend Express (API Gateway)
Terminal ini berfungsi sebagai jembatan antara Frontend, Database, dan AI.
```bash
# Di folder root (Scanora-V1)
npm run dev
```
*   **URL:** `http://localhost:3000`

### Terminal 2: AI Server (FastAPI)
Terminal ini menjalankan model Machine Learning untuk deteksi buah.
```bash
# Di folder Scanora-V1/fastapi
python api_main.py
```
*   **URL:** `http://localhost:8000`

### Terminal 3: Frontend (Vite/React)
Terminal ini menjalankan antarmuka pengguna (UI).
```bash
# Di folder Scanora-V1/frontend
npm run dev
```
*   **URL:** `http://localhost:5173`

---

## 4. Tips & Troubleshooting
*   **Koneksi ke AI Gagal:** Pastikan Terminal 2 (FastAPI) sudah benar-benar menyala sebelum melakukan scan.
*   **Error 502 Bad Gateway:** Pastikan Terminal 1 (Express) menyala, karena Vite melakukan proxy request ke port 3000.
*   **Nodemon Not Recognized:** Jalankan `npm install` kembali di folder root.
*   **Kamera Tidak Muncul:** Gunakan `localhost` atau `127.0.0.1` di browser. Jika diakses via IP Local (HP), pastikan menggunakan **HTTPS** atau izinkan *Unsecure Origins* di pengaturan browser.
