# 🎓 SIPMB — Sistem Informasi Penerimaan Mahasiswa Baru

Aplikasi web GUI untuk simulasi pendaftaran calon mahasiswa baru. Dibangun dengan
**HTML + CSS + JavaScript murni** (tanpa framework, tanpa server) sehingga bisa langsung
dibuka di browser. Data disimpan di `localStorage` browser.

![tech](https://img.shields.io/badge/stack-HTML%20%2B%20CSS%20%2B%20JS-6366f1)
![no-build](https://img.shields.io/badge/build-tidak%20perlu-34d399)

---

## ✨ Fitur (3 Modul)

| Modul | Nama | Deskripsi |
|-------|------|-----------|
| **1** | **Registrasi & Login** | Daftar akun baru & masuk. Ada indikator kekuatan password, validasi username/email, animasi tab. |
| **2** | **Input & Update Data Diri** | Form biodata calon mahasiswa (10 field). Data dimuat ulang saat dibuka & bisa diperbarui kapan saja. |
| **3** | **Pemilihan Program Studi** | Pilih 1 dari 5 prodi (kartu interaktif dengan akreditasi & kuota), lalu konfirmasi. |

Tambahan:
- **Dashboard** dengan *progress ring* dan kartu langkah yang menunjukkan status pendaftaran.
- **Animasi cinematic**: splash intro, latar orb bergerak, transisi antar-view, kartu ber-*stagger*, efek *ripple* tombol.
- **Responsif** (desktop & mobile) + menghormati `prefers-reduced-motion`.

---

## 📊 Data Dummy (Excel)

`data_pmb.xlsx` berisi 2 sheet:
- **`calon_mahasiswa`** — 20 data simulasi calon mahasiswa.
- **`program_studi`** — 5 data program studi (TIF, SIF, MNJ, AKT, DKV).

Data prodi di aplikasi (array `PRODI` pada `app.js`) **selaras** dengan sheet `program_studi`.

File dibuat ulang dengan:
```bash
python3 -m pip install openpyxl
python3 generate_excel.py
```

---

## 🚀 Cara Menjalankan

Tidak perlu instalasi. **Cukup buka `index.html` di browser.**

Atau jalankan lewat server statis sederhana (opsional):
```bash
# Python
python3 -m http.server 8000
# lalu buka http://localhost:8000

# atau Node
npx serve .
```

---

## 🧭 Alur Pemakaian

1. Buka aplikasi → tampil **splash** lalu **halaman Masuk/Daftar**.
2. **Daftar Akun** (tab "Daftar Akun") → isi nama, username, email, password.
3. **Masuk** dengan akun tersebut.
4. Di **Dashboard**, ikuti langkah:
   - **Langkah 1 — Data Diri** (Modul 2): isi & simpan biodata.
   - **Langkah 2 — Pilih Prodi** (Modul 3): pilih prodi & konfirmasi.
5. Progress akan menjadi **100%** saat kedua langkah selesai.

---

## 📁 Struktur Berkas

```
.
├── index.html          # Struktur & seluruh tampilan (SPA)
├── styles.css          # Tema gelap + animasi cinematic
├── app.js              # Logika 3 modul + localStorage
├── generate_excel.py   # Skrip pembuat data dummy Excel
├── data_pmb.xlsx       # Data dummy (20 calon mahasiswa + 5 prodi)
└── README.md
```

---

## ⚠️ Catatan (penting)

Aplikasi ini adalah **simulasi/demo**:
- Login & data **disimpan di browser** (`localStorage`) pada perangkat itu saja — tidak terpusat, tidak multi-perangkat.
- Password di-*hash* dengan fungsi sederhana **hanya untuk demo**, **bukan** untuk keamanan produksi.
- Tidak ada backend/database. Untuk kebutuhan nyata (multi-user, data aman & terpusat), diperlukan server + database.
