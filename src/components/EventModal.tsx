import { useState, useEffect } from 'react';
import { CalendarEvent, EventCategory, PriorityLevel } from '../types';
import { X, CalendarClock, Bell, BellRing, Sparkles } from 'lucide-react';
import { showBrowserNotification } from '../services/notificationService';

interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  selectedDate?: string;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
}

export function EventModal({ event, isOpen, selectedDate, onClose, onSave }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('rapat');
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [priority, setPriority] = useState<PriorityLevel>('Tinggi');
  const [location, setLocation] = useState('');
  const [pic, setPic] = useState('Waka Kurikulum');
  const [description, setDescription] = useState('');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(15);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setCategory(event.category);
      setDate(event.date);
      setTime(event.time);
      setPriority(event.priority);
      setLocation(event.location);
      setPic(event.pic);
      setDescription(event.description);
      setReminderMinutesBefore(event.reminderMinutesBefore);
    } else {
      setTitle('');
      setCategory('rapat');
      setDate(selectedDate || new Date().toISOString().split('T')[0]);
      setTime('09:00');
      setPriority('Tinggi');
      setLocation('Ruang Rapat Kurikulum / Lab Komputer');
      setPic('Tim Kurikulum');
      setDescription('');
      setReminderMinutesBefore(15);
    }
  }, [event, isOpen, selectedDate]);

  if (!isOpen) return null;

  const handleTestThisNotification = () => {
    showBrowserNotification(
      `🔔 Pengingat Terjadwal: ${title || 'Jadwal Kurikulum PGRI'}`,
      `Waktu: ${time} WIB • Lokasi: ${location || 'SMA Plus PGRI Cibinong'} • PIC: ${pic}. Pengingat push otomatis aktif!`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newEvent: CalendarEvent = {
      id: event?.id || `ev-${Date.now()}`,
      title,
      category,
      date,
      time,
      priority,
      location,
      pic,
      description,
      completed: event ? event.completed : false,
      reminderMinutesBefore: Number(reminderMinutesBefore),
      notified: false,
    };

    onSave(newEvent);
    // Trigger confirmation notification
    showBrowserNotification(
      '📅 Jadwal & Pengingat Tersimpan',
      `"${title}" pada ${date} pukul ${time} WIB telah didaftarkan ke sistem notifikasi push.`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {event ? 'Ubah Jadwal & Pengingat' : 'Tambah Agenda & Pengingat Push'}
              </h3>
              <p className="text-xs text-slate-500">Notifikasi Otomatis Terintegrasi Browser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Agenda / Tugas *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Rapat Koordinasi Penyusunan Modul Ajar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Agenda</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                >
                  <option value="rapat">Rapat Koordinasi</option>
                  <option value="deadline">Tenggat Waktu (Deadline)</option>
                  <option value="supervisi">Supervisi Akademik</option>
                  <option value="asesmen">Asesmen / Ujian</option>
                  <option value="kegiatan">Workshop / Kegiatan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prioritas</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                >
                  <option value="Tinggi">Tinggi (Mendesak)</option>
                  <option value="Sedang">Sedang (Standar)</option>
                  <option value="Rendah">Rendah (Fleksibel)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Waktu (Jam Mulai)</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi / Media</label>
                <input
                  type="text"
                  placeholder="Ruang Rapat / Lab / Google Meet"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Penanggung Jawab (PIC)</label>
                <input
                  type="text"
                  placeholder="Nama PIC"
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Notification Trigger Config */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <BellRing className="w-4 h-4 text-amber-600" />
                  Notifikasi Pengingat (Push Alert)
                </label>
                <button
                  type="button"
                  onClick={handleTestThisNotification}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                >
                  Uji Notifikasi Ini
                </button>
              </div>

              <select
                value={reminderMinutesBefore}
                onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs border border-amber-300 rounded-lg bg-white text-slate-800 font-medium"
              >
                <option value={0}>Tepat saat waktu acara (0 menit)</option>
                <option value={5}>5 Menit Sebelum Acara</option>
                <option value={15}>15 Menit Sebelum Acara (Standar)</option>
                <option value={30}>30 Menit Sebelum Acara</option>
                <option value={60}>1 Jam Sebelum Acara</option>
                <option value={1440}>1 Hari (24 Jam) Sebelum Acara</option>
              </select>
              <p className="text-[11px] text-amber-800/80">
                Sistem akan memunculkan banner notifikasi browser dan nada lonceng otomatis saat waktu pengingat tiba.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan / Agenda Rinci</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Rincian agenda atau berkas yang perlu disiapkan..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
          >
            Batal
          </button>
          <button
            type="submit"
            form="event-form"
            className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
          >
            {event ? 'Perbarui Jadwal' : 'Simpan & Aktifkan Pengingat'}
          </button>
        </div>
      </div>
    </div>
  );
}
