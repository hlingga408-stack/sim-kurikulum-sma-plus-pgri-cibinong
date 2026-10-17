/**
 * =========================================================================================
 * SISTEM INFORMASI MANAJEMEN (SIM) KURIKULUM - SMA PLUS PGRI CIBINONG
 * Backend Google Apps Script (GAS) & Database Google Sheets (Google Drive)
 * =========================================================================================
 * 
 * Script ini berfungsi sebagai:
 * 1. Database Seeder & Migrator (isiDataAplikasiKeSpreadsheet): Memasukkan seluruh data awal aplikasi ke spreadsheet.
 * 2. Web App Server (doGet): Menyajikan antarmuka aplikasi web React langsung di GAS.
 * 3. REST API Endpoint (doGet & doPost): Menerima dan merespons permintaan data dari frontend.
 * 4. Native GAS Bridge (google.script.run): Komunikasi instan langsung saat aplikasi dibuka di GAS.
 * 5. Database Engine (SpreadsheetApp): Menyimpan, membaca, mengubah, dan menghapus data pada Google Sheets.
 * 6. Gemini AI Proxy: Menghubungkan asisten kurikulum ke Google Gemini API via UrlFetchApp.
 * 
 * -----------------------------------------------------------------------------------------
 * CARA MENGHUBUNGKAN DENGAN SPREADSHEET YANG SUDAH ADA:
 * -----------------------------------------------------------------------------------------
 * CARA 1 (PALING MUDAH - Container-Bound):
 * 1. Buka file Google Spreadsheet yang sudah Anda miliki di Google Drive.
 * 2. Klik menu 'Ekstensi' (Extensions) > 'Apps Script'.
 * 3. Hapus semua kode default di 'Code.gs', lalu tempelkan seluruh kode ini.
 * 4. Pada toolbar atas Apps Script, pilih fungsi 'isiDataAplikasiKeSpreadsheet', lalu klik 'Run' (Jalankan).
 *    -> Berikan izin akses (Review Permissions > Akun Anda > Advanced > Allow).
 *    -> Buka kembali tab Spreadsheet Anda, seluruh data guru, dokumen, proker, supervisi,
 *       rapat, dan jadwal langsung masuk detik itu juga!
 * 
 * CARA 2 (Jika Apps Script dibuat terpisah / Standalone):
 * 1. Buka spreadsheet Anda di Google Drive, lihat URL-nya:
 *    https://docs.google.com/spreadsheets/d/1A2B3C...XYZ/edit
 * 2. Salin kode ID di antara /d/ dan /edit (misal: 1A2B3C...XYZ).
 * 3. Tempelkan ID tersebut ke variabel SPREADSHEET_ID di baris bawah ini.
 * 4. Pilih fungsi 'isiDataAplikasiKeSpreadsheet', lalu klik 'Run'.
 */

// Konfigurasi ID Spreadsheet (Kosongkan jika script terhubung langsung via menu Ekstensi > Apps Script)
var SPREADSHEET_ID = '';

// Konfigurasi Gemini API Key (Bisa diisi di sini atau di Script Properties dengan key: GEMINI_API_KEY)
var GEMINI_API_KEY_FALLBACK = '';

// Nama-nama lembar kerja (Sheets)
var SHEETS = {
  TEACHERS: 'GURU',
  DOCUMENTS: 'DOKUMEN',
  PROGRAMS: 'PROKER',
  SUPERVISIONS: 'SUPERVISI',
  EVENTS: 'JADWAL',
  MEETINGS: 'RAPAT',
  DISPOSITIONS: 'DISPOSISI',
  MEETING_RTLS: 'RTL_RAPAT',
  SETTINGS: 'PENGATURAN'
};

/**
 * Data awal bawaan aplikasi SIM Kurikulum SMA Plus PGRI Cibinong
 */
