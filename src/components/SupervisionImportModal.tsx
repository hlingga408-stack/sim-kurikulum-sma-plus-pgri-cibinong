import { useState } from 'react';
import { SupervisionRecord, SupervisionPredicate, FollowUpPlan, Teacher } from '../types';
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Trash2,
  Table,
  FileText,
  GraduationCap
} from 'lucide-react';
import { broadcastToast } from '../services/notificationService';
import {
  downloadNativeExcel,
  downloadSemicolonCsv,
  parseDelimitedText
} from '../utils/excelHelper';

interface SupervisionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (records: SupervisionRecord[]) => void;
  teachers?: Teacher[];
}

interface EditableSupervisionRow {
  id: string;
  teacherName: string;
  teacherNip: string;
  subject: string;
  gradeClass: string;
  date: string;
  time: string;
  supervisorName: string;
  scoreAdmin: number;
  scorePlanning: number;
  scoreExecution: number;
  scoreAssessment: number;
  scoreQuantum: number;
  strengths: string;
  weaknesses: string;
  rtlAction: string;
  rtlMethod: FollowUpPlan['method'];
  rtlTargetDate: string;
}

const DEFAULT_SAMPLE_SUPERVISIONS: EditableSupervisionRow[] = [
  {
    id: 'sup-smp-1',
    teacherName: 'Ahmad Fauzi, S.Pd., M.Hum.',
    teacherNip: '198704202012011005',
    subject: 'Bahasa Inggris',
    gradeClass: 'XII MIPA Plus 1',
    date: '2026-10-12',
    time: '08:00 - 09:30',
    supervisorName: "Dr. Hj. Nina Nur'aeni, M.Pd.",
    scoreAdmin: 94,
    scorePlanning: 92,
    scoreExecution: 90,
    scoreAssessment: 88,
    scoreQuantum: 95,
    strengths: 'Penguasaan bahasa sangat fasih, atmosfer Quantum Learning TANDUR hidup dan interaktif.',
    weaknesses: 'Refleksi akhir dan umpan balik individual bagi siswa introver perlu diperkuat.',
    rtlAction: 'Optimalisasi Formatif Peer Review & Rubrik Writing Berdiferensiasi',
    rtlMethod: 'Peer Teaching',
    rtlTargetDate: '2026-11-05',
  },
  {
    id: 'sup-smp-2',
    teacherName: 'Dra. Endang Sulistyowati',
    teacherNip: '196908121994122001',
    subject: 'Fisika',
    gradeClass: 'XI MIPA Plus 1',
    date: '2026-10-14',
    time: '09:45 - 11:15',
    supervisorName: 'Bambang Irawan, S.Pd.',
    scoreAdmin: 92,
    scorePlanning: 90,
    scoreExecution: 91,
    scoreAssessment: 86,
    scoreQuantum: 88,
    strengths: 'Eksperimen pegas dan hukum Hooke tertib, pemanfaatan laboratorium sangat baik.',
    weaknesses: 'Penataan atmosfer Quantum Learning AMBAK di awal pembelajaran dapat ditingkatkan.',
    rtlAction: 'Desain Pembelajaran Aktif Berbasis TANDUR Fisika & Scaffolding Konsep',
    rtlMethod: 'Coaching 1-on-1',
    rtlTargetDate: '2026-11-10',
  },
  {
    id: 'sup-smp-3',
    teacherName: 'Maya Lestari, S.Pd., M.Si.',
    teacherNip: '199209302020022019',
    subject: 'Kimia',
    gradeClass: 'XI MIPA Plus 2',
    date: '2026-10-15',
    time: '10:00 - 11:30',
    supervisorName: "Dr. Hj. Nina Nur'aeni, M.Pd.",
    scoreAdmin: 89,
    scorePlanning: 88,
    scoreExecution: 89,
    scoreAssessment: 87,
    scoreQuantum: 89,
    strengths: 'Pemanfaatan model molekul 3D menarik perhatian siswa dan suasana kondusif.',
    weaknesses: 'Asesmen diagnostik non-kognitif belum terdokumentasi terpisah dalam administrasi.',
    rtlAction: 'Bimbingan Asesmen Awal & Diferensiasi Konten Larutan Elektrolit',
    rtlMethod: 'Workshop Asesmen',
    rtlTargetDate: '2026-11-12',
  },
  {
    id: 'sup-smp-4',
    teacherName: 'Hendra Gunawan, S.Pd.',
    teacherNip: '199002142017011009',
    subject: 'PJOK',
    gradeClass: 'X-2 (Fase E)',
    date: '2026-10-16',
    time: '07:30 - 09:00',
    supervisorName: 'Bambang Irawan, S.Pd.',
    scoreAdmin: 88,
    scorePlanning: 86,
    scoreExecution: 93,
    scoreAssessment: 85,
    scoreQuantum: 94,
    strengths: 'Sangat komunikatif dan energik, perayaan keberhasilan gerak kelompok sangat meriah.',
    weaknesses: 'Rubrik penilaian kebugaran jasmani perlu diperinci per indikator performa.',
    rtlAction: 'Penyusunan Rubrik Asesmen Psikomotorik Berjenjang & Portofolio Fisik',
    rtlMethod: 'Peer Teaching',
    rtlTargetDate: '2026-11-15',
  },
  {
    id: 'sup-smp-5',
    teacherName: 'Siti Sarah, S.Pd.',
    teacherNip: '199307252021032014',
    subject: 'Sosiologi',
    gradeClass: 'XI IPS Plus 2',
    date: '2026-10-16',
    time: '13:00 - 14:30',
    supervisorName: "Dr. Hj. Nina Nur'aeni, M.Pd.",
    scoreAdmin: 91,
    scorePlanning: 90,
    scoreExecution: 88,
    scoreAssessment: 85,
    scoreQuantum: 90,
    strengths: 'Diskusi kelompok mengenai perubahan sosial kritis dan memicu nalar siswa.',
    weaknesses: 'Manajemen waktu sesi tanya jawab kelompok sedikit melebihi alokasi waktu.',
    rtlAction: 'Workshop Manajemen Diskusi Socratic & Manajemen Waktu Kelas Aktif',
    rtlMethod: 'Workshop Asesmen',
    rtlTargetDate: '2026-11-18',
  },
];

