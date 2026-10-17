import { useState, useEffect } from 'react';
import { DispositionRecord, DispositionPriority } from '../types';
import { X, Send, Calendar, Clock, FileText, CheckCircle2, AlertTriangle, Printer, Tag, CheckSquare, Square } from 'lucide-react';
import { broadcastToast } from '../services/notificationService';

interface DispositionModalProps {
  disposition: DispositionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (disposition: DispositionRecord) => void;
  onOpenPrint?: (disposition: DispositionRecord) => void;
}

const COMMON_TARGETS = [
  'Waka. Bidang Kurikulum',
  'Waka. Bidang Kesiswaan',
  'Waka. Manajemen Mutu / SDM',
  'Kepala Tata Usaha (TU)',
  'Tim Pengembang Kurikulum',
  'Koordinator P5 & Ekstrakurikuler',
  'Ketua MGMP / Rumpun Guru Mapel',
  'Bendahara Sekolah',
  'Pembina OSN / Riset KIR',
];

const COMMON_INSTRUCTIONS = [
  'Tindak lanjuti segera',
  'Pelajari / Buatkan telaah & kajian',
  'Siapkan bahan paparan / naskah SK',
  'Hadiri dan wakili sekolah',
  'Koordinasikan dengan tim terkait',
  'Jadwalkan rapat pembahasan',
  'Arsipkan & pantau perkembangannya',
  'Konfirmasi & laporkan hasilnya',
];

