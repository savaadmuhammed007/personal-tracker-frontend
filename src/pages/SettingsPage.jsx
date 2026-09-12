import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Compass,
  Bell,
  Moon,
  Sun,
  Download,
  RotateCcw,
  Save,
  CheckCircle2,
  Volume2,
  Navigation,
  Loader2,
  MapPin,
  Calendar,
  Sparkles,
  Plus,
  Minus,
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
  const { user, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useNotification();
  const { detectLocationGPS, isDetectingLocation, refreshPrayers } = usePrayers();

  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('Mecca');
  const [country, setCountry] = useState('Saudi Arabia');
  const [latitude, setLatitude] = useState(21.4225);
  const [longitude, setLongitude] = useState(39.8262);
  const [timezoneStr, setTimezoneStr] = useState('UTC');
  const [calcMethod, setCalcMethod] = useState('MWL');
  const [asrMethod, setAsrMethod] = useState('Standard');
  const [manualAdj, setManualAdj] = useState({ fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 });
  const [hijriAdjustment, setHijriAdjustment] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prayerNotifs, setPrayerNotifs] = useState(true);
  const [habitNotifs, setHabitNotifs] = useState(true);
  const [taskNotifs, setTaskNotifs] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

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
        if (p.manual_adjustments) setManualAdj(p.manual_adjustments);
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
      await refreshProfile();
      if (refreshPrayers) await refreshPrayers();
      showToast('Settings Saved', 'Your preferences, location, and Hijri date adjustment have been updated.');
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


        {/* 2. Prayer Time Calculations */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-islamic-border-light/60 dark:border-islamic-border-dark/60">
            <Compass className="w-5 h-5 text-amber-500" />
            Prayer Calculation Method & School
          </h3>

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

          {/* Manual Minute Adjustments */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Manual Minute Adjustments (+/- Minutes)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map((p) => (
                <div key={p} className="text-center p-2 rounded-xl bg-islamic-subtle-light/40 dark:bg-islamic-subtle-dark/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    {p}
                  </span>
                  <input
                    type="number"
                    value={manualAdj[p] || 0}
                    onChange={(e) =>
                      setManualAdj((prev) => ({
                        ...prev,
                        [p]: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full text-center px-1.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-islamic-card-dark text-xs font-bold"
                  />
                </div>
              ))}
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

        {/* 4. Notifications */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-islamic-border-light/60 dark:border-islamic-border-dark/60">
            <Bell className="w-5 h-5 text-rose-500" />
            Reminders & Push Notifications
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Prayer time Adhan notifications
              </span>
              <input
                type="checkbox"
                checked={prayerNotifs}
                onChange={(e) => setPrayerNotifs(e.target.checked)}
                className="w-4 h-4 text-islamic-primary-600 rounded focus:ring-islamic-primary-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Morning & Evening Adhkar reminders
              </span>
              <input
                type="checkbox"
                checked={habitNotifs}
                onChange={(e) => setHabitNotifs(e.target.checked)}
                className="w-4 h-4 text-islamic-primary-600 rounded focus:ring-islamic-primary-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Task deadlines & daily reflection alerts
              </span>
              <input
                type="checkbox"
                checked={taskNotifs}
                onChange={(e) => setTaskNotifs(e.target.checked)}
                className="w-4 h-4 text-islamic-primary-600 rounded focus:ring-islamic-primary-500"
              />
            </label>
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
    </div>
  );
};
