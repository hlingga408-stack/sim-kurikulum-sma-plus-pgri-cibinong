import { useState } from 'react';
import { CalendarEvent, EventCategory, PriorityLevel } from '../types';
import {
  CalendarClock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Bell,
  BellRing,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Sparkles,
  Trash2,
  Calendar as CalendarIcon,
  Filter
} from 'lucide-react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  showBrowserNotification,
} from '../services/notificationService';

interface CalendarViewProps {
  events: CalendarEvent[];
  onOpenCreate: (selectedDate?: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onToggleComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
}

export function CalendarView({
  events,
  onOpenCreate,
  onEditEvent,
  onToggleComplete,
  onDeleteEvent,
}: CalendarViewProps) {
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 16)); // October 2026
  const [selectedDayString, setSelectedDayString] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  // Calendar calculations
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleRequestPush = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
  };

  const handleTriggerTestPush = () => {
    showBrowserNotification(
      '🔔 Pengingat Push Kurikulum SMA Plus PGRI',
      'Integrasi notifikasi push berjalan sempurna! Anda akan diperingatkan setiap waktu jadwal yang telah Anda tetapkan.',
      { type: 'test' }
    );
  };

  const handleTriggerEventPush = (e: CalendarEvent) => {
    showBrowserNotification(
      `⏰ ${e.title}`,
      `Pukul: ${e.time} WIB • Prioritas: ${e.priority} • Lokasi: ${e.location || 'SMA Plus PGRI Cibinong'} • PIC: ${e.pic}`,
      { eventId: e.id }
    );
  };

  const filteredEvents = events.filter((ev) => {
    const matchesCategory = selectedCategory === 'all' || ev.category === selectedCategory;
    const matchesIncomplete = !showOnlyIncomplete || !ev.completed;
    const matchesDate = !selectedDayString || ev.date === selectedDayString;
    return matchesCategory && matchesIncomplete && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-amber-600" />
            Kalender Tugas & Pengingat Notifikasi Push
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Jadwal kegiatan kurikulum, batas penyerahan perangkat ajar, dan notifikasi push browser otomatis
          </p>
        </div>

        <button
          onClick={() => onOpenCreate(selectedDayString)}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Jadwal & Pengingat
        </button>
      </div>

      {/* Push Notification Integration Control Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-xs shrink-0">
            <BellRing className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Integrasi Notifikasi Push Terjadwal
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  permission === 'granted'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {permission === 'granted' ? '● Izin Push Aktif' : '○ Belum Diizinkan'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
              Sistem akan memancarkan notifikasi push browser dan nada lonceng Web Audio otomatis saat tenggat tugas atau jadwal rapat kurikulum telah ditentukan tiba.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
          {permission !== 'granted' ? (
            <button
              onClick={handleRequestPush}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              Aktifkan Izin Notifikasi
            </button>
          ) : (
            <button
              onClick={handleTriggerTestPush}
              className="px-4 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BellRing className="w-4 h-4 text-emerald-600" />
              Uji Notifikasi Push Sekarang
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Schedule on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Picker (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          {/* Month Header Nav */}
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">
              {monthNames[month]} {year}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Hari Ini
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Bulan berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 py-1">
            <span className="text-rose-500">Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank previous month days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div
                key={`prev-${i}`}
                className="h-16 sm:h-20 p-1.5 rounded-xl border border-transparent text-slate-300 text-xs text-left"
              >
                {prevMonthDays - firstDayIndex + i + 1}
              </div>
            ))}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDayString === dayStr;
              const isToday =
                dayStr === new Date().toISOString().split('T')[0];

              // Events for this day
              const dayEvents = events.filter((e) => e.date === dayStr);

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDayString(dayStr)}
                  className={`h-16 sm:h-20 p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-left select-none ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/30'
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]'
                          : isSelected
                          ? 'text-amber-900 font-extrabold'
                          : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-amber-700 font-mono">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Pills */}
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${
                          ev.priority === 'Tinggi'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-medium">+{dayEvents.length - 2} lagi</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule & Reminders List (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            {/* Filter and Date Title */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {selectedDayString ? `Jadwal: ${selectedDayString}` : 'Semua Jadwal Kurikulum'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {filteredEvents.length} kegiatan & pengingat terdaftar
                </p>
              </div>

              {selectedDayString && (
                <button
                  onClick={() => setSelectedDayString('')}
                  className="text-xs text-amber-700 hover:text-amber-900 font-medium cursor-pointer"
                >
                  Tampilkan Semua
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {['all', 'rapat', 'deadline', 'supervisi', 'asesmen', 'kegiatan'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Semua' : cat}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Tidak ada agenda untuk kriteria ini.{' '}
                  <button
                    onClick={() => onOpenCreate(selectedDayString)}
                    className="text-amber-700 font-bold block mt-1 hover:underline cursor-pointer"
                  >
                    + Buat Agenda Baru
                  </button>
                </div>
              ) : (
                filteredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      ev.completed
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : ev.priority === 'Tinggi'
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => onToggleComplete(ev.id)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 cursor-pointer"
                          title={ev.completed ? 'Batalkan selesai' : 'Tandai selesai'}
                        >
                          {ev.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                                ev.priority === 'Tinggi'
                                  ? 'bg-rose-100 text-rose-800'
                                  : ev.priority === 'Sedang'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {ev.priority}
                            </span>
                            <h4
                              className={`text-xs font-bold ${
                                ev.completed ? 'line-through text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {ev.title}
                            </h4>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              {ev.date} • {ev.time} WIB
                            </span>
                            {ev.location && <span>• {ev.location}</span>}
                          </div>

                          {ev.description && (
                            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                              {ev.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right icons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleTriggerEventPush(ev)}
                          className="p-1 rounded text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer"
                          title="Uji push alert untuk jadwal ini"
                        >
                          <BellRing className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteEvent(ev.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Hapus jadwal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => onOpenCreate(selectedDayString)}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal untuk {selectedDayString || 'Hari Ini'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
