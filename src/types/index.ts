export type NavTab = 
  | 'dashboard' 
  | 'teachers'
  | 'documents' 
  | 'programs' 
  | 'supervision' 
  | 'meetings'
  | 'ai-assistant' 
  | 'calendar';

export type TeacherCluster = 
  | 'MIPA'
  | 'Bahasa'
  | 'Sosial Humaniora'
  | 'Informatika & Vokasi'
  | 'Seni & Penjas'
  | 'Lainnya';

export type EmploymentType = 'PNS' | 'GTY / Tetap Yayasan' | 'Guru Honorer' | 'PPPK';

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  subject: string;
  subjectCluster: TeacherCluster;
  employmentStatus: EmploymentType;
  education: 'S1' | 'S2' | 'S3';
  phone?: string;
  email?: string;
  teachingHours: number;
  additionalRole?: string;
  certificationStatus: boolean;
}

export type DocumentType = 
  | 'KOSP'
  | 'ATP'
  | 'Modul Ajar'
  | 'Panduan Asesmen'
  | 'Modul P5'
  | 'Bank Soal'
  | 'SK Pembagian Tugas';

export type GradePhase = 
  | 'Semua Tingkat'
  | 'Fase E (Kelas X)'
  | 'Fase F (Kelas XI)'
  | 'Fase F (Kelas XII)';

export type DocStatus = 'verified' | 'revision' | 'pending';

export interface DocumentItem {
  id: string;
  title: string;
  type: DocumentType;
  phase: GradePhase;
  subject: string;
  authorTeacher: string;
  uploadDate: string;
  status: DocStatus;
  fileSize: string;
  version: string;
  learningObjectives?: string[];
  description: string;
  reviewerNotes?: string;
}

export type ProgramCategory = 
  | 'Kurikulum & KOSP'
  | 'Pengembangan Guru & IHT'
  | 'Asesmen & Ujian'
  | 'P5 & Pembinaan Karakter'
  | 'Kelas Unggulan & Riset';

export type ProgramStatus = 'not_started' | 'in_progress' | 'evaluation' | 'completed';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

export interface WorkProgram {
  id: string;
  code: string;
  title: string;
  category: ProgramCategory;
  pic: string;
  targetPeriod: string;
  academicYear?: string; // Tahun ajaran diisikan manual (misal: 2024/2025 atau 2026/2027)
  budgetEstimated: number;
  budgetRealized: number;
  status: ProgramStatus;
  progress: number;
  milestones: Milestone[];
  description: string;
  indicators: string;
  notes?: string;
  evaluation?: string; // Isian/item evaluasi & catatan keterlaksanaan program
  reportLink?: string; // Tautan copy link Google Drive untuk pelaporan & bukti pelaksanaan program
}

export type SupervisionPredicate = 'Amat Baik' | 'Baik' | 'Cukup' | 'Perlu Bimbingan';

export interface SupervisionAspectScores {
  administration: number;   // 1) Administrasi (Jurnal, Kalender Akademik, Prota/Prosem, Presensi & Buku Nilai)
  planning: number;         // 2) Perencanaan (ATP, Modul Ajar, Asesmen Diagnostik, Diferensiasi)
  execution: number;        // 3) Pelaksanaan (Apersepsi, Interaksi, Manajemen Kelas, Integrasi TPACK)
  assessment: number;       // 4) Asesmen (Formatif Berkelanjutan, Rubrik Kriteria, Umpan Balik)
  quantumLearning: number;  // 5) Quantum Learning (Kerangka TANDUR: Tumbuhkan, Alami, Namai, Demonstrasikan, Ulangi, Rayakan & AMBAK)
}

export interface FollowUpPlan {
  actionTitle: string;
  method: 'Coaching 1-on-1' | 'Peer Teaching' | 'Workshop Asesmen' | 'Pendampingan TPACK' | 'Mandiri PMM';
  targetDate: string;
  mentor: string;
  status: 'Belum Mulai' | 'Sedang Berjalan' | 'Selesai & Diverifikasi';
  notes?: string;
}