export function SupervisionImportModal({
  isOpen,
  onClose,
  onImport,
  teachers = [],
}: SupervisionImportModalProps) {
  const [activeTab, setActiveTab] = useState<'grid' | 'raw'>('grid');
  const [rows, setRows] = useState<EditableSupervisionRow[]>(DEFAULT_SAMPLE_SUPERVISIONS);
  const [rawCsvText, setRawCsvText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate row average and predicate live
  const calculateRowStats = (row: EditableSupervisionRow) => {
    const sum =
      (Number(row.scoreAdmin) || 0) +
      (Number(row.scorePlanning) || 0) +
      (Number(row.scoreExecution) || 0) +
      (Number(row.scoreAssessment) || 0) +
      (Number(row.scoreQuantum) || 0);
    const avg = Math.round((sum / 5) * 10) / 10;
    let predicate: SupervisionPredicate = 'Cukup';
    if (avg >= 91) predicate = 'Amat Baik';
    else if (avg >= 81) predicate = 'Baik';
    else if (avg >= 71) predicate = 'Cukup';
    else predicate = 'Perlu Bimbingan';
    return { avg, predicate };
  };

  const handleUpdateCell = (index: number, field: keyof EditableSupervisionRow, value: unknown) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSelectTeacherPreset = (index: number, teacherName: string) => {
    const found = teachers.find((t) => t.name.toLowerCase() === teacherName.toLowerCase());
    setRows((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        teacherName,
        teacherNip: found ? found.nip : next[index].teacherNip,
        subject: found ? found.subject : next[index].subject,
      };
      return next;
    });
  };

  const handleAddRow = () => {
    const newRow: EditableSupervisionRow = {
      id: `sup-row-${Date.now()}`,
      teacherName: '',
      teacherNip: '198' + Math.floor(Math.random() * 8999999999999 + 1000000000000),
      subject: '',
      gradeClass: 'XI MIPA Plus 1',
      date: new Date().toISOString().split('T')[0],
      time: '08:30 - 10:00',
      supervisorName: "Dr. Hj. Nina Nur'aeni, M.Pd.",
      scoreAdmin: 90,
      scorePlanning: 88,
      scoreExecution: 88,
      scoreAssessment: 86,
      scoreQuantum: 88,
      strengths: 'Pembelajaran terencana dan komunikasi aktif.',
      weaknesses: 'Diferensiasi proses dan penguatan AMBAK perlu ditingkatkan.',
      rtlAction: 'Pendampingan Pembelajaran Aktif Berbasis Kerangka TANDUR',
      rtlMethod: 'Coaching 1-on-1',
      rtlTargetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    };
    setRows((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    if (confirm('Hapus seluruh baris data supervisi di tabel impor?')) {
      setRows([]);
      setRawCsvText('');
      setErrorMsg(null);
    }
  };

  const handleLoadSample = () => {
    setRows(DEFAULT_SAMPLE_SUPERVISIONS);
    setErrorMsg(null);
    broadcastToast({
      title: 'Contoh Supervisi Dimuat',
      message: '5 hasil supervisi guru dengan 5 instrumen siap dikelola per kolom.',
      type: 'info',
    });
  };

  const handleParseRawText = (text: string) => {
    setRawCsvText(text);
    setErrorMsg(null);
    if (!text.trim()) return;

    const parsedRows = parseDelimitedText(text);

    if (parsedRows.length < 2) {
      setErrorMsg('Data spreadsheet harus memiliki baris judul kolom (header) dan minimal 1 baris data hasil supervisi.');
      return;
    }

    const dataRows = parsedRows.slice(1);
    const result: EditableSupervisionRow[] = [];

    dataRows.forEach((cols, idx) => {
      if (cols.length >= 3 && cols[0]) {
        result.push({
          id: `sup-imp-${Date.now()}-${idx}`,
          teacherName: cols[0],
          teacherNip: cols[1] || '198' + Math.floor(Math.random() * 8999999999999 + 1000000000000),
          subject: cols[2] || 'Mata Pelajaran',
          gradeClass: cols[3] || 'XI MIPA Plus 1',
          date: cols[4] || new Date().toISOString().split('T')[0],
          time: cols[5] || '08:30 - 10:00',
          supervisorName: cols[6] || "Dr. Hj. Nina Nur'aeni, M.Pd.",
          scoreAdmin: Number(cols[7]) || 90,
          scorePlanning: Number(cols[8]) || 88,
          scoreExecution: Number(cols[9]) || 86,
          scoreAssessment: Number(cols[10]) || 85,
          scoreQuantum: Number(cols[11]) || 88,
          strengths: cols[12] || 'Penyampaian materi lugas dan terstruktur.',
          weaknesses: cols[13] || 'Penguatan refleksi dan umpan balik formatif dapat dioptimalkan.',
          rtlAction: cols[14] || `Optimalisasi Pembelajaran & Quantum Learning: ${cols[2] || 'Mapel'}`,
          rtlMethod: (cols[15] as FollowUpPlan['method']) || 'Coaching 1-on-1',
          rtlTargetDate: cols[16] || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        });
      }
    });

    if (result.length === 0) {
      setErrorMsg('Data spreadsheet tidak terbaca. Pastikan terdapat kolom Nama Guru dan Mata Pelajaran.');
    } else {
      setRows(result);
      setActiveTab('grid');
      broadcastToast({
        title: 'Berhasil Membaca Kolom Supervisi',
        message: `${result.length} data supervisi 5 instrumen berhasil ditempatkan per kolom secara rapi.`,
        type: 'success',
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleParseRawText(text);
    };
    reader.readAsText(file);
  };

  const supervisionHeaders = [
    'Nama Guru Lengkap & Gelar',
    'NIP Guru',
    'Mata Pelajaran',
    'Kelas / Fase',
    'Tanggal Observasi',
    'Waktu Sesi',
    'Nama Supervisor',
    '1. Skor Administrasi (0-100)',
    '2. Skor Perencanaan (0-100)',
    '3. Skor Pelaksanaan (0-100)',
    '4. Skor Asesmen (0-100)',
    '5. Skor Quantum Learning (0-100)',
    'Kekuatan & Kelebihan Pembelajaran',
    'Temuan & Aspek Perbaikan',
    'Judul Program Tindak Lanjut (RTL)',
    'Metode Pendampingan RTL',
    'Target Tanggal Selesai RTL'
  ];

  const sampleSupervisionRows: (string | number)[][] = [
    [
      'Ahmad Fauzi, S.Pd., M.Hum.',
      '198704202012011005',
      'Bahasa Inggris',
      'XII MIPA Plus 1',
      '2026-10-12',
      '08:00 - 09:30',
      "Dr. Hj. Nina Nur'aeni, M.Pd.",
      94,
      92,
      90,
      88,
      95,
      'Penguasaan bahasa sangat fasih dan integrasi audio visual interaktif',
      'Sesi umpan balik individual bagi siswa introver belum menyeluruh',
      'Optimalisasi Formatif Peer Review Writing Rubric',
      'Peer Teaching',
      '2026-11-05'
    ],
    [
      'Dra. Endang Sulistyowati',
      '196908121994122001',
      'Fisika',
      'XI MIPA Plus 1',
      '2026-10-14',
      '09:45 - 11:15',
      'Bambang Irawan, S.Pd.',
      92,
      90,
      91,
      86,
      88,
      'Eksperimen pegas dan hukum Hooke tertib dan analitis',
      'Penerapan penataan atmosfer Quantum Learning AMBAK dapat ditingkatkan',
      'Penyusunan Desain Pembelajaran Aktif Berbasis TANDUR Fisika',
      'Coaching 1-on-1',
      '2026-11-10'
    ],
    [
      'Maya Lestari, S.Pd., M.Si.',
      '199209302020022019',
      'Kimia',
      'XI MIPA Plus 2',
      '2026-10-15',
      '10:00 - 11:30',
      "Dr. Hj. Nina Nur'aeni, M.Pd.",
      89,
      88,
      89,
      87,
      89,
      'Pemanfaatan model molekul 3D menarik perhatian siswa',
      'Asesmen diagnostik non-kognitif belum terdokumentasi terpisah',
      'Bimbingan Asesmen Awal & Diferensiasi Konten Larutan Elektrolit',
      'Workshop Asesmen',
      '2026-11-12'
    ],
    [
      'Hendra Gunawan, S.Pd.',
      '199002142017011009',
      'PJOK',
      'X-2 (Fase E)',
      '2026-10-16',
      '07:30 - 09:00',
      'Bambang Irawan, S.Pd.',
      88,
      86,
      93,
      85,
      94,
      'Sangat komunikatif dan energik dalam memandu teknik bola voli',
      'Rubrik penilaian kebugaran jasmani perlu diperinci per indikator gerak',
      'Penyusunan Rubrik Asesmen Psikomotorik Berjenjang',
      'Peer Teaching',
      '2026-11-15'
    ],
    [
      'Siti Sarah, S.Pd.',
      '199307252021032014',
      'Sosiologi',
      'XI IPS Plus 2',
      '2026-10-16',
      '13:00 - 14:30',
      "Dr. Hj. Nina Nur'aeni, M.Pd.",
      91,
      90,
      88,
      85,
      90,
      'Diskusi kelompok mengenai perubahan sosial kritis dan hidup',
      'Manajemen waktu presentasi kelompok sedikit melebihi alokasi jam',
      'Workshop Manajemen Sesi Diskusi Berbasis Socratic & Quantum Learning',
      'Workshop Asesmen',
      '2026-11-18'
    ]
  ];

  // Download real native Excel (.xls table) - Opens directly with real columns A, B, C, D... in MS Excel
  const handleDownloadExcelTemplate = () => {
    downloadNativeExcel(
      'template_impor_supervisi_5_instrumen_per_kolom.xls',
      supervisionHeaders,
      sampleSupervisionRows,
      'Hasil Supervisi'
    );
    broadcastToast({
      title: 'Template Excel Supervisi Diunduh',
      message: 'File Excel langsung terbuka rapi per kolom (Kolom A s.d. Q) tanpa tanda koma.',
      type: 'success',
    });
  };

  // Download Semicolon CSV (Indonesian Excel friendly with UTF-8 BOM)
  const handleDownloadCsvTemplate = () => {
    downloadSemicolonCsv(
      'template_impor_supervisi_5_instrumen_per_kolom.csv',
      supervisionHeaders,
      sampleSupervisionRows
    );
    broadcastToast({
      title: 'Template CSV Supervisi Diunduh',
      message: 'Format CSV titik-koma siap dibuka rapi per kolom di Excel.',
      type: 'info',
    });
  };

  const handleSaveImport = () => {
    const validRows = rows.filter((r) => r.teacherName.trim() && r.subject.trim());
    if (validRows.length === 0) {
      alert('Mohon isi minimal 1 data hasil supervisi dengan Nama Guru dan Mata Pelajaran yang lengkap.');
      return;
    }

    const recordsToImport: SupervisionRecord[] = validRows.map((r, idx) => {
      const stats = calculateRowStats(r);
      return {
        id: `sup-imp-${Date.now()}-${idx}`,
        teacherName: r.teacherName.trim(),
        teacherNip: r.teacherNip.trim() || '198' + Math.floor(Math.random() * 8999999999999 + 1000000000000),
        subject: r.subject.trim(),
        gradeClass: r.gradeClass.trim() || 'XI MIPA Plus 1',
        supervisorName: r.supervisorName.trim() || "Dr. Hj. Nina Nur'aeni, M.Pd.",
        date: r.date || new Date().toISOString().split('T')[0],
        time: r.time || '08:30 - 10:00',
        scores: {
          administration: Math.min(100, Math.max(0, Number(r.scoreAdmin) || 0)),
          planning: Math.min(100, Math.max(0, Number(r.scorePlanning) || 0)),
          execution: Math.min(100, Math.max(0, Number(r.scoreExecution) || 0)),
          assessment: Math.min(100, Math.max(0, Number(r.scoreAssessment) || 0)),
          quantumLearning: Math.min(100, Math.max(0, Number(r.scoreQuantum) || 0)),
        },
        overallScore: stats.avg,
        predicate: stats.predicate,
        strengths: r.strengths || 'Administrasi tertib dan pembelajaran terstruktur.',
        weaknesses: r.weaknesses || 'Penguatan kerangka TANDUR dan diferensiasi formatif.',
        recommendations: 'Tindak lanjuti dengan pendampingan klinis dan pemanfaatan media edutech sekolah.',
        followUp: {
          actionTitle: r.rtlAction || `Penguatan Pembelajaran & Quantum Learning: ${r.subject}`,
          method: r.rtlMethod || 'Coaching 1-on-1',
          targetDate: r.rtlTargetDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          mentor: r.supervisorName || "Dr. Hj. Nina Nur'aeni, M.Pd.",
          status: 'Sedang Berjalan',
          notes: 'Diimpor secara otomatis melalui menu impor hasil supervisi per kolom.',
        },
      };
    });

    onImport(recordsToImport);
    broadcastToast({
      title: 'Impor Supervisi Berhasil!',
      message: `${recordsToImport.length} hasil supervisi guru dengan 5 instrumen telah disimpan ke sistem.`,
      type: 'success',
    });
    onClose();
  };

  const validCount = rows.filter((r) => r.teacherName.trim() && r.subject.trim()).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Impor Otomatis Hasil Supervisi Guru</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                  Tampilan Kolom Rapi (5 Instrumen)
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Kelola per kolom dengan mudah: 1) Adm, 2) Perencanaan, 3) Pelaksanaan, 4) Asesmen, 5) Quantum Learning, Rerata & Predikat Otomatis, serta Program RTL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Action Toolbar */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'grid'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabel Kolom ({rows.length} Supervisi)</span>
            </button>

            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'raw'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tempel / Unggah CSV</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-purple-600" />
              <span>Pilih File CSV</span>
              <input
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleDownloadExcelTemplate}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Unduh format template Excel (.xls) - langsung terbuka rapi per kolom A s.d. Q di Excel tanpa tanda koma"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-purple-700" />
              <span>Format Excel (.xls Kolom Rapi)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsvTemplate}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Unduh format CSV titik-koma (;) standar Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Format CSV (;)</span>
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Muat Contoh 5 Guru</span>
            </button>

            {activeTab === 'grid' && (
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </button>
            )}

            {rows.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Bersihkan Semua Baris"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/40">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'grid' ? (
            <div className="space-y-3">
              {/* Table Container per column */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto max-h-[480px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 text-center w-10">No</th>
                        <th className="p-2.5 min-w-[190px]">Nama Guru Lengkap *</th>
                        <th className="p-2.5 min-w-[140px]">NIP Guru</th>
                        <th className="p-2.5 min-w-[150px]">Mata Pelajaran *</th>
                        <th className="p-2.5 min-w-[110px]">Kelas</th>
                        <th className="p-2.5 min-w-[130px]">Tanggal</th>
                        <th className="p-2.5 min-w-[160px]">Supervisor</th>
                        <th className="p-2 min-w-[70px] text-center bg-indigo-50/70 text-indigo-900" title="1. Administrasi (Jurnal, Prota, Presensi, Nilai)">
                          1. Adm
                        </th>
                        <th className="p-2 min-w-[70px] text-center bg-purple-50/70 text-purple-900" title="2. Perencanaan (ATP, Modul Ajar, Asesmen Awal)">
                          2. Renc
                        </th>
                        <th className="p-2 min-w-[70px] text-center bg-teal-50/70 text-teal-900" title="3. Pelaksanaan (Interaksi, Diferensiasi, TPACK)">
                          3. Laks
                        </th>
                        <th className="p-2 min-w-[70px] text-center bg-emerald-50/70 text-emerald-900" title="4. Asesmen (Formatif, Rubrik Kriteria, Umpan Balik)">
                          4. Asm
                        </th>
                        <th className="p-2 min-w-[75px] text-center bg-amber-50/80 text-amber-950 font-extrabold" title="5. Quantum Learning (Kerangka TANDUR & AMBAK)">
                          5. QL
                        </th>
                        <th className="p-2.5 min-w-[75px] text-center bg-slate-200/80">Rerata</th>
                        <th className="p-2.5 min-w-[100px] text-center">Predikat</th>
                        <th className="p-2.5 min-w-[190px]">Program RTL</th>
                        <th className="p-2.5 min-w-[140px]">Metode RTL</th>
                        <th className="p-2.5 min-w-[120px]">Target Selesai</th>
                        <th className="p-2.5 text-center w-12">Hapus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={18} className="p-12 text-center text-slate-400">
                            Belum ada baris supervisi. Klik tombol <strong>+ Tambah Baris</strong> atau{' '}
                            <strong>Muat Contoh 5 Guru</strong> di atas.
                          </td>
                        </tr>
                      ) : (
                        rows.map((row, idx) => {
                          const stats = calculateRowStats(row);
                          const isRowValid = row.teacherName.trim() && row.subject.trim();

                          return (
                            <tr
                              key={row.id || idx}
                              className={`transition-colors ${
                                isRowValid ? 'hover:bg-slate-50' : 'bg-rose-50/50 hover:bg-rose-50'
                              }`}
                            >
                              {/* Kolom 1: No */}
                              <td className="p-2 text-center font-mono text-[11px] text-slate-400">
                                {idx + 1}
                              </td>

                              {/* Kolom 2: Nama Guru */}
                              <td className="p-2">
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={row.teacherName}
                                    placeholder="Nama guru & gelar"
                                    onChange={(e) => handleUpdateCell(idx, 'teacherName', e.target.value)}
                                    className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 font-bold text-slate-900 bg-white"
                                  />
                                  {teachers.length > 0 && !row.teacherName && (
                                    <select
                                      onChange={(e) => {
                                        if (e.target.value) handleSelectTeacherPreset(idx, e.target.value);
                                      }}
                                      className="w-full px-2 py-0.5 text-[10px] text-slate-500 border border-slate-200 rounded bg-slate-50"
                                      defaultValue=""
                                    >
                                      <option value="" disabled>
                                        -- Pilih dari Master Guru --
                                      </option>
                                      {teachers.map((t) => (
                                        <option key={t.id} value={t.name}>
                                          {t.name} ({t.subject})
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              </td>

                              {/* Kolom 3: NIP */}
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.teacherNip}
                                  placeholder="NIP/NUPTK"
                                  onChange={(e) => handleUpdateCell(idx, 'teacherNip', e.target.value)}
                                  className="w-full px-2 py-1 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                                />
                              </td>

                              {/* Kolom 4: Mata Pelajaran */}
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.subject}
                                  placeholder="Mata pelajaran"
                                  onChange={(e) => handleUpdateCell(idx, 'subject', e.target.value)}
                                  className="w-full px-2.5 py-1 text-xs font-semibold text-purple-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                                />
                              </td>

                              {/* Kolom 5: Kelas */}
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.gradeClass}
                                  placeholder="Kelas (e.g. X-1)"
                                  onChange={(e) => handleUpdateCell(idx, 'gradeClass', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                                />
                              </td>

                              {/* Kolom 6: Tanggal */}
                              <td className="p-2">
                                <input
                                  type="date"
                                  value={row.date}
                                  onChange={(e) => handleUpdateCell(idx, 'date', e.target.value)}
                                  className="w-full px-2 py-1 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                                />
                              </td>

                              {/* Kolom 7: Supervisor */}
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.supervisorName}
                                  placeholder="Nama Supervisor"
                                  onChange={(e) => handleUpdateCell(idx, 'supervisorName', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                                />
                              </td>

                              {/* Kolom 8: 1. Administrasi */}
                              <td className="p-2 bg-indigo-50/30">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={row.scoreAdmin}
                                  onChange={(e) => handleUpdateCell(idx, 'scoreAdmin', Number(e.target.value))}
                                  className="w-full px-1.5 py-1 text-xs font-mono font-bold text-center text-indigo-700 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                              </td>

                              {/* Kolom 9: 2. Perencanaan */}
                              <td className="p-2 bg-purple-50/30">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={row.scorePlanning}
                                  onChange={(e) => handleUpdateCell(idx, 'scorePlanning', Number(e.target.value))}
                                  className="w-full px-1.5 py-1 text-xs font-mono font-bold text-center text-purple-700 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                                />
                              </td>

                              {/* Kolom 10: 3. Pelaksanaan */}
                              <td className="p-2 bg-teal-50/30">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={row.scoreExecution}
                                  onChange={(e) => handleUpdateCell(idx, 'scoreExecution', Number(e.target.value))}
                                  className="w-full px-1.5 py-1 text-xs font-mono font-bold text-center text-teal-700 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                                />
                              </td>

                              {/* Kolom 11: 4. Asesmen */}
                              <td className="p-2 bg-emerald-50/30">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={row.scoreAssessment}
                                  onChange={(e) => handleUpdateCell(idx, 'scoreAssessment', Number(e.target.value))}
                                  className="w-full px-1.5 py-1 text-xs font-mono font-bold text-center text-emerald-700 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                                />
                              </td>

                              {/* Kolom 12: 5. Quantum Learning */}
                              <td className="p-2 bg-amber-50/40">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={row.scoreQuantum}
                                  onChange={(e) => handleUpdateCell(idx, 'scoreQuantum', Number(e.target.value))}
                                  className="w-full px-1.5 py-1 text-xs font-mono font-extrabold text-center text-amber-900 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-amber-50/60"
                                />
                              </td>

                              {/* Kolom 13: Rerata Terhitung Otomatis */}
                              <td className="p-2 text-center bg-slate-100/70 font-mono font-extrabold text-slate-900 text-xs">
                                {stats.avg}
                              </td>

                              {/* Kolom 14: Predikat Otomatis */}
                              <td className="p-2 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    stats.predicate === 'Amat Baik'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : stats.predicate === 'Baik'
                                      ? 'bg-teal-100 text-teal-800'
                                      : stats.predicate === 'Cukup'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {stats.predicate}
                                </span>
                              </td>

                              {/* Kolom 15: Program RTL */}
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.rtlAction}
                                  placeholder="Judul program tindak lanjut"
                                  onChange={(e) => handleUpdateCell(idx, 'rtlAction', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                                />
                              </td>

                              {/* Kolom 16: Metode RTL */}
                              <td className="p-2">
                                <select
                                  value={row.rtlMethod}
                                  onChange={(e) =>
                                    handleUpdateCell(idx, 'rtlMethod', e.target.value as FollowUpPlan['method'])
                                  }
                                  className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                                >
                                  <option value="Coaching 1-on-1">Coaching 1-on-1</option>
                                  <option value="Peer Teaching">Peer Teaching</option>
                                  <option value="Workshop Asesmen">Workshop Asesmen</option>
                                  <option value="Pendampingan TPACK">Pendampingan TPACK</option>
                                  <option value="Mandiri PMM">Mandiri PMM</option>
                                </select>
                              </td>

                              {/* Kolom 17: Target Selesai */}
                              <td className="p-2">
                                <input
                                  type="date"
                                  value={row.rtlTargetDate}
                                  onChange={(e) => handleUpdateCell(idx, 'rtlTargetDate', e.target.value)}
                                  className="w-full px-2 py-1 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                                />
                              </td>

                              {/* Kolom 18: Delete */}
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRow(idx)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Hapus baris hasil supervisi ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2 px-1">
                <span>
                  Baris Siap Impor: <strong className="text-purple-700 font-bold">{validCount}</strong> dari {rows.length} baris
                </span>
                <span className="text-[11px] text-slate-500">
                  Tip: Rerata 5 instrumen (Adm, Renc, Laks, Asm, QL) dan predikat terhitung secara real-time saat skor diubah per kolom.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Tempel (Paste) Teks CSV / Salinan Kolom dari Excel atau Google Sheets:
              </label>
              <textarea
                rows={9}
                value={rawCsvText}
                onChange={(e) => setRawCsvText(e.target.value)}
                placeholder="Nama Guru,NIP,Mata Pelajaran,Kelas,Tanggal,Jam,Supervisor,Skor Administrasi,Skor Perencanaan,Skor Pelaksanaan,Skor Asesmen,Skor Quantum Learning,Kekuatan,Kelemahan,Program RTL,Metode RTL,Target Selesai&#10;Ahmad Fauzi,1987...,Bahasa Inggris,XII MIPA,2026-10-12,08:00,Dr. Nina,94,92,90,88,95,Penguasaan fasih,Umpan balik,Optimalisasi Formatif,Peer Teaching,2026-11-05"
                className="w-full px-4 py-3 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-slate-900 text-slate-100"
              />
              <button
                type="button"
                onClick={() => handleParseRawText(rawCsvText)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Table className="w-4 h-4" />
                <span>Konversi ke Tabel Kolom Rapi</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/90">
          <div className="text-xs text-slate-600">
            {validCount > 0 ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {validCount} hasil observasi guru dengan 5 instrumen siap diimpor ke sistem
              </span>
            ) : (
              <span className="text-slate-400">Lengkapi data pada tabel kolom untuk melanjutkan.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={validCount === 0}
              onClick={handleSaveImport}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Impor {validCount} Supervisi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
