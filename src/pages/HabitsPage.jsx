import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Plus,
  Flame,
  BookOpen,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { habitApi } from '../api/habitApi';
import { HabitFormModal } from '../components/modals/HabitFormModal';
import { QuranLogModal } from '../components/modals/QuranLogModal';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/UIComponents';

export const HabitsPage = () => {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [quranHabit, setQuranHabit] = useState(null);
  const { showToast } = useNotification();

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const res = await habitApi.getHabits(params);
      setHabits(res.data || []);
    } catch (e) {
      console.error('Failed to load habits:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleToggle = async (habit) => {
    try {
      const res = await habitApi.toggleHabit(habit.id);
      fetchHabits();
      if (res.data.is_completed) {
        showToast('Habit Completed', `✓ ${habit.name} logged successfully!`);
      }
    } catch (e) {
      console.error('Failed to toggle habit:', e);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the habit "${name}"?`)) return;
    try {
      await habitApi.deleteHabit(id);
      showToast('Habit Deleted', `${name} removed from tracker.`, 'neutral');
      fetchHabits();
    } catch (e) {
      console.error('Failed to delete habit:', e);
    }
  };

  const categories = [
    { id: 'all', label: 'All Habits' },
    { id: 'today', label: '📅 Scheduled Today' },
    { id: 'sunnah', label: 'Sunnah Prayers' },
    { id: 'dhikr', label: 'Adhkar / Dhikr' },
    { id: 'sadaqah', label: 'Sadaqah' },
    { id: 'study', label: 'Study & Knowledge' },
    { id: 'custom', label: 'Personal Goals' },
  ];

  const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayPyWeekday = (new Date().getDay() + 6) % 7;

  const isHabitScheduledToday = (h) => {
    if (h.is_scheduled_today !== undefined && h.is_scheduled_today !== null) return h.is_scheduled_today;
    const freq = h.frequency;
    const spec = Array.isArray(h.specific_days) ? h.specific_days : [];
    if (freq === 'daily') return true;
    if (freq === 'weekdays') return todayPyWeekday < 5;
    if (freq === 'weekly_once' || freq === 'weekly_target' || freq === 'specific_days') {
      if (spec.length > 0) return spec.includes(todayPyWeekday);
      return todayPyWeekday === 4;
    }
    return true;
  };

  const filteredHabits = habits.filter((h) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'today') return isHabitScheduledToday(h) || Boolean(h.today_completion);
    return h.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-islamic-primary-600" />
            Islamic & Personal Habit Tracker
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Build consistency in Qur’an, Sunnah, Adhkar, and daily virtuous routines
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setEditingHabit(null);
            setIsHabitModalOpen(true);
          }}
        >
          Add Custom Habit
        </Button>
      </div>

      {/* Dedicated Quran Hub Promotion Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#f0faff] to-[#e1f3fd] dark:from-[#0a2333] dark:to-[#091b26] border border-[#bce8fb] dark:border-[#0b5d81]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#088ac1] text-white flex items-center justify-center shrink-0 shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Dedicated Noble Qur’an Hub
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore 114 Surahs, dynamic Ayah bookmarks, daily Juz goals (¼, ½, ¾, 1 Juz), and reflection notes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/quran')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#088ac1] hover:bg-[#1eb4eb] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0 active:scale-95"
        >
          <span>Open Qur’an Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat.id
                ? 'bg-islamic-primary-700 text-white shadow-sm'
                : 'bg-white dark:bg-islamic-card-dark text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-islamic-border-light dark:border-islamic-border-dark'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Habits Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading habits...</div>
      ) : filteredHabits.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400 bg-islamic-subtle-light/40 dark:bg-islamic-subtle-dark/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="font-semibold text-slate-600 dark:text-slate-300">No habits found in this category.</p>
          <p className="text-xs text-slate-400 mt-1">Start with one small habit today to build consistency.</p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => {
              setEditingHabit(null);
              setIsHabitModalOpen(true);
            }}
          >
            + Create First Habit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredHabits.map((habit) => {
            const isDone = Boolean(habit.today_completion);
            const isQuran = habit.category === 'quran';

            let freqLabel = 'Every day';
            if (habit.frequency === 'weekdays') {
              freqLabel = 'Weekdays (Mon-Fri)';
            } else if (habit.frequency === 'weekly_once' || habit.frequency === 'weekly_target') {
              const dayIdx = habit.specific_days?.[0] !== undefined ? habit.specific_days[0] : 4;
              freqLabel = `Every ${DAY_NAMES[dayIdx] || 'Friday'}`;
            } else if (habit.frequency === 'specific_days' && habit.specific_days?.length > 0) {
              freqLabel = habit.specific_days.map((d) => DAY_NAMES[d]?.slice(0, 3)).join(', ');
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
                className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between ${
                  isDone
                    ? 'bg-[#e1f3fd]/60 dark:bg-[#0f4d6b]/25 border-[#bce8fb] dark:border-[#0b5d81] shadow-soft'
                    : 'glass-card border-islamic-border-light dark:border-islamic-border-dark'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-islamic-subtle-light dark:bg-islamic-subtle-dark text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                        {habit.category}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#e1f3fd] dark:bg-[#0f4d6b]/40 text-[#076e9d] dark:text-[#81d7f8] border border-[#bce8fb]/60 dark:border-[#0b5d81]/40">
                        {freqLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {habit.current_streak > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900">
                          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {habit.current_streak}d
                        </span>
                      )}

                      <button
                        onClick={() => {
                          setEditingHabit(habit);
                          setIsHabitModalOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Habit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(habit.id, habit.name)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {habit.name}
                  </h3>

                  {/* Frequency & duration specs */}
                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {freqLabel}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {habit.target_duration_minutes}m target
                    </span>
                  </div>

                  {/* Quran logging preview & bookmark */}
                  {isQuran && (
                    <div className="mt-3 space-y-2">
                      {habit.today_completion ? (
                        <div className="p-3 rounded-2xl bg-[#e1f3fd]/80 dark:bg-[#0f4d6b]/35 border border-[#bce8fb] dark:border-[#0b5d81]/60 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-[#076e9d] dark:text-[#81d7f8]">
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-[#088ac1] dark:text-[#3dc3f3]" />
                              Surah {habit.today_completion.surah_name || habit.last_surah_name || 'Al-Baqarah'}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#bce8fb] dark:bg-[#088ac1]/50 text-[#076e9d] dark:text-white font-extrabold">
                              {habit.today_completion.juz_count || (habit.today_completion.pages_read ? Number((habit.today_completion.pages_read / 20).toFixed(2)) : 1.0)} Juz
                            </span>
                          </div>
                          <p className="text-[#088ac1] dark:text-[#3dc3f3] text-[11px] font-medium">
                            Last read Ayah {habit.today_completion.last_ayah_number || habit.today_completion.ayah_end || habit.last_ayah_number || 1} • {habit.today_completion.pages_read || Math.round((habit.today_completion.juz_count || 1) * 20)} pages • Goal: {habit.target_juz_goal || 1.0} Juz
                          </p>
                          {habit.today_completion.notes && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1 border-t border-[#bce8fb]/60 dark:border-[#0b5d81]/40">
                              "{habit.today_completion.notes}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                          {habit.last_surah_name ? (
                            <p className="font-semibold text-[#076e9d] dark:text-[#81d7f8] flex items-center gap-1.5">
                              <span>🔖</span>
                              <span>Bookmark: Surah {habit.last_surah_name}, Ayah {habit.last_ayah_number || 1}</span>
                            </p>
                          ) : (
                            <p className="text-slate-500 dark:text-slate-400">No bookmark saved yet</p>
                          )}
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            🎯 Daily Goal: {habit.target_juz_goal || 1.0} Juz / day
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom completion row */}
                <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    {isDone ? (
                      <span className="text-xs font-semibold text-[#076e9d] dark:text-[#3dc3f3] flex items-center gap-1 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                        <span className="truncate">{compTime ? `Done at ${compTime}` : 'Completed today'}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        Consistency: {habit.completion_rate}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isQuran && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={BookOpen}
                        onClick={() => setQuranHabit(habit)}
                        className="text-xs py-1 px-2.5"
                      >
                        Log
                      </Button>
                    )}

                    <button
                      onClick={() => handleToggle(habit)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                        isDone
                          ? 'bg-[#088ac1] hover:bg-[#1eb4eb] text-white shadow-picton-glow'
                          : 'border-2 border-slate-300 dark:border-slate-600 hover:border-[#1eb4eb] text-transparent hover:text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <HabitFormModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        habit={editingHabit}
        onSaved={fetchHabits}
      />

      {quranHabit && (
        <QuranLogModal
          isOpen={!!quranHabit}
          onClose={() => setQuranHabit(null)}
          habit={quranHabit}
          onSaved={fetchHabits}
        />
      )}
    </div>
  );
};
