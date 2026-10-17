import { useState } from 'react';
import { Teacher, TeacherCluster, EmploymentType } from '../types';
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Trash2,
  Table,
  FileText,
  RefreshCw
} from 'lucide-react';
import { broadcastToast } from '../services/notificationService';
import {
  downloadNativeExcel,
  downloadSemicolonCsv,
  parseDelimitedText
} from '../utils/excelHelper';

interface TeacherImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (teachers: Teacher[]) => void;
}

const DEFAULT_SAMPLE_TEACHERS: Teacher[] = [
  {
    id: 'tch-samp-1',
    name: 'Dr. Aris Sudarsono, M.Pd.',
    nip: '197509182001121003',
    subject: 'Fisika Terapan',
    subjectCluster: 'MIPA',
    employmentStatus: 'PNS',
    education: 'S3',
    teachingHours: 24,
    phone: '0812-9988-7711',
    email: 'aris.sudarsono@smapluspgri-cibinong.sch.id',
    additionalRole: 'Koordinator Laboratorium Sains',
    certificationStatus: true,
  },
  {
    id: 'tch-samp-2',
    name: 'Dewi Anggraini, S.Pd.',
    nip: '199104052019022015',
    subject: 'Matematika Wajib',
    subjectCluster: 'MIPA',
    employmentStatus: 'GTY / Tetap Yayasan',
    education: 'S1',
    teachingHours: 24,
    phone: '0857-1234-5678',
    email: 'dewi.anggraini@smapluspgri-cibinong.sch.id',
    additionalRole: 'Wali Kelas X-2',
    certificationStatus: true,
  },
  {
    id: 'tch-samp-3',
    name: 'Fajar Nugroho, S.Kom.',
    nip: '199411122022031006',
    subject: 'Desain Grafis & AI',
    subjectCluster: 'Informatika & Vokasi',
    employmentStatus: 'GTY / Tetap Yayasan',
    education: 'S1',
    teachingHours: 22,
    phone: '0813-8899-0011',
    email: 'fajar.nugroho@smapluspgri-cibinong.sch.id',
    additionalRole: 'Pembina Ekskul Robotik & Coding',
    certificationStatus: false,
  },
  {
    id: 'tch-samp-4',
    name: 'Lina Marlina, S.Pd., M.Pd.',
    nip: '198306202008012018',
    subject: 'Ekonomi & Kewirausahaan',
    subjectCluster: 'Sosial Humaniora',
    employmentStatus: 'PNS',
    education: 'S2',
    teachingHours: 24,
    phone: '0812-3456-7890',
    email: 'lina.marlina@smapluspgri-cibinong.sch.id',
    additionalRole: 'Wali Kelas XI IPS Plus',
    certificationStatus: true,
  },
  {
    id: 'tch-samp-5',
    name: 'Rizky Pratama, S.Pd.',
    nip: '199508172023011002',
    subject: 'PJOK & Kebugaran',
    subjectCluster: 'Seni & Penjas',
    employmentStatus: 'PPPK',
    education: 'S1',
    teachingHours: 26,
    phone: '0819-2233-4455',
    email: 'rizky.pratama@smapluspgri-cibinong.sch.id',
    additionalRole: 'Pelatih Prestasi Olahraga',
    certificationStatus: true,
  },
];

