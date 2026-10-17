import { useState, useEffect } from 'react';
import { Teacher, TeacherCluster, EmploymentType } from '../types';
import { X, UserPlus, Users, GraduationCap, Phone, Mail, Clock, Award } from 'lucide-react';

interface TeacherModalProps {
  teacher: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: Teacher) => void;
}

export function TeacherModal({ teacher, isOpen, onClose, onSave }: TeacherModalProps) {
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectCluster, setSubjectCluster] = useState<TeacherCluster>('MIPA');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentType>('GTY / Tetap Yayasan');
  const [education, setEducation] = useState<'S1' | 'S2' | 'S3'>('S1');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [teachingHours, setTeachingHours] = useState(24);
  const [additionalRole, setAdditionalRole] = useState('');
  const [certificationStatus, setCertificationStatus] = useState(true);

  useEffect(() => {
    if (teacher) {
      setName(teacher.name);
      setNip(teacher.nip);
      setSubject(teacher.subject);
      setSubjectCluster(teacher.subjectCluster);
      setEmploymentStatus(teacher.employmentStatus);
      setEducation(teacher.education);
      setPhone(teacher.phone || '');
      setEmail(teacher.email || '');
      setTeachingHours(teacher.teachingHours);
      setAdditionalRole(teacher.additionalRole || '');
      setCertificationStatus(teacher.certificationStatus);
    } else {
      setName('');
      setNip('198' + Math.floor(Math.random() * 8999999999999 + 1000000000000));
      setSubject('');
      setSubjectCluster('MIPA');
      setEmploymentStatus('GTY / Tetap Yayasan');
      setEducation('S1');
      setPhone('0812-');
      setEmail('');
      setTeachingHours(24);
      setAdditionalRole('');
      setCertificationStatus(true);
    }
  }, [teacher, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) return;

    const newTeacher: Teacher = {
      id: teacher?.id || `tch-${Date.now()}`,
      name: name.trim(),
      nip: nip.trim(),
      subject: subject.trim(),
      subjectCluster,
      employmentStatus,
      education,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      teachingHours: Number(teachingHours) || 24,
      additionalRole: additionalRole.trim() || undefined,
      certificationStatus,
    };

    onSave(newTeacher);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {teacher ? 'Ubah Data Guru' : 'Input Data Guru Baru (Manual)'}
              </h3>
              <p className="text-xs text-slate-500">Master Data Pendidik SMA Plus PGRI Cibinong</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="teacher-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Drs. H. Mulyadi, M.Pd."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NIP / NUPTK</label>
                <input
                  type="text"
                  placeholder="18 digit NIP / NUPTK"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran yang Diampu *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Matematika Tingkat Lanjut, Biologi, Kimia"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rumpun Mata Pelajaran</label>
                <select
                  value={subjectCluster}
                  onChange={(e) => setSubjectCluster(e.target.value as TeacherCluster)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="MIPA">MIPA (Matematika & Sains)</option>
                  <option value="Bahasa">Bahasa & Sastra</option>
                  <option value="Sosial Humaniora">Sosial Humaniora (IPS)</option>
                  <option value="Informatika & Vokasi">Informatika & Vokasi</option>
                  <option value="Seni & Penjas">Seni, Budaya & PJOK</option>
                  <option value="Lainnya">Lainnya / Bimbingan Konseling</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Kepegawaian</label>
                <select
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value as EmploymentType)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                >
                  <option value="GTY / Tetap Yayasan">GTY / Tetap Yayasan</option>
                  <option value="PNS">PNS (Aparatur Sipil Negara)</option>
                  <option value="PPPK">PPPK (P3K)</option>
                  <option value="Guru Honorer">Guru Honorer / Kontrak</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pendidikan Terakhir</label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value as 'S1' | 'S2' | 'S3')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                >
                  <option value="S1">S1 (Sarjana)</option>
                  <option value="S2">S2 (Magister)</option>
                  <option value="S3">S3 (Doktor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Beban Mengajar (Jam/Minggu)</label>
                <input
                  type="number"
                  min="4"
                  max="40"
                  value={teachingHours}
                  onChange={(e) => setTeachingHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp / HP</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Sekolah / Pribadi</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="nama@smapluspgri-cibinong.sch.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tugas Tambahan / Tanggung Jawab Khusus</label>
              <input
                type="text"
                placeholder="Contoh: Wali Kelas XI MIPA Plus, Koordinator P5, Pembina Riset KIR, Waka Kurikulum"
                value={additionalRole}
                onChange={(e) => setAdditionalRole(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Certification Status Toggle */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Status Sertifikasi Pendidik (Gr.)</div>
                  <div className="text-[11px] text-slate-500">Apakah guru telah lulus PPG dan memiliki Sertifikat Pendidik?</div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={certificationStatus}
                  onChange={(e) => setCertificationStatus(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
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
            form="teacher-form"
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
          >
            {teacher ? 'Simpan Perubahan' : 'Tambahkan Guru'}
          </button>
        </div>
      </div>
    </div>
  );
}
