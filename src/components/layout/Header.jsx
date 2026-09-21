import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Moon, Sun, MapPin } from 'lucide-react';
import { usePrayers } from '../../context/PrayerContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { LocationModal } from '../modals/LocationModal';
import { getHijriDate } from '../../utils/hijri';

export const Header = () => {
  const { next_prayer, location, settings } = usePrayers();
  const { theme, toggleTheme } = useTheme();
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
    const adj = settings?.hijri_adjustment || profile?.hijri_adjustment || 0;
    return getHijriDate(currentTime, adj);
  }, [currentTime, settings, profile]);

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/92 dark:bg-[#071722]/92 backdrop-blur-xl border-b border-slate-200/70 dark:border-[#0e3347]/70 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 transition-colors duration-200 safe-top select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">

          {/* ========================================================
              LEFT SIDE:
              - Mobile (< md): Brand Identity + Quick Location Button
              - Desktop (>= md): Gregorian & Hijri Dates + Live Clock
             ======================================================== */}

          {/* Mobile View: Brand + Location Pill */}
          <div className="flex md:hidden items-center gap-2 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-1.5 shrink-0 group active:scale-95 transition-transform"
              title="Go to Home"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#088ac1] to-[#3dc3f3] text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:opacity-95">
                ☪
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                يومي
              </span>
            </Link>

            <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>

            {/* Clickable Mobile Location Pill */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-islamic-primary-50 dark:bg-islamic-primary-950/60 hover:bg-islamic-primary-100 dark:hover:bg-islamic-primary-900/60 border border-islamic-primary-200/80 dark:border-islamic-primary-800/80 text-[11px] font-semibold text-islamic-primary-700 dark:text-islamic-primary-300 transition-all cursor-pointer group max-w-[110px] active:scale-95 shrink-0"
              title="Click to change location or detect GPS coordinates"
            >
              <MapPin className="w-3 h-3 text-islamic-primary-500 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">{location?.city || 'Mecca'}</span>
            </button>
          </div>

          {/* Desktop View: Gregorian Date, Hijri Date, and Live Time */}
          <div className="hidden md:flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                {formattedGregorian}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-semibold text-islamic-primary-700 dark:text-islamic-primary-300 bg-islamic-primary-50 dark:bg-islamic-primary-950/60 px-2 py-0.5 rounded-lg border border-islamic-primary-200/70 dark:border-islamic-primary-800/60">
                {hijri.day} {hijri.monthName} {hijri.year} AH
              </span>
            </div>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* ========================================================
              RIGHT SIDE:
              - Desktop: Location Pill
              - All screens: Next Prayer Countdown Badge + Theme Toggle
             ======================================================== */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Desktop Location Pill */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all cursor-pointer group"
              title="Change City or Detect Location"
            >
              <MapPin className="w-3.5 h-3.5 text-islamic-primary-500 group-hover:scale-110 transition-transform shrink-0" />
              <span>{location?.city || 'Mecca'}</span>
            </button>

            {/* Next Prayer Pill (Compact on mobile, full on desktop) */}
            {next_prayer?.name && (
              <div
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-islamic-primary-50/90 dark:bg-islamic-primary-950/70 border border-islamic-primary-200/80 dark:border-islamic-primary-800/60 text-islamic-primary-800 dark:text-islamic-primary-200 shadow-xs cursor-pointer hover:border-islamic-primary-300 dark:hover:border-islamic-primary-700 transition-all active:scale-95"
                title={`Next Prayer: ${next_prayer.name} at ${next_prayer.scheduled_time} (${next_prayer.remaining_formatted || ''})`}
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#1eb4eb] animate-pulse shrink-0" />
                <div className="text-[11px] sm:text-xs leading-none">
                  <span className="font-bold">{next_prayer.name}</span>{' '}
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {next_prayer.scheduled_time}
                  </span>{' '}
                  {next_prayer.remaining_formatted && (
                    <span className="hidden sm:inline text-slate-400 dark:text-slate-400 font-normal">
                      ({next_prayer.remaining_formatted})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Theme Toggle Button (Light/Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer active:scale-90"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
};
