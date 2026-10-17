import { DocumentItem, WorkProgram, SupervisionRecord, CalendarEvent, NavTab } from '../types';
import {
  FileText,
  Target,
  GraduationCap,
  CalendarClock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
  BellRing,
  Award,
  ChevronRight,
  Users
} from 'lucide-react';
import { showBrowserNotification } from '../services/notificationService';

interface DashboardViewProps {
  documents: DocumentItem[];
  programs: WorkProgram[];
  supervisions: SupervisionRecord[];
  events: CalendarEvent[];
  onNavigate: (tab: NavTab) => void;
  onOpenCreateDoc: () => void;
  onOpenCreateProgram: () => void;
  onOpenCreateSupervision: () => void;
  onOpenCreateEvent: () => void;
  onToggleEventComplete: (id: string) => void;
}

export function DashboardView({
  documents,
  programs,
  supervisions,
  events,
  onNavigate,
  onOpenCreateDoc,
  onOpenCreateProgram,
  onOpenCreateSupervision,
  onOpenCreateEvent,
  onToggleEventComplete,
}: DashboardViewProps) {
  // Statistics
  const verifiedDocsCount = documents.filter((d) => d.status === 'verified').length;
  const docsVerificationRate = Math.round((verifiedDocsCount / (documents.length || 1)) * 100);

  const completedProgramsCount = programs.filter((p) => p.status === 'completed').length;
  const inProgressProgramsCount = programs.filter((p) => p.status === 'in_progress').length;
  const avgProgramProgress = Math.round(
    programs.reduce((acc, p) => acc + p.progress, 0) / (programs.length || 1)
  );

  const avgSupervisionScore = (
    supervisions.reduce((acc, s) => acc + s.overallScore, 0) / (supervisions.length || 1)
  ).toFixed(1);

  const pendingEvents = events.filter((e) => !e.completed);
  const upcomingEvents = [...pendingEvents]
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 4);

  const handleTriggerQuickPush = (e: CalendarEvent) => {
    showBrowserNotification(
      `🔔 Pengingat Agenda: ${e.title}`,
      `Prioritas: ${e.priority} • Pukul: ${e.time} WIB • Tempat: ${e.location || 'SMA Plus PGRI Cibinong'}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-lg border border-emerald-700/40">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold mb-3 border border-emerald-400/30">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Pusat Keunggulan Kurikulum Merdeka • TA 2026/2027</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Portal Manajemen Kurikulum SMA Plus PGRI Cibinong
          </h1>
          <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
            Satu pintu kendali pengorganisasian KOSP, perangkat ajar berdiferensiasi, monitoring program kerja strategis, supervisi klinis dewan guru, dan pengingat tugas push otomatis.
          </p>

          {/* Quick Action Badges */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              onClick={onOpenCreateDoc}
              className="px-3.5 py-2 rounded-xl bg-white text-emerald-900 text-xs font-bold hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              Unggah Modul / KOSP
            </button>
            <button
              onClick={onOpenCreateSupervision}
              className="px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-semibold border border-emerald-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-amber-300" />
              Input Supervisi Guru
            </button>
            <button
              onClick={onOpenCreateEvent}
              className="px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-semibold border border-emerald-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CalendarClock className="w-4 h-4 text-amber-300" />
              Jadwal & Pengingat Baru
            </button>
            <button
              onClick={() => onNavigate('teachers')}
              className="px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-semibold border border-emerald-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4 text-emerald-300" />
              Data Guru & Impor
            </button>
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              Tanya AI Kurikulum
            </button>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Documents */}
        <div
          onClick={() => onNavigate('documents')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Perangkat Ajar</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{documents.length}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {docsVerificationRate}% Sah
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{verifiedDocsCount} dokumen tervalidasi</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Stat 2: Programs */}
        <div
          onClick={() => onNavigate('programs')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Program Kerja</span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-100 transition-colors">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{programs.length}</span>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
              {avgProgramProgress}% Rerata
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{inProgressProgramsCount} program berjalan</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Stat 3: Supervision */}
        <div
          onClick={() => onNavigate('supervision')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supervisi Guru</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-100 transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{avgSupervisionScore}</span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              Amat Baik / Baik
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{supervisions.length} guru telah diobservasi</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Stat 4: Reminders */}
        <div
          onClick={() => onNavigate('calendar')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jadwal & Pengingat</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-100 transition-colors">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{pendingEvents.length}</span>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Push Aktif
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{upcomingEvents.length} agenda terdekat</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming Agenda & Push Notif triggers (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Schedule Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Agenda & Pengingat Terjadwal</h3>
                  <p className="text-xs text-slate-500">Notifikasi push otomatis terkirim sebelum waktu kegiatan tiba</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                Lihat Kalender
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">Semua agenda telah terselesaikan.</div>
              ) : (
                upcomingEvents.map((evt) => {
                  const isToday = evt.date === new Date().toISOString().split('T')[0];
                  return (
                    <div
                      key={evt.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isToday
                          ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => onToggleEventComplete(evt.id)}
                          className="mt-0.5 text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
                          title="Tandai selesai"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                evt.priority === 'Tinggi'
                                  ? 'bg-rose-100 text-rose-800'
                                  : evt.priority === 'Sedang'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {evt.priority}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{evt.title}</span>
                            {isToday && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 animate-pulse">
                                HARI INI
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-emerald-600" />
                              {evt.date} • {evt.time} WIB
                            </span>
                            {evt.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {evt.location}
                              </span>
                            )}
                            <span className="text-slate-400">PIC: {evt.pic}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => handleTriggerQuickPush(evt)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          title="Uji notifikasi push langsung untuk jadwal ini"
                        >
                          <BellRing className="w-3.5 h-3.5 text-amber-600" />
                          <span>Uji Push</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Program Work Progress Bar Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Progres Program Kerja Prioritas</h3>
                  <p className="text-xs text-slate-500">Status pencapaian milestone program kurikulum</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('programs')}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
              >
                Kelola Proker
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {programs.slice(0, 3).map((prog) => (
                <div key={prog.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                          {prog.code}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800">{prog.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        PIC: {prog.pic} • Target: {prog.targetPeriod}
                      </p>
                    </div>
                    <span className="text-sm font-extrabold font-mono text-teal-800 shrink-0">
                      {prog.progress}%
                    </span>
                  </div>

                  <div className="mt-2.5 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        prog.progress === 100
                          ? 'bg-emerald-600'
                          : prog.progress >= 50
                          ? 'bg-teal-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${prog.progress}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Milestone: {prog.milestones.filter((m) => m.completed).length} dari {prog.milestones.length}{' '}
                      selesai
                    </span>
                    <span className="font-medium text-slate-700">
                      Realisasi: Rp {prog.budgetRealized.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant Teaser & Supervisi Snapshot */}
        <div className="space-y-6">
          {/* AI Kurikulum Card */}
          <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-teal-800/40 relative overflow-hidden">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
              <span>AI Asisten Kurikulum Merdeka</span>
            </div>
            <h3 className="text-lg font-extrabold text-white">Butuh Modul Ajar atau Kisi-kisi Soal?</h3>
            <p className="mt-1 text-xs text-teal-100/80 leading-relaxed">
              Asisten AI terlatih khusus untuk standar SMA Plus PGRI Cibinong: siap merumuskan ATP, instrumen diferensiasi, rubrik asesmen, dan modul P5 dalam hitungan detik.
            </p>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => onNavigate('ai-assistant')}
                className="w-full text-left px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs text-teal-100 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>✨ Buat Modul Ajar Diferensiasi</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
              </button>
              <button
                onClick={() => onNavigate('ai-assistant')}
                className="w-full text-left px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs text-teal-100 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>📝 Susun Kisi-kisi Soal HOTS & Rubrik</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
              </button>
              <button
                onClick={() => onNavigate('ai-assistant')}
                className="w-full text-left px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs text-teal-100 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>🔍 Rekomendasikan Tindak Lanjut Supervisi</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
              </button>
            </div>
          </div>

          {/* Supervisi Recent Snapshot */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-700" />
                <h3 className="font-bold text-sm text-slate-900">Catatan Supervisi Terkini</h3>
              </div>
              <button
                onClick={() => onNavigate('supervision')}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
              >
                Semua
              </button>
            </div>

            <div className="space-y-3">
              {supervisions.slice(0, 3).map((sup) => (
                <div key={sup.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">{sup.teacherName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sup.predicate === 'Amat Baik'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sup.predicate === 'Baik'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sup.overallScore} • {sup.predicate}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mapel: {sup.subject} • Kelas: {sup.gradeClass}
                  </p>
                  <div className="text-[10px] text-slate-500 mt-1.5 flex flex-wrap gap-1 font-mono">
                    <span className="bg-white px-1.5 py-0.2 rounded border border-slate-200" title="Administrasi">Adm: {sup.scores.administration ?? 90}</span>
                    <span className="bg-white px-1.5 py-0.2 rounded border border-slate-200" title="Perencanaan">Renc: {sup.scores.planning}</span>
                    <span className="bg-white px-1.5 py-0.2 rounded border border-slate-200" title="Pelaksanaan">Laks: {sup.scores.execution}</span>
                    <span className="bg-white px-1.5 py-0.2 rounded border border-slate-200" title="Asesmen">Asm: {sup.scores.assessment}</span>
                    <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-200 font-bold" title="Quantum Learning (TANDUR/AMBAK)">QL: {sup.scores.quantumLearning ?? 88}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">RTL: {sup.followUp.method}</span>
                    <span
                      className={`font-semibold ${
                        sup.followUp.status === 'Selesai & Diverifikasi'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {sup.followUp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