export interface SupervisionRecord {
  id: string;
  teacherName: string;
  teacherNip: string;
  subject: string;
  gradeClass: string;
  supervisorName: string;
  date: string;
  time: string;
  scores: SupervisionAspectScores;
  overallScore: number;
  predicate: SupervisionPredicate;
  strengths: string;
  weaknesses: string;
  recommendations: string;
  followUp: FollowUpPlan;
}

export type EventCategory = 'rapat' | 'deadline' | 'supervisi' | 'asesmen' | 'kegiatan';
export type PriorityLevel = 'Tinggi' | 'Sedang' | 'Rendah';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  endTime?: string;
  category: EventCategory;
  priority: PriorityLevel;
  location: string;
  pic: string;
  description: string;
  completed: boolean;
  reminderMinutesBefore: number; // e.g. 15, 60, 1440
  notified: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
}

// ----------------------------------------------------
// Modul Rapat, Notulen, Disposisi & RTL
// ----------------------------------------------------

export type MeetingType = 
  | 'Rapat Dewan Guru' 
  | 'Rapat Kurikulum' 
  | 'Rapat Koordinasi Pimpinan' 
  | 'Rapat Pleno KOSP' 
  | 'Rapat Orang Tua / Komite' 
  | 'Rapat MGMP';

export interface MeetingRecord {
  id: string;
  documentNumber: string; // Nomor Berita Acara / Surat Undangan
  title: string; // Agenda Pokok / Topik Rapat
  type: MeetingType;
  date: string; // YYYY-MM-DD
  time: string; // Misal: 08:30 - 11:30 WIB
  location: string;
  leader: string; // Pimpinan Rapat (misal: Kepala Sekolah / Waka Kurikulum)
  noteTaker: string; // Notulis Rapat
  attendeesCount: number;
  attendeesList: string; // Daftar nama atau unsur yang hadir
  agenda: string; // Susunan Acara / Agenda Rapat
  discussionNotes: string; // Notulensi Pembahasan Jalannya Rapat
  decisions: string; // Keputusan & Kesepakatan Rapat
  status: 'Terlaksana' | 'Dijadwalkan' | 'Dalam Proses';
  academicYear?: string;
}

export type DispositionPriority = 'Sangat Segera' | 'Segera' | 'Biasa' | 'Rahasia';

export interface DispositionRecord {
  id: string;
  agendaNumber: string; // No. Agenda / Surat Masuk
  source: string; // Asal Surat / Dari Pengirim
  letterNumber: string; // Nomor Surat Dinas / Dokumen
  letterDate: string; // Tanggal Surat
  receivedDate: string; // Tanggal Diterima
  subject: string; // Perihal / Ringkasan Isi Dokumen
  priority: DispositionPriority;
  disposedBy: string; // Pejabat Pemberi Disposisi (Kepala Sekolah)
  targetAudience: string[]; // Diteruskan Kepada (misal: Waka Kurikulum, Bendahara, Wali Kelas)
  instruction: string[]; // Checklist Arahan (Tindak Lanjuti, Pelajari, Hadiri, dll)
  directorNotes: string; // Catatan / Arahan Khusus Pimpinan
  deadline: string; // Batas Waktu Penyelesaian
  status: 'Belum Diproses' | 'Sedang Ditindaklanjuti' | 'Tuntas';
}

export interface MeetingFollowUpRecord {
  id: string;
  actionTitle: string; // Uraian Rencana Tindak Lanjut (RTL)
  sourceType: 'Hasil Rapat' | 'Instruksi Disposisi' | 'Evaluasi Program';
  sourceReference: string; // Misal: Rapat Dewan Guru 16 Okt / Disposisi No. 042
  pic: string; // Penanggung Jawab
  targetDate: string; // Batas Waktu
  resourcesNeeded: string; // Kebutuhan Sumber Daya / Fasilitas
  indicators: string; // Tolok Ukur Keberhasilan
  progress: number; // 0 - 100%
  status: 'Belum Mulai' | 'Sedang Berjalan' | 'Tuntas & Terverifikasi';
  evidenceLink?: string; // Tautan Google Drive Bukti LPJ / Hasil
  notes?: string; // Catatan Verifikasi Pemantauan
}