export function DispositionModal({
  disposition,
  isOpen,
  onClose,
  onSave,
  onOpenPrint,
}: DispositionModalProps) {
  const [agendaNumber, setAgendaNumber] = useState('');
  const [source, setSource] = useState('');
  const [letterNumber, setLetterNumber] = useState('');
  const [letterDate, setLetterDate] = useState(new Date().toISOString().split('T')[0]);
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<DispositionPriority>('Segera');
  const [disposedBy, setDisposedBy] = useState("Dr. Hj. Nina Nur'aeni, M.Pd. (Kepala Sekolah)");
  const [selectedTargets, setSelectedTargets] = useState<string[]>(['Waka. Bidang Kurikulum']);
  const [customTarget, setCustomTarget] = useState('');
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([
    'Tindak lanjuti segera',
    'Koordinasikan dengan tim terkait',
  ]);
  const [directorNotes, setDirectorNotes] = useState('');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<DispositionRecord['status']>('Sedang Ditindaklanjuti');

  useEffect(() => {
    if (disposition) {
      setAgendaNumber(disposition.agendaNumber);
      setSource(disposition.source);
      setLetterNumber(disposition.letterNumber);
      setLetterDate(disposition.letterDate);
      setReceivedDate(disposition.receivedDate);
      setSubject(disposition.subject);
      setPriority(disposition.priority);
      setDisposedBy(disposition.disposedBy);
      setSelectedTargets(disposition.targetAudience || []);
      setSelectedInstructions(disposition.instruction || []);
      setDirectorNotes(disposition.directorNotes);
      setDeadline(disposition.deadline);
      setStatus(disposition.status);
    } else {
      const randomAgenda = Math.floor(Math.random() * 80 + 10);
      setAgendaNumber(`AG-${new Date().getFullYear()}/X/${randomAgenda.toString().padStart(3, '0')}`);
      setSource('Cabang Dinas Pendidikan Wilayah I Provinsi Jawa Barat');
      setLetterNumber(`421.3/${Math.floor(Math.random() * 800 + 1000)}/Cadisdik.Wil.I/${new Date().getFullYear()}`);
      setLetterDate(new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]);
      setReceivedDate(new Date().toISOString().split('T')[0]);
      setSubject('');
      setPriority('Segera');
      setDisposedBy("Dr. Hj. Nina Nur'aeni, M.Pd. (Kepala Sekolah)");
      setSelectedTargets(['Waka. Bidang Kurikulum', 'Tim Pengembang Kurikulum']);
      setSelectedInstructions(['Tindak lanjuti segera', 'Koordinasikan dengan tim terkait']);
      setDirectorNotes('Segera pelajari dan koordinasikan bersama tim pengembang. Siapkan laporan tertulis hasil pelaksanaan.');
      setDeadline(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
      setStatus('Sedang Ditindaklanjuti');
    }
  }, [disposition, isOpen]);

  if (!isOpen) return null;

  const toggleTarget = (target: string) => {
    if (selectedTargets.includes(target)) {
      setSelectedTargets(selectedTargets.filter((t) => t !== target));
    } else {
      setSelectedTargets([...selectedTargets, target]);
    }
  };

  const handleAddCustomTarget = () => {
    if (customTarget.trim() && !selectedTargets.includes(customTarget.trim())) {
      setSelectedTargets([...selectedTargets, customTarget.trim()]);
      setCustomTarget('');
    }
  };

  const toggleInstruction = (inst: string) => {
    if (selectedInstructions.includes(inst)) {
      setSelectedInstructions(selectedInstructions.filter((i) => i !== inst));
    } else {
      setSelectedInstructions([...selectedInstructions, inst]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !source.trim()) {
      broadcastToast({
        title: 'Formulir Belum Lengkap',
        message: 'Mohon isi asal surat pengirim dan perihal surat disposisi.',
        type: 'alert',
      });
      return;
    }

    const updated: DispositionRecord = {
      id: disposition?.id || `disp-${Date.now()}`,
      agendaNumber: agendaNumber.trim() || `AG-${Date.now()}`,
      source: source.trim(),
      letterNumber: letterNumber.trim(),
      letterDate,
      receivedDate,
      subject: subject.trim(),
      priority,
      disposedBy,
      targetAudience: selectedTargets.length > 0 ? selectedTargets : ['Waka Kurikulum'],
      instruction: selectedInstructions.length > 0 ? selectedInstructions : ['Tindak lanjuti segera'],
      directorNotes: directorNotes.trim(),
      deadline,
      status,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {disposition ? 'Ubah Lembar Disposisi Kedinasan' : 'Input Lembar Disposisi Baru'}
              </h3>
              <p className="text-xs text-slate-500">Standar Lembar Disposisi Surat Dinas & Arahan Pimpinan</p>
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
          <form id="disposition-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Top row: Agenda & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. Agenda / Surat Masuk *</label>
                <input
                  type="text"
                  required
                  placeholder="AG-2026/X/042"
                  value={agendaNumber}
                  onChange={(e) => setAgendaNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sifat / Prioritas Surat *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as DispositionPriority)}
                  className={`w-full px-3.5 py-2 text-xs font-extrabold border rounded-xl bg-white focus:ring-2 focus:ring-blue-500 ${
                    priority === 'Sangat Segera'
                      ? 'border-rose-300 text-rose-700 bg-rose-50/40'
                      : priority === 'Segera'
                      ? 'border-amber-300 text-amber-700 bg-amber-50/40'
                      : 'border-slate-300 text-slate-700'
                  }`}
                >
                  <option value="Sangat Segera">Sangat Segera (Kilat)</option>
                  <option value="Segera">Segera (Penting)</option>
                  <option value="Biasa">Biasa (Rutin)</option>
                  <option value="Rahasia">Rahasia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Disposisi</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DispositionRecord['status'])}
                  className="w-full px-3.5 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Sedang Ditindaklanjuti">Sedang Ditindaklanjuti</option>
                  <option value="Belum Diproses">Belum Diproses</option>
                  <option value="Tuntas">Tuntas & Selesai</option>
                </select>
              </div>
            </div>

            {/* Asal Surat & No Surat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Surat Dari / Pengirim Dokumen *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Cabang Dinas Pendidikan Wil. I / Yayasan PGRI"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Surat Dinas / Naskah *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: 421.3/1452/Cadisdik.Wil.I/2026"
                  value={letterNumber}
                  onChange={(e) => setLetterNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Dates: Letter Date, Received Date, Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Surat</label>
                <input
                  type="date"
                  value={letterDate}
                  onChange={(e) => setLetterDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Diterima Sekolah</label>
                <input
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batas Waktu Penyelesaian</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-mono font-bold text-rose-700"
                />
              </div>
            </div>

            {/* Subject / Perihal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Perihal / Ringkasan Isi Surat *</label>
              <textarea
                rows={2}
                required
                placeholder="Tuliskan pokok perihal surat atau ringkasan disposisi..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
              />
            </div>

            {/* Disposed By */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pejabat Pemberi Disposisi</label>
              <input
                type="text"
                value={disposedBy}
                onChange={(e) => setDisposedBy(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
              />
            </div>

            {/* Diteruskan Kepada (Target Audience Checklist) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span>Diteruskan / Didisposisikan Kepada (Checklist Penerima):</span>
                </label>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedTargets.length} Pihak Dipilih
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {COMMON_TARGETS.map((target) => {
                  const isChecked = selectedTargets.includes(target);
                  return (
                    <button
                      key={target}
                      type="button"
                      onClick={() => toggleTarget(target)}
                      className={`text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-100/70 border-blue-300 text-blue-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{target}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom target add */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Tambah penerima disposisi lainnya..."
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTarget())}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTarget}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                >
                  Tambah
                </button>
              </div>
            </div>

            {/* Instruksi / Arahan Checklist */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
              <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-700" />
                <span>Instruksi / Disposisi Pimpinan (Centang yang Berlaku):</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {COMMON_INSTRUCTIONS.map((inst) => {
                  const isChecked = selectedInstructions.includes(inst);
                  return (
                    <button
                      key={inst}
                      type="button"
                      onClick={() => toggleInstruction(inst)}
                      className={`text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-600 border-blue-700 text-white font-bold'
                          : 'bg-white border-blue-200 text-slate-700 hover:bg-blue-50'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-white shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      )}
                      <span>{inst}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Catatan Khusus Pimpinan */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <label className="block text-xs font-bold text-amber-950">
                Catatan / Petunjuk Khusus Kepala Sekolah (Tulis Tangan / Digital):
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan arahan spesifik, penekanan aspek teknis, atau target laporan tertulis..."
                value={directorNotes}
                onChange={(e) => setDirectorNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/80">
          <div>
            {disposition && onOpenPrint && (
              <button
                type="button"
                onClick={() => onOpenPrint(disposition)}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cetak Lembar Disposisi Resmi ke format PDF"
              >
                <Printer className="w-4 h-4 text-blue-700" />
                <span>Cetak Lembar Disposisi</span>
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
              form="disposition-form"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Lembar Disposisi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
