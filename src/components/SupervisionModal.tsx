import { useState, useEffect } from 'react';
import { SupervisionRecord, SupervisionPredicate, FollowUpPlan, Teacher } from '../types';
import { X, GraduationCap, Sparkles, CheckCircle2, AlertTriangle, Loader2, Printer, Users, Lock, ChevronDown } from 'lucide-react';
import { broadcastToast } from '../services/notificationService';

interface SupervisionModalProps {
  record: SupervisionRecord | null;
  isOpen: boolean;
  teachers?: Teacher[];
  preselectedTeacher?: Teacher | null;
  onClose: () => void;
  onSave: (record: SupervisionRecord) => void;
  onOpenReport?: (record: SupervisionRecord) => void;
}

export function SupervisionModal({
  record,
  isOpen,
  teachers = [],
  preselectedTeacher,
  onClose,
  onSave,
  onOpenReport,
}: SupervisionModalProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherNip, setTeacherNip] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeClass, setGradeClass] = useState('');
  const [supervisorName, setSupervisorName] = useState("Dr. Hj. Nina Nur'aeni, M.Pd.");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:00 - 09:30');

  // 5 Aspect scores
  const [scoreAdministration, setScoreAdministration] = useState(90);
  const [scorePlanning, setScorePlanning] = useState(88);
  const [scoreExecution, setScoreExecution] = useState(86);
  const [scoreAssessment, setScoreAssessment] = useState(84);
  const [scoreQuantum, setScoreQuantum] = useState(88);

  // Text observations
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [recommendations, setRecommendations] = useState('');

  // RTL (Follow Up Plan)
  const [rtlAction, setRtlAction] = useState('');
  const [rtlMethod, setRtlMethod] = useState<FollowUpPlan['method']>('Coaching 1-on-1');
  const [rtlTargetDate, setRtlTargetDate] = useState('');
  const [rtlMentor, setRtlMentor] = useState('Waka Kurikulum');
  const [rtlStatus, setRtlStatus] = useState<FollowUpPlan['status']>('Sedang Berjalan');
  const [rtlNotes, setRtlNotes] = useState('');

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Calculate overall score & predicate across 5 instruments
  const overallScore =
    Math.round(
      ((scoreAdministration + scorePlanning + scoreExecution + scoreAssessment + scoreQuantum) / 5) * 10
    ) / 10;
  let predicate: SupervisionPredicate = 'Cukup';
  if (overallScore >= 91) predicate = 'Amat Baik';
  else if (overallScore >= 81) predicate = 'Baik';
  else if (overallScore >= 71) predicate = 'Cukup';
  else predicate = 'Perlu Bimbingan';

  useEffect(() => {
    if (record) {
      const matched = teachers.find(
        (t) =>
          t.name.trim().toLowerCase() === record.teacherName.trim().toLowerCase() ||
          (record.teacherNip && t.nip && t.nip === record.teacherNip)
      );
      setSelectedTeacherId(matched ? matched.id : '');
      setTeacherName(record.teacherName);
      setTeacherNip(record.teacherNip || matched?.nip || '');
      setSubject(record.subject || matched?.subject || '');
      setGradeClass(record.gradeClass);
      setSupervisorName(record.supervisorName);
      setDate(record.date);
      setTime(record.time);
      setScoreAdministration(record.scores.administration ?? 90);
      setScorePlanning(record.scores.planning);
      setScoreExecution(record.scores.execution);
      setScoreAssessment(record.scores.assessment);
      setScoreQuantum(record.scores.quantumLearning ?? 88);
      setStrengths(record.strengths);
      setWeaknesses(record.weaknesses);
      setRecommendations(record.recommendations);
      setRtlAction(record.followUp.actionTitle);
      setRtlMethod(record.followUp.method);
      setRtlTargetDate(record.followUp.targetDate);
      setRtlMentor(record.followUp.mentor);
      setRtlStatus(record.followUp.status);
      setRtlNotes(record.followUp.notes || '');
    } else {
      // New supervision entry
      if (preselectedTeacher) {
        setSelectedTeacherId(preselectedTeacher.id);
        setTeacherName(preselectedTeacher.name);
        setTeacherNip(preselectedTeacher.nip || '');
        setSubject(preselectedTeacher.subject || '');
      } else {
        setSelectedTeacherId('');
        setTeacherName('');
        setTeacherNip('');
        setSubject('');
      }
      setGradeClass('XI MIPA Plus 1');
      setSupervisorName("Dr. Hj. Nina Nur'aeni, M.Pd.");
      setDate(new Date().toISOString().split('T')[0]);
      setTime('08:30 - 10:00');
      setScoreAdministration(92);
      setScorePlanning(88);
      setScoreExecution(86);
      setScoreAssessment(85);
      setScoreQuantum(87);
      setStrengths('Penyampaian materi lugas, administrasi lengkap, dan suasana belajar dinamis.');
      setWeaknesses('Diferensiasi proses bagi siswa lambat belajar belum terlihat konkret, sintaks Quantum Learning (TANDUR) dapat diperkuat.');
      setRecommendations('Rancang scaffolding bertingkat dan gunakan media interaktif berbasis web serta perayaan apresiasi kelompok.');
      setRtlAction('Pendampingan Penyusunan Lembar Kerja Diferensiasi & Kerangka TANDUR');
      setRtlMethod('Coaching 1-on-1');
      setRtlTargetDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
      setRtlMentor('Waka Kurikulum');
      setRtlStatus('Sedang Berjalan');
      setRtlNotes('');
    }
  }, [record, isOpen, preselectedTeacher, teachers]);

  const handleTeacherSelect = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    if (!teacherId) {
      setTeacherName('');
      setTeacherNip('');
      setSubject('');
      return;
    }
    const found = teachers.find((t) => t.id === teacherId);
    if (found) {
      setTeacherName(found.name);
      setTeacherNip(found.nip || '');
      setSubject(found.subject || '');
      broadcastToast({
        title: 'Guru Terhubung Otomatis',
        message: `${found.name} (${found.subject}) otomatis dihubungkan dari Data Guru.`,
        type: 'info',
      });
    }
  };

  if (!isOpen) return null;

  const handleGenerateRtlAI = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'supervision_rtl',
          prompt: `Berdasarkan hasil supervisi pembelajaran SMA Plus PGRI Cibinong untuk Guru: ${teacherName || 'Guru Mata Pelajaran'}, Mapel: ${subject || 'Mata Pelajaran'}, Kelas: ${gradeClass}.
Instrumen Supervisi (Skala 0-100):
1. Administrasi: ${scoreAdministration}
2. Perencanaan: ${scorePlanning}
3. Pelaksanaan: ${scoreExecution}
4. Asesmen: ${scoreAssessment}
5. Quantum Learning (TANDUR & AMBAK): ${scoreQuantum}
Rerata Skor: ${overallScore} (${predicate}).
Kelemahan/Temuan: "${weaknesses}".
Kekuatan: "${strengths}".

Buatkan usulan program Rencana Tindak Lanjut (RTL) yang sangat spesifik, terintegrasi penguatan Quantum Learning dan administrasi, metode pendampingan, serta catatan pembinaan.`,
        }),
      });

      const data = await response.json();
      if (data.text) {
        // Simple extraction or fallback setting
        setRtlAction(`Optimalisasi Pembelajaran & Quantum Learning: ${subject || 'Mapel'}`);
        setRtlNotes(data.text.slice(0, 320) + '...');
        broadcastToast({
          title: 'RTL Berhasil Dihasilkan AI!',
          message: 'Rekomendasi rencana tindak lanjut supervisi telah diperbarui.',
          type: 'success',
        });
      }
    } catch (err) {
      console.error(err);
      broadcastToast({
        title: 'Info AI',
        message: 'Menggunakan draf RTL standar kurikulum unggulan.',
        type: 'info',
      });
      setRtlAction(`Coaching Klinis Penerapan Quantum Learning & Diferensiasi: ${subject || 'Mapel'}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || !subject) {
      broadcastToast({
        title: 'Guru Belum Dipilih',
        message: 'Silakan pilih guru dari daftar Data Guru terlebih dahulu melalui tombol dropdown.',
        type: 'alert',
      });
      return;
    }

    const updatedRecord: SupervisionRecord = {
      id: record?.id || `sup-${Date.now()}`,
      teacherName,
      teacherNip,
      subject,
      gradeClass,
      supervisorName,
      date,
      time,
      scores: {
        administration: Number(scoreAdministration),
        planning: Number(scorePlanning),
        execution: Number(scoreExecution),
        assessment: Number(scoreAssessment),
        quantumLearning: Number(scoreQuantum),
      },
      overallScore,
      predicate,
      strengths,
      weaknesses,
      recommendations,
      followUp: {
        actionTitle: rtlAction || 'Tindak Lanjut Refleksi Pembelajaran',
        method: rtlMethod,
        targetDate: rtlTargetDate || date,
        mentor: rtlMentor,
        status: rtlStatus,
        notes: rtlNotes,
      },
    };

    onSave(updatedRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {record ? 'Detail & Instrumen Supervisi Guru' : 'Input Supervisi Akademik Baru'}
              </h3>
              <p className="text-xs text-slate-500">Standar Supervisi Klinis SMA Plus PGRI Cibinong</p>
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
          <form id="sup-form" onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Dropdown Pilih Guru dari Data Guru */}
            <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50 border border-purple-200 rounded-2xl space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-700" />
                  <span>Pilih Guru dari Data Guru (Otomatis Terhubung) *</span>
                </label>
                <span className="text-[11px] font-bold text-purple-800 bg-white border border-purple-200 px-2.5 py-0.5 rounded-full shadow-2xs self-start sm:self-auto">
                  {teachers.length} Guru Terdaftar
                </span>
              </div>

              <div className="relative">
                <select
                  value={selectedTeacherId}
                  onChange={(e) => handleTeacherSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-8 text-xs font-semibold border border-purple-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 shadow-2xs cursor-pointer"
                >
                  <option value="">-- Klik untuk Memilih Guru dari Data Guru ({teachers.length} Guru) --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — Mapel: {t.subject} (NIP: {t.nip || '-'}) [{t.subjectCluster}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-start gap-1.5 pt-1 text-[11px] text-purple-950/80 leading-relaxed bg-white/60 p-2 rounded-xl border border-purple-100">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Informasi Paten:</strong> Nama guru dan mata pelajaran terisi otomatis dari Data Guru dan <strong>paten tidak dapat diubah di formulir ini</strong>. Perubahan nama atau mata pelajaran hanya dapat dilakukan melalui menu <strong>Data Guru</strong>.
                </span>
              </div>
            </div>

            {/* 2. Detail Guru (Paten / Read-only) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Nama Guru yang Disupervisi *</label>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                    <Lock className="w-3 h-3 text-amber-600" />
                    Paten (Terkunci)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    readOnly
                    placeholder="Pilih guru melalui tombol dropdown di atas..."
                    value={teacherName}
                    className="w-full pl-3.5 pr-8 py-2 text-sm bg-slate-100/90 text-slate-800 font-bold border border-slate-300 rounded-xl cursor-not-allowed select-none shadow-inner"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">NIP Guru</label>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shadow-2xs">
                    Paten
                  </span>
                </div>
                <input
                  type="text"
                  readOnly
                  placeholder="NIP terhubung otomatis"
                  value={teacherNip}
                  className="w-full px-3 py-2 text-xs bg-slate-100/90 text-slate-700 font-mono border border-slate-300 rounded-xl cursor-not-allowed select-none shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Mata Pelajaran *</label>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                    <Lock className="w-3 h-3 text-amber-600" />
                    Paten (Terkunci)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    readOnly
                    placeholder="Otomatis dari Data Guru..."
                    value={subject}
                    className="w-full pl-3.5 pr-8 py-2 text-sm bg-slate-100/90 text-slate-800 font-semibold border border-slate-300 rounded-xl cursor-not-allowed select-none shadow-inner"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kelas Observasi</label>
                <input
                  type="text"
                  placeholder="Contoh: X-1, XI MIPA Plus 1"
                  value={gradeClass}
                  onChange={(e) => setGradeClass(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supervisor</label>
                <input
                  type="text"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Supervisi</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Waktu / Jam Pelajaran</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="Contoh: 08:30 - 10:00"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* 5 Supervision Instruments Assessment Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/40 border border-purple-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-900 block">
                    Instrumen 5 Dimensi Supervisi (Skala 0 - 100)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Administrasi • Perencanaan • Pelaksanaan • Asesmen • Quantum Learning
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Rerata Skor:</span>
                  <span className="text-sm font-extrabold font-mono text-purple-700 px-2.5 py-0.5 rounded-lg bg-white border border-purple-200">
                    {overallScore}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                      predicate === 'Amat Baik'
                        ? 'bg-emerald-100 text-emerald-800'
                        : predicate === 'Baik'
                        ? 'bg-teal-100 text-teal-800'
                        : predicate === 'Cukup'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {predicate}
                  </span>
                </div>
              </div>

              {/* Slider 1: Administration */}
              <div className="space-y-1 p-2.5 rounded-xl bg-white/70 border border-purple-100/60">
                <div className="flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">1. Administrasi Pembelajaran</span>
                    <span className="text-[11px] text-slate-500 block">
                      Kalender pendidikan, Prota/Prosem, Jurnal Mengajar, Buku Nilai & Presensi
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-purple-800">{scoreAdministration}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={scoreAdministration}
                  onChange={(e) => setScoreAdministration(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: Planning */}
              <div className="space-y-1 p-2.5 rounded-xl bg-white/70 border border-purple-100/60">
                <div className="flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">2. Perencanaan Pembelajaran</span>
                    <span className="text-[11px] text-slate-500 block">
                      Alur Tujuan Pembelajaran (ATP), Modul Ajar Diferensiasi, Asesmen Diagnostik
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-purple-800">{scorePlanning}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={scorePlanning}
                  onChange={(e) => setScorePlanning(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Execution */}
              <div className="space-y-1 p-2.5 rounded-xl bg-white/70 border border-purple-100/60">
                <div className="flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">3. Pelaksanaan di Kelas</span>
                    <span className="text-[11px] text-slate-500 block">
                      Apersepsi, Diferensiasi Proses, Integrasi TPACK/Teknologi & Manajemen Kelas
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-purple-800">{scoreExecution}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={scoreExecution}
                  onChange={(e) => setScoreExecution(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Slider 4: Assessment */}
              <div className="space-y-1 p-2.5 rounded-xl bg-white/70 border border-purple-100/60">
                <div className="flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">4. Asesmen & Evaluasi</span>
                    <span className="text-[11px] text-slate-500 block">
                      Asesmen Formatif Berkelanjutan, Rubrik Kriteria Ketercapaian, Umpan Balik & Refleksi
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-purple-800">{scoreAssessment}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={scoreAssessment}
                  onChange={(e) => setScoreAssessment(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Slider 5: Quantum Learning */}
              <div className="space-y-1 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
                <div className="flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <span>5. Quantum Learning</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-200 text-amber-900 font-extrabold">
                        TANDUR & AMBAK
                      </span>
                    </span>
                    <span className="text-[11px] text-amber-900/80 block">
                      Tumbuhkan, Alami, Namai, Demonstrasikan, Ulangi, Rayakan, Penataan Lingkungan Positif
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-amber-900">{scoreQuantum}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={scoreQuantum}
                  onChange={(e) => setScoreQuantum(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Observations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kelebihan / Kekuatan Guru</label>
                <textarea
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Catatan hal positif selama pembelajaran..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kelemahan / Temuan Perbaikan</label>
                <textarea
                  rows={2}
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="Aspek yang perlu ditingkatkan..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Rencana Tindak Lanjut (RTL) Section with AI Helper */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Rencana Tindak Lanjut (RTL) & Pembinaan
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                    Wajib Ditindaklanjuti
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateRtlAI}
                  disabled={isGeneratingAI}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                >
                  {isGeneratingAI ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>Rekomendasikan RTL via AI</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul / Bentuk Program RTL *</label>
                  <input
                    type="text"
                    required
                    value={rtlAction}
                    onChange={(e) => setRtlAction(e.target.value)}
                    placeholder="Contoh: Coaching 1-on-1 Penyusunan Asesmen Formatif Diferensiasi"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Metode Pendampingan</label>
                    <select
                      value={rtlMethod}
                      onChange={(e) => setRtlMethod(e.target.value as FollowUpPlan['method'])}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Coaching 1-on-1">Coaching 1-on-1</option>
                      <option value="Peer Teaching">Peer Teaching</option>
                      <option value="Workshop Asesmen">Workshop Asesmen</option>
                      <option value="Pendampingan TPACK">Pendampingan TPACK</option>
                      <option value="Mandiri PMM">Mandiri PMM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Penyelesaian</label>
                    <input
                      type="date"
                      value={rtlTargetDate}
                      onChange={(e) => setRtlTargetDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Status RTL</label>
                    <select
                      value={rtlStatus}
                      onChange={(e) => setRtlStatus(e.target.value as FollowUpPlan['status'])}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Belum Mulai">Belum Mulai</option>
                      <option value="Sedang Berjalan">Sedang Berjalan</option>
                      <option value="Selesai & Diverifikasi">Selesai & Diverifikasi</option>
                    </select>
                  </div>
                </div>

                {rtlNotes && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Catatan Tambahan / Hasil AI</label>
                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                      {rtlNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/80">
          <div>
            {record && onOpenReport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReport(record);
                }}
                className="px-4 py-2 text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-300 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Cetak Laporan Supervisi dengan Kop Sekolah Resmi (PDF)"
              >
                <Printer className="w-4 h-4 text-purple-700" />
                <span>Cetak Lembar Supervisi (PDF)</span>
              </button>
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
              type="submit"
              form="sup-form"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs cursor-pointer"
            >
              {record ? 'Perbarui Hasil Supervisi' : 'Simpan Supervisi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
