# Design System — Neo Brutalism

> Referensi awal: konsep app "SerenMind" (soft, rounded, pastel) → dimigrasikan ke gaya **Neo Brutalism**: tegas, kontras tinggi, border tebal, shadow keras, tipografi berani. Struktur konten (Welcome/Home, Self Care grid, Note card, Emotion Insight, Onboarding, Pricing) tetap dipakai, hanya *skin*-nya yang diganti total.

---

## 1. Prinsip Desain

1. **Raw over polished** — tidak ada gradient halus, tidak ada shadow blur lembut. Semua elemen terlihat seperti dipotong dan ditempel.
2. **Border tebal, selalu hitam** — setiap kartu/tombol/input punya outline solid, bukan sekadar warna latar.
3. **Shadow keras (hard offset shadow)** — bukan `box-shadow` blur, tapi offset solid seperti kertas ditumpuk.
4. **Kontras tinggi** — warna latar cerah/flat + teks hitam pekat. Hindari warna low-contrast.
5. **Tipografi besar & tegas** — heading tebal (800–900), ukuran besar, line-height rapat.
6. **Sudut tegas atau chunky** — pilih salah satu secara konsisten: siku tajam (0px radius) ATAU rounded tebal (16–24px) dengan border tebal. Jangan campur radius kecil (4–8px) khas UI "aman/soft".
7. **Interaksi fisik** — hover/press menggeser shadow (elemen "turun" saat ditekan), bukan opacity fade.
8. **Warna sebagai blok, bukan aksen** — section pakai warna solid penuh, bukan gradasi pastel tipis.
9. **Sedikit "berantakan" dengan sengaja** — elemen boleh sedikit rotate (-2° s/d 3°), sticker, garis coret tangan (seperti coretan hijau di referensi) dipertahankan sebagai elemen dekoratif brutalist.

---

## 2. Warna

### Palet dasar
| Token | Hex | Pemakaian |
|---|---|---|
| `--bg-base` | `#FDF6E9` | Latar utama (cream, dari referensi) |
| `--ink` | `#111111` | Teks utama, border, outline |
| `--surface` | `#FFFFFF` | Kartu netral |
| `--brutal-orange` | `#FF5A1F` | CTA utama / kartu "Write A Note" |
| `--brutal-yellow` | `#FFD23F` | Kartu insight / highlight |
| `--brutal-blue` | `#3B6FE0` | Ikon/aksen, tombol sekunder |
| `--brutal-green` | `#7CC142` | Elemen dekoratif (pengganti coretan hijau) |
| `--brutal-pink` | `#FF3D8A` | Badge diskon / tag "Save %" |
| `--brutal-purple` | `#8B7CF6` | Ikon kategori |

### Aturan pakai
- Latar section: pilih **satu** warna solid dari palet di atas, full-bleed, tanpa gradasi.
- Teks di atas warna solid gelap → putih. Di atas warna cerah (yellow/cream) → hitam.
- Shadow **selalu hitam solid** (`--ink`), tidak pernah abu-abu transparan.
- Maksimal 2 warna aksen aktif dalam satu viewport (selain hitam/putih/cream) supaya tetap brutal, bukan ramai.

---

## 3. Tipografi

- Font display: geometric sans tebal — misal **Archivo Black / Space Grotesk (700–900) / General Sans (Bold)**.
- Font body: sans netral — **Inter / Satoshi**, regular–semibold saja, jangan pakai ultra-thin.

| Level | Ukuran (desktop) | Ukuran (mobile) | Weight | Line-height |
|---|---|---|---|---|
| Display (Hero: "Your Mind Matters") | 64–80px | 36–44px | 900 | 0.95 |
| H1 (judul section) | 40–48px | 28–32px | 800 | 1.0 |
| H2 (judul card) | 24–28px | 20–22px | 800 | 1.1 |
| Body | 16–18px | 15–16px | 500 | 1.5 |
| Caption / label | 12–13px | 12–13px | 700, uppercase, letter-spacing 0.05em | 1.2 |
| Angka besar (mis. "84%", "$20.22") | 40–56px | 32–36px | 900 | 1.0 |

- Heading boleh dicoret garis bawah tebal (`border-bottom: 4px solid black`) sebagai aksen, bukan italic/soft.

---

## 4. Spacing & Grid

- Base unit: `8px`. Skala: 8 / 16 / 24 / 32 / 48 / 64 / 96.
- Container max-width: 1200px, padding sisi 24px (mobile) / 64px (desktop).
- Grid card kategori (mis. "Self Care": Exercises/Summaries/To-Dos/Quiz) → tetap grid 4 kolom (mobile: 2x2), tapi setiap item jadi **kotak brutalist** (bukan lingkaran soft): border 3px, shadow offset, radius 12–16px chunky.

---

## 5. Border, Shadow, Radius (token inti)

