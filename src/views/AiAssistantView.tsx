import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  FilePlus,
  RotateCcw,
  Bot,
  User,
  Loader2,
  BookOpen,
  Award,
  Layers,
  HelpCircle,
  Download
} from 'lucide-react';
import { DocumentItem } from '../types';
import { broadcastToast } from '../services/notificationService';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiAssistantViewProps {
  initialPrompt?: string;
  onSaveAsDocument?: (doc: DocumentItem) => void;
}

export function AiAssistantView({ initialPrompt, onSaveAsDocument }: AiAssistantViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `### Halo! Saya AI Asisten Kurikulum SMA Plus PGRI Cibinong 🎓✨\n\nSaya siap membantu Tim Kurikulum dan Bapak/Ibu Dewan Guru dalam:\n* **Penyusunan Modul Ajar Berdiferensiasi** (Konten, Proses, & Produk) sesuai BSKAP 032/H/KR/2024.\n* **Pembuatan Kisi-kisi, Butir Soal HOTS, dan Rubrik Asesmen** bertingkat.\n* **Rancang Bangun Modul Projek P5** terintegrasi kecakapan teknologi & karakter sekolah unggulan.\n* **Perumusan Rencana Tindak Lanjut (RTL) Supervisi Akademik Klinis**.\n\nSilakan pilih salah satu menu cepat di atas atau ajukan pertanyaan spesifik Anda!`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState(initialPrompt || '');
  const [selectedMode, setSelectedMode] = useState<string>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      setInputPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const quickPrompts = [
    {
      title: 'Modul Ajar Diferensiasi',
      mode: 'module_generator',
      prompt:
        'Buatkan rancangan draf Modul Ajar berdiferensiasi untuk mata pelajaran Matematika Tingkat Lanjut Fase F (Kelas XI) topik Vektor Ruang Dimensi Tiga, lengkap dengan pertanyaan pemantik, sintaks Problem Based Learning, dan rubrik asesmen formatif.',
    },
    {
      title: 'Kisi-kisi & Rubrik HOTS',
      mode: 'assessment_rubric',
      prompt:
        'Susunkan kisi-kisi soal Asesmen Sumatif Akhir Semester mata pelajaran Fisika Fase F, materi Dinamika Rotasi dan Fluida, berbasis stimulus kontekstual HOTS (C4-C6) beserta rubrik penskoran analitik.',
    },
    {
      title: 'Modul Projek P5',
      mode: 'module_generator',
      prompt:
        'Rancang modul Projek Penguatan Profil Pelajar Pancasila (P5) tema "Rekayasa & Teknologi" subtema Smart Green School untuk Fase E (Kelas X) SMA Plus PGRI Cibinong. Sertakan alur aktivitas MERDEKA dan rubrik asesmen dimensi Bernalar Kritis & Gotong Royong.',
    },
    {
      title: 'Solusi RTL Supervisi',
      mode: 'supervision_rtl',
      prompt:
        'Analisis hasil supervisi pembelajaran dengan temuan: guru dominan ceramah satu arah, diferensiasi proses belum jalan, dan siswa pasif. Berikan usulan program Rencana Tindak Lanjut (RTL) coaching klinis berdurasi 3 minggu.',
    },
  ];

  const handleSend = async (textToSend?: string, modeToSend?: string) => {
    const promptText = (textToSend || inputPrompt).trim();
    if (!promptText || isLoading) return;

    const currentMode = modeToSend || selectedMode;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          mode: currentMode,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'Tidak ada teks yang dikembalikan oleh AI.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const error = err as Error;
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ Maaf, terjadi kendala koneksi ke server AI (${error.message}). Silakan periksa kembali jaringan Anda atau coba sesaat lagi.`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    broadcastToast({
      title: 'Tersalin ke Clipboard',
      message: 'Teks rekomendasi AI telah disalin.',
      type: 'info',
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveAsDraft = (msg: Message) => {
    if (!onSaveAsDocument) return;

    const firstLine = msg.text.split('\n')[0].replace(/^[#* ]+/, '') || 'Dokumen Kurikulum Berbantuan AI';
    const newDoc: DocumentItem = {
      id: `doc-ai-${Date.now()}`,
      title: firstLine.slice(0, 70),
      type: 'Modul Ajar',
      phase: 'Fase F (Kelas XI)',
      subject: 'Kurikulum Merdeka',
      authorTeacher: 'AI Asisten Kurikulum (Draf)',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      fileSize: '1.4 MB',
      version: 'v1.0 AI-Draft',
      description: msg.text.slice(0, 200) + '...',
      learningObjectives: ['Dirumuskan otomatis oleh Gemini 3.8 Flash'],
      reviewerNotes: 'Menunggu reviu dan validasi tim kurikulum sekolah sebelum disahkan.',
    };

    onSaveAsDocument(newDoc);
    broadcastToast({
      title: 'Disimpan ke Manajemen Dokumen!',
      message: `"${newDoc.title}" berhasil ditambahkan ke daftar dokumen kurikulum.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">AI Asisten Kurikulum SMA Plus PGRI Cibinong</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Gemini 3.8 Flash Ready
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Konsultan pintar Kurikulum Merdeka, penyusun modul ajar, rubrik asesmen, dan rencana tindak lanjut
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Hapus seluruh riwayat percakapan?')) {
              setMessages([messages[0]]);
            }
          }}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Chat
        </button>
      </div>

      {/* Quick Prompts Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
          Rekomendasi Template Prompt Cepat:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedMode(qp.mode);
                handleSend(qp.prompt, qp.mode);
              }}
              className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-400 text-left transition-all shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-amber-800 mb-1">
                <span>{qp.title}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 opacity-60 group-hover:opacity-100" />
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{qp.prompt}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages Stream */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white shadow-xs rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs rounded-tl-none'
                }`}
              >
                {/* Message body */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Footer bar for assistant messages */}
                {msg.sender === 'assistant' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{msg.timestamp}</span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="px-2 py-1 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Salin ke clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>

                      {msg.id !== 'welcome' && onSaveAsDocument && (
                        <button
                          onClick={() => handleSaveAsDraft(msg)}
                          className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Simpan hasil AI ini ke Manajemen Dokumen Kurikulum"
                        >
                          <FilePlus className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Simpan Jadi Draf Dokumen</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                <span>AI Kurikulum sedang merumuskan draf terbaik untuk SMA Plus PGRI Cibinong...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ketik topik atau permintaan Anda (misal: 'Rancang rubrik asesmen sumatif Fisika Fase F')..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
