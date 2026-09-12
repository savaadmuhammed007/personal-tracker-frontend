import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HeroGreeting } from '../components/dashboard/HeroGreeting';
import { TodayProgressSection } from '../components/dashboard/TodayProgressSection';
import { QuranSection } from '../components/dashboard/QuranSection';
import { PrayerCardsGrid } from '../components/dashboard/PrayerCardsGrid';
import { QuickAwradSection } from '../components/dashboard/QuickAwradSection';
import { DailyHabitsSection } from '../components/dashboard/DailyHabitsSection';
import { DailyTasksSummary } from '../components/dashboard/DailyTasksSummary';
import { ChronologicalTimelineMini } from '../components/dashboard/ChronologicalTimelineMini';
import { QuranLogModal } from '../components/modals/QuranLogModal';
import { HabitFormModal } from '../components/modals/HabitFormModal';
import { TaskFormModal } from '../components/modals/TaskFormModal';
import { habitApi } from '../api/habitApi';
import { awradApi } from '../api/awradApi';
import { taskApi } from '../api/taskApi';
import { usePrayers } from '../context/PrayerContext';
import { getLocalDateString } from '../utils/dateUtils';

const CACHE_HABITS_KEY = 'cached_dashboard_habits';
const CACHE_AWRAD_KEY = 'cached_dashboard_awrad';
const CACHE_TASKS_KEY = 'cached_dashboard_tasks';

const getCachedList = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
};

