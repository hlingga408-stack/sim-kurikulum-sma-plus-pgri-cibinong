import { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Menu,
  X,
  Volume2,
  Calendar,
  Sparkles,
  Award,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Cloud,
} from 'lucide-react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  showBrowserNotification,
} from '../services/notificationService';
import { SyncStatusInfo } from '../services/gasService';

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onOpenAI: () => void;
  onOpenDatabase?: () => void;
  isDatabaseConnected?: boolean;
  syncInfo?: SyncStatusInfo;
  upcomingCount: number;
}

export function Navbar({
  onToggleSidebar,
  sidebarOpen,
  onOpenAI,
  onOpenDatabase,
  isDatabaseConnected = false,
  syncInfo,
  upcomingCount,
}: NavbarProps) {
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEnablePush = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
  };

  const handleTestPush = () => {
    showBrowserNotification(
      '🔔 Uji Notifikasi Push Kurikulum PGRI',
      'Notifikasi push browser berfungsi optimal! Anda akan mendapatkan peringatan tepat waktu untuk setiap agenda & tenggat.',
      { test: true }
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 ring-2 ring-emerald-500/30">
                <Award className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                    SMA PLUS PGRI CIBINONG
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Plus Pesat
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Sistem Informasi Manajemen Kurikulum & Pengingat Otomatis
                </p>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock & Calendar */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200/80 text-xs font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentDate}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-emerald-700 font-semibold">{currentTime}</span>
            </div>

            {/* Google Sheets Database & Real-Time Sync Status Button */}
            {onOpenDatabase && (
              <button
                onClick={onOpenDatabase}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
                  syncInfo?.status === 'syncing'
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                    : syncInfo?.status === 'saved' || isDatabaseConnected
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                    : syncInfo?.status === 'error'
                    ? 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-800'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                }`}
                title={
                  syncInfo?.status === 'syncing'
                    ? 'Sedang menyimpan perubahan ke Google Sheets secara real-time...'
                    : syncInfo?.status === 'saved'
                    ? 'Semua perubahan tersimpan di Google Sheets (Real-time Aktif)'
                    : syncInfo?.status === 'error'
                    ? 'Terjadi kendala saat menyinkronkan ke Google Sheets'
                    : 'Kelola Koneksi Google Sheets & Google Apps Script'
                }
              >
                {syncInfo?.status === 'syncing' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                    <span className="hidden sm:inline">Menyimpan...</span>
                  </>
                ) : syncInfo?.status === 'saved' || isDatabaseConnected ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden md:inline">Google Sheets</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </>
                ) : syncInfo?.status === 'error' ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span className="hidden md:inline">Gagal Sinkron</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden md:inline">Database GAS</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  </>
                )}
              </button>
            )}

            {/* Quick AI Assistant Button */}
            <button
              onClick={onOpenAI}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-semibold shadow-xs transition-all duration-200 hover:shadow-md cursor-pointer"
              title="Konsultasi Asisten AI Kurikulum"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden md:inline">AI Kurikulum</span>
            </button>

            {/* Push Notification Trigger & Permission Pill */}
            {permission === 'granted' ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1.5 rounded-lg text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="hidden sm:inline">Push Aktif</span>
                <button
                  onClick={handleTestPush}
                  className="ml-1 text-[11px] underline text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  title="Uji kirim notifikasi push ke layar Anda"
                >
                  (Uji)
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnablePush}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                title="Aktifkan notifikasi push browser untuk setiap jadwal"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-600" />
                <span>Aktifkan Notifikasi</span>
              </button>
            )}

            {/* User Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20">
                WK
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">Waka Kurikulum</div>
                <div className="text-[10px] text-slate-500">TA 2026/2027 Ganjil</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
