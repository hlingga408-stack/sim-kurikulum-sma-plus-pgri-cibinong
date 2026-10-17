import { useState } from 'react';
import { DocumentItem, DocumentType, GradePhase, DocStatus } from '../types';
import { X, FileText, CheckCircle2, AlertCircle, Clock, Download, Sparkles, Plus } from 'lucide-react';

interface DocumentModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  isCreateMode?: boolean;
  onClose: () => void;
  onSave?: (doc: DocumentItem) => void;
  onAnalyzeAI?: (doc: DocumentItem) => void;
}

export function DocumentModal({
  document,
  isOpen,
  isCreateMode = false,
  onClose,
  onSave,
  onAnalyzeAI,
}: DocumentModalProps) {
  // Form states for creating new document
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DocumentType>('Modul Ajar');
  const [phase, setPhase] = useState<GradePhase>('Fase E (Kelas X)');
  const [subject, setSubject] = useState('');
  const [authorTeacher, setAuthorTeacher] = useState('');
  const [description, setDescription] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !authorTeacher) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title,
      type,
      phase,
      subject,
      authorTeacher,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      fileSize: '1.2 MB',
      version: 'v1.0 Draf',
      description,
      learningObjectives: learningObjectives
        ? learningObjectives.split('\n').filter((line) => line.trim().length > 0)
        : [],
    };

    if (onSave) onSave(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isCreateMode ? 'Unggah Perangkat / Dokumen Kurikulum' : 'Detail Dokumen Kurikulum'}
              </h3>
              <p className="text-xs text-slate-500">SMA Plus PGRI Cibinong • Kurikulum Merdeka</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isCreateMode ? (
            <form id="doc-form" onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Dokumen / Modul *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Modul Ajar Fisika: Dinamika Gerak Berdiferensiasi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Dokumen</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DocumentType)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Modul Ajar">Modul Ajar</option>
                    <option value="ATP">ATP (Alur Tujuan Pembelajaran)</option>
                    <option value="KOSP">KOSP</option>
                    <option value="Panduan Asesmen">Panduan Asesmen</option>
                    <option value="Modul P5">Modul P5</option>
                    <option value="Bank Soal">Bank Soal</option>
                    <option value="SK Pembagian Tugas">SK Pembagian Tugas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fase / Tingkat</label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value as GradePhase)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Fase E (Kelas X)">Fase E (Kelas X)</option>
                    <option value="Fase F (Kelas XI)">Fase F (Kelas XI)</option>
                    <option value="Fase F (Kelas XII)">Fase F (Kelas XII)</option>
                    <option value="Semua Tingkat">Semua Tingkat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Matematika, Kimia, Informatika"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Guru / Penyusun *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap & gelar"
                    value={authorTeacher}
                    onChange={(e) => setAuthorTeacher(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat Dokumen</label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan ringkas isi modul, pendekatan, atau capaian pembelajaran..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tujuan Pembelajaran (Satu baris per tujuan)
                </label>
                <textarea
                  rows={3}
                  placeholder="Peserta didik mampu menganalisis...&#10;Peserta didik merancang..."
                  value={learningObjectives}
                  onChange={(e) => setLearningObjectives(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-xs"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 flex flex-col items-center justify-center text-center">
                <FileText className="w-8 h-8 text-emerald-600 mb-1" />
                <p className="text-xs font-semibold text-slate-800">Simulasi File PDF / DOCX Perangkat Ajar</p>
                <p className="text-[11px] text-slate-500">File tersinkronisasi dengan repositori awan kurikulum sekolah.</p>
              </div>
            </form>
          ) : (
            document && (
              <div className="space-y-5">
                {/* Meta Header */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      {document.type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {document.phase}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        document.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : document.status === 'revision'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {document.status === 'verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {document.status === 'revision' && <AlertCircle className="w-3.5 h-3.5" />}
                      {document.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                      {document.status === 'verified'
                        ? 'Diverifikasi'
                        : document.status === 'revision'
                        ? 'Perlu Revisi'
                        : 'Menunggu Reviu'}
                    </span>
                  </div>

                  <h2 className="text-lg font-extrabold text-slate-900 leading-snug">{document.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Mata Pelajaran: <span className="font-semibold text-slate-800">{document.subject}</span> • Penyusun:{' '}
                    <span className="font-semibold text-slate-800">{document.authorTeacher}</span> • Versi:{' '}
                    <span className="font-mono text-emerald-700">{document.version}</span>
                  </p>
                </div>

                {/* Description */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Deskripsi</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{document.description}</p>
                </div>

                {/* Learning Objectives */}
                {document.learningObjectives && document.learningObjectives.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Tujuan Pembelajaran Terpetakan
                    </h4>
                    <ul className="space-y-1.5">
                      {document.learningObjectives.map((tp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{tp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reviewer Notes */}
                {document.reviewerNotes && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Catatan Telaah Tim Kurikulum:
                    </h4>
                    <p className="text-xs text-amber-900/90">{document.reviewerNotes}</p>
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/80">
          {isCreateMode ? (
            <div className="flex items-center justify-end w-full gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                form="doc-form"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Simpan Dokumen
              </button>
            </div>
          ) : (
            document && (
              <>
                <button
                  onClick={() => {
                    if (onAnalyzeAI) {
                      onAnalyzeAI(document);
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  Kaji dengan AI Asisten
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      alert(`Mengunduh berkas salinan resmi: ${document.title} (${document.fileSize})`);
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Unduh Berkas
                  </button>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