var INITIAL_APP_DATA = {
  "teachers": [
    {
      "id": "tch-001",
      "name": "Drs. H. Mulyadi, M.Pd.",
      "nip": "197405122000031002",
      "subject": "Matematika Tingkat Lanjut",
      "subjectCluster": "MIPA",
      "employmentStatus": "PNS",
      "education": "S2",
      "phone": "0812-8877-6651",
      "email": "mulyadi@smapluspgri-cibinong.sch.id",
      "teachingHours": 24,
      "additionalRole": "Ketua MGMP Matematika & Pembina OSN",
      "certificationStatus": true
    },
    {
      "id": "tch-002",
      "name": "Siti Rahmawati, S.Pd., M.Si.",
      "nip": "198803152014022001",
      "subject": "Biologi",
      "subjectCluster": "MIPA",
      "employmentStatus": "GTY / Tetap Yayasan",
      "education": "S2",
      "phone": "0813-1122-3344",
      "email": "siti.rahma@smapluspgri-cibinong.sch.id",
      "teachingHours": 22,
      "additionalRole": "Kepala Lab Biologi & Fasilitator P5",
      "certificationStatus": true
    },
    {
      "id": "tch-003",
      "name": "Rahmat Hidayat, S.Kom., M.T.",
      "nip": "199108192019031008",
      "subject": "Informatika",
      "subjectCluster": "Informatika & Vokasi",
      "employmentStatus": "GTY / Tetap Yayasan",
      "education": "S2",
      "phone": "0857-7788-9900",
      "email": "rahmat.hidayat@smapluspgri-cibinong.sch.id",
      "teachingHours": 26,
      "additionalRole": "Kepala Lab Komputer & Guru Penggerak",
      "certificationStatus": true
    },
    {
      "id": "tch-004",
      "name": "Nurul Hidayati, S.Pd.",
      "nip": "198506142010012023",
      "subject": "Bahasa Indonesia",
      "subjectCluster": "Bahasa",
      "employmentStatus": "PNS",
      "education": "S1",
      "phone": "0815-9988-7766",
      "email": "nurul.hidayati@smapluspgri-cibinong.sch.id",
      "teachingHours": 24,
      "additionalRole": "Wali Kelas XII IPS Plus 1",
      "certificationStatus": true
    },
    {
      "id": "tch-005",
      "name": "Dra. Endang Sulistyowati",
      "nip": "196908121994122001",
      "subject": "Fisika",
      "subjectCluster": "MIPA",
      "employmentStatus": "PNS",
      "education": "S1",
      "phone": "0812-3344-5566",
      "email": "endang.s@smapluspgri-cibinong.sch.id",
      "teachingHours": 20,
      "additionalRole": "Tim Pengembang Kurikulum",
      "certificationStatus": true
    },
    {
      "id": "tch-006",
      "name": "Ahmad Fauzi, S.Pd., M.Hum.",
      "nip": "198704202012011005",
      "subject": "Bahasa Inggris",
      "subjectCluster": "Bahasa",
      "employmentStatus": "GTY / Tetap Yayasan",
      "education": "S2",
      "phone": "0813-4455-6677",
      "email": "ahmad.fauzi@smapluspgri-cibinong.sch.id",
      "teachingHours": 24,
      "additionalRole": "Koordinator English Bilingual Program",
      "certificationStatus": true
    },
    {
      "id": "tch-007",
      "name": "Bambang Irawan, S.Pd.",
      "nip": "197901102005011007",
      "subject": "Matematika Umum",
      "subjectCluster": "MIPA",
      "employmentStatus": "PNS",
      "education": "S1",
      "phone": "0812-9988-1122",
      "email": "bambang.irawan@smapluspgri-cibinong.sch.id",
      "teachingHours": 12,
      "additionalRole": "Wakil Kepala Sekolah Bidang Kurikulum",
      "certificationStatus": true
    },
    {
      "id": "tch-008",
      "name": "Siti Sarah, S.Pd.",
      "nip": "199307252021032014",
      "subject": "Sosiologi",
      "subjectCluster": "Sosial Humaniora",
      "employmentStatus": "PPPK",
      "education": "S1",
      "phone": "0858-1234-5678",
      "email": "siti.sarah@smapluspgri-cibinong.sch.id",
      "teachingHours": 22,
      "additionalRole": "Koordinator Projek P5",
      "certificationStatus": false
    },
    {
      "id": "tch-009",
      "name": "Hendra Gunawan, S.Pd.",
      "nip": "199002142017011009",
      "subject": "PJOK",
      "subjectCluster": "Seni & Penjas",
      "employmentStatus": "GTY / Tetap Yayasan",
      "education": "S1",
      "phone": "0877-6543-2109",
      "email": "hendra.gunawan@smapluspgri-cibinong.sch.id",
      "teachingHours": 24,
      "additionalRole": "Pembina Prestasi Olahraga",
      "certificationStatus": true
    },
    {
      "id": "tch-010",
      "name": "Maya Lestari, S.Pd., M.Si.",
      "nip": "199209302020022019",
      "subject": "Kimia",
      "subjectCluster": "MIPA",
      "employmentStatus": "GTY / Tetap Yayasan",
      "education": "S2",
      "phone": "0819-0808-1234",
      "email": "maya.lestari@smapluspgri-cibinong.sch.id",
      "teachingHours": 24,
      "additionalRole": "Pembimbing Riset KIR",
      "certificationStatus": false
    }
  ],
  "documents": [
    {
      "id": "doc-001",
      "title": "KOSP SMA Plus PGRI Cibinong TA 2026/2027",
      "type": "KOSP",
      "phase": "Semua Tingkat",
      "subject": "Kurikulum Sekolah",
      "authorTeacher": "Tim Pengembang Kurikulum",
      "uploadDate": "2026-07-15",
      "status": "verified",
      "fileSize": "4.8 MB",
      "version": "v2.1 Final",
      "description": "Kurikulum Operasional Satuan Pendidikan (KOSP) Tahun Ajaran 2026/2027 memuat karakteristik satuan pendidikan, visi misi, pengorganisasian pembelajaran, dan rencana pembelajaran.",
      "learningObjectives": [
        "Penyelarasan CP BSKAP 032/H/KR/2024 dengan kekhasan Plus PGRI Cibinong",
        "Integrasi 8 Dimensi Karakter Unggul & Kecakapan Digital",
        "Struktur Kurikulum Reguler, Kelas Unggulan IT, dan Program Riset"
      ],
      "reviewerNotes": "Disahkan oleh Kepala Sekolah dan Pengawas Pembina Cabang Dinas Pendidikan Wilayah I."
    },
    {
      "id": "doc-002",
      "title": "Modul Ajar Matematika Tingkat Lanjut: Vektor & Matriks Ruang",
      "type": "Modul Ajar",
      "phase": "Fase F (Kelas XI)",
      "subject": "Matematika Tingkat Lanjut",
      "authorTeacher": "Drs. H. Mulyadi, M.Pd.",
      "uploadDate": "2026-09-10",
      "status": "verified",
      "fileSize": "2.4 MB",
      "version": "v1.2",
      "description": "Modul ajar berdiferensiasi dengan scaffolding visual digital menggunakan GeoGebra 3D dan studi kasus navigasi satelit.",
      "learningObjectives": [
        "Peserta didik mampu melakukan operasi aljabar vektor pada bidang dan ruang",
        "Peserta didik mampu menerapkan konsep perkalian titik dan silang dalam persoalan fisis",
        "Peserta didik menyelesaikan permasalahan kontekstual pergerakan drone"
      ],
      "reviewerNotes": "Lengkap dengan asesmen diagnostik kognitif dan rubrik unjuk kerja."
    },
    {
      "id": "doc-003",
      "title": "ATP Informatika: Kecerdasan Artifisial & Algoritma Pemrograman Python",
      "type": "ATP",
      "phase": "Fase E (Kelas X)",
      "subject": "Informatika",
      "authorTeacher": "Rahmat Hidayat, S.Kom., M.T.",
      "uploadDate": "2026-08-22",
      "status": "verified",
      "fileSize": "1.6 MB",
      "version": "v1.0",
      "description": "Alur Tujuan Pembelajaran integrasi berpikir komputasional, dasar sintaksis Python, dan etika kecerdasan buatan untuk siswa kelas 10.",
      "learningObjectives": [
        "Memahami arsitektur komputasi dan representasi data biner",
        "Menulis kode pemrograman prosedural dengan struktur kontrol dan modul fungsi",
        "Mengevaluasi dampak etika AI terhadap hak cipta dan privasi data"
      ],
      "reviewerNotes": "Kesesuaian alur tahapan materi sangat runtut dan aplikatif."
    },
    {
      "id": "doc-004",
      "title": "Modul Projek P5: Rekayasa Teknologi - Smart Eco-Green School IoT",
      "type": "Modul P5",
      "phase": "Fase E (Kelas X)",
      "subject": "Projek Penguatan Profil Pelajar Pancasila",
      "authorTeacher": "Koordinator P5 (Siti Sarah, S.Pd.)",
      "uploadDate": "2026-09-01",
      "status": "verified",
      "fileSize": "3.9 MB",
      "version": "v1.1",
      "description": "Panduan fasilitator projek rekayasa teknologi: rancang bangun pemilah sampah otomatis dan monitoring kelembapan taman hidroponik sekolah berbasis Micro:bit & Arduino.",
      "learningObjectives": [
        "Dimensi Bernalar Kritis: Mengidentifikasi masalah pengelolaan lingkungan sekolah",
        "Dimensi Kreatif: Merakit prototipe perangkat monitoring sensor",
        "Dimensi Bergotong Royong: Bekerja sama dalam tim divisi mekanik, pemrograman, dan presentasi"
      ]
    },
    {
      "id": "doc-005",
      "title": "Modul Ajar Bahasa Inggris: Argumentative Essay on Sustainable Energy",
      "type": "Modul Ajar",
      "phase": "Fase F (Kelas XII)",
      "subject": "Bahasa Inggris",
      "authorTeacher": "Ahmad Fauzi, S.Pd., M.Hum.",
      "uploadDate": "2026-10-02",
      "status": "pending",
      "fileSize": "1.8 MB",
      "version": "v1.0 Draf",
      "description": "Modul pembelajaran membaca kritis teks analitis eksposisi dan menulis esai argumen ilmiah standar IELTS/TOEFL persiapan perguruan tinggi.",
      "learningObjectives": [
        "Analyze thesis statements and rebuttals in contemporary argumentative articles",
        "Compose a 5-paragraph academic essay with authentic citations and cohesive devices"
      ],
      "reviewerNotes": "Menunggu penambahan instrumen asesmen formatif lembar reviu teman sejawat (peer review rubric)."
    },
    {
      "id": "doc-006",
      "title": "Panduan Asesmen Sumatif & Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)",
      "type": "Panduan Asesmen",
      "phase": "Semua Tingkat",
      "subject": "Standar Penilaian Kurikulum",
      "authorTeacher": "Subbag Evaluasi Kurikulum",
      "uploadDate": "2026-08-30",
      "status": "verified",
      "fileSize": "2.1 MB",
      "version": "v2.0",
      "description": "Pedoman perumusan KKTP berbasis interval nilai, rubrik deskriptif bertingkat, dan panduan pengolahan nilai rapor Kurikulum Merdeka."
    },
    {
      "id": "doc-007",
      "title": "Bank Soal Sumatif Tengah Semester Fisika Fase F (HOTS)",
      "type": "Bank Soal",
      "phase": "Fase F (Kelas XI)",
      "subject": "Fisika",
      "authorTeacher": "Dra. Endang Sulistyowati",
      "uploadDate": "2026-09-28",
      "status": "revision",
      "fileSize": "1.4 MB",
      "version": "v1.1 Revisi",
      "description": "Kumpulan 40 butir soal pilihan ganda kompleks dan uraian pemecahan masalah dinamika gerak rotasi dan fluida statis.",
      "reviewerNotes": "Perlu revisi stimulus soal nomor 12-18 agar menampilkan data grafik eksperimen riil."
    },
    {
      "id": "doc-008",
      "title": "SK Pembagian Jam Mengajar & Beban Kerja Guru Semester Ganjil 2026/2027",
      "type": "SK Pembagian Tugas",
      "phase": "Semua Tingkat",
      "subject": "Administrasi Kurikulum",
      "authorTeacher": "Kepala SMA Plus PGRI Cibinong",
      "uploadDate": "2026-07-10",
      "status": "verified",
      "fileSize": "3.1 MB",
      "version": "v1.0 Sah",
      "description": "Surat Keputusan penetapan alokasi 78 guru mata pelajaran, wali kelas, pembina ekstrakurikuler, dan fasilitator P5."
    }
  ],
  "programs": [
    {
      "id": "proker-101",
      "code": "PK-01",
      "title": "In-House Training (IHT) Asesmen Autentik & Integrasi AI dalam Modul Ajar",
      "category": "Pengembangan Guru & IHT",
      "pic": "Wakasek Kurikulum & Tim Pengembang",
      "targetPeriod": "Juli - Agustus 2026",
      "academicYear": "2024/2025",
      "budgetEstimated": 18500000,
      "budgetRealized": 17200000,
      "status": "completed",
      "progress": 100,
      "indicators": "100% dewan guru mampu memvalidasi modul ajar berdiferensiasi dan menguasai prompt generator bahan ajar berbasis AI.",
      "description": "Pelatihan intensif 3 hari bagi seluruh guru SMA Plus PGRI Cibinong untuk memperkuat kompetensi pedagogik digital dan asesmen formatif bermakna.",
      "evaluation": "Pelatihan terlaksana 100% efektif. Dewan guru menghasilkan 78 draf modul ajar baru. Catatan perbaikan: perlu pendampingan lanjutan khusus guru non-eksakta dalam perumusan rubrik analitik.",
      "reportLink": "https://drive.google.com/drive/folders/1IHT_Asesmen_AI_SMAPlusPGRI2026?usp=sharing",
      "milestones": [
        {
          "id": "m-1",
          "title": "Pembentukan panitia & penyusunan materi IHT",
          "completed": true,
          "dueDate": "2026-07-05"
        },
        {
          "id": "m-2",
          "title": "Pelaksanaan workshop tatap muka & praktik mandiri",
          "completed": true,
          "dueDate": "2026-07-20"
        },
        {
          "id": "m-3",
          "title": "Pengumpulan & kurasi draf modul ajar hasil pelatihan",
          "completed": true,
          "dueDate": "2026-08-05"
        }
      ]
    },
    {
      "id": "proker-102",
      "code": "PK-02",
      "title": "Supervisi Akademik Semester Ganjil & Pendampingan Klinis Guru",
      "category": "Kurikulum & KOSP",
      "pic": "Kepala Sekolah & Tim Supervisor",
      "targetPeriod": "September - November 2026",
      "academicYear": "2024/2025",
      "budgetEstimated": 12000000,
      "budgetRealized": 8500000,
      "status": "in_progress",
      "progress": 68,
      "indicators": "Minimal 90% guru mencapai predikat Baik/Amat Baik dalam implementasi diferensiasi dan keterlibatan aktif peserta didik.",
      "description": "Pelaksanaan supervisi kunjungan kelas, pra-observasi, observasi pembelajaran, dan pasca-observasi dilanjutkan Rencana Tindak Lanjut (RTL).",
      "evaluation": "Gelombang I tuntas dengan rerata skor 88.4. Catatan perbaikan: alokasi waktu pasca-observasi perlu ditepati dan integrasi model Quantum Learning diperdalam.",
      "reportLink": "https://drive.google.com/drive/folders/1SupervisiKlinis_SMAPlusPGRI_2026?usp=sharing",
      "milestones": [
        {
          "id": "m-4",
          "title": "Sosialisasi instrumen & jadwal supervisi",
          "completed": true,
          "dueDate": "2026-09-02"
        },
        {
          "id": "m-5",
          "title": "Pelaksanaan supervisi gelombang I (Guru Mapel MIPA & IT)",
          "completed": true,
          "dueDate": "2026-09-25"
        },
        {
          "id": "m-6",
          "title": "Pelaksanaan supervisi gelombang II (Bahasa & Sosial Humaniora)",
          "completed": false,
          "dueDate": "2026-10-25"
        },
        {
          "id": "m-7",
          "title": "Rapat pleno evaluasi & coaching tindak lanjut (RTL)",
          "completed": false,
          "dueDate": "2026-11-10"
        }
      ]
    },
    {
      "id": "proker-103",
      "code": "PK-03",
      "title": "Pekan Gelar Karya Projek Penguatan Profil Pelajar Pancasila (P5) Tema 1",
      "category": "P5 & Pembinaan Karakter",
      "pic": "Koordinator Projek P5",
      "targetPeriod": "Oktober - November 2026",
      "academicYear": "2024/2025",
      "budgetEstimated": 25000000,
      "budgetRealized": 14000000,
      "status": "in_progress",
      "progress": 55,
      "indicators": "Terselenggaranya pameran inovasi teknologi ramah lingkungan dan presentasi karya riset siswa kelas X dan XI.",
      "description": "Puncak perayaan tema Rekayasa Teknologi dan Suara Demokrasi melalui expo inovasi, pameran poster ilmiah, dan apresiasi karya unggulan.",
      "evaluation": "Fase prototipe berjalan lancar dengan 24 kelompok riset siswa. Evaluasi: koordinasi ruang pameran indoor dan jadwal presentasi eksternal perlu difinalisasi.",
      "reportLink": "https://drive.google.com/drive/folders/1P5_Expo_KaryaRiset_PGRI2026?usp=sharing",
      "milestones": [
        {
          "id": "m-8",
          "title": "Penyusunan modul projek & pembagian kelompok fasilitator",
          "completed": true,
          "dueDate": "2026-09-12"
        },
        {
          "id": "m-9",
          "title": "Mentoring prototipe produk dan asesmen proses",
          "completed": true,
          "dueDate": "2026-10-10"
        },
        {
          "id": "m-10",
          "title": "Pameran Expo Akbar & Sidang Karya Terbuka",
          "completed": false,
          "dueDate": "2026-11-05"
        },
        {
          "id": "m-11",
          "title": "Penerbitan Rapor Projek P5 Semester Ganjil",
          "completed": false,
          "dueDate": "2026-11-20"
        }
      ]
    },
    {
      "id": "proker-104",
      "code": "PK-04",
      "title": "Asesmen Sumatif Akhir Semester (ASAS) Ganjil Berbasis Computer-Based Test (CBT)",
      "category": "Asesmen & Ujian",
      "pic": "Subbag Evaluasi & Tim IT Kurikulum",
      "targetPeriod": "November - Desember 2026",
      "academicYear": "2024/2025",
      "budgetEstimated": 22000000,
      "budgetRealized": 4500000,
      "status": "in_progress",
      "progress": 30,
      "indicators": "100% soal tervalidasi HOTS, zero-glitch sistem CBT, dan pengolahan e-Rapor tepat waktu.",
      "description": "Penyelenggaraan ujian semester digital terenkripsi dengan bank soal tervalidasi dan pelaporan rapor tepat waktu.",
      "evaluation": "Bank soal tahap 1 terkumpul 82%. Evaluasi: perlu workshop singkat stimulus grafik digital bagi guru sosiologi dan sejarah.",
      "milestones": [
        {
          "id": "m-12",
          "title": "Penyusunan kisi-kisi dan butir soal HOTS oleh MGMP internal",
          "completed": true,
          "dueDate": "2026-10-15"
        },
        {
          "id": "m-13",
          "title": "Review dan uji kelayakan butir soal oleh tim telaah",
          "completed": false,
          "dueDate": "2026-11-05"
        },
        {
          "id": "m-14",
          "title": "Simulasi CBT dan uji beban server lokal/cloud",
          "completed": false,
          "dueDate": "2026-11-18"
        },
        {
          "id": "m-15",
          "title": "Pelaksanaan ASAS dan pembagian rapor hasil belajar",
          "completed": false,
          "dueDate": "2026-12-18"
        }
      ]
    },
    {
      "id": "proker-105",
      "code": "PK-05",
      "title": "Program Pembinaan Intensif Olimpiade Sains & Kelas Riset Ilmiah Remaja (KIR)",
      "category": "Kelas Unggulan & Riset",
      "pic": "Koordinator Kelas Unggulan & Riset",
      "targetPeriod": "Agustus 2026 - Mei 2027",
      "academicYear": "2024/2025",
      "budgetEstimated": 35000000,
      "budgetRealized": 16000000,
      "status": "in_progress",
      "progress": 45,
      "indicators": "Meraih minimal 5 medali tingkat Provinsi/Nasional pada OSN dan OPSI 2027.",
      "description": "Bimbingan terstruktur bersama dosen pakar dan alumni berprestasi untuk 8 bidang sains dan teknik komputasi.",
      "evaluation": "Siswa bimbingan menunjukkan kemajuan signifikan pada tryout provinsi. Catatan: perlu penambahan jam bimbingan mandiri di laboratorium kimia dan fisika.",
      "milestones": [
        {
          "id": "m-16",
          "title": "Seleksi talent pool siswa berpotensi akademik tinggi",
          "completed": true,
          "dueDate": "2026-08-15"
        },
        {
          "id": "m-17",
          "title": "Modul pengayaan materi olimpiade dan drilling soal lanjut",
          "completed": true,
          "dueDate": "2026-09-30"
        },
        {
          "id": "m-18",
          "title": "Pengiriman kontingen pada ajang uji coba antar SMA unggulan",
          "completed": false,
          "dueDate": "2026-11-25"
        }
      ]
    }
  ],
  "supervisions": [
    {
      "id": "sup-201",
      "teacherName": "Drs. H. Mulyadi, M.Pd.",
      "teacherNip": "197405122000031002",
      "subject": "Matematika Tingkat Lanjut",
      "gradeClass": "XI MIPA Plus 1",
      "supervisorName": "Dr. Hj. Nina Nur'aeni, M.Pd.",
      "date": "2026-09-22",
      "time": "08:30 - 10:00",
      "scores": {
        "administration": 95,
        "planning": 94,
        "execution": 92,
        "assessment": 90,
        "quantumLearning": 93
      },
      "overallScore": 92.8,
      "predicate": "Amat Baik",
      "strengths": "Administrasi jurnal dan kalender ajar sangat tertib. Penguasaan materi mendalam dengan integrasi GeoGebra 3D. Penerapan Quantum Learning tampak pada teknik AMBAK dan TANDUR (Tumbuhkan minat dengan analogi satelit & Rayakan keberhasilan kelompok).",
      "weaknesses": "Alokasi waktu pada sesi refleksi akhir dan pemberian umpan balik individual sedikit terburu-buru.",
      "recommendations": "Gunakan quick formative exit-ticket digital (misal Mentimeter/Google Forms singkat) untuk menghemat waktu penutupan.",
      "followUp": {
        "actionTitle": "Optimalisasi Exit-Ticket Digital pada Sesi Refleksi Pembelajaran",
        "method": "Peer Teaching",
        "targetDate": "2026-10-15",
        "mentor": "Rahmat Hidayat, S.Kom., M.T.",
        "status": "Selesai & Diverifikasi",
        "notes": "Guru telah menerapkan Google Form exit ticket 3 pertanyaan dan terbukti menghemat 7 menit waktu pembelajaran."
      }
    },
    {
      "id": "sup-202",
      "teacherName": "Siti Rahmawati, S.Pd., M.Si.",
      "teacherNip": "198803152014022001",
      "subject": "Biologi",
      "gradeClass": "XI MIPA Plus 2",
      "supervisorName": "Bambang Irawan, S.Pd. (Waka Kurikulum)",
      "date": "2026-09-24",
      "time": "10:15 - 11:45",
      "scores": {
        "administration": 88,
        "planning": 90,
        "execution": 86,
        "assessment": 84,
        "quantumLearning": 87
      },
      "overallScore": 87,
      "predicate": "Baik",
      "strengths": "Administrasi perangkat lengkap. Praktikum mikrobiologi di lab sangat tertib. Prinsip Quantum Learning hadir pada penataan atmosfer musik pengiring praktikum dan afirmasi positif kelompok.",
      "weaknesses": "Diferensiasi proses bagi kelompok siswa yang belajar lebih cepat belum optimal; beberapa siswa tampak menunggu lama.",
      "recommendations": "Rancang aktivitas pengayaan (tiering activity) atau kartu tantangan riset mini bagi kelompok yang menyelesaikan observasi lebih awal.",
      "followUp": {
        "actionTitle": "Penyusunan Lembar Kerja Tiered-Activity untuk Pembelajaran Laboratorium Berdiferensiasi",
        "method": "Coaching 1-on-1",
        "targetDate": "2026-10-20",
        "mentor": "Bambang Irawan, S.Pd.",
        "status": "Sedang Berjalan",
        "notes": "Draf lembar kerja berdiferensiasi sedang disusun bersama pembimbing MGMP Biologi."
      }
    },
    {
      "id": "sup-203",
      "teacherName": "Rahmat Hidayat, S.Kom., M.T.",
      "teacherNip": "199108192019031008",
      "subject": "Informatika",
      "gradeClass": "X-1 (Fase E)",
      "supervisorName": "Dr. Hj. Nina Nur'aeni, M.Pd.",
      "date": "2026-09-29",
      "time": "07:30 - 09:00",
      "scores": {
        "administration": 96,
        "planning": 96,
        "execution": 95,
        "assessment": 94,
        "quantumLearning": 97
      },
      "overallScore": 95.6,
      "predicate": "Amat Baik",
      "strengths": "Sempurna dalam menerapkan Quantum Learning kerangka TANDUR: siswa mengalami langsung pemrograman pair coding, gamifikasi interaktif, dan saling merayakan bug yang terpecahkan dengan tepuk apresiasi.",
      "weaknesses": "Perlu sedikit memperlambat tempo penjelasan bagi 3-4 murid yang belum memiliki latar belakang dasar coding saat SMP.",
      "recommendations": "Dapat ditunjuk sebagai Guru Penggerak Praktik Baik untuk diseminasi integrasi AI dan Quantum Learning bagi dewan guru lainnya.",
      "followUp": {
        "actionTitle": "Narasumber Berbagi Praktik Baik Pembelajaran Berbantuan AI di Forum MGMP",
        "method": "Workshop Asesmen",
        "targetDate": "2026-11-08",
        "mentor": "Kepala Sekolah",
        "status": "Sedang Berjalan"
      }
    },
    {
      "id": "sup-204",
      "teacherName": "Nurul Hidayati, S.Pd.",
      "teacherNip": "198506142010012023",
      "subject": "Bahasa Indonesia",
      "gradeClass": "XII IPS Plus 1",
      "supervisorName": "Bambang Irawan, S.Pd.",
      "date": "2026-10-06",
      "time": "13:00 - 14:30",
      "scores": {
        "administration": 80,
        "planning": 82,
        "execution": 78,
        "assessment": 76,
        "quantumLearning": 74
      },
      "overallScore": 78,
      "predicate": "Cukup",
      "strengths": "Administrasi buku nilai terisi rapi. Suasana kelas santun dan guru memiliki intonasi artikulatif dalam memandu pembacaan teks kritik sastra.",
      "weaknesses": "Penerapan Quantum Learning masih minim, lingkungan kelas pasif dan belum ada sesi demonstrasikan atau perayaan yang memotivasi siswa.",
      "recommendations": "Perlu bimbingan intensif dalam mengadopsi model Socratic Seminar serta sintaks TANDUR Quantum Learning untuk menghidupkan antusiasme belajar siswa.",
      "followUp": {
        "actionTitle": "Coaching Metode Diskusi Socratic & Desain Pembelajaran Berpusat pada Murid Berbasis TANDUR",
        "method": "Coaching 1-on-1",
        "targetDate": "2026-10-28",
        "mentor": "Dra. Endang Sulistyowati",
        "status": "Sedang Berjalan",
        "notes": "Pertemuan pertama coaching telah dijadwalkan pada 22 Oktober 2026."
      }
    }
  ],
  "events": [
    {
      "id": "ev-001",
      "title": "Rapat Koordinasi Evaluasi Tengah Semester & Validasi Modul Ajar",
      "date": "2026-10-16",
      "time": "09:00",
      "endTime": "11:30",
      "category": "rapat",
      "priority": "Tinggi",
      "location": "Ruang Rapat Utama & Virtual Hybrid",
      "pic": "Wakasek Kurikulum",
      "description": "Rapat rutin evaluasi ketercapaian target kurikulum, persentase kelengkapan modul ajar dewan guru, dan persiapan asesmen sumatif.",
      "completed": false,
      "reminderMinutesBefore": 15,
      "notified": false
    },
    {
      "id": "ev-002",
      "title": "Supervisi Akademik Guru Fisika & Kimia Gelombang II",
      "date": "2026-10-19",
      "time": "08:00",
      "endTime": "12:00",
      "category": "supervisi",
      "priority": "Tinggi",
      "location": "Lab MIPA & Ruang Kelas XI",
      "pic": "Dr. Hj. Nina Nur'aeni, M.Pd.",
      "description": "Observasi pelaksanaan pembelajaran diferensiasi dan asesmen formatif 4 guru rumpun sains.",
      "completed": false,
      "reminderMinutesBefore": 60,
      "notified": false
    },
    {
      "id": "ev-003",
      "title": "Tenggat Waktu Finalisasi Bank Soal Sumatif Berbasis HOTS",
      "date": "2026-10-23",
      "time": "15:00",
      "category": "deadline",
      "priority": "Tinggi",
      "location": "Portal Kurikulum SIM PGRI",
      "pic": "Ketua MGMP Mata Pelajaran",
      "description": "Batas akhir unggah 40 butir kisi-kisi dan naskah soal asesmen sumatif akhir semester ke dalam portal bank soal.",
      "completed": false,
      "reminderMinutesBefore": 120,
      "notified": false
    },
    {
      "id": "ev-004",
      "title": "Workshop Bedah Modul Ajar & Rubrik Penilaian Berbantuan AI",
      "date": "2026-10-27",
      "time": "13:00",
      "endTime": "16:00",
      "category": "kegiatan",
      "priority": "Sedang",
      "location": "Lab Komputer Multimedia",
      "pic": "Rahmat Hidayat, S.Kom., M.T.",
      "description": "Bimbingan teknis praktis pemanfaatan asisten AI Kurikulum untuk menyusun rubrik asesmen autentik dan modul P5.",
      "completed": false,
      "reminderMinutesBefore": 60,
      "notified": false
    },
    {
      "id": "ev-005",
      "title": "Simulasi Sistem Ujian Komputer (CBT) Tahap 1",
      "date": "2026-11-04",
      "time": "08:00",
      "endTime": "11:00",
      "category": "asesmen",
      "priority": "Sedang",
      "location": "Server Room & Seluruh Ruang Kelas",
      "pic": "Subbag Evaluasi Kurikulum",
      "description": "Uji kesiapan infrastruktur jaringan wifi, tablet siswa, dan load balancing server penilai.",
      "completed": false,
      "reminderMinutesBefore": 1440,
      "notified": false
    },
    {
      "id": "ev-006",
      "title": "Pekan Gelar Karya Projek Profil Pelajar Pancasila (P5 Expo)",
      "date": "2026-11-12",
      "time": "07:30",
      "endTime": "15:00",
      "category": "kegiatan",
      "priority": "Tinggi",
      "location": "Auditorium & Lapangan Utama SMA Plus PGRI",
      "pic": "Koordinator Projek P5",
      "description": "Pameran hasil karya inovasi rekayasa teknologi dan produk kewirausahaan seluruh siswa kelas 10 dan 11.",
      "completed": false,
      "reminderMinutesBefore": 1440,
      "notified": false
    }
  ],
  "meetings": [
    {
      "id": "meet-001",
      "documentNumber": "421.3/088/SMAPLUS-PGRI/X/2026",
      "title": "Rapat Pleno Koordinasi Evaluasi Pembelajaran Tengah Semester Ganjil & Validasi Perangkat Ajar",
      "type": "Rapat Kurikulum",
      "date": "2026-10-16",
      "time": "08:30 - 11:45 WIB",
      "location": "Ruang Multimedia & Rapat Utama Lt. 2",
      "leader": "Dr. Hj. Nina Nur'aeni, M.Pd. (Kepala Sekolah)",
      "noteTaker": "Bambang Irawan, S.Pd. (Waka Kurikulum)",
      "attendeesCount": 78,
      "attendeesList": "Seluruh Dewan Guru Mata Pelajaran, Wali Kelas X, XI, XII, Tim Pengembang Kurikulum, dan Koordinator P5.",
      "agenda": "1. Pembukaan & Pengarahan Kepala Sekolah\n2. Paparan Ketercapaian Capaian Pembelajaran (CP) & Ketuntasan Modul Ajar\n3. Hasil Evaluasi Supervisi Klinis Gelombang I\n4. Kesiapan Asesmen Sumatif Akhir Semester (ASAS) Berbasis CBT\n5. Pembahasan Rencana Tindak Lanjut (RTL) Dewan Guru",
      "discussionNotes": "Kepala Sekolah mengapresiasi pencapaian 92% guru yang telah menyelesaikan administrasi modul ajar berdiferensiasi tepat waktu. Terdapat catatan khusus bagi 6 guru mata pelajaran rumpun bahasa dan sosial terkait penguatan asesmen autentik dan penggunaan kerangka Quantum Learning (TANDUR). Tim IT Kurikulum melaporkan kesiapan 3 laboratorium komputer untuk pelaksanaan simulasi CBT.",
      "decisions": "1. Seluruh kisi-kisi dan naskah soal ASAS HOTS wajib diserahkan ke tim kurikulum paling lambat 23 Oktober 2026.\n2. Dilaksanakan pendampingan klinis 1-on-1 bagi guru dengan catatan supervisi administrasi.\n3. Simulasi sistem ujian CBT dijadwalkan serentak pada tanggal 4 November 2026.",
      "status": "Terlaksana",
      "academicYear": "2024/2025"
    },
    {
      "id": "meet-002",
      "documentNumber": "421.3/074/SMAPLUS-PGRI/IX/2026",
      "title": "Rapat Koordinasi Persiapan Pekan Gelar Karya Projek Penguatan Profil Pelajar Pancasila (P5 Expo)",
      "type": "Rapat Dewan Guru",
      "date": "2026-09-28",
      "time": "13:00 - 15:30 WIB",
      "location": "Auditorium Graha PGRI Cibinong",
      "leader": "Bambang Irawan, S.Pd. (Waka Kurikulum)",
      "noteTaker": "Nurul Hidayati, S.Pd.",
      "attendeesCount": 42,
      "attendeesList": "Fasilitator P5 Kelas X dan XI, Pembina Ekstrakurikuler, Perwakilan Komite Sekolah, dan Pengurus OSIS.",
      "agenda": "1. Finalisasi Tema P5: Rekayasa Teknologi & Kewirausahaan Mandiri\n2. Penentuan Jadwal Expo & Tata Letak Stan Pameran Karya Siswa\n3. Format Lembar Asesmen Observasi Karakter Profil Pelajar Pancasila\n4. Anggaran dan Kebutuhan Sarana Kelistrikan/Display Stand",
      "discussionNotes": "Koordinator P5 menyampaikan progres 24 prototipe inovasi siswa telah mencapai 80%. Pembina Komite menyetujui pelibatan orang tua sebagai reviewer tamu pada sesi gelar karya terbuka.",
      "decisions": "1. Gelar Karya P5 Expo ditetapkan pada 12 November 2026 di Lapangan Utama & Auditorium.\n2. Pengisian Rapor P5 dilakukan terintegrasi melalui portal SIM Kurikulum paling lambat 20 November 2026.",
      "status": "Terlaksana",
      "academicYear": "2024/2025"
    },
    {
      "id": "meet-003",
      "documentNumber": "421.3/095/SMAPLUS-PGRI/X/2026",
      "title": "Rapat Pembinaan Khusus Guru & Pendampingan Penyusunan Soal Ujian Literasi Numerasi",
      "type": "Rapat MGMP",
      "date": "2026-10-27",
      "time": "13:30 - 16:00 WIB",
      "location": "Lab Komputer Multimedia",
      "leader": "Rahmat Hidayat, S.Kom., M.T. (Ketua Tim IT)",
      "noteTaker": "Maya Lestari, S.Pd., M.Si.",
      "attendeesCount": 35,
      "attendeesList": "Guru Rumpun MIPA, Informatika, dan Bahasa Indonesia.",
      "agenda": "1. Bedah stimulus soal Asesmen Nasional (AKM)\n2. Praktik pembuatan stimulus grafik & infografis digital berbantuan AI\n3. Uji validasi tingkat kesukaran soal",
      "discussionNotes": "Fokus kegiatan pada penajaman stimulus soal numerasi kontekstual agar siswa terbiasa dengan model problem solving tingkat tinggi.",
      "decisions": "Setiap guru mata pelajaran menyusun minimal 5 butir soal HOTS stimulus kontekstual kearifan lokal Jawa Barat.",
      "status": "Dijadwalkan",
      "academicYear": "2024/2025"
    }
  ],
  "dispositions": [
    {
      "id": "disp-001",
      "agendaNumber": "AG-2026/X/042",
      "source": "Cabang Dinas Pendidikan Wilayah I Provinsi Jawa Barat",
      "letterNumber": "421.3/1452/Cadisdik.Wil.I/2026",
      "letterDate": "2026-10-10",
      "receivedDate": "2026-10-12",
      "subject": "Surat Edaran Pelaksanaan Verifikasi dan Validasi Kelayakan Kurikulum Operasional (KOSP) Tahun Ajaran 2026/2027",
      "priority": "Sangat Segera",
      "disposedBy": "Dr. Hj. Nina Nur'aeni, M.Pd. (Kepala Sekolah)",
      "targetAudience": [
        "Waka Kurikulum",
        "Tim Pengembang Kurikulum",
        "Kepala Tata Usaha"
      ],
      "instruction": [
        "Tindak lanjuti segera",
        "Siapkan bahan/kelengkapan berkas KOSP",
        "Koordinasikan dengan Pengawas Pembina"
      ],
      "directorNotes": "Waka Kurikulum segera cek kembali instrumen pengesahan dari Cabang Dinas. Pastikan struktur kurikulum kelas unggulan riset dan bukti fisik modul ajar terlampir lengkap.",
      "deadline": "2026-10-20",
      "status": "Sedang Ditindaklanjuti"
    },
    {
      "id": "disp-002",
      "agendaNumber": "AG-2026/X/045",
      "source": "YPLP Dikdasmen PGRI Jawa Barat",
      "letterNumber": "088/YPLP-PGRI/JBR/X/2026",
      "letterDate": "2026-10-14",
      "receivedDate": "2026-10-15",
      "subject": "Undangan Rapat Koordinasi Wilayah Persiapan Akreditasi Sekolah Unggulan Berkelanjutan",
      "priority": "Segera",
      "disposedBy": "Dr. Hj. Nina Nur'aeni, M.Pd. (Kepala Sekolah)",
      "targetAudience": [
        "Waka Kurikulum",
        "Waka Manajemen Mutu",
        "Tim Penjamin Mutu"
      ],
      "instruction": [
        "Hadiri dan wakili",
        "Laporkan hasilnya secara tertulis",
        "Siapkan bahan paparan profil keunggulan"
      ],
      "directorNotes": "Mohon Waka Kurikulum mendampingi Kepala Sekolah pada rapat tanggal 22 Oktober 2026 di Bandung. Bahan paparan integrasi Quantum Learning dan AI disiapkan.",
      "deadline": "2026-10-21",
      "status": "Sedang Ditindaklanjuti"
    },
    {
      "id": "disp-003",
      "agendaNumber": "AG-2026/IX/038",
      "source": "Pusat Prestasi Nasional (Puspresnas) Kemendikbudristek",
      "letterNumber": "0512/J3/PN.01/2026",
      "letterDate": "2026-09-18",
      "receivedDate": "2026-09-20",
      "subject": "Pemberitahuan Seleksi Tahap Provinsi Olimpiade Penelitian Siswa Indonesia (OPSI) & OSN 2027",
      "priority": "Biasa",
      "disposedBy": "Dr. Hj. Nina Nur'aeni, M.Pd. (Kepala Sekolah)",
      "targetAudience": [
        "Koordinator Kelas Unggulan & Riset",
        "Pembina OSN/KIR",
        "Waka Kesiswaan"
      ],
      "instruction": [
        "Tindak lanjuti segera",
        "Fasilitasi siswa bimbingan riset",
        "Arsipkan & monitor progres"
      ],
      "directorNotes": "Fasilitasi penuh 8 siswa bimbingan KIR dan OSN. Berikan dispensasi pembelajaran dan alokasi bimbingan di laboratorium riset.",
      "deadline": "2026-10-30",
      "status": "Tuntas"
    }
  ],
  "meetingRtls": [
    {
      "id": "rtl-001",
      "actionTitle": "Pendampingan Penyusunan Rubrik Asesmen HOTS & Stimulus Numerasi Guru Rumpun Bahasa dan IPS",
      "sourceType": "Hasil Rapat",
      "sourceReference": "Rapat Pleno Tengah Semester (16 Okt 2026)",
      "pic": "Waka Kurikulum & Tim Pengembang",
      "targetDate": "2026-10-25",
      "resourcesNeeded": "Ruang Lab Komputer, Modul Panduan BSKAP 032, Snack Rapat Mandiri",
      "indicators": "100% guru bahasa dan IPS mengumpulkan minimal 3 set soal HOTS tervalidasi rubrik.",
      "progress": 75,
      "status": "Sedang Berjalan",
      "evidenceLink": "https://drive.google.com/drive/folders/1RTL_RubrikHOTS_BahasaIPS_2026?usp=sharing",
      "notes": "Sesi pendampingan tatap muka pertama telah selesai pada 19 Oktober. Draf revisi soal sedang direview tim penelaah."
    },
    {
      "id": "rtl-002",
      "actionTitle": "Finalisasi Dokumen KOSP & Lampiran Beban Mengajar Guru untuk Pengesahan Cabang Dinas",
      "sourceType": "Instruksi Disposisi",
      "sourceReference": "Disposisi Surat Cadisdik No. 421.3/1452 (AG-042)",
      "pic": "Dra. Endang Sulistyowati (Tim KOSP)",
      "targetDate": "2026-10-20",
      "resourcesNeeded": "Dokumen Fisik KOSP Jilid Hardcover & Salinan Digital PDF Ber-barcode",
      "indicators": "Tanda tangan pengesahan dan stempel basah Kepala Cabang Dinas Wilayah I terbit.",
      "progress": 100,
      "status": "Tuntas & Terverifikasi",
      "evidenceLink": "https://drive.google.com/drive/folders/1DokumenKOSP_TervalidasiCadisdik2026?usp=sharing",
      "notes": "KOSP telah diverifikasi oleh Pengawas Pembina dan berkas fisik telah diserahkan ke Cabang Dinas Wilayah I."
    },
    {
      "id": "rtl-003",
      "actionTitle": "Uji Beban (Load Test) Jaringan Server CBT & Simulasi Ujian Mandiri Peserta Didik",
      "sourceType": "Hasil Rapat",
      "sourceReference": "Rapat Pleno Tengah Semester (16 Okt 2026)",
      "pic": "Rahmat Hidayat, S.Kom., M.T. (Subbag IT)",
      "targetDate": "2026-11-04",
      "resourcesNeeded": "Akses Router Mikrotik Ruang Ujian, 360 Client Tablet/PC, Server Cadangan Cloud",
      "indicators": "Koneksi simultan 360 siswa lancar tanpa drop koneksi (latency < 25ms).",
      "progress": 40,
      "status": "Sedang Berjalan",
      "evidenceLink": "https://drive.google.com/drive/folders/1SimulasiCBT_InfrastrukturIT_2026?usp=sharing",
      "notes": "Konfigurasi access point ruang kelas X dan XI telah selesai di-upgrade."
    },
    {
      "id": "rtl-004",
      "actionTitle": "Penerbitan Surat Keputusan (SK) Dewan Juri Eksternal Pameran Gelar Karya P5 Expo",
      "sourceType": "Hasil Rapat",
      "sourceReference": "Rapat Koordinasi P5 Expo (28 Sep 2026)",
      "pic": "Koordinator Projek P5 & Kepala Tata Usaha",
      "targetDate": "2026-10-28",
      "resourcesNeeded": "SK Kepala Sekolah, Piagam Penghargaan Dewan Juri, Plakat Kerja Sama",
      "indicators": "3 Juri eksternal dari praktisi industri teknologi dan perguruan tinggi terkonfirmasi hadir.",
      "progress": 100,
      "status": "Tuntas & Terverifikasi",
      "evidenceLink": "https://drive.google.com/drive/folders/1SK_DewanJuri_P5Expo2026?usp=sharing",
      "notes": "SK No. 421.3/102 telah ditandatangani Kepala Sekolah dan dikirimkan kepada para narasumber."
    }
  ]
};

