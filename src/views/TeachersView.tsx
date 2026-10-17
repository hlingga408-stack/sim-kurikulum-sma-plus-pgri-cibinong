import { useState } from 'react';
import { Teacher, TeacherCluster, EmploymentType } from '../types';
import {
  Users,
  Plus,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  GraduationCap,
  Award,
  Phone,
  Mail,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import { broadcastToast } from '../services/notificationService';
import { downloadNativeExcel, downloadSemicolonCsv } from '../utils/excelHelper';

interface TeachersViewProps {
  teachers: Teacher[];
  onOpenCreateManual: () => void;
  onOpenImportModal: () => void;
  onEditTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onStartSupervisionForTeacher: (teacher: Teacher) => void;
}

export function TeachersView({
  teachers,
  onOpenCreateManual,
  onOpenImportModal,
  onEditTeacher,
  onDeleteTeacher,
  onStartSupervisionForTeacher,
}: TeachersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCert, setSelectedCert] = useState<string>('all');

  const filteredTeachers = teachers.filter((tch) => {
    const matchesSearch =
      tch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tch.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tch.nip.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCluster = selectedCluster === 'all' || tch.subjectCluster === selectedCluster;
    const matchesStatus = selectedStatus === 'all' || tch.employmentStatus === selectedStatus;
    const matchesCert =
      selectedCert === 'all' ||
      (selectedCert === 'certified' && tch.certificationStatus) ||
      (selectedCert === 'uncertified' && !tch.certificationStatus);

    return matchesSearch && matchesCluster && matchesStatus && matchesCert;
  });

  const certifiedCount = teachers.filter((t) => t.certificationStatus).length;
  const pnsCount = teachers.filter((t) => t.employmentStatus === 'PNS').length;
  const gtyCount = teachers.filter((t) => t.employmentStatus.includes('GTY')).length;
  const avgHours = Math.round(
    teachers.reduce((acc, t) => acc + t.teachingHours, 0) / (teachers.length || 1)
  );

  const handleExportExcel = () => {
    const headers = [
      'Nama Lengkap & Gelar',
      'NIP / NUPTK',
      'Mata Pelajaran',
      'Rumpun',
      'Status Kepegawaian',
      'Pendidikan',
      'Beban Jam',
      'No HP',
      'Email',
      'Tugas Tambahan',
      'Sertifikasi'
    ];
    const rows = teachers.map((t) => [
      t.name,
      t.nip,
      t.subject,
      t.subjectCluster,
      t.employmentStatus,
      t.education,
      t.teachingHours,
      t.phone || '',
      t.email || '',
      t.additionalRole || '',
      t.certificationStatus ? 'Ya' : 'Tidak'
    ]);

    downloadNativeExcel(
      `data_guru_sma_plus_pgri_cibinong_${new Date().toISOString().split('T')[0]}.xls`,
      headers,
      rows,
      'Data Guru'
    );

    broadcastToast({
      title: 'Data Guru Diekspor ke Excel',
      message: `${teachers.length} data guru telah diunduh dalam format Excel kolom rapi tanpa pemisah koma.`,
      type: 'success',
    });
  };

  const handleExportCsv = () => {
    const headers = [
      'Nama Lengkap & Gelar',
      'NIP / NUPTK',
      'Mata Pelajaran',
      'Rumpun',
      'Status Kepegawaian',
      'Pendidikan',
      'Beban Jam',
      'No HP',
      'Email',
      'Tugas Tambahan',
      'Sertifikasi'
    ];
    const rows = teachers.map((t) => [
      t.name,
      t.nip,
      t.subject,
      t.subjectCluster,
      t.employmentStatus,
      t.education,
      t.teachingHours,
      t.phone || '',
      t.email || '',
      t.additionalRole || '',
      t.certificationStatus ? 'Ya' : 'Tidak'
    ]);

    downloadSemicolonCsv(
      `data_guru_sma_plus_pgri_cibinong_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows
    );

    broadcastToast({
      title: 'Data Guru Diekspor (CSV ;)',
      message: `${teachers.length} data guru diunduh dalam format CSV titik-koma.`,
      type: 'info',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Master Data Guru SMA Plus PGRI Cibinong
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen pendidik, beban mengajar, rumpun bidang studi, dan integrasi supervisi akademik
          </p>
        </div>

        {/* Action Buttons: Manual vs Direct Bulk Import */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ekspor seluruh data guru ke Excel (Kolom Rapi Tanpa Koma)"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel (.xls)</span>
          </button>

          <button
            onClick={onOpenImportModal}
            className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Impor langsung banyak data guru sekaligus via format Excel atau CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            <span>Impor Otomatis (Per Kolom)</span>
          </button>

          <button
            onClick={onOpenCreateManual}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Guru Manual</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Tenaga Pendidik</div>
          <div className="text-2xl font-extrabold text-slate-900">{teachers.length} Guru</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Aktif TA 2026/2027</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Tersertifikasi Pendidik</div>
          <div className="text-2xl font-extrabold text-amber-700 font-mono">
            {certifiedCount} <span className="text-xs text-slate-400 font-normal">({Math.round((certifiedCount / (teachers.length || 1)) * 100)}%)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Lulus Sertifikasi PPG</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Status Kepegawaian</div>
          <div className="text-sm font-extrabold text-slate-800 mt-1">
            {pnsCount} PNS • {gtyCount} GTY
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {teachers.length - pnsCount - gtyCount} PPPK / Kontrak
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Rerata Beban Jam</div>
          <div className="text-2xl font-extrabold text-teal-800 font-mono">{avgHours} Jam</div>
          <p className="text-[11px] text-teal-600 font-medium mt-1">Tatap Muka / Minggu</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama guru, NIP, atau mata pelajaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Rumpun</option>
              <option value="MIPA">MIPA</option>
              <option value="Bahasa">Bahasa</option>
              <option value="Sosial Humaniora">Sosial Humaniora</option>
              <option value="Informatika & Vokasi">Informatika & Vokasi</option>
              <option value="Seni & Penjas">Seni & Penjas</option>
              <option value="Lainnya">Lainnya</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Status Kepegawaian</option>
              <option value="PNS">PNS</option>
              <option value="GTY / Tetap Yayasan">GTY / Tetap Yayasan</option>
              <option value="PPPK">PPPK</option>
              <option value="Guru Honorer">Guru Honorer</option>
            </select>

            <select
              value={selectedCert}
              onChange={(e) => setSelectedCert(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Sertifikasi</option>
              <option value="certified">Sudah Bersertifikat</option>
              <option value="uncertified">Belum Bersertifikat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Table & Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTeachers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">Tidak ada data guru yang cocok</h4>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan tombol &quot;Input Guru Manual&quot; atau &quot;Impor Otomatis&quot; untuk menambahkan data pendidik.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Nama Guru</th>
                  <th className="p-3.5">NIP / NUPTK</th>
                  <th className="p-3.5">Mata Pelajaran</th>
                  <th className="p-3.5">Rumpun</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Jam</th>
                  <th className="p-3.5">Tugas Tambahan</th>
                  <th className="p-3.5 text-center">Sertifikasi</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTeachers.map((tch) => (
                  <tr key={tch.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{tch.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Pendidikan: {tch.education}</span>
                        {tch.phone && <span>• {tch.phone}</span>}
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-slate-600">
                      {tch.nip}
                    </td>

                    <td className="p-3.5 font-semibold text-emerald-800">
                      {tch.subject}
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {tch.subjectCluster}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          tch.employmentStatus === 'PNS'
                            ? 'bg-blue-100 text-blue-800'
                            : tch.employmentStatus.includes('GTY')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tch.employmentStatus}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {tch.teachingHours} Jam
                    </td>

                    <td className="p-3.5 text-slate-600 max-w-xs truncate text-[11px]" title={tch.additionalRole}>
                      {tch.additionalRole || '-'}
                    </td>

                    <td className="p-3.5 text-center">
                      {tch.certificationStatus ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Lulus
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          Belum
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onStartSupervisionForTeacher(tch)}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Input supervisi untuk guru ini"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Supervisi</span>
                        </button>

                        <button
                          onClick={() => onEditTeacher(tch)}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Ubah data guru"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus data ${tch.name}?`)) {
                              onDeleteTeacher(tch.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus guru"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