export function TeacherImportModal({ isOpen, onClose, onImport }: TeacherImportModalProps) {
  const [activeTab, setActiveTab] = useState<'grid' | 'raw'>('grid');
  const [items, setItems] = useState<Teacher[]>(DEFAULT_SAMPLE_TEACHERS);
  const [rawCsvText, setRawCsvText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Modify individual cell per column in the grid
  const handleUpdateCell = (index: number, field: keyof Teacher, value: unknown) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddRow = () => {
    const newTeacher: Teacher = {
      id: `tch-row-${Date.now()}`,
      name: '',
      nip: '198' + Math.floor(Math.random() * 8999999999999 + 1000000000000),
      subject: '',
      subjectCluster: 'MIPA',
      employmentStatus: 'GTY / Tetap Yayasan',
      education: 'S1',
      teachingHours: 24,
      certificationStatus: true,
    };
    setItems((prev) => [...prev, newTeacher]);
  };

  const handleDeleteRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    if (confirm('Hapus seluruh baris di tabel impor?')) {
      setItems([]);
      setRawCsvText('');
      setErrorMsg(null);
    }
  };

  const handleLoadSample = () => {
    setItems(DEFAULT_SAMPLE_TEACHERS);
    setErrorMsg(null);
    broadcastToast({
      title: 'Contoh Data Dimuat',
      message: '5 data guru siap dikelola per kolom.',
      type: 'info',
    });
  };

  // Parse raw pasted CSV/Excel text into items
  const handleParseRawText = (text: string) => {
    setRawCsvText(text);
    setErrorMsg(null);
    if (!text.trim()) return;

    const parsedRows = parseDelimitedText(text);

    if (parsedRows.length < 2) {
      setErrorMsg('Data spreadsheet harus memiliki baris judul kolom (header) dan minimal 1 baris data guru.');
      return;
    }

    // Skip header row
    const dataRows = parsedRows.slice(1);
    const result: Teacher[] = [];

    dataRows.forEach((cols, idx) => {
      if (cols.length >= 2 && cols[0]) {
        result.push({
          id: `tch-imp-${Date.now()}-${idx}`,
          name: cols[0],
          nip: cols[1] || '198' + Math.floor(Math.random() * 8999999999999 + 1000000000000),
          subject: cols[2] || 'Mata Pelajaran',
          subjectCluster: (cols[3] || 'MIPA') as TeacherCluster,
          employmentStatus: (cols[4] || 'GTY / Tetap Yayasan') as EmploymentType,
          education: (cols[5] === 'S2' || cols[5] === 'S3' ? cols[5] : 'S1') as 'S1' | 'S2' | 'S3',
          teachingHours: Number(cols[6]) || 24,
          phone: cols[7] || undefined,
          email: cols[8] || undefined,
          additionalRole: cols[9] || undefined,
          certificationStatus:
            cols[10]?.toLowerCase().includes('ya') ||
            cols[10]?.toLowerCase().includes('lulus') ||
            cols[10]?.toLowerCase().includes('true'),
        });
      }
    });

    if (result.length === 0) {
      setErrorMsg('Data spreadsheet tidak terbaca. Pastikan terdapat kolom Nama Guru dan Mata Pelajaran.');
    } else {
      setItems(result);
      setActiveTab('grid');
      broadcastToast({
        title: 'Berhasil Membaca Kolom Excel/Spreadsheet',
        message: `${result.length} data guru berhasil ditempatkan ke kolom masing-masing secara rapi.`,
        type: 'success',
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleParseRawText(text);
    };
    reader.readAsText(file);
  };

  const headers = [
    'Nama Lengkap & Gelar',
    'NIP / NUPTK',
    'Mata Pelajaran',
    'Rumpun Mata Pelajaran',
    'Status Kepegawaian',
    'Pendidikan',
    'Beban Jam Mengajar',
    'No Telepon / WhatsApp',
    'Email Resmi',
    'Tugas Tambahan',
    'Status Sertifikasi (Ya/Tidak)'
  ];

  const sampleRows: (string | number)[][] = [
    [
      'Dr. Aris Sudarsono, M.Pd.',
      '197509182001121003',
      'Fisika Terapan',
      'MIPA',
      'PNS',
      'S3',
      24,
      '0812-9988-7711',
      'aris.sudarsono@smapluspgri-cibinong.sch.id',
      'Koordinator Laboratorium Sains',
      'Ya'
    ],
    [
      'Dewi Anggraini, S.Pd.',
      '199104052019022015',
      'Matematika Wajib',
      'MIPA',
      'GTY / Tetap Yayasan',
      'S1',
      24,
      '0857-1234-5678',
      'dewi.anggraini@smapluspgri-cibinong.sch.id',
      'Wali Kelas X-2',
      'Ya'
    ],
    [
      'Fajar Nugroho, S.Kom.',
      '199411122022031006',
      'Desain Grafis & AI',
      'Informatika & Vokasi',
      'GTY / Tetap Yayasan',
      'S1',
      22,
      '0813-8899-0011',
      'fajar.nugroho@smapluspgri-cibinong.sch.id',
      'Pembina Ekskul Robotik & Coding',
      'Tidak'
    ],
    [
      'Lina Marlina, S.Pd., M.Pd.',
      '198306202008012018',
      'Ekonomi & Kewirausahaan',
      'Sosial Humaniora',
      'PNS',
      'S2',
      24,
      '0812-3456-7890',
      'lina.marlina@smapluspgri-cibinong.sch.id',
      'Wali Kelas XI IPS Plus',
      'Ya'
    ],
    [
      'Rizky Pratama, S.Pd.',
      '199508172023011002',
      'PJOK & Kebugaran',
      'Seni & Penjas',
      'PPPK',
      'S1',
      26,
      '0819-2233-4455',
      'rizky.pratama@smapluspgri-cibinong.sch.id',
      'Pelatih Prestasi Olahraga',
      'Ya'
    ]
  ];

  // Download real native Excel (.xls table) - Opens directly with real columns A, B, C, D in MS Excel
  const handleDownloadExcelTemplate = () => {
    downloadNativeExcel(
      'template_impor_data_guru_per_kolom_sma_plus_pgri_cibinong.xls',
      headers,
      sampleRows,
      'Data Guru'
    );
    broadcastToast({
      title: 'Template Excel Diunduh',
      message: 'File Excel langsung terbuka per kolom (Kolom A, B, C...) tanpa tanda koma.',
      type: 'success',
    });
  };

  // Download Semicolon CSV (Indonesian Excel friendly with UTF-8 BOM)
  const handleDownloadCsvTemplate = () => {
    downloadSemicolonCsv(
      'template_impor_data_guru_per_kolom_sma_plus_pgri_cibinong.csv',
      headers,
      sampleRows
    );
    broadcastToast({
      title: 'Template CSV Diunduh',
      message: 'Format CSV titik-koma siap dibuka rapi per kolom di Excel.',
      type: 'info',
    });
  };

  const handleSaveImport = () => {
    const validRows = items.filter((t) => t.name.trim() && t.subject.trim());
    if (validRows.length === 0) {
      alert('Mohon isi minimal 1 data guru dengan Nama dan Mata Pelajaran yang lengkap.');
      return;
    }

    onImport(validRows);
    broadcastToast({
      title: 'Impor Guru Berhasil!',
      message: `${validRows.length} data guru telah disimpan ke master data pendidik.`,
      type: 'success',
    });
    onClose();
  };

  const validCount = items.filter((t) => t.name.trim() && t.subject.trim()).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Impor Data Guru Otomatis</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200">
                  Tampilan Kolom Rapi
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Kelola per kolom dengan mudah: edit langsung di tabel, unggah file CSV, atau tempel data spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Action Toolbar */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'grid'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabel Kolom ({items.length} Baris)</span>
            </button>

            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'raw'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tempel / Unggah CSV</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-teal-600" />
              <span>Pilih File CSV</span>
              <input
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleDownloadExcelTemplate}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Unduh format template Excel (.xls) - langsung terbuka rapi per kolom A, B, C... di Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Format Excel (.xls Kolom Rapi)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsvTemplate}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Unduh format CSV titik-koma (;) standar Excel"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Format CSV (;)</span>
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Muat Contoh 5 Guru</span>
            </button>

            {activeTab === 'grid' && (
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </button>
            )}

            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Bersihkan Semua Baris"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/40">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'grid' ? (
            <div className="space-y-3">
              {/* Table Container per column */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto max-h-[460px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 text-center w-10">No</th>
                        <th className="p-2.5 min-w-[190px]">Nama Lengkap & Gelar *</th>
                        <th className="p-2.5 min-w-[150px]">NIP / NUPTK</th>
                        <th className="p-2.5 min-w-[170px]">Mata Pelajaran *</th>
                        <th className="p-2.5 min-w-[130px]">Rumpun</th>
                        <th className="p-2.5 min-w-[140px]">Status Kerja</th>
                        <th className="p-2.5 min-w-[80px]">Pendidikan</th>
                        <th className="p-2.5 min-w-[80px]">Jam/Mg</th>
                        <th className="p-2.5 min-w-[100px] text-center">Sertifikasi</th>
                        <th className="p-2.5 min-w-[160px]">Tugas Tambahan</th>
                        <th className="p-2.5 text-center w-12">Hapus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="p-12 text-center text-slate-400">
                            Belum ada baris guru. Klik tombol <strong>+ Tambah Baris</strong> atau{' '}
                            <strong>Muat Contoh 5 Guru</strong> di atas.
                          </td>
                        </tr>
                      ) : (
                        items.map((row, idx) => {
                          const isRowValid = row.name.trim() && row.subject.trim();
                          return (
                            <tr
                              key={row.id || idx}
                              className={`transition-colors ${
                                isRowValid ? 'hover:bg-slate-50' : 'bg-rose-50/50 hover:bg-rose-50'
                              }`}
                            >
                              <td className="p-2 text-center font-mono text-[11px] text-slate-400">
                                {idx + 1}
                              </td>

                              {/* Kolom 1: Nama Lengkap */}
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.name}
                                  placeholder="Nama lengkap & gelar"
                                  onChange={(e) => handleUpdateCell(idx, 'name', e.target.value)}
                                  className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-semibold bg-white"
                                />
                              </td>

                              {/* Kolom 2: NIP */}
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.nip}
                                  placeholder="NIP/NUPTK"
                                  onChange={(e) => handleUpdateCell(idx, 'nip', e.target.value)}
                                  className="w-full px-2 py-1 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                                />
                              </td>

                              {/* Kolom 3: Mata Pelajaran */}
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.subject}
                                  placeholder="Mata pelajaran"
                                  onChange={(e) => handleUpdateCell(idx, 'subject', e.target.value)}
                                  className="w-full px-2.5 py-1 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 text-emerald-800 bg-white"
                                />
                              </td>

                              {/* Kolom 4: Rumpun */}
                              <td className="p-2">
                                <select
                                  value={row.subjectCluster}
                                  onChange={(e) =>
                                    handleUpdateCell(idx, 'subjectCluster', e.target.value as TeacherCluster)
                                  }
                                  className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                                >
                                  <option value="MIPA">MIPA</option>
                                  <option value="Bahasa">Bahasa</option>
                                  <option value="Sosial Humaniora">IPS</option>
                                  <option value="Informatika & Vokasi">Informatika</option>
                                  <option value="Seni & Penjas">Seni/PJOK</option>
                                  <option value="Lainnya">Lainnya</option>
                                </select>
                              </td>

                              {/* Kolom 5: Status */}
                              <td className="p-2">
                                <select
                                  value={row.employmentStatus}
                                  onChange={(e) =>
                                    handleUpdateCell(idx, 'employmentStatus', e.target.value as EmploymentType)
                                  }
                                  className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                                >
                                  <option value="GTY / Tetap Yayasan">GTY Yayasan</option>
                                  <option value="PNS">PNS</option>
                                  <option value="PPPK">PPPK</option>
                                  <option value="Guru Honorer">Honorer</option>
                                </select>
                              </td>

                              {/* Kolom 6: Pendidikan */}
                              <td className="p-2">
                                <select
                                  value={row.education}
                                  onChange={(e) => handleUpdateCell(idx, 'education', e.target.value)}
                                  className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                                >
                                  <option value="S1">S1</option>
                                  <option value="S2">S2</option>
                                  <option value="S3">S3</option>
                                </select>
                              </td>

                              {/* Kolom 7: Beban Jam */}
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="2"
                                  max="40"
                                  value={row.teachingHours}
                                  onChange={(e) => handleUpdateCell(idx, 'teachingHours', Number(e.target.value))}
                                  className="w-full px-1.5 py-1 text-xs font-mono font-bold text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                                />
                              </td>

                              {/* Kolom 8: Sertifikasi */}
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCell(idx, 'certificationStatus', !row.certificationStatus)}
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                                    row.certificationStatus
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                                  }`}
                                >
                                  {row.certificationStatus ? 'Lulus' : 'Belum'}
                                </button>
                              </td>

                              {/* Kolom 9: Tugas Tambahan */}
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.additionalRole || ''}
                                  placeholder="Wali Kelas/Koordinator P5"
                                  onChange={(e) => handleUpdateCell(idx, 'additionalRole', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                                />
                              </td>

                              {/* Kolom 10: Delete */}
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRow(idx)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Hapus baris ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Baris Valid: <strong className="text-teal-700 font-bold">{validCount}</strong> dari {items.length} baris
                </span>
                <span className="text-[11px] text-slate-400">
                  Tip: Setiap item berada dalam kolom terpisah dan dapat diedit secara langsung sebelum disimpan.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Tempel (Paste) Teks CSV / Salinan Kolom dari Excel atau Google Sheets:
              </label>
              <textarea
                rows={8}
                value={rawCsvText}
                onChange={(e) => setRawCsvText(e.target.value)}
                placeholder="Nama,NIP,Mata Pelajaran,Rumpun,Status Kepegawaian,Pendidikan,Beban Jam,No HP,Email,Tugas Tambahan,Sertifikasi&#10;Dr. Aris Sudarsono,19750918...,Fisika Terapan,MIPA,PNS,S3,24,0812...,aris@...,Koordinator Lab,Ya"
                className="w-full px-4 py-3 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-slate-900 text-slate-100"
              />
              <button
                type="button"
                onClick={() => handleParseRawText(rawCsvText)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Table className="w-4 h-4" />
                <span>Konversi ke Tabel Kolom Rapi</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/90">
          <div className="text-xs text-slate-600">
            {validCount > 0 ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {validCount} data guru siap diimpor ke sistem
              </span>
            ) : (
              <span className="text-slate-400">Isi data guru di tabel kolom untuk melanjutkan.</span>
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
              type="button"
              disabled={validCount === 0}
              onClick={handleSaveImport}
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Impor {validCount} Guru</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