/**
 * Mendapatkan referensi Spreadsheet aktif atau via ID
 */
function getSpreadsheet() {
  var propId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  var targetId = propId || SPREADSHEET_ID;

  if (targetId && targetId.trim() !== '') {
    return SpreadsheetApp.openById(targetId.trim());
  }

  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  // Jika standalone dan belum ada ID, cari atau buat otomatis di Google Drive
  var files = DriveApp.getFilesByName('SIM Kurikulum - SMA Plus PGRI Cibinong (Database)');
  if (files.hasNext()) {
    var file = files.next();
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', file.getId());
    return SpreadsheetApp.openById(file.getId());
  } else {
    var newSs = SpreadsheetApp.create('SIM Kurikulum - SMA Plus PGRI Cibinong (Database)');
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', newSs.getId());
    return newSs;
  }
}

/**
 * =========================================================================================
 * FUNGSI UTAMA: MASUKKAN DATA APLIKASI KE SPREADSHEET
 * Pilih fungsi ini di dropdown toolbar atas Apps Script lalu klik tombol 'Run' (Jalankan)
 * =========================================================================================
 */
function isiDataAplikasiKeSpreadsheet(forceOverwrite) {
  ensureDatabaseStructure();
  var ss = getSpreadsheet();
  var resultCounts = {};

  // 1. DATA GURU (10 Guru Lengkap dengan NIP, Rumpun Mapel & Beban JP)
  var tSheet = ss.getSheetByName(SHEETS.TEACHERS);
  if (tSheet && (forceOverwrite || tSheet.getLastRow() <= 1)) {
    if (forceOverwrite && tSheet.getLastRow() > 1) {
      tSheet.deleteRows(2, tSheet.getLastRow() - 1);
    }
    var tRows = INITIAL_APP_DATA.teachers.map(function(t) {
      return [
        t.id,
        t.name || '',
        t.nip || '',
        t.subject || '',
        t.subjectCluster || 'Lainnya',
        t.employmentStatus || 'GTY / Tetap Yayasan',
        t.education || 'S1',
        t.phone || '',
        t.email || '',
        Number(t.teachingHours) || 0,
        t.additionalRole || '',
        t.certificationStatus === true
      ];
    });
    if (tRows.length > 0) {
      tSheet.getRange(tSheet.getLastRow() + 1, 1, tRows.length, tRows[0].length).setValues(tRows);
    }
    resultCounts.guru = tRows.length;
  }

  // 2. DOKUMEN KURIKULUM (KOSP, Modul Ajar, ATP, Modul P5, Asesmen)
  var dSheet = ss.getSheetByName(SHEETS.DOCUMENTS);
  if (dSheet && (forceOverwrite || dSheet.getLastRow() <= 1)) {
    if (forceOverwrite && dSheet.getLastRow() > 1) {
      dSheet.deleteRows(2, dSheet.getLastRow() - 1);
    }
    var dRows = INITIAL_APP_DATA.documents.map(function(d) {
      return [
        d.id,
        d.title || '',
        d.type || 'Modul Ajar',
        d.phase || 'Semua Tingkat',
        d.subject || '',
        d.authorTeacher || '',
        d.uploadDate || '',
        d.status || 'pending',
        d.fileSize || '1.5 MB',
        d.version || 'v1.0',
        JSON.stringify(d.learningObjectives || []),
        d.description || '',
        d.reviewerNotes || ''
      ];
    });
    if (dRows.length > 0) {
      dSheet.getRange(dSheet.getLastRow() + 1, 1, dRows.length, dRows[0].length).setValues(dRows);
    }
    resultCounts.dokumen = dRows.length;
  }

  // 3. PROGRAM KERJA (Kurikulum KOSP, IHT Guru, Ujian CBT, Gelar Karya P5)
  var pSheet = ss.getSheetByName(SHEETS.PROGRAMS);
  if (pSheet && (forceOverwrite || pSheet.getLastRow() <= 1)) {
    if (forceOverwrite && pSheet.getLastRow() > 1) {
      pSheet.deleteRows(2, pSheet.getLastRow() - 1);
    }
    var pRows = INITIAL_APP_DATA.programs.map(function(p) {
      return [
        p.id,
        p.code || '',
        p.title || '',
        p.category || 'Kurikulum & KOSP',
        p.pic || '',
        p.targetPeriod || '',
        p.academicYear || '2024/2025',
        Number(p.budgetEstimated) || 0,
        Number(p.budgetRealized) || 0,
        p.status || 'not_started',
        Number(p.progress) || 0,
        JSON.stringify(p.milestones || []),
        p.description || '',
        p.indicators || '',
        p.notes || '',
        p.evaluation || '',
        p.reportLink || ''
      ];
    });
    if (pRows.length > 0) {
      pSheet.getRange(pSheet.getLastRow() + 1, 1, pRows.length, pRows[0].length).setValues(pRows);
    }
    resultCounts.programKerja = pRows.length;
  }

  // 4. SUPERVISI KLINIS (Instrumen Administrasi, Perencanaan, Asesmen & Quantum Learning)
  var sSheet = ss.getSheetByName(SHEETS.SUPERVISIONS);
  if (sSheet && (forceOverwrite || sSheet.getLastRow() <= 1)) {
    if (forceOverwrite && sSheet.getLastRow() > 1) {
      sSheet.deleteRows(2, sSheet.getLastRow() - 1);
    }
    var sRows = INITIAL_APP_DATA.supervisions.map(function(s) {
      return [
        s.id,
        s.teacherName || '',
        s.teacherNip || '',
        s.subject || '',
        s.gradeClass || '',
        s.supervisorName || '',
        s.date || '',
        s.time || '',
        JSON.stringify(s.scores || {}),
        Number(s.overallScore) || 0,
        s.predicate || 'Baik',
        s.strengths || '',
        s.weaknesses || '',
        s.recommendations || '',
        JSON.stringify(s.followUp || {})
      ];
    });
    if (sRows.length > 0) {
      sSheet.getRange(sSheet.getLastRow() + 1, 1, sRows.length, sRows[0].length).setValues(sRows);
    }
    resultCounts.supervisi = sRows.length;
  }

  // 5. JADWAL KALENDER & PENGINGAT
  var eSheet = ss.getSheetByName(SHEETS.EVENTS);
  if (eSheet && (forceOverwrite || eSheet.getLastRow() <= 1)) {
    if (forceOverwrite && eSheet.getLastRow() > 1) {
      eSheet.deleteRows(2, eSheet.getLastRow() - 1);
    }
    var eRows = INITIAL_APP_DATA.events.map(function(e) {
      return [
        e.id,
        e.title || '',
        e.date || '',
        e.time || '08:00',
        e.endTime || '',
        e.category || 'kegiatan',
        e.priority || 'Sedang',
        e.location || '',
        e.pic || '',
        e.description || '',
        e.completed === true,
        Number(e.reminderMinutesBefore) || 30,
        e.notified === true
      ];
    });
    if (eRows.length > 0) {
      eSheet.getRange(eSheet.getLastRow() + 1, 1, eRows.length, eRows[0].length).setValues(eRows);
    }
    resultCounts.jadwal = eRows.length;
  }

  // 6. RAPAT & NOTULENSI
  var mSheet = ss.getSheetByName(SHEETS.MEETINGS);
  if (mSheet && (forceOverwrite || mSheet.getLastRow() <= 1)) {
    if (forceOverwrite && mSheet.getLastRow() > 1) {
      mSheet.deleteRows(2, mSheet.getLastRow() - 1);
    }
    var mRows = INITIAL_APP_DATA.meetings.map(function(m) {
      return [
        m.id,
        m.documentNumber || '',
        m.title || '',
        m.type || 'Rapat Kurikulum',
        m.date || '',
        m.time || '',
        m.location || '',
        m.leader || '',
        m.noteTaker || '',
        Number(m.attendeesCount) || 0,
        m.attendeesList || '',
        m.agenda || '',
        m.discussionNotes || '',
        m.decisions || '',
        m.status || 'Dijadwalkan',
        m.academicYear || '2024/2025'
      ];
    });
    if (mRows.length > 0) {
      mSheet.getRange(mSheet.getLastRow() + 1, 1, mRows.length, mRows[0].length).setValues(mRows);
    }
    resultCounts.rapat = mRows.length;
  }

  // 7. LEMBAR DISPOSISI SURAT
  var dispSheet = ss.getSheetByName(SHEETS.DISPOSITIONS);
  if (dispSheet && (forceOverwrite || dispSheet.getLastRow() <= 1)) {
    if (forceOverwrite && dispSheet.getLastRow() > 1) {
      dispSheet.deleteRows(2, dispSheet.getLastRow() - 1);
    }
    var dispRows = INITIAL_APP_DATA.dispositions.map(function(d) {
      return [
        d.id,
        d.agendaNumber || '',
        d.source || '',
        d.letterNumber || '',
        d.letterDate || '',
        d.receivedDate || '',
        d.subject || '',
        d.priority || 'Biasa',
        d.disposedBy || '',
        JSON.stringify(d.targetAudience || []),
        JSON.stringify(d.instruction || []),
        d.directorNotes || '',
        d.deadline || '',
        d.status || 'Belum Diproses'
      ];
    });
    if (dispRows.length > 0) {
      dispSheet.getRange(dispSheet.getLastRow() + 1, 1, dispRows.length, dispRows[0].length).setValues(dispRows);
    }
    resultCounts.disposisi = dispRows.length;
  }

  // 8. RENCANA TINDAK LANJUT RAPAT (RTL)
  var rtlSheet = ss.getSheetByName(SHEETS.MEETING_RTLS);
  if (rtlSheet && (forceOverwrite || rtlSheet.getLastRow() <= 1)) {
    if (forceOverwrite && rtlSheet.getLastRow() > 1) {
      rtlSheet.deleteRows(2, rtlSheet.getLastRow() - 1);
    }
    var rtlRows = INITIAL_APP_DATA.meetingRtls.map(function(r) {
      return [
        r.id,
        r.actionTitle || '',
        r.sourceType || 'Hasil Rapat',
        r.sourceReference || '',
        r.pic || '',
        r.targetDate || '',
        r.resourcesNeeded || '',
        r.indicators || '',
        Number(r.progress) || 0,
        r.status || 'Belum Mulai',
        r.evidenceLink || '',
        r.notes || ''
      ];
    });
    if (rtlRows.length > 0) {
      rtlSheet.getRange(rtlSheet.getLastRow() + 1, 1, rtlRows.length, rtlRows[0].length).setValues(rtlRows);
    }
    resultCounts.rtl = rtlRows.length;
  }

  Logger.log('=== SUKSES: Data Aplikasi Berhasil Dimasukkan ke Spreadsheet ===');
  Logger.log(JSON.stringify(resultCounts));

  return {
    success: true,
    message: 'Seluruh data aplikasi (Guru, Dokumen, Proker, Supervisi, Jadwal, Rapat, Disposisi, RTL) berhasil dimasukkan ke Spreadsheet Google Drive!',
    spreadsheetUrl: ss.getUrl(),
    counts: resultCounts
  };
}

