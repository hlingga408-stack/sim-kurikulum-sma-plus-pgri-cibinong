import { useState, useEffect } from 'react';
import { MeetingRecord, MeetingType } from '../types';
import { X, Users, Calendar, Clock, MapPin, FileText, CheckCircle2, Printer, Sparkles } from 'lucide-react';
import { broadcastToast } from '../services/notificationService';

interface MeetingModalProps {
  meeting: MeetingRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: MeetingRecord) => void;
  onOpenPrint?: (meeting: MeetingRecord) => void;
}

export function MeetingModal({ meeting, isOpen, onClose, onSave, onOpenPrint }: MeetingModalProps) {
  const [documentNumber, setDocumentNumber] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MeetingType>('Rapat Dewan Guru');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:30 - 11:30 WIB');
  const [location, setLocation] = useState('Ruang Rapat Utama Lt. 2');
  const [leader, setLeader] = useState("Dr. Hj. Nina Nur'aeni, M.Pd. (Kepala Sekolah)");
  const [noteTaker, setNoteTaker] = useState('Bambang Irawan, S.Pd. (Waka Kurikulum)');
  const [attendeesCount, setAttendeesCount] = useState(45);
  const [attendeesList, setAttendeesList] = useState('');
  const [agenda, setAgenda] = useState('');
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [decisions, setDecisions] = useState('');
  const [status, setStatus] = useState<MeetingRecord['status']>('Terlaksana');
  const [academicYear, setAcademicYear] = useState('2024/2025');

  useEffect(() => {
    if (meeting) {
      setDocumentNumber(meeting.documentNumber || '');
      setTitle(meeting.title);
      setType(meeting.type);
      setDate(meeting.date);
      setTime(meeting.time);
      setLocation(meeting.location);
      setLeader(meeting.leader);
      setNoteTaker(meeting.noteTaker);
      setAttendeesCount(meeting.attendeesCount);
      setAttendeesList(meeting.attendeesList);
      setAgenda(meeting.agenda);
      setDiscussionNotes(meeting.discussionNotes);
      setDecisions(meeting.decisions);
      setStatus(meeting.status);
      setAcademicYear(meeting.academicYear || '2024/2025');
    } else {
      const randomNum = Math.floor(Math.random() * 80 + 20);
      setDocumentNumber(`421.3/${randomNum.toString().padStart(3, '0')}/SMAPLUS-PGRI/X/2026`);
      setTitle('');
      setType('Rapat Dewan Guru');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('08:30 - 11:30 WIB');
      setLocation('Ruang Rapat Utama & Virtual Hybrid');
      setLeader("Dr. Hj. Nina Nur'aeni, M.Pd. (Kepala Sekolah)");
      setNoteTaker('Bambang Irawan, S.Pd. (Waka Kurikulum)');
      setAttendeesCount(50);
      setAttendeesList('Seluruh Dewan Guru Mata Pelajaran, Wali Kelas, dan Tim Pengembang Kurikulum.');
      setAgenda('1. Pembukaan oleh Kepala Sekolah\n2. Evaluasi Capaian Pembelajaran & Modul Ajar\n3. Pembahasan Kendala & Kebutuhan Fasilitas\n4. Kesepakatan Jadwal & Rencana Tindak Lanjut');
      setDiscussionNotes('Pembahasan berlangsung aktif dengan paparan ketercapaian target kurikulum. Semua perwakilan rumpun mata pelajaran menyampaikan rekapitulasi progres.');
      setDecisions('1. Seluruh dewan guru menuntaskan asesmen tepat waktu.\n2. Rencana tindak lanjut klinis dikoordinasikan oleh Waka Kurikulum.');
      setStatus('Terlaksana');
      setAcademicYear('2024/2025');
    }
  }, [meeting, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      broadcastToast({
        title: 'Judul Wajib Diisi',
        message: 'Silakan isi agenda atau nama rapat terlebih dahulu.',
        type: 'alert',
      });
      return;
    }

    const updated: MeetingRecord = {
      id: meeting?.id || `meet-${Date.now()}`,
      documentNumber: documentNumber.trim() || `421.3/NOTULEN/SMAPLUS-PGRI/${new Date().getFullYear()}`,
      title: title.trim(),
      type,
      date,
      time,
      location,
      leader,
      noteTaker,
      attendeesCount: Number(attendeesCount) || 0,
      attendeesList: attendeesList.trim(),
      agenda: agenda.trim(),
      discussionNotes: discussionNotes.trim(),
      decisions: decisions.trim(),
      status,
      academicYear,
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
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {meeting ? 'Detail & Ubah Notulen Rapat' : 'Input Rapat & Notulensi Baru'}
              </h3>
              <p className="text-xs text-slate-500">Administrasi Resmi Berita Acara & Notulensi Rapat Sekolah</p>
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
          <form id="meeting-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Top row: Doc Number & Academic Year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Dokumen / Surat Undangan Rapat *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: 421.3/088/SMAPLUS-PGRI/X/2026"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tahun Ajaran (Manual)
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2024/2025"
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* Title / Agenda */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Agenda Pokok / Nama Kegiatan Rapat *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Rapat Koordinasi Evaluasi Tengah Semester & Validasi Perangkat Ajar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
              />
            </div>

            {/* Type & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Klasifikasi Jenis Rapat</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as MeetingType)}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Rapat Dewan Guru">Rapat Dewan Guru</option>
                  <option value="Rapat Kurikulum">Rapat Kurikulum</option>
                  <option value="Rapat Koordinasi Pimpinan">Rapat Koordinasi Pimpinan</option>
                  <option value="Rapat Pleno KOSP">Rapat Pleno KOSP</option>
                  <option value="Rapat Orang Tua / Komite">Rapat Orang Tua / Komite</option>
                  <option value="Rapat MGMP">Rapat MGMP</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Keterlaksanaan</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MeetingRecord['status'])}
                  className="w-full px-3.5 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Terlaksana">Terlaksana (Notulensi Lengkap)</option>
                  <option value="Dalam Proses">Dalam Proses Pelaksanaan</option>
                  <option value="Dijadwalkan">Dijadwalkan (Agenda Mendatang)</option>
                </select>
              </div>
            </div>

            {/* Date, Time, Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Rapat</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Waktu / Jam Sesi</label>
                <input
                  type="text"
                  placeholder="08:30 - 11:30 WIB"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tempat / Ruangan</label>
                <input
                  type="text"
                  placeholder="Ruang Rapat Utama Lt. 2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* Leader & NoteTaker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pimpinan Rapat</label>
                <input
                  type="text"
                  value={leader}
                  onChange={(e) => setLeader(e.target.value)}
                  placeholder="Nama & Gelar Pimpinan"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notulis Rapat</label>
                <input
                  type="text"
                  value={noteTaker}
                  onChange={(e) => setNoteTaker(e.target.value)}
                  placeholder="Nama & Gelar Notulis"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
                />
              </div>
            </div>

            {/* Attendees */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Daftar Peserta Hadir</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600">Jumlah Hadir:</span>
                  <input
                    type="number"
                    min="1"
                    value={attendeesCount}
                    onChange={(e) => setAttendeesCount(Number(e.target.value))}
                    className="w-16 px-2 py-0.5 text-xs font-mono font-bold border border-slate-300 rounded-lg text-center bg-white"
                  />
                  <span className="text-[11px] text-slate-500">Orang</span>
                </div>
              </div>
              <textarea
                rows={2}
                value={attendeesList}
                onChange={(e) => setAttendeesList(e.target.value)}
                placeholder="Tuliskan daftar unsur atau nama peserta yang hadir (misal: Seluruh Dewan Guru Mata Pelajaran, Wali Kelas X-XII, Tim Kurikulum)..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            {/* Agenda Structure */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Susunan Acara / Agenda Rapat</label>
              <textarea
                rows={3}
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="1. Pembukaan&#10;2. Pengarahan Kepala Sekolah&#10;3. Pembahasan Inti Agenda&#10;4. Tanya Jawab & Kesimpulan"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            {/* Discussion Notes / Notulensi Rapat */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
              <label className="block text-xs font-bold text-indigo-950">
                Uraian Notulensi & Pembahasan Jalannya Rapat *
              </label>
              <p className="text-[11px] text-indigo-900/80">
                Catat poin-poin utama diskusi, pandangan peserta, kendala yang disampaikan, serta tanggapan pimpinan rapat.
              </p>
              <textarea
                rows={5}
                required
                value={discussionNotes}
                onChange={(e) => setDiscussionNotes(e.target.value)}
                placeholder="Tuliskan jalannya diskusi rapat secara terperinci..."
                className="w-full px-3.5 py-2 text-xs border border-indigo-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 text-slate-800 font-sans"
              />
            </div>

            {/* Decisions / Kesimpulan Rapat */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
              <label className="block text-xs font-bold text-emerald-950">
                Keputusan & Kesepakatan Resmi Rapat *
              </label>
              <p className="text-[11px] text-emerald-900/80">
                Tuliskan butir-butir keputusan final yang disepakati bersama sebagai landasan eksekusi program.
              </p>
              <textarea
                rows={3}
                required
                value={decisions}
                onChange={(e) => setDecisions(e.target.value)}
                placeholder="1. Seluruh kisi-kisi dan naskah ujian diserahkan paling lambat tanggal...&#10;2. Rencana pendampingan klinis dimulai pada..."
                className="w-full px-3.5 py-2 text-xs border border-emerald-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/80">
          <div>
            {meeting && onOpenPrint && (
              <button
                type="button"
                onClick={() => onOpenPrint(meeting)}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cetak Berita Acara & Notulen Rapat ke format PDF resmi"
              >
                <Printer className="w-4 h-4 text-indigo-700" />
                <span>Cetak PDF Notulen</span>
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
              form="meeting-form"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Notulen Rapat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
