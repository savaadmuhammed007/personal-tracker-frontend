import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { NotificationPermissionModal } from '../components/modals/NotificationPermissionModal';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState(() => {
    return 'Notification' in window ? Notification.permission : 'unsupported';
  });
  const [notificationDuration, setNotificationDuration] = useState(() => {
    return localStorage.getItem('notification_duration') || 'forever';
  });
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  const audioCtxRef = useRef(null);

  // Sync native permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Synthesize pleasant acoustic chime using Web Audio API (reusing singleton context)
  const playChime = useCallback((type = 'complete') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      if (type === 'complete') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      } else if (type === 'tap') {
        osc.frequency.setValueAtTime(440.0, audioCtx.currentTime); // A4
      }

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.36);
    } catch (e) {
      // AudioContext might be blocked until user gesture
    }
  }, []);

  const triggerHaptic = useCallback((pattern = 25) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const showToast = useCallback((title, message = '', type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (type === 'success') {
      playChime('complete');
      triggerHaptic(30);
    }

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, [playChime, triggerHaptic]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openNotificationModal = useCallback(() => {
    setIsPermissionModalOpen(true);
  }, []);

  const closeNotificationModal = useCallback(() => {
    setIsPermissionModalOpen(false);
  }, []);

  const enableNotificationsWithDuration = useCallback(async (durationChoice = 'forever') => {
    if (!('Notification' in window)) {
      showToast('Unsupported', 'Web notifications are not supported on this browser.', 'error');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        localStorage.setItem('notification_duration', durationChoice);
        setNotificationDuration(durationChoice);

        if (durationChoice === '1_hour') {
          const expiryTime = Date.now() + 60 * 60 * 1000;
          localStorage.setItem('notification_expiry', String(expiryTime));
        } else {
          localStorage.removeItem('notification_expiry');
        }

        if (durationChoice === 'close_site') {
          sessionStorage.setItem('notification_session_active', 'true');
        } else {
          sessionStorage.removeItem('notification_session_active');
        }

        const durationLabels = {
          forever: 'Forever (Always On)',
          '1_hour': 'For 1 Hour',
          close_site: 'Until You Close Site',
          prayer_only: 'Prayer Times Only',
        };

        showToast(
          'Notifications Active',
          `Alhamdulillah! Alerts enabled: ${durationLabels[durationChoice] || durationChoice}.`
        );
        playChime('complete');
        triggerHaptic(50);

        // Send a welcome test notification
        const welcomeTitle = 'يومي | Notifications Enabled';
        const welcomeBody = `Device alerts set to ${durationLabels[durationChoice] || durationChoice}. You will receive Adhan reminders.`;

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification(welcomeTitle, {
            body: welcomeBody,
            icon: '/icons/crescent-star.svg',
            badge: '/icons/crescent-star.svg',
          });
        } else {
          new Notification(welcomeTitle, {
            body: welcomeBody,
            icon: '/icons/crescent-star.svg',
          });
        }
        return true;
      } else if (permission === 'denied') {
        showToast('Permission Blocked', 'Notifications were blocked in your browser settings.', 'error');
        return false;
      }
      return false;
    } catch (err) {
      console.error('Notification permission error:', err);
      showToast('Permission Error', 'Could not request notification access.', 'error');
      return false;
    }
  }, [showToast, playChime, triggerHaptic]);

  const testNotification = useCallback(async () => {
    if (Notification.permission !== 'granted') {
      openNotificationModal();
      return;
    }
    playChime('complete');
    triggerHaptic(50);
    try {
      const testTitle = 'يومي | Adhan Alert Test';
      const testBody = 'Hayya ‘ala-s-Salah! Notifications and audio feedback are fully working.';

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification(testTitle, {
          body: testBody,
          icon: '/icons/crescent-star.svg',
          badge: '/icons/crescent-star.svg',
        });
      } else {
        new Notification(testTitle, {
          body: testBody,
          icon: '/icons/crescent-star.svg',
        });
      }
      showToast('Alert Sent', 'Check your device notification center.');
    } catch (err) {
      console.error('Test alert error:', err);
    }
  }, [openNotificationModal, playChime, triggerHaptic, showToast]);

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        playChime,
        triggerHaptic,
        notificationPermission,
        notificationDuration,
        openNotificationModal,
        closeNotificationModal,
        enableNotificationsWithDuration,
        testNotification,
      }}
    >
      {children}

      {/* Global Notification Enable & Duration Modal */}
      <NotificationPermissionModal
        isOpen={isPermissionModalOpen}
        onClose={closeNotificationModal}
      />

      {/* Toast container */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between p-4 rounded-xl shadow-lg backdrop-blur-md border animate-slide-up transition-all ${
              toast.type === 'success'
                ? 'bg-[#0b5d81]/95 border-[#3dc3f3]/60 text-[#f0faff] shadow-lg shadow-[#088ac1]/25'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-700/50 text-rose-100 shadow-lg shadow-rose-950/25'
                : 'bg-slate-900/90 border-slate-700/50 text-slate-100 shadow-lg'
            }`}
          >
            <div>
              <p className="font-semibold text-sm">{toast.title}</p>
              {toast.message && <p className="text-xs opacity-80 mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs opacity-60 hover:opacity-100 ml-3 p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