/**
 * Entry point HTTP GET (Web App dan API GET)
 */
function doGet(e) {
  // Jika ada parameter action, perlakukan sebagai panggilan API
  if (e && e.parameter && e.parameter.action) {
    var action = e.parameter.action;
    var result = {};

    try {
      if (action === 'getAllData') {
        result = { success: true, data: getAllData() };
      } else if (action === 'initDatabase') {
        result = initDatabase();
      } else if (action === 'seedDatabase' || action === 'isiData') {
        var overwrite = e.parameter.overwrite === 'true';
        result = isiDataAplikasiKeSpreadsheet(overwrite);
      } else if (action === 'getInfo') {
        result = { success: true, info: getSpreadsheetInfo() };
      } else if (action === 'aiGenerate') {
        var prompt = e.parameter.prompt || '';
        var mode = e.parameter.mode || 'general';
        result = generateAiResponse(prompt, mode);
      } else {
        result = { success: false, error: 'Aksi tidak dikenali: ' + action };
      }
    } catch (err) {
      result = { success: false, error: err.toString() };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Jika diakses langsung via browser tanpa action, sajikan HTML Web App
  try {
    var htmlOutput = HtmlService.createHtmlOutputFromFile('index');
    htmlOutput.setTitle('SIM Kurikulum - SMA Plus PGRI Cibinong');
    htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    return htmlOutput;
  } catch (err) {
    // Jika file index.html belum diupload ke Apps Script, tampilkan halaman status & panduan
    var ss = getSpreadsheet();
    var infoHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>SIM Kurikulum - GAS Backend</title>' +
      '<style>body{font-family:system-ui,-apple-system,sans-serif;padding:32px;background:#f8fafc;color:#1e293b;max-width:800px;margin:auto}' +
      '.card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);border:1px solid #e2e8f0;margin-bottom:20px}' +
      'h1{color:#059669;margin-top:0}h2{font-size:18px;margin-top:0}' +
      'code{background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:13px}' +
      '.btn{display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;margin-right:8px}' +
      '.badge{display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:bold;background:#d1fae5;color:#065f46}' +
      '</style></head><body>' +
      '<div class="card">' +
      '<span class="badge">Backend GAS Aktif</span>' +
      '<h1>SIM Kurikulum SMA Plus PGRI Cibinong</h1>' +
      '<p>Google Apps Script API & Database Spreadsheet siap digunakan.</p>' +
      '</div>' +
      '<div class="card">' +
      '<h2>Informasi Database</h2>' +
      '<p><strong>Nama Spreadsheet:</strong> ' + ss.getName() + '<br>' +
      '<strong>ID Spreadsheet:</strong> <code>' + ss.getId() + '</code><br>' +
      '<strong>URL Spreadsheet:</strong> <a href="' + ss.getUrl() + '" target="_blank">' + ss.getUrl() + '</a></p>' +
      '<a href="' + ss.getUrl() + '" target="_blank" class="btn">Buka Spreadsheet Google Drive</a>' +
      '</div>' +
      '<div class="card">' +
      '<h2>Langkah Pengisian Data Awal:</h2>' +
      '<p>Di editor Apps Script, pilih fungsi <code>isiDataAplikasiKeSpreadsheet</code> lalu klik <strong>Run</strong> untuk memasukkan seluruh data guru, dokumen, proker, supervisi, jadwal, rapat, dan disposisi.</p>' +
      '</div>' +
      '</body></html>';
    return HtmlService.createHtmlOutput(infoHtml)
      .setTitle('SIM Kurikulum Backend Aktif')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * Entry point HTTP POST (REST API untuk Frontend eksternal atau fetch)
 */
function doPost(e) {
  var result = { success: false, error: 'Permintaan kosong' };

  try {
    var rawData = e.postData ? e.postData.contents : '';
    var request = {};
    if (rawData) {
      request = JSON.parse(rawData);
    } else if (e.parameter) {
      request = e.parameter;
    }

    var action = request.action;
    var data = request.data || request.payload || {};

    switch (action) {
      case 'getAllData':
        result = { success: true, data: getAllData() };
        break;

      case 'seedDatabase':
      case 'isiData':
        result = isiDataAplikasiKeSpreadsheet(data.overwrite === true);
        break;

      case 'saveTeacher':
        result = { success: true, data: saveTeacher(data) };
        break;

      case 'deleteTeacher':
        result = { success: true, data: deleteTeacher(data.id || data) };
        break;

      case 'importTeachers':
        result = { success: true, data: importTeachers(data) };
        break;

      case 'saveDocument':
        result = { success: true, data: saveDocument(data) };
        break;

      case 'deleteDocument':
        result = { success: true, data: deleteDocument(data.id || data) };
        break;

      case 'updateDocStatus':
        result = { success: true, data: updateDocStatus(data.id, data.status) };
        break;

      case 'saveProgram':
        result = { success: true, data: saveProgram(data) };
        break;

      case 'deleteProgram':
        result = { success: true, data: deleteProgram(data.id || data) };
        break;

      case 'toggleMilestone':
        result = { success: true, data: toggleMilestone(data.programId, data.milestoneId) };
        break;

      case 'saveSupervision':
        result = { success: true, data: saveSupervision(data) };
        break;

      case 'deleteSupervision':
        result = { success: true, data: deleteSupervision(data.id || data) };
        break;

      case 'toggleSupervisionRtl':
        result = { success: true, data: toggleSupervisionRtl(data.id || data) };
        break;

      case 'saveEvent':
        result = { success: true, data: saveEvent(data) };
        break;

      case 'deleteEvent':
        result = { success: true, data: deleteEvent(data.id || data) };
        break;

      case 'toggleEventComplete':
        result = { success: true, data: toggleEventComplete(data.id || data) };
        break;

      case 'saveMeeting':
        result = { success: true, data: saveMeeting(data) };
        break;

      case 'deleteMeeting':
        result = { success: true, data: deleteMeeting(data.id || data) };
        break;

      case 'saveDisposition':
        result = { success: true, data: saveDisposition(data) };
        break;

      case 'deleteDisposition':
        result = { success: true, data: deleteDisposition(data.id || data) };
        break;

      case 'saveMeetingRtl':
        result = { success: true, data: saveMeetingRtl(data) };
        break;

      case 'deleteMeetingRtl':
        result = { success: true, data: deleteMeetingRtl(data.id || data) };
        break;

      case 'syncAllData':
        result = syncAllData(data);
        break;

      case 'initDatabase':
        result = initDatabase();
        break;

      case 'aiGenerate':
        result = generateAiResponse(data.prompt, data.mode, data.context);
        break;

      case 'getInfo':
        result = { success: true, info: getSpreadsheetInfo() };
        break;

      default:
        result = { success: false, error: 'Aksi tidak diketahui: ' + action };
        break;
    }
  } catch (err) {
    result = { success: false, error: err.toString(), stack: err.stack };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================================
// OPERASI DATABASE SPREADSHEET (CRUD)
// =========================================================================================

function getOrCreateSheet(sheetName, headers) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#059669'); // Hijau SMA Plus PGRI
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function readSheetData(sheetName, mapper) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol < 1) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var result = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    if (!row[0] || row[0].toString().trim() === '') continue;
    try {
      var item = mapper(row, i + 2);
      if (item) result.push(item);
    } catch (e) {
      Logger.log('Error mapping row ' + (i + 2) + ' in ' + sheetName + ': ' + e);
    }
  }
  return result;
}

function findRowById(sheet, id) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;

  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] && ids[i][0].toString() === id.toString()) {
      return i + 2;
    }
  }
  return -1;
}

