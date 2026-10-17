import { useState, useRef } from 'react';
import { WorkProgram } from '../types';
import {
  X,
  Printer,
  Download,
  Settings2,
  FileText,
  Target,
  CheckCircle2,
  Calendar,
  Award,
  Coins,
  CheckSquare,
  Square,
  Loader2
} from 'lucide-react';
import { broadcastToast } from '../services/notificationService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ProgramReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: WorkProgram[];
  initialSelectedId?: string | null;
}

export function ProgramReportModal({
  isOpen,
  onClose,
  programs,
  initialSelectedId
}: ProgramReportModalProps) {
  const [reportMode, setReportMode] = useState<'collective' | 'individual'>(
    initialSelectedId ? 'individual' : 'collective'
  );
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    initialSelectedId || (programs.length > 0 ? programs[0].id : '')
  );

  // Document customization state
  const [showSettings, setShowSettings] = useState(false);
  const [docNumber, setDocNumber] = useState('421.3/MONEV-KUR/SMAPLUS/X/2024');
  const [academicYear, setAcademicYear] = useState('2024/2025');
  const [reportPeriod, setReportPeriod] = useState('Semester Ganjil');
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

  const currentProgram =
    programs.find((p) => p.id === selectedProgramId) || programs[0];

  // Budget calculations
  const totalEstimated = programs.reduce((acc, p) => acc + p.budgetEstimated, 0);
  const totalRealized = programs.reduce((acc, p) => acc + p.budgetRealized, 0);
  const totalDifference = totalEstimated - totalRealized;
  const absorptionRate = Math.round((totalRealized / (totalEstimated || 1)) * 100);
  const avgProgress = Math.round(
    programs.reduce((acc, p) => acc + p.progress, 0) / (programs.length || 1)
  );
  const completedCount = programs.filter((p) => p.status === 'completed').length;
  const inProgressCount = programs.filter((p) => p.status === 'in_progress').length;
  const evaluationCount = programs.filter((p) => p.status === 'evaluation').length;

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
          <title>Laporan Monitoring & Evaluasi Program Kerja - SMA Plus PGRI Cibinong</title>
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
      message: 'Dialog cetak / Simpan PDF Monev Proker telah dibuka.',
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
        message: 'Sedang merender laporan monev program kerja dengan kop resmi.',
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
        ? `Rekapitulasi_Monev_Program_Kerja_Kurikulum_${academicYear.replace('/', '-')}`
        : `Laporan_Proker_${currentProgram?.code}_${currentProgram?.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}`;

      pdf.save(`${sanitizedName}_SMA_Plus_PGRI_Cibinong.pdf`);

      broadcastToast({
        title: 'PDF Berhasil Diunduh!',
        message: 'Dokumen monev program kerja siap diarsipkan secara fisik atau dilaporkan.',
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      broadcastToast({
        title: 'Gagal Membuat PDF',
        message: 'Terjadi kendala saat merender PDF. Silakan gunakan tombol "Cetak (Print)".',
        type: 'warning'
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
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Cetak & Unduh Laporan Program Kerja & Monitoring (Kop Resmi)
              </h3>
              <p className="text-xs text-slate-500">
                Laporan akuntabilitas realisasi program, serapan anggaran, dan evaluasi kurikulum
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showSettings
                  ? 'bg-teal-50 border-teal-300 text-teal-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Sesuaikan Nomor Dokumen, Tahun Ajaran, dan Pejabat Penandatangan"
            >
              <Settings2 className="w-4 h-4 text-teal-700" />
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
              className="px-4 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Unduh langsung berkas .pdf ke komputer"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-teal-200" />
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

        {/* Sub-bar: Mode Selection & Program Picker */}
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Format Laporan:</span>
            <div className="inline-flex rounded-xl p-0.5 bg-slate-200/80 border border-slate-300">
              <button
                type="button"
                onClick={() => setReportMode('collective')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  reportMode === 'collective'
                    ? 'bg-white text-teal-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-teal-700" />
                <span>Rekapitulasi Matriks Seluruh Proker ({programs.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setReportMode('individual')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  reportMode === 'individual'
                    ? 'bg-white text-teal-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-teal-700" />
                <span>Lembar Rincian & Evaluasi Proker Spesifik</span>
              </button>
            </div>
          </div>

          {reportMode === 'individual' && (
            <div className="flex items-center gap-2">
              <label htmlFor="select-program-report" className="font-semibold text-slate-600">
                Pilih Program Kerja:
              </label>
              <select
                id="select-program-report"
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="px-3 py-1 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800 text-xs shadow-2xs focus:outline-teal-600 cursor-pointer max-w-sm truncate"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.title} ({p.progress}%)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Collapsible Settings Panel */}
        {showSettings && (
          <div className="bg-teal-50/80 p-4 border-b border-teal-200 text-xs text-slate-700 shrink-0">
            <div className="font-bold text-teal-950 mb-2 flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-teal-700" />
              Kustomisasi Atribut Dokumen Monev (Kop & Pengesahan):
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
                  className="w-full px-2.5 py-1.5 bg-white border border-teal-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tahun Ajaran & Periode
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2024/2025"
                    className="w-1/2 px-2.5 py-1.5 bg-white border border-teal-300 rounded-lg text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                    placeholder="Semester Ganjil"
                    className="w-1/2 px-2.5 py-1.5 bg-white border border-teal-300 rounded-lg text-xs"
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
                    className="w-1/3 px-2 py-1.5 bg-white border border-teal-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-2/3 px-2 py-1.5 bg-white border border-teal-300 rounded-lg text-xs"
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
                  className="w-full px-2.5 py-1 bg-white border border-teal-300 rounded-lg text-xs mb-1"
                />
                <input
                  type="text"
                  value={principalNip}
                  onChange={(e) => setPrincipalNip(e.target.value)}
                  placeholder="NIP Kepala Sekolah"
                  className="w-full px-2.5 py-1 bg-white border border-teal-300 rounded-lg text-[10px] font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Paper Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-300/60 flex justify-center">
          <div
            ref={printAreaRef}
            id="program-printable-area"
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
                    <circle cx="50" cy="48" r="22" fill="#facc15" />
                    <path
                      d="M36 56 C42 54 48 55 50 57 C52 55 58 54 64 56 L64 64 C58 62 52 63 50 65 C48 63 42 62 36 64 Z"
                      fill="#ffffff"
                      stroke="#1e3a8a"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M50 32 C54 36 56 40 50 46 C44 40 46 36 50 32 Z"
                      fill="#ea580c"
                    />
                    <rect x="48" y="44" width="4" height="12" fill="#78350f" />
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

                {/* Right side Quality Badge */}
                <div className="hidden sm:flex flex-col items-center justify-center w-20 shrink-0 text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-teal-700 bg-teal-50 text-teal-900 flex flex-col items-center justify-center font-bold text-[9px] p-1">
                    <Award className="w-4 h-4 text-teal-700 mb-0.5" />
                    <span>MUTU A</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-600 mt-1 uppercase tracking-tight">
                    Unggul & Akuntabel
                  </span>
                </div>
              </div>

              {/* Official Double Border Line of Indonesian Government/School Letterhead */}
              <div className="mt-2 border-t-2 border-slate-950 pt-[1.5px] border-b border-slate-950" />
            </div>

            {/* REPORT TITLE */}
            <div className="text-center my-4">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-950 underline decoration-slate-900 decoration-1 underline-offset-4">
                {reportMode === 'collective'
                  ? 'LAPORAN MONITORING & EVALUASI (MONEV) PROGRAM KERJA KURIKULUM'
                  : 'LEMBAR LAPORAN & EVALUASI PROGRAM KERJA KURIKULUM'}
              </h2>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Tahun Ajaran {academicYear} — {reportPeriod}
              </p>
              <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                Nomor Dokumen: {docNumber}
              </p>
            </div>

            {/* COLLECTIVE MODE: TABLE OF ALL PROGRAMS */}
            {reportMode === 'collective' && (
              <div className="space-y-4 text-xs text-slate-900">
                {/* Executive Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border border-slate-800 rounded-lg p-2.5 bg-slate-50 text-center">
                  <div className="p-1.5 border-r border-slate-300">
                    <div className="text-[10px] text-slate-600 uppercase font-semibold">Total Proker</div>
                    <div className="text-lg font-extrabold text-slate-900">{programs.length} Program</div>
                  </div>
                  <div className="p-1.5 border-r border-slate-300">
                    <div className="text-[10px] text-slate-600 uppercase font-semibold">Pagu Anggaran</div>
                    <div className="text-sm font-extrabold text-slate-900 font-mono">
                      Rp {totalEstimated.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="p-1.5 border-r border-slate-300">
                    <div className="text-[10px] text-teal-800 uppercase font-semibold">Realisasi Serapan</div>
                    <div className="text-sm font-extrabold text-teal-800 font-mono">
                      Rp {totalRealized.toLocaleString('id-ID')} ({absorptionRate}%)
                    </div>
                  </div>
                  <div className="p-1.5 border-r border-slate-300">
                    <div className="text-[10px] text-slate-600 uppercase font-semibold">Sisa Anggaran</div>
                    <div className="text-sm font-extrabold text-slate-700 font-mono">
                      Rp {totalDifference.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="p-1.5">
                    <div className="text-[10px] text-emerald-800 uppercase font-semibold">Rerata Ketercapaian</div>
                    <div className="text-lg font-extrabold text-emerald-700 font-mono">{avgProgress}%</div>
                  </div>
                </div>

                {/* Master Table */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="bg-slate-200/90 text-slate-900 border-b border-slate-800">
                        <th className="py-2 px-1 text-center w-8">No</th>
                        <th className="py-2 px-1 text-center w-12">Kode</th>
                        <th className="py-2 px-2 text-left">Nama Program Kerja</th>
                        <th className="py-2 px-1.5 text-center">Tahun Ajaran</th>
                        <th className="py-2 px-1.5 text-left">PIC</th>
                        <th className="py-2 px-1.5 text-right">Pagu (Rp)</th>
                        <th className="py-2 px-1.5 text-right">Realisasi (Rp)</th>
                        <th className="py-2 px-1 text-center">Capaian</th>
                        <th className="py-2 px-1.5 text-center">Status</th>
                        <th className="py-2 px-2 text-left">Evaluasi & Catatan Keterlaksanaan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {programs.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-1.5 px-1 text-center font-bold">{idx + 1}</td>
                          <td className="py-1.5 px-1 text-center font-mono font-bold text-teal-900">{p.code}</td>
                          <td className="py-1.5 px-2">
                            <span className="font-bold text-slate-950 block">{p.title}</span>
                            <span className="text-[9px] text-slate-500">{p.category}</span>
                          </td>
                          <td className="py-1.5 px-1.5 text-center font-mono font-medium">
                            {p.academicYear || academicYear}
                          </td>
                          <td className="py-1.5 px-1.5 text-slate-800">{p.pic}</td>
                          <td className="py-1.5 px-1.5 text-right font-mono">
                            {p.budgetEstimated.toLocaleString('id-ID')}
                          </td>
                          <td className="py-1.5 px-1.5 text-right font-mono font-semibold text-teal-950">
                            {p.budgetRealized.toLocaleString('id-ID')}
                          </td>
                          <td className="py-1.5 px-1 text-center font-mono font-bold">
                            {p.progress}%
                          </td>
                          <td className="py-1.5 px-1.5 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                p.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-950'
                                  : p.status === 'in_progress'
                                  ? 'bg-teal-100 text-teal-950'
                                  : p.status === 'evaluation'
                                  ? 'bg-purple-100 text-purple-950'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {p.status === 'completed'
                                ? 'Selesai'
                                : p.status === 'in_progress'
                                ? 'Berjalan'
                                : p.status === 'evaluation'
                                ? 'Evaluasi'
                                : 'Belum Mulai'}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-[9.5px] leading-tight text-slate-800">
                            {p.evaluation || (
                              <span className="italic text-slate-400">
                                Program berjalan sesuai jadwal. Tidak ada kendala signifikan.
                              </span>
                            )}
                            {p.reportLink && (
                              <div className="mt-1 text-[9px] font-mono text-blue-900 bg-blue-50 px-1 py-0.5 rounded border border-blue-200 truncate">
                                📁 Drive: {p.reportLink}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-800 text-slate-950">
                        <td colSpan={5} className="py-2 px-2 text-right uppercase text-[10px]">
                          Total Pagu & Realisasi Kurikulum:
                        </td>
                        <td className="py-2 px-1.5 text-right font-mono">
                          Rp {totalEstimated.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-1.5 text-right font-mono text-teal-950">
                          Rp {totalRealized.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-1 text-center font-mono font-extrabold text-xs text-teal-900">
                          {avgProgress}%
                        </td>
                        <td colSpan={2} className="py-2 px-2 text-left text-[9.5px]">
                          Efisiensi Anggaran: <strong>{100 - absorptionRate > 0 ? `${100 - absorptionRate}% Sisa Pagu` : '100% Terserap'}</strong>
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

            {/* INDIVIDUAL PROGRAM REPORT */}
            {reportMode === 'individual' && currentProgram && (
              <div className="space-y-4 text-xs text-slate-900">
                {/* 1. Identitas Program Kerja */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wide">
                    I. Identitas & Rencana Program Kerja
                  </div>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="w-1/4 py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Kode & Nama Program</td>
                        <td colSpan={3} className="py-1.5 px-3 font-bold text-slate-950">
                          <span className="font-mono bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded text-[11px] mr-2">
                            {currentProgram.code}
                          </span>
                          {currentProgram.title}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Tahun Ajaran (Manual)</td>
                        <td className="py-1.5 px-3 font-mono font-bold text-teal-900">
                          {currentProgram.academicYear || academicYear}
                        </td>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Kategori Bidang</td>
                        <td className="py-1.5 px-3 font-semibold text-slate-900">{currentProgram.category}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Penanggung Jawab (PIC)</td>
                        <td className="py-1.5 px-3 font-medium text-slate-900">{currentProgram.pic}</td>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Target Periode</td>
                        <td className="py-1.5 px-3 text-slate-800">{currentProgram.targetPeriod}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Estimasi Pagu Anggaran</td>
                        <td className="py-1.5 px-3 font-mono">Rp {currentProgram.budgetEstimated.toLocaleString('id-ID')}</td>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Realisasi Penyerapan</td>
                        <td className="py-1.5 px-3 font-mono font-bold text-teal-900">
                          Rp {currentProgram.budgetRealized.toLocaleString('id-ID')} (
                          {Math.round((currentProgram.budgetRealized / (currentProgram.budgetEstimated || 1)) * 100)}%)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Tingkat Ketercapaian Fisik</td>
                        <td className="py-1.5 px-3 font-mono font-bold text-sm text-teal-950">
                          {currentProgram.progress}%
                        </td>
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Status Pelaksanaan</td>
                        <td className="py-1.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              currentProgram.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-950'
                                : currentProgram.status === 'in_progress'
                                ? 'bg-teal-100 text-teal-950'
                                : currentProgram.status === 'evaluation'
                                ? 'bg-purple-100 text-purple-950'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {currentProgram.status === 'completed'
                              ? 'Selesai 100%'
                              : currentProgram.status === 'in_progress'
                              ? 'Sedang Berjalan'
                              : currentProgram.status === 'evaluation'
                              ? 'Tahap Evaluasi'
                              : 'Belum Mulai'}
                          </span>
                        </td>
                      </tr>
                      <tr className="border-t border-slate-300">
                        <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Link Pelaporan (Google Drive)</td>
                        <td colSpan={3} className="py-1.5 px-3 font-mono text-[11px] text-blue-900 break-all">
                          {currentProgram.reportLink ? (
                            <span className="font-bold flex items-center gap-1.5">
                              <span>{currentProgram.reportLink}</span>
                              <span className="font-sans text-[10px] text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded shrink-0 border border-blue-200">
                                Tersimpan di Cloud Drive
                              </span>
                            </span>
                          ) : (
                            <span className="italic text-slate-400">Belum disertakan tautan Google Drive</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. Deskripsi & Indikator Ketercapaian */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wide">
                    II. Ruang Lingkup & Tolok Ukur Kinerja Program
                  </div>
                  <div className="p-3 space-y-2.5">
                    <div>
                      <strong className="text-slate-800 block font-bold mb-0.5">
                        A. Deskripsi Tujuan & Ruang Lingkup:
                      </strong>
                      <p className="text-slate-800 leading-relaxed bg-slate-50 p-2 rounded border border-slate-200">
                        {currentProgram.description || 'Program ini dirancang untuk mendukung peningkatan mutu pembelajaran, akreditasi sekolah, dan penguatan implementasi Kurikulum Merdeka.'}
                      </p>
                    </div>
                    <div>
                      <strong className="text-teal-950 block font-bold mb-0.5">
                        B. Indikator Ketercapaian Keberhasilan (Key Performance Indicators):
                      </strong>
                      <p className="text-slate-800 leading-relaxed bg-teal-50/50 p-2 rounded border border-teal-200">
                        {currentProgram.indicators || 'Tersusunnya perangkat dokumen pembelajaran lengkap, 100% dewan guru terfasilitasi, dan pelaporan tuntas tepat waktu.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Milestone Tahapan Kerja */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wide flex items-center justify-between">
                    <span>III. Tahapan Kerja Kunci & Pelaksanaan Milestone</span>
                    <span className="text-[10px] font-mono text-slate-600 lowercase font-normal">
                      ({currentProgram.milestones.filter((m) => m.completed).length} dari {currentProgram.milestones.length} tahapan selesai)
                    </span>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-200/90 text-slate-900 border-b border-slate-800 text-[11px]">
                        <th className="py-1.5 px-2 text-center w-10">No</th>
                        <th className="py-1.5 px-3 text-left">Uraian Tahapan Pelaksanaan</th>
                        <th className="py-1.5 px-3 text-center w-36">Target Tanggal</th>
                        <th className="py-1.5 px-3 text-center w-28">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {currentProgram.milestones.map((m, idx) => (
                        <tr key={m.id || idx}>
                          <td className="py-1.5 px-2 text-center font-bold">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-medium text-slate-900">
                            {m.title}
                          </td>
                          <td className="py-1.5 px-3 text-center font-mono text-[11px] text-slate-700">
                            {m.dueDate || '-'}
                          </td>
                          <td className="py-1.5 px-3 text-center font-bold text-[11px]">
                            {m.completed ? (
                              <span className="text-emerald-800">Tuntas (Selesai)</span>
                            ) : (
                              <span className="text-amber-800">Dalam Proses</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 4. Evaluasi & Catatan Keterlaksanaan Program */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <div className="bg-amber-100/80 px-3 py-1.5 font-bold text-amber-950 border-b border-slate-800 text-[11px] uppercase tracking-wide flex items-center justify-between">
                    <span>IV. Evaluasi & Catatan Keterlaksanaan Program (Monev)</span>
                    <span className="text-[10px] text-amber-900 font-semibold lowercase font-normal">
                      Hasil telaah & umpan balik kurikulum
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50/40">
                    <p className="text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-amber-200 text-xs">
                      {currentProgram.evaluation || (
                        <span className="italic text-slate-500">
                          Program kerja telah berjalan sesuai perencanaan awal tahun ajaran. Penyerapan anggaran termonitor dengan baik dan tidak ada kendala material yang menghambat ketercapaian target mutu.
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* 5. Tautan Dokumen Pelaporan & Bukti Fisik Digital (Google Drive) */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <div className="bg-blue-100/80 px-3 py-1.5 font-bold text-blue-950 border-b border-slate-800 text-[11px] uppercase tracking-wide flex items-center justify-between">
                    <span>V. Dokumen Bukti & Tautan Pelaporan (Google Drive)</span>
                    <span className="text-[10px] text-blue-900 font-semibold lowercase font-normal">
                      Arsip digital bukti fisik
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50/40 text-xs text-slate-800 space-y-1">
                    <p className="font-semibold text-blue-950">
                      Tautan Berkas Pelaporan, LPJ, & Dokumentasi Kegiatan:
                    </p>
                    {currentProgram.reportLink ? (
                      <p className="font-mono text-[11px] text-blue-900 break-all bg-white p-2.5 rounded-lg border border-blue-300 font-bold">
                        {currentProgram.reportLink}
                      </p>
                    ) : (
                      <p className="italic text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                        Belum ada tautan berkas laporan Google Drive yang dilampirkan pada program kerja ini.
                      </p>
                    )}
                  </div>
                </div>

                {/* 6. Lembar Pengesahan (2 Tanda Tangan Resmi) */}
                <div className="pt-4 no-break">
                  <div className="text-right text-xs mb-3 text-slate-800">
                    {reportCity}, {reportDate}
                  </div>
                  <div className="grid grid-cols-2 gap-12 text-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">Penanggung Jawab Proker / Waka Kurikulum,</p>
                      <div className="h-20 flex items-end justify-center">
                        <div className="w-52 border-b border-slate-900" />
                      </div>
                      <p className="font-bold text-slate-950 mt-1">{currentProgram.pic}</p>
                      <p className="text-[10px] text-slate-600">Tim Pengembang Kurikulum</p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-700">Mengetahui,</p>
                      <p className="font-bold text-slate-900 uppercase">Kepala SMA Plus PGRI Cibinong</p>
                      <div className="h-20 flex items-end justify-center relative">
                        {/* Decorative stamp circle watermark */}
                        <div className="absolute top-2 w-16 h-16 rounded-full border border-teal-800/40 text-teal-900/40 flex items-center justify-center text-[7px] font-extrabold uppercase transform -rotate-12 pointer-events-none">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
