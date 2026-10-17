import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client utility
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Curriculum AI Assistant API endpoint
app.post('/api/ai/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, mode, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ai) {
      // Fallback response if API key is not configured
      return res.json({
        text: `### Rekomendasi Kurikulum (Mode Offline/Praktik)\n\nPermintaan Anda: **"${prompt}"**\n\n*Catatan: Konfigurasi GEMINI_API_KEY terdeteksi belum diisi. Berikut draf panduan standar Kurikulum SMA Plus PGRI Cibinong:*\n\n1. **Kesesuaian Capaian Pembelajaran (CP)**: Pastikan tujuan pembelajaran selaras dengan Keputusan BSKAP No. 032/H/KR/2024.\n2. **Prinsip Diferensiasi**: Rancang konten, proses, dan produk yang memfasilitasi keberagaman gaya belajar dan minat siswa.\n3. **Integrasi Karakter & Plus PGRI Cibinong**: Sertakan dimensi Profil Pelajar Pancasila (Beriman, Mandiri, Bernalar Kritis, Kreatif, Bergotong Royong, Berkebinekaan Global) serta budaya disiplin dan keunggulan teknologi sekolah.\n4. **Asesmen Autentik**: Gunakan asesmen formatif berkelanjutan untuk perbaikan proses belajar.`,
      });
    }

    let systemInstruction = `Anda adalah Asisten Pakar Kurikulum AI resmi untuk SMA Plus PGRI Cibinong (Sekolah Unggulan berkarakter, berbasis teknologi dan Kurikulum Merdeka).
Tugas Anda adalah membantu Wakil Kepala Sekolah Bidang Kurikulum, staf kurikulum, dan dewan guru dalam:
1. Merumuskan Alur Tujuan Pembelajaran (ATP) dan Modul Ajar berdiferensiasi.
2. Menyusun instrumen asesmen diagnostik, formatif, sumatif, kisi-kisi, dan rubrik penilaian berstandar HOTS (Higher Order Thinking Skills).
3. Merancang modul Projek Penguatan Profil Pelajar Pancasila (P5) yang inovatif.
4. Menganalisis hasil supervisi akademik klinis dan memberikan Rencana Tindak Lanjut (RTL) yang solutif serta pembinaan guru.
5. Memberikan masukan perbaikan dokumen kurikulum (KOSP, silabus, program tahunan/semester).

Gunakan bahasa Indonesia yang profesional, akademis, terstruktur (gunakan heading Markdown, bullet points, tabel bila relevan), lugas, dan sesuai regulasi Kemendikbudristek & BSKAP terbaru serta ciri khas unggulan SMA Plus PGRI Cibinong.`;

    if (mode === 'module_generator') {
      systemInstruction += `\nFokuskan pada pembuatan struktur Modul Ajar lengkap: Identitas (Fase/Kelas, Alokasi Waktu), Capaian Pembelajaran, Tujuan Pembelajaran, Profil Pelajar Pancasila, Sarana & Prasarana, Target Peserta Didik, Model Pembelajaran, Pemahaman Bermakna & Pertanyaan Pemantik, Kegiatan Pembelajaran (Pendahuluan, Inti diferensiasi, Penutup), dan Rencana Asesmen + Lampiran.`;
    } else if (mode === 'assessment_rubric') {
      systemInstruction += `\nFokuskan pada pembuatan Kisi-kisi Soal, Indikator Ketercapaian Tujuan Pembelajaran (IKTP), butir stimulus soal (HOTS), kunci jawaban, dan rubrik penilaian berjenjang.`;
    } else if (mode === 'supervision_rtl') {
      systemInstruction += `\nFokuskan pada analisis temuan supervisi kelas berdasarkan 5 instrumen supervisi resmi SMA Plus PGRI Cibinong:
1. Administrasi (kelengkapan kalender pendidikan, Prota/Prosem, jurnal mengajar, buku nilai & presensi)
2. Perencanaan (ATP, Modul Ajar diferensiasi, asesmen awal diagnostik)
3. Pelaksanaan (manajemen kelas, keaktifan murid, integrasi TPACK/teknologi)
4. Asesmen (asesmen formatif berkelanjutan, rubrik analitik, umpan balik)
5. Quantum Learning (penerapan kerangka TANDUR: Tumbuhkan, Alami, Namai, Demonstrasikan, Ulangi, Rayakan serta prinsip AMBAK & penataan lingkungan belajar positif)

Buat matriks Rencana Tindak Lanjut (RTL) yang terarah dan aplikatif dengan timeline, metode pendampingan/coaching, dan indikator keberhasilan.`;
    }

    const fullPrompt = context
      ? `Konteks/Data Terkait:\n${JSON.stringify(context, null, 2)}\n\nInstruksi Pengguna:\n${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || 'Tidak ada respons dari model.';
    return res.json({ text });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in /api/ai/generate:', error);
    return res.status(500).json({
      error: error.message || 'Terjadi kesalahan saat memproses permintaan AI.',
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    school: 'SMA Plus PGRI Cibinong',
    app: 'SIM-Kurikulum',
    hasApiKey: !!apiKey,
    serverTime: new Date().toISOString(),
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIM-Kurikulum server running on port ${PORT} [env: ${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