function getAllData() {
  ensureDatabaseStructure();

  // Otomatis cek & isi data awal jika spreadsheet masih kosong
  var teachers = getAllTeachers();
  if (teachers.length === 0) {
    isiDataAplikasiKeSpreadsheet(false);
    teachers = getAllTeachers();
  }

  return {
    teachers: teachers,
    documents: getAllDocuments(),
    programs: getAllPrograms(),
    supervisions: getAllSupervisions(),
    events: getAllEvents(),
    meetings: getAllMeetings(),
    dispositions: getAllDispositions(),
    meetingRtls: getAllMeetingRtls(),
    spreadsheetInfo: getSpreadsheetInfo()
  };
}

// ----------------------------------------------------
// Modul: Guru (Teachers)
// ----------------------------------------------------

var TEACHER_HEADERS = [
  'id', 'name', 'nip', 'subject', 'subjectCluster', 'employmentStatus', 
  'education', 'phone', 'email', 'teachingHours', 'additionalRole', 'certificationStatus'
];

function getAllTeachers() {
  return readSheetData(SHEETS.TEACHERS, function(row) {
    return {
      id: String(row[0]),
      name: String(row[1] || ''),
      nip: String(row[2] || ''),
      subject: String(row[3] || ''),
      subjectCluster: row[4] || 'Lainnya',
      employmentStatus: row[5] || 'GTY / Tetap Yayasan',
      education: row[6] || 'S1',
      phone: String(row[7] || ''),
      email: String(row[8] || ''),
      teachingHours: Number(row[9]) || 0,
      additionalRole: String(row[10] || ''),
      certificationStatus: row[11] === true || String(row[11]).toLowerCase() === 'true' || String(row[11]).toLowerCase() === 'ya'
    };
  });
}

