import { useState, useEffect } from 'react';
import { MeetingFollowUpRecord } from '../types';
import { X, CheckCircle2, Calendar, FolderOpen, ExternalLink, Link, Clock, AlertCircle, FileCheck, Sparkles, Printer } from 'lucide-react';
import { broadcastToast } from '../services/notificationService';

interface MeetingRtlModalProps {
  rtl: MeetingFollowUpRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (rtl: MeetingFollowUpRecord) => void;
  onOpenPrint?: (rtl: MeetingFollowUpRecord) => void;
}

export function MeetingRtlModal({ rtl, isOpen, onClose, onSave, onOpenPrint }: MeetingRtlModalProps) {
  const [actionTitle, setActionTitle] = useState('');
  const [sourceType, setSourceType] = useState<MeetingFollowUpRecord['sourceType']>('Hasil Rapat');
  const [sourceReference, setSourceReference] = useState('');
  const [pic, setPic] = useState('Waka Kurikulum & Tim Pengembang');
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [resourcesNeeded, setResourcesNeeded] = useState('');
  const [indicators, setIndicators] = useState('');
  const [progress, setProgress] = useState(50);
  const [status, setStatus] = useState<MeetingFollowUpRecord['status']>('Sedang Berjalan');
  const [evidenceLink, setEvidenceLink] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (rtl) {
      setActionTitle(rtl.actionTitle);
      setSourceType(rtl.sourceType);
      setSourceReference(rtl.sourceReference);
      setPic(rtl.pic);
      setTargetDate(rtl.targetDate);
      setResourcesNeeded(rtl.resourcesNeeded || '');
      setIndicators(rtl.indicators || '');
      setProgress(rtl.progress);
      setStatus(rtl.status);
      setEvidenceLink(rtl.evidenceLink || '');
      setNotes(rtl.notes || '');
    } else {
      setActionTitle('');
      setSourceType('Hasil Rapat');
      setSourceReference('Rapat Pleno Tengah Semester');
      setPic('Waka Kurikulum & Tim Pengembang');
      setTargetDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
      setResourcesNeeded('Ruang Lab Komputer, Modul Panduan, Fasilitas Internet');
      setIndicators('100% dewan guru menuntaskan tindak lanjut dan data terunggah.');
      setProgress(25);
      setStatus('Sedang Berjalan');
      setEvidenceLink('');
      setNotes('');
    }
  }, [rtl, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle.trim() || !pic.trim()) {
      broadcastToast({
        title: 'Formulir Belum Lengkap',
        message: 'Mohon isi uraian kegiatan tindak lanjut dan penanggung jawab (PIC).',
        type: 'alert',
      });
      return;
    }

    let computedStatus = status;
    if (progress === 100) computedStatus = 'Tuntas & Terverifikasi';
    else if (progress > 0 && computedStatus === 'Belum Mulai') computedStatus = 'Sedang Berjalan';

    const updated: MeetingFollowUpRecord = {
      id: rtl?.id || `rtl-${Date.now()}`,
      actionTitle: actionTitle.trim(),
      sourceType,
      sourceReference: sourceReference.trim() || 'Hasil Keputusan Rapat',
      pic: pic.trim(),
      targetDate,
      resourcesNeeded: resourcesNeeded.trim(),
      indicators: indicators.trim(),
      progress,
      status: computedStatus,
      evidenceLink: evidenceLink.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {rtl ? 'Ubah Rencana Tindak Lanjut (RTL)' : 'Input Rencana Tindak Lanjut (RTL) Baru'}
              </h3>
              <p className="text-xs text-slate-500">Matriks Eksekusi & Pemantauan Hasil Rapat/Disposisi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="rtl-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Uraian Kegiatan Tindak Lanjut */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Uraian Kegiatan Rencana Tindak Lanjut (RTL) *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Contoh: Pendampingan Penyusunan Rubrik Asesmen HOTS & Stimulus Numerasi Guru Rumpun Bahasa dan IPS"
                value={actionTitle}
                onChange={(e) => setActionTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-900 bg-white"
              />
            </div>

            {/* Sumber Rujukan & Nama Rujukan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sumber Rujukan RTL</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as MeetingFollowUpRecord['sourceType'])}
                  className="w-full px-3.5 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Hasil Rapat">Hasil Rapat / Notulensi</option>
                  <option value="Instruksi Disposisi">Instruksi Lembar Disposisi</option>
                  <option value="Evaluasi Program">Evaluasi Program Monev</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rujukan Spesifik (Nama/No. Agenda)</label>
                <input
                  type="text"
                  placeholder="Misal: Rapat Pleno 16 Okt / Disposisi No. 042"
                  value={sourceReference}
                  onChange={(e) => setSourceReference(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
            </div>

            {/* PIC & Target Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Penanggung Jawab (PIC) *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama individu, jabatan, atau nama tim"
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batas Waktu / Target Selesai</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
            </div>

            {/* Progress Slider & Status */}
            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-teal-950">
                <span>Tingkat Ketercapaian / Progres RTL:</span>
                <span className="font-mono text-sm font-extrabold text-teal-800">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <label className="text-[11px] font-bold text-teal-900">Status Tindak Lanjut:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MeetingFollowUpRecord['status'])}
                  className="px-2.5 py-1 text-xs font-bold border border-teal-300 rounded-lg bg-white text-teal-950"
                >
                  <option value="Sedang Berjalan">Sedang Berjalan</option>
                  <option value="Tuntas & Terverifikasi">Tuntas & Terverifikasi</option>
                  <option value="Belum Mulai">Belum Mulai</option>
                </select>
              </div>
            </div>

            {/* Resources & Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kebutuhan Sumber Daya / Fasilitas</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Lab Komputer, proyektor, penggandaan materi..."
                  value={resourcesNeeded}
                  onChange={(e) => setResourcesNeeded(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Indikator Keberhasilan (Tolok Ukur)</label>
                <textarea
                  rows={2}
                  placeholder="Misal: 100% kisi-kisi dan naskah terverifikasi..."
                  value={indicators}
                  onChange={(e) => setIndicators(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
            </div>

            {/* Link Bukti Pelaporan Google Drive */}
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-blue-700" />
                  <span>Tautan Bukti Fisik / LPJ Hasil RTL (Google Drive)</span>
                </label>
                <span className="text-[10px] text-blue-800 font-bold bg-blue-100 px-2 py-0.5 rounded">
                  Cloud Storage
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input
                    type="url"
                    value={evidenceLink}
                    onChange={(e) => setEvidenceLink(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/... atau https://docs.google.com/..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs border border-blue-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 text-slate-800 font-mono"
                  />
                </div>
                {evidenceLink && (
                  <a
                    href={evidenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Buka Drive</span>
                  </a>
                )}
              </div>
            </div>

            {/* Catatan Verifikasi Pemantauan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Pemantauan / Verifikasi</label>
              <textarea
                rows={2}
                placeholder="Catatan progres pelaksanaan, verifikasi pengawas, atau tindak lanjut lanjutan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/80">
          <div>
            {rtl && onOpenPrint && (
              <button
                type="button"
                onClick={() => onOpenPrint(rtl)}
                className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cetak Matriks RTL Resmi ke format PDF"
              >
                <Printer className="w-4 h-4 text-teal-700" />
                <span>Cetak PDF Matriks RTL</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="rtl-form"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan RTL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
