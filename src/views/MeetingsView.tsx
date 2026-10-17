import { useState } from 'react';
import {
  MeetingRecord,
  DispositionRecord,
  MeetingFollowUpRecord,
  MeetingType,
  DispositionPriority,
} from '../types';
import {
  MessageSquareText,
  FileText,
  Send,
  Target,
  Plus,
  Search,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  FolderOpen,
  Edit3,
  Trash2,
  Tag,
  CheckSquare,
  Square,
  FileCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { broadcastToast } from '../services/notificationService';

interface MeetingsViewProps {
  meetings: MeetingRecord[];
  dispositions: DispositionRecord[];
  rtls: MeetingFollowUpRecord[];
  onOpenCreateMeeting: () => void;
  onOpenEditMeeting: (meeting: MeetingRecord) => void;
  onDeleteMeeting: (id: string) => void;
  onOpenCreateDisposition: () => void;
  onOpenEditDisposition: (disposition: DispositionRecord) => void;
  onDeleteDisposition: (id: string) => void;
  onOpenCreateRtl: () => void;
  onOpenEditRtl: (rtl: MeetingFollowUpRecord) => void;
  onDeleteRtl: (id: string) => void;
  onToggleRtlStatus: (id: string) => void;
  onOpenPrintModal: (docType: 'meeting' | 'disposition' | 'rtl', recordId?: string) => void;
}

export function MeetingsView({
  meetings,
  dispositions,
  rtls,
  onOpenCreateMeeting,
  onOpenEditMeeting,
  onDeleteMeeting,
  onOpenCreateDisposition,
  onOpenEditDisposition,
  onDeleteDisposition,
  onOpenCreateRtl,
  onOpenEditRtl,
  onDeleteRtl,
  onToggleRtlStatus,
  onOpenPrintModal,
}: MeetingsViewProps) {
  const [activeTab, setActiveTab] = useState<'meetings' | 'dispositions' | 'rtl'>('meetings');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeetingType, setSelectedMeetingType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedRtlStatus, setSelectedRtlStatus] = useState<string>('all');

  // Stats calculation
  const completedMeetingsCount = meetings.filter((m) => m.status === 'Terlaksana').length;
  const activeDispositionsCount = dispositions.filter((d) => d.status !== 'Tuntas').length;
  const urgentDispositionsCount = dispositions.filter((d) => d.priority === 'Sangat Segera').length;
  const completedRtlCount = rtls.filter((r) => r.status === 'Tuntas & Terverifikasi').length;
  const avgRtlProgress = Math.round(
    rtls.reduce((acc, r) => acc + r.progress, 0) / (rtls.length || 1)
  );

  // Filtered lists
  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.discussionNotes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedMeetingType === 'all' || m.type === selectedMeetingType;
    return matchesSearch && matchesType;
  });

  const filteredDispositions = dispositions.filter((d) => {
    const matchesSearch =
      d.agendaNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.letterNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || d.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const filteredRtls = rtls.filter((r) => {
    const matchesSearch =
      r.actionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.pic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sourceReference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedRtlStatus === 'all' || r.status === selectedRtlStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareText className="w-6 h-6 text-indigo-600" />
            <span>Manajemen Rapat, Disposisi & RTL</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Notulen Berita Acara, Lembar Disposisi Kedinasan, dan Matriks Rencana Tindak Lanjut SMA Plus PGRI Cibinong
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onOpenPrintModal(activeTab === 'meetings' ? 'meeting' : activeTab === 'dispositions' ? 'disposition' : 'rtl')}
            className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cetak & Unduh Dokumen Resmi dengan Kop Sekolah (PDF)"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak Dokumen PDF (Kop Resmi)</span>
          </button>

          {activeTab === 'meetings' && (
            <button
              onClick={onOpenCreateMeeting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Rapat Baru</span>
            </button>
          )}

          {activeTab === 'dispositions' && (
            <button
              onClick={onOpenCreateDisposition}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Disposisi Baru</span>
            </button>
          )}

          {activeTab === 'rtl' && (
            <button
              onClick={onOpenCreateRtl}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input RTL Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
            Total Rapat Notulen
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {meetings.length} <span className="text-xs font-semibold text-slate-500">Agenda</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1 truncate">
            {completedMeetingsCount} Terlaksana resmi
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
            Lembar Disposisi Aktif
          </div>
          <div className="text-2xl font-extrabold text-blue-900 font-mono">
            {activeDispositionsCount} <span className="text-xs font-semibold text-slate-500">Surat</span>
          </div>
          <p className="text-[11px] text-rose-700 font-bold mt-1 truncate">
            {urgentDispositionsCount} Disposisi Sangat Segera
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-teal-700 uppercase tracking-wider mb-1">
            RTL Tuntas & Sah
          </div>
          <div className="text-2xl font-extrabold text-teal-900 font-mono">
            {completedRtlCount} <span className="text-xs font-semibold text-slate-500">/ {rtls.length}</span>
          </div>
          <p className="text-[11px] text-teal-800 font-medium mt-1 truncate">
            Rata-rata progres {avgRtlProgress}%
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs">
          <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">
            Kepatuhan Administrasi
          </div>
          <div className="text-2xl font-extrabold text-amber-950 font-mono">
            100% <span className="text-xs font-semibold text-amber-800">Siap PDF</span>
          </div>
          <p className="text-[11px] text-amber-800 font-medium mt-1 truncate">
            Kop Resmi & Arsip Digital
          </p>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-2xl shadow-2xs">
        <button
          onClick={() => setActiveTab('meetings')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'meetings'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Rapat & Notulensi ({meetings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dispositions')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'dispositions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>2. Lembar Disposisi Kedinasan ({dispositions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rtl')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'rtl'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>3. Rencana Tindak Lanjut (RTL) ({rtls.length})</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'meetings'
                ? 'Cari nama rapat, nomor dokumen, pimpinan, atau notulensi...'
                : activeTab === 'dispositions'
                ? 'Cari nomor agenda, pengirim surat, atau perihal disposisi...'
                : 'Cari uraian tindak lanjut atau penanggung jawab (PIC)...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {activeTab === 'meetings' && (
            <select
              value={selectedMeetingType}
              onChange={(e) => setSelectedMeetingType(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Jenis Rapat</option>
              <option value="Rapat Dewan Guru">Rapat Dewan Guru</option>
              <option value="Rapat Kurikulum">Rapat Kurikulum</option>
              <option value="Rapat Koordinasi Pimpinan">Rapat Koordinasi Pimpinan</option>
              <option value="Rapat Pleno KOSP">Rapat Pleno KOSP</option>
              <option value="Rapat Orang Tua / Komite">Rapat Orang Tua / Komite</option>
              <option value="Rapat MGMP">Rapat MGMP</option>
            </select>
          )}

          {activeTab === 'dispositions' && (
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Sifat Surat</option>
              <option value="Sangat Segera">Sangat Segera</option>
              <option value="Segera">Segera</option>
              <option value="Biasa">Biasa</option>
              <option value="Rahasia">Rahasia</option>
            </select>
          )}

          {activeTab === 'rtl' && (
            <select
              value={selectedRtlStatus}
              onChange={(e) => setSelectedRtlStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Semua Status RTL</option>
              <option value="Tuntas & Terverifikasi">Tuntas & Terverifikasi</option>
              <option value="Sedang Berjalan">Sedang Berjalan</option>
              <option value="Belum Mulai">Belum Mulai</option>
            </select>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. MEETINGS / NOTULEN TAB CONTENT                              */}
      {/* ============================================================== */}
      {activeTab === 'meetings' && (
        <div className="space-y-4">
          {filteredMeetings.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
              <FileText className="w-10 h-10 mx-auto text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800">Belum Ada Catatan Rapat</h3>
              <p className="text-xs text-slate-500">
                Silakan klik tombol &quot;Input Rapat Baru&quot; untuk mencatat notulen dan berita acara rapat.
              </p>
              <button
                onClick={onOpenCreateMeeting}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Input Rapat Baru</span>
              </button>
            </div>
          ) : (
            filteredMeetings.map((m) => (
              <div
                key={m.id}
                className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
                        {m.documentNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                        {m.type}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          m.status === 'Terlaksana'
                            ? 'bg-emerald-100 text-emerald-900'
                            : m.status === 'Dalam Proses'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {m.status}
                      </span>
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        TA {m.academicYear || '2024/2025'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">{m.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        {m.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {m.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {m.location}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        {m.attendeesCount} Peserta Hadir
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => onOpenPrintModal('meeting', m.id)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Cetak Berita Acara & Notulen Rapat ke format PDF resmi dengan kop"
                    >
                      <Printer className="w-3.5 h-3.5 text-purple-700" />
                      <span>Cetak PDF</span>
                    </button>
                    <button
                      onClick={() => onOpenEditMeeting(m)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ubah</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus notulen rapat "${m.title}"?`)) {
                          onDeleteMeeting(m.id);
                        }
                      }}
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Hapus Notulen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notulensi & Keputusan Summary Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                    <span className="font-bold text-indigo-950 block">Poin Risalah / Notulensi:</span>
                    <p className="text-slate-800 leading-relaxed line-clamp-3 font-sans">
                      {m.discussionNotes}
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
                    <span className="font-bold text-emerald-950 block">Keputusan & Kesepakatan:</span>
                    <p className="text-slate-900 leading-relaxed line-clamp-3 font-medium">
                      {m.decisions}
                    </p>
                  </div>
                </div>

                {/* Footer strip: Pimpinan & Notulis */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Pimpinan: <strong className="text-slate-800">{m.leader}</strong></span>
                  <span>Notulis: <strong className="text-slate-800">{m.noteTaker}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. DISPOSITIONS TAB CONTENT                                    */}
      {/* ============================================================== */}
      {activeTab === 'dispositions' && (
        <div className="space-y-4">
          {filteredDispositions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
              <Send className="w-10 h-10 mx-auto text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800">Belum Ada Lembar Disposisi</h3>
              <p className="text-xs text-slate-500">
                Silakan klik &quot;Input Disposisi Baru&quot; untuk mengelola surat masuk dan arahan pimpinan sekolah.
              </p>
              <button
                onClick={onOpenCreateDisposition}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Input Disposisi Baru</span>
              </button>
            </div>
          ) : (
            filteredDispositions.map((d) => (
              <div
                key={d.id}
                className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                        {d.agendaNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                          d.priority === 'Sangat Segera'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : d.priority === 'Segera'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Sifat: {d.priority}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          d.status === 'Tuntas'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">{d.subject}</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Asal Surat: <strong className="text-slate-800">{d.source}</strong> • No. Surat:{' '}
                      <span className="font-mono">{d.letterNumber}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => onOpenPrintModal('disposition', d.id)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Cetak Lembar Disposisi Resmi ke format PDF"
                    >
                      <Printer className="w-3.5 h-3.5 text-purple-700" />
                      <span>Cetak Lembar Disposisi</span>
                    </button>
                    <button
                      onClick={() => onOpenEditDisposition(d)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ubah</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus lembar disposisi "${d.agendaNumber}"?`)) {
                          onDeleteDisposition(d.id);
                        }
                      }}
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Hapus Disposisi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Target & Instructions Matrix Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Diteruskan Kepada Yth:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {d.targetAudience?.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-300 font-semibold text-slate-800 text-[11px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Instruksi Disposisi Kepala Sekolah:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {d.instruction?.map((inst) => (
                        <span
                          key={inst}
                          className="px-2 py-0.5 rounded-md bg-blue-100/80 border border-blue-200 font-bold text-blue-900 text-[11px]"
                        >
                          ✓ {inst}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Director Notes */}
                {d.directorNotes && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                    <span className="font-bold text-amber-950 block mb-0.5">
                      Catatan Khusus Kepala Sekolah:
                    </span>
                    <p className="text-slate-800 font-serif italic">&quot;{d.directorNotes}&quot;</p>
                  </div>
                )}

                {/* Meta footer: Dates */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Diterima: <strong className="text-slate-700">{d.receivedDate}</strong></span>
                  <span>Batas Waktu Selesai: <strong className="text-rose-700">{d.deadline}</strong></span>
                  <span>Disposisi Oleh: <strong className="text-slate-800">{d.disposedBy}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. RTL (RENCANA TINDAK LANJUT) TAB CONTENT                     */}
      {/* ============================================================== */}
      {activeTab === 'rtl' && (
        <div className="space-y-4">
          {filteredRtls.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
              <Target className="w-10 h-10 mx-auto text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800">Belum Ada Rencana Tindak Lanjut</h3>
              <p className="text-xs text-slate-500">
                Silakan klik &quot;Input RTL Baru&quot; untuk menyusun program tindak lanjut hasil rapat atau disposisi.
              </p>
              <button
                onClick={onOpenCreateRtl}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Input RTL Baru</span>
              </button>
            </div>
          ) : (
            filteredRtls.map((r) => (
              <div
                key={r.id}
                className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-200">
                        {r.sourceType}
                      </span>
                      <span className="text-xs font-medium text-slate-600">
                        Rujukan: <strong className="text-slate-800">{r.sourceReference}</strong>
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          r.status === 'Tuntas & Terverifikasi'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Sedang Berjalan'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">{r.actionTitle}</h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => onOpenPrintModal('rtl', r.id)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Cetak Matriks RTL Resmi ke format PDF"
                    >
                      <Printer className="w-3.5 h-3.5 text-purple-700" />
                      <span>Cetak PDF</span>
                    </button>
                    <button
                      onClick={() => onOpenEditRtl(r)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ubah</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus RTL "${r.actionTitle}"?`)) {
                          onDeleteRtl(r.id);
                        }
                      }}
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Hapus RTL"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">Tingkat Penyelesaian RTL:</span>
                    <span className="font-mono font-extrabold text-sm text-teal-800">{r.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        r.progress === 100
                          ? 'bg-emerald-600'
                          : r.progress >= 50
                          ? 'bg-teal-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${r.progress}%` }}
                    />
                  </div>
                </div>

                {/* Details grid: PIC, Target, Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Penanggung Jawab (PIC)
                    </span>
                    <span className="font-bold text-slate-800">{r.pic}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Target Waktu Selesai
                    </span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      {r.targetDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Fasilitas / Anggaran
                    </span>
                    <span className="text-slate-800 truncate block">
                      {r.resourcesNeeded || 'Sesuai standar operasional'}
                    </span>
                  </div>
                </div>

                {/* Evidence link (Google Drive) */}
                {r.evidenceLink ? (
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-blue-950 block">Bukti Fisik & LPJ Hasil RTL (Google Drive)</span>
                        <span className="text-[11px] font-mono text-blue-800/80 truncate block">{r.evidenceLink}</span>
                      </div>
                    </div>
                    <a
                      href={r.evidenceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Google Drive</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                      Belum ada tautan berkas LPJ Google Drive.
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenEditRtl(r)}
                      className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer"
                    >
                      + Input Link Drive
                    </button>
                  </div>
                )}

                {/* Toggle status quick action */}
                <div className="flex items-center justify-between pt-1">
                  {r.notes ? (
                    <span className="text-[11px] text-slate-500 italic">
                      Catatan: &quot;{r.notes}&quot;
                    </span>
                  ) : <span />}

                  <button
                    onClick={() => onToggleRtlStatus(r.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                      r.status === 'Tuntas & Terverifikasi'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    }`}
                  >
                    {r.status === 'Tuntas & Terverifikasi' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>RTL Tuntas & Terverifikasi</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>{r.status} (Klik jika Tuntas)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
