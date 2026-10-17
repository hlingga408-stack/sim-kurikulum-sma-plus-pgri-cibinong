/**
 * =========================================================================================
 * SIM Kurikulum SMA Plus PGRI Cibinong - Google Apps Script (GAS) & Google Sheets Service
 * =========================================================================================
 * 
 * Modul ini menghubungkan antarmuka React dengan backend Google Apps Script:
 * 1. Mode Langsung (Native GAS): Berjalan di dalam iframe Google Apps Script menggunakan google.script.run
 * 2. Mode Web API (REST Endpoint): Berjalan mandiri (local/Vercel) dan memanggil Web App URL GAS
 * 3. Mode Cadangan (LocalStorage/Offline): Memastikan aplikasi tetap dapat berfungsi saat koneksi terputus
 */

import {
  Teacher,
  DocumentItem,
  WorkProgram,
  SupervisionRecord,
  CalendarEvent,
  MeetingRecord,
  DispositionRecord,
  MeetingFollowUpRecord,
  DocStatus,
} from '../types';

declare global {
  interface Window {
    google?: {
      script?: {
        run: {
          withSuccessHandler: (fn: (result: any) => void) => any;
          withFailureHandler: (fn: (error: any) => void) => any;
          [key: string]: any;
        };
      };
    };
  }
}

export interface SpreadsheetInfo {
  id: string;
  name: string;
  url: string;
  sheets: Array<{ name: string; rows: number; cols: number }>;
  serverTime?: string;
}

export interface FullDataset {
  teachers: Teacher[];
  documents: DocumentItem[];
  programs: WorkProgram[];
  supervisions: SupervisionRecord[];
  events: CalendarEvent[];
  meetings: MeetingRecord[];
  dispositions: DispositionRecord[];
  meetingRtls: MeetingFollowUpRecord[];
  spreadsheetInfo?: SpreadsheetInfo;
}

const STORAGE_KEY_GAS_URL = 'pgri_curriculum_gas_url';
const STORAGE_KEY_AUTO_SYNC = 'pgri_curriculum_auto_sync_enabled';

// URL bawaan jika ingin menanamkan deployment Apps Script langsung di source code
export const DEFAULT_GAS_URL = '';

export type SyncStatusType = 'idle' | 'syncing' | 'saved' | 'error' | 'offline';

export interface SyncStatusInfo {
  status: SyncStatusType;
  lastSavedAt: Date | null;
  errorMessage: string | null;
}

type SyncListener = (info: SyncStatusInfo) => void;

let currentSyncInfo: SyncStatusInfo = {
  status: 'idle',
  lastSavedAt: null,
  errorMessage: null,
};

const syncListeners = new Set<SyncListener>();

function notifySyncListeners() {
  syncListeners.forEach((listener) => {
    try {
      listener(currentSyncInfo);
    } catch (e) {
      console.error('Error in sync listener:', e);
    }
  });
}

export function getSyncStatusInfo(): SyncStatusInfo {
  return currentSyncInfo;
}

export function updateSyncStatus(status: SyncStatusType, errorMessage: string | null = null): void {
  currentSyncInfo = {
    status,
    lastSavedAt: status === 'saved' ? new Date() : currentSyncInfo.lastSavedAt,
    errorMessage: status === 'error' ? errorMessage : null,
  };
  notifySyncListeners();
}

export function subscribeSyncStatus(listener: SyncListener): () => void {
  syncListeners.add(listener);
  listener(currentSyncInfo);
  return () => {
    syncListeners.delete(listener);
  };
}

export function isAutoSyncEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const val = localStorage.getItem(STORAGE_KEY_AUTO_SYNC);
  return val === null ? true : val === 'true'; // Default aktif (true)
}

export function setAutoSyncEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_AUTO_SYNC, String(enabled));
  notifySyncListeners();
}

/**
 * Cek apakah aplikasi sedang berjalan langsung di dalam lingkungan Google Apps Script
 */
export function isRunningInGas(): boolean {
  return typeof window !== 'undefined' && Boolean(window.google?.script?.run);
}

/**
 * Mendapatkan URL Web App Google Apps Script yang tersimpan
 */
export function getSavedGasUrl(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem(STORAGE_KEY_GAS_URL) ||
    (window as any).GAS_WEB_APP_URL ||
    (import.meta as any).env?.VITE_GAS_URL ||
    DEFAULT_GAS_URL ||
    ''
  );
}

/**
 * Menyimpan URL Web App Google Apps Script
 */
export function saveGasUrl(url: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = url.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY_GAS_URL, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY_GAS_URL);
  }
  const conn = getConnectionStatus();
  updateSyncStatus(conn.isReady ? 'idle' : 'offline');
}

/**
 * Cek status konektivitas Google Apps Script / Google Sheets
 */
