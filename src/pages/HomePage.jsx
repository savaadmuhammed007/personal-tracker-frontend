import React, { useState, useEffect, useCallback } from 'react';
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

export const HomePage = () => {
  const { prayers, completed_count: prayersCompleted } = usePrayers();
  const [habits, setHabits] = useState([]);
  const [awrad, setAwrad] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timelineRefresh, setTimelineRefresh] = useState(0);

  // Modals state
  const [selectedQuranHabit, setSelectedQuranHabit] = useState(null);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [habitsRes, awradRes, tasksRes] = await Promise.all([
        habitApi.getHabits(),
        awradApi.getAwrad(),
        taskApi.getTasks({ filter: 'today' }),
      ]);
      setHabits(Array.isArray(habitsRes?.data) ? habitsRes.data : habitsRes?.data?.results || []);
      setAwrad(Array.isArray(awradRes?.data) ? awradRes.data : awradRes?.data?.results || []);
      setTasks(Array.isArray(tasksRes?.data) ? tasksRes.data : tasksRes?.data?.results || []);
      setTimelineRefresh((prev) => prev + 1);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
          onOpenQuranModal={(habit) => setSelectedQuranHabit(habit)}
          onOpenAddModal={() => setIsHabitModalOpen(true)}
        />
      </div>

      {/* 6. Daily Awrad & Digital Dhikr Tasbih */}
      <div id="awrad-section">
        <QuickAwradSection
          awradList={awrad}
          onAwradUpdated={fetchDashboardData}
        />
      </div>

      {/* 7. Tasks Summary */}
      <div id="tasks-section">
        <DailyTasksSummary
          tasksList={tasks}
          onTaskUpdated={fetchDashboardData}
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
