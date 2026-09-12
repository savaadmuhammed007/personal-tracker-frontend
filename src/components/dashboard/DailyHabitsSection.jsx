import React, { useState } from 'react';
import { Check, Flame, BookOpen, Clock, Plus, Sparkles, Loader2 } from 'lucide-react';
import { habitApi } from '../../api/habitApi';
import { useNotification } from '../../context/NotificationContext';
import { getLocalDateString } from '../../utils/dateUtils';

export const DailyHabitsSection = ({ habitsList, onHabitUpdated, onToggleHabit, onOpenQuranModal, onOpenAddModal }) => {
  const { showToast } = useNotification();
  const [pendingHabitIds, setPendingHabitIds] = useState(new Set());
  const safeHabits = Array.isArray(habitsList) ? habitsList : [];
  const nonQuranHabits = safeHabits.filter((h) => h.category !== 'quran');

  // Convert JS Sunday(0)..Saturday(6) to 0=Mon..6=Sun
  const todayPyWeekday = (new Date().getDay() + 6) % 7;

  const isHabitScheduledForToday = (h) => {
    if (h.is_scheduled_today !== undefined && h.is_scheduled_today !== null) {
      return h.is_scheduled_today;
    }
    const freq = h.frequency;
    const spec = Array.isArray(h.specific_days) ? h.specific_days : [];
    if (freq === 'daily') return true;
    if (freq === 'weekdays') return todayPyWeekday < 5;
    if (freq === 'weekly_once' || freq === 'weekly_target' || freq === 'specific_days') {
      if (spec.length > 0) return spec.includes(todayPyWeekday);
      return todayPyWeekday === 4; // default Friday
    }
    return true;
  };

  const todayHabits = nonQuranHabits.filter(
    (h) => isHabitScheduledForToday(h) || Boolean(h.today_completion)
  );

  const handleToggle = async (habit) => {
    if (pendingHabitIds.has(habit.id)) return;
    setPendingHabitIds((prev) => new Set(prev).add(habit.id));

    const wasDone = Boolean(habit.today_completion);
    if (!wasDone) {
      showToast('Habit Completed', `✓ ${habit.name} logged successfully!`);
    }

    try {
      if (onToggleHabit) {
        await onToggleHabit(habit);
      } else {
        const localDate = getLocalDateString();
        const res = await habitApi.toggleHabit(habit.id, {
          date: localDate,
          is_completed: !wasDone,
          action: !wasDone ? 'complete' : 'incomplete',
        });
        if (onHabitUpdated) onHabitUpdated();
      }
    } catch (e) {
      console.error('Failed to toggle habit:', e);
    } finally {
      setPendingHabitIds((prev) => {
        const next = new Set(prev);
        next.delete(habit.id);
        return next;
      });
    }
  };

  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Daily Islamic Habits & Routines
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active habits scheduled for today ({todayHabits.length} routines)
          </p>
        </div>
        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#088ac1] dark:text-[#3dc3f3] hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Habit
          </button>
        )}
      </div>

      {todayHabits.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            No habits scheduled for today.
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Weekly habits appear automatically on their assigned day (e.g. Jumu'ah on Fridays).
          </p>
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#088ac1] text-white hover:bg-[#1eb4eb] transition-colors"
            >
              + Create Daily Habit
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {todayHabits.map((habit) => {
            const isDone = Boolean(habit.today_completion);
            const isQuran = habit.category === 'quran';

            let scheduleText = 'Every Day';
            if (habit.frequency === 'weekdays') scheduleText = 'Weekdays';
            else if (habit.frequency === 'weekly_once' || habit.frequency === 'weekly_target') {
              const dayIdx = habit.specific_days?.[0] !== undefined ? habit.specific_days[0] : 4;
              scheduleText = `Every ${DAY_NAMES[dayIdx] || 'Fri'}`;
            } else if (habit.frequency === 'specific_days' && habit.specific_days?.length > 0) {
              scheduleText = habit.specific_days.map((d) => DAY_NAMES[d]).join(', ');
            }

          let compTime = null;
          if (habit.today_completion?.completed_at) {
            try {
              const dt = new Date(habit.today_completion.completed_at);
              compTime = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
              compTime = null;
            }
          }

          return (
            <div
              key={habit.id}
              className={`rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                isDone
                  ? 'bg-[#e1f3fd]/70 dark:bg-[#0f4d6b]/25 border-[#bce8fb] dark:border-[#0b5d81]'
                  : 'glass-card glass-card-hover border-islamic-border-light dark:border-islamic-border-dark'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {habit.category}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                      {scheduleText}
                    </span>
                  </div>
                  {habit.current_streak > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 shrink-0">
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {habit.current_streak}d
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {habit.name}
                </h4>

                {habit.today_completion?.notes && (
                  <p className="text-xs text-[#076e9d] dark:text-[#3dc3f3] font-medium mt-1 truncate">
                    {habit.today_completion.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                <div>
                  {isDone ? (
                    <span className="text-xs font-semibold text-[#076e9d] dark:text-[#3dc3f3] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      {compTime ? `at ${compTime}` : 'Completed'}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {isQuran ? `${habit.target_juz_goal || 1.0} Juz goal` : `${habit.target_duration_minutes}m target`}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {isQuran && (
                    <button
                      onClick={() => onOpenQuranModal(habit)}
                      className="p-1.5 rounded-lg border border-[#bce8fb] dark:border-[#0b5d81] text-[#088ac1] dark:text-[#3dc3f3] hover:bg-[#e1f3fd] dark:hover:bg-[#0f4d6b]/40 transition-colors cursor-pointer"
                      title="Log Qur'an reading & bookmark"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    disabled={pendingHabitIds.has(habit.id)}
                    onClick={() => handleToggle(habit)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      pendingHabitIds.has(habit.id) ? 'opacity-70 cursor-wait' : ''
                    } ${
                      isDone
                        ? 'bg-[#088ac1] text-white shadow-xs'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-[#1eb4eb]'
                    }`}
                  >
                    {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