export function getConnectionStatus(): {
  mode: 'native_gas' | 'api_connected' | 'offline_local';
  label: string;
  isReady: boolean;
  gasUrl: string;
} {
  if (isRunningInGas()) {
    return {
      mode: 'native_gas',
      label: 'Google Apps Script (Native Drive)',
      isReady: true,
      gasUrl: '(Ekosistem Google Native)',
    };
  }

  const savedUrl = getSavedGasUrl();
  if (savedUrl) {
    return {
      mode: 'api_connected',
      label: 'Google Sheets (Terhubung Web API)',
      isReady: true,
      gasUrl: savedUrl,
    };
  }

  return {
    mode: 'offline_local',
    label: 'Penyimpanan Lokal / Offline',
    isReady: false,
    gasUrl: '',
  };
}

let autoSyncTimer: any = null;

export function cancelPendingAutoSync(): void {
  if (autoSyncTimer) {
    clearTimeout(autoSyncTimer);
    autoSyncTimer = null;
  }
}

/**
 * Jadwalkan sinkronisasi otomatis ke Google Sheets secara real-time dengan jeda debounce
 */
export function scheduleAutoSync(
  dataset: FullDataset,
  delayMs = 1200
): Promise<{ success: boolean; message: string } | null> {
  cancelPendingAutoSync();

  const conn = getConnectionStatus();
  if (!conn.isReady) {
    updateSyncStatus('offline');
    return Promise.resolve(null);
  }

  if (!isAutoSyncEnabled()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    updateSyncStatus('syncing');
    autoSyncTimer = setTimeout(async () => {
      autoSyncTimer = null;
      try {
        const res = await syncAllDataToSheets(dataset);
        updateSyncStatus('saved');
        resolve(res);
      } catch (err: any) {
        updateSyncStatus('error', err?.message || 'Gagal menyimpan ke Google Sheets');
        resolve(null);
      }
    }, delayMs);
  });
}

/**
 * Eksekutor pemanggilan backend GAS (Otomatis memilih google.script.run atau HTTP fetch)
 */
