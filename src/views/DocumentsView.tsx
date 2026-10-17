import { useState } from 'react';
import { DocumentItem, DocumentType, GradePhase, DocStatus } from '../types';
import {
  FileText,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Download,
  Eye,
  FileCheck,
  BookOpen,
  Layers
} from 'lucide-react';
import { broadcastToast } from '../services/notificationService';

interface DocumentsViewProps {
  documents: DocumentItem[];
  onOpenCreate: () => void;
  onSelectDoc: (doc: DocumentItem) => void;
  onAnalyzeDocAI: (doc: DocumentItem) => void;
  onUpdateStatus: (id: string, newStatus: DocStatus) => void;
}

export function DocumentsView({
  documents,
  onOpenCreate,
  onSelectDoc,
  onAnalyzeDocAI,
  onUpdateStatus,
}: DocumentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.authorTeacher.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesPhase = selectedPhase === 'all' || doc.phase === selectedPhase;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;

    return matchesSearch && matchesType && matchesPhase && matchesStatus;
  });

  const verifiedCount = documents.filter((d) => d.status === 'verified').length;
  const pendingCount = documents.filter((d) => d.status === 'pending').length;
  const revisionCount = documents.filter((d) => d.status === 'revision').length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Manajemen Dokumen & Perangkat Ajar Kurikulum
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            KOSP 2026/2027, Capaian Pembelajaran, Alur Tujuan Pembelajaran (ATP), Modul Ajar, dan Modul Projek P5
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Unggah Perangkat Baru
        </button>
      </div>

      {/* Status Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Berkas</div>
          <div className="text-xl font-extrabold text-slate-900">{documents.length}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Tervalidasi Sah
          </div>
          <div className="text-xl font-extrabold text-emerald-900">{verifiedCount}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Perlu Revisi
          </div>
          <div className="text-xl font-extrabold text-amber-900">{revisionCount}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Telaah
          </div>
          <div className="text-xl font-extrabold text-slate-800">{pendingCount}</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan judul perangkat, mata pelajaran, atau nama guru..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Filter Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Jenis Dokumen</option>
              <option value="KOSP">KOSP</option>
              <option value="Modul Ajar">Modul Ajar</option>
              <option value="ATP">ATP</option>
              <option value="Modul P5">Modul P5</option>
              <option value="Panduan Asesmen">Panduan Asesmen</option>
              <option value="Bank Soal">Bank Soal</option>
              <option value="SK Pembagian Tugas">SK Pembagian Tugas</option>
            </select>

            {/* Filter Phase */}
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Fase / Tingkat</option>
              <option value="Fase E (Kelas X)">Fase E (Kelas X)</option>
              <option value="Fase F (Kelas XI)">Fase F (Kelas XI)</option>
              <option value="Fase F (Kelas XII)">Fase F (Kelas XII)</option>
              <option value="Semua Tingkat">Semua Tingkat</option>
            </select>

            {/* Filter Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Status</option>
              <option value="verified">Tervalidasi Sah</option>
              <option value="revision">Perlu Revisi</option>
              <option value="pending">Menunggu Reviu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">Tidak ada dokumen yang sesuai</h4>
            <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Badges top */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                    {doc.type}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      doc.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : doc.status === 'revision'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {doc.status === 'verified' && <CheckCircle2 className="w-3 h-3" />}
                    {doc.status === 'revision' && <AlertCircle className="w-3 h-3" />}
                    {doc.status === 'pending' && <Clock className="w-3 h-3" />}
                    {doc.status === 'verified'
                      ? 'Sah / Valid'
                      : doc.status === 'revision'
                      ? 'Perlu Revisi'
                      : 'Menunggu'}
                  </span>
                </div>

                <h3
                  onClick={() => onSelectDoc(doc)}
                  className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer leading-snug"
                >
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {doc.description}
                </p>

                {/* Subject & Teacher tag */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Mapel:</span>
                    <span className="font-semibold text-slate-800 truncate">{doc.subject}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Fase/Tingkat:</span>
                    <span className="font-medium text-emerald-700">{doc.phase}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Penyusun:</span>
                    <span className="font-medium text-slate-700 truncate">{doc.authorTeacher}</span>
                  </div>
                </div>

                {doc.learningObjectives && doc.learningObjectives.length > 0 && (
                  <div className="mt-2.5 flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{doc.learningObjectives.length} Tujuan Pembelajaran</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                <button
                  onClick={() => onSelectDoc(doc)}
                  className="px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Lihat Pratinjau Dokumen"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Detail</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAnalyzeDocAI(doc)}
                    className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 hover:text-amber-800 transition-colors cursor-pointer"
                    title="Kaji Dokumen dengan AI Kurikulum"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      broadcastToast({
                        title: 'Mengunduh Dokumen',
                        message: `Mengunduh berkas ${doc.title} (${doc.fileSize})...`,
                        type: 'info',
                      });
                    }}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Unduh Berkas"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
