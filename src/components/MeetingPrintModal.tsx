import { useState, useRef } from 'react';
import { MeetingRecord, DispositionRecord, MeetingFollowUpRecord } from '../types';
import {
  X,
  Printer,
  Download,
  Settings2,
  FileText,
  Send,
  CheckSquare,
  Square,
  Award,
  ChevronDown,
  Building2,
  Lock,
  ExternalLink,
  FolderOpen
} from 'lucide-react';
import { broadcastToast } from '../services/notificationService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export type PrintDocumentType = 'meeting' | 'disposition' | 'rtl';

interface MeetingPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDocType?: PrintDocumentType;
  selectedMeeting?: MeetingRecord | null;
  selectedDisposition?: DispositionRecord | null;
  selectedRtl?: MeetingFollowUpRecord | null;
  meetings: MeetingRecord[];
  dispositions: DispositionRecord[];
  rtls: MeetingFollowUpRecord[];
}

export function MeetingPrintModal({
  isOpen,
  onClose,
  defaultDocType = 'meeting',
  selectedMeeting,
  selectedDisposition,
  selectedRtl,
  meetings,
  dispositions,
  rtls,
}: MeetingPrintModalProps) {
  const [docType, setDocType] = useState<PrintDocumentType>(defaultDocType);
  const [currentMeetingId, setCurrentMeetingId] = useState<string>(
    selectedMeeting?.id || meetings[0]?.id || ''
  );
  const [currentDispositionId, setCurrentDispositionId] = useState<string>(
    selectedDisposition?.id || dispositions[0]?.id || ''
  );
  const [currentRtlId, setCurrentRtlId] = useState<string>(
    selectedRtl?.id || rtls[0]?.id || ''
  );

  // Letterhead customization
  const [showConfig, setShowConfig] = useState(false);
  const [principalName, setPrincipalName] = useState("Dr. Hj. Nina Nur'aeni, M.Pd.");
  const [principalNip, setPrincipalNip] = useState('197204151998022001');
  const [curriculumHead, setCurriculumHead] = useState('Bambang Irawan, S.Pd.');
  const [curriculumHeadNip, setCurriculumHeadNip] = useState('198206102009021004');
  const [reportCity, setReportCity] = useState('Cibinong - Bogor');
  const [reportDate, setReportDate] = useState('16 Oktober 2026');
  const [academicYear, setAcademicYear] = useState('2024/2025');

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentMeeting = meetings.find((m) => m.id === currentMeetingId) || selectedMeeting || meetings[0];
  const currentDisposition = dispositions.find((d) => d.id === currentDispositionId) || selectedDisposition || dispositions[0];
  const currentRtl = rtls.find((r) => r.id === currentRtlId) || selectedRtl || rtls[0];

  const handlePrint = () => {
    window.print();
    broadcastToast({
      title: 'Mencetak Dokumen...',
      message: 'Kotak dialog cetak peramban telah dibuka.',
      type: 'info',
    });
  };

  const handleDownloadPdf = async () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;

    try {
      setIsGeneratingPdf(true);
      broadcastToast({
        title: 'Menyiapkan PDF Resmi...',
        message: 'Sedang merender berkas dokumen kedinasan lengkap dengan kop.',
        type: 'info',
      });

      const isRtlTable = docType === 'rtl';

      const canvas = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: isRtlTable ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      let fileName = 'Dokumen_Resmi_SMA_Plus_PGRI_Cibinong.pdf';
      if (docType === 'meeting' && currentMeeting) {
        fileName = `Notulen_${currentMeeting.type.replace(/\s+/g, '_')}_${currentMeeting.date}.pdf`;
      } else if (docType === 'disposition' && currentDisposition) {
        fileName = `Lembar_Disposisi_${currentDisposition.agendaNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      } else if (docType === 'rtl') {
        fileName = `Matriks_RTL_Rapat_Kurikulum_${academicYear.replace('/', '-')}.pdf`;
      }

      pdf.save(fileName);

      broadcastToast({
        title: 'PDF Berhasil Diunduh!',
        message: `Berkas ${fileName} siap diarsipkan atau dicetak.`,
        type: 'success',
      });
    } catch (err) {
      console.error(err);
      broadcastToast({
        title: 'Gagal Render PDF',
        message: 'Gunakan tombol "Cetak (Print)" untuk mencetak langsung ke PDF melalui peramban.',
        type: 'warning',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-5xl bg-slate-100 rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden border border-slate-300">
        {/* Top Control Bar */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <Printer className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pusat Cetak & Unduh Dokumen PDF Resmi
              </h3>
              <p className="text-xs text-slate-500">
                Kop Resmi Yayasan & Lembaga SMA Plus PGRI Cibinong
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showConfig
                  ? 'bg-purple-50 border-purple-300 text-purple-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Pengaturan Kop & Pengesahan</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak (Print)</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Merender PDF...' : 'Unduh PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Format Selector Bar */}
        <div className="px-4 py-2.5 bg-slate-200/70 border-b border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Pilih Dokumen:</span>
            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-300 shadow-2xs">
              <button
                onClick={() => setDocType('meeting')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  docType === 'meeting'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Notulen Rapat
              </button>
              <button
                onClick={() => setDocType('disposition')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  docType === 'disposition'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Lembar Disposisi
              </button>
              <button
                onClick={() => setDocType('rtl')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  docType === 'rtl'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Matriks RTL
              </button>
            </div>
          </div>

          {/* Record Selector per active DocType */}
          <div className="flex items-center gap-2">
            {docType === 'meeting' && (
              <select
                value={currentMeetingId}
                onChange={(e) => setCurrentMeetingId(e.target.value)}
                className="px-3 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800"
              >
                {meetings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.date})
                  </option>
                ))}
              </select>
            )}

            {docType === 'disposition' && (
              <select
                value={currentDispositionId}
                onChange={(e) => setCurrentDispositionId(e.target.value)}
                className="px-3 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800"
              >
                {dispositions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.agendaNumber} - {d.subject.slice(0, 45)}...
                  </option>
                ))}
              </select>
            )}

            {docType === 'rtl' && (
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span>Total RTL Rapat:</span>
                <span className="font-bold text-teal-800 font-mono bg-teal-100 px-2 py-0.5 rounded">
                  {rtls.length} Kegiatan
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Drawer */}
        {showConfig && (
          <div className="p-4 bg-white border-b border-slate-200 text-xs animate-in slide-in-from-top-2">
            <h4 className="font-bold text-slate-800 mb-2">Penyesuaian Lembar Pengesahan & Kop Sekolah</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kota Penerbitan</label>
                <input
                  type="text"
                  value={reportCity}
                  onChange={(e) => setReportCity(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal Dokumen</label>
                <input
                  type="text"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tahun Ajaran</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={principalNip}
                  onChange={(e) => setPrincipalNip(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Waka Kurikulum</label>
                <input
                  type="text"
                  value={curriculumHead}
                  onChange={(e) => setCurriculumHead(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Printable Viewport Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/80">
          <div
            ref={printAreaRef}
            className={`bg-white shadow-xl p-8 sm:p-12 text-slate-900 border border-slate-300 print:shadow-none print:border-none print:m-0 print:p-6 print:w-full transition-all ${
              docType === 'rtl' ? 'w-full max-w-[297mm]' : 'w-full max-w-[210mm]'
            }`}
            style={{ minHeight: '297mm' }}
          >
            {/* 1. OFFICIAL SCHOOL LETTERHEAD (KOP SURAT RESMI KEDINASAN) */}
            <div className="border-b-2 border-slate-950 pb-3 mb-6">
              <div className="flex items-center gap-4">
                {/* School/PGRI Logo Graphic */}
                <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-18 h-18 drop-shadow-xs">
                    <circle cx="50" cy="50" r="48" fill="#1e3a8a" />
                    <circle cx="50" cy="50" r="44" fill="#ffffff" />
                    <circle cx="50" cy="50" r="39" fill="#dc2626" />
                    <path
                      d="M50 18 L76 34 L76 66 L50 82 L24 66 L24 34 Z"
                      fill="#eab308"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <path
                      d="M36 56 C42 54 48 55 50 57 C52 55 58 54 64 56 L64 64 C58 62 52 63 50 65 C48 63 42 62 36 64 Z"
                      fill="#ffffff"
                      stroke="#1e3a8a"
                      strokeWidth="1.5"
                    />
                    <path d="M50 32 C54 36 56 40 50 46 C44 40 46 36 50 32 Z" fill="#ea580c" />
                    <rect x="48" y="44" width="4" height="12" fill="#78350f" />
                    <polygon points="50,15 52,20 57,20 53,23 55,28 50,25 45,28 47,23 43,20 48,20" fill="#ffffff" />
                  </svg>
                </div>

                {/* Letterhead Official Text */}
                <div className="flex-1 text-center">
                  <h4 className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-800">
                    YAYASAN PEMBINA LEMBAGA PENDIDIKAN (YPLP) DIKDASMEN PGRI JAWA BARAT
                  </h4>
                  <h3 className="text-sm sm:text-base font-bold tracking-wide uppercase text-slate-900">
                    CABANG KABUPATEN BOGOR
                  </h3>
                  <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-950 uppercase my-0.5 font-serif">
                    SMA PLUS PGRI CIBINONG
                  </h1>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-800 tracking-wide uppercase">
                    TERAKREDITASI &quot;A&quot; (UNGGUL) • NPSN: 20231362 • NSS: 302020201072
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-700 leading-tight mt-0.5">
                    Jl. Golf Ciriung No. 2, Ciriung, Kec. Cibinong, Kab. Bogor, Jawa Barat 16918
                    <br />
                    Telepon: (021) 8754122 • Laman: www.smapluspgricibinong.sch.id • Pos-el: kurikulum@smapluspgricibinong.sch.id
                  </p>
                </div>

                {/* Right Quality Badge */}
                <div className="hidden sm:flex flex-col items-center justify-center w-20 shrink-0 text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-indigo-700 bg-indigo-50 text-indigo-900 flex flex-col items-center justify-center font-bold text-[9px] p-1">
                    <Award className="w-4 h-4 text-indigo-700 mb-0.5" />
                    <span>MUTU A</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-600 mt-1 uppercase tracking-tight">
                    Unggul Terakreditasi
                  </span>
                </div>
              </div>

              {/* Official Double Border Line */}
              <div className="mt-2 border-t-2 border-slate-950 pt-[1.5px] border-b border-slate-950" />
            </div>

            {/* ============================================================== */}
            {/* DOCUMENT 1: BERITA ACARA & NOTULEN RAPAT RESMI                 */}
            {/* ============================================================== */}
            {docType === 'meeting' && currentMeeting && (
              <div className="space-y-4 text-xs text-slate-900">
                <div className="text-center my-3">
                  <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-950 underline decoration-slate-900 decoration-1 underline-offset-4">
                    BERITA ACARA & NOTULEN RAPAT DEWAN GURU / KURIKULUM
                  </h2>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    Tahun Ajaran {currentMeeting.academicYear || academicYear}
                  </p>
                  <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                    Nomor: {currentMeeting.documentNumber}
                  </p>
                </div>

                {/* Tabel Identitas Rapat */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wide">
                    I. Data & Pelaksanaan Rapat
                  </div>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="w-1/4 py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Agenda / Topik Rapat</td>
                        <td colSpan={3} className="py-1.5 px-3 font-bold text-slate-950">{currentMeeting.title}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Klasifikasi Rapat</td>
                        <td className="py-1.5 px-3 font-semibold text-indigo-900">{currentMeeting.type}</td>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Status</td>
                        <td className="py-1.5 px-3 font-bold text-emerald-800">{currentMeeting.status}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Hari & Tanggal</td>
                        <td className="py-1.5 px-3 font-medium text-slate-900">{currentMeeting.date}</td>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Waktu / Sesi</td>
                        <td className="py-1.5 px-3 text-slate-900">{currentMeeting.time}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Tempat Pelaksanaan</td>
                        <td colSpan={3} className="py-1.5 px-3 text-slate-900">{currentMeeting.location}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Pimpinan Rapat</td>
                        <td className="py-1.5 px-3 font-semibold text-slate-900">{currentMeeting.leader}</td>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Notulis Rapat</td>
                        <td className="py-1.5 px-3 font-semibold text-slate-900">{currentMeeting.noteTaker}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Jumlah Peserta Hadir</td>
                        <td className="py-1.5 px-3 font-mono font-bold text-slate-900">{currentMeeting.attendeesCount} Orang</td>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Unsur Kehadiran</td>
                        <td className="py-1.5 px-3 text-slate-800">{currentMeeting.attendeesList}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* II. Susunan Acara / Agenda */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wide">
                    II. Susunan Acara & Agenda Rapat
                  </div>
                  <div className="p-3 whitespace-pre-line text-slate-800 leading-relaxed font-sans">
                    {currentMeeting.agenda || '1. Pembukaan oleh Pimpinan Rapat\n2. Pembahasan materi agenda utama\n3. Tanya jawab dan tanggapan peserta\n4. Perumusan kesimpulan dan penutup'}
                  </div>
                </div>

                {/* III. Notulensi Pembahasan Jalannya Rapat */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <div className="bg-indigo-50/80 px-3 py-1.5 font-bold text-indigo-950 border-b border-slate-800 text-[11px] uppercase tracking-wide">
                    III. Risalah & Notulensi Pembahasan Jalannya Rapat
                  </div>
                  <div className="p-3.5 whitespace-pre-line text-slate-800 leading-relaxed bg-white text-xs">
                    {currentMeeting.discussionNotes}
                  </div>
                </div>

                {/* IV. Keputusan & Kesepakatan Rapat */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <div className="bg-emerald-50/80 px-3 py-1.5 font-bold text-emerald-950 border-b border-slate-800 text-[11px] uppercase tracking-wide">
                    IV. Keputusan & Kesepakatan Rapat
                  </div>
                  <div className="p-3.5 whitespace-pre-line text-slate-900 leading-relaxed bg-white font-medium text-xs">
                    {currentMeeting.decisions}
                  </div>
                </div>

                {/* Signatures for Meeting Report */}
                <div className="pt-6 no-break">
                  <div className="text-right text-xs mb-3 text-slate-800">
                    {reportCity}, {currentMeeting.date || reportDate}
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">Pimpinan Rapat,</p>
                      <div className="h-20 flex items-end justify-center">
                        <div className="w-44 border-b border-slate-900" />
                      </div>
                      <p className="font-bold text-slate-950 mt-1">{currentMeeting.leader}</p>
                      <p className="text-[10px] text-slate-600">Pejabat Pembina</p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-700">Notulis Rapat,</p>
                      <div className="h-20 flex items-end justify-center">
                        <div className="w-44 border-b border-slate-900" />
                      </div>
                      <p className="font-bold text-slate-950 mt-1">{currentMeeting.noteTaker}</p>
                      <p className="text-[10px] text-slate-600">Pencatat Berita Acara</p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-700">Mengetahui,</p>
                      <p className="font-bold text-slate-900 uppercase">Kepala Sekolah</p>
                      <div className="h-20 flex items-end justify-center">
                        <div className="w-44 border-b border-slate-900" />
                      </div>
                      <p className="font-bold text-slate-950 mt-1 underline underline-offset-2">
                        {principalName}
                      </p>
                      <p className="text-[10px] font-mono text-slate-600">NIP. {principalNip}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* DOCUMENT 2: LEMBAR DISPOSISI KEDINASAN RESMI                   */}
            {/* ============================================================== */}
            {docType === 'disposition' && currentDisposition && (
              <div className="space-y-4 text-xs text-slate-900">
                <div className="text-center my-2">
                  <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-950 underline decoration-slate-900 decoration-1 underline-offset-4">
                    LEMBAR DISPOSISI KEDINASAN KEPALA SEKOLAH
                  </h2>
                  <p className="text-[11px] font-mono text-slate-600 mt-1">
                    No. Agenda Masuk: <strong>{currentDisposition.agendaNumber}</strong> • Sifat: <strong className="text-rose-700 uppercase">{currentDisposition.priority}</strong>
                  </p>
                </div>

                {/* Surat Masuk Details Grid */}
                <div className="border border-slate-900 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="w-1/4 py-2 px-3 bg-slate-50 font-semibold text-slate-700">Surat Dari (Pengirim)</td>
                        <td colSpan={3} className="py-2 px-3 font-bold text-slate-950 text-sm">
                          {currentDisposition.source}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Nomor Surat Dinas</td>
                        <td className="py-1.5 px-3 font-mono font-bold text-slate-900">{currentDisposition.letterNumber}</td>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Tanggal Surat</td>
                        <td className="py-1.5 px-3 font-mono text-slate-900">{currentDisposition.letterDate}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Diterima Tanggal</td>
                        <td className="py-1.5 px-3 font-mono text-slate-900">{currentDisposition.receivedDate}</td>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Batas Waktu Selesai</td>
                        <td className="py-1.5 px-3 font-mono font-bold text-rose-800">{currentDisposition.deadline}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Perihal / Isi Ringkas</td>
                        <td colSpan={3} className="py-1.5 px-3 font-bold text-slate-950 leading-relaxed">
                          {currentDisposition.subject}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Tingkat Prioritas (Sifat)</td>
                        <td colSpan={3} className="py-1.5 px-3">
                          <div className="flex items-center gap-6">
                            {['Sangat Segera', 'Segera', 'Biasa', 'Rahasia'].map((p) => (
                              <div key={p} className="flex items-center gap-1.5">
                                {currentDisposition.priority === p ? (
                                  <CheckSquare className="w-4 h-4 text-slate-900" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-400" />
                                )}
                                <span className={currentDisposition.priority === p ? 'font-bold underline' : ''}>
                                  {p}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Two Columns: Diteruskan Kepada & Instruksi */}
                <div className="grid grid-cols-2 gap-4 border border-slate-900 rounded-lg p-3 bg-slate-50">
                  {/* Left Column: Diteruskan Kepada */}
                  <div className="space-y-2 border-r border-slate-300 pr-3">
                    <h4 className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-800 pb-1">
                      A. DITERUSKAN KEPADA YTH:
                    </h4>
                    <div className="space-y-1 text-xs">
                      {[
                        'Waka. Bidang Kurikulum',
                        'Waka. Bidang Kesiswaan',
                        'Waka. Manajemen Mutu / SDM',
                        'Kepala Tata Usaha (TU)',
                        'Tim Pengembang Kurikulum',
                        'Koordinator P5 & Ekstrakurikuler',
                        'Ketua MGMP / Dewan Guru Mapel',
                        'Bendahara Sekolah',
                      ].map((tgt) => {
                        const isChecked = currentDisposition.targetAudience?.includes(tgt);
                        return (
                          <div key={tgt} className="flex items-center gap-2">
                            {isChecked ? (
                              <CheckSquare className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span className={isChecked ? 'font-bold text-slate-950' : 'text-slate-600'}>
                              {tgt}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Instruksi / Arahan Disposisi */}
                  <div className="space-y-2 pl-1">
                    <h4 className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-800 pb-1">
                      B. DISPOSISI / INSTRUKSI KEPALA SEKOLAH:
                    </h4>
                    <div className="space-y-1 text-xs">
                      {[
                        'Tindak lanjuti segera',
                        'Pelajari / Buatkan telaah & kajian',
                        'Siapkan bahan paparan / naskah SK',
                        'Hadiri dan wakili sekolah',
                        'Koordinasikan dengan tim terkait',
                        'Jadwalkan rapat pembahasan',
                        'Arsipkan & pantau perkembangannya',
                        'Konfirmasi & laporkan hasilnya',
                      ].map((inst) => {
                        const isChecked = currentDisposition.instruction?.includes(inst);
                        return (
                          <div key={inst} className="flex items-center gap-2">
                            {isChecked ? (
                              <CheckSquare className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span className={isChecked ? 'font-bold text-slate-950' : 'text-slate-600'}>
                              {inst}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Catatan / Petunjuk Khusus Pimpinan */}
                <div className="border border-slate-900 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wide">
                    C. Catatan & Petunjuk Khusus Kepala Sekolah:
                  </div>
                  <div className="p-4 bg-white text-xs font-serif leading-relaxed text-slate-950 min-h-[90px]">
                    &quot;{currentDisposition.directorNotes || 'Harap segera dikoordinasikan dan ditindaklanjuti sesuai batas waktu.'}&quot;
                  </div>
                </div>

                {/* Disposed Signature */}
                <div className="pt-6 no-break">
                  <div className="grid grid-cols-2 gap-12 text-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">Tanda Tangan Penerima Disposisi,</p>
                      <div className="h-20 flex items-end justify-center">
                        <div className="w-52 border-b border-slate-900" />
                      </div>
                      <p className="font-bold text-slate-950 mt-1">
                        ( .............................................................. )
                      </p>
                      <p className="text-[10px] text-slate-600">Waka / Penerima Disposisi</p>
                    </div>

                    <div>
                      <p className="text-right text-xs mb-1 text-slate-700 mr-8">
                        {reportCity}, {currentDisposition.receivedDate || reportDate}
                      </p>
                      <p className="font-bold text-slate-900 uppercase">Kepala SMA Plus PGRI Cibinong</p>
                      <div className="h-20 flex items-end justify-center">
                        <div className="w-52 border-b border-slate-900" />
                      </div>
                      <p className="font-bold text-slate-950 mt-1 underline underline-offset-2">
                        {principalName}
                      </p>
                      <p className="text-[10px] font-mono text-slate-600">NIP. {principalNip}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* DOCUMENT 3: MATRIKS REKAPITULASI RENCANA TINDAK LANJUT (RTL)   */}
            {/* ============================================================== */}
            {docType === 'rtl' && (
              <div className="space-y-4 text-xs text-slate-900">
                <div className="text-center my-2">
                  <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-950 underline decoration-slate-900 decoration-1 underline-offset-4">
                    MATRIKS RENCANA TINDAK LANJUT (RTL) HASIL RAPAT & DISPOSISI
                  </h2>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    Tahun Ajaran {academicYear} — Bidang Akademik & Kurikulum Unggulan
                  </p>
                </div>

                {/* Summary Table */}
                <div className="border border-slate-900 rounded-lg overflow-hidden">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="bg-slate-200/90 text-slate-950 border-b border-slate-900">
                        <th className="py-2 px-1 text-center w-8">No</th>
                        <th className="py-2 px-2 text-left">Uraian Kegiatan Tindak Lanjut (RTL)</th>
                        <th className="py-2 px-1.5 text-left w-32">Sumber Rujukan</th>
                        <th className="py-2 px-1.5 text-left w-32">Penanggung Jawab (PIC)</th>
                        <th className="py-2 px-1 text-center w-24">Target Waktu</th>
                        <th className="py-2 px-2 text-left">Indikator Keberhasilan</th>
                        <th className="py-2 px-1 text-center w-16">Capaian</th>
                        <th className="py-2 px-1.5 text-center w-24">Status</th>
                        <th className="py-2 px-1.5 text-center w-24">Bukti Fisik</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {rtls.map((r, idx) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="py-2 px-1 text-center font-bold">{idx + 1}</td>
                          <td className="py-2 px-2 font-bold text-slate-950 leading-tight">
                            {r.actionTitle}
                            {r.notes && (
                              <div className="text-[9px] font-normal text-slate-600 italic mt-0.5">
                                Catatan: {r.notes}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-1.5 text-slate-700">
                            <span className="font-semibold block">{r.sourceType}</span>
                            <span className="text-[9px] text-slate-500">{r.sourceReference}</span>
                          </td>
                          <td className="py-2 px-1.5 font-semibold text-slate-800">{r.pic}</td>
                          <td className="py-2 px-1 text-center font-mono font-medium">{r.targetDate}</td>
                          <td className="py-2 px-2 text-slate-700 leading-tight">{r.indicators || '-'}</td>
                          <td className="py-2 px-1 text-center font-mono font-extrabold text-teal-900">
                            {r.progress}%
                          </td>
                          <td className="py-2 px-1.5 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                r.status === 'Tuntas & Terverifikasi'
                                  ? 'bg-emerald-100 text-emerald-950'
                                  : r.status === 'Sedang Berjalan'
                                  ? 'bg-amber-100 text-amber-950'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-2 px-1.5 text-center text-[9px] font-mono">
                            {r.evidenceLink ? (
                              <span className="text-blue-800 font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-200 block truncate">
                                Drive ✓
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Signatures for RTL */}
                <div className="pt-6 no-break">
                  <div className="text-right text-xs mb-3 text-slate-800">
                    {reportCity}, {reportDate}
                  </div>
                  <div className="grid grid-cols-2 gap-12 text-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">Koordinator Tim Tindak Lanjut,</p>
                      <p className="font-bold text-slate-900">Waka. Bidang Kurikulum</p>
                      <div className="h-20 flex items-end justify-center">
                        <div className="w-52 border-b border-slate-900" />
                      </div>
                      <p className="font-bold text-slate-950 mt-1">{curriculumHead}</p>
                      <p className="text-[10px] font-mono text-slate-600">NIP. {curriculumHeadNip}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-700">Mengetahui,</p>
                      <p className="font-bold text-slate-900 uppercase">Kepala SMA Plus PGRI Cibinong</p>
                      <div className="h-20 flex items-end justify-center">
                        <div className="w-52 border-b border-slate-900" />
                      </div>
                      <p className="font-bold text-slate-950 mt-1 underline underline-offset-2">
                        {principalName}
                      </p>
                      <p className="text-[10px] font-mono text-slate-600">NIP. {principalNip}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