async function callGasBackend<T>(functionName: string, actionName: string, payload?: any): Promise<T> {
  // Mode 1: Native Google Apps Script
  if (isRunningInGas() && window.google?.script?.run) {
    return new Promise((resolve, reject) => {
      const runner = window.google!.script!.run
        .withSuccessHandler((res: any) => resolve(res as T))
        .withFailureHandler((err: any) => reject(new Error(err?.message || String(err))));

      if (typeof runner[functionName] === 'function') {
        if (payload !== undefined) {
          runner[functionName](payload);
        } else {
          runner[functionName]();
        }
      } else {
        // Fallback panggil via doPost internal jika fungsi belum ada
        if (typeof runner.doPost === 'function') {
          runner.doPost({ postData: { contents: JSON.stringify({ action: actionName, data: payload }) } });
        } else {
          reject(new Error(`Fungsi ${functionName} tidak ditemukan di Google Apps Script.`));
        }
      }
    });
  }

  // Mode 2: HTTP fetch ke Web App URL
  const gasUrl = getSavedGasUrl();
  if (!gasUrl) {
    throw new Error('URL Google Apps Script belum dikonfigurasikan.');
  }

  try {
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Hindari preflight OPTIONS CORS berlebih di GAS
      },
      body: JSON.stringify({
        action: actionName,
        data: payload,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    if (!json.success && json.error) {
      throw new Error(json.error);
    }
    return (json.data ?? json) as T;
  } catch (err: any) {
    console.error(`Gagal memanggil GAS action [${actionName}]:`, err);
    throw err;
  }
}

// =========================================================================================
// API METHODS
// =========================================================================================

/**
 * Mengambil informasi Spreadsheet Google Drive
 */
export async function getSpreadsheetInfo(): Promise<SpreadsheetInfo> {
  if (isRunningInGas()) {
    return callGasBackend<SpreadsheetInfo>('getSpreadsheetInfo', 'getInfo');
  }

  const gasUrl = getSavedGasUrl();
  if (!gasUrl) {
    throw new Error('URL GAS belum diisi');
  }

  const res = await fetch(`${gasUrl}?action=getInfo`, { method: 'GET' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal mengambil info Spreadsheet');
  return json.info;
}

/**
 * Inisialisasi struktur sheet & header di Google Sheets
 */
export async function initSpreadsheetDatabase(): Promise<{
  success: boolean;
  message: string;
  spreadsheetUrl: string;
  spreadsheetId: string;
  spreadsheetName: string;
}> {
  return callGasBackend('initDatabase', 'initDatabase');
}

/**
 * Memasukkan seluruh data awal aplikasi ke Spreadsheet Google Drive
 */
export async function seedSpreadsheetDatabase(overwrite = false): Promise<{
  success: boolean;
  message: string;
  counts?: Record<string, number>;
}> {
  return callGasBackend('isiDataAplikasiKeSpreadsheet', 'seedDatabase', { overwrite });
}

/**
 * Mengambil seluruh dataset dari Google Sheets
 */
export async function fetchAllDataFromSheets(): Promise<FullDataset> {
  return callGasBackend<FullDataset>('getAllData', 'getAllData');
}

/**
 * Sinkronisasi seluruh dataset lokal ke Google Sheets (Massal)
 */
export async function syncAllDataToSheets(dataset: FullDataset): Promise<{ success: boolean; message: string }> {
  return callGasBackend<{ success: boolean; message: string }>('syncAllData', 'syncAllData', dataset);
}

// ----------------------------------------------------
// Modul: Guru
// ----------------------------------------------------
export async function gasSaveTeacher(teacher: Teacher): Promise<Teacher> {
  return callGasBackend<Teacher>('saveTeacher', 'saveTeacher', teacher);
}

export async function gasDeleteTeacher(id: string): Promise<boolean> {
  return callGasBackend<boolean>('deleteTeacher', 'deleteTeacher', id);
}

export async function gasImportTeachers(teachers: Teacher[]): Promise<Teacher[]> {
  return callGasBackend<Teacher[]>('importTeachers', 'importTeachers', teachers);
}

// ----------------------------------------------------
// Modul: Dokumen
// ----------------------------------------------------
export async function gasSaveDocument(doc: DocumentItem): Promise<DocumentItem> {
  return callGasBackend<DocumentItem>('saveDocument', 'saveDocument', doc);
}

export async function gasDeleteDocument(id: string): Promise<boolean> {
  return callGasBackend<boolean>('deleteDocument', 'deleteDocument', id);
}

export async function gasUpdateDocStatus(id: string, status: DocStatus): Promise<boolean> {
  return callGasBackend<boolean>('updateDocStatus', 'updateDocStatus', { id, status });
}

// ----------------------------------------------------
// Modul: Program Kerja
// ----------------------------------------------------
export async function gasSaveProgram(program: WorkProgram): Promise<WorkProgram> {
  return callGasBackend<WorkProgram>('saveProgram', 'saveProgram', program);
}

export async function gasDeleteProgram(id: string): Promise<boolean> {
  return callGasBackend<boolean>('deleteProgram', 'deleteProgram', id);
}

export async function gasToggleMilestone(programId: string, milestoneId: string): Promise<WorkProgram> {
  return callGasBackend<WorkProgram>('toggleMilestone', 'toggleMilestone', { programId, milestoneId });
}

// ----------------------------------------------------
// Modul: Supervisi Klinis
// ----------------------------------------------------
export async function gasSaveSupervision(record: SupervisionRecord): Promise<SupervisionRecord> {
  return callGasBackend<SupervisionRecord>('saveSupervision', 'saveSupervision', record);
}

export async function gasDeleteSupervision(id: string): Promise<boolean> {
  return callGasBackend<boolean>('deleteSupervision', 'deleteSupervision', id);
}

export async function gasToggleSupervisionRtl(id: string): Promise<SupervisionRecord> {
  return callGasBackend<SupervisionRecord>('toggleSupervisionRtl', 'toggleSupervisionRtl', id);
}

// ----------------------------------------------------
// Modul: Agenda & Kalender
// ----------------------------------------------------
export async function gasSaveEvent(event: CalendarEvent): Promise<CalendarEvent> {
  return callGasBackend<CalendarEvent>('saveEvent', 'saveEvent', event);
}

export async function gasDeleteEvent(id: string): Promise<boolean> {
  return callGasBackend<boolean>('deleteEvent', 'deleteEvent', id);
}

export async function gasToggleEventComplete(id: string): Promise<boolean> {
  return callGasBackend<boolean>('toggleEventComplete', 'toggleEventComplete', id);
}

// ----------------------------------------------------
// Modul: Rapat & Notulensi
// ----------------------------------------------------
export async function gasSaveMeeting(meeting: MeetingRecord): Promise<MeetingRecord> {
  return callGasBackend<MeetingRecord>('saveMeeting', 'saveMeeting', meeting);
}

export async function gasDeleteMeeting(id: string): Promise<boolean> {
  return callGasBackend<boolean>('deleteMeeting', 'deleteMeeting', id);
}

// ----------------------------------------------------
// Modul: Disposisi Surat
// ----------------------------------------------------
export async function gasSaveDisposition(disposition: DispositionRecord): Promise<DispositionRecord> {
  return callGasBackend<DispositionRecord>('saveDisposition', 'saveDisposition', disposition);
}

export async function gasDeleteDisposition(id: string): Promise<boolean> {
  return callGasBackend<boolean>('deleteDisposition', 'deleteDisposition', id);
}

// ----------------------------------------------------
// Modul: RTL Rapat
// ----------------------------------------------------
export async function gasSaveMeetingRtl(rtl: MeetingFollowUpRecord): Promise<MeetingFollowUpRecord> {
  return callGasBackend<MeetingFollowUpRecord>('saveMeetingRtl', 'saveMeetingRtl', rtl);
}

export async function gasDeleteMeetingRtl(id: string): Promise<boolean> {
  return callGasBackend<boolean>('deleteMeetingRtl', 'deleteMeetingRtl', id);
}

// ----------------------------------------------------
// AI Assistant via GAS
// ----------------------------------------------------
export async function gasGenerateAi(prompt: string, mode?: string, context?: any): Promise<string> {
  const res = await callGasBackend<{ success: boolean; text: string; error?: string }>(
    'generateAiResponse',
    'aiGenerate',
    { prompt, mode, context }
  );
  if (!res.success && res.error) {
    throw new Error(res.error);
  }
  return res.text;
}
