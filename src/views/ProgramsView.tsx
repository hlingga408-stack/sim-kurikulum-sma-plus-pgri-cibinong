import { useState } from 'react';
import { WorkProgram, ProgramCategory, ProgramStatus } from '../types';
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  Coins,
  CheckSquare,
  Square,
  Edit3,
  Calendar,
  AlertCircle,
  Printer,
  FileText,
  FolderOpen,
  ExternalLink,
  Link,
} from 'lucide-react';

interface ProgramsViewProps {
  programs: WorkProgram[];
  onOpenCreate: () => void;
  onEditProgram: (program: WorkProgram) => void;
  onToggleMilestone: (programId: string, milestoneId: string) => void;
  onOpenReportModal?: (program?: WorkProgram) => void;
}

export function ProgramsView({
  programs,
  onOpenCreate,
  onEditProgram,
  onToggleMilestone,
  onOpenReportModal,
}: ProgramsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredPrograms = programs.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    return matchesCat && matchesStatus;
  });

  const totalEstimated = programs.reduce((acc, p) => acc + p.budgetEstimated, 0);
  const totalRealized = programs.reduce((acc, p) => acc + p.budgetRealized, 0);
  const budgetUtilizationRate = Math.round((totalRealized / (totalEstimated || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-teal-600" />
            Program Kerja & Monitoring Kurikulum
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelacakan realisasi program kerja strategis, capaian milestone, dan penyerapan anggaran kurikulum
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onOpenReportModal?.()}
            className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cetak & Unduh Laporan Monitoring Program Kerja Resmi dengan Kop Sekolah (PDF)"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak / Unduh PDF (Kop Resmi)</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Program Kerja
          </button>
        </div>
      </div>

      {/* Budget & Progress Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Rencana Anggaran Total</span>
            <Coins className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            Rp {totalEstimated.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Alokasi pagu tahun ajaran 2026/2027</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Realisasi Penyerapan</span>
            <Coins className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-extrabold text-teal-700 font-mono">
            Rp {totalRealized.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-teal-600 font-medium mt-1">
            {budgetUtilizationRate}% terserap per Oktober 2026
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Ketercapaian Program</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-800">
            {programs.filter((p) => p.status === 'completed').length} / {programs.length} Proker
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            {programs.filter((p) => p.status === 'in_progress').length} program sedang berjalan aktif
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">Semua Kategori Proker</option>
          <option value="Kurikulum & KOSP">Kurikulum & KOSP</option>
          <option value="Pengembangan Guru & IHT">Pengembangan Guru & IHT</option>
          <option value="Asesmen & Ujian">Asesmen & Ujian</option>
          <option value="P5 & Pembinaan Karakter">P5 & Pembinaan Karakter</option>
          <option value="Kelas Unggulan & Riset">Kelas Unggulan & Riset</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">Semua Status</option>
          <option value="not_started">Belum Mulai</option>
          <option value="in_progress">Sedang Berjalan</option>
          <option value="evaluation">Tahap Evaluasi</option>
          <option value="completed">Selesai 100%</option>
        </select>
      </div>

      {/* Programs List */}
      <div className="space-y-4">
        {filteredPrograms.map((prog) => (
          <div
            key={prog.id}
            className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                    {prog.code}
                  </span>
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                    TA {prog.academicYear || '2024/2025'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {prog.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      prog.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : prog.status === 'in_progress'
                        ? 'bg-teal-100 text-teal-800'
                        : prog.status === 'evaluation'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {prog.status === 'completed'
                      ? 'Selesai'
                      : prog.status === 'in_progress'
                      ? 'Sedang Berjalan'
                      : prog.status === 'evaluation'
                      ? 'Evaluasi'
                      : 'Belum Mulai'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{prog.title}</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">{prog.description}</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  onClick={() => onOpenReportModal?.(prog)}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold border border-teal-200 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Cetak & Unduh Dokumen Monev Proker Ini (Kop Resmi PDF)"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-700" />
                  <span>Cetak PDF</span>
                </button>
                <button
                  onClick={() => onEditProgram(prog)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ubah</span>
                </button>
              </div>
            </div>

            {/* Progress Bar & Indicators */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Tingkat Ketercapaian Proker</span>
                <span className="font-mono font-extrabold text-sm text-teal-800">{prog.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    prog.progress === 100
                      ? 'bg-emerald-600'
                      : prog.progress >= 50
                      ? 'bg-teal-600'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${prog.progress}%` }}
                />
              </div>
            </div>

            {/* Meta details strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Penanggung Jawab</span>
                <span className="font-semibold text-slate-800">{prog.pic}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Target Waktu</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  {prog.targetPeriod}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Realisasi Anggaran</span>
                <span className="font-mono font-semibold text-slate-800">
                  Rp {prog.budgetRealized.toLocaleString('id-ID')} / Rp {prog.budgetEstimated.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Interactive Milestone Checklist */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Tahapan Kerja / Milestone (Dapat Dicentang Langsung)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {prog.milestones.filter((m) => m.completed).length} dari {prog.milestones.length} Selesai
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {prog.milestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onToggleMilestone(prog.id, m.id)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all cursor-pointer select-none ${
                      m.completed
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-white border-slate-200 hover:border-teal-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {m.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className={`truncate ${m.completed ? 'line-through text-slate-500' : 'font-medium'}`}>
                        {m.title}
                      </span>
                    </div>

                    {m.dueDate && (
                      <span className="text-[10px] font-mono text-slate-500 shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {m.dueDate}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluasi / Catatan Keterlaksanaan Proker */}
            {prog.evaluation && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <FileText className="w-3.5 h-3.5 text-amber-700" />
                  <span>Evaluasi & Catatan Keterlaksanaan Program:</span>
                </div>
                <p className="text-slate-800 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-amber-200/70">
                  {prog.evaluation}
                </p>
              </div>
            )}

            {/* Pelaporan Program (Google Drive Link) */}
            {prog.reportLink ? (
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-blue-950">Laporan & Berkas LPJ (Google Drive)</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100/90 px-1.5 py-0.2 rounded border border-blue-200">
                        Tersedia
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-blue-800/80 truncate block mt-0.5">
                      {prog.reportLink}
                    </span>
                  </div>
                </div>
                <a
                  href={prog.reportLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs shrink-0 cursor-pointer self-start sm:self-auto"
                  title="Buka folder berkas pelaporan di Google Drive"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Google Drive</span>
                </a>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                  Belum ada tautan berkas pelaporan Google Drive.
                </span>
                <button
                  type="button"
                  onClick={() => onEditProgram(prog)}
                  className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                >
                  + Input Link Drive
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
