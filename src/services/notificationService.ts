import { CalendarEvent, ToastMessage } from '../types';

type ToastListener = (toast: ToastMessage) => void;
const toastListeners: Set<ToastListener> = new Set();

export function subscribeToToasts(listener: ToastListener) {
  toastListeners.add(listener);
  return () => {
    toastListeners.delete(listener);
  };
}

export function broadcastToast(toast: Omit<ToastMessage, 'id' | 'timestamp'>) {
  const fullToast: ToastMessage = {
    ...toast,
    id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  };
  toastListeners.forEach((listener) => listener(fullToast));
}

/**
 * Play a pleasant notification audio chime using the Web Audio API.
 * No external media dependencies required.
 */
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.2, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);

    // Second bell chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, now + 0.15); // D6

    gain2.gain.setValueAtTime(0.001, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.61);
  } catch (e) {
    console.debug('Audio context not permitted yet or unsupported', e);
  }
}

/**
 * Check if the browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    broadcastToast({
      title: 'Peramban Tidak Mendukung',
      message: 'Browser Anda tidak mendukung Web Push Notification.',
      type: 'warning',
    });
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      playNotificationSound();
      broadcastToast({
        title: 'Notifikasi Push Aktif!',
        message: 'Pengingat jadwal Kurikulum SMA Plus PGRI Cibinong akan langsung tampil di layar Anda.',
        type: 'success',
      });
      // Fire a welcome test notification
      showBrowserNotification(
        '🔔 SIM-Kurikulum SMA Plus PGRI Cibinong',
        'Notifikasi push jadwal akademik & pengingat telah berhasil diaktifkan!'
      );
    } else {
      broadcastToast({
        title: 'Izin Notifikasi Ditolak',
        message: 'Anda dapat mengaktifkannya kapan saja di pengaturan perizinan browser.',
        type: 'info',
      });
    }
    return permission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

/**
 * Display a push notification via the browser's Notification API + fallback in-app alert
 */
export function showBrowserNotification(title: string, body: string, data?: unknown) {
  playNotificationSound();

  // Always broadcast in-app toast for visibility
  broadcastToast({
    title,
    message: body,
    type: 'alert',
  });

  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `kurikulum-reminder-${Date.now()}`,
        requireInteraction: true,
        data,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.warn('Native notification failed, in-app notification displayed.', err);
    }
  }
}

/**
 * Scheduler check that runs periodically to trigger notifications for upcoming tasks/events
 */
export function startReminderScheduler(getEvents: () => CalendarEvent[], onEventNotified?: (eventId: string) => void) {
  const intervalId = setInterval(() => {
    const events = getEvents();
    const now = new Date();

    events.forEach((event) => {
      if (event.completed || event.notified) return;

      const eventDateTime = new Date(`${event.date}T${event.time || '08:00'}:00`);
      const reminderOffsetMs = (event.reminderMinutesBefore || 15) * 60 * 1000;
      const targetNotificationTime = new Date(eventDateTime.getTime() - reminderOffsetMs);

      // Trigger if now is past or within 30 seconds of the scheduled reminder time
      const timeDiff = now.getTime() - targetNotificationTime.getTime();
      const isDue = timeDiff >= 0 && timeDiff < 90000; // within 90-second window

      if (isDue) {
        showBrowserNotification(
          `⏰ Pengingat: ${event.title}`,
          `Prioritas ${event.priority} • Waktu: ${event.time} WIB • Lokasi/PIC: ${event.location || event.pic}. Kategori: ${event.category.toUpperCase()}`
        );
        if (onEventNotified) {
          onEventNotified(event.id);
        }
      }
    });
  }, 10000); // Check every 10 seconds

  return () => clearInterval(intervalId);
}
