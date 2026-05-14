# Mascot Assets

Direktori ini menyimpan aset ilustrasi maskot buah Scanora untuk berbagai kondisi.

## Penamaan File

Format yang digunakan: `[nama_buah]_[kondisi].png`
- `nama_buah`: `apple`, `banana`, `orange`
- `kondisi`: `ripe`, `unripe`, `rotten`

Aset ini secara otomatis akan dibaca oleh `frontend` melalui `getMascotSrc()` ketika gambar hasil *scan* tidak tersedia atau *broken*. File yang digunakan saat _runtime_ berada di dalam folder `frontend/public/mascots/`. Aset di sini adalah *master asset* / sumber utama (source of truth) untuk kebutuhan desain/referensi.