```css
:root {
  --border-w: 3px;
  --border-w-lg: 4px;
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --shadow-offset: 6px;
  --shadow-offset-lg: 10px;

  --shadow-brutal: 6px 6px 0px 0px var(--ink);
  --shadow-brutal-lg: 10px 10px 0px 0px var(--ink);
  --shadow-brutal-hover: 3px 3px 0px 0px var(--ink);
  --shadow-brutal-active: 0px 0px 0px 0px var(--ink);
}
```

Aturan:
- Semua kartu punya `border: var(--border-w) solid var(--ink)` + `box-shadow: var(--shadow-brutal)`.
- Hover: elemen bergeser `translate(3px, 3px)` sambil shadow mengecil ke `--shadow-brutal-hover` → efek "menempel ke kertas".
- Active/pressed: `translate(6px, 6px)`, shadow hilang (`--shadow-brutal-active`) → efek "ditekan penuh".
- Tidak pernah pakai `box-shadow` blur (`0 4px 12px rgba(...)`) di mana pun.

---

## 6. Komponen Kunci (mapping dari referensi)

### 6.1 Tombol (mis. "Sign in", "Feeling Strong!")
- Bentuk pill/rounded chunky, border hitam 3px, shadow brutal.
- Background solid (putih/orange/kuning), teks hitam bold.
- State hover/press ikuti aturan shadow di atas.

### 6.2 Kartu kategori grid ("Exercises/Summaries/To-Dos/Quiz")
- Kotak persegi radius 16px, border 3px hitam.
- Ikon di tengah dengan latar warna solid berbeda per kartu (purple/yellow/green/blue) — bukan lagi lingkaran pastel lembut, tapi kotak dengan sudut chunky + border sendiri di dalam kartu (double-border look).

### 6.3 Kartu CTA besar ("Write A Note")
- Full-width, background solid orange, border 3–4px hitam, shadow-lg.
- Tombol "+" jadi kotak putih dengan border hitam sendiri (bukan lingkaran soft-shadow).

### 6.4 Kartu Insight ("Emotion Insight 84%")
- Background kuning solid, border tebal, shadow-lg, sedikit rotate -1° sampai -2° untuk kesan "ditempel".
- Angka besar 900-weight, dot-grid visual dipertahankan tapi outline tiap dot dengan warna kontras.

### 6.5 Hero / Onboarding ("Your Mind Matters, We're Here for You")
- Background cream solid, tanpa grid halus lembut — ganti grid background jadi grid garis tegas 1px hitam opacity rendah (tetap brutalist, bukan dihilangkan).
- Ilustrasi karakter dipertahankan gaya line-art tebal (sudah cukup brutal), tapi tambahkan **outline hitam tegas di sekeliling kartu ilustrasi** + shadow offset, ganti sudut rounded lembut jadi rounded chunky 16–20px.
- Coretan hijau dekoratif dipertahankan sebagai elemen "handmade mark" khas neo-brutalism.

### 6.6 Pricing Card ("Premium Package / Basic Package")
- Card pill besar, border 3px, tanpa shadow lembut → shadow brutal.
- Badge "Save 20%" jadi kotak/pill solid pink dengan border hitam, bukan soft pill gradient.
- Package terpilih (Premium) diberi background solid gelap (ink/orange) dengan teks putih agar hierarki jelas — brutalist selalu pakai *fill contrast*, bukan border tipis untuk menandai "selected".

---

## 7. Motion (batasi, jangan lembut)

- Durasi singkat: 100–150ms, easing `linear` atau `steps()` — hindari `ease-in-out` yang terasa "halus/soft".
- Transisi utama hanya pada `transform` (posisi shadow) dan `background-color`, bukan fade opacity panjang.
- Elemen decorative (sticker, coretan) boleh idle-rotate sangat kecil (±2°) untuk kesan "hidup", tanpa parallax lembut.

---

## 8. Do & Don't

**Do**
- Border hitam tebal konsisten di semua elemen interaktif.
- Warna solid penuh per section/card.
- Shadow offset keras, arah konsisten (kanan-bawah).
- Tipografi besar, tebal, sedikit "kasar".

**Don't**
- Gradient linear/radial halus.
- `box-shadow` blur/soft (drop shadow khas Material/iOS).
- Radius kecil 2–6px (terasa "aplikasi korporat", bukan brutalist).
- Warna pastel low-contrast sebagai warna utama teks.
- Font ultra-thin/light untuk heading.

---

## 9. Referensi Struktur Layar (dipertahankan, hanya skin berubah)

1. **Home/Welcome** — greeting + grid 4 kategori + CTA note + insight card.
2. **Onboarding/Hero** — headline besar + ilustrasi karakter + tombol Sign in + deskripsi singkat + dot pagination.
3. **Upsell/Pricing** — headline + 2 pilihan paket (harga + badge diskon) + bullet benefit.

Ketiga struktur ini tetap dipakai sebagai kerangka halaman; dokumen ini hanya mengubah bahasa visualnya menjadi neo-brutalism.