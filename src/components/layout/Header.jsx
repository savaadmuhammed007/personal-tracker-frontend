import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Moon, Sun, Settings, MapPin } from 'lucide-react';
import { usePrayers } from '../../context/PrayerContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { LocationModal } from '../modals/LocationModal';

export const Header = () => {
  const { next_prayer, location } = usePrayers();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedGregorian = currentTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-islamic-card-dark/90 backdrop-blur-md border-b border-islamic-border-light/60 dark:border-islamic-border-dark/60 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 transition-colors duration-200 safe-top">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Date, Live Time, and Clickable Location Pill */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                  {formattedGregorian}
                </span>
                <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
                
                {/* Clickable Location Pill */}
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-islamic-primary-50 dark:bg-islamic-primary-950/60 hover:bg-islamic-primary-100 dark:hover:bg-islamic-primary-900/60 border border-islamic-primary-200/80 dark:border-islamic-primary-800/80 text-[11px] sm:text-xs font-semibold text-islamic-primary-700 dark:text-islamic-primary-300 transition-all cursor-pointer group truncate"
                  title="Click to change location or detect GPS coordinates"
                >
                  <MapPin className="w-3 h-3 text-islamic-primary-500 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="truncate">{location?.city || 'Mecca'}</span>
                </button>
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" />
                <span>{formattedTime}</span>
              </div>
            </div>
          </div>

          {/* Center/Right: Next Prayer Pill & Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {next_prayer?.name && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-islamic-primary-50 dark:bg-islamic-primary-950/60 border border-islamic-primary-200 dark:border-islamic-primary-800/60 text-islamic-primary-800 dark:text-islamic-primary-200 shadow-sm">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-islamic-primary-500 animate-pulse" />
                <div className="text-[11px] sm:text-xs">
                  <span className="font-bold">{next_prayer.name}</span>{' '}
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {next_prayer.scheduled_time}
                  </span>{' '}
                  <span className="hidden md:inline text-slate-400 dark:text-slate-500 font-normal">
                    ({next_prayer.remaining_formatted})
                  </span>
                </div>
              </div>
            )}

            {/* Quick Settings Link on mobile */}
            <Link
              to="/settings"
              className="md:hidden p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-islamic-subtle-light dark:hover:bg-islamic-subtle-dark transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="md:hidden p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-islamic-subtle-light dark:hover:bg-islamic-subtle-dark transition-colors"
              title="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
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

