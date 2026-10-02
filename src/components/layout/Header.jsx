import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Sparkles, ChevronDown } from 'lucide-react';
import { usePrayers } from '../../context/PrayerContext';
import { useAuth } from '../../context/AuthContext';
import { LocationModal } from '../modals/LocationModal';
import { getHijriDate } from '../../utils/hijri';
import { AppLogo } from '../common/AppLogo';

const parseTimeToDate = (timeStr, baseDate = new Date()) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const cleaned = timeStr.trim();
  const d = new Date(baseDate);

  // Match "12:15 PM", "5:12 AM", "14:30", "05:12"
  const match = cleaned.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] ? match[3].toUpperCase() : null;

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  d.setHours(hours, minutes, 0, 0);
  return d;
};

export const Header = () => {
  const { next_prayer, location, settings, prayers, timetable } = usePrayers();
  const { user, profile } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedGregorian = useMemo(() => {
    return currentTime.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [currentTime]);

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }, [currentTime]);

  const hijri = useMemo(() => {
    const adj = settings?.hijri_adjustment ?? profile?.hijri_adjustment ?? location?.hijri_adjustment ?? 0;
    return getHijriDate(currentTime, adj);
  }, [currentTime, settings, profile, location]);

  // Calculate live timeline progress between current prayer and next prayer
  const timelineData = useMemo(() => {
    try {
      const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const timesMap = {};

      if (timetable && typeof timetable === 'object') {
        for (const key of PRAYER_KEYS) {
          if (timetable[key]) timesMap[key] = timetable[key];
        }
      }

      if (Array.isArray(prayers)) {
        for (const p of prayers) {
          if (!p) continue;
          const name = p.display_name || p.prayer_name;
          if (!name || typeof name !== 'string') continue;
          const cleanName = PRAYER_KEYS.find((k) => k.toLowerCase() === name.toLowerCase());
          if (cleanName && p.scheduled_time) {
            timesMap[cleanName] = p.scheduled_time;
          }
        }
      }

      const todayFajr = parseTimeToDate(timesMap['Fajr'], currentTime);
      const todayDhuhr = parseTimeToDate(timesMap['Dhuhr'], currentTime);
      const todayAsr = parseTimeToDate(timesMap['Asr'], currentTime);
      const todayMaghrib = parseTimeToDate(timesMap['Maghrib'], currentTime);
      const todayIsha = parseTimeToDate(timesMap['Isha'], currentTime);

      if (!todayFajr || !todayDhuhr || !todayAsr || !todayMaghrib || !todayIsha) {
        if (next_prayer?.name && next_prayer?.scheduled_time) {
          return {
            prevName: '',
            prevTime: '',
            nextName: next_prayer.name,
            nextTime: next_prayer.scheduled_time,
            progress: 50,
            remainingFormatted: next_prayer.remaining_formatted || '',
          };
        }
        return null;
      }

      const now = currentTime.getTime();
      let startDt, endDt, prevName, nextName;

      if (now < todayFajr.getTime()) {
        // Night window: yesterday Isha -> today Fajr
        const yesterdayIsha = new Date(todayIsha);
        yesterdayIsha.setDate(yesterdayIsha.getDate() - 1);
        startDt = yesterdayIsha;
        endDt = todayFajr;
        prevName = 'Isha';
        nextName = 'Fajr';
      } else if (now < todayDhuhr.getTime()) {
        startDt = todayFajr;
        endDt = todayDhuhr;
        prevName = 'Fajr';
        nextName = 'Dhuhr';
      } else if (now < todayAsr.getTime()) {
        startDt = todayDhuhr;
        endDt = todayAsr;
        prevName = 'Dhuhr';
        nextName = 'Asr';
      } else if (now < todayMaghrib.getTime()) {
        startDt = todayAsr;
        endDt = todayMaghrib;
        prevName = 'Asr';
        nextName = 'Maghrib';
      } else if (now < todayIsha.getTime()) {
        startDt = todayMaghrib;
        endDt = todayIsha;
        prevName = 'Maghrib';
        nextName = 'Isha';
      } else {
        // Night window: today Isha -> tomorrow Fajr
        const tomorrowFajr = new Date(todayFajr);
        tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
        startDt = todayIsha;
        endDt = tomorrowFajr;
        prevName = 'Isha';
        nextName = 'Fajr';
      }

      const totalDuration = Math.max(1, endDt.getTime() - startDt.getTime());
      const elapsed = Math.max(0, now - startDt.getTime());
      const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

      const remainingMs = Math.max(0, endDt.getTime() - now);
      const totalSec = Math.floor(remainingMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);

      const remainingFormatted = hours > 0
        ? `${hours}h ${minutes}m`
        : `${minutes}m remaining`;

      return {
        prevName,
        prevTime: timesMap[prevName] || '',
        nextName,
        nextTime: timesMap[nextName] || '',
        progress,
        remainingFormatted,
      };
    } catch (e) {
      console.warn('Error computing timelineData in Header:', e);
      return null;
    }
  }, [currentTime, prayers, timetable, next_prayer]);

  const activeNextPrayerName = timelineData?.nextName || next_prayer?.name;
  const activeNextPrayerTime = timelineData?.nextTime || next_prayer?.scheduled_time;
  const activeRemainingFormatted = timelineData?.remainingFormatted || next_prayer?.remaining_formatted;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#06141e]/90 backdrop-blur-2xl border-b border-slate-200/75 dark:border-[#0e3347]/80 transition-colors duration-200 safe-top select-none relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">

          {/* ========================================================
              LEFT SIDE:
              - Mobile (< md): Clean Brand Crest + Arabic Name + Hijri Date
              - Desktop (>= md): Full Gregorian & Hijri Date + Clock
             ======================================================== */}

          {/* Mobile Clean Brand (Adaptive Logo + Title & Hijri Date) */}
          <div className="flex md:hidden items-center min-w-0">
            <Link
              to="/"
              className="flex items-center gap-2 group active:scale-95 transition-transform shrink-0"
              title="Home"
            >
              <AppLogo className="w-8 h-8" />
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-2xl tracking-wide text-slate-900 dark:text-white font-youmi leading-none">
                  يومي
                </span>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 pb-0.5">
                  {hijri.day} {hijri.monthName}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Left: Gregorian Date, Hijri Date Badge, and Live Digital Clock */}
          <div className="hidden md:flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">
                {formattedGregorian}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-islamic-primary-700 dark:text-islamic-primary-300 bg-islamic-primary-50 dark:bg-islamic-primary-950/60 px-2.5 py-1 rounded-xl border border-islamic-primary-200/80 dark:border-islamic-primary-800/60 shadow-2xs">
                <Sparkles className="w-3 h-3 text-islamic-primary-500 shrink-0" />
                <span>{hijri.day} {hijri.monthName} {hijri.year} AH</span>
              </span>
            </div>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100/70 dark:bg-slate-800/50 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* ========================================================
              RIGHT SIDE:
              - Mobile: Spacious Single Prayer Capsule + Theme Switcher
              - Desktop: Location Pill + Next Prayer Capsule + Theme Switcher
             ======================================================== */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* Desktop-Only Location Pill */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer group active:scale-95 shadow-2xs"
              title="Change City or Detect Location"
            >
              <MapPin className="w-3.5 h-3.5 text-islamic-primary-500 group-hover:scale-110 transition-transform shrink-0" />
              <span>{location?.city || 'Mecca'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors shrink-0" />
            </button>

            {/* Next Prayer Dynamic Capsule */}
            {activeNextPrayerName && (
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-islamic-primary-50 dark:bg-islamic-primary-950/60 border border-islamic-primary-200/80 dark:border-islamic-primary-800/80 text-islamic-primary-900 dark:text-islamic-primary-100 shadow-2xs hover:border-islamic-primary-400 dark:hover:border-islamic-primary-600 transition-all cursor-pointer active:scale-95 group"
                title={`Next Prayer: ${activeNextPrayerName} at ${activeNextPrayerTime} ${activeRemainingFormatted ? `(${activeRemainingFormatted})` : ''} • Tap to view timetable`}
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3dc3f3] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#088ac1] dark:bg-[#3dc3f3]" />
                </span>

                <div className="flex items-center gap-1 text-xs leading-none">
                  <span className="font-extrabold text-[#076e9d] dark:text-[#3dc3f3]">
                    {activeNextPrayerName}
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {activeNextPrayerTime}
                  </span>
                  {activeRemainingFormatted && (
                    <span className="hidden sm:inline text-[11px] font-medium text-slate-400">
                      ({activeRemainingFormatted})
                    </span>
                  )}
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Real-Time Live Timeline Progress Bar to Next Prayer */}
        {timelineData && (
          <div
            className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-200/60 dark:bg-[#092231]/80 overflow-hidden cursor-pointer"
            onClick={() => setIsLocationModalOpen(true)}
            title={`Prayer Timeline: ${timelineData.prevName} (${timelineData.prevTime}) → ${timelineData.nextName} (${timelineData.nextTime}) • ${Math.round(timelineData.progress)}% elapsed (${timelineData.remainingFormatted} remaining) - Click to view timetable`}
          >
            <div
              className="h-full bg-gradient-to-r from-[#088ac1] via-[#1eb4eb] to-[#3dc3f3] transition-all duration-1000 ease-linear relative"
              style={{ width: `${timelineData.progress}%` }}
            >
              {/* Luminous Glowing Leading Tip */}
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_2px_#3dc3f3] opacity-95" />
            </div>
          </div>
        )}
      </header>

      {/* Location & Prayer Settings Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
};


