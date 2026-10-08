import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  User,
  Compass,
  Bell,
  BellRing,
  Moon,
  Sun,
  Download,
  RotateCcw,
  Save,
  CheckCircle2,
  Volume2,
  Navigation,
  Loader2,
  Calendar,
  Sparkles,
  Plus,
  Minus,
  Smartphone,
  ShieldCheck,
  X,
  LogOut,
  Clock,
} from 'lucide-react';
import { settingsApi } from '../api/settingsApi';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { usePrayers } from '../context/PrayerContext';
import { Button } from '../components/common/UIComponents';
import { getHijriDate } from '../utils/hijri';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, profile, logout, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast, playChime, triggerHaptic } = useNotification();
  const { detectLocationGPS, isDetectingLocation, refreshPrayers, timetable, location } = usePrayers();

  // Browser Web Notification Permission State
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.__deferredPwaPrompt || null;
    }
    return null;
  });
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator?.standalone ||
      (typeof document !== 'undefined' && document.referrer && document.referrer.includes('android-app://'))
    );
  });
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    const ua = (window.navigator?.userAgent || '').toLowerCase();
    return /iphone|ipad|ipod/.test(ua) && !window.MSStream;
  });
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const handlePromptAvailable = () => {
      if (window.__deferredPwaPrompt) {
        setDeferredPrompt(window.__deferredPwaPrompt);
      }
    };
    const handleInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      showToast('App Installed', 'يومي is now installed and ready on your home screen!');
    };

    window.addEventListener('pwa-prompt-available', handlePromptAvailable);
    window.addEventListener('pwa-installed', handleInstalled);
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.__deferredPwaPrompt = e;
      setDeferredPrompt(e);
    });
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-available', handlePromptAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, [showToast]);

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      showToast('Unsupported', 'Web notifications are not supported on this browser.', 'error');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        showToast('Notifications Active', 'Alhamdulillah! Prayer Adhan and Dhikr alerts are now enabled.');
        playChime?.('complete');
        triggerHaptic?.(50);

        // Send a test/welcome notification
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification('يومي | Notifications Active', {
            body: 'You will receive timely prayer Adhan and Dhikr reminders on this device.',
            icon: '/icons/crescent-star.svg',
            badge: '/icons/crescent-star.svg',
          });
        } else {
          new Notification('يومي | Notifications Active', {
            body: 'You will receive timely prayer Adhan and Dhikr reminders on this device.',
            icon: '/icons/crescent-star.svg',
          });
        }
      } else if (permission === 'denied') {
        showToast('Permission Blocked', 'Notifications were blocked in your browser settings.', 'error');
      }
    } catch (err) {
      console.error('Notification permission error:', err);
    }
  };

  const handleTestNotification = async () => {
    if (Notification.permission !== 'granted') return;
    playChime?.('complete');
    triggerHaptic?.(50);
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification('يومي | Test Notification', {
          body: 'Allahumma barik! Prayer Adhan & Dhikr notifications are working smoothly.',
          icon: '/icons/crescent-star.svg',
          badge: '/icons/crescent-star.svg',
        });
      } else {
        new Notification('يومي | Test Notification', {
          body: 'Allahumma barik! Prayer Adhan & Dhikr notifications are working smoothly.',
          icon: '/icons/crescent-star.svg',
        });
      }
      showToast('Test Sent', 'Check your device notification center.');
    } catch {
      showToast('Audio Tested', 'Chime sound was played.');
    }
  };

  const handleInstallApp = async () => {
    if (isStandalone) {
      showToast('Already Installed', 'يومي is already installed and running as a standalone app.');
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsStandalone(true);
        setDeferredPrompt(null);
        window.__deferredPwaPrompt = null;
        showToast('Installed!', 'يومي was successfully installed on your device.');
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      showToast(
        'Install App',
        'Click the install icon (⊕) in your browser address bar or menu to install.'
      );
    }
  };

  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('Mecca');
  const [country, setCountry] = useState('Saudi Arabia');
  const [latitude, setLatitude] = useState(21.4225);
  const [longitude, setLongitude] = useState(39.8262);
  const [timezoneStr, setTimezoneStr] = useState('UTC');
  const [calcMethod, setCalcMethod] = useState('MWL');
  const [asrMethod, setAsrMethod] = useState('Standard');
  const [manualAdj, setManualAdj] = useState({ fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 });
  const [savedManualAdj, setSavedManualAdj] = useState({ fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 });
  const [liveTime, setLiveTime] = useState(() => new Date());
  const [hijriAdjustment, setHijriAdjustment] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prayerNotifs, setPrayerNotifs] = useState(true);
  const [habitNotifs, setHabitNotifs] = useState(true);
  const [taskNotifs, setTaskNotifs] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Live 1-second clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeTimezone = timezoneStr || location?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const formattedCurrentTime = (() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: activeTimezone,
      }).format(liveTime);
    } catch {
      return liveTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    }
  })();

  const getAdjustedPrayerTime = (baseTimeStr, savedAdjustment = 0, currentAdjustment = 0) => {
    if (!baseTimeStr) return '—';
    try {
      const match = baseTimeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return baseTimeStr;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3]?.toUpperCase();

      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      const netDelta = (parseInt(currentAdjustment, 10) || 0) - (parseInt(savedAdjustment, 10) || 0);
      let totalMinutes = hours * 60 + minutes + netDelta;
      totalMinutes = (totalMinutes + 1440 * 10) % 1440;

      let adjHours = Math.floor(totalMinutes / 60);
      const adjMins = totalMinutes % 60;
      const finalAmpm = adjHours >= 12 ? 'PM' : 'AM';
      adjHours = adjHours % 12 || 12;

      return `${String(adjHours).padStart(2, '0')}:${String(adjMins).padStart(2, '0')} ${finalAmpm}`;
    } catch {
      return baseTimeStr;
    }
  };

  const getBasePrayerTime = (baseTimeStr, savedAdjustment = 0) => {
    if (!baseTimeStr) return '—';
    try {
      const match = baseTimeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return baseTimeStr;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3]?.toUpperCase();

      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      let totalMinutes = hours * 60 + minutes - (parseInt(savedAdjustment, 10) || 0);
      totalMinutes = (totalMinutes + 1440 * 10) % 1440;

      let adjHours = Math.floor(totalMinutes / 60);
      const adjMins = totalMinutes % 60;
      const finalAmpm = adjHours >= 12 ? 'PM' : 'AM';
      adjHours = adjHours % 12 || 12;

      return `${String(adjHours).padStart(2, '0')}:${String(adjMins).padStart(2, '0')} ${finalAmpm}`;
    } catch {
      return baseTimeStr;
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsApi.getSettings();
        const p = res.data.profile || {};
        setDisplayName(p.display_name || res.data.user.username);
        setCity(p.city || 'Mecca');
        setCountry(p.country || 'Saudi Arabia');
        if (p.latitude !== undefined && p.latitude !== null) setLatitude(p.latitude);
        if (p.longitude !== undefined && p.longitude !== null) setLongitude(p.longitude);
        setTimezoneStr(p.timezone || 'UTC');
        setCalcMethod(p.calculation_method || 'MWL');
        setAsrMethod(p.asr_method || 'Standard');
        if (p.manual_adjustments) {
          setManualAdj(p.manual_adjustments);
          setSavedManualAdj(p.manual_adjustments);
        }
        if (p.hijri_adjustment !== undefined && p.hijri_adjustment !== null) setHijriAdjustment(p.hijri_adjustment);
        setSoundEnabled(p.sound_enabled ?? true);
        setPrayerNotifs(p.prayer_notifications ?? true);
        setHabitNotifs(p.habit_notifications ?? true);
        setTaskNotifs(p.task_notifications ?? true);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    };
    fetchSettings();
  }, []);

  const handleGPSDetect = async () => {
    try {
      const res = await detectLocationGPS();
      if (res.city) setCity(res.city);
      if (res.country) setCountry(res.country);
      if (res.latitude !== undefined) setLatitude(res.latitude);
      if (res.longitude !== undefined) setLongitude(res.longitude);
      if (res.timezone) setTimezoneStr(res.timezone);
      showToast('GPS Synced', `Location coordinates detected: ${res.latitude}°, ${res.longitude}°`);
    } catch (err) {
      showToast('GPS Error', err.message || 'Could not fetch GPS position.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.updateSettings({
        display_name: displayName,
        city,
        country,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timezone: timezoneStr,
        calculation_method: calcMethod,
        asr_method: asrMethod,
        manual_adjustments: manualAdj,
        hijri_adjustment: parseInt(hijriAdjustment, 10) || 0,
        sound_enabled: soundEnabled,
        prayer_notifications: prayerNotifs,
        habit_notifications: habitNotifs,
        task_notifications: taskNotifs,
        theme,
      });
      setSavedManualAdj(manualAdj);
      await refreshProfile();
      if (refreshPrayers) await refreshPrayers();
      showToast('Settings Saved', 'Your preferences, location, and prayer adjustments have been updated.');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('Error', 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };



  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await authApi.exportData();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `islamic_habits_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Data Exported', 'Downloaded complete timestamped activity backup.');
    } catch (e) {
      console.error('Export failed:', e);
      showToast('Export Error', 'Failed to export data.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("WARNING: This will clear your activity records and restore default Islamic habit templates. Proceed?")) return;
    try {
      await authApi.resetData();
      showToast('Data Reset', 'Template habits and awrad restored.');
      window.location.reload();
    } catch (e) {
      console.error('Reset failed:', e);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Signed Out', 'You have been safely signed out.');
    navigate('/login');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-islamic-primary-600" />
          Application Settings & Preferences
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure prayer calculation methods, local coordinates, notifications, and data exports
        </p>
      </div>

      {/* Account Session & Sign Out Card */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#1eb4eb]/20 bg-[#1eb4eb]/5">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#088ac1] to-[#3dc3f3] text-white flex items-center justify-center font-bold text-lg shadow-picton-glow shrink-0">
            {(user?.first_name || profile?.display_name || user?.username || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {user?.first_name || profile?.display_name || user?.username || 'Active User'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                Authenticated
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              @{user?.username || 'user'} {user?.email ? `• ${user.email}` : ''}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out / Switch Account</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Profile & Location */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-islamic-border-light/60 dark:border-islamic-border-dark/60">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-islamic-primary-600" />
              Profile & Location (Prayer Precision)
            </h3>

            {/* Live GPS Auto-Detect Button */}
            <button
              type="button"
              onClick={handleGPSDetect}
              disabled={isDetectingLocation}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#088ac1] hover:bg-[#076e9d] text-white text-xs font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isDetectingLocation ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Detecting GPS...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  <span>📍 Detect My Live GPS Location</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                City Name (Auto-Geocoded)
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. London, Makkah, Cairo, New York"
                className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Timezone (IANA Name)
              </label>
              <input
                type="text"
                value={timezoneStr}
                onChange={(e) => setTimezoneStr(e.target.value)}
                placeholder="e.g. Europe/London, Asia/Riyadh, America/New_York"
                className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Latitude (° Decimal)
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 51.5074"
                className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Longitude (° Decimal)
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. -0.1278"
                className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500 font-mono"
              />
            </div>
          </div>
        </div>


        {/* 2. Prayer Time Calculations & Minute Adjustments */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-islamic-border-light/60 dark:border-islamic-border-dark/60">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-500" />
                Prayer Time Calculation & Adjustments
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Align prayer schedules with your local mosque timetable and astronomical calculations
              </p>
            </div>

            {/* Current Time Badge */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm self-start sm:self-auto">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  Live Current Time
                </div>
                <div className="text-sm font-black font-mono tracking-tight text-white">
                  {formattedCurrentTime}
                </div>
              </div>
            </div>
          </div>

          {/* Authority & Madhhab Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Calculation Authority
              </label>
              <select
                value={calcMethod}
                onChange={(e) => setCalcMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
              >
                <option value="MWL">Muslim World League (Europe, Far East)</option>
                <option value="ISNA">Islamic Society of North America (ISNA)</option>
                <option value="Makkah">Umm Al-Qura University, Makkah</option>
                <option value="Egypt">Egyptian General Authority of Survey</option>
                <option value="Karachi">University of Islamic Sciences, Karachi</option>
                <option value="Tehran">Institute of Geophysics, University of Tehran</option>
                <option value="Jafari">Shia Ithna-Ashari, Leva Institute, Qum</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Asr Jurisprudence (Madhhab)
              </label>
              <select
                value={asrMethod}
                onChange={(e) => setAsrMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
              >
                <option value="Standard">Standard (Shafi, Maliki, Hanbali)</option>
                <option value="Hanafi">Hanafi</option>
              </select>
            </div>
          </div>

          {/* Manual Minute Adjustments Section with Live Clock & Prayer Cards */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Manual Minute Adjustments (+/- Minutes)
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Real-time preview of adjusted Adhan times based on your offsets
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setManualAdj({ fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 })
                }
                className="text-xs font-bold text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors self-start sm:self-auto"
                title="Reset all minute offsets to 0"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All to 0
              </button>
            </div>

            {/* 6 Interactive Prayer Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {[
                { key: 'fajr', label: 'Fajr', ar: 'الفجر', icon: '🌅' },
                { key: 'sunrise', label: 'Sunrise', ar: 'الشروق', icon: '☀️' },
                { key: 'dhuhr', label: 'Dhuhr', ar: 'الظهر', icon: '🌞' },
                { key: 'asr', label: 'Asr', ar: 'العصر', icon: '🌤️' },
                { key: 'maghrib', label: 'Maghrib', ar: 'المغرب', icon: '🌇' },
                { key: 'isha', label: 'Isha', ar: 'العشاء', icon: '🌙' },
              ].map(({ key, label, ar, icon }) => {
                const baseTimetableVal = timetable?.[label] || (label === 'Sunrise' ? timetable?.Sunrise : null);
                const currentVal = manualAdj[key] || 0;
                const savedVal = savedManualAdj[key] || 0;
                const adjustedDisplay = getAdjustedPrayerTime(baseTimetableVal, savedVal, currentVal);
                const baseDisplay = getBasePrayerTime(baseTimetableVal, savedVal);

                return (
                  <div
                    key={key}
                    className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-islamic-card-dark border border-islamic-border-light dark:border-islamic-border-dark shadow-sm hover:border-islamic-primary-500/50 transition-all flex flex-col justify-between"
                  >
                    {/* Top Info */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{icon}</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{label}</span>
                      </div>
                      <span className="text-[10px] font-arabic text-slate-400 dark:text-slate-500 font-semibold">{ar}</span>
                    </div>

                    {/* Adjusted Time Highlight */}
                    <div className="my-1 text-center bg-slate-50 dark:bg-slate-900/70 rounded-xl py-1.5 px-1 border border-slate-100 dark:border-slate-800">
                      <div className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                        {adjustedDisplay}
                      </div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                        Base: <span className="font-semibold text-slate-600 dark:text-slate-400">{baseDisplay}</span>
                      </div>
                    </div>

                    {/* Stepper Controls */}
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400">
                        <span>Offset</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full font-mono text-[9px] font-bold ${
                            currentVal > 0
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : currentVal < 0
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {currentVal > 0 ? `+${currentVal}m` : currentVal < 0 ? `${currentVal}m` : '0m'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setManualAdj((prev) => ({ ...prev, [key]: (prev[key] || 0) - 1 }))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center transition-colors active:scale-95"
                          title="Decrease 1 min"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <input
                          type="number"
                          value={manualAdj[key] ?? 0}
                          onChange={(e) =>
                            setManualAdj((prev) => ({
                              ...prev,
                              [key]: parseInt(e.target.value, 10) || 0,
                            }))
                          }
                          className="w-full min-w-0 text-center py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-islamic-card-dark text-xs font-bold text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-islamic-primary-500"
                        />

                        <button
                          type="button"
                          onClick={() => setManualAdj((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center transition-colors active:scale-95"
                          title="Increase 1 min"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Islamic Hijri Calendar Adjustment */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-islamic-border-light/60 dark:border-islamic-border-dark/60">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-islamic-primary-600" />
                Islamic Hijri Calendar Adjustment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Align the lunar Hijri date with your local moon-sighting committee (+/- 2 Days)
              </p>
            </div>

            {/* Live Hijri Date Preview Badge */}
            {(() => {
              const preview = getHijriDate(new Date(), hijriAdjustment);
              return (
                <div className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-islamic-primary-900 to-slate-900 text-white border border-islamic-primary-700/50 shadow-soft text-right">
                  <div className="text-[10px] uppercase font-bold text-islamic-gold-300 tracking-wider">
                    Live Hijri Preview
                  </div>
                  <div className="text-sm font-bold text-[#3dc3f3]">
                    {preview.formatted}
                  </div>
                  <div className="text-xs font-arabic text-slate-300 font-semibold">
                    {preview.formattedAr}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Quick Segment Selector & Stepper */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Day Offset:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { offset: -2, label: '-2 Days' },
                { offset: -1, label: '-1 Day' },
                { offset: 0, label: '0 (Default)' },
                { offset: 1, label: '+1 Day' },
                { offset: 2, label: '+2 Days' },
              ].map((item) => {
                const isSelected = Number(hijriAdjustment) === item.offset;
                return (
                  <button
                    key={item.offset}
                    type="button"
                    onClick={() => setHijriAdjustment(item.offset)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-islamic-primary-600 text-white ring-2 ring-islamic-primary-400 shadow-md scale-[1.02]'
                        : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      {item.offset === 0 ? 'Astronomical' : item.offset > 0 ? `+${item.offset}d` : `${item.offset}d`}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-islamic-subtle-light/40 dark:bg-islamic-subtle-dark/40 border border-slate-200/80 dark:border-slate-800/80 text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                Fine-tune manual offset:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHijriAdjustment((prev) => Math.max(-2, Number(prev) - 1))}
                  disabled={hijriAdjustment <= -2}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                  title="Subtract 1 day"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-sm text-islamic-primary-700 dark:text-islamic-primary-300">
                  {hijriAdjustment > 0 ? `+${hijriAdjustment}` : hijriAdjustment} d
                </span>
                <button
                  type="button"
                  onClick={() => setHijriAdjustment((prev) => Math.min(2, Number(prev) + 1))}
                  disabled={hijriAdjustment >= 2}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                  title="Add 1 day"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Appearance & Sound */}

        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-islamic-border-light/60 dark:border-islamic-border-dark/60">
            <Moon className="w-5 h-5 text-indigo-500" />
            Appearance & Audio Feedback
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {[
              { id: 'light', label: 'Light Mode', icon: Sun },
              { id: 'dark', label: 'Dark Mode', icon: Moon },
              { id: 'system', label: 'System Default', icon: Settings },
            ].map((thm) => {
              const Icon = thm.icon;
              return (
                <button
                  type="button"
                  key={thm.id}
                  onClick={() => setTheme(thm.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    theme === thm.id
                      ? 'border-islamic-primary-500 bg-islamic-primary-50/80 dark:bg-islamic-primary-950/40 ring-2 ring-islamic-primary-500 font-bold'
                      : 'border-islamic-border-light dark:border-islamic-border-dark hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5 text-islamic-primary-600 shrink-0" />
                  <span className="text-xs">{thm.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 pr-2">
              <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Play acoustic chime on completions & dhikr taps
              </span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 text-islamic-primary-600 rounded focus:ring-islamic-primary-500 shrink-0"
            />
          </div>
        </div>

        {/* 4. Reminders & Push Notifications */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-islamic-border-light/60 dark:border-islamic-border-dark/60">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-500" />
                Reminders & Push Notifications
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enable browser-level alerts for Adhan and spiritual habit check-ins
              </p>
            </div>

            {/* Notification Status Pill */}
            {notificationPermission === 'granted' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                System Alerts Active
              </span>
            )}
            {notificationPermission === 'default' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Permission Needed
              </span>
            )}
            {notificationPermission === 'denied' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Blocked in Browser
              </span>
            )}
          </div>

          {/* Enable Notifications Action Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-islamic-subtle-light/70 to-slate-50/80 dark:from-islamic-subtle-dark/50 dark:to-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#088ac1] dark:text-[#3dc3f3]" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                  Device Notification Permissions
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                {notificationPermission === 'granted'
                  ? 'Browser notifications are authorized. You will receive prompt audio and visual alerts for upcoming prayers and adhkar.'
                  : notificationPermission === 'denied'
                  ? 'Notifications are blocked in your browser preferences. Please click the site icon in your address bar to set Notifications to "Allow".'
                  : 'Grant notification permission so that daily Adhan, prayer times, and adhkar notifications can be scheduled even when the browser is in the background.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {notificationPermission === 'granted' ? (
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <BellRing className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Send Test Alert</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  disabled={notificationPermission === 'unsupported'}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#088ac1] to-[#1eb4eb] hover:from-[#076e9d] hover:to-[#088ac1] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-sky-500/20 active:scale-95 disabled:opacity-50"
                >
                  <BellRing className="w-4 h-4" />
                  <span>Enable Notifications</span>
                </button>
              )}
            </div>
          </div>

          {/* Granular Toggles */}
          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Prayer time Adhan notifications
              </span>
              <input
                type="checkbox"
                checked={prayerNotifs}
                onChange={(e) => setPrayerNotifs(e.target.checked)}
                className="w-4 h-4 text-islamic-primary-600 rounded focus:ring-islamic-primary-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Morning & Evening Adhkar reminders
              </span>
              <input
                type="checkbox"
                checked={habitNotifs}
                onChange={(e) => setHabitNotifs(e.target.checked)}
                className="w-4 h-4 text-islamic-primary-600 rounded focus:ring-islamic-primary-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Task deadlines & daily reflection alerts
              </span>
              <input
                type="checkbox"
                checked={taskNotifs}
                onChange={(e) => setTaskNotifs(e.target.checked)}
                className="w-4 h-4 text-islamic-primary-600 rounded focus:ring-islamic-primary-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* 5. Install App (PWA) */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-islamic-border-light/60 dark:border-islamic-border-dark/60">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-500" />
                Install يومي App (PWA)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Install as a standalone native app on your phone, tablet, or desktop
              </p>
            </div>

            {isStandalone && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                App Installed
              </span>
            )}
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#f0faff] to-slate-50 dark:from-[#081f2c]/70 dark:to-[#071722]/70 border border-[#bce8fb]/80 dark:border-[#0f4d6b]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#088ac1] dark:text-[#3dc3f3]" />
                {isStandalone
                  ? 'Running in Native Standalone Mode'
                  : 'Fast, Offline-Ready & Distraction-Free'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                {isStandalone
                  ? 'Alhamdulillah! You are using the installed application with local database caching, instant home-screen launching, and offline capability.'
                  : 'Add يومي to your home screen for one-tap access, zero address bar distractions, and offline caching for your Quran recitation & daily Adhkar.'}
              </p>
            </div>

            <div className="shrink-0">
              {isStandalone ? (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Active on Device</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{isIOS ? 'Install on iPhone / iPad' : 'Install App'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <Button type="submit" variant="primary" size="lg" icon={Save} disabled={saving} className="w-full sm:w-auto">
            {saving ? 'Saving Changes...' : 'Save All Preferences'}
          </Button>
        </div>
      </form>

      {/* 5. Data Export & Backup Section */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-islamic-border-light/60 dark:border-islamic-border-dark/60">
          <Download className="w-5 h-5 text-[#088ac1]" />
          Data Backup & Reset
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Export All Personal Tracking Records
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Download complete timestamped history of prayers, habits, awrad, and tasks as JSON
            </p>
          </div>
          <Button
            variant="outline"
            icon={Download}
            onClick={handleExportData}
            disabled={exporting}
            className="w-full sm:w-auto"
          >
            {exporting ? 'Exporting...' : 'Download JSON Backup'}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div>
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
              Reset & Restore Default Habits
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Clear current history and restore initial curated Islamic templates
            </p>
          </div>
          <Button variant="danger" icon={RotateCcw} onClick={handleResetData} className="w-full sm:w-auto">
            Reset Tracker
          </Button>
        </div>
      </div>

      {/* iOS Add to Home Screen Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setShowIOSGuide(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#081a26] border border-slate-200 dark:border-[#0f3b54] rounded-3xl shadow-2xl p-6 animate-slide-up space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                Install on iOS / Safari
              </h4>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#e1f3fd] dark:bg-[#0a354c] text-[#076e9d] dark:text-[#3dc3f3] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tap the <strong className="text-slate-900 dark:text-white">Share button</strong> (square with arrow up) at the bottom toolbar of Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#e1f3fd] dark:bg-[#0a354c] text-[#076e9d] dark:text-[#3dc3f3] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Scroll down the share menu and tap <strong className="text-slate-900 dark:text-white">Add to Home Screen</strong> (+).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#e1f3fd] dark:bg-[#0a354c] text-[#076e9d] dark:text-[#3dc3f3] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Tap <strong className="text-slate-900 dark:text-white">Add</strong> in the top-right corner to finish.
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#088ac1] text-white font-bold text-xs hover:bg-[#076e9d] transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