export const HomePage = () => {
  const { prayers, completed_count: prayersCompleted } = usePrayers();
  // Instant render from localStorage cache (eliminates initial empty lag!)
  const [habits, setHabits] = useState(() => getCachedList(CACHE_HABITS_KEY));
  const [awrad, setAwrad] = useState(() => getCachedList(CACHE_AWRAD_KEY));
  const [tasks, setTasks] = useState(() => getCachedList(CACHE_TASKS_KEY));
  const [timelineRefresh, setTimelineRefresh] = useState(0);

  // Modals state
  const [selectedQuranHabit, setSelectedQuranHabit] = useState(null);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Sequence guard against out-of-order responses
  const fetchSeqRef = useRef(0);

  const fetchDashboardData = useCallback(async () => {
    const currentSeq = ++fetchSeqRef.current;
    const localDate = getLocalDateString();
    try {
      const [habitsRes, awradRes, tasksRes] = await Promise.all([
        habitApi.getHabits({ date: localDate }),
        awradApi.getAwrad({ date: localDate }),
        taskApi.getTasks({ filter: 'today', date: localDate }),
      ]);

      // Discard stale in-flight response if a newer fetch was triggered
      if (currentSeq !== fetchSeqRef.current) return;

      const habitsData = Array.isArray(habitsRes?.data) ? habitsRes.data : habitsRes?.data?.results || [];
      const awradData = Array.isArray(awradRes?.data) ? awradRes.data : awradRes?.data?.results || [];
      const tasksData = Array.isArray(tasksRes?.data) ? tasksRes.data : tasksRes?.data?.results || [];

      setHabits(habitsData);
      setAwrad(awradData);
      setTasks(tasksData);
      setTimelineRefresh((prev) => prev + 1);

      try {
        localStorage.setItem(CACHE_HABITS_KEY, JSON.stringify(habitsData));
        localStorage.setItem(CACHE_AWRAD_KEY, JSON.stringify(awradData));
        localStorage.setItem(CACHE_TASKS_KEY, JSON.stringify(tasksData));
      } catch {}
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Optimistic habit toggle: provides 0ms instant checkmark & streak update
  const handleOptimisticToggleHabit = async (habit) => {
    const localDate = getLocalDateString();
    const isCurrentlyDone = Boolean(habit.today_completion);
    const targetState = !isCurrentlyDone;

    // 1. Instant optimistic state update
    setHabits((prev) => {
      const updated = prev.map((h) => {
        if (h.id === habit.id) {
          const newCompletion = targetState
            ? {
                id: h.today_completion?.id || `temp-${Date.now()}`,
                date: localDate,
                completed_at: new Date().toISOString(),
              }
            : null;
          const newStreak = targetState
            ? (h.current_streak || 0) + 1
            : Math.max(0, (h.current_streak || 1) - 1);

          return {
            ...h,
            today_completion: newCompletion,
            current_streak: newStreak,
          };
        }
        return h;
      });
      try {
        localStorage.setItem(CACHE_HABITS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Network request with explicit targetState (idempotent)
    try {
      const res = await habitApi.toggleHabit(habit.id, {
        date: localDate,
        is_completed: targetState,
        action: targetState ? 'complete' : 'incomplete',
      });

      if (res.data?.completion !== undefined || res.data?.streaks) {
        setHabits((prev) => {
          const next = prev.map((h) => {
            if (h.id === habit.id) {
              return {
                ...h,
                today_completion: res.data.is_completed ? res.data.completion : null,
                current_streak: res.data.streaks?.current_streak ?? h.current_streak,
                longest_streak: res.data.streaks?.longest_streak ?? h.longest_streak,
              };
            }
            return h;
          });
          try {
            localStorage.setItem(CACHE_HABITS_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
      }
      setTimelineRefresh((prev) => prev + 1);
      return res;
    } catch (e) {
      console.error('Failed to toggle habit:', e);
      // Revert on error
      fetchDashboardData();
      throw e;
    }
  };

  // Optimistic task toggle
  const handleOptimisticToggleTask = async (task) => {
    const isCompleted = task.status === 'completed';
    const nextStatus = isCompleted ? 'pending' : 'completed';

    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t));
      try {
        localStorage.setItem(CACHE_TASKS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      const res = await taskApi.toggleTask(task.id, {
        status: nextStatus,
        is_completed: nextStatus === 'completed',
        action: nextStatus === 'completed' ? 'complete' : 'incomplete',
      });
      setTimelineRefresh((prev) => prev + 1);
      return res;
    } catch (e) {
      console.error('Failed to toggle task:', e);
      fetchDashboardData();
      throw e;
    }
  };

  // Optimistic Awrad update
  const handleOptimisticUpdateAwrad = async (id, delta, currentCount, targetCount) => {
    const newCount = Math.max(0, currentCount + delta);
    const isCompleted = newCount >= targetCount;
    const progressPct = targetCount > 0 ? Math.min(100, Math.round((newCount / targetCount) * 100)) : 0;

    setAwrad((prev) => {
      const updated = prev.map((a) =>
        a.id === id ? { ...a, today_count: newCount, is_completed: isCompleted, progress_percentage: progressPct } : a
      );
      try {
        localStorage.setItem(CACHE_AWRAD_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      const res = await awradApi.increment(id, { delta, date: getLocalDateString() });
      setTimelineRefresh((prev) => prev + 1);
      return res;
    } catch (e) {
      console.error('Failed to update awrad:', e);
      fetchDashboardData();
      throw e;
    }
  };

  // Compute live breakdown stats with array safety
  const safeAwrad = Array.isArray(awrad) ? awrad : [];
  const safeHabits = Array.isArray(habits) ? habits : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const completedAwradCount = safeAwrad.filter((a) => a.is_completed).length;
  const completedHabitsCount = safeHabits.filter((h) => h.today_completion).length;
  const completedTasksCount = safeTasks.filter((t) => t.status === 'completed').length;
  const quranHabit = safeHabits.find((h) => h.category === 'quran');
  const quranCompleted = quranHabit?.today_completion ? 1 : 0;

  const quranBookmark = quranHabit?.today_completion?.surah_name
    ? `${quranHabit.today_completion.surah_name} (v.${quranHabit.today_completion.last_ayah_number || quranHabit.today_completion.ayah_end || 1})`
    : quranHabit?.last_surah_name
    ? `${quranHabit.last_surah_name} (v.${quranHabit.last_ayah_number || 1})`
    : null;

  const dashboardStats = {
    prayers: { completed: prayersCompleted || 0, total: 5 },
    awrad: { completed: completedAwradCount, total: safeAwrad.length || 6 },
    quran: { completed: quranCompleted, total: quranHabit ? 1 : 1 },
    habits: { completed: completedHabitsCount, total: safeHabits.length || 6 },
    tasks: { completed: completedTasksCount, total: safeTasks.length || 3 },
    quranStreak: quranHabit?.current_streak || 0,
    quranGoal: quranHabit?.target_juz_goal || 1.0,
    quranJuzCount: quranHabit?.today_completion?.juz_count || (quranHabit?.today_completion?.pages_read ? Number((quranHabit.today_completion.pages_read / 20).toFixed(2)) : null),
    quranBookmark,
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Greeting Banner */}
      <HeroGreeting />

      {/* 2. Today's Overall Dynamic Bento & Progression Section */}
      <TodayProgressSection
        stats={dashboardStats}
        onOpenQuranModal={() => setSelectedQuranHabit(quranHabit || safeHabits[0] || { name: "Daily Qur'an", category: 'quran' })}
        onOpenHabitModal={() => setIsHabitModalOpen(true)}
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
      />

      {/* 3. Daily 5 Prayers Section */}
      <div id="prayers-section">
        <PrayerCardsGrid />
      </div>

      {/* 4. Dedicated Noble Qur'an & Tilawah Section */}
      <div id="quran-section">
        <QuranSection
          quranHabit={quranHabit}
          onQuranUpdated={fetchDashboardData}
          onOpenLogModal={(h) => setSelectedQuranHabit(h || quranHabit)}
        />
      </div>

      {/* 5. Daily Islamic Habits (Sunnah, Routines & Virtues) */}
      <div id="habits-section">
        <DailyHabitsSection
          habitsList={habits}
          onHabitUpdated={fetchDashboardData}
          onToggleHabit={handleOptimisticToggleHabit}
          onOpenQuranModal={(habit) => setSelectedQuranHabit(habit)}
          onOpenAddModal={() => setIsHabitModalOpen(true)}
        />
      </div>

      {/* 6. Daily Awrad & Digital Dhikr Tasbih */}
      <div id="awrad-section">
        <QuickAwradSection
          awradList={awrad}
          onAwradUpdated={fetchDashboardData}
          onUpdateAwrad={handleOptimisticUpdateAwrad}
        />
      </div>

      {/* 7. Tasks Summary */}
      <div id="tasks-section">
        <DailyTasksSummary
          tasksList={tasks}
          onTaskUpdated={fetchDashboardData}
          onToggleTask={handleOptimisticToggleTask}
          onOpenAddModal={() => setIsTaskModalOpen(true)}
        />
      </div>

      {/* 8. Today's Chronological Activity Timeline */}
      <ChronologicalTimelineMini refreshTrigger={timelineRefresh} />

      {/* Modals */}
      {selectedQuranHabit && (
        <QuranLogModal
          isOpen={!!selectedQuranHabit}
          onClose={() => setSelectedQuranHabit(null)}
          habit={selectedQuranHabit}
          onSaved={fetchDashboardData}
        />
      )}

      <HabitFormModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSaved={fetchDashboardData}
      />

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaved={fetchDashboardData}
      />
    </div>
  );
};
