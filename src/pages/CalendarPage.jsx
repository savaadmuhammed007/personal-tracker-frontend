import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Sun,
  Repeat,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { calendarApi } from '../api/calendarApi';
import { ProgressRing } from '../components/common/ProgressRing';
import { useDayWatch } from '../context/DayWatchContext';
import { getLocalDateString, getDailyCache, setDailyCache } from '../utils/dateUtils';

const CACHE_CALENDAR_MONTH_PREFIX = 'cached_calendar_month_';
const CACHE_CALENDAR_DAY_PREFIX = 'cached_calendar_day_';

export const CalendarPage = () => {
  const { todayDate, revision } = useDayWatch();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());

  const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const [monthData, setMonthData] = useState(() => getDailyCache(`${CACHE_CALENDAR_MONTH_PREFIX}${monthKey}`, null));
  const [dayDetails, setDayDetails] = useState(() => getDailyCache(`${CACHE_CALENDAR_DAY_PREFIX}${getLocalDateString()}`, null));
  const [loadingMonth, setLoadingMonth] = useState(() => !getDailyCache(`${CACHE_CALENDAR_MONTH_PREFIX}${monthKey}`, null));
  const [loadingDay, setLoadingDay] = useState(false);

  const fetchMonthData = useCallback(async () => {
    const mKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const cached = getDailyCache(`${CACHE_CALENDAR_MONTH_PREFIX}${mKey}`, null);
    if (cached) {
      setMonthData(cached);
      setLoadingMonth(false);
    } else {
      setLoadingMonth(true);
    }
    try {
      const res = await calendarApi.getMonth(currentYear, currentMonth);
      setMonthData(res.data);
      setDailyCache(`${CACHE_CALENDAR_MONTH_PREFIX}${mKey}`, res.data);
    } catch (e) {
      console.error('Failed to load month calendar:', e);
    } finally {
      setLoadingMonth(false);
    }
  }, [currentYear, currentMonth]);

  const fetchDayDetails = useCallback(async (dateStr) => {
    const cached = getDailyCache(`${CACHE_CALENDAR_DAY_PREFIX}${dateStr}`, null);
    if (cached) {
      setDayDetails(cached);
      setLoadingDay(false);
    } else {
      setLoadingDay(true);
    }
    try {
      const res = await calendarApi.getDayDetails(dateStr);
      setDayDetails(res.data);
      setDailyCache(`${CACHE_CALENDAR_DAY_PREFIX}${dateStr}`, res.data);
    } catch (e) {
      console.error('Failed to load day details:', e);
    } finally {
      setLoadingDay(false);
    }
  }, []);

  const formatGridTime = (row) => {
    if (row.exact_timestamp) {
      try {
        const dt = new Date(row.exact_timestamp);
        if (!isNaN(dt.getTime())) {
          return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      } catch (e) {}
    }
    return row.time || '—';
  };

  useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData, todayDate, revision]);

  useEffect(() => {
    if (selectedDate) {
      fetchDayDetails(selectedDate);
    }
  }, [selectedDate, fetchDayDetails, todayDate, revision]);

  // When day changes, if selected date was the previous day, update to today's date
  useEffect(() => {
    const handleDayChanged = (e) => {
      const newD = e.detail?.newDate || getLocalDateString();
      setSelectedDate(newD);
    };

    window.addEventListener('app:day-changed', handleDayChanged);
    return () => {
      window.removeEventListener('app:day-changed', handleDayChanged);
    };
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Calculate start day of week offset for calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  // In JS getDay(): 0 is Sunday. Convert to Monday=0: (day + 6) % 7
  const startOffset = (firstDayOfMonth + 6) % 7;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-islamic-primary-600 shrink-0" />
            <span>Islamic Activity Calendar & Time Grid</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Historical day-by-day retrospective and detailed timestamped activity records
          </p>
        </div>

        {/* Month Switcher Controls */}
        <div className="flex items-center justify-between sm:justify-start gap-2 bg-white dark:bg-islamic-card-dark p-1.5 rounded-2xl border border-islamic-border-light dark:border-islamic-border-dark shadow-sm w-full sm:w-auto">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-xs sm:text-sm px-2 text-slate-900 dark:text-white min-w-[120px] text-center">
            {monthData?.month_name || ''} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monthly Calendar Matrix Grid */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-soft">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3 text-center">
          {dayNames.map((d) => (
            <div
              key={d}
              className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty offset cells */}
          {Array.from({ length: startOffset }).map((_, idx) => (
            <div key={`offset-${idx}`} className="min-h-[64px] sm:min-h-[88px] rounded-xl sm:rounded-2xl bg-transparent" />
          ))}

          {/* Days */}
          {(monthData?.days || []).map((dayObj) => {
            const isSelected = selectedDate === dayObj.date;
            const pct = dayObj.completion_percentage;

            return (
              <button
                key={dayObj.date}
                onClick={() => setSelectedDate(dayObj.date)}
                className={`relative min-h-[64px] sm:min-h-[88px] h-full rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 transition-all duration-200 flex flex-col justify-between text-left border overflow-hidden select-none active:scale-[0.97] cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-[#1eb4eb] bg-[#e1f3fd]/90 dark:bg-[#0c4059]/60 border-[#81d7f8] dark:border-[#1eb4eb]/80 shadow-md z-10'
                    : dayObj.is_today
                    ? 'bg-white dark:bg-[#0b1822] border-[#81d7f8] dark:border-[#088ac1] shadow-xs'
                    : 'bg-white/70 dark:bg-[#0b1822]/60 hover:bg-white dark:hover:bg-[#0b1822] border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between w-full min-w-0">
                  <span
                    className={`text-[10px] sm:text-xs font-bold leading-none ${
                      dayObj.is_today
                        ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#088ac1] text-white flex items-center justify-center shrink-0'
                        : isSelected
                        ? 'text-[#076e9d] dark:text-[#3dc3f3] font-extrabold'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {dayObj.day}
                  </span>

                  {pct > 0 && (
                    <span className="text-[8px] sm:text-[10px] font-extrabold text-[#088ac1] dark:text-[#3dc3f3] truncate shrink-0">
                      {pct}%
                    </span>
                  )}
                </div>

                {/* Mini activity indicator dots / progress bar */}
                <div className="w-full mt-auto pt-1">
                  {pct > 0 ? (
                    <div className="w-full h-1 sm:h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#088ac1] to-[#3dc3f3] rounded-full transition-all"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  ) : dayObj.is_future ? (
                    <span className="text-[8px] sm:text-[9px] text-slate-300 dark:text-slate-600 truncate block font-medium">
                      <span className="hidden xs:inline">Upcoming</span>
                      <span className="xs:hidden">•</span>
                    </span>
                  ) : (
                    <span className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 truncate block font-medium">
                      <span className="hidden xs:inline">Rest</span>
                      <span className="xs:hidden">—</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Timestamped Time Grid Section */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e1f3fd] dark:bg-[#0c4059]/60 border border-[#bce8fb] dark:border-[#1eb4eb]/30 text-xs font-bold text-[#076e9d] dark:text-[#3dc3f3] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{dayDetails?.hijri?.formatted || ''}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Activity Time Grid — {selectedDate}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Exact timestamped database record of all prayers, habits, and tasks
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Completion</span>
              <p className="text-base sm:text-lg font-extrabold text-[#088ac1] dark:text-[#3dc3f3]">
                {dayDetails?.completed_activities || 0} / {dayDetails?.total_activities || 0} Done
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Time Grid Content */}
        <div className="mt-4 sm:mt-6">
          {loadingDay ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading daily time grid...</div>
          ) : !dayDetails || !Array.isArray(dayDetails.time_grid) || dayDetails.time_grid.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              No activity records logged for {selectedDate}.
            </div>
          ) : (
            <>
              {/* Mobile View: Clean Aligned Cards (<640px) */}
              <div className="sm:hidden space-y-2.5">
                {(dayDetails.time_grid || []).map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {row.activity}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#088ac1] dark:text-[#3dc3f3] px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                        {formatGridTime(row)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {row.category}
                      </span>

                      <div>
                        {row.is_completed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#076e9d] dark:text-[#81d7f8] px-2 py-0.5 rounded-full bg-[#bce8fb]/50 dark:bg-[#0f4d6b]/50 border border-[#81d7f8]/30">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : row.status === 'missed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60">
                            <XCircle className="w-3 h-3" /> Missed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {(row.details || row.notes) && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5 truncate">
                        {row.details || row.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop View: Full Grid Table (>=640px) */}
              <div className="hidden sm:block overflow-x-auto scrollbar-none">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800/80 text-[11px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-3 sm:px-4">Exact Time</th>
                      <th className="py-3 px-3 sm:px-4">Activity</th>
                      <th className="py-3 px-3 sm:px-4">Category</th>
                      <th className="py-3 px-3 sm:px-4">Status</th>
                      <th className="py-3 px-3 sm:px-4">Details / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {(dayDetails.time_grid || []).map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 px-3 sm:px-4 font-mono font-bold text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {formatGridTime(row)}
                        </td>
                        <td className="py-3 px-3 sm:px-4 font-bold text-slate-900 dark:text-white">
                          {row.activity}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {row.category}
                        </td>
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          {row.is_completed ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#076e9d] dark:text-[#81d7f8] px-2.5 py-0.5 rounded-full bg-[#bce8fb]/50 dark:bg-[#0f4d6b]/50 border border-[#81d7f8]/30">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </span>
                          ) : row.status === 'missed' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60">
                              <XCircle className="w-3.5 h-3.5" /> Missed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {row.details || row.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
