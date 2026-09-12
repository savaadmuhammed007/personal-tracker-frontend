import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressRing } from '../common/ProgressRing';
import { DynamicBentoLayout } from '../dynamic-bento-layout';
import { Sun, Repeat, BookOpen, CheckCircle2, CheckSquare, LayoutGrid, Sparkles } from 'lucide-react';

export const TodayProgressSection = ({
  stats,
  onOpenQuranModal,
  onOpenHabitModal,
  onOpenTaskModal,
}) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('bento'); // 'bento' | 'compact'

  const {
    prayers = { completed: 0, total: 5 },
    awrad = { completed: 0, total: 0 },
    quran = { completed: 0, total: 1 },
    habits = { completed: 0, total: 0 },
    tasks = { completed: 0, total: 0 },
  } = stats || {};

  const totalItems = (prayers?.total || 5) + (awrad?.total || 0) + (habits?.total || 0) + (tasks?.total || 0);
  const completedItems = (prayers?.completed || 0) + (awrad?.completed || 0) + (habits?.completed || 0) + (tasks?.completed || 0);
  const overallPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const scrollToElement = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBentoAction = (item, actionType) => {
    if (item.id === 'salah-bento') {
      scrollToElement('prayers-section');
    } else if (item.id === 'awrad-bento') {
      scrollToElement('awrad-section');
    } else if (item.id === 'quran-bento') {
      if (actionType === 'details') {
        navigate('/quran');
      } else if (onOpenQuranModal) {
        onOpenQuranModal();
      } else {
        scrollToElement('quran-section');
      }
    } else if (item.id === 'habits-tasks-bento') {
      if (actionType === 'action' && onOpenHabitModal) {
        onOpenHabitModal();
      } else {
        scrollToElement('habits-section');
      }
    }
  };

  // Dynamic Bento Items configured for Islamic Habit Tracker
  const bentoItems = [
    {
      id: 'salah-bento',
      title: 'Daily Salah',
      subtitle: '5 Daily Prayers',
      color: '#1eb4eb',
      icon: <Sun className="w-5 h-5" />,
      content: 'Fulfill your five daily prayers on time. Salah is the cornerstone of Islamic spiritual life, establishing mindfulness, peace, and devotion throughout your day.',
      metrics: [
        { label: 'Completed', value: `${prayers?.completed || 0}/5` },
        { label: 'Adherence', value: `${Math.round(((prayers?.completed || 0) / 5) * 100)}%` },
        { label: 'Target', value: '5 Salah' },
      ],
      actionLabel: 'Track Prayers',
      detailsLabel: 'View Schedule',
    },
    {
      id: 'awrad-bento',
      title: 'Daily Awrad',
      subtitle: 'Dhikr & Adhkar',
      color: '#3dc3f3',
      icon: <Repeat className="w-5 h-5" />,
      content: 'Recite your morning & evening adhkar, Astaghfirullah, and Salawat. Consistent remembrance of Allah brings tranquility to the soul.',
      metrics: [
        { label: 'Completed', value: `${awrad?.completed || 0}/${awrad?.total || 6}` },
        { label: 'Rate', value: `${Math.round(((awrad?.completed || 0) / Math.max(awrad?.total || 1, 1)) * 100)}%` },
        { label: 'Status', value: (awrad?.completed || 0) >= (awrad?.total || 6) ? 'Done' : 'Active' },
      ],
      actionLabel: 'Open Tasbih',
      detailsLabel: 'View Awrad',
    },
    {
      id: 'quran-bento',
      title: 'Noble Qur’an',
      subtitle: stats?.quranBookmark ? `Bookmark: ${stats.quranBookmark}` : 'Daily Tilawah & Juz Goal',
      color: '#81d7f8',
      icon: <BookOpen className="w-5 h-5" />,
      content: stats?.quranBookmark
        ? `Last read bookmark: Surah ${stats.quranBookmark}. Keep your bond with the Book of Allah alive daily through consistent recitation.`
        : 'Keep your bond with the Book of Allah alive daily. Log your recited Surahs, Juz fraction (¼, ½, ¾, 1), and bookmark your last recited Ayah.',
      metrics: [
        { label: 'Today', value: (quran?.completed || 0) > 0 ? (stats?.quranJuzCount ? `${stats.quranJuzCount} Juz` : 'Done') : 'Pending' },
        { label: 'Daily Goal', value: `${stats?.quranGoal || 1.0} Juz` },
        { label: 'Streak', value: `${stats?.quranStreak || 0}d` },
      ],
      actionLabel: 'Log Qur’an',
      detailsLabel: 'View Habit',
    },
    {
      id: 'habits-tasks-bento',
      title: 'Habits & Actions',
      subtitle: 'Sunnah & Tasks',
      color: '#088ac1',
      icon: <CheckSquare className="w-5 h-5" />,
      content: 'Practice Sunnah deeds, Tahajjud, charity, and complete your daily prioritized tasks with excellence (Ihsan) and promptness.',
      metrics: [
        { label: 'Habits', value: `${habits?.completed || 0}/${habits?.total || 5}` },
        { label: 'Tasks', value: `${tasks?.completed || 0}/${tasks?.total || 3}` },
        { label: 'Efficiency', value: `${overallPercentage}%` },
      ],
      actionLabel: '+ Add Habit',
      detailsLabel: 'View Tasks',
    },
  ];

  const categories = [
    { label: 'Prayers', completed: prayers?.completed || 0, total: prayers?.total || 5, icon: Sun, color: 'text-sky-500', barColor: 'bg-[#1eb4eb]' },
    { label: 'Daily Awrad', completed: awrad?.completed || 0, total: awrad?.total || 0, icon: Repeat, color: 'text-cyan-500', barColor: 'bg-[#3dc3f3]' },
    { label: 'Qur’an', completed: quran?.completed || 0, total: quran?.total || 1, icon: BookOpen, color: 'text-blue-500', barColor: 'bg-[#81d7f8]' },
    { label: 'Habits', completed: habits?.completed || 0, total: habits?.total || 0, icon: CheckCircle2, color: 'text-indigo-500', barColor: 'bg-[#088ac1]' },
    { label: 'Tasks', completed: tasks?.completed || 0, total: tasks?.total || 0, icon: CheckSquare, color: 'text-amber-500', barColor: 'bg-[#076e9d]' },
  ];

  return (
    <div className="mb-4 sm:mb-6 space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1eb4eb] animate-pulse" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Today's Progression Overview
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#bce8fb]/60 dark:bg-[#0f4d6b]/50 text-[#076e9d] dark:text-[#81d7f8] font-bold border border-[#81d7f8]/30">
            {overallPercentage}% Complete
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('bento')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'bento'
                ? 'bg-white dark:bg-slate-900 text-[#088ac1] dark:text-[#3dc3f3] shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Dynamic Bento
          </button>
          <button
            type="button"
            onClick={() => setViewMode('compact')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'compact'
                ? 'bg-white dark:bg-slate-900 text-[#088ac1] dark:text-[#3dc3f3] shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Compact Grid
          </button>
        </div>
      </div>

      {/* 1. Dynamic Bento Layout View */}
      {viewMode === 'bento' ? (
        <DynamicBentoLayout
          title="Today's Dynamic Bento Overview"
          subtitle="Real-Time Habit & Spiritual Intelligence"
          badgeText={`${completedItems}/${totalItems} Goals Achieved`}
          badgeDotColor={overallPercentage >= 100 ? 'bg-[#3dc3f3]' : overallPercentage >= 50 ? 'bg-[#81d7f8]' : 'bg-amber-400'}
          items={bentoItems}
          onActionClick={handleBentoAction}
          className="w-full"
        />
      ) : (
        /* 2. Compact Grid View */
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            {/* Left: Overall Ring & Headline */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left w-full lg:w-auto">
              <div className="shrink-0">
                <ProgressRing
                  radius={60}
                  stroke={8}
                  progress={overallPercentage}
                  strokeColor="#1eb4eb"
                  bgColor="rgba(30, 180, 235, 0.15)"
                >
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    {overallPercentage}%
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                    Complete
                  </span>
                </ProgressRing>
              </div>

              <div>
                <span className="text-[11px] sm:text-xs font-bold text-islamic-primary-600 dark:text-islamic-primary-400 uppercase tracking-wider">
                  Today's Overview
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  Daily Goal Progression
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  {overallPercentage >= 100
                    ? 'MashaAllah! You have completed all scheduled activities for today.'
                    : overallPercentage >= 50
                    ? 'Excellent progress. Keep consistent with your prayers and dhikr.'
                    : 'Begin with Bismillah and complete your upcoming habits.'}
                </p>
              </div>
            </div>

            {/* Right: Breakdown Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 w-full lg:w-auto">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const pct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
                return (
                  <div
                    key={cat.label}
                    className="p-3.5 rounded-2xl bg-islamic-subtle-light/60 dark:bg-islamic-subtle-dark/60 border border-islamic-border-light/70 dark:border-islamic-border-dark/70 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {cat.label}
                      </span>
                      <Icon className={`w-4 h-4 ${cat.color}`} />
                    </div>
                    <div>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                          {cat.completed}<span className="text-xs text-slate-400 font-medium">/{cat.total}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${cat.barColor} transition-all duration-500 rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
