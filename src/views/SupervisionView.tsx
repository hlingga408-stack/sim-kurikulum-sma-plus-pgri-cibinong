import { useState } from 'react';
import { SupervisionRecord, SupervisionPredicate, Teacher } from '../types';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  UserCheck,
  Calendar,
  AlertTriangle,
  ChevronRight,
  FileSpreadsheet,
  Download,
  Printer,
  Users,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { broadcastToast } from '../services/notificationService';
import { downloadNativeExcel, downloadSemicolonCsv } from '../utils/excelHelper';

interface SupervisionViewProps {
  supervisions: SupervisionRecord[];
  teachers?: Teacher[];
  onOpenCreate: (preselectedTeacher?: Teacher) => void;
  onOpenImportModal: () => void;
  onSelectRecord: (record: SupervisionRecord) => void;
  onToggleRtlStatus: (recordId: string) => void;
  onConsultAiWithRecord: (record: SupervisionRecord) => void;
  onOpenReportModal: (record?: SupervisionRecord) => void;
}

export function SupervisionView({
  supervisions,
  teachers = [],
  onOpenCreate,
  onOpenImportModal,
  onSelectRecord,
  onToggleRtlStatus,
  onConsultAiWithRecord,
  onOpenReportModal,
}: SupervisionViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPredicate, setSelectedPredicate] = useState<string>('all');
  const [selectedRtlStatus, setSelectedRtlStatus] = useState<string>('all');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('all');
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);

  const filteredSupervisions = supervisions.filter((s) => {
    const matchesSearch =
      s.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.gradeClass.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPredicate = selectedPredicate === 'all' || s.predicate === selectedPredicate;
    const matchesRtl = selectedRtlStatus === 'all' || s.followUp.status === selectedRtlStatus;
    const matchesTeacher = selectedTeacherFilter === 'all' || s.teacherName === selectedTeacherFilter;

    return matchesSearch && matchesPredicate && matchesRtl && matchesTeacher;
  });

  const avgAdmin = Math.round(
    supervisions.reduce((acc, s) => acc + (s.scores.administration ?? 90), 0) / (supervisions.length || 1)
  );
  const avgPlanning = Math.round(
    supervisions.reduce((acc, s) => acc + s.scores.planning, 0) / (supervisions.length || 1)
  );
  const avgExecution = Math.round(
    supervisions.reduce((acc, s) => acc + s.scores.execution, 0) / (supervisions.length || 1)
  );
  const avgAssessment = Math.round(
    supervisions.reduce((acc, s) => acc + s.scores.assessment, 0) / (supervisions.length || 1)
  );
  const avgQuantum = Math.round(
    supervisions.reduce((acc, s) => acc + (s.scores.quantumLearning ?? 88), 0) / (supervisions.length || 1)
  );
  const completedRtlCount = supervisions.filter(
    (s) => s.followUp.status === 'Selesai & Diverifikasi'
  ).length;

  const handleExportExcel = () => {
    const headers = [
      'Nama Guru Lengkap',
      'NIP Guru',
      'Mata Pelajaran',
      'Kelas / Fase',
      'Tanggal Observasi',
      'Jam Sesi',
      'Supervisor',
      '1. Administrasi',
      '2. Perencanaan',
      '3. Pelaksanaan',
      '4. Asesmen',
      '5. Quantum Learning',
      'Rerata Skor',
      'Predikat',
      'Kekuatan & Kelebihan',
      'Temuan & Aspek Perbaikan',
      'Program RTL',
      'Metode RTL',
      'Target Selesai RTL',
      'Status RTL'
    ];
    const rows = supervisions.map((s) => [
      s.teacherName,
      s.teacherNip,
      s.subject,
      s.gradeClass,
      s.date,
      s.time,
      s.supervisorName,
      s.scores.administration ?? 90,
      s.scores.planning,
      s.scores.execution,
      s.scores.assessment,
      s.scores.quantumLearning ?? 88,
      s.overallScore,
      s.predicate,
      s.strengths || '',
      s.weaknesses || '',
      s.followUp.actionTitle || '',
      s.followUp.method,
      s.followUp.targetDate,
      s.followUp.status
    ]);

    downloadNativeExcel(
      `hasil_supervisi_5_instrumen_sma_plus_pgri_cibinong_${new Date().toISOString().split('T')[0]}.xls`,
      headers,
      rows,
      'Hasil Supervisi'
    );

    broadcastToast({
      title: 'Hasil Supervisi Diekspor ke Excel',
      message: `${supervisions.length} hasil supervisi telah diunduh dalam format Excel kolom rapi tanpa koma.`,
      type: 'success',
    });
  };

  const handleExportCsv = () => {
    const headers = [
      'Nama Guru Lengkap',
      'NIP Guru',
      'Mata Pelajaran',
      'Kelas / Fase',
      'Tanggal Observasi',
      'Jam Sesi',
      'Supervisor',
      '1. Administrasi',
      '2. Perencanaan',
      '3. Pelaksanaan',
      '4. Asesmen',
      '5. Quantum Learning',
      'Rerata Skor',
      'Predikat',
      'Kekuatan',
      'Kelemahan',
      'Program RTL',
      'Metode RTL',
      'Target Selesai',
      'Status RTL'
    ];
    const rows = supervisions.map((s) => [
      s.teacherName,
      s.teacherNip,
      s.subject,
      s.gradeClass,
      s.date,
      s.time,
      s.supervisorName,
      s.scores.administration ?? 90,
      s.scores.planning,
      s.scores.execution,
      s.scores.assessment,
      s.scores.quantumLearning ?? 88,
      s.overallScore,
      s.predicate,
      s.strengths || '',
      s.weaknesses || '',
      s.followUp.actionTitle || '',
      s.followUp.method,
      s.followUp.targetDate,
      s.followUp.status
    ]);

    downloadSemicolonCsv(
      `hasil_supervisi_5_instrumen_sma_plus_pgri_cibinong_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows
    );

    broadcastToast({
      title: 'Hasil Supervisi Diekspor (CSV ;)',
      message: `${supervisions.length} hasil supervisi diunduh dalam format CSV titik-koma.`,
      type: 'info',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-purple-600" />
            Supervisi Akademik & Rencana Tindak Lanjut (RTL)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Instrumen 5 Dimensi: 1) Administrasi, 2) Perencanaan, 3) Pelaksanaan, 4) Asesmen, dan 5) Quantum Learning
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Tombol Dropdown Pilih Guru dari Data Guru */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Pilih guru terdaftar dari Data Guru untuk langsung memulai supervisi"
            >
              <Users className="w-4 h-4 text-purple-700" />
              <span>Pilih Guru Supervisi</span>
              <ChevronDown className={`w-3.5 h-3.5 text-purple-600 transition-transform ${isTeacherDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isTeacherDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-xl border border-purple-200 py-1.5 z-40 animate-in fade-in">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-purple-50/60">
                  <span className="text-[11px] font-extrabold text-purple-950 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-purple-700" />
                    Pilih Guru dari Data Guru
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                    {teachers.length} Guru
                  </span>
                </div>
                <div className="p-1 divide-y divide-slate-100">
                  {teachers.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setIsTeacherDropdownOpen(false);
                        onOpenCreate(t);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-purple-50 transition-colors flex flex-col group cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-purple-900">{t.name}</span>
                        <span className="text-[10px] font-medium text-slate-400 font-mono shrink-0">NIP: {t.nip || '-'}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-purple-700 group-hover:text-purple-800 flex items-center gap-1 mt-0.5">
                        <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{t.subject} • {t.subjectCluster}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onOpenReportModal()}
            className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cetak dan Unduh Lembar Laporan Hasil Supervisi Resmi dengan Kop Sekolah (PDF)"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak / Unduh PDF (Kop Resmi)</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ekspor seluruh hasil supervisi ke Excel (Kolom Rapi Tanpa Koma)"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel (.xls)</span>
          </button>

          <button
            onClick={onOpenImportModal}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Impor massal hasil supervisi langsung tanpa input manual satu per satu"
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            <span>Impor Otomatis (Per Kolom)</span>
          </button>

          <button
            onClick={() => onOpenCreate()}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Input Supervisi Baru
          </button>
        </div>
      </div>

      {/* 5 Instruments Score Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Observasi</div>
          <div className="text-xl font-extrabold text-slate-900">{supervisions.length} Guru</div>
          <p className="text-[10px] text-purple-700 font-medium mt-1 truncate">
            {completedRtlCount} RTL tuntas
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">1. Administrasi</div>
          <div className="text-xl font-extrabold text-indigo-900 font-mono">{avgAdmin}</div>
          <p className="text-[10px] text-slate-500 mt-1 truncate">Jurnal, Nilai, Prota</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-1">2. Perencanaan</div>
          <div className="text-xl font-extrabold text-purple-900 font-mono">{avgPlanning}</div>
          <p className="text-[10px] text-slate-500 mt-1 truncate">ATP & Modul Ajar</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-teal-700 uppercase tracking-wider mb-1">3. Pelaksanaan</div>
          <div className="text-xl font-extrabold text-teal-900 font-mono">{avgExecution}</div>
          <p className="text-[10px] text-slate-500 mt-1 truncate">Kelas & TPACK</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">4. Asesmen</div>
          <div className="text-xl font-extrabold text-emerald-900 font-mono">{avgAssessment}</div>
          <p className="text-[10px] text-slate-500 mt-1 truncate">Formatif & Umpan Balik</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-2xs">
          <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">5. Quantum Learn</div>
          <div className="text-xl font-extrabold text-amber-900 font-mono">{avgQuantum}</div>
          <p className="text-[10px] text-amber-800 font-medium mt-1 truncate">TANDUR & AMBAK</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama guru, mata pelajaran, atau kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Filter Dropdown Pilih Guru dari Data Guru */}
          <select
            value={selectedTeacherFilter}
            onChange={(e) => setSelectedTeacherFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-purple-200 rounded-xl bg-purple-50/50 text-purple-950 font-bold focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-2xs"
            title="Filter tampilan berdasarkan nama guru dari Data Guru"
          >
            <option value="all">Semua Guru ({teachers.length} terdaftar)</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name} — {t.subject}
              </option>
            ))}
          </select>

          <select
            value={selectedPredicate}
            onChange={(e) => setSelectedPredicate(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Semua Predikat</option>
            <option value="Amat Baik">Amat Baik (≥ 91)</option>
            <option value="Baik">Baik (81 - 90)</option>
            <option value="Cukup">Cukup (71 - 80)</option>
            <option value="Perlu Bimbingan">Perlu Bimbingan (&lt; 71)</option>
          </select>

          <select
            value={selectedRtlStatus}
            onChange={(e) => setSelectedRtlStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Semua Status RTL</option>
            <option value="Selesai & Diverifikasi">Selesai & Diverifikasi</option>
            <option value="Sedang Berjalan">Sedang Berjalan</option>
            <option value="Belum Mulai">Belum Mulai</option>
          </select>
        </div>
      </div>

      {/* Supervisions List */}
      <div className="space-y-4">
        {filteredSupervisions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-purple-300 space-y-3 shadow-2xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {selectedTeacherFilter !== 'all'
                  ? `Belum Ada Catatan Supervisi untuk ${selectedTeacherFilter}`
                  : 'Tidak Ada Data Supervisi yang Sesuai'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {selectedTeacherFilter !== 'all'
                  ? `Guru ini telah otomatis terhubung dari Data Guru. Klik tombol di bawah untuk membuat lembar supervisi klinis.`
                  : 'Silakan sesuaikan kata kunci pencarian atau pilihan filter di atas.'}
              </p>
            </div>
            {selectedTeacherFilter !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  const found = teachers.find((t) => t.name === selectedTeacherFilter);
                  onOpenCreate(found);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Mulai Supervisi untuk {selectedTeacherFilter}
              </button>
            )}
          </div>
        ) : (
          filteredSupervisions.map((sup) => (
          <div
            key={sup.id}
            className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      sup.predicate === 'Amat Baik'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sup.predicate === 'Baik'
                        ? 'bg-teal-100 text-teal-800'
                        : sup.predicate === 'Cukup'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Skor: {sup.overallScore} • Predikat {sup.predicate}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                    Kelas: {sup.gradeClass}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {sup.teacherName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mata Pelajaran: <span className="font-semibold text-slate-800">{sup.subject}</span> • NIP:{' '}
                  <span className="font-mono">{sup.teacherNip}</span> • Tanggal: {sup.date} ({sup.time})
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Supervisor: <span className="font-medium text-slate-600">{sup.supervisorName}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  onClick={() => onOpenReportModal(sup)}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Cetak & Unduh Dokumen PDF Resmi Guru Ini (Kop Sekolah)"
                >
                  <Printer className="w-3.5 h-3.5 text-purple-700" />
                  <span>Cetak PDF</span>
                </button>
                <button
                  onClick={() => onConsultAiWithRecord(sup)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Minta Rekomendasi AI untuk Supervisi Ini"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Kaji AI</span>
                </button>
                <button
                  onClick={() => onSelectRecord(sup)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Ubah / Detail
                </button>
              </div>
            </div>

            {/* 5 Instruments score pill strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-1.5 rounded-lg bg-white/80 border border-slate-200/60">
                <span className="text-slate-600 font-semibold text-[11px]">1. Administrasi:</span>
                <span className="font-mono font-bold text-indigo-700 text-xs">{sup.scores.administration ?? 90}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-1.5 rounded-lg bg-white/80 border border-slate-200/60">
                <span className="text-slate-600 font-semibold text-[11px]">2. Perencanaan:</span>
                <span className="font-mono font-bold text-purple-700 text-xs">{sup.scores.planning}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-1.5 rounded-lg bg-white/80 border border-slate-200/60">
                <span className="text-slate-600 font-semibold text-[11px]">3. Pelaksanaan:</span>
                <span className="font-mono font-bold text-teal-700 text-xs">{sup.scores.execution}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-1.5 rounded-lg bg-white/80 border border-slate-200/60">
                <span className="text-slate-600 font-semibold text-[11px]">4. Asesmen:</span>
                <span className="font-mono font-bold text-emerald-700 text-xs">{sup.scores.assessment}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col sm:flex-row sm:items-center justify-between p-1.5 rounded-lg bg-amber-50/80 border border-amber-200/60">
                <span className="text-amber-950 font-semibold text-[11px] truncate">5. Quantum Learn:</span>
                <span className="font-mono font-bold text-amber-900 text-xs">{sup.scores.quantumLearning ?? 88}</span>
              </div>
            </div>

            {/* Observations text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="font-bold text-emerald-900 block mb-1">Kekuatan & Kelebihan:</span>
                <p className="text-slate-700 leading-relaxed">{sup.strengths}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                <span className="font-bold text-amber-900 block mb-1">Temuan Aspek Perbaikan:</span>
                <p className="text-slate-700 leading-relaxed">{sup.weaknesses}</p>
              </div>
            </div>

            {/* Rencana Tindak Lanjut (RTL) Card */}
            <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900 px-2 py-0.5 rounded bg-purple-200/70">
                    Rencana Tindak Lanjut (RTL)
                  </span>
                  <span className="text-xs text-slate-500">
                    Metode: <strong className="text-slate-800">{sup.followUp.method}</strong>
                  </span>
                </div>
                <h4 className="text-xs font-bold text-purple-950">{sup.followUp.actionTitle}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pembimbing/Mentor: {sup.followUp.mentor} • Target Selesai: {sup.followUp.targetDate}
                </p>
                {sup.followUp.notes && (
                  <p className="text-[11px] text-purple-900/80 mt-1 italic">
                    Catatan: &quot;{sup.followUp.notes}&quot;
                  </p>
                )}
              </div>

              {/* Status RTL Toggle */}
              <button
                onClick={() => {
                  onToggleRtlStatus(sup.id);
                  broadcastToast({
                    title: 'Status RTL Diperbarui',
                    message: `Status tindak lanjut guru ${sup.teacherName} telah diperbarui.`,
                    type: 'success',
                  });
                }}
                className={`self-start sm:self-center px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                  sup.followUp.status === 'Selesai & Diverifikasi'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                {sup.followUp.status === 'Selesai & Diverifikasi' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>RTL Tuntas & Sah</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>{sup.followUp.status} (Klik bila Selesai)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}