function saveTeacher(t) {
  if (!t.id) t.id = 'tch-' + new Date().getTime();
  var sheet = getOrCreateSheet(SHEETS.TEACHERS, TEACHER_HEADERS);
  var rowData = [
    t.id,
    t.name || '',
    t.nip || '',
    t.subject || '',
    t.subjectCluster || 'Lainnya',
    t.employmentStatus || 'GTY / Tetap Yayasan',
    t.education || 'S1',
    t.phone || '',
    t.email || '',
    t.teachingHours || 0,
    t.additionalRole || '',
    t.certificationStatus === true
  ];

  var rowIdx = findRowById(sheet, t.id);
  if (rowIdx > 0) {
    sheet.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return t;
}

function deleteTeacher(id) {
  var sheet = getOrCreateSheet(SHEETS.TEACHERS, TEACHER_HEADERS);
  var rowIdx = findRowById(sheet, id);
  if (rowIdx > 0) {
    sheet.deleteRow(rowIdx);
    return true;
  }
  return false;
}

function importTeachers(teachersList) {
  if (!Array.isArray(teachersList)) return [];
  for (var i = 0; i < teachersList.length; i++) {
    saveTeacher(teachersList[i]);
  }
  return getAllTeachers();
}

// ----------------------------------------------------
// Modul: Dokumen Kurikulum (Documents)
// ----------------------------------------------------

var DOC_HEADERS = [
  'id', 'title', 'type', 'phase', 'subject', 'authorTeacher', 
  'uploadDate', 'status', 'fileSize', 'version', 'learningObjectives', 'description', 'reviewerNotes'
];

function getAllDocuments() {
  return readSheetData(SHEETS.DOCUMENTS, function(row) {
    var lo = [];
    if (row[10]) {
      try {
        lo = JSON.parse(row[10]);
      } catch (e) {
        lo = String(row[10]).split('\n').filter(Boolean);
      }
    }
    return {
      id: String(row[0]),
      title: String(row[1] || ''),
      type: row[2] || 'Modul Ajar',
      phase: row[3] || 'Semua Tingkat',
      subject: String(row[4] || ''),
      authorTeacher: String(row[5] || ''),
      uploadDate: formatDateVal(row[6]),
      status: row[7] || 'pending',
      fileSize: String(row[8] || '1.0 MB'),
      version: String(row[9] || 'v1.0'),
      learningObjectives: lo,
      description: String(row[11] || ''),
      reviewerNotes: String(row[12] || '')
    };
  });
}

function saveDocument(d) {
  if (!d.id) d.id = 'doc-' + new Date().getTime();
  var sheet = getOrCreateSheet(SHEETS.DOCUMENTS, DOC_HEADERS);
  var rowData = [
    d.id,
    d.title || '',
    d.type || 'Modul Ajar',
    d.phase || 'Semua Tingkat',
    d.subject || '',
    d.authorTeacher || '',
    d.uploadDate || new Date().toISOString().split('T')[0],
    d.status || 'pending',
    d.fileSize || '1.5 MB',
    d.version || 'v1.0',
    JSON.stringify(d.learningObjectives || []),
    d.description || '',
    d.reviewerNotes || ''
  ];

  var rowIdx = findRowById(sheet, d.id);
  if (rowIdx > 0) {
    sheet.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return d;
}

function deleteDocument(id) {
  var sheet = getOrCreateSheet(SHEETS.DOCUMENTS, DOC_HEADERS);
  var rowIdx = findRowById(sheet, id);
  if (rowIdx > 0) {
    sheet.deleteRow(rowIdx);
    return true;
  }
  return false;
}

function updateDocStatus(id, newStatus) {
  var sheet = getOrCreateSheet(SHEETS.DOCUMENTS, DOC_HEADERS);
  var rowIdx = findRowById(sheet, id);
  if (rowIdx > 0) {
    sheet.getRange(rowIdx, 8).setValue(newStatus);
    return true;
  }
  return false;
}

// ----------------------------------------------------
// Modul: Program Kerja (Programs)
// ----------------------------------------------------

var PROGRAM_HEADERS = [
  'id', 'code', 'title', 'category', 'pic', 'targetPeriod', 
  'academicYear', 'budgetEstimated', 'budgetRealized', 'status', 'progress', 
  'milestones', 'description', 'indicators', 'notes', 'evaluation', 'reportLink'
];

function getAllPrograms() {
  return readSheetData(SHEETS.PROGRAMS, function(row) {
    var milestones = [];
    if (row[11]) {
      try {
        milestones = JSON.parse(row[11]);
      } catch (e) {
        milestones = [];
      }
    }
    return {
      id: String(row[0]),
      code: String(row[1] || ''),
      title: String(row[2] || ''),
      category: row[3] || 'Kurikulum & KOSP',
      pic: String(row[4] || ''),
      targetPeriod: String(row[5] || ''),
      academicYear: String(row[6] || '2024/2025'),
      budgetEstimated: Number(row[7]) || 0,
      budgetRealized: Number(row[8]) || 0,
      status: row[9] || 'not_started',
      progress: Number(row[10]) || 0,
      milestones: milestones,
      description: String(row[12] || ''),
      indicators: String(row[13] || ''),
      notes: String(row[14] || ''),
      evaluation: String(row[15] || ''),
      reportLink: String(row[16] || '')
    };
  });
}

function saveProgram(p) {
  if (!p.id) p.id = 'prg-' + new Date().getTime();
  var sheet = getOrCreateSheet(SHEETS.PROGRAMS, PROGRAM_HEADERS);
  var rowData = [
    p.id,
    p.code || '',
    p.title || '',
    p.category || 'Kurikulum & KOSP',
    p.pic || '',
    p.targetPeriod || '',
    p.academicYear || '2024/2025',
    p.budgetEstimated || 0,
    p.budgetRealized || 0,
    p.status || 'not_started',
    p.progress || 0,
    JSON.stringify(p.milestones || []),
    p.description || '',
    p.indicators || '',
    p.notes || '',
    p.evaluation || '',
    p.reportLink || ''
  ];

  var rowIdx = findRowById(sheet, p.id);
  if (rowIdx > 0) {
    sheet.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return p;
}

function deleteProgram(id) {
  var sheet = getOrCreateSheet(SHEETS.PROGRAMS, PROGRAM_HEADERS);
  var rowIdx = findRowById(sheet, id);
  if (rowIdx > 0) {
    sheet.deleteRow(rowIdx);
    return true;
  }
  return false;
}

function toggleMilestone(programId, milestoneId) {
  var progs = getAllPrograms();
  var target = null;
  for (var i = 0; i < progs.length; i++) {
    if (progs[i].id === programId) {
      target = progs[i];
      break;
    }
  }
  if (!target) return null;

  var updatedMilestones = (target.milestones || []).map(function(m) {
    if (m.id === milestoneId) {
      return { id: m.id, title: m.title, dueDate: m.dueDate, completed: !m.completed };
    }
    return m;
  });

  var completedCount = updatedMilestones.filter(function(m) { return m.completed; }).length;
  var progress = updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;
  var status = progress === 100 ? 'completed' : (progress > 0 ? 'in_progress' : 'not_started');

  target.milestones = updatedMilestones;
  target.progress = progress;
  target.status = status;

  return saveProgram(target);
}

// ----------------------------------------------------
// Modul: Supervisi Klinis (Supervisions)
// ----------------------------------------------------

var SUPERVISION_HEADERS = [
  'id', 'teacherName', 'teacherNip', 'subject', 'gradeClass', 'supervisorName',
  'date', 'time', 'scores', 'overallScore', 'predicate',
  'strengths', 'weaknesses', 'recommendations', 'followUp'
];

function getAllSupervisions() {
  return readSheetData(SHEETS.SUPERVISIONS, function(row) {
    var scores = { administration: 90, planning: 88, execution: 86, assessment: 85, quantumLearning: 88 };
    if (row[8]) {
      try {
        scores = JSON.parse(row[8]);
      } catch (e) {}
    }

    var followUp = {
      actionTitle: '',
      method: 'Coaching 1-on-1',
      targetDate: '',
      mentor: '',
      status: 'Sedang Berjalan',
      notes: ''
    };
    if (row[14]) {
      try {
        followUp = JSON.parse(row[14]);
      } catch (e) {}
    }

    return {
      id: String(row[0]),
      teacherName: String(row[1] || ''),
      teacherNip: String(row[2] || ''),
      subject: String(row[3] || ''),
      gradeClass: String(row[4] || ''),
      supervisorName: String(row[5] || ''),
      date: formatDateVal(row[6]),
      time: String(row[7] || ''),
      scores: scores,
      overallScore: Number(row[9]) || 0,
      predicate: row[10] || 'Baik',
      strengths: String(row[11] || ''),
      weaknesses: String(row[12] || ''),
      recommendations: String(row[13] || ''),
      followUp: followUp
    };
  });
}

function saveSupervision(s) {
  if (!s.id) s.id = 'sup-' + new Date().getTime();
  var sheet = getOrCreateSheet(SHEETS.SUPERVISIONS, SUPERVISION_HEADERS);
  var rowData = [
    s.id,
    s.teacherName || '',
    s.teacherNip || '',
    s.subject || '',
    s.gradeClass || '',
    s.supervisorName || '',
    s.date || new Date().toISOString().split('T')[0],
    s.time || '',
    JSON.stringify(s.scores || {}),
    s.overallScore || 0,
    s.predicate || 'Baik',
    s.strengths || '',
    s.weaknesses || '',
    s.recommendations || '',
    JSON.stringify(s.followUp || {})
  ];

  var rowIdx = findRowById(sheet, s.id);
  if (rowIdx > 0) {
    sheet.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return s;
}

function deleteSupervision(id) {
  var sheet = getOrCreateSheet(SHEETS.SUPERVISIONS, SUPERVISION_HEADERS);
  var rowIdx = findRowById(sheet, id);
  if (rowIdx > 0) {
    sheet.deleteRow(rowIdx);
    return true;
  }
  return false;
}

function toggleSupervisionRtl(id) {
  var records = getAllSupervisions();
  var target = null;
  for (var i = 0; i < records.length; i++) {
    if (records[i].id === id) {
      target = records[i];
      break;
    }
  }
  if (!target) return null;

  var currentStatus = target.followUp ? target.followUp.status : 'Sedang Berjalan';
  target.followUp.status = (currentStatus === 'Selesai & Diverifikasi') ? 'Sedang Berjalan' : 'Selesai & Diverifikasi';
  return saveSupervision(target);
}

// ----------------------------------------------------
// Modul: Kalender & Agenda (Events)
// ----------------------------------------------------

var EVENT_HEADERS = [
  'id', 'title', 'date', 'time', 'endTime', 'category', 'priority', 
  'location', 'pic', 'description', 'completed', 'reminderMinutesBefore', 'notified'
];

function getAllEvents() {
  return readSheetData(SHEETS.EVENTS, function(row) {
    return {
      id: String(row[0]),
      title: String(row[1] || ''),
      date: formatDateVal(row[2]),
      time: String(row[3] || '08:00'),
      endTime: String(row[4] || ''),
      category: row[5] || 'kegiatan',
      priority: row[6] || 'Sedang',
      location: String(row[7] || ''),
      pic: String(row[8] || ''),
      description: String(row[9] || ''),
      completed: row[10] === true || String(row[10]).toLowerCase() === 'true',
      reminderMinutesBefore: Number(row[11]) || 30,
      notified: row[12] === true || String(row[12]).toLowerCase() === 'true'
    };
  });
}

function saveEvent(e) {
  if (!e.id) e.id = 'evt-' + new Date().getTime();
  var sheet = getOrCreateSheet(SHEETS.EVENTS, EVENT_HEADERS);
  var rowData = [
    e.id,
    e.title || '',
    e.date || new Date().toISOString().split('T')[0],
    e.time || '08:00',
    e.endTime || '',
    e.category || 'kegiatan',
    e.priority || 'Sedang',
    e.location || '',
    e.pic || '',
    e.description || '',
    e.completed === true,
    e.reminderMinutesBefore || 30,
    e.notified === true
  ];

  var rowIdx = findRowById(sheet, e.id);
  if (rowIdx > 0) {
    sheet.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return e;
}

function deleteEvent(id) {
  var sheet = getOrCreateSheet(SHEETS.EVENTS, EVENT_HEADERS);
  var rowIdx = findRowById(sheet, id);
  if (rowIdx > 0) {
    sheet.deleteRow(rowIdx);
    return true;
  }
  return false;
}

function toggleEventComplete(id) {
  var sheet = getOrCreateSheet(SHEETS.EVENTS, EVENT_HEADERS);
  var rowIdx = findRowById(sheet, id);
  if (rowIdx > 0) {
    var currentVal = sheet.getRange(rowIdx, 11).getValue();
    var newVal = !(currentVal === true || String(currentVal).toLowerCase() === 'true');
    sheet.getRange(rowIdx, 11).setValue(newVal);
    return newVal;
  }
  return false;
}

// ----------------------------------------------------
// Modul: Rapat & Notulensi (Meetings)
// ----------------------------------------------------

var MEETING_HEADERS = [
  'id', 'documentNumber', 'title', 'type', 'date', 'time', 'location', 
  'leader', 'noteTaker', 'attendeesCount', 'attendeesList', 'agenda', 
  'discussionNotes', 'decisions', 'status', 'academicYear'
];

function getAllMeetings() {
  return readSheetData(SHEETS.MEETINGS, function(row) {
    return {
      id: String(row[0]),
      documentNumber: String(row[1] || ''),
      title: String(row[2] || ''),
      type: row[3] || 'Rapat Kurikulum',
      date: formatDateVal(row[4]),
      time: String(row[5] || ''),
      location: String(row[6] || ''),
      leader: String(row[7] || ''),
      noteTaker: String(row[8] || ''),
      attendeesCount: Number(row[9]) || 0,
      attendeesList: String(row[10] || ''),
      agenda: String(row[11] || ''),
      discussionNotes: String(row[12] || ''),
      decisions: String(row[13] || ''),
      status: row[14] || 'Dijadwalkan',
      academicYear: String(row[15] || '2024/2025')
    };
  });
}

function saveMeeting(m) {
  if (!m.id) m.id = 'meet-' + new Date().getTime();
  var sheet = getOrCreateSheet(SHEETS.MEETINGS, MEETING_HEADERS);
  var rowData = [
    m.id,
    m.documentNumber || '',
    m.title || '',
    m.type || 'Rapat Kurikulum',
    m.date || new Date().toISOString().split('T')[0],
    m.time || '',
    m.location || '',
    m.leader || '',
    m.noteTaker || '',
    m.attendeesCount || 0,
    m.attendeesList || '',
    m.agenda || '',
    m.discussionNotes || '',
    m.decisions || '',
    m.status || 'Dijadwalkan',
    m.academicYear || '2024/2025'
  ];

  var rowIdx = findRowById(sheet, m.id);
  if (rowIdx > 0) {
    sheet.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return m;
}

function deleteMeeting(id) {
  var sheet = getOrCreateSheet(SHEETS.MEETINGS, MEETING_HEADERS);
  var rowIdx = findRowById(sheet, id);
  if (rowIdx > 0) {
    sheet.deleteRow(rowIdx);
    return true;
  }
  return false;
}

// ----------------------------------------------------
// Modul: Disposisi Surat (Dispositions)
// ----------------------------------------------------

var DISPOSITION_HEADERS = [
  'id', 'agendaNumber', 'source', 'letterNumber', 'letterDate', 'receivedDate', 
  'subject', 'priority', 'disposedBy', 'targetAudience', 'instruction', 
  'directorNotes', 'deadline', 'status'
];

function getAllDispositions() {
  return readSheetData(SHEETS.DISPOSITIONS, function(row) {
    var targets = [];
    if (row[9]) {
      try { targets = JSON.parse(row[9]); } catch (e) { targets = String(row[9]).split(',').map(function(s){return s.trim();}); }
    }
    var instructions = [];
    if (row[10]) {
      try { instructions = JSON.parse(row[10]); } catch (e) { instructions = String(row[10]).split(',').map(function(s){return s.trim();}); }
    }

    return {
      id: String(row[0]),
      agendaNumber: String(row[1] || ''),
      source: String(row[2] || ''),
      letterNumber: String(row[3] || ''),
      letterDate: formatDateVal(row[4]),
      receivedDate: formatDateVal(row[5]),
      subject: String(row[6] || ''),
      priority: row[7] || 'Biasa',
      disposedBy: String(row[8] || ''),
      targetAudience: targets,
      instruction: instructions,
      directorNotes: String(row[11] || ''),
      deadline: formatDateVal(row[12]),
      status: row[13] || 'Belum Diproses'
    };
  });
}

function saveDisposition(d) {
  if (!d.id) d.id = 'disp-' + new Date().getTime();
  var sheet = getOrCreateSheet(SHEETS.DISPOSITIONS, DISPOSITION_HEADERS);
  var rowData = [
    d.id,
    d.agendaNumber || '',
    d.source || '',
    d.letterNumber || '',
    d.letterDate || '',
    d.receivedDate || '',
    d.subject || '',
    d.priority || 'Biasa',
    d.disposedBy || '',
    JSON.stringify(d.targetAudience || []),
    JSON.stringify(d.instruction || []),
    d.directorNotes || '',
    d.deadline || '',
    d.status || 'Belum Diproses'
  ];

  var rowIdx = findRowById(sheet, d.id);
  if (rowIdx > 0) {
    sheet.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return d;
}

function deleteDisposition(id) {
  var sheet = getOrCreateSheet(SHEETS.DISPOSITIONS, DISPOSITION_HEADERS);
  var rowIdx = findRowById(sheet, id);
  if (rowIdx > 0) {
    sheet.deleteRow(rowIdx);
    return true;
  }
  return false;
}

// ----------------------------------------------------
// Modul: RTL Rapat & Disposisi (Meeting RTLs)
// ----------------------------------------------------

var RTL_HEADERS = [
  'id', 'actionTitle', 'sourceType', 'sourceReference', 'pic', 'targetDate', 
  'resourcesNeeded', 'indicators', 'progress', 'status', 'evidenceLink', 'notes'
];

function getAllMeetingRtls() {
  return readSheetData(SHEETS.MEETING_RTLS, function(row) {
    return {
      id: String(row[0]),
      actionTitle: String(row[1] || ''),
      sourceType: row[2] || 'Hasil Rapat',
      sourceReference: String(row[3] || ''),
      pic: String(row[4] || ''),
      targetDate: formatDateVal(row[5]),
      resourcesNeeded: String(row[6] || ''),
      indicators: String(row[7] || ''),
      progress: Number(row[8]) || 0,
      status: row[9] || 'Belum Mulai',
      evidenceLink: String(row[10] || ''),
      notes: String(row[11] || '')
    };
  });
}

function saveMeetingRtl(r) {
  if (!r.id) r.id = 'rtl-' + new Date().getTime();
  var sheet = getOrCreateSheet(SHEETS.MEETING_RTLS, RTL_HEADERS);
  var rowData = [
    r.id,
    r.actionTitle || '',
    r.sourceType || 'Hasil Rapat',
    r.sourceReference || '',
    r.pic || '',
    r.targetDate || '',
    r.resourcesNeeded || '',
    r.indicators || '',
    r.progress || 0,
    r.status || 'Belum Mulai',
    r.evidenceLink || '',
    r.notes || ''
  ];

  var rowIdx = findRowById(sheet, r.id);
  if (rowIdx > 0) {
    sheet.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return r;
}

function deleteMeetingRtl(id) {
  var sheet = getOrCreateSheet(SHEETS.MEETING_RTLS, RTL_HEADERS);
  var rowIdx = findRowById(sheet, id);
  if (rowIdx > 0) {
    sheet.deleteRow(rowIdx);
    return true;
  }
  return false;
}

// ----------------------------------------------------
// Sinkronisasi Massal (Bulk Sync All Data)
// ----------------------------------------------------

function syncAllData(data) {
  if (!data) return { success: false, error: 'Data sinkronisasi kosong' };

  if (data.teachers && Array.isArray(data.teachers)) {
    for (var i = 0; i < data.teachers.length; i++) saveTeacher(data.teachers[i]);
  }
  if (data.documents && Array.isArray(data.documents)) {
    for (var j = 0; j < data.documents.length; j++) saveDocument(data.documents[j]);
  }
  if (data.programs && Array.isArray(data.programs)) {
    for (var k = 0; k < data.programs.length; k++) saveProgram(data.programs[k]);
  }
  if (data.supervisions && Array.isArray(data.supervisions)) {
    for (var l = 0; l < data.supervisions.length; l++) saveSupervision(data.supervisions[l]);
  }
  if (data.events && Array.isArray(data.events)) {
    for (var m = 0; m < data.events.length; m++) saveEvent(data.events[m]);
  }
  if (data.meetings && Array.isArray(data.meetings)) {
    for (var n = 0; n < data.meetings.length; n++) saveMeeting(data.meetings[n]);
  }
  if (data.dispositions && Array.isArray(data.dispositions)) {
    for (var o = 0; o < data.dispositions.length; o++) saveDisposition(data.dispositions[o]);
  }
  if (data.meetingRtls && Array.isArray(data.meetingRtls)) {
    for (var p = 0; p < data.meetingRtls.length; p++) saveMeetingRtl(data.meetingRtls[p]);
  }

  return { success: true, message: 'Semua data berhasil disinkronkan ke Spreadsheet Google Drive.' };
}

// =========================================================================================
// ASISTEN AI GEMINI (UrlFetchApp Proxy)
// =========================================================================================

function generateAiResponse(prompt, mode, context) {
  var scriptProps = PropertiesService.getScriptProperties();
  var apiKey = scriptProps.getProperty('GEMINI_API_KEY') || GEMINI_API_KEY_FALLBACK;

  if (!apiKey || apiKey.trim() === '') {
    return {
      success: true,
      text: '### Rekomendasi Kurikulum (Mode Offline/Praktik)\n\n' +
        'Permintaan Anda: **"' + prompt + '"**\n\n' +
        '*Catatan: Kunci GEMINI_API_KEY belum dikonfigurasikan di Script Properties Google Apps Script. ' +
        'Berikut draf panduan standar Kurikulum SMA Plus PGRI Cibinong:*\n\n' +
        '1. **Kesesuaian Capaian Pembelajaran (CP)**: Pastikan tujuan pembelajaran selaras dengan Keputusan BSKAP No. 032/H/KR/2024.\n' +
        '2. **Prinsip Diferensiasi**: Rancang konten, proses, dan produk yang memfasilitasi keberagaman gaya belajar dan minat siswa.\n' +
        '3. **Integrasi Karakter & Plus PGRI Cibinong**: Sertakan dimensi Profil Pelajar Pancasila (Beriman, Mandiri, Bernalar Kritis, Kreatif, Bergotong Royong, Berkebinekaan Global) serta budaya disiplin dan keunggulan teknologi sekolah.\n' +
        '4. **Asesmen Autentik**: Gunakan asesmen formatif berkelanjutan untuk perbaikan proses belajar.'
    };
  }

  var systemInstruction = 'Anda adalah Asisten Pakar Kurikulum AI resmi untuk SMA Plus PGRI Cibinong (Sekolah Unggulan berkarakter, berbasis teknologi dan Kurikulum Merdeka).\n' +
    'Tugas Anda adalah membantu Wakil Kepala Sekolah Bidang Kurikulum, staf kurikulum, dan dewan guru dalam:\n' +
    '1. Merumuskan Alur Tujuan Pembelajaran (ATP) dan Modul Ajar berdiferensiasi.\n' +
    '2. Menyusun instrumen asesmen diagnostik, formatif, sumatif, kisi-kisi, dan rubrik penilaian berstandar HOTS (Higher Order Thinking Skills).\n' +
    '3. Merancang modul Projek Penguatan Profil Pelajar Pancasila (P5) yang inovatif.\n' +
    '4. Menganalisis hasil supervisi akademik klinis dan memberikan Rencana Tindak Lanjut (RTL) yang solutif serta pembinaan guru.\n' +
    '5. Memberikan masukan perbaikan dokumen kurikulum (KOSP, silabus, program tahunan/semester).\n\n' +
    'Gunakan bahasa Indonesia yang profesional, akademis, terstruktur (gunakan heading Markdown, bullet points, tabel bila relevan), lugas, dan sesuai regulasi Kemendikbudristek & BSKAP terbaru serta ciri khas unggulan SMA Plus PGRI Cibinong.';

  if (mode === 'module_generator') {
    systemInstruction += '\nFokuskan pada pembuatan struktur Modul Ajar lengkap: Identitas (Fase/Kelas, Alokasi Waktu), Capaian Pembelajaran, Tujuan Pembelajaran, Profil Pelajar Pancasila, Sarana & Prasarana, Target Peserta Didik, Model Pembelajaran, Pemahaman Bermakna & Pertanyaan Pemantik, Kegiatan Pembelajaran (Pendahuluan, Inti diferensiasi, Penutup), dan Rencana Asesmen + Lampiran.';
  } else if (mode === 'assessment_rubric') {
    systemInstruction += '\nFokuskan pada pembuatan Kisi-kisi Soal, Indikator Ketercapaian Tujuan Pembelajaran (IKTP), butir stimulus soal (HOTS), kunci jawaban, dan rubrik penilaian berjenjang.';
  } else if (mode === 'supervision_rtl') {
    systemInstruction += '\nFokuskan pada analisis temuan supervisi kelas berdasarkan 5 instrumen supervisi resmi SMA Plus PGRI Cibinong: Administrasi, Perencanaan, Pelaksanaan, Asesmen, dan Quantum Learning (kerangka TANDUR & AMBAK).';
  }

  var fullPrompt = context
    ? 'Konteks/Data Terkait:\n' + (typeof context === 'string' ? context : JSON.stringify(context, null, 2)) + '\n\nInstruksi Pengguna:\n' + prompt
    : prompt;

  var apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey.trim();

  var payload = {
    contents: [{
      role: 'user',
      parts: [{ text: fullPrompt }]
    }],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7
    }
  };

  try {
    var response = UrlFetchApp.fetch(apiUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    var resCode = response.getResponseCode();
    var resText = response.getContentText();

    if (resCode !== 200) {
      return { success: false, error: 'Gemini API Error (' + resCode + '): ' + resText };
    }

    var json = JSON.parse(resText);
    var generatedText = '';
    if (json.candidates && json.candidates.length > 0 && json.candidates[0].content && json.candidates[0].content.parts) {
      generatedText = json.candidates[0].content.parts.map(function(p){ return p.text || ''; }).join('');
    }

    return { success: true, text: generatedText || 'Tidak ada teks yang dihasilkan.' };
  } catch (err) {
    return { success: false, error: 'Gagal memanggil Gemini API: ' + err.toString() };
  }
}

// =========================================================================================
// INISIALISASI & INFORMASI SPREADSHEET
// =========================================================================================

function ensureDatabaseStructure() {
  getOrCreateSheet(SHEETS.TEACHERS, TEACHER_HEADERS);
  getOrCreateSheet(SHEETS.DOCUMENTS, DOC_HEADERS);
  getOrCreateSheet(SHEETS.PROGRAMS, PROGRAM_HEADERS);
  getOrCreateSheet(SHEETS.SUPERVISIONS, SUPERVISION_HEADERS);
  getOrCreateSheet(SHEETS.EVENTS, EVENT_HEADERS);
  getOrCreateSheet(SHEETS.MEETINGS, MEETING_HEADERS);
  getOrCreateSheet(SHEETS.DISPOSITIONS, DISPOSITION_HEADERS);
  getOrCreateSheet(SHEETS.MEETING_RTLS, RTL_HEADERS);
  getOrCreateSheet(SHEETS.SETTINGS, ['Key', 'Value', 'Keterangan']);
}

function initDatabase() {
  ensureDatabaseStructure();
  var ss = getSpreadsheet();

  var colorMap = {};
  colorMap[SHEETS.TEACHERS] = '#2563eb';
  colorMap[SHEETS.DOCUMENTS] = '#059669';
  colorMap[SHEETS.PROGRAMS] = '#d97706';
  colorMap[SHEETS.SUPERVISIONS] = '#7c3aed';
  colorMap[SHEETS.EVENTS] = '#0891b2';
  colorMap[SHEETS.MEETINGS] = '#dc2626';
  colorMap[SHEETS.DISPOSITIONS] = '#4f46e5';
  colorMap[SHEETS.MEETING_RTLS] = '#0d9488';

  for (var key in colorMap) {
    var s = ss.getSheetByName(key);
    if (s) {
      try { s.setTabColor(colorMap[key]); } catch (e) {}
    }
  }

  var settingsSheet = ss.getSheetByName(SHEETS.SETTINGS);
  if (settingsSheet && settingsSheet.getLastRow() <= 1) {
    settingsSheet.appendRow(['NAMA_SEKOLAH', 'SMA Plus PGRI Cibinong', 'Nama Satuan Pendidikan']);
    settingsSheet.appendRow(['APP_NAME', 'SIM Kurikulum Plus PGRI', 'Aplikasi Manajemen Kurikulum']);
    settingsSheet.appendRow(['VERSI', '2.5.0-GAS', 'Versi build aplikasi']);
    settingsSheet.appendRow(['INITIALIZED_AT', new Date().toISOString(), 'Waktu inisialisasi awal']);
  }

  // Masukkan juga seluruh data awal jika baris data masih kosong
  var seedResult = isiDataAplikasiKeSpreadsheet(false);

  return {
    success: true,
    message: 'Database Google Sheets & seluruh data awal berhasil dimasukkan ke Spreadsheet!',
    spreadsheetUrl: ss.getUrl(),
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    seedCounts: seedResult.counts
  };
}

function getSpreadsheetInfo() {
  var ss = getSpreadsheet();
  var sheets = ss.getSheets();
  var sheetSummary = [];

  for (var i = 0; i < sheets.length; i++) {
    sheetSummary.push({
      name: sheets[i].getName(),
      rows: Math.max(0, sheets[i].getLastRow() - 1),
      cols: sheets[i].getLastColumn()
    });
  }

  return {
    id: ss.getId(),
    name: ss.getName(),
    url: ss.getUrl(),
    sheets: sheetSummary,
    serverTime: new Date().toISOString()
  };
}

function formatDateVal(val) {
  if (!val) return '';
  if (val instanceof Date) {
    var yyyy = val.getFullYear();
    var mm = String(val.getMonth() + 1);
    if (mm.length < 2) mm = '0' + mm;
    var dd = String(val.getDate());
    if (dd.length < 2) dd = '0' + dd;
    return yyyy + '-' + mm + '-' + dd;
  }
  return String(val);
}
