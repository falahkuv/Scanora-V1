# 🍎 Data Riset Estimasi Umur Simpan Buah - Scanora

> Dokumen ini merupakan referensi internal untuk logika kalkulasi `reminder_at` dan `freshness_score_latest` di backend Node.js (`freshnessService.js`).

---

## Sumber Referensi
- Banana: https://discover.texasrealfood.com/does-it-go-bad/do-bananas-go-bad & https://www.doesitgobad.com/banana-go-bad/
- Apple: https://www.vinmec.com/eng/blog/how-long-does-an-apple-last-en & https://feelgoodpal.com/id/blog/how-long-do-apples-last/
- Orange: https://discover.texasrealfood.com/does-it-go-bad/do-oranges-spoil

---

## Masa Simpan Suhu Ruang (Fokus Utama)

| Buah   | Kondisi Scan | Suhu Ruang               | Catatan                          |
|--------|-------------|--------------------------|----------------------------------|
| Pisang | `unripe`    | 2–5 hari sampai matang   | Tidak disarankan di kulkas       |
| Pisang | `ripe`      | 1–2 hari                 | Segera konsumsi                  |
| Pisang | `rotten`    | 0 hari                   | Tidak layak konsumsi             |
| Apel   | `unripe`    | 1–3 hari sampai matang   | —                                |
| Apel   | `ripe`      | 3–5 hari                 | Sangat baik di suhu ruang        |
| Apel   | `rotten`    | 0 hari                   | Tidak layak konsumsi             |
| Jeruk  | `unripe`    | Tidak ideal (ripening)   | Dianjurkan simpan di kulkas      |
| Jeruk  | `ripe`      | 7–14 hari                | —                                |
| Jeruk  | `rotten`    | 0 hari                   | Tidak layak konsumsi             |

---

## Masa Simpan Kulkas (Backlog - belum diimplementasi)

| Buah   | Kondisi Scan | Kulkas      |
|--------|-------------|-------------|
| Pisang | `unripe`    | Tidak disarankan |
| Pisang | `ripe`      | ±5–7 hari   |
| Apel   | `unripe`    | ±30 hari    |
| Apel   | `ripe`      | ±30 hari    |
| Jeruk  | `unripe`    | ±14–30 hari |
| Jeruk  | `ripe`      | 14–30 hari  |

---

## Logika Reminder Berdasarkan Kondisi

| Tipe Reminder          | Kapan Muncul                        | Tujuan                                              |
|------------------------|-------------------------------------|-----------------------------------------------------|
| Ripening Reminder      | Untuk buah `unripe`                 | Mengingatkan user bahwa buah kemungkinan sudah mulai matang |
| Consume Soon Reminder  | 1–2 hari sebelum batas masa simpan  | Mengurangi risiko buah terbuang                     |
| Last Day Reminder      | Pada hari terakhir estimasi         | Dorongan terakhir untuk dimakan/diolah              |
| Expired / Check Quality | Setelah lewat batas estimasi       | Minta user cek ulang kondisi visual, aroma, tekstur |

---

## Logika Kalkulasi `reminder_at` di Backend

Kalkulasi `reminder_at` di `freshnessService.js` mempertimbangkan `freshness_score` dari model AI untuk menentukan **berapa hari** di dalam range (min–max) yang paling tepat.

### Formula
```
days = min_days + round((max_days - min_days) * freshness_score)
reminder_at = addedAt + days (hari)
```

**Contoh:**
- Pisang `ripe`, `freshness_score: 0.95` → `1 + round((2-1) * 0.95)` = **2 hari**
- Pisang `ripe`, `freshness_score: 0.50` → `1 + round((2-1) * 0.50)` = **1 hari**
- Apel `ripe`, `freshness_score: 0.90` → `3 + round((5-3) * 0.90)` = **5 hari**

---

## Logika Penurunan `freshness_score_latest`

Skor kesegaran menurun setiap harinya. Formula depresiasi linier:

```
score_per_day = freshness_score_initial / max_days
freshness_score_latest = freshness_score_initial - (days_elapsed * score_per_day)
```

Nilai ini dihitung dinamis saat request `GET /api/inventory` — tidak disimpan permanen, cukup dikalkulasi dari `added_at` dan `freshness_score` awal.
