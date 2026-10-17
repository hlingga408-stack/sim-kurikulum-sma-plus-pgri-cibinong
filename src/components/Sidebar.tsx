import { NavTab } from '../types';
import {
  LayoutDashboard,
  FileText,
  Target,
  GraduationCap,
  Sparkles,
  CalendarClock,
  ChevronRight,
  ShieldCheck,
  School,
  Users,
  MessageSquareText,
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
  counts: {
    teachers: number;
    docs: number;
    programs: number;
    supervisions: number;
    reminders: number;
    meetings?: number;
  };
}

export function Sidebar({ activeTab, onSelectTab, isOpen, onClose, counts }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      subtitle: 'Ringkasan & KPI Kurikulum',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'teachers' as NavTab,
      label: 'Data Guru',
      subtitle: 'Roster & Beban Mengajar',
      icon: Users,
      badge: `${counts.teachers} Guru`,
    },
    {
      id: 'documents' as NavTab,
      label: 'Manajemen Dokumen',
      subtitle: 'KOSP, Modul Ajar & ATP',
      icon: FileText,
      badge: counts.docs.toString(),
    },
    {
      id: 'programs' as NavTab,
      label: 'Program Kerja & Monitoring',
      subtitle: 'Proker & Realisasi Progres',
      icon: Target,
      badge: `${counts.programs} Proker`,
    },
    {
      id: 'supervision' as NavTab,
      label: 'Supervisi & Tindak Lanjut',
      subtitle: 'Observasi Guru & RTL',
      icon: GraduationCap,
      badge: `${counts.supervisions} Guru`,
    },
    {
      id: 'meetings' as NavTab,
      label: 'Rapat, Disposisi & RTL',
      subtitle: 'Notulen & Surat Masuk',
      icon: MessageSquareText,
      badge: counts.meetings !== undefined ? `${counts.meetings} Agenda` : null,
    },
    {
      id: 'ai-assistant' as NavTab,
      label: 'AI Asisten Kurikulum',
      subtitle: 'Generator Modul & Asesmen',
      icon: Sparkles,
      badge: 'Gemini 3.8',
      isAi: true,
    },
    {
      id: 'calendar' as NavTab,
      label: 'Kalender & Pengingat',
      subtitle: 'Jadwal & Push Notifikasi',
      icon: CalendarClock,
      badge: counts.reminders > 0 ? `${counts.reminders} Jadwal` : null,
      highlight: counts.reminders > 0,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 overflow-y-auto flex-1 space-y-6">
          {/* Quick Profile Tag */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-100 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-emerald-950 truncate">Portal Kurikulum</div>
              <div className="text-[11px] text-emerald-700 font-medium">SMA Plus PGRI Cibinong</div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Menu Utama
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.isAi
                          ? 'bg-amber-100 text-amber-700 group-hover:bg-amber-200'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold leading-tight truncate">{item.label}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isActive ? 'text-emerald-100' : 'text-slate-600'
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.isAi
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom School Identity & Assurance Card */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600 leading-snug">
              <span className="font-semibold text-slate-800 block">KOSP Terakreditasi A</span>
              Penyelarasan BSKAP & Karakter Unggul Pesat Cibinong.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
