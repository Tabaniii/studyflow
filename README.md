# StudyFlow

Aplikasi web untuk mahasiswa mencatat **konteks tugas kuliah**, bukan cuma deadline — diumumkan di mana, kumpul ke mana, syaratnya apa, plus prioritas rendah/sedang/tinggi.

## Fitur

- **Login & register dengan email** (Supabase Auth) — setiap akun punya tugas masing-masing, tidak tercampur
- **Jam belajar** — memulai sesi 90 menit di dashboard, mengingatkan meski kamu buka app setelah jamnya lewat, plus tombol tes pengingat
- **Konteks tugas** — diumumkan di (WA / Classroom / LMS / kelas / email), tautan sumber, instruksi dosen, tujuan kumpul, format file, **jam pengumpulan**
- **Alur status nyata** — belum mulai → sedang dikerjakan → sudah dikumpul → menunggu nilai
- **Individu / kelompok** — daftar anggota dan PIC pengumpulan
- **Prioritas** — rendah / sedang / tinggi, kamu yang tentukan. Deadline tetap punya badge sendiri (aman / mendekati / terlambat).
- **Estimasi durasi vs sisa waktu** — peringatan kalau estimasi pengerjaan lebih panjang dari sisa deadline
- **Mode darurat 48 jam** — fokus ke tugas yang harus selesai sebelum overshoot
- **Tugas berulang** — harian / mingguan / bulanan; tugas berikutnya dibuat otomatis saat yang ini dikumpul
- **Pengingat berbasis urgensi** — notifikasi menyebut tugas konkret yang darurat atau terlambat, bukan cuma “saatnya belajar”
- **Filter & urutan** — status, darurat, deadline, prioritas, estimasi
- **Malam ini ngerjain apa?** — pilih 1–3 tugas yang muat sampai jam tidur / sisa sesi belajar
- **Ritual kumpul** — checklist PDF, nama file, syarat dosen, dan upload, muncul 2 jam sebelum deadline
- **Lampiran instruksi** — simpan screenshot WA / foto papan / PDF soal di tugas
- **Sesi fokus** — timer satu tugas, yang lain disembunyiin
- **PWA** — tombol **Pasang di HP** (Add to Home Screen)

## Tech Stack

- React 18 + Vite
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth + Row Level Security)

## Setup

1. Install dependensi:

```bash
npm install
```

2. Buat project di [supabase.com](https://supabase.com), lalu jalankan SQL di `supabase/schema.sql` lewat **SQL Editor**. File ini **aman diulang** dan **tidak menghapus data lama**. v5 menambah jam tidur, checklist ritual, tabel lampiran, dan bucket Storage `task-attachments`.

3. Salin `.env.example` menjadi `.env` dan isi kredensial dari **Project Settings → API**:

```bash
cp .env.example .env
```

4. (Opsional, untuk mempermudah testing) Matikan konfirmasi email di **Authentication → Sign In / Providers → Email → Confirm email**. Kalau dibiarkan aktif, user harus klik link konfirmasi di email sebelum bisa masuk.

5. Jalankan dev server:

```bash
npm run dev
```

## Catatan Notifikasi

Pengingat memakai browser Notification API, jadi:

- Browser akan meminta izin notifikasi saat pertama kali masuk — klik **Allow**.
- Notifikasi OS muncul selama tab aplikasi terbuka.
- Ada dua jenis: digest urgensi (sekali sehari, tugas darurat/terlambat) dan pengingat jam belajar (termasuk catch-up kalau sesinya kelewatan).
- Banner sesi belajar tetap tampil di dashboard, jadi jam belajar kelihatan meski notifikasi OS terlewat. Untuk ngetes: buka tombol jam belajar → **Tes pengingat**.

## PWA

Di Chrome/Android, tombol **Pasang di HP** muncul setelah app pernah dibuka. Di iPhone Safari: Share → Add to Home Screen. Service worker hanya aktif di build production (`npm run build` + `npm run preview` / hosting), bukan `npm run dev`.
