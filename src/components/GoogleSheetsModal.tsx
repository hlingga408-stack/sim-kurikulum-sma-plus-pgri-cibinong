import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  Layers,
  FileSpreadsheet,
  HelpCircle,
  Copy,
  Check,
  Server,
  Zap,
} from 'lucide-react';
import {
  getConnectionStatus,
  getSavedGasUrl,
  saveGasUrl,
  isRunningInGas,
  getSpreadsheetInfo,
  initSpreadsheetDatabase,
  fetchAllDataFromSheets,
  syncAllDataToSheets,
  SpreadsheetInfo,
  FullDataset,
} from '../services/gasService';
import { broadcastToast } from '../services/notificationService';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDataset: FullDataset;
  onDataLoadedFromSheets: (dataset: FullDataset) => void;
}

export function GoogleSheetsModal({
  isOpen,
  onClose,
  currentDataset,
  onDataLoadedFromSheets,
}: GoogleSheetsModalProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'sync' | 'guide'>('status');
  const [gasUrlInput, setGasUrlInput] = useState<string>('');
  const [spreadsheetInfo, setSpreadsheetInfo] = useState<SpreadsheetInfo | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncingToSheets, setIsSyncingToSheets] = useState(false);
  const [isPullingFromSheets, setIsPullingFromSheets] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const status = getConnectionStatus();
  const isNative = isRunningInGas();

  useEffect(() => {
    if (isOpen) {
      setGasUrlInput(getSavedGasUrl());
      setErrorMessage(null);
      if (status.isReady) {
        handleTestConnection(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    saveGasUrl(gasUrlInput);
    broadcastToast({
      title: 'Pengaturan Disimpan',
      message: gasUrlInput.trim()
        ? 'URL Google Apps Script telah diperbarui.'
        : 'Kembali ke mode penyimpanan lokal.',
      type: 'info',
    });
    handleTestConnection(true);
  };

  const handleTestConnection = async (showToast = true) => {
    setIsTesting(true);
    setErrorMessage(null);
    try {
      const info = await getSpreadsheetInfo();
      setSpreadsheetInfo(info);
      if (showToast) {
        broadcastToast({
          title: 'Koneksi Berhasil!',
          message: `Terhubung ke Google Spreadsheet: "${info.name}"`,
          type: 'success',
        });
      }
    } catch (err: any) {
      setSpreadsheetInfo(null);
      setErrorMessage(err.message || 'Gagal menghubungi Google Apps Script.');
      if (showToast) {
        broadcastToast({
          title: 'Koneksi Gagal',
          message: err.message || 'Periksa kembali URL Web App atau izin akses Apps Script.',
          type: 'alert',
        });
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleInitDatabase = async () => {
    setIsInitializing(true);
    try {
      const res = await initSpreadsheetDatabase();
      broadcastToast({
        title: 'Inisialisasi Berhasil',
        message: res.message || 'Struktur 8 tabel berhasil dibuat di Google Spreadsheet.',
        type: 'success',
      });
      await handleTestConnection(false);
    } catch (err: any) {
      broadcastToast({
        title: 'Inisialisasi Gagal',
        message: err.message || 'Terjadi kesalahan saat membuat tabel.',
        type: 'alert',
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handlePullFromSheets = async () => {
    setIsPullingFromSheets(true);
    try {
      const dataset = await fetchAllDataFromSheets();
      onDataLoadedFromSheets(dataset);
      broadcastToast({
        title: 'Data Berhasil Ditarik',
        message: `Memuat ${dataset.teachers?.length || 0} guru, ${dataset.documents?.length || 0} dokumen, dan modul lainnya dari Google Sheets.`,
        type: 'success',
      });
      await handleTestConnection(false);
    } catch (err: any) {
      broadcastToast({
        title: 'Gagal Menarik Data',
        message: err.message || 'Gagal membaca data dari Google Sheets.',
        type: 'alert',
      });
    } finally {
      setIsPullingFromSheets(false);
    }
  };

  const handleSyncToSheets = async () => {
    setIsSyncingToSheets(true);
    try {
      const res = await syncAllDataToSheets(currentDataset);
      broadcastToast({
        title: 'Sinkronisasi Selesai!',
        message: res.message || 'Seluruh data lokal berhasil disimpan ke Google Sheets.',
        type: 'success',
      });
      await handleTestConnection(false);
    } catch (err: any) {
      broadcastToast({
        title: 'Sinkronisasi Gagal',
        message: err.message || 'Terjadi kesalahan saat mengunggah data ke Google Sheets.',
        type: 'alert',
      });
    } finally {
      setIsSyncingToSheets(false);
    }
  };

  const copyCodePath = () => {
    navigator.clipboard.writeText('gas/Code.gs');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Integrasi Google Sheets & Apps Script</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  Google Drive
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Penyimpanan awan terpusat Kurikulum SMA Plus PGRI Cibinong
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Status Koneksi & Database</span>
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'sync'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sinkronisasi Data</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Panduan Setup GAS</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Status Card */}
              <div
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                  spreadsheetInfo
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : isNative
                    ? 'bg-teal-50/70 border-teal-200'
                    : 'bg-amber-50/70 border-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-lg text-white shrink-0 mt-0.5 ${
                      spreadsheetInfo ? 'bg-emerald-600' : isNative ? 'bg-teal-600' : 'bg-amber-600'
                    }`}
                  >
                    {spreadsheetInfo ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isNative ? (
                      <Server className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {spreadsheetInfo
                        ? 'Terhubung ke Google Spreadsheet'
                        : isNative
                        ? 'Berjalan di Lingkungan Google Apps Script'
                        : 'Mode Penyimpanan Lokal (Belum Terhubung)'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {spreadsheetInfo ? (
                        <>
                          Nama file: <span className="font-semibold text-slate-800">{spreadsheetInfo.name}</span>
                        </>
                      ) : isNative ? (
                        'Aplikasi mengeksekusi langsung fungsi Apps Script internal.'
                      ) : (
                        'Data tersimpan di penyimpanan peramban lokal. Masukkan URL Web App Google Apps Script di bawah untuk mengaktifkan sinkronisasi awan.'
                      )}
                    </p>

                    {spreadsheetInfo && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <a
                          href={spreadsheetInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Buka Google Spreadsheet</span>
                        </a>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ID: {spreadsheetInfo.id.slice(0, 16)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleTestConnection(true)}
                  disabled={isTesting}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Memeriksa...' : 'Cek Status'}</span>
                </button>
              </div>

              {/* URL Input Form (Hanya jika bukan iframe native GAS) */}
              {!isNative && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    URL Web App Google Apps Script (GAS)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    URL deployment Web App berakhiran <code className="bg-slate-200 px-1 py-0.5 rounded">/exec</code> yang didapat dari menu <em>Deploy &gt; Web app</em> di editor Apps Script.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={gasUrlInput}
                      onChange={(e) => setGasUrlInput(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                    <button
                      onClick={handleSaveUrl}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Simpan & Hubungkan
                    </button>
                  </div>
                  {errorMessage && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                      <strong>Kesalahan:</strong> {errorMessage}
                    </div>
                  )}
                </div>
              )}

              {/* Sheet Breakdown Cards */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Struktur Lembar Kerja (8 Modul)</span>
                  </h4>
                  <button
                    onClick={handleInitDatabase}
                    disabled={isInitializing || (!spreadsheetInfo && !isNative)}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isInitializing ? 'Menginisialisasi...' : 'Inisialisasi Tabel Otomatis'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'GURU', label: 'Data Guru', count: currentDataset.teachers?.length || 0, color: 'text-blue-700 bg-blue-50 border-blue-200' },
                    { key: 'DOKUMEN', label: 'Dokumen', count: currentDataset.documents?.length || 0, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                    { key: 'PROKER', label: 'Program Kerja', count: currentDataset.programs?.length || 0, color: 'text-amber-700 bg-amber-50 border-amber-200' },
                    { key: 'SUPERVISI', label: 'Supervisi Klinis', count: currentDataset.supervisions?.length || 0, color: 'text-purple-700 bg-purple-50 border-purple-200' },
                    { key: 'JADWAL', label: 'Kalender & Jadwal', count: currentDataset.events?.length || 0, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
                    { key: 'RAPAT', label: 'Rapat & Notulen', count: currentDataset.meetings?.length || 0, color: 'text-rose-700 bg-rose-50 border-rose-200' },
                    { key: 'DISPOSISI', label: 'Disposisi Surat', count: currentDataset.dispositions?.length || 0, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
                    { key: 'RTL_RAPAT', label: 'RTL Rapat & Proker', count: currentDataset.meetingRtls?.length || 0, color: 'text-teal-700 bg-teal-50 border-teal-200' },
                  ].map((item) => (
                    <div key={item.key} className={`p-3 rounded-xl border ${item.color}`}>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">{item.key}</div>
                      <div className="text-sm font-extrabold mt-0.5">{item.label}</div>
                      <div className="text-xs font-semibold mt-1 opacity-90">{item.count} Baris Data</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed">
                <strong className="block mb-1 text-sm font-bold">Sinkronisasi Dua Arah Google Sheets</strong>
                Anda dapat mengirimkan seluruh perubahan yang Anda buat di aplikasi ke lembar kerja Google Sheets di Google Drive, atau mengambil data terbaru yang dimasukkan oleh staf/rekan kerja secara kolaboratif.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload to Sheets */}
                <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Unggah ke Google Sheets</h4>
                    <p className="text-xs text-slate-500">
                      Menyimpan seluruh data lokal saat ini (Guru, Dokumen, Proker, Supervisi, Jadwal, Rapat, Disposisi, RTL) ke Google Spreadsheet.
                    </p>
                  </div>
                  <button
                    onClick={handleSyncToSheets}
                    disabled={isSyncingToSheets || (!spreadsheetInfo && !isNative)}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className={`w-4 h-4 ${isSyncingToSheets ? 'animate-bounce' : ''}`} />
                    <span>{isSyncingToSheets ? 'Menyinkronkan...' : 'Unggah Semua Data Sekarang'}</span>
                  </button>
                </div>

                {/* Pull from Sheets */}
                <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                      <DownloadCloud className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Tarik dari Google Sheets</h4>
                    <p className="text-xs text-slate-500">
                      Memuat data terbaru dari Google Spreadsheet ke dalam aplikasi untuk memperbarui tampilan dashboard dan daftar modul.
                    </p>
                  </div>
                  <button
                    onClick={handlePullFromSheets}
                    disabled={isPullingFromSheets || (!spreadsheetInfo && !isNative)}
                    className="w-full py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <DownloadCloud className={`w-4 h-4 ${isPullingFromSheets ? 'animate-bounce' : ''}`} />
                    <span>{isPullingFromSheets ? 'Mengambil Data...' : 'Tarik Data Terbaru'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-emerald-900 text-sm">
                    Kode Backend Google Apps Script (Code.gs)
                  </div>
                  <button
                    onClick={copyCodePath}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-emerald-300 text-emerald-800 text-[11px] font-semibold hover:bg-emerald-100 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin' : 'gas/Code.gs'}</span>
                  </button>
                </div>
                <p className="text-emerald-800 text-xs mt-1">
                  File backend siap pakai telah dibuat di folder <code>gas/Code.gs</code>.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Langkah Pengaturan 5 Menit:</h4>
                <ol className="list-decimal list-inside space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <li>
                    <strong>Buka Google Drive</strong> dan buat <em>Google Spreadsheet</em> baru (beri nama misalnya: <code>SIM Kurikulum SMA Plus PGRI Cibinong</code>).
                  </li>
                  <li>
                    Di dalam spreadsheet tersebut, klik menu <strong>Ekstensi &gt; Apps Script</strong>.
                  </li>
                  <li>
                    Ganti seluruh isi file <code>Code.gs</code> dengan kode yang ada di dalam file <code>gas/Code.gs</code> proyek ini.
                  </li>
                  <li>
                    (Opsional) Jika ingin menggunakan AI Gemini, klik <strong>Project Settings (Ikon Gerigi) &gt; Script Properties</strong>, tambahkan property <code>GEMINI_API_KEY</code> dengan API Key Google AI Studio Anda.
                  </li>
                  <li>
                    Klik menu <strong>Terapkan (Deploy) &gt; Penerapan Baru (New Deployment)</strong>:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-slate-600">
                      <li>Jenis: <strong>Aplikasi Web (Web App)</strong></li>
                      <li>Jalankan sebagai: <strong>Saya (Me)</strong></li>
                      <li>Akses: <strong>Siapa saja (Anyone)</strong></li>
                    </ul>
                  </li>
                  <li>
                    Salin <strong>URL Aplikasi Web (Web App URL)</strong> yang didapat, lalu tempelkan ke tab <em>Status Koneksi & Database</em> di modal ini dan klik <strong>Simpan & Hubungkan</strong>.
                  </li>
                  <li>
                    Klik tombol <strong>Inisialisasi Tabel Otomatis</strong> untuk membuat tab sheet dan header secara instan. Selesai!
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Database: Google Drive • Ekstensi: Google Apps Script 2026
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
