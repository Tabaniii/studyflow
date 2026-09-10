# StudyFlow

Aplikasi web sederhana untuk mahasiswa mencatat, memantau, dan memprioritaskan tugas kuliah dalam satu dashboard — lengkap dengan indikator visual urgensi deadline dan pengingat jam belajar.

## Fitur

- **Login & register dengan email** (Supabase Auth) — setiap akun punya tugas masing-masing, tidak tercampur
- **Jam belajar saat register** — profil menyimpan jam belajar, dan aplikasi mengirim notifikasi pengingat setiap hari di jam tersebut
- **Tambah, edit, hapus tugas** — nama tugas, mata kuliah, deadline, prioritas (rendah/sedang/tinggi)
- **Tandai selesai / belum selesai** lewat checkbox
- **Badge warna deadline** — hijau (aman), kuning (mendekati, ≤ 3 hari), merah (terlewat)
- **Filter tugas** — semua / belum selesai / selesai
- **Urutkan tugas** — berdasarkan deadline terdekat atau prioritas tertinggi
- **Ringkasan dashboard** — tugas aktif, mendekati deadline, terlambat, selesai

## Tech Stack

- React 18 + Vite
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth + Row Level Security)

## Setup

1. Install dependensi:

```bash
npm install
```

2. Buat project di [supabase.com](https://supabase.com), lalu jalankan SQL di `supabase/schema.sql` lewat **SQL Editor**.

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

Pengingat jam belajar memakai browser Notification API, jadi:

- Browser akan meminta izin notifikasi saat pertama kali masuk — klik **Allow**.
- Notifikasi muncul selama tab aplikasi terbuka saat jam belajar tiba.
