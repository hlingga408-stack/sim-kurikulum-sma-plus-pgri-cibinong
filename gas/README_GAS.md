# PANDUAN DEPLOYMENT GOOGLE APPS SCRIPT (GAS) & GOOGLE SHEETS
### SIM Kurikulum SMA Plus PGRI Cibinong

Aplikasi ini dapat dijalankan dengan dua arsitektur fleksibel:
1. **100% Native di Google Apps Script (Tanpa Biaya Server)**: Seluruh antarmuka web dan database berjalan langsung di ekosistem Google Workspace sekolah Anda.
2. **Hybrid / REST API Mode**: Frontend berjalan di lokal (`npm run dev`) atau hosting (Vercel/Netlify), dan database tersinkronisasi otomatis dengan Google Sheets di Google Drive.

---

## 📁 File yang Tersedia di Folder `gas/`:
- **`Code.gs`** (atau `Code.js`): Kode backend Google Apps Script untuk operasi CRUD 8 tabel, REST API, Google Gemini AI, dan inisialisasi sheet.
- **`index.html`**: Bundle single-file yang berisi seluruh antarmuka React, Tailwind CSS, ikon Lucide, dan komponen pendukung yang sudah dipaketkan.

---

## 🚀 METODE 1: Deploy Langsung ke Google Apps Script (Web App)

Langkah-langkah cepat:

### Langkah 1: Buat Google Spreadsheet Baru
1. Buka [Google Drive](https://drive.google.com).
2. Buat Spreadsheet baru, beri nama: `SIM Kurikulum - SMA Plus PGRI Cibinong`.
3. Buka Spreadsheet tersebut.

### Langkah 2: Buka Editor Google Apps Script
1. Pada menu Spreadsheet di atas, klik **Ekstensi** > **Apps Script**.
2. Anda akan diarahkan ke editor Google Apps Script. Beri judul project: `Backend SIM Kurikulum PGRI`.

### Langkah 3: Masukkan Kode Backend (`Code.gs`)
1. Di panel kiri, klik file **`Code.gs`**.
2. Hapus seluruh isi default, lalu salin dan tempelkan seluruh isi dari file **`gas/Code.gs`** pada repositori ini.
3. Tekan `Ctrl + S` untuk menyimpan.

### Langkah 4: Masukkan Tampilan Frontend (`index.html`)
1. Di panel kiri Apps Script, klik tombol **+** di sebelah tulisan *Files* (File).
2. Pilih **HTML**.
3. Beri nama file: `index` (tanpa ekstensi `.html`, sehingga menjadi `index.html`).
4. Buka file **`gas/index.html`** di repositori ini, salin seluruh isinya, dan tempelkan ke dalam file `index.html` di editor Apps Script.
5. Tekan `Ctrl + S` untuk menyimpan.

### Langkah 5: Inisialisasi Database Spreadsheet
1. Pada dropdown fungsi di bagian atas editor Apps Script, pilih fungsi **`initDatabase`**.
2. Klik tombol **Run** (Jalankan).
3. Jika muncul permintaan izin (*Authorization Required*):
   - Klik **Review Permissions** (Tinjau Izin).
   - Pilih akun Google Anda.
   - Klik **Advanced** (Lanjutan) > **Go to Backend SIM Kurikulum PGRI (unsafe)**.
   - Klik **Allow** (Izinkan).
4. Setelah selesai, buka kembali tab Spreadsheet Anda di Google Drive. Anda akan melihat 8 sheet berwarna telah terbuat otomatis dengan header resmi:
   - 🔵 **GURU** (Data Pendidik & Beban Mengajar)
   - 🟢 **DOKUMEN** (KOSP, ATP, Modul Ajar, Asesmen)
   - 🟠 **PROKER** (Program Kerja & Realisasi Anggaran)
   - 🟣 **SUPERVISI** (Supervisi Klinis & RTL Quantum Learning)
   - 🔷 **JADWAL** (Kalender Pendidikan & Agenda)
   - 🔴 **RAPAT** (Notulensi & Berita Acara Rapat)
   - 🟣 **DISPOSISI** (Surat Masuk & Arahan Kepala Sekolah)
   - 🟢 **RTL_RAPAT** (Rencana Tindak Lanjut Rapat & Program)
   - ⚪ **PENGATURAN** (Pengaturan & Versi SIM)

### Langkah 6: (Opsional) Mengaktifkan AI Asisten Gemini
1. Dapatkan API Key gratis di [Google AI Studio](https://aistudio.google.com/).
2. Di Apps Script, klik ikon **Project Settings** (ikon gerigi di panel kiri).
3. Gulir ke bawah ke bagian **Script Properties** (Properti Skrip).
4. Klik **Add script property**:
   - Property: `GEMINI_API_KEY`
   - Value: `[Masukkan API Key Gemini Anda]`
5. Klik **Save script properties**.

### Langkah 7: Publikasikan sebagai Web App
1. Di sudut kanan atas editor Apps Script, klik tombol biru **Deploy** (Terapkan) > **New deployment** (Penerapan baru).
2. Klik ikon gerigi di sebelah *Select type* dan pilih **Web app**.
3. Atur konfigurasi berikut:
   - **Description**: `SIM Kurikulum Plus PGRI v1.0`
   - **Execute as** (Jalankan sebagai): **Me** (Saya)
   - **Who has access** (Siapa yang memiliki akses): **Anyone** (Siapa saja)
4. Klik **Deploy** (Terapkan).
5. Salin **Web app URL** yang muncul (format: `https://script.google.com/macros/s/.../exec`).
6. Buka URL tersebut di browser apa pun atau di HP/tablet dewan guru. Aplikasi langsung aktif 24/7!

---

## 💻 METODE 2: Menghubungkan Aplikasi Lokal / Eksternal ke Google Sheets

Jika Anda menjalankan aplikasi via `npm run dev` atau mendeploy ke Vercel/Netlify:

1. Buka aplikasi di browser (misal: `http://localhost:3000`).
2. Klik tombol **Database GAS** / **Google Sheets** di pojok kanan atas Navbar.
3. Tempelkan URL Web App Google Apps Script Anda ke kolom isian.
4. Klik tombol **Simpan & Hubungkan**.
5. Klik **Tes Koneksi**: indikator akan berubah menjadi hijau dengan nama Google Spreadsheet Anda.
6. Klik tab **Sinkronisasi Data**, lalu klik **Unggah Semua Data Sekarang** untuk memindahkan data lokal ke Google Sheets, atau **Tarik Data Terbaru** untuk mengambil data dari Google Sheets!

---

## 🔄 Pembaruan Kode Frontend di Masa Depan
Jika Anda mengubah kode React di folder `src/`, cukup jalankan perintah:
```bash
npm run build:gas
```
Perintah ini akan secara otomatis memperbarui file `gas/index.html`. Anda tinggal menyalin isi file tersebut ke file `index.html` di Google Apps Script Anda.
