import { useState, useEffect } from 'react';
import { WorkProgram, ProgramCategory, ProgramStatus, Milestone } from '../types';
import { X, Target, Plus, Trash2, Printer, FileText, Link, ExternalLink, FolderOpen } from 'lucide-react';

interface ProgramModalProps {
  program: WorkProgram | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (program: WorkProgram) => void;
  onOpenReport?: (program: WorkProgram) => void;
}

export function ProgramModal({ program, isOpen, onClose, onSave, onOpenReport }: ProgramModalProps) {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProgramCategory>('Kurikulum & KOSP');
  const [pic, setPic] = useState('');
  const [academicYear, setAcademicYear] = useState('2024/2025');
  const [targetPeriod, setTargetPeriod] = useState('');
  const [budgetEstimated, setBudgetEstimated] = useState(10000000);
  const [budgetRealized, setBudgetRealized] = useState(0);
  const [status, setStatus] = useState<ProgramStatus>('not_started');
  const [description, setDescription] = useState('');
  const [indicators, setIndicators] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const [reportLink, setReportLink] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 'm-new-1', title: 'Perencanaan dan koordinasi tim', completed: false, dueDate: '' },
    { id: 'm-new-2', title: 'Pelaksanaan kegiatan utama', completed: false, dueDate: '' },
    { id: 'm-new-3', title: 'Evaluasi dan pelaporan ketercapaian', completed: false, dueDate: '' },
  ]);

  useEffect(() => {
    if (program) {
      setCode(program.code);
      setTitle(program.title);
      setCategory(program.category);
      setPic(program.pic);
      setAcademicYear(program.academicYear || '2024/2025');
      setTargetPeriod(program.targetPeriod);
      setBudgetEstimated(program.budgetEstimated);
      setBudgetRealized(program.budgetRealized);
      setStatus(program.status);
      setDescription(program.description);
      setIndicators(program.indicators);
      setEvaluation(program.evaluation || '');
      setReportLink(program.reportLink || '');
      setMilestones(program.milestones || []);
    } else {
      setCode(`PK-${Math.floor(Math.random() * 90 + 10)}`);
      setTitle('');
      setCategory('Kurikulum & KOSP');
      setPic('Wakasek Kurikulum');
      setAcademicYear('2024/2025');
      setTargetPeriod('Semester Ganjil 2024/2025');
      setBudgetEstimated(15000000);
      setBudgetRealized(0);
      setStatus('not_started');
      setDescription('');
      setIndicators('');
      setEvaluation('');
      setReportLink('');
      setMilestones([
        { id: `m-${Date.now()}-1`, title: 'Perencanaan dan pembentukan tim', completed: false, dueDate: '2026-10-30' },
        { id: `m-${Date.now()}-2`, title: 'Eksekusi program dan pendampingan', completed: false, dueDate: '2026-11-20' },
        { id: `m-${Date.now()}-3`, title: 'Evaluasi hasil dan tindak lanjut', completed: false, dueDate: '2026-12-10' },
      ]);
    }
  }, [program, isOpen]);

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { id: `m-${Date.now()}`, title: '', completed: false, dueDate: '' },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: keyof Milestone, value: unknown) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    // Calculate progress based on milestones if any
    const completedCount = milestones.filter((m) => m.completed).length;
    const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

    let computedStatus = status;
    if (progress === 100) computedStatus = 'completed';
    else if (progress > 0 && computedStatus === 'not_started') computedStatus = 'in_progress';

    const updatedProgram: WorkProgram = {
      id: program?.id || `proker-${Date.now()}`,
      code: code || 'PK-00',
      title,
      category,
      pic,
      academicYear: academicYear || '2024/2025',
      targetPeriod,
      budgetEstimated: Number(budgetEstimated) || 0,
      budgetRealized: Number(budgetRealized) || 0,
      status: computedStatus,
      progress,
      milestones,
      description,
      indicators,
      evaluation,
      reportLink: reportLink.trim() || undefined,
    };

    onSave(updatedProgram);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {program ? 'Ubah Program Kerja Kurikulum' : 'Tambah Program Kerja Baru'}
              </h3>
              <p className="text-xs text-slate-500">Rencana Kerja & Indikator Kinerja Kurikulum SMA Plus PGRI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="program-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode Proker</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Program Kerja *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bimbingan Intensif Persiapan Olimpiade Sains"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProgramCategory)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="Kurikulum & KOSP">Kurikulum & KOSP</option>
                  <option value="Pengembangan Guru & IHT">Pengembangan Guru & IHT</option>
                  <option value="Asesmen & Ujian">Asesmen & Ujian</option>
                  <option value="P5 & Pembinaan Karakter">P5 & Pembinaan Karakter</option>
                  <option value="Kelas Unggulan & Riset">Kelas Unggulan & Riset</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Penanggung Jawab (PIC) *</label>
                <input
                  type="text"
                  required
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tahun Ajaran (Manual) *
                </label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="Contoh: 2024/2025"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Periode</label>
                <input
                  type="text"
                  value={targetPeriod}
                  onChange={(e) => setTargetPeriod(e.target.value)}
                  placeholder="Contoh: Semester Ganjil / Okt - Des"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimasi Anggaran (Rp)</label>
                <input
                  type="number"
                  value={budgetEstimated}
                  onChange={(e) => setBudgetEstimated(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Realisasi Anggaran (Rp)</label>
                <input
                  type="number"
                  value={budgetRealized}
                  onChange={(e) => setBudgetRealized(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Program</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Rincian tujuan dan ruang lingkup program..."
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Indikator Ketercapaian</label>
              <input
                type="text"
                value={indicators}
                onChange={(e) => setIndicators(e.target.value)}
                placeholder="Contoh: 100% dewan guru memahami rubrik HOTS, minimal 5 kejuaraan"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Evaluasi / Catatan Keterlaksanaan Program */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>Evaluasi & Catatan Keterlaksanaan Program</span>
                </label>
                <span className="text-[10px] text-amber-800 font-semibold bg-amber-100/80 px-2 py-0.5 rounded">
                  Monitoring & Evaluasi (Monev)
                </span>
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed">
                Tuliskan analisis evaluasi capaian, kendala lapangan, efisiensi penyerapan anggaran, serta rekomendasi tindak lanjut kurikulum.
              </p>
              <textarea
                rows={3}
                value={evaluation}
                onChange={(e) => setEvaluation(e.target.value)}
                placeholder="Contoh: Pelaksanaan workshop berjalan sukses (92% guru hadir). Kendala: waktu simulasi kurang 1 jam. Rekomendasi: lakukan pendampingan mandiri melalui MGMP..."
                className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 text-slate-800"
              />
            </div>

            {/* Pelaporan Program (Copy Link dari Google Drive) */}
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-blue-700" />
                  <span>Pelaporan Program (Copy Link dari Google Drive)</span>
                </label>
                <span className="text-[10px] text-blue-800 font-bold bg-blue-100/90 px-2 py-0.5 rounded-full border border-blue-200 self-start sm:self-auto">
                  Google Drive / Cloud LPJ
                </span>
              </div>
              <p className="text-[11px] text-blue-900/80 leading-relaxed">
                Salin dan tempelkan (copy-paste tautan link) folder laporan pertanggungjawaban (LPJ), foto/video dokumentasi, atau berkas bukti dukung program dari Google Drive.
              </p>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input
                    type="url"
                    value={reportLink}
                    onChange={(e) => setReportLink(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/... atau https://docs.google.com/..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs border border-blue-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 text-slate-800 font-mono"
                  />
                </div>
                {reportLink && (
                  <a
                    href={reportLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs cursor-pointer"
                    title="Buka dan uji tautan Google Drive di tab baru"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tes Buka Link</span>
                  </a>
                )}
              </div>
            </div>

            {/* Milestones Checklist */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Tahapan Kerja / Milestone ({milestones.filter((m) => m.completed).length}/{milestones.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Tahapan
                </button>
              </div>

              <div className="space-y-2">
                {milestones.map((m, idx) => (
                  <div key={m.id || idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <input
                      type="checkbox"
                      checked={m.completed}
                      onChange={(e) => handleMilestoneChange(idx, 'completed', e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Uraian tahapan..."
                      value={m.title}
                      onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                      className={`flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white ${
                        m.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    />
                    <input
                      type="date"
                      value={m.dueDate}
                      onChange={(e) => handleMilestoneChange(idx, 'dueDate', e.target.value)}
                      className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/80">
          <div>
            {program && onOpenReport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReport(program);
                }}
                className="px-4 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Cetak Laporan Monev Program Kerja Ini dengan Kop Sekolah Resmi (PDF)"
              >
                <Printer className="w-4 h-4 text-teal-700" />
                <span>Cetak Lembar Proker (PDF)</span>
              </button>
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
              type="submit"
              form="program-form"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs cursor-pointer"
            >
              {program ? 'Perbarui Program' : 'Simpan Program Baru'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
