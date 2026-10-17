import { useState, useRef } from 'react';
import { SupervisionRecord } from '../types';
import {
  X,
  Printer,
  Download,
  Settings2,
  FileText,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  ChevronDown,
  Building2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { broadcastToast } from '../services/notificationService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SupervisionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  supervisions: SupervisionRecord[];
  initialSelectedId?: string | null;
}

export function SupervisionReportModal({
  isOpen,
  onClose,
  supervisions,
  initialSelectedId
}: SupervisionReportModalProps) {
  const [reportMode, setReportMode] = useState<'individual' | 'collective'>(
    initialSelectedId ? 'individual' : 'individual'
  );
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    initialSelectedId || (supervisions.length > 0 ? supervisions[0].id : '')
  );

  // Document customization state
  const [showSettings, setShowSettings] = useState(false);
  const [docNumber, setDocNumber] = useState('421.3/SUP-KUR/SMAPLUS/X/2024');
  const [academicYear, setAcademicYear] = useState('2024/2025');
  const [semester, setSemester] = useState('Ganjil');
  const [reportCity, setReportCity] = useState('Cibinong');
  const [reportDate, setReportDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  });
  const [principalName, setPrincipalName] = useState("Dr. Hj. Nina Nur'aeni, M.Pd.");
  const [principalNip, setPrincipalNip] = useState('197205141998022001');
  const [curriculumHead, setCurriculumHead] = useState('Wawan Suwandi, M.Pd.');
  const [curriculumHeadNip, setCurriculumHeadNip] = useState('198103182006041008');

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentRecord =
    supervisions.find((s) => s.id === selectedRecordId) || supervisions[0];

  // Calculate stats for collective mode
  const totalSupervisions = supervisions.length;
  const avgAdmin = Math.round(
    supervisions.reduce((acc, s) => acc + (s.scores.administration ?? 90), 0) /
      (totalSupervisions || 1)
  );
  const avgPlanning = Math.round(
    supervisions.reduce((acc, s) => acc + s.scores.planning, 0) /
      (totalSupervisions || 1)
  );
  const avgExecution = Math.round(
    supervisions.reduce((acc, s) => acc + s.scores.execution, 0) /
      (totalSupervisions || 1)
  );
  const avgAssessment = Math.round(
    supervisions.reduce((acc, s) => acc + s.scores.assessment, 0) /
      (totalSupervisions || 1)
  );
  const avgQuantum = Math.round(
    supervisions.reduce((acc, s) => acc + (s.scores.quantumLearning ?? 88), 0) /
      (totalSupervisions || 1)
  );
  const avgOverall = Math.round(
    supervisions.reduce((acc, s) => acc + s.overallScore, 0) /
      (totalSupervisions || 1)
  );
  const countAmatBaik = supervisions.filter((s) => s.predicate === 'Amat Baik').length;
  const countBaik = supervisions.filter((s) => s.predicate === 'Baik').length;
  const countCukup = supervisions.filter((s) => s.predicate === 'Cukup').length;
  const countPerluBimbingan = supervisions.filter(
    (s) => s.predicate === 'Perlu Bimbingan'
  ).length;

  // Print via isolated iframe to guarantee perfect A4 format
  const handlePrint = () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Hasil Supervisi Guru - SMA Plus PGRI Cibinong</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
          <style>
            @page {
              size: ${reportMode === 'collective' ? 'A4 landscape' : 'A4 portrait'};
              margin: 12mm 15mm 15mm 15mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 0;
              font-size: 11pt;
              line-height: 1.4;
            }
            .font-mono {
              font-family: 'JetBrains Mono', monospace;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #1e293b;
              padding: 5px 8px;
            }
            th {
              background-color: #f1f5f9 !important;
              font-weight: 700;
            }
            .kop-border {
              border-top: 2.5px solid #000;
              border-bottom: 1px solid #000;
              height: 3px;
              margin: 8px 0 16px 0;
            }
            .no-break {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);

    broadcastToast({
      title: 'Dokumen Dikirim ke Cetak',
      message: 'Dialog cetak / Simpan PDF telah dibuka.',
      type: 'info'
    });
  };

  // Direct PDF Download using html2canvas and jsPDF
  const handleDownloadPdf = async () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;

    try {
      setIsGeneratingPdf(true);
      broadcastToast({
        title: 'Menyiapkan Dokumen PDF...',
        message: 'Sedang merender lembar supervisi dengan kop sekolah resmi.',
        type: 'info'
      });

      const isCollective = reportMode === 'collective';

      const canvas = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: isCollective ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
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

      const sanitizedName = isCollective
        ? 'Rekapitulasi_Hasil_Supervisi_Dewan_Guru'
        : `Laporan_Supervisi_${currentRecord?.teacherName.replace(/[^a-zA-Z0-9]/g, '_')}`;

      pdf.save(`${sanitizedName}_SMA_Plus_PGRI_Cibinong.pdf`);

      broadcastToast({
        title: 'PDF Berhasil Diunduh!',
        message: 'Dokumen PDF siap disimpan atau dicetak sebagai arsip fisik sekolah.',
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      broadcastToast({
        title: 'Gagal Membuat PDF',
        message: 'Terjadi kendala saat merender PDF. Silakan gunakan tombol "Cetak Dokumen".',
        type: 'warning'
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-5xl bg-slate-100 rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden border border-slate-300">
        {/* Top Control Bar (No Print) */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Cetak & Unduh Laporan Supervisi Guru (Kop Resmi)
              </h3>
              <p className="text-xs text-slate-500">
                Dokumen resmi untuk akreditasi, arsip fisik kurikulum, dan pengawas sekolah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showSettings
                  ? 'bg-purple-50 border-purple-300 text-purple-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Sesuaikan Nomor Surat, Pejabat Penandatangan, dan Semester"
            >
              <Settings2 className="w-4 h-4 text-purple-600" />
              <span>Sesuaikan Kop & Pengesahan</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Cetak langsung ke printer fisik atau simpan via dialog cetak browser"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak (Print)</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Unduh langsung berkas .pdf ke perangkat"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                  <span>Merender PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Unduh Dokumen PDF (.pdf)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Mode Selection & Teacher Picker */}
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Bentuk Laporan:</span>
            <div className="inline-flex rounded-xl p-0.5 bg-slate-200/80 border border-slate-300">
              <button
                type="button"
                onClick={() => setReportMode('individual')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  reportMode === 'individual'
                    ? 'bg-white text-purple-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>Lembar Individu Guru (Instrumen 5 Dimensi & RTL)</span>
              </button>
              <button
                type="button"
                onClick={() => setReportMode('collective')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  reportMode === 'collective'
                    ? 'bg-white text-purple-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Rekapitulasi Kolektif Seluruh Dewan Guru ({supervisions.length})</span>
              </button>
            </div>
          </div>

          {reportMode === 'individual' && (
            <div className="flex items-center gap-2">
              <label htmlFor="select-teacher-report" className="font-semibold text-slate-600">
                Pilih Guru:
              </label>
              <select
                id="select-teacher-report"
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value)}
                className="px-3 py-1 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800 text-xs shadow-2xs focus:outline-purple-600 cursor-pointer"
              >
                {supervisions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.teacherName} — {s.subject} ({s.predicate} / Skor {s.overallScore})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Collapsible Settings Panel */}
        {showSettings && (
          <div className="bg-amber-50/70 p-4 border-b border-amber-200 text-xs text-slate-700 shrink-0">
            <div className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-amber-700" />
              Kustomisasi Atribut Dokumen Resmi (Kop & Pengesahan):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nomor Surat / Dokumen
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tahun Ajaran & Semester
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2024/2025"
                    className="w-1/2 px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="Ganjil"
                    className="w-1/2 px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tempat & Tanggal Dokumen
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reportCity}
                    onChange={(e) => setReportCity(e.target.value)}
                    className="w-1/3 px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-2/3 px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Kepala Sekolah & NIP
                </label>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  className="w-full px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs mb-1"
                />
                <input
                  type="text"
                  value={principalNip}
                  onChange={(e) => setPrincipalNip(e.target.value)}
                  placeholder="NIP Kepala Sekolah"
                  className="w-full px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-[10px] font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Paper Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-300/60 flex justify-center">
          <div
            ref={printAreaRef}
            id="supervision-printable-area"
            className="bg-white text-slate-900 shadow-xl border border-slate-400 p-8 sm:p-12 w-full transition-all"
            style={{
              maxWidth: reportMode === 'collective' ? '1120px' : '820px',
              minHeight: '1120px',
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif"
            }}
          >
            {/* KOP SURAT RESMI (Official School Letterhead) */}
            <div className="relative border-b-2 border-black pb-2 mb-4">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Official School / PGRI Emblem */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                    {/* Outer Crest */}
                    <path
                      d="M50 5 L88 20 L88 55 C88 75 50 95 50 95 C50 95 12 75 12 55 L12 20 Z"
                      fill="#1e3a8a"
                    />
                    <path
                      d="M50 8 L84 22 L84 54 C84 72 50 91 50 91 C50 91 16 72 16 54 L16 22 Z"
                      fill="#ffffff"
                    />
                    <path
                      d="M50 12 L80 24 L80 52 C80 68 50 86 50 86 C50 86 20 68 20 52 L20 24 Z"
                      fill="#dc2626"
                    />
                    {/* Inner Torch and Open Book */}
                    <circle cx="50" cy="48" r="22" fill="#facc15" />
                    {/* Book */}
                    <path
                      d="M36 56 C42 54 48 55 50 57 C52 55 58 54 64 56 L64 64 C58 62 52 63 50 65 C48 63 42 62 36 64 Z"
                      fill="#ffffff"
                      stroke="#1e3a8a"
                      strokeWidth="1.5"
                    />
                    {/* Torch Flame */}
                    <path
                      d="M50 32 C54 36 56 40 50 46 C44 40 46 36 50 32 Z"
                      fill="#ea580c"
                    />
                    <rect x="48" y="44" width="4" height="12" fill="#78350f" />
                    {/* Text Stars */}
                    <polygon points="50,15 52,20 57,20 53,23 55,28 50,25 45,28 47,23 43,20 48,20" fill="#ffffff" />
                  </svg>
                </div>

                {/* Letterhead Text */}
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
                  <p className="text-[9px] sm:text-[10.5px] text-slate-700 leading-tight mt-0.5">
                    Jl. Golf Ciriung No. 2, Ciriung, Kec. Cibinong, Kab. Bogor, Jawa Barat 16918
                    <br />
                    Telepon: (021) 8754122 • Laman: www.smapluspgricibinong.sch.id • Pos-el: kurikulum@smapluspgricibinong.sch.id
                  </p>
                </div>

                {/* Right side ISO / School Badge */}
                <div className="hidden sm:flex flex-col items-center justify-center w-20 shrink-0 text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-emerald-700 bg-emerald-50 text-emerald-900 flex flex-col items-center justify-center font-bold text-[9px] p-1">
                    <Award className="w-4 h-4 text-emerald-700 mb-0.5" />
                    <span>MUTU A</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-600 mt-1 uppercase tracking-tight">
                    Unggul & Berkarakter
                  </span>
                </div>
              </div>

              {/* Official Double Border Line of Indonesian Government/School Letterhead */}
              <div className="mt-2 border-t-2 border-slate-950 pt-[1.5px] border-b border-slate-950" />
            </div>

            {/* REPORT TITLE */}
            <div className="text-center my-4">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-950 underline decoration-slate-900 decoration-1 underline-offset-4">
                {reportMode === 'individual'
                  ? 'LEMBAR HASIL SUPERVISI AKADEMIK PEMBELAJARAN'
                  : 'REKAPITULASI HASIL SUPERVISI AKADEMIK PEMBELAJARAN DEWAN GURU'}
              </h2>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Tahun Ajaran {academicYear} — Semester {semester}
              </p>
              <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                Nomor Dokumen: {docNumber}
              </p>
            </div>

            {/* INDIVIDUAL TEACHER REPORT */}
            {reportMode === 'individual' && currentRecord && (
              <div className="space-y-4 text-xs text-slate-900">
                {/* 1. Identitas Guru & Pelaksanaan */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wide">
                    I. Identitas Pendidik & Pelaksanaan Supervisi
                  </div>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="w-1/5 py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Nama Lengkap & Gelar</td>
                        <td className="w-2/5 py-1.5 px-3 font-bold text-slate-950">{currentRecord.teacherName}</td>
                        <td className="w-1/5 py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Mata Pelajaran</td>
                        <td className="w-1/5 py-1.5 px-3 font-semibold text-slate-900">{currentRecord.subject}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">NIP / NUPTK</td>
                        <td className="py-1.5 px-3 font-mono font-medium text-slate-800">{currentRecord.teacherNip}</td>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Kelas / Fase</td>
                        <td className="py-1.5 px-3 font-semibold text-slate-900">{currentRecord.gradeClass}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Hari, Tanggal & Jam</td>
                        <td className="py-1.5 px-3 text-slate-800">{currentRecord.date} ({currentRecord.time})</td>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Supervisor / Penilai</td>
                        <td className="py-1.5 px-3 font-semibold text-slate-950">{currentRecord.supervisorName}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. Instrumen Penilaian 5 Dimensi */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wide flex items-center justify-between">
                    <span>II. Hasil Penilaian Instrumen Supervisi (5 Dimensi Pembelajaran)</span>
                    <span className="text-[10px] lowercase font-normal text-slate-600 font-sans">
                      (skala penilaian 0 – 100)
                    </span>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-200/90 text-slate-900 border-b border-slate-800 text-[11px]">
                        <th className="py-2 px-2.5 text-center w-10">No</th>
                        <th className="py-2 px-3 text-left">Komponen & Aspek Supervisi yang Dinilai</th>
                        <th className="py-2 px-3 text-left">Fokus Indikator Penilaian</th>
                        <th className="py-2 px-2.5 text-center w-16">Skor</th>
                        <th className="py-2 px-3 text-center w-28">Kategori</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      <tr>
                        <td className="py-2 px-2.5 text-center font-bold">1</td>
                        <td className="py-2 px-3 font-bold text-slate-950">
                          Administrasi Pembelajaran
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-700">
                          Kelengkapan Dokumen KOSP, Kalender Pendidikan, Prota/Prosem, Modul Ajar, Jurnal Mengajar, Presensi, dan Buku Nilai.
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono font-bold text-sm">
                          {currentRecord.scores.administration ?? 90}
                        </td>
                        <td className="py-2 px-3 text-center font-semibold text-[11px]">
                          {(currentRecord.scores.administration ?? 90) >= 91
                            ? 'Sangat Lengkap'
                            : (currentRecord.scores.administration ?? 90) >= 81
                            ? 'Lengkap'
                            : 'Cukup Lengkap'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 text-center font-bold">2</td>
                        <td className="py-2 px-3 font-bold text-slate-950">
                          Perencanaan Pembelajaran
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-700">
                          Penyusunan Capaian Pembelajaran (CP), Alur Tujuan Pembelajaran (ATP), Modul Ajar/RPP Berdiferensiasi, serta Asesmen Diagnostik Awal.
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono font-bold text-sm">
                          {currentRecord.scores.planning}
                        </td>
                        <td className="py-2 px-3 text-center font-semibold text-[11px]">
                          {currentRecord.scores.planning >= 91
                            ? 'Sangat Runtut'
                            : currentRecord.scores.planning >= 81
                            ? 'Runtut & Sesuai'
                            : 'Cukup Runtut'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 text-center font-bold">3</td>
                        <td className="py-2 px-3 font-bold text-slate-950">
                          Pelaksanaan Pembelajaran
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-700">
                          Apersepsi bermakna, interaksi belajar aktif, manajemen kelas kolaboratif, dan integrasi pembelajaran berbasis teknologi (TPACK).
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono font-bold text-sm">
                          {currentRecord.scores.execution}
                        </td>
                        <td className="py-2 px-3 text-center font-semibold text-[11px]">
                          {currentRecord.scores.execution >= 91
                            ? 'Sangat Efektif'
                            : currentRecord.scores.execution >= 81
                            ? 'Efektif'
                            : 'Cukup Efektif'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 text-center font-bold">4</td>
                        <td className="py-2 px-3 font-bold text-slate-950">
                          Asesmen Hasil Belajar
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-700">
                          Penerapan asesmen formatif berkala, kejelasan kriteria ketercapaian tujuan pembelajaran (KKTP), umpan balik konstruktif, dan asesmen sumatif.
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono font-bold text-sm">
                          {currentRecord.scores.assessment}
                        </td>
                        <td className="py-2 px-3 text-center font-semibold text-[11px]">
                          {currentRecord.scores.assessment >= 91
                            ? 'Sangat Komprehensif'
                            : currentRecord.scores.assessment >= 81
                            ? 'Komprehensif'
                            : 'Cukup'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 text-center font-bold">5</td>
                        <td className="py-2 px-3 font-bold text-slate-950">
                          Quantum Learning
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-700">
                          Penerapan kerangka TANDUR (Tumbuhkan, Alami, Namai, Demonstrasikan, Ulangi, Rayakan), penanaman motivasi AMBAK (Apa Manfaatnya Bagiku), dan suasana belajar menyenangkan.
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono font-bold text-sm">
                          {currentRecord.scores.quantumLearning ?? 88}
                        </td>
                        <td className="py-2 px-3 text-center font-semibold text-[11px]">
                          {(currentRecord.scores.quantumLearning ?? 88) >= 91
                            ? 'Sangat Hidup'
                            : (currentRecord.scores.quantumLearning ?? 88) >= 81
                            ? 'Interaktif'
                            : 'Cukup Interaktif'}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-800 text-slate-950">
                        <td colSpan={3} className="py-2.5 px-3 text-right uppercase text-[11px]">
                          Rata-rata Skor Akhir Supervisi:
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-mono text-base font-extrabold">
                          {currentRecord.overallScore}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-extrabold uppercase ${
                              currentRecord.predicate === 'Amat Baik'
                                ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                : currentRecord.predicate === 'Baik'
                                ? 'bg-blue-100 text-blue-950 border border-blue-300'
                                : 'bg-amber-100 text-amber-950 border border-amber-300'
                            }`}
                          >
                            {currentRecord.predicate}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Pedoman Kriteria Skor */}
                <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-300 flex items-center justify-between">
                  <span>
                    <strong>Rentang Predikat:</strong> Amat Baik (91 – 100) • Baik (81 – 90) • Cukup (71 – 80) • Perlu Bimbingan (&lt; 71)
                  </span>
                  <span className="font-semibold text-slate-700">Kurikulum Merdeka SMA Plus PGRI Cibinong</span>
                </div>

                {/* 3. Catatan Kualitatif Pengamatan */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wide">
                    III. Catatan Observasi & Praktik Baik Pendidik
                  </div>
                  <div className="p-3 space-y-2.5">
                    <div>
                      <strong className="text-emerald-900 block font-bold mb-0.5">
                        A. Kekuatan & Praktik Baik yang Ditemukan:
                      </strong>
                      <p className="text-slate-800 leading-relaxed bg-slate-50/80 p-2 rounded border border-slate-200">
                        {currentRecord.strengths || 'Guru menunjukkan penguasaan materi yang sangat baik, interaksi kelas berjalan dinamis, serta modul ajar tersusun rapi sesuai alur pembelajaran.'}
                      </p>
                    </div>
                    <div>
                      <strong className="text-amber-900 block font-bold mb-0.5">
                        B. Catatan / Aspek yang Perlu Ditingkatkan:
                      </strong>
                      <p className="text-slate-800 leading-relaxed bg-slate-50/80 p-2 rounded border border-slate-200">
                        {currentRecord.weaknesses || 'Perlu memperkuat variasi diferensiasi produk pada tugas kelompok serta konsistensi rubrik penilaian formatif.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Rencana Tindak Lanjut (RTL) */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wide">
                    IV. Kesepakatan Rencana Tindak Lanjut (RTL) Supervisi
                  </div>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="w-1/4 py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Program Tindak Lanjut</td>
                        <td className="w-3/4 py-1.5 px-3 font-bold text-slate-950">{currentRecord.followUp.actionTitle}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Metode & Pendekatan RTL</td>
                        <td className="py-1.5 px-3 font-semibold text-slate-900">
                          {currentRecord.followUp.method}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Pembimbing / Pendamping (Mentor)</td>
                        <td className="py-1.5 px-3 text-slate-800">{currentRecord.followUp.mentor}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Target Tanggal Selesai</td>
                        <td className="py-1.5 px-3 font-semibold text-slate-900">{currentRecord.followUp.targetDate}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Status Keterlaksanaan</td>
                        <td className="py-1.5 px-3 font-bold text-slate-950">
                          {currentRecord.followUp.status === 'Selesai & Diverifikasi' ? (
                            <span className="text-emerald-800">Tuntas & Terverifikasi</span>
                          ) : (
                            <span className="text-amber-800">Sedang Berjalan / Direncanakan</span>
                          )}
                          {currentRecord.followUp.notes && (
                            <span className="block text-[11px] text-slate-600 font-normal mt-0.5 italic">
                              Catatan: &quot;{currentRecord.followUp.notes}&quot;
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 5. Lembar Pengesahan (3 Tanda Tangan Resmi) */}
                <div className="pt-4 no-break">
                  <div className="text-right text-xs mb-3 text-slate-800">
                    {reportCity}, {reportDate}
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">Guru yang Disupervisi,</p>
                      <div className="h-20 flex items-end justify-center">
                        <div className="w-44 border-b border-slate-900" />
                      </div>
                      <p className="font-bold text-slate-950 mt-1">{currentRecord.teacherName}</p>
                      <p className="text-[10px] font-mono text-slate-600">NIP. {currentRecord.teacherNip}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-700">Supervisor / Penilai,</p>
                      <div className="h-20 flex items-end justify-center">
                        <div className="w-44 border-b border-slate-900" />
                      </div>
                      <p className="font-bold text-slate-950 mt-1">{currentRecord.supervisorName}</p>
                      <p className="text-[10px] text-slate-600">Pengawas / Tim Supervisi Sekolah</p>
                    </div>
                  </div>

                  {/* Mengetahui Kepala Sekolah */}
                  <div className="text-center mt-6 text-xs">
                    <p className="font-semibold text-slate-700">Mengetahui,</p>
                    <p className="font-bold text-slate-900 uppercase">Kepala SMA Plus PGRI Cibinong</p>
                    <div className="h-20 flex items-end justify-center relative">
                      {/* Decorative stamp circle watermark */}
                      <div className="absolute top-2 w-16 h-16 rounded-full border border-purple-800/40 text-purple-900/40 flex items-center justify-center text-[7px] font-extrabold uppercase transform -rotate-12 pointer-events-none">
                        SMA PLUS PGRI
                      </div>
                      <div className="w-52 border-b border-slate-900" />
                    </div>
                    <p className="font-bold text-slate-950 mt-1 underline underline-offset-2">
                      {principalName}
                    </p>
                    <p className="text-[10px] font-mono text-slate-600">NIP. {principalNip}</p>
                  </div>
                </div>
              </div>
            )}

            {/* COLLECTIVE WHOLE SCHOOL REPORT */}
            {reportMode === 'collective' && (
              <div className="space-y-4 text-xs text-slate-900">
                {/* Executive Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 border border-slate-800 rounded-lg p-2.5 bg-slate-50 text-center">
                  <div className="p-1.5 border-r border-slate-300">
                    <div className="text-[10px] text-slate-600 uppercase font-semibold">Total Guru</div>
                    <div className="text-lg font-extrabold text-slate-900">{totalSupervisions}</div>
                  </div>
                  <div className="p-1.5 border-r border-slate-300">
                    <div className="text-[10px] text-slate-600 uppercase font-semibold">Rata-rata Sekolah</div>
                    <div className="text-lg font-extrabold text-purple-900 font-mono">{avgOverall}</div>
                  </div>
                  <div className="p-1.5 border-r border-slate-300">
                    <div className="text-[10px] text-emerald-800 uppercase font-semibold">Amat Baik</div>
                    <div className="text-lg font-extrabold text-emerald-700">{countAmatBaik}</div>
                  </div>
                  <div className="p-1.5 border-r border-slate-300">
                    <div className="text-[10px] text-blue-800 uppercase font-semibold">Baik</div>
                    <div className="text-lg font-extrabold text-blue-700">{countBaik}</div>
                  </div>
                  <div className="p-1.5 border-r border-slate-300">
                    <div className="text-[10px] text-amber-800 uppercase font-semibold">Cukup</div>
                    <div className="text-lg font-extrabold text-amber-700">{countCukup}</div>
                  </div>
                  <div className="p-1.5">
                    <div className="text-[10px] text-rose-800 uppercase font-semibold">Perlu Bimbingan</div>
                    <div className="text-lg font-extrabold text-rose-700">{countPerluBimbingan}</div>
                  </div>
                </div>

                {/* Master Table */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-[10.5px]">
                    <thead>
                      <tr className="bg-slate-200/90 text-slate-900 border-b border-slate-800">
                        <th className="py-2 px-1 text-center w-8">No</th>
                        <th className="py-2 px-2 text-left">Nama Pendidik</th>
                        <th className="py-2 px-1.5 text-left">Mapel & Kelas</th>
                        <th className="py-2 px-1 text-center" title="1. Administrasi">Adm</th>
                        <th className="py-2 px-1 text-center" title="2. Perencanaan">Renc</th>
                        <th className="py-2 px-1 text-center" title="3. Pelaksanaan">Laks</th>
                        <th className="py-2 px-1 text-center" title="4. Asesmen">Asm</th>
                        <th className="py-2 px-1 text-center" title="5. Quantum Learning">QL</th>
                        <th className="py-2 px-1.5 text-center font-bold">Rerata</th>
                        <th className="py-2 px-2 text-center">Predikat</th>
                        <th className="py-2 px-2 text-left">Program RTL</th>
                        <th className="py-2 px-1.5 text-center">Status RTL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {supervisions.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-1.5 px-1 text-center font-bold">{idx + 1}</td>
                          <td className="py-1.5 px-2">
                            <span className="font-bold text-slate-950 block">{s.teacherName}</span>
                            <span className="text-[9px] font-mono text-slate-600">{s.teacherNip}</span>
                          </td>
                          <td className="py-1.5 px-1.5">
                            <span className="font-semibold text-slate-800 block">{s.subject}</span>
                            <span className="text-[9px] text-slate-500">{s.gradeClass}</span>
                          </td>
                          <td className="py-1.5 px-1 text-center font-mono">{s.scores.administration ?? 90}</td>
                          <td className="py-1.5 px-1 text-center font-mono">{s.scores.planning}</td>
                          <td className="py-1.5 px-1 text-center font-mono">{s.scores.execution}</td>
                          <td className="py-1.5 px-1 text-center font-mono">{s.scores.assessment}</td>
                          <td className="py-1.5 px-1 text-center font-mono">{s.scores.quantumLearning ?? 88}</td>
                          <td className="py-1.5 px-1.5 text-center font-mono font-bold text-slate-950">
                            {s.overallScore}
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9.5px] font-extrabold ${
                                s.predicate === 'Amat Baik'
                                  ? 'bg-emerald-100 text-emerald-950'
                                  : s.predicate === 'Baik'
                                  ? 'bg-blue-100 text-blue-950'
                                  : 'bg-amber-100 text-amber-950'
                              }`}
                            >
                              {s.predicate}
                            </span>
                          </td>
                          <td className="py-1.5 px-2">
                            <span className="font-medium text-slate-900 block truncate max-w-[150px]">
                              {s.followUp.actionTitle}
                            </span>
                            <span className="text-[9px] text-slate-500">
                              {s.followUp.method}
                            </span>
                          </td>
                          <td className="py-1.5 px-1.5 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                s.followUp.status === 'Selesai & Diverifikasi'
                                  ? 'text-emerald-800'
                                  : 'text-amber-800'
                              }`}
                            >
                              {s.followUp.status === 'Selesai & Diverifikasi' ? 'Tuntas' : 'Berjalan'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-800 text-slate-950">
                        <td colSpan={3} className="py-2 px-2 text-right uppercase text-[10px]">
                          Rata-Rata Seluruh Guru:
                        </td>
                        <td className="py-2 px-1 text-center font-mono">{avgAdmin}</td>
                        <td className="py-2 px-1 text-center font-mono">{avgPlanning}</td>
                        <td className="py-2 px-1 text-center font-mono">{avgExecution}</td>
                        <td className="py-2 px-1 text-center font-mono">{avgAssessment}</td>
                        <td className="py-2 px-1 text-center font-mono">{avgQuantum}</td>
                        <td className="py-2 px-1.5 text-center font-mono font-extrabold text-sm text-purple-950">
                          {avgOverall}
                        </td>
                        <td colSpan={3} className="py-2 px-2 text-left text-[10px] text-slate-700">
                          Tingkat Ketercapaian Mutu: <strong>{avgOverall >= 91 ? 'Amat Baik' : avgOverall >= 81 ? 'Baik' : 'Cukup'}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Signatures for Collective Report */}
                <div className="pt-6 no-break">
                  <div className="text-right text-xs mb-3 text-slate-800">
                    {reportCity}, {reportDate}
                  </div>
                  <div className="grid grid-cols-2 gap-12 text-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">Waka. Bidang Kurikulum,</p>
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
