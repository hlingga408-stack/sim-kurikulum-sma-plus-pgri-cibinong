/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  NavTab,
  DocumentItem,
  WorkProgram,
  SupervisionRecord,
  CalendarEvent,
  DocStatus,
  Teacher,
  MeetingRecord,
  DispositionRecord,
  MeetingFollowUpRecord,
} from './types';
import {
  initialDocuments,
  initialPrograms,
  initialSupervisions,
  initialEvents,
  initialTeachers,
  initialMeetings,
  initialDispositions,
  initialMeetingRtls,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { DashboardView } from './views/DashboardView';
import { TeachersView } from './views/TeachersView';
import { DocumentsView } from './views/DocumentsView';
import { ProgramsView } from './views/ProgramsView';
import { SupervisionView } from './views/SupervisionView';
import { MeetingsView } from './views/MeetingsView';
import { AiAssistantView } from './views/AiAssistantView';
import { CalendarView } from './views/CalendarView';
import { DocumentModal } from './components/DocumentModal';
import { ProgramModal } from './components/ProgramModal';
import { SupervisionModal } from './components/SupervisionModal';
import { SupervisionImportModal } from './components/SupervisionImportModal';
import { TeacherModal } from './components/TeacherModal';
import { TeacherImportModal } from './components/TeacherImportModal';
import { SupervisionReportModal } from './components/SupervisionReportModal';
import { ProgramReportModal } from './components/ProgramReportModal';
import { EventModal } from './components/EventModal';
import { MeetingModal } from './components/MeetingModal';
import { DispositionModal } from './components/DispositionModal';
import { MeetingRtlModal } from './components/MeetingRtlModal';
import { MeetingPrintModal, PrintDocumentType } from './components/MeetingPrintModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import {
  getConnectionStatus,
  fetchAllDataFromSheets,
  gasSaveTeacher,
  gasDeleteTeacher,
  gasSaveDocument,
  gasSaveProgram,
  gasSaveSupervision,
  gasSaveEvent,
  gasDeleteEvent,
  gasSaveMeeting,
  gasDeleteMeeting,
  gasSaveDisposition,
  gasDeleteDisposition,
  gasSaveMeetingRtl,
  gasDeleteMeetingRtl,
  FullDataset,
} from './services/gasService';
import {
  startReminderScheduler,
  broadcastToast,
} from './services/notificationService';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core state with local storage fallback
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem('pgri_curriculum_teachers');
      return saved ? JSON.parse(saved) : initialTeachers;
    } catch {
      return initialTeachers;
    }
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem('pgri_curriculum_docs');
      return saved ? JSON.parse(saved) : initialDocuments;
    } catch {
      return initialDocuments;
    }
  });

  const [programs, setPrograms] = useState<WorkProgram[]>(() => {
    try {
      const saved = localStorage.getItem('pgri_curriculum_programs');
      return saved ? JSON.parse(saved) : initialPrograms;
    } catch {
      return initialPrograms;
    }
  });

  const [supervisions, setSupervisions] = useState<SupervisionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pgri_curriculum_supervisions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => {
          const administration = item.scores?.administration ?? 90;
          const planning = item.scores?.planning ?? 88;
          const execution = item.scores?.execution ?? 86;
          const assessment = item.scores?.assessment ?? 84;
          const quantumLearning = item.scores?.quantumLearning ?? 88;
          const overallScore = Math.round(((administration + planning + execution + assessment + quantumLearning) / 5) * 10) / 10;
          return {
            ...item,
            scores: {
              administration,
              planning,
              execution,
              assessment,
              quantumLearning,
            },
            overallScore,
          };
        });
      }
      return initialSupervisions;
    } catch {
      return initialSupervisions;
    }
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem('pgri_curriculum_events');
      return saved ? JSON.parse(saved) : initialEvents;
    } catch {
      return initialEvents;
    }
  });

  const [meetings, setMeetings] = useState<MeetingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pgri_curriculum_meetings');
      return saved ? JSON.parse(saved) : initialMeetings;
    } catch {
      return initialMeetings;
    }
  });

  const [dispositions, setDispositions] = useState<DispositionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pgri_curriculum_dispositions');
      return saved ? JSON.parse(saved) : initialDispositions;
    } catch {
      return initialDispositions;
    }
  });

  const [meetingRtls, setMeetingRtls] = useState<MeetingFollowUpRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pgri_curriculum_rtls');
      return saved ? JSON.parse(saved) : initialMeetingRtls;
    } catch {
      return initialMeetingRtls;
    }
  });

  // Google Apps Script & Google Sheets Database State
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState<boolean>(
    () => getConnectionStatus().isReady
  );

  // AI prompt state for passing context from documents or supervisions
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');

  // Modals state
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isTeacherImportModalOpen, setIsTeacherImportModalOpen] = useState(false);

  const [isSupervisionImportModalOpen, setIsSupervisionImportModalOpen] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isDocCreateMode, setIsDocCreateMode] = useState(false);

  const [selectedProgram, setSelectedProgram] = useState<WorkProgram | null>(null);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isProgramReportModalOpen, setIsProgramReportModalOpen] = useState(false);
  const [reportProgramId, setReportProgramId] = useState<string | null>(null);

  const [selectedSupervision, setSelectedSupervision] = useState<SupervisionRecord | null>(null);
  const [preselectedSupervisionTeacher, setPreselectedSupervisionTeacher] = useState<Teacher | null>(null);
  const [isSupervisionModalOpen, setIsSupervisionModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportRecordId, setReportRecordId] = useState<string | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedEventDate, setSelectedEventDate] = useState<string>('');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Meetings, Dispositions & RTL Modals state
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecord | null>(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  const [selectedDisposition, setSelectedDisposition] = useState<DispositionRecord | null>(null);
  const [isDispositionModalOpen, setIsDispositionModalOpen] = useState(false);

  const [selectedMeetingRtl, setSelectedMeetingRtl] = useState<MeetingFollowUpRecord | null>(null);
  const [isMeetingRtlModalOpen, setIsMeetingRtlModalOpen] = useState(false);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printDocType, setPrintDocType] = useState<PrintDocumentType>('meeting');
  const [printSelectedMeeting, setPrintSelectedMeeting] = useState<MeetingRecord | null>(null);
  const [printSelectedDisposition, setPrintSelectedDisposition] = useState<DispositionRecord | null>(null);
  const [printSelectedRtl, setPrintSelectedRtl] = useState<MeetingFollowUpRecord | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('pgri_curriculum_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('pgri_curriculum_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('pgri_curriculum_programs', JSON.stringify(programs));
  }, [programs]);

  useEffect(() => {
    localStorage.setItem('pgri_curriculum_supervisions', JSON.stringify(supervisions));
  }, [supervisions]);

  useEffect(() => {
    localStorage.setItem('pgri_curriculum_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('pgri_curriculum_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('pgri_curriculum_dispositions', JSON.stringify(dispositions));
  }, [dispositions]);

  useEffect(() => {
    localStorage.setItem('pgri_curriculum_rtls', JSON.stringify(meetingRtls));
  }, [meetingRtls]);

  // Handle Hydration from Google Sheets
  const handleDataLoadedFromSheets = (dataset: FullDataset, notify = true) => {
    if (dataset.teachers && dataset.teachers.length > 0) setTeachers(dataset.teachers);
    if (dataset.documents && dataset.documents.length > 0) setDocuments(dataset.documents);
    if (dataset.programs && dataset.programs.length > 0) setPrograms(dataset.programs);
    if (dataset.supervisions && dataset.supervisions.length > 0) setSupervisions(dataset.supervisions);
    if (dataset.events && dataset.events.length > 0) setEvents(dataset.events);
    if (dataset.meetings && dataset.meetings.length > 0) setMeetings(dataset.meetings);
    if (dataset.dispositions && dataset.dispositions.length > 0) setDispositions(dataset.dispositions);
    if (dataset.meetingRtls && dataset.meetingRtls.length > 0) setMeetingRtls(dataset.meetingRtls);
    setIsDatabaseConnected(true);
    if (notify) {
      broadcastToast({
        title: 'Data Google Sheets Dimuat',
        message: 'Aplikasi telah berhasil disinkronkan dengan Google Spreadsheet.',
        type: 'success',
      });
    }
  };

  // Initial auto-sync from Google Sheets on boot if connection is configured
  useEffect(() => {
    const checkAndLoadSheets = async () => {
      const conn = getConnectionStatus();
      setIsDatabaseConnected(conn.isReady);
      if (conn.isReady) {
        try {
          const dataset = await fetchAllDataFromSheets();
          if (dataset) {
            handleDataLoadedFromSheets(dataset, false);
          }
        } catch (e) {
          console.warn('Gagal memuat otomatis dari Google Sheets, menggunakan data lokal:', e);
        }
      }
    };
    checkAndLoadSheets();
  }, []);

  // Push Reminder background scheduler (checks every 10 seconds)
  useEffect(() => {
    const cleanupScheduler = startReminderScheduler(
      () => events,
      (eventId) => {
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, notified: true } : e))
        );
      }
    );
    return cleanupScheduler;
  }, [events]);

  // Teacher Handlers
  const handleSaveTeacher = (updatedTeacher: Teacher) => {
    setTeachers((prev) => {
      const idx = prev.findIndex((t) => t.id === updatedTeacher.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedTeacher;
        return next;
      }
      return [updatedTeacher, ...prev];
    });
    broadcastToast({
      title: 'Data Guru Tersimpan',
      message: `${updatedTeacher.name} telah berhasil disimpan.`,
      type: 'success',
    });
  };

  const handleImportTeachers = (newTeachers: Teacher[]) => {
    setTeachers((prev) => [...newTeachers, ...prev]);
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    broadcastToast({
      title: 'Data Guru Dihapus',
      message: 'Data pendidik telah dihapus dari sistem.',
      type: 'info',
    });
  };

  const handleStartSupervisionForTeacher = (teacher: Teacher) => {
    setSelectedSupervision({
      id: `sup-${Date.now()}`,
      teacherName: teacher.name,
      teacherNip: teacher.nip,
      subject: teacher.subject,
      gradeClass: 'XI MIPA Plus 1',
      supervisorName: "Dr. Hj. Nina Nur'aeni, M.Pd.",
      date: new Date().toISOString().split('T')[0],
      time: '08:30 - 10:00',
      scores: {
        administration: 90,
        planning: 88,
        execution: 86,
        assessment: 85,
        quantumLearning: 88,
      },
      overallScore: 87.4,
      predicate: 'Baik',
      strengths: 'Penguasaan materi baik dan komunikasi interaktif.',
      weaknesses: 'Diferensiasi proses dan kerangka TANDUR dapat diperdalam.',
      recommendations: 'Tindak lanjuti dengan coaching klinis.',
      followUp: {
        actionTitle: `Pendampingan Diferensiasi & Quantum Learning: ${teacher.subject}`,
        method: 'Coaching 1-on-1',
        targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        mentor: "Dr. Hj. Nina Nur'aeni, M.Pd.",
        status: 'Sedang Berjalan',
      },
    });
    setIsSupervisionModalOpen(true);
  };

  const handleImportSupervisions = (newRecords: SupervisionRecord[]) => {
    setSupervisions((prev) => [...newRecords, ...prev]);
  };

  // Document Handlers
  const handleSaveDoc = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
    broadcastToast({
      title: 'Dokumen Tersimpan',
      message: `"${newDoc.title}" telah didaftarkan ke sistem manajemen dokumen.`,
      type: 'success',
    });
  };

  const handleUpdateDocStatus = (id: string, newStatus: DocStatus) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
  };

  const handleAnalyzeDocAI = (doc: DocumentItem) => {
    setAiInitialPrompt(
      `Mohon kaji dan berikan telaah kurikulum terhadap dokumen berikut:\n\nJudul: ${doc.title}\nJenis: ${doc.type}\nFase: ${doc.phase}\nMapel: ${doc.subject}\nPenyusun: ${doc.authorTeacher}\nDeskripsi: ${doc.description}\nTujuan Pembelajaran: ${doc.learningObjectives?.join(', ')}\n\nBerikan masukan terkait: 1) Keselarasan Capaian Pembelajaran, 2) Prinsip Diferensiasi & TPACK, 3) Rekomendasi perbaikan instrumen asesmen.`
    );
    setActiveTab('ai-assistant');
  };

  // Program Handlers
  const handleSaveProgram = (updatedProg: WorkProgram) => {
    setPrograms((prev) => {
      const idx = prev.findIndex((p) => p.id === updatedProg.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedProg;
        return next;
      }
      return [updatedProg, ...prev];
    });
    broadcastToast({
      title: 'Program Kerja Tersimpan',
      message: `Program "${updatedProg.title}" telah diperbarui.`,
      type: 'success',
    });
  };

  const handleToggleMilestone = (programId: string, milestoneId: string) => {
    setPrograms((prev) =>
      prev.map((prog) => {
        if (prog.id !== programId) return prog;

        const updatedMilestones = prog.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedMilestones.filter((m) => m.completed).length;
        const progress = Math.round((completedCount / updatedMilestones.length) * 100);

        let status = prog.status;
        if (progress === 100) status = 'completed';
        else if (progress > 0) status = 'in_progress';

        return {
          ...prog,
          milestones: updatedMilestones,
          progress,
          status,
        };
      })
    );
  };

  // Supervision Handlers
  const handleSaveSupervision = (updatedRecord: SupervisionRecord) => {
    setSupervisions((prev) => {
      const idx = prev.findIndex((s) => s.id === updatedRecord.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedRecord;
        return next;
      }
      return [updatedRecord, ...prev];
    });
    broadcastToast({
      title: 'Hasil Supervisi Disimpan',
      message: `Data supervisi untuk ${updatedRecord.teacherName} (Skor: ${updatedRecord.overallScore}) berhasil disimpan.`,
      type: 'success',
    });
  };

  const handleToggleRtlStatus = (recordId: string) => {
    setSupervisions((prev) =>
      prev.map((s) => {
        if (s.id !== recordId) return s;
        const nextStatus =
          s.followUp.status === 'Selesai & Diverifikasi'
            ? 'Sedang Berjalan'
            : 'Selesai & Diverifikasi';
        return {
          ...s,
          followUp: { ...s.followUp, status: nextStatus },
        };
      })
    );
  };

  const handleConsultAiWithSupervision = (record: SupervisionRecord) => {
    setAiInitialPrompt(
      `Mohon buatkan rekomendasi Rencana Tindak Lanjut (RTL) dan panduan coaching klinis untuk guru berikut:\n\nNama Guru: ${record.teacherName}\nMapel: ${record.subject} (Kelas: ${record.gradeClass})\n\nInstrumen Penilaian Supervisi:\n1. Administrasi: ${record.scores.administration ?? 90}/100\n2. Perencanaan: ${record.scores.planning}/100\n3. Pelaksanaan: ${record.scores.execution}/100\n4. Asesmen: ${record.scores.assessment}/100\n5. Quantum Learning: ${record.scores.quantumLearning ?? 88}/100\nRerata Skor: ${record.overallScore} (${record.predicate})\n\nKekuatan: ${record.strengths}\nKelemahan/Temuan: ${record.weaknesses}\n\nBuatkan: 1) Matriks pembinaan 3 minggu, 2) Strategi penerapan Quantum Learning (TANDUR & AMBAK) serta diferensiasi konten/proses, 3) Rekomendasi perbaikan administrasi dan asesmen formatif, 4) Indikator keberhasilan pasca-coaching.`
    );
    setActiveTab('ai-assistant');
  };

  // Event & Reminder Handlers
  const handleSaveEvent = (newEvent: CalendarEvent) => {
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === newEvent.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newEvent;
        return next;
      }
      return [newEvent, ...prev];
    });
  };

  const handleToggleEventComplete = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (getConnectionStatus().isReady) {
      gasDeleteEvent(id).catch(console.error);
    }
    broadcastToast({
      title: 'Jadwal Dihapus',
      message: 'Jadwal kegiatan telah dihapus dari kalender.',
      type: 'info',
    });
  };

  // Meetings Handlers
  const handleSaveMeeting = (updatedMeeting: MeetingRecord) => {
    setMeetings((prev) => {
      const idx = prev.findIndex((m) => m.id === updatedMeeting.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedMeeting;
        return next;
      }
      return [updatedMeeting, ...prev];
    });
    if (getConnectionStatus().isReady) {
      gasSaveMeeting(updatedMeeting).catch(console.error);
    }
    broadcastToast({
      title: 'Notulen Rapat Tersimpan',
      message: `Agenda "${updatedMeeting.title}" berhasil disimpan.`,
      type: 'success',
    });
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    if (getConnectionStatus().isReady) {
      gasDeleteMeeting(id).catch(console.error);
    }
    broadcastToast({
      title: 'Data Rapat Dihapus',
      message: 'Notulensi rapat telah dihapus.',
      type: 'info',
    });
  };

  // Disposition Handlers
  const handleSaveDisposition = (updatedDisp: DispositionRecord) => {
    setDispositions((prev) => {
      const idx = prev.findIndex((d) => d.id === updatedDisp.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedDisp;
        return next;
      }
      return [updatedDisp, ...prev];
    });
    if (getConnectionStatus().isReady) {
      gasSaveDisposition(updatedDisp).catch(console.error);
    }
    broadcastToast({
      title: 'Disposisi Tersimpan',
      message: `Surat agenda ${updatedDisp.agendaNumber} berhasil diperbarui.`,
      type: 'success',
    });
  };

  const handleDeleteDisposition = (id: string) => {
    setDispositions((prev) => prev.filter((d) => d.id !== id));
    if (getConnectionStatus().isReady) {
      gasDeleteDisposition(id).catch(console.error);
    }
    broadcastToast({
      title: 'Disposisi Dihapus',
      message: 'Lembar disposisi telah dihapus.',
      type: 'info',
    });
  };

  // Meeting RTL Handlers
  const handleSaveMeetingRtl = (updatedRtl: MeetingFollowUpRecord) => {
    setMeetingRtls((prev) => {
      const idx = prev.findIndex((r) => r.id === updatedRtl.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedRtl;
        return next;
      }
      return [updatedRtl, ...prev];
    });
    if (getConnectionStatus().isReady) {
      gasSaveMeetingRtl(updatedRtl).catch(console.error);
    }
    broadcastToast({
      title: 'RTL Rapat Tersimpan',
      message: `RTL "${updatedRtl.actionTitle}" berhasil diperbarui.`,
      type: 'success',
    });
  };

  const handleDeleteMeetingRtl = (id: string) => {
    setMeetingRtls((prev) => prev.filter((r) => r.id !== id));
    if (getConnectionStatus().isReady) {
      gasDeleteMeetingRtl(id).catch(console.error);
    }
    broadcastToast({
      title: 'RTL Dihapus',
      message: 'Rencana tindak lanjut telah dihapus.',
      type: 'info',
    });
  };

  const handleToggleMeetingRtlStatus = (id: string) => {
    setMeetingRtls((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const nextStatus: MeetingFollowUpRecord['status'] =
          r.status === 'Tuntas & Terverifikasi' ? 'Sedang Berjalan' : 'Tuntas & Terverifikasi';
        const nextProgress = nextStatus === 'Tuntas & Terverifikasi' ? 100 : r.progress;
        const updated: MeetingFollowUpRecord = { ...r, status: nextStatus, progress: nextProgress };
        if (getConnectionStatus().isReady) {
          gasSaveMeetingRtl(updated).catch(console.error);
        }
        return updated;
      })
    );
  };

  const handleOpenPrintModal = (
    docType: 'meeting' | 'disposition' | 'rtl',
    recordId?: string
  ) => {
    setPrintDocType(docType);
    if (docType === 'meeting' && recordId) {
      setPrintSelectedMeeting(meetings.find((m) => m.id === recordId) || null);
    } else if (docType === 'disposition' && recordId) {
      setPrintSelectedDisposition(dispositions.find((d) => d.id === recordId) || null);
    } else if (docType === 'rtl' && recordId) {
      setPrintSelectedRtl(meetingRtls.find((r) => r.id === recordId) || null);
    }
    setIsPrintModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Alert Popups */}
      <ToastContainer />

      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onOpenAI={() => setActiveTab('ai-assistant')}
        onOpenDatabase={() => setIsDatabaseModalOpen(true)}
        isDatabaseConnected={isDatabaseConnected}
        upcomingCount={events.filter((e) => !e.completed).length}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Responsive Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          counts={{
            teachers: teachers.length,
            docs: documents.length,
            programs: programs.length,
            supervisions: supervisions.length,
            reminders: events.filter((e) => !e.completed).length,
            meetings: meetings.length,
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              documents={documents}
              programs={programs}
              supervisions={supervisions}
              events={events}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenCreateDoc={() => {
                setIsDocCreateMode(true);
                setSelectedDoc(null);
                setIsDocModalOpen(true);
              }}
              onOpenCreateProgram={() => {
                setSelectedProgram(null);
                setIsProgramModalOpen(true);
              }}
              onOpenCreateSupervision={() => {
                setSelectedSupervision(null);
                setIsSupervisionModalOpen(true);
              }}
              onOpenCreateEvent={() => {
                setSelectedEvent(null);
                setSelectedEventDate('');
                setIsEventModalOpen(true);
              }}
              onToggleEventComplete={handleToggleEventComplete}
            />
          )}

          {activeTab === 'teachers' && (
            <TeachersView
              teachers={teachers}
              onOpenCreateManual={() => {
                setSelectedTeacher(null);
                setIsTeacherModalOpen(true);
              }}
              onOpenImportModal={() => {
                setIsTeacherImportModalOpen(true);
              }}
              onEditTeacher={(teacher) => {
                setSelectedTeacher(teacher);
                setIsTeacherModalOpen(true);
              }}
              onDeleteTeacher={handleDeleteTeacher}
              onStartSupervisionForTeacher={handleStartSupervisionForTeacher}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              documents={documents}
              onOpenCreate={() => {
                setIsDocCreateMode(true);
                setSelectedDoc(null);
                setIsDocModalOpen(true);
              }}
              onSelectDoc={(doc) => {
                setIsDocCreateMode(false);
                setSelectedDoc(doc);
                setIsDocModalOpen(true);
              }}
              onAnalyzeDocAI={handleAnalyzeDocAI}
              onUpdateStatus={handleUpdateDocStatus}
            />
          )}

          {activeTab === 'programs' && (
            <ProgramsView
              programs={programs}
              onOpenCreate={() => {
                setSelectedProgram(null);
                setIsProgramModalOpen(true);
              }}
              onEditProgram={(prog) => {
                setSelectedProgram(prog);
                setIsProgramModalOpen(true);
              }}
              onToggleMilestone={handleToggleMilestone}
              onOpenReportModal={(prog) => {
                setReportProgramId(prog ? prog.id : null);
                setIsProgramReportModalOpen(true);
              }}
            />
          )}

          {activeTab === 'supervision' && (
            <SupervisionView
              supervisions={supervisions}
              teachers={teachers}
              onOpenCreate={(teacher) => {
                setSelectedSupervision(null);
                setPreselectedSupervisionTeacher(teacher || null);
                setIsSupervisionModalOpen(true);
              }}
              onOpenImportModal={() => {
                setIsSupervisionImportModalOpen(true);
              }}
              onSelectRecord={(rec) => {
                setSelectedSupervision(rec);
                setPreselectedSupervisionTeacher(null);
                setIsSupervisionModalOpen(true);
              }}
              onToggleRtlStatus={handleToggleRtlStatus}
              onConsultAiWithRecord={handleConsultAiWithSupervision}
              onOpenReportModal={(record) => {
                setReportRecordId(record ? record.id : null);
                setIsReportModalOpen(true);
              }}
            />
          )}

          {activeTab === 'meetings' && (
            <MeetingsView
              meetings={meetings}
              dispositions={dispositions}
              rtls={meetingRtls}
              onOpenCreateMeeting={() => {
                setSelectedMeeting(null);
                setIsMeetingModalOpen(true);
              }}
              onOpenEditMeeting={(meeting) => {
                setSelectedMeeting(meeting);
                setIsMeetingModalOpen(true);
              }}
              onDeleteMeeting={handleDeleteMeeting}
              onOpenCreateDisposition={() => {
                setSelectedDisposition(null);
                setIsDispositionModalOpen(true);
              }}
              onOpenEditDisposition={(disp) => {
                setSelectedDisposition(disp);
                setIsDispositionModalOpen(true);
              }}
              onDeleteDisposition={handleDeleteDisposition}
              onOpenCreateRtl={() => {
                setSelectedMeetingRtl(null);
                setIsMeetingRtlModalOpen(true);
              }}
              onOpenEditRtl={(rtl) => {
                setSelectedMeetingRtl(rtl);
                setIsMeetingRtlModalOpen(true);
              }}
              onDeleteRtl={handleDeleteMeetingRtl}
              onToggleRtlStatus={handleToggleMeetingRtlStatus}
              onOpenPrintModal={handleOpenPrintModal}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <AiAssistantView
              initialPrompt={aiInitialPrompt}
              onSaveAsDocument={(doc) => {
                handleSaveDoc(doc);
              }}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              events={events}
              onOpenCreate={(selectedDate) => {
                setSelectedEvent(null);
                setSelectedEventDate(selectedDate || '');
                setIsEventModalOpen(true);
              }}
              onEditEvent={(evt) => {
                setSelectedEvent(evt);
                setIsEventModalOpen(true);
              }}
              onToggleComplete={handleToggleEventComplete}
              onDeleteEvent={handleDeleteEvent}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <TeacherModal
        isOpen={isTeacherModalOpen}
        teacher={selectedTeacher}
        onClose={() => setIsTeacherModalOpen(false)}
        onSave={handleSaveTeacher}
      />

      <TeacherImportModal
        isOpen={isTeacherImportModalOpen}
        onClose={() => setIsTeacherImportModalOpen(false)}
        onImport={handleImportTeachers}
      />

      <SupervisionImportModal
        isOpen={isSupervisionImportModalOpen}
        onClose={() => setIsSupervisionImportModalOpen(false)}
        onImport={handleImportSupervisions}
        teachers={teachers}
      />

      <DocumentModal
        isOpen={isDocModalOpen}
        document={selectedDoc}
        isCreateMode={isDocCreateMode}
        onClose={() => setIsDocModalOpen(false)}
        onSave={handleSaveDoc}
        onAnalyzeAI={handleAnalyzeDocAI}
      />

      <ProgramModal
        isOpen={isProgramModalOpen}
        program={selectedProgram}
        onClose={() => setIsProgramModalOpen(false)}
        onSave={handleSaveProgram}
        onOpenReport={(prog) => {
          setReportProgramId(prog.id);
          setIsProgramReportModalOpen(true);
        }}
      />

      <ProgramReportModal
        isOpen={isProgramReportModalOpen}
        onClose={() => setIsProgramReportModalOpen(false)}
        programs={programs}
        initialSelectedId={reportProgramId}
      />

      <SupervisionModal
        isOpen={isSupervisionModalOpen}
        record={selectedSupervision}
        teachers={teachers}
        preselectedTeacher={preselectedSupervisionTeacher}
        onClose={() => {
          setIsSupervisionModalOpen(false);
          setPreselectedSupervisionTeacher(null);
        }}
        onSave={handleSaveSupervision}
        onOpenReport={(record) => {
          setReportRecordId(record.id);
          setIsReportModalOpen(true);
        }}
      />

      <SupervisionReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        supervisions={supervisions}
        initialSelectedId={reportRecordId}
      />

      <EventModal
        isOpen={isEventModalOpen}
        event={selectedEvent}
        selectedDate={selectedEventDate}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
      />

      <MeetingModal
        isOpen={isMeetingModalOpen}
        meeting={selectedMeeting}
        onClose={() => setIsMeetingModalOpen(false)}
        onSave={handleSaveMeeting}
        onOpenPrint={(meeting) => handleOpenPrintModal('meeting', meeting.id)}
      />

      <DispositionModal
        isOpen={isDispositionModalOpen}
        disposition={selectedDisposition}
        onClose={() => setIsDispositionModalOpen(false)}
        onSave={handleSaveDisposition}
        onOpenPrint={(disp) => handleOpenPrintModal('disposition', disp.id)}
      />

      <MeetingRtlModal
        isOpen={isMeetingRtlModalOpen}
        rtl={selectedMeetingRtl}
        onClose={() => setIsMeetingRtlModalOpen(false)}
        onSave={handleSaveMeetingRtl}
        onOpenPrint={(rtl) => handleOpenPrintModal('rtl', rtl.id)}
      />

      <MeetingPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        defaultDocType={printDocType}
        selectedMeeting={printSelectedMeeting}
        selectedDisposition={printSelectedDisposition}
        selectedRtl={printSelectedRtl}
        meetings={meetings}
        dispositions={dispositions}
        rtls={meetingRtls}
      />

      <GoogleSheetsModal
        isOpen={isDatabaseModalOpen}
        onClose={() => {
          setIsDatabaseModalOpen(false);
          setIsDatabaseConnected(getConnectionStatus().isReady);
        }}
        currentDataset={{
          teachers,
          documents,
          programs,
          supervisions,
          events,
          meetings,
          dispositions,
          meetingRtls,
        }}
        onDataLoadedFromSheets={(dataset) => handleDataLoadedFromSheets(dataset, true)}
      />
    </div>
  );
}
